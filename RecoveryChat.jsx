import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  Camera,
  FileText,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Paperclip,
  Send,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react"

import { io } from "socket.io-client"

const SOCKET_URL =
  "http://localhost:5000"

function RecoveryChat({
  recoveryId,
  role = "lost",
}) {
  const socketRef =
    useRef(null)

  const bottomRef =
    useRef(null)

  const imageInputRef =
    useRef(null)

  const fileInputRef =
    useRef(null)

  const [connected, setConnected] =
    useState(false)

  const [open, setOpen] =
    useState(false)

  const [unreadCount, setUnreadCount] =
    useState(0)

  const [message, setMessage] =
    useState("")

  const [messages, setMessages] =
    useState([])

  const [sending, setSending] =
    useState(false)

  const [selectedImage, setSelectedImage] =
    useState(null)

  const [locationSharing, setLocationSharing] =
    useState(false)

  const activeRole =
    role === "finder"
      ? "finder"
      : "lost"

  const roleLabel =
    activeRole === "finder"
      ? "FINDER"
      : "LOST PERSON"

  // ============================================
  // SOCKET CONNECTION
  // ============================================

  useEffect(() => {
    if (!recoveryId) {
      return
    }

    const socket = io(
      SOCKET_URL,
      {
        transports: [
          "websocket",
          "polling",
        ],
      }
    )

    socketRef.current =
      socket

    socket.on(
      "connect",
      () => {
        console.log(
          "FINDX CHAT: Connected:",
          socket.id
        )

        setConnected(true)

        socket.emit(
          "recovery:join",
          {
            recoveryId,
            role: activeRole,
          }
        )
      }
    )

    socket.on(
      "chat:message",
      (data) => {
        if (!data?.message) {
          return
        }

        const incomingMessage = {
          id:
            `${data.timestamp}-${Math.random()}`,

          senderRole:
            data.senderRole,

          message:
            data.message,

          timestamp:
            data.timestamp ||
            Date.now(),
        }

        setMessages(
          (current) => [
            ...current,
            incomingMessage,
          ]
        )

        if (
          !open &&
          data.senderRole !==
            activeRole
        ) {
          setUnreadCount(
            (current) =>
              current + 1
          )
        }
      }
    )

    socket.on(
      "disconnect",
      () => {
        console.log(
          "FINDX CHAT: Disconnected"
        )

        setConnected(false)
      }
    )

    return () => {
      socket.disconnect()
    }
  }, [
    recoveryId,
    activeRole,
    open,
  ])

  // ============================================
  // AUTO SCROLL
  // ============================================

  useEffect(() => {
    if (!open) {
      return
    }

    messagesEndRefScroll()
  }, [
    messages,
    open,
  ])

  function messagesEndRefScroll() {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }

  // ============================================
  // OPEN / CLOSE
  // ============================================

  function openChat() {
    setOpen(true)
    setUnreadCount(0)
  }

  function closeChat() {
    setOpen(false)
  }

  // ============================================
  // SEND TEXT
  // ============================================

  function sendMessage() {
    const cleaned =
      message.trim()

    if (
      !cleaned ||
      !recoveryId ||
      !connected ||
      sending
    ) {
      return
    }

    const socket =
      socketRef.current

    if (
      !socket?.connected
    ) {
      return
    }

    setSending(true)

    socket.emit(
      "chat:message",
      {
        recoveryId,
        message: cleaned,
      }
    )

    setMessage("")

    window.setTimeout(() => {
      setSending(false)
    }, 120)
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendMessage()
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault()
      sendMessage()
    }
  }

  // ============================================
  // IMAGE PICKER
  // ============================================

  function openImagePicker() {
    imageInputRef.current?.click()
  }

  function handleImageSelected(event) {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      return
    }

    if (
      file.size >
      8 * 1024 * 1024
    ) {
      alert(
        "Please select an image smaller than 8 MB."
      )

      event.target.value = ""

      return
    }

    const previewUrl =
      URL.createObjectURL(
        file
      )

    setSelectedImage({
      file,
      previewUrl,
    })

    event.target.value = ""
  }

  function removeSelectedImage() {
    if (
      selectedImage?.previewUrl
    ) {
      URL.revokeObjectURL(
        selectedImage.previewUrl
      )
    }

    setSelectedImage(null)
  }

  // ============================================
  // FILE PICKER
  // ============================================

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  function handleFileSelected(event) {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    setMessage(
      `[File selected: ${file.name}]`
    )

    event.target.value = ""
  }

  // ============================================
  // CAMERA
  // ============================================

  function openCamera() {
    imageInputRef.current?.click()
  }

  // ============================================
  // SHARE LOCATION
  // ============================================

  function shareCurrentLocation() {
    if (
      !navigator.geolocation
    ) {
      alert(
        "Location sharing is not supported on this device."
      )

      return
    }

    if (!connected) {
      return
    }

    setLocationSharing(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          position.coords.latitude

        const longitude =
          position.coords.longitude

        const accuracy =
          position.coords.accuracy

        const locationMessage =
          `📍 Private location shared\nLatitude: ${latitude.toFixed(
            6
          )}\nLongitude: ${longitude.toFixed(
            6
          )}\nAccuracy: ±${Math.round(
            accuracy
          )} m`

        const socket =
          socketRef.current

        if (
          socket?.connected
        ) {
          socket.emit(
            "chat:message",
            {
              recoveryId,
              message:
                locationMessage,
            }
          )
        }

        setLocationSharing(false)
      },

      (error) => {
        console.error(
          "FINDX CHAT: Location share failed:",
          error
        )

        setLocationSharing(false)

        alert(
          "Unable to get your current location."
        )
      },

      {
        enableHighAccuracy:
          true,

        maximumAge:
          2000,

        timeout:
          15000,
      }
    )
  }

  // ============================================
  // SEND IMAGE NOTICE
  // ============================================

  function sendSelectedImage() {
    if (!selectedImage) {
      return
    }

    const socket =
      socketRef.current

    if (
      !socket?.connected
    ) {
      return
    }

    socket.emit(
      "chat:message",
      {
        recoveryId,

        message:
          `🖼️ Image selected: ${selectedImage.file.name}`,
      }
    )

    removeSelectedImage()
  }

  // ============================================
  // MESSAGE TYPE
  // ============================================

  function isLocationMessage(text) {
    return text.startsWith(
      "📍"
    )
  }

  function isImageMessage(text) {
    return text.startsWith(
      "🖼️"
    )
  }

  // ============================================
  // NO RECOVERY
  // ============================================

  if (!recoveryId) {
    return null
  }

  return (
    <>
      {/* ========================================
          HIDDEN INPUTS
          ======================================== */}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={
          handleImageSelected
        }
        className="hidden"
      />

      <input
        ref={fileInputRef}
        type="file"
        onChange={
          handleFileSelected
        }
        className="hidden"
      />

      {/* ========================================
          FLOATING CHAT BUTTON
          ======================================== */}

      {!open && (
        <button
          type="button"
          onClick={
            openChat
          }
          className="
            fixed
            right-5
            top-5
            z-[100]
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            border
            border-violet-400/20
            bg-violet-500
            text-white
            shadow-[0_15px_45px_rgba(139,92,246,0.35)]
            transition-all
            hover:scale-105
            hover:bg-violet-400
          "
          aria-label="Open private recovery chat"
        >
          <MessageCircle
            size={23}
          />

          {unreadCount > 0 && (
            <span
              className="
                absolute
                -right-1
                -top-1
                flex
                h-5
                min-w-5
                items-center
                justify-center
                rounded-full
                border-2
                border-[#080c13]
                bg-red-500
                px-1
                text-[9px]
                font-bold
                text-white
              "
            >
              {unreadCount >
              9
                ? "9+"
                : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ========================================
          CHAT PANEL
          ======================================== */}

      {open && (
        <div
          className="
            fixed
            right-4
            top-4
            z-[100]
            flex
            h-[min(680px,calc(100vh-2rem))]
            w-[min(400px,calc(100vw-2rem))]
            flex-col
            overflow-hidden
            rounded-3xl
            border
            border-white/[0.10]
            bg-[#080c13]/[0.98]
            shadow-[0_30px_100px_rgba(0,0,0,0.55)]
            backdrop-blur-xl
          "
        >

          {/* HEADER */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-white/[0.07]
              px-4
              py-4
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-400/[0.10]
                "
              >
                <MessageCircle
                  size={18}
                  className="text-violet-300"
                />
              </div>

              <div>

                <p
                  className="
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Private recovery chat
                </p>

                <div
                  className="
                    mt-1
                    flex
                    items-center
                    gap-2
                  "
                >

                  <span
                    className={`
                      h-2
                      w-2
                      rounded-full
                      ${
                        connected
                          ? "bg-emerald-400"
                          : "bg-red-400"
                      }
                    `}
                  />

                  <span
                    className="
                      text-[10px]
                      text-slate-500
                    "
                  >
                    {connected
                      ? "Secure session active"
                      : "Reconnecting..."}
                  </span>

                </div>

              </div>

            </div>

            <button
              type="button"
              onClick={
                closeChat
              }
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.07]
                bg-white/[0.03]
                text-slate-500
                hover:text-white
              "
            >
              <X size={17} />
            </button>

          </div>

          {/* ROLE + SESSION */}

          <div
            className="
              border-b
              border-white/[0.07]
              px-4
              py-3
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-blue-400/[0.10]
                bg-blue-400/[0.025]
                px-3
                py-2.5
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <UserRound
                  size={14}
                  className="text-blue-300"
                />

                <span
                  className="
                    text-[10px]
                    font-medium
                    text-blue-200
                  "
                >
                  {roleLabel}
                </span>

              </div>

              <span
                className="
                  max-w-[180px]
                  truncate
                  text-[9px]
                  text-slate-600
                "
              >
                {recoveryId}
              </span>

            </div>

          </div>

          {/* MESSAGES */}

          <div
            className="
              flex-1
              overflow-y-auto
              px-4
              py-4
            "
          >

            {messages.length === 0 && (
              <div
                className="
                  flex
                  h-full
                  flex-col
                  items-center
                  justify-center
                  px-6
                  text-center
                "
              >

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-violet-400/[0.08]
                  "
                >
                  <MessageCircle
                    size={22}
                    className="text-violet-300"
                  />
                </div>

                <p
                  className="
                    mt-4
                    text-sm
                    font-medium
                    text-white
                  "
                >
                  Private recovery channel
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-slate-600
                  "
                >
                  Coordinate the handover,
                  exchange recovery information,
                  and communicate privately.
                </p>

              </div>
            )}

            {messages.map(
              (item) => {
                const mine =
                  item.senderRole ===
                  activeRole

                const locationMessage =
                  isLocationMessage(
                    item.message
                  )

                const imageMessage =
                  isImageMessage(
                    item.message
                  )

                return (
                  <div
                    key={item.id}
                    className={`
                      mb-3
                      flex
                      ${
                        mine
                          ? "justify-end"
                          : "justify-start"
                      }
                    `}
                  >

                    <div
                      className={`
                        max-w-[86%]
                        rounded-2xl
                        px-4
                        py-3
                        ${
                          mine
                            ? "rounded-br-md bg-violet-500 text-white"
                            : "rounded-bl-md border border-white/[0.07] bg-white/[0.035] text-slate-300"
                        }
                      `}
                    >

                      <p
                        className="
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[0.12em]
                          opacity-60
                        "
                      >
                        {mine
                          ? "YOU"
                          : item.senderRole ===
                              "finder"
                            ? "FINDER"
                            : "LOST PERSON"}
                      </p>

                      {locationMessage ? (
                        <div
                          className="
                            mt-2
                            rounded-xl
                            border
                            border-emerald-400/20
                            bg-emerald-400/[0.06]
                            p-3
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >

                            <MapPin
                              size={16}
                              className="
                                text-emerald-300
                              "
                            />

                            <span
                              className="
                                text-xs
                                font-semibold
                                text-emerald-200
                              "
                            >
                              Location shared
                            </span>

                          </div>

                          <p
                            className="
                              mt-2
                              whitespace-pre-wrap
                              text-[10px]
                              leading-5
                              opacity-80
                            "
                          >
                            {item.message.replace(
                              "📍 ",
                              ""
                            )}
                          </p>

                        </div>
                      ) : imageMessage ? (
                        <div
                          className="
                            mt-2
                            rounded-xl
                            border
                            border-blue-400/20
                            bg-blue-400/[0.05]
                            p-3
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >

                            <ImageIcon
                              size={16}
                              className="
                                text-blue-300
                              "
                            />

                            <span
                              className="
                                text-xs
                                font-medium
                              "
                            >
                              {item.message}
                            </span>

                          </div>

                        </div>
                      ) : (
                        <p
                          className="
                            mt-2
                            whitespace-pre-wrap
                            text-sm
                            leading-6
                          "
                        >
                          {item.message}
                        </p>
                      )}

                      <p
                        className="
                          mt-2
                          text-[9px]
                          opacity-40
                        "
                      >
                        {new Date(
                          item.timestamp
                        ).toLocaleTimeString(
                          [],
                          {
                            hour:
                              "2-digit",
                            minute:
                              "2-digit",
                          }
                        )}
                      </p>

                    </div>

                  </div>
                )
              }
            )}

            <div
              ref={bottomRef}
            />

          </div>

          {/* SELECTED IMAGE */}

          {selectedImage && (
            <div
              className="
                border-t
                border-white/[0.07]
                px-4
                pt-3
              "
            >

              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-white/[0.02]
                "
              >

                <div
                  className="
                    relative
                  "
                >

                  <img
                    src={
                      selectedImage.previewUrl
                    }
                    alt="Selected recovery"
                    className="
                      h-32
                      w-full
                      object-cover
                    "
                  />

                  <button
                    type="button"
                    onClick={
                      removeSelectedImage
                    }
                    className="
                      absolute
                      right-2
                      top-2
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-black/70
                      text-white
                    "
                  >
                    <X size={14} />
                  </button>

                </div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    px-3
                    py-2
                  "
                >

                  <span
                    className="
                      max-w-[220px]
                      truncate
                      text-[10px]
                      text-slate-400
                    "
                  >
                    {selectedImage.file.name}
                  </span>

                  <button
                    type="button"
                    onClick={
                      sendSelectedImage
                    }
                    className="
                      rounded-lg
                      bg-blue-500
                      px-3
                      py-1.5
                      text-[10px]
                      font-semibold
                      text-white
                    "
                  >
                    Send
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* QUICK ACTIONS */}

          <div
            className="
              border-t
              border-white/[0.07]
              px-4
              py-2.5
            "
          >

            <div
              className="
                grid
                grid-cols-4
                gap-2
              "
            >

              <QuickAction
                icon={MapPin}
                label={
                  locationSharing
                    ? "Locating"
                    : "Location"
                }
                onClick={
                  shareCurrentLocation
                }
                disabled={
                  locationSharing ||
                  !connected
                }
                iconClass="text-emerald-300"
              />

              <QuickAction
                icon={ImageIcon}
                label="Photo"
                onClick={
                  openImagePicker
                }
                disabled={
                  !connected
                }
                iconClass="text-blue-300"
              />

              <QuickAction
                icon={Camera}
                label="Camera"
                onClick={
                  openCamera
                }
                disabled={
                  !connected
                }
                iconClass="text-violet-300"
              />

              <QuickAction
                icon={Paperclip}
                label="File"
                onClick={
                  openFilePicker
                }
                disabled={
                  !connected
                }
                iconClass="text-amber-300"
              />

            </div>

          </div>

          {/* INPUT */}

          <form
            onSubmit={
              handleSubmit
            }
            className="
              border-t
              border-white/[0.07]
              p-3
            "
          >

            <div
              className="
                flex
                items-end
                gap-2
              "
            >

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                rows={2}
                maxLength={800}
                disabled={
                  !connected
                }
                placeholder={
                  connected
                    ? "Type a private message..."
                    : "Waiting for connection..."
                }
                className="
                  min-h-[48px]
                  flex-1
                  resize-none
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-black/20
                  px-3
                  py-2.5
                  text-sm
                  leading-5
                  text-white
                  outline-none
                  placeholder:text-slate-700
                  focus:border-violet-400/30
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              />

              <button
                type="submit"
                disabled={
                  !connected ||
                  !message.trim() ||
                  sending
                }
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-500
                  text-white
                  hover:bg-violet-400
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <Send
                  size={16}
                />
              </button>

            </div>

            {/* PRIVACY */}

            <div
              className="
                mt-3
                flex
                items-start
                gap-2
                rounded-xl
                border
                border-emerald-400/[0.08]
                bg-emerald-400/[0.02]
                p-3
              "
            >

              <ShieldCheck
                size={14}
                className="
                  mt-0.5
                  shrink-0
                  text-emerald-300
                "
              />

              <p
                className="
                  text-[9px]
                  leading-4
                  text-slate-600
                "
              >
                Private recovery session. Only
                verified recovery participants
                should use this channel.
              </p>

            </div>

          </form>

        </div>
      )}
    </>
  )
}

// ============================================
// QUICK ACTION
// ============================================

function QuickAction({
  icon: Icon,
  label,
  onClick,
  disabled,
  iconClass,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="
        flex
        min-w-0
        flex-col
        items-center
        justify-center
        gap-1
        rounded-xl
        border
        border-white/[0.06]
        bg-white/[0.02]
        px-2
        py-2
        transition-colors
        hover:bg-white/[0.05]
        disabled:cursor-not-allowed
        disabled:opacity-40
      "
    >

      <Icon
        size={15}
        className={
          iconClass
        }
      />

      <span
        className="
          truncate
          text-[8px]
          font-medium
          text-slate-500
        "
      >
        {label}
      </span>

    </button>
  )
}

export default RecoveryChat