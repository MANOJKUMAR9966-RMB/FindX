import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  MessageCircle,
  Navigation,
  Send,
  ShieldCheck,
  X,
} from "lucide-react"

import { io } from "socket.io-client"

import RadarMap from "./RadarMap"


const SOCKET_URL =
  "http://localhost:5000"

const API_URL =
  "http://localhost:5000/api/recoveries"


function RecoveryWorkspace({
  recovery,
  role = "lost",
  onRecoveryUpdated,
}) {
  // ==========================================================
  // UI STATE
  // ==========================================================

  const [
    chatOpen,
    setChatOpen,
  ] = useState(true)

  const [
    radarOpen,
    setRadarOpen,
  ] = useState(false)

  // ==========================================================
  // CHAT STATE
  // ==========================================================

  const [
    messages,
    setMessages,
  ] = useState([])

  const [
    message,
    setMessage,
  ] = useState("")

  const [
    socketConnected,
    setSocketConnected,
  ] = useState(false)

  const socketRef =
    useRef(null)

  const sentMessageIdsRef =
    useRef(new Set())

  // ==========================================================
  // PICKUP LOCATION
  // ==========================================================

  const [
    location,
    setLocation,
  ] = useState(
    recovery?.pickupLocation ||
      null
  )

  const [
    savingLocation,
    setSavingLocation,
  ] = useState(false)

  const [
    locationError,
    setLocationError,
  ] = useState("")

  const [
    locationType,
    setLocationType,
  ] = useState("class")

  const [
    institution,
    setInstitution,
  ] = useState("")

  const [
    className,
    setClassName,
  ] = useState("")

  const [
    department,
    setDepartment,
  ] = useState("")

  const [
    room,
    setRoom,
  ] = useState("")

  const [
    currentPlace,
    setCurrentPlace,
  ] = useState("")

  const [
    availabilityUntil,
    setAvailabilityUntil,
  ] = useState("")


  // ==========================================================
  // RECOVERY ID
  // ==========================================================

  const recoveryId =
    recovery?.recoveryId


  // ==========================================================
  // KEEP PICKUP LOCATION IN SYNC
  // ==========================================================

  useEffect(() => {
    setLocation(
      recovery?.pickupLocation ||
        null
    )

    if (
      recovery?.pickupLocation
    ) {
      const saved =
        recovery.pickupLocation

      setLocationType(
        saved.type ||
          "class"
      )

      setInstitution(
        saved.institution ||
          ""
      )

      setClassName(
        saved.className ||
          ""
      )

      setDepartment(
        saved.department ||
          ""
      )

      setRoom(
        saved.room ||
          ""
      )

      setCurrentPlace(
        saved.currentPlace ||
          ""
      )

      setAvailabilityUntil(
        saved.availabilityUntil ||
          ""
      )
    }
  }, [
    recovery?.pickupLocation,
  ])


  // ==========================================================
  // SOCKET.IO
  // ==========================================================

  useEffect(() => {
    if (!recoveryId) {
      return
    }

    const socket =
      io(
        SOCKET_URL,
        {
          transports: [
            "websocket",
            "polling",
          ],

          reconnection:
            true,

          reconnectionAttempts:
            Infinity,
        }
      )

    socketRef.current =
      socket

    // Keep this only as a compatibility reference.
    window.__findxRecoverySocket =
      socket


    // ========================================================
    // CONNECT
    // ========================================================

    socket.on(
      "connect",
      () => {
        console.log(
          "FINDX WORKSPACE CONNECTED:",
          socket.id
        )

        setSocketConnected(
          true
        )

        socket.emit(
          "recovery:join",
          {
            recoveryId,

            role,
          }
        )
      }
    )


    // ========================================================
    // RECONNECTED
    // ========================================================

    socket.on(
      "reconnect",
      () => {
        console.log(
          "FINDX WORKSPACE RECONNECTED"
        )

        socket.emit(
          "recovery:join",
          {
            recoveryId,

            role,
          }
        )
      }
    )


    // ========================================================
    // DISCONNECT
    // ========================================================

    socket.on(
      "disconnect",
      () => {
        console.log(
          "FINDX WORKSPACE DISCONNECTED"
        )

        setSocketConnected(
          false
        )
      }
    )


    // ========================================================
    // CHAT MESSAGE
    // ========================================================

    socket.on(
      "chat:message",
      (payload) => {
        if (
          !payload?.message
        ) {
          return
        }

        const incomingId =
          payload.messageId ||
          `${payload.timestamp || Date.now()}-${payload.senderRole || "unknown"}-${payload.message}`

        /*
          Prevent duplicate events.

          The sender may already have inserted the
          outgoing message locally, so don't insert
          the same message twice.
        */

        if (
          sentMessageIdsRef.current.has(
            incomingId
          )
        ) {
          return
        }

        setMessages(
          (current) => [
            ...current,

            {
              id:
                incomingId,

              senderRole:
                payload.senderRole ||
                "unknown",

              message:
                payload.message,

              timestamp:
                payload.timestamp ||
                Date.now(),
            },
          ]
        )
      }
    )


    // ========================================================
    // PICKUP LOCATION UPDATE
    // ========================================================

    socket.on(
      "recovery:location-updated",
      (payload) => {
        if (
          !payload?.recoveryId
        ) {
          return
        }

        if (
          String(
            payload.recoveryId
          ) !==
          String(
            recoveryId
          )
        ) {
          return
        }

        const nextLocation =
          payload.pickupLocation ||
          null

        if (
          !nextLocation
        ) {
          return
        }

        console.log(
          "FINDX WORKSPACE: PICKUP LOCATION RECEIVED:",
          nextLocation
        )

        setLocation(
          nextLocation
        )

        // Keep fields visually synchronized.
        setLocationType(
          nextLocation.type ||
            "class"
        )

        setInstitution(
          nextLocation.institution ||
            ""
        )

        setClassName(
          nextLocation.className ||
            ""
        )

        setDepartment(
          nextLocation.department ||
            ""
        )

        setRoom(
          nextLocation.room ||
            ""
        )

        setCurrentPlace(
          nextLocation.currentPlace ||
            ""
        )

        setAvailabilityUntil(
          nextLocation.availabilityUntil ||
            ""
        )

        if (
          typeof onRecoveryUpdated ===
          "function"
        ) {
          onRecoveryUpdated(
            {
              ...recovery,

              pickupLocation:
                nextLocation,
            }
          )
        }
      }
    )


    return () => {
      socket.disconnect()

      if (
        window.__findxRecoverySocket ===
        socket
      ) {
        window.__findxRecoverySocket =
          null
      }

      socketRef.current =
        null
    }
  }, [
    recoveryId,
    role,
  ])


  // ==========================================================
  // SEND CHAT MESSAGE
  // ==========================================================

  function sendMessage() {
    const clean =
      message.trim()

    if (
      !clean ||
      !recoveryId
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

    const messageId =
      `MSG-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`

    /*
      Mark this message as already rendered
      locally so the Socket.IO echo does not
      duplicate it.
    */

    sentMessageIdsRef.current.add(
      messageId
    )

    setMessages(
      (current) => [
        ...current,

        {
          id:
            messageId,

          senderRole:
            role,

          message:
            clean,

          timestamp:
            Date.now(),
        },
      ]
    )

    socket.emit(
      "chat:message",
      {
        recoveryId,

        message:
          clean,

        messageId,
      }
    )

    setMessage("")
  }


  // ==========================================================
  // SAVE PICKUP LOCATION
  // FINDER ONLY
  // ==========================================================

  async function saveLocation() {
    if (
      role !==
      "finder"
    ) {
      return
    }

    if (
      !recoveryId
    ) {
      return
    }

    if (
      !currentPlace.trim()
    ) {
      setLocationError(
        "Enter the safe pickup place."
      )

      return
    }


    try {
      setSavingLocation(
        true
      )

      setLocationError("")


      const pickupLocation = {
        type:
          locationType,

        institution:
          institution.trim(),

        className:
          className.trim(),

        department:
          department.trim(),

        room:
          room.trim(),

        currentPlace:
          currentPlace.trim(),

        availabilityUntil:
          availabilityUntil.trim(),
      }


      // ========================================================
      // API
      // ========================================================

      const response =
        await fetch(
          `${API_URL}/${encodeURIComponent(
            recoveryId
          )}/location`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                pickupLocation,
              }),
          }
        )


      let data = null

      try {
        data =
          await response.json()
      } catch {
        throw new Error(
          "Recovery server returned an invalid response."
        )
      }


      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            "Unable to save pickup location."
        )
      }


      const updatedRecovery =
        data?.recovery ||
        {
          ...recovery,

          pickupLocation,
        }


      setLocation(
        pickupLocation
      )


      if (
        typeof onRecoveryUpdated ===
        "function"
      ) {
        onRecoveryUpdated(
          updatedRecovery
        )
      }


      // ========================================================
      // REALTIME BROADCAST
      //
      // IMPORTANT:
      // The backend expects pickupLocation inside
      // the socket payload.
      // ========================================================

      const socket =
        socketRef.current


      if (
        socket?.connected
      ) {
        socket.emit(
          "recovery:location-updated",
          {
            recoveryId,

            matchId:
              recovery?.matchId ||
              null,

            lostReportId:
              recovery?.lostReportId ||
              null,

            foundReportId:
              recovery?.foundReportId ||
              null,

            pickupLocation,
          }
        )
      }
    } catch (error) {
      console.error(
        "FINDX: Pickup location error:",
        error
      )

      setLocationError(
        error.message ||
          "Unable to save pickup location."
      )
    } finally {
      setSavingLocation(
        false
      )
    }
  }


  // ==========================================================
  // NO RECOVERY
  // ==========================================================

  if (
    !recoveryId
  ) {
    return null
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <section
      id="recovery-workspace"
      className="
        relative
        min-h-screen
        py-8
        sm:py-12
      "
    >

      <div
        className="
          findx-container
          space-y-6
        "
      >

        {/* ====================================================
            APPROVED HEADER
            ==================================================== */}

        <div
          className="
            rounded-3xl
            border
            border-emerald-400/[0.12]
            bg-emerald-400/[0.025]
            p-6
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
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
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-400/[0.08]
                "
              >

                <CheckCircle2
                  size={21}
                  className="
                    text-emerald-300
                  "
                />

              </div>

              <div>

                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.15em]
                    text-emerald-300
                  "
                >
                  FINDER APPROVED
                </p>

                <h2
                  className="
                    mt-1
                    text-xl
                    font-semibold
                    text-white
                  "
                >
                  Private recovery unlocked
                </h2>

              </div>

            </div>


            <div
              className="
                hidden
                items-center
                gap-2
                text-[9px]
                uppercase
                tracking-[0.12em]
                sm:flex
              "
            >

              <span
                className={`
                  h-2
                  w-2
                  rounded-full
                  ${
                    socketConnected
                      ? "animate-pulse bg-emerald-400"
                      : "bg-amber-400"
                  }
                `}
              />

              <span
                className={`
                  ${
                    socketConnected
                      ? "text-emerald-300"
                      : "text-amber-300"
                  }
                `}
              >
                {socketConnected
                  ? "LIVE"
                  : "CONNECTING"}
              </span>

            </div>

          </div>

        </div>


        {/* ====================================================
            PICKUP LOCATION
            ==================================================== */}

        <div
          className="
            rounded-3xl
            border
            border-blue-400/[0.10]
            bg-blue-400/[0.025]
            p-6
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >

            <div>

              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.15em]
                  text-blue-300
                "
              >
                CONTROLLED PICKUP
              </p>

              <h3
                className="
                  mt-2
                  text-lg
                  font-semibold
                  text-white
                "
              >
                {role ===
                "finder"
                  ? "Give the lost person a safe pickup point"
                  : "Pickup location from the finder"}
              </h3>

            </div>

            <MapPin
              size={20}
              className="
                text-blue-300
              "
            />

          </div>


          {/* ==================================================
              FINDER FORM
              ================================================== */}

          {role ===
          "finder" ? (
            <div
              className="
                mt-5
                grid
                gap-3
              "
            >

              <div
                className="
                  grid
                  gap-3
                  sm:grid-cols-2
                "
              >

                <SelectField
                  label="Location type"
                  value={
                    locationType
                  }
                  onChange={
                    setLocationType
                  }
                  options={[
                    [
                      "class",
                      "Class",
                    ],
                    [
                      "department",
                      "Department",
                    ],
                    [
                      "lab",
                      "Lab",
                    ],
                    [
                      "classroom",
                      "Classroom",
                    ],
                    [
                      "security_desk",
                      "Security desk",
                    ],
                    [
                      "lost_and_found",
                      "Lost & Found desk",
                    ],
                  ]}
                />


                <TextField
                  label="School / College"
                  value={
                    institution
                  }
                  onChange={
                    setInstitution
                  }
                  placeholder="e.g. Vignan Institute"
                />

              </div>


              <div
                className="
                  grid
                  gap-3
                  sm:grid-cols-3
                "
              >

                <TextField
                  label="Class / Section"
                  value={
                    className
                  }
                  onChange={
                    setClassName
                  }
                  placeholder="AI-DS A"
                />


                <TextField
                  label="Department"
                  value={
                    department
                  }
                  onChange={
                    setDepartment
                  }
                  placeholder="AI & Data Science"
                />


                <TextField
                  label="Block / Room / Lab"
                  value={
                    room
                  }
                  onChange={
                    setRoom
                  }
                  placeholder="Block B · Lab 204"
                />

              </div>


              <div
                className="
                  grid
                  gap-3
                  sm:grid-cols-2
                "
              >

                <TextField
                  label="Small pickup address"
                  value={
                    currentPlace
                  }
                  onChange={
                    setCurrentPlace
                  }
                  placeholder="Block B, AI Lab entrance"
                />


                <TextField
                  label="Available until"
                  value={
                    availabilityUntil
                  }
                  onChange={
                    setAvailabilityUntil
                  }
                  placeholder="4:30 PM"
                />

              </div>


              {locationError && (
                <div
                  className="
                    rounded-xl
                    border
                    border-red-400/[0.10]
                    bg-red-400/[0.03]
                    p-3
                    text-xs
                    text-red-300
                  "
                >
                  {locationError}
                </div>
              )}


              <button
                type="button"
                onClick={
                  saveLocation
                }
                disabled={
                  savingLocation
                }
                className="
                  flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-500
                  text-sm
                  font-semibold
                  text-white
                  hover:bg-blue-400
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                <MapPin
                  size={15}
                />

                {savingLocation
                  ? "Sending..."
                  : "Send pickup location"}

              </button>

            </div>
          ) : (
            <LocationCard
              location={
                location
              }
            />
          )}

        </div>


        {/* ====================================================
            RADAR
            ==================================================== */}

        <div
          className="
            overflow-hidden
            rounded-3xl
            border
            border-white/[0.07]
            bg-white/[0.02]
          "
        >

          <button
            type="button"
            onClick={() =>
              setRadarOpen(
                (current) =>
                  !current
              )
            }
            className="
              flex
              w-full
              items-center
              justify-between
              px-6
              py-5
              text-left
              hover:bg-white/[0.02]
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
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-400/[0.07]
                "
              >

                <Navigation
                  size={17}
                  className="
                    text-cyan-300
                  "
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
                  Recovery Radar
                </p>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    text-slate-600
                  "
                >
                  Both participants can access the radar
                </p>

              </div>

            </div>


            {radarOpen ? (
              <ChevronUp
                size={16}
                className="
                  text-slate-500
                "
              />
            ) : (
              <ChevronDown
                size={16}
                className="
                  text-slate-500
                "
              />
            )}

          </button>


          {radarOpen && (
            <div
              className="
                border-t
                border-white/[0.06]
              "
            >

              <RadarMap
                recoveryId={
                  recoveryId
                }

                role={
                  role
                }
              />

            </div>
          )}

        </div>


        {/* ====================================================
            PRIVACY
            ==================================================== */}

        <div
          className="
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-emerald-400/[0.08]
            bg-emerald-400/[0.02]
            p-4
          "
        >

          <ShieldCheck
            size={17}
            className="
              mt-0.5
              shrink-0
              text-emerald-300
            "
          />

          <p
            className="
              text-xs
              leading-5
              text-slate-500
            "
          >
            FINDX shows only controlled pickup
            information. Private residential addresses
            are never required.
          </p>

        </div>

      </div>


      {/* ======================================================
          FLOATING CHAT
          ====================================================== */}

      {chatOpen ? (
        <div
          className="
            fixed
            bottom-5
            right-5
            z-[9000]
            w-[min(94vw,390px)]
          "
        >

          <div
            className="
              overflow-hidden
              rounded-3xl
              border
              border-violet-400/[0.16]
              bg-[#070b16]/96
              shadow-[0_25px_80px_rgba(0,0,0,0.45)]
              backdrop-blur-2xl
            "
          >

            {/* CHAT HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-white/[0.06]
                px-5
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
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-violet-400/[0.09]
                  "
                >

                  <MessageCircle
                    size={17}
                    className="
                      text-violet-300
                    "
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

                  <p
                    className={`
                      mt-0.5
                      text-[9px]
                      ${
                        socketConnected
                          ? "text-emerald-300"
                          : "text-amber-300"
                      }
                    `}
                  >
                    {socketConnected
                      ? "Secure session active"
                      : "Connecting..."}
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={() =>
                  setChatOpen(
                    false
                  )
                }
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-500
                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >

                <X
                  size={16}
                />

              </button>

            </div>


            {/* CHAT MESSAGES */}

            <div
              className="
                max-h-72
                min-h-44
                overflow-y-auto
                p-4
                space-y-3
              "
            >

              {messages.length ===
              0 ? (
                <div
                  className="
                    flex
                    h-40
                    items-center
                    justify-center
                    text-center
                  "
                >

                  <div>

                    <MessageCircle
                      size={22}
                      className="
                        mx-auto
                        text-slate-700
                      "
                    />

                    <p
                      className="
                        mt-3
                        text-xs
                        text-slate-600
                      "
                    >
                      Chat is ready.
                    </p>

                  </div>

                </div>
              ) : (
                messages.map(
                  (item) => {
                    const mine =
                      item.senderRole ===
                      role

                    return (
                      <div
                        key={
                          item.id
                        }
                        className={`
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
                            max-w-[82%]
                            rounded-2xl
                            px-3.5
                            py-2.5
                            text-xs
                            leading-5
                            ${
                              mine
                                ? "bg-violet-500 text-white"
                                : "bg-white/[0.05] text-slate-300"
                            }
                          `}
                        >
                          {item.message}
                        </div>

                      </div>
                    )
                  }
                )
              )}

            </div>


            {/* CHAT INPUT */}

            <div
              className="
                border-t
                border-white/[0.06]
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

                <input
                  value={
                    message
                  }
                  onChange={(
                    event
                  ) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault()

                      sendMessage()
                    }
                  }}
                  placeholder="Type a private message..."
                  className="
                    h-11
                    min-w-0
                    flex-1
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-black/20
                    px-3
                    text-xs
                    text-white
                    outline-none
                    placeholder:text-slate-700
                    focus:border-violet-400/30
                  "
                />


                <button
                  type="button"
                  onClick={
                    sendMessage
                  }
                  disabled={
                    !socketConnected ||
                    !message.trim()
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
                    size={15}
                  />

                </button>

              </div>

            </div>

          </div>

        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            setChatOpen(
              true
            )
          }
          className="
            fixed
            bottom-5
            right-5
            z-[9000]
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-violet-500
            text-white
            shadow-[0_15px_45px_rgba(139,92,246,0.30)]
            hover:bg-violet-400
          "
        >

          <MessageCircle
            size={21}
          />

        </button>
      )}

    </section>
  )
}


// ============================================================
// LOCATION CARD
// ============================================================

function LocationCard({
  location,
}) {
  if (
    !location?.currentPlace
  ) {
    return (
      <div
        className="
          mt-5
          rounded-2xl
          border
          border-amber-400/[0.10]
          bg-amber-400/[0.025]
          p-4
        "
      >

        <p
          className="
            text-xs
            text-amber-300
          "
        >
          Waiting for the finder to provide
          the pickup location...
        </p>

      </div>
    )
  }


  return (
    <div
      className="
        mt-5
        rounded-2xl
        border
        border-emerald-400/[0.10]
        bg-emerald-400/[0.025]
        p-5
      "
    >

      <div
        className="
          flex
          items-start
          gap-3
        "
      >

        <MapPin
          size={19}
          className="
            mt-0.5
            shrink-0
            text-emerald-300
          "
        />

        <div>

          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-emerald-300
            "
          >
            FINDER'S PICKUP POINT
          </p>

          <p
            className="
              mt-2
              text-lg
              font-semibold
              text-white
            "
          >
            {location.currentPlace}
          </p>

        </div>

      </div>


      <div
        className="
          mt-4
          grid
          gap-3
          sm:grid-cols-2
        "
      >

        {location.institution && (
          <LocationDetail
            label="School / College"
            value={
              location.institution
            }
          />
        )}

        {location.className && (
          <LocationDetail
            label="Class / Section"
            value={
              location.className
            }
          />
        )}

        {location.department && (
          <LocationDetail
            label="Department"
            value={
              location.department
            }
          />
        )}

        {location.room && (
          <LocationDetail
            label="Block / Room / Lab"
            value={
              location.room
            }
          />
        )}

        {location.availabilityUntil && (
          <LocationDetail
            label="Available until"
            value={
              location.availabilityUntil
            }
          />
        )}

      </div>

    </div>
  )
}


// ============================================================
// LOCATION DETAIL
// ============================================================

function LocationDetail({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/[0.06]
        bg-black/10
        p-3
      "
    >

      <p
        className="
          text-[9px]
          uppercase
          tracking-[0.12em]
          text-slate-600
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-xs
          text-slate-300
        "
      >
        {value}
      </p>

    </div>
  )
}


// ============================================================
// TEXT FIELD
// ============================================================

function TextField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <label
      className="
        block
      "
    >

      <span
        className="
          text-[9px]
          font-medium
          uppercase
          tracking-[0.13em]
          text-slate-600
        "
      >
        {label}
      </span>

      <input
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="
          mt-2
          h-11
          w-full
          rounded-xl
          border
          border-white/[0.07]
          bg-black/20
          px-3
          text-xs
          text-white
          outline-none
          placeholder:text-slate-700
          focus:border-blue-400/30
        "
      />

    </label>
  )
}


// ============================================================
// SELECT FIELD
// ============================================================

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label
      className="
        block
      "
    >

      <span
        className="
          text-[9px]
          font-medium
          uppercase
          tracking-[0.13em]
          text-slate-600
        "
      >
        {label}
      </span>

      <select
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="
          mt-2
          h-11
          w-full
          rounded-xl
          border
          border-white/[0.07]
          bg-slate-950
          px-3
          text-xs
          text-white
          outline-none
          focus:border-blue-400/30
        "
      >

        {options.map(
          ([key, label]) => (
            <option
              key={key}
              value={key}
            >
              {label}
            </option>
          )
        )}

      </select>

    </label>
  )
}


export default RecoveryWorkspace