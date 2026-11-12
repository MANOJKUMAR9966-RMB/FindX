import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  CheckCircle2,
  Crosshair,
  Navigation,
  Radio,
  ShieldCheck,
  Volume2,
  VolumeX,
} from "lucide-react"

import { io } from "socket.io-client"

const BACKEND_PORT = 5000

// People are considered aligned inside this distance.
const FOUND_DISTANCE_METERS = 8

function getSocketUrl() {
  const hostname =
    window.location.hostname

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  ) {
    return `http://localhost:${BACKEND_PORT}`
  }

  /*
    For a real mobile deployment this should be HTTPS.
    Using the same protocol avoids mixed-content problems.
  */
  const protocol =
    window.location.protocol === "https:"
      ? "https"
      : "http"

  return `${protocol}://${hostname}:${BACKEND_PORT}`
}

// ============================================================
// GEO HELPERS
// ============================================================

function toRadians(value) {
  return (
    (value * Math.PI) / 180
  )
}

function calculateDistance(
  first,
  second
) {
  if (
    !first ||
    !second
  ) {
    return null
  }

  const lat1 =
    toRadians(
      first.latitude
    )

  const lat2 =
    toRadians(
      second.latitude
    )

  const deltaLat =
    toRadians(
      second.latitude -
        first.latitude
    )

  const deltaLon =
    toRadians(
      second.longitude -
        first.longitude
    )

  const a =
    Math.sin(
      deltaLat / 2
    ) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(
        deltaLon / 2
      ) ** 2

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return (
    6371000 * c
  )
}

// ============================================================
// RADAR
// ============================================================

function RadarMap({
  recoveryId,
  role = "lost",
}) {
  const socketRef =
    useRef(null)

  const watchIdRef =
    useRef(null)

  const demoTimerRef =
    useRef(null)

  const beepTimerRef =
    useRef(null)

  const audioContextRef =
    useRef(null)

  const manuallyStoppedBeepRef =
    useRef(false)

  const previousAlignedRef =
    useRef(false)

  const [connected, setConnected] =
    useState(false)

  const [sharing, setSharing] =
    useState(false)

  const [otherSharing, setOtherSharing] =
    useState(false)

  const [myLocation, setMyLocation] =
    useState(null)

  const [otherLocation, setOtherLocation] =
    useState(null)

  const [locationError, setLocationError] =
    useState("")

  const [personFound, setPersonFound] =
    useState(false)

  const [demoMode, setDemoMode] =
    useState(false)

  const [demoDistance, setDemoDistance] =
    useState(120)

  const [audioEnabled, setAudioEnabled] =
    useState(true)

  const [beepActive, setBeepActive] =
    useState(false)

  // ==========================================================
  // ACTIVE SESSION
  // ==========================================================

  const params =
    new URLSearchParams(
      window.location.search
    )

  const activeRecoveryId =
    params.get("recovery") ||
    recoveryId

  const activeRole =
    params.get("role") === "finder"
      ? "finder"
      : role

  const isLost =
    activeRole === "lost"

  const myColor =
    isLost
      ? "#ef4444"
      : "#22c55e"

  const otherColor =
    isLost
      ? "#22c55e"
      : "#ef4444"

  const otherLabel =
    isLost
      ? "FINDER"
      : "LOST PERSON"

  const myLabel =
    isLost
      ? "LOST PERSON"
      : "FINDER"

  // ==========================================================
  // SOCKET.IO
  // ==========================================================

  useEffect(() => {
    if (!activeRecoveryId) {
      return
    }

    const socket =
      io(
        getSocketUrl(),
        {
          transports: [
            "websocket",
            "polling",
          ],
          reconnection: true,
        }
      )

    socketRef.current =
      socket

    /*
      Expose the active recovery socket so the
      floating recovery chat can reuse the same
      realtime session if needed.
    */
    window.__findxRecoverySocket =
      socket

    socket.on(
      "connect",
      () => {
        console.log(
          "FINDX RADAR: Socket connected:",
          socket.id
        )

        setConnected(true)

        socket.emit(
          "recovery:join",
          {
            recoveryId:
              activeRecoveryId,

            role:
              activeRole,
          }
        )
      }
    )

    socket.on(
      "recovery:joined",
      (data) => {
        console.log(
          "FINDX RADAR: Joined recovery:",
          data
        )
      }
    )

    socket.on(
      "recovery:participants",
      (data) => {
        console.log(
          "FINDX RADAR: Participants:",
          data
        )
      }
    )

    // ========================================================
    // OTHER PARTICIPANT GPS STATUS
    // ========================================================

    socket.on(
      "location:status",
      (data) => {
        if (
          data?.role ===
          activeRole
        ) {
          return
        }

        setOtherSharing(
          Boolean(
            data?.sharing
          )
        )

        /*
          If the other person explicitly stops GPS,
          their previous location should no longer
          be treated as a current live position.
        */
        if (
          !data?.sharing
        ) {
          setOtherLocation(
            null
          )
        }
      }
    )

    // ========================================================
    // OTHER PARTICIPANT GPS UPDATE
    // ========================================================

    socket.on(
      "location:update",
      (data) => {
        if (
          data?.role ===
          activeRole
        ) {
          return
        }

        if (
          typeof data?.latitude !==
            "number" ||
          typeof data?.longitude !==
            "number"
        ) {
          return
        }

        setOtherSharing(
          true
        )

        setOtherLocation({
          latitude:
            data.latitude,

          longitude:
            data.longitude,

          accuracy:
            data.accuracy,

          timestamp:
            data.timestamp ||
            Date.now(),
        })
      }
    )

    // ========================================================
    // DISCONNECT
    // ========================================================

    socket.on(
      "disconnect",
      () => {
        console.log(
          "FINDX RADAR: Socket disconnected"
        )

        setConnected(false)

        setOtherSharing(
          false
        )

        setOtherLocation(
          null
        )
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
    activeRecoveryId,
    activeRole,
  ])

  // ==========================================================
  // DISTANCE
  // ==========================================================

  const realDistance =
    calculateDistance(
      myLocation,
      otherLocation
    )

  const displayedDistance =
    realDistance !== null
      ? realDistance
      : demoMode
        ? demoDistance
        : null

  const roundedDistance =
    displayedDistance ===
    null
      ? null
      : Math.round(
          displayedDistance
        )

  // ==========================================================
  // AUDIO
  // ==========================================================

  function prepareAudio() {
    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext

      if (!AudioContext) {
        return null
      }

      if (
        !audioContextRef.current
      ) {
        audioContextRef.current =
          new AudioContext()
      }

      const context =
        audioContextRef.current

      if (
        context.state ===
        "suspended"
      ) {
        context.resume()
      }

      return context
    } catch (error) {
      console.error(
        "FINDX audio initialization failed:",
        error
      )

      return null
    }
  }

  // ==========================================================
  // ONE BEEP
  // ==========================================================

  function playBeep() {
    if (!audioEnabled) {
      return
    }

    const context =
      prepareAudio()

    if (!context) {
      return
    }

    try {
      const now =
        context.currentTime

      const oscillator =
        context.createOscillator()

      const gain =
        context.createGain()

      oscillator.type =
        "sine"

      oscillator.frequency.setValueAtTime(
        760,
        now
      )

      oscillator.frequency.exponentialRampToValueAtTime(
        1080,
        now + 0.14
      )

      gain.gain.setValueAtTime(
        0.0001,
        now
      )

      gain.gain.exponentialRampToValueAtTime(
        0.22,
        now + 0.025
      )

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.32
      )

      oscillator.connect(
        gain
      )

      gain.connect(
        context.destination
      )

      oscillator.start(
        now
      )

      oscillator.stop(
        now + 0.34
      )
    } catch (error) {
      console.error(
        "FINDX beep failed:",
        error
      )
    }
  }

  // ==========================================================
  // START CONTINUOUS BEEP
  // ==========================================================

  function startBeep() {
    if (
      !audioEnabled
    ) {
      return
    }

    prepareAudio()

    /*
      Once the users enter the alignment
      range, beep continues until STOP BEEP
      is manually pressed.
    */
    manuallyStoppedBeepRef.current =
      false

    if (
      beepTimerRef.current
    ) {
      return
    }

    playBeep()

    beepTimerRef.current =
      window.setInterval(
        () => {
          playBeep()
        },
        700
      )

    setBeepActive(
      true
    )
  }

  // ==========================================================
  // STOP BEEP
  // ==========================================================

  function stopBeep(
    rememberManualStop = false
  ) {
    if (
      rememberManualStop
    ) {
      manuallyStoppedBeepRef.current =
        true
    }

    if (
      beepTimerRef.current
    ) {
      window.clearInterval(
        beepTimerRef.current
      )

      beepTimerRef.current =
        null
    }

    setBeepActive(
      false
    )
  }

  // ==========================================================
  // AUDIO TOGGLE
  // ==========================================================

  function toggleAudio() {
    if (!audioEnabled) {
      prepareAudio()

      setAudioEnabled(
        true
      )

      return
    }

    setAudioEnabled(
      false
    )

    stopBeep(true)
  }

  // ==========================================================
  // ALIGNMENT DETECTION
  // ==========================================================

  useEffect(() => {
    const isAligned =
      displayedDistance !==
        null &&
      displayedDistance <=
        FOUND_DISTANCE_METERS

    setPersonFound(
      isAligned
    )

    /*
      When users move apart, the manual stop
      lock is reset. This means next time they
      come together, the alarm starts again.
    */
    if (!isAligned) {
      manuallyStoppedBeepRef.current =
        false

      stopBeep(false)

      previousAlignedRef.current =
        false

      return
    }

    /*
      Start automatically when entering the
      proximity zone.
    */
    if (
      !previousAlignedRef.current &&
      !manuallyStoppedBeepRef.current &&
      audioEnabled
    ) {
      startBeep()
    }

    /*
      Keep tracking alignment state.
    */
    previousAlignedRef.current =
      true
  }, [
    displayedDistance,
    audioEnabled,
  ])

  // ==========================================================
  // GPS
  // ==========================================================

  function stopGps() {
    if (
      watchIdRef.current !==
        null &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(
        watchIdRef.current
      )

      watchIdRef.current =
        null
    }
  }

  function startGps() {
    if (
      !navigator.geolocation
    ) {
      setLocationError(
        "Live location is not supported on this device."
      )

      return
    }

    /*
      Real mobile browsers require a secure context.
    */
    if (
      !window.isSecureContext &&
      window.location.hostname !==
        "localhost"
    ) {
      setLocationError(
        "Mobile live location requires HTTPS."
      )

      return
    }

    stopDemo()

    setDemoMode(
      false
    )

    setLocationError("")

    prepareAudio()

    setSharing(
      true
    )

    const socket =
      socketRef.current

    if (
      socket?.connected
    ) {
      socket.emit(
        "location:started",
        {
          recoveryId:
            activeRecoveryId,

          role:
            activeRole,
        }
      )
    }

    stopGps()

    watchIdRef.current =
      navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            latitude:
              position.coords
                .latitude,

            longitude:
              position.coords
                .longitude,

            accuracy:
              position.coords
                .accuracy,

            timestamp:
              position.timestamp,
          }

          setMyLocation(
            location
          )

          const currentSocket =
            socketRef.current

          if (
            currentSocket?.connected
          ) {
            currentSocket.emit(
              "location:update",
              {
                recoveryId:
                  activeRecoveryId,

                role:
                  activeRole,

                latitude:
                  location.latitude,

                longitude:
                  location.longitude,

                accuracy:
                  location.accuracy,

                timestamp:
                  location.timestamp,
              }
            )
          }
        },

        (error) => {
          console.error(
            "FINDX GPS error:",
            error
          )

          stopGps()

          setSharing(
            false
          )

          if (
            error.code === 1
          ) {
            setLocationError(
              "Location permission denied. Allow location access for the browser."
            )
          } else if (
            error.code === 2
          ) {
            setLocationError(
              "Phone could not determine location. Turn on GPS/location services."
            )
          } else if (
            error.code === 3
          ) {
            setLocationError(
              "Location request timed out. Try again."
            )
          } else {
            setLocationError(
              "Unable to read device location."
            )
          }
        },

        {
          enableHighAccuracy:
            true,

          maximumAge:
            1000,

          timeout:
            15000,
        }
      )
  }

  // ==========================================================
  // STOP THIS USER ONLY
  // ==========================================================

  function stopSharing() {
    stopGps()

    setSharing(
      false
    )

    setPersonFound(
      false
    )

    setMyLocation(
      null
    )

    stopBeep(true)

    /*
      Do not stop the other person's GPS.
      Only this participant stops sharing.
    */
    const socket =
      socketRef.current

    if (
      socket?.connected
    ) {
      socket.emit(
        "location:stopped",
        {
          recoveryId:
            activeRecoveryId,

          role:
            activeRole,
        }
      )
    }
  }

  // ==========================================================
  // DEMO
  // ==========================================================

  function stopDemo() {
    if (
      demoTimerRef.current
    ) {
      clearInterval(
        demoTimerRef.current
      )

      demoTimerRef.current =
        null
    }
  }

  function startDemo() {
    stopGps()

    stopBeep(false)

    manuallyStoppedBeepRef.current =
      false

    previousAlignedRef.current =
      false

    setSharing(
      true
    )

    setDemoMode(
      true
    )

    setPersonFound(
      false
    )

    setDemoDistance(
      120
    )

    prepareAudio()

    stopDemo()

    let current = 120

    demoTimerRef.current =
      window.setInterval(
        () => {
          current =
            Math.max(
              FOUND_DISTANCE_METERS,
              current - 8
            )

          setDemoDistance(
            current
          )

          if (
            current <=
            FOUND_DISTANCE_METERS
          ) {
            stopDemo()
          }
        },
        350
      )
  }

  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {
    return () => {
      stopGps()

      stopDemo()

      stopBeep(false)
    }
  }, [])

  // ==========================================================
  // RADAR POSITION
  // ==========================================================

  let myX = 50
  let myY = 50

  let otherX = 76
  let otherY = 28

  if (
    myLocation &&
    otherLocation
  ) {
    const cosLat =
      Math.cos(
        toRadians(
          myLocation.latitude
        )
      )

    const eastMeters =
      (
        otherLocation.longitude -
          myLocation.longitude
      ) *
      111320 *
      cosLat

    const northMeters =
      (
        otherLocation.latitude -
          myLocation.latitude
      ) *
      111320

    const maxMeters =
      Math.max(
        20,
        Math.min(
          250,
          Math.max(
            Math.abs(
              eastMeters
            ),
            Math.abs(
              northMeters
            )
          ) * 1.5
        )
      )

    otherX =
      50 +
      Math.max(
        -40,
        Math.min(
          40,
          (eastMeters /
            maxMeters) *
            40
        )
      )

    otherY =
      50 +
      Math.max(
        -40,
        Math.min(
          40,
          (-northMeters /
            maxMeters) *
            40
        )
      )
  }

  if (
    demoMode
  ) {
    const progress =
      1 -
      demoDistance / 120

    otherX =
      20 +
      progress * 30

    otherY =
      25 +
      progress * 25
  }

  // ==========================================================
  // REQUIRED RECOVERY
  // ==========================================================

  if (
    !activeRecoveryId
  ) {
    return null
  }

  return (
    <section
      id="radar"
      className="
        relative
        py-12
        sm:py-16
      "
    >
      <div className="findx-container">

        <div className="mx-auto max-w-5xl">

          {/* ==================================================
              HEADER
              ================================================== */}

          <div
            className="
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >

            <div>

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-cyan-400/15
                  bg-cyan-400/[0.05]
                  px-3.5
                  py-2
                  text-xs
                  font-medium
                  tracking-wide
                  text-cyan-300
                "
              >
                <Radio
                  size={14}
                />

                FINDX LIVE RADAR
              </div>

              <h2
                className="
                  mt-5
                  text-4xl
                  font-semibold
                  tracking-[-0.045em]
                  text-white
                  sm:text-5xl
                "
              >
                Find the person,
                <br />

                <span className="findx-gradient-text">
                  not the address.
                </span>
              </h2>

              <p
                className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Live proximity coordination for
                the verified FINDX recovery session.
              </p>

            </div>

            {/* CONNECTION */}

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-white/[0.025]
                  px-4
                  py-3
                "
              >

                <span
                  className={`
                    h-2.5
                    w-2.5
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
                    text-xs
                    text-slate-400
                  "
                >
                  {connected
                    ? "Realtime connected"
                    : "Connecting..."}
                </span>

              </div>

              <button
                type="button"
                onClick={
                  toggleAudio
                }
                className="
                  flex
                  h-11
                  items-center
                  gap-2
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-white/[0.025]
                  px-4
                  text-xs
                  font-medium
                  text-slate-300
                  hover:text-white
                "
              >

                {audioEnabled ? (
                  <Volume2
                    size={15}
                  />
                ) : (
                  <VolumeX
                    size={15}
                  />
                )}

                Sound
              </button>

            </div>

          </div>

          {/* ==================================================
              RADAR CARD
              ================================================== */}

          <div
            className="
              mt-8
              overflow-hidden
              rounded-3xl
              border
              border-white/[0.10]
              bg-[#04070b]
              shadow-2xl
            "
          >

            {/* TOP BAR */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-white/[0.07]
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

                <Crosshair
                  size={18}
                  className="
                    text-cyan-300
                  "
                />

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
                    {myLabel}
                    {" · "}
                    {activeRecoveryId}
                  </p>

                </div>

              </div>

              <span
                className="
                  rounded-full
                  border
                  border-cyan-400/10
                  bg-cyan-400/[0.04]
                  px-3
                  py-1
                  text-[9px]
                  uppercase
                  tracking-[0.12em]
                  text-cyan-300
                "
              >
                Private
              </span>

            </div>

            {/* =================================================
                RADAR
                ================================================= */}

            <div
              style={{
                position:
                  "relative",

                width:
                  "100%",

                maxWidth:
                  "680px",

                height:
                  "min(100vw, 680px)",

                minHeight:
                  "320px",

                margin:
                  "32px auto",

                borderRadius:
                  "50%",

                overflow:
                  "hidden",

                background:
                  "radial-gradient(circle at center, rgba(0,255,170,0.07), rgba(2,6,9,1) 68%)",

                border:
                  "2px solid rgba(16,185,129,0.25)",

                boxShadow:
                  "0 0 80px rgba(16,185,129,0.08) inset, 0 0 80px rgba(0,0,0,0.45)",
              }}
            >

              {/* GRID */}

              <div
                style={{
                  position:
                    "absolute",

                  inset: 0,

                  backgroundImage:
                    "linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)",

                  backgroundSize:
                    "40px 40px",
                }}
              />

              {/* RINGS */}

              <RadarRing
                size="88%"
              />

              <RadarRing
                size="66%"
              />

              <RadarRing
                size="44%"
              />

              <RadarRing
                size="22%"
              />

              {/* CROSSHAIR */}

              <div
                style={{
                  position:
                    "absolute",

                  left:
                    "50%",

                  top: 0,

                  width:
                    "1px",

                  height:
                    "100%",

                  background:
                    "rgba(16,185,129,0.12)",
                }}
              />

              <div
                style={{
                  position:
                    "absolute",

                  top:
                    "50%",

                  left: 0,

                  height:
                    "1px",

                  width:
                    "100%",

                  background:
                    "rgba(16,185,129,0.12)",
                }}
              />

              {/* RADAR SWEEP */}

              <div
                style={{
                  position:
                    "absolute",

                  left:
                    "50%",

                  top:
                    "50%",

                  width:
                    "3px",

                  height:
                    "50%",

                  transformOrigin:
                    "bottom center",

                  transform:
                    "translateX(-50%) translateY(-100%)",

                  background:
                    "linear-gradient(to top, transparent, rgba(34,197,94,0.75), transparent)",

                  animation:
                    "findxRadarSpin 3s linear infinite",
                }}
              />

              {/* CONNECTION LINE */}

              <div
                style={{
                  position:
                    "absolute",

                  left:
                    `${myX}%`,

                  top:
                    `${myY}%`,

                  width:
                    `${Math.max(
                      8,
                      Math.sqrt(
                        Math.pow(
                          otherX -
                            myX,
                          2
                        ) +
                          Math.pow(
                            otherY -
                              myY,
                            2
                          )
                      )
                    )}%`,

                  height:
                    "2px",

                  transformOrigin:
                    "left center",

                  transform:
                    `rotate(${
                      Math.atan2(
                        otherY -
                          myY,
                        otherX -
                          myX
                      ) *
                      180 /
                      Math.PI
                    }deg)`,

                  background:
                    personFound
                      ? "rgba(34,197,94,.85)"
                      : "linear-gradient(90deg, rgba(255,255,255,.4), rgba(255,255,255,.05))",

                  zIndex:
                    5,
                }}
              />

              {/* YOU */}

              <RadarMarker
                x={myX}
                y={myY}
                color={myColor}
                label="YOU"
                active={sharing}
              />

              {/* OTHER PERSON */}

              <RadarMarker
                x={otherX}
                y={otherY}
                color={otherColor}
                label={otherLabel}
                active={
                  otherSharing ||
                  demoMode
                }
              />

              {/* DISTANCE */}

              <div
                style={{
                  position:
                    "absolute",

                  left:
                    "50%",

                  bottom:
                    "9%",

                  transform:
                    "translateX(-50%)",

                  padding:
                    "12px 22px",

                  borderRadius:
                    "16px",

                  background:
                    "rgba(0,0,0,.75)",

                  border:
                    "1px solid rgba(255,255,255,.10)",

                  textAlign:
                    "center",

                  zIndex:
                    50,

                  backdropFilter:
                    "blur(10px)",
                }}
              >

                <div
                  style={{
                    color:
                      "#64748b",

                    fontSize:
                      "10px",

                    letterSpacing:
                      "0.15em",

                    textTransform:
                      "uppercase",
                  }}
                >
                  Distance
                </div>

                <div
                  style={{
                    marginTop:
                      "4px",

                    color:
                      personFound
                        ? "#86efac"
                        : "#ffffff",

                    fontSize:
                      "28px",

                    fontWeight:
                      700,
                  }}
                >
                  {displayedDistance ===
                  null
                    ? "WAITING"
                    : `${Math.round(
                        displayedDistance
                      )} m`}
                </div>

              </div>

              {/* LIVE INDICATOR */}

              {sharing && (
                <div
                  style={{
                    position:
                      "absolute",

                    top:
                      "7%",

                    left:
                      "7%",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap:
                      "8px",

                    padding:
                      "8px 12px",

                    borderRadius:
                      "10px",

                    background:
                      "rgba(0,0,0,.72)",

                    border:
                      "1px solid rgba(239,68,68,.20)",

                    zIndex:
                      50,
                  }}
                >

                  <span
                    style={{
                      width:
                        "8px",

                      height:
                        "8px",

                      borderRadius:
                        "50%",

                      background:
                        "#ef4444",

                      boxShadow:
                        "0 0 10px #ef4444",
                    }}
                  />

                  <span
                    style={{
                      color:
                        "#fca5a5",

                      fontSize:
                        "10px",

                      fontWeight:
                        700,

                      letterSpacing:
                        "0.12em",
                    }}
                  >
                    LIVE
                  </span>

                </div>
              )}

            </div>

            {/* =================================================
                CONTINUOUS BEEP PANEL
                ================================================= */}

            {personFound && (
              <div
                className="
                  border-t
                  border-red-400/15
                  bg-red-400/[0.035]
                  p-5
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
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
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-red-500/[0.10]
                      "
                    >

                      <Volume2
                        size={19}
                        className="
                          text-red-300
                        "
                      />

                    </div>

                    <div>

                      <p
                        className="
                          text-sm
                          font-semibold
                          text-red-200
                        "
                      >
                        {beepActive
                          ? "PROXIMITY DETECTED"
                          : "PEOPLE ALIGNED"}
                      </p>

                      <p
                        className="
                          mt-1
                          text-[10px]
                          leading-5
                          text-slate-500
                        "
                      >
                        {beepActive
                          ? "Beep continues until manually stopped."
                          : "Press Start Beep to activate the proximity alarm again."}
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        beepActive
                      ) {
                        stopBeep(
                          true
                        )
                      } else {
                        startBeep()
                      }
                    }}
                    className={`
                      flex
                      h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      px-5
                      text-xs
                      font-bold
                      transition
                      ${
                        beepActive
                          ? "bg-red-500 text-white hover:bg-red-400"
                          : "border border-red-400/20 bg-red-400/[0.08] text-red-300 hover:bg-red-400/[0.14]"
                      }
                    `}
                  >

                    {beepActive
                      ? "STOP BEEP"
                      : "START BEEP"}

                  </button>

                </div>

              </div>
            )}

            {/* =================================================
                LEGEND
                ================================================= */}

            <div
              className="
                grid
                gap-3
                border-t
                border-white/[0.07]
                p-5
                sm:grid-cols-2
              "
            >

              <Legend
                color="#ef4444"
                title="Lost person"
                active={
                  isLost
                    ? sharing
                    : otherSharing
                }
              />

              <Legend
                color="#22c55e"
                title="Finder"
                active={
                  isLost
                    ? otherSharing
                    : sharing
                }
              />

            </div>

            {/* =================================================
                STATS
                ================================================= */}

            <div
              className="
                grid
                gap-px
                border-t
                border-white/[0.07]
                bg-white/[0.05]
                sm:grid-cols-3
              "
            >

              <Stat
                label="Distance"
                value={
                  displayedDistance ===
                  null
                    ? "Waiting"
                    : `${Math.round(
                        displayedDistance
                      )} m`
                }
              />

              <Stat
                label="Your location"
                value={
                  sharing
                    ? "LIVE"
                    : "OFF"
                }
              />

              <Stat
                label="Other location"
                value={
                  otherSharing
                    ? "LIVE"
                    : "WAITING"
                }
              />

            </div>

            {/* =================================================
                PERSON FOUND
                ================================================= */}

            {personFound && (
              <div
                className="
                  border-t
                  border-emerald-400/20
                  bg-emerald-400/[0.06]
                  p-7
                  text-center
                "
              >

                <div
                  className="
                    mx-auto
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-emerald-400/[0.10]
                  "
                >

                  <CheckCircle2
                    size={32}
                    className="
                      text-emerald-300
                    "
                  />

                </div>

                <h3
                  className="
                    mt-5
                    text-2xl
                    font-semibold
                    text-white
                  "
                >
                  PEOPLE ALIGNED
                </h3>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-xl
                    text-sm
                    leading-6
                    text-slate-400
                  "
                >
                  Both participants are within
                  the FINDX proximity threshold.
                  The proximity alarm can now guide
                  the final approach.
                </p>

              </div>
            )}

            {/* =================================================
                CONTROLS
                ================================================= */}

            <div
              className="
                border-t
                border-white/[0.07]
                p-5
              "
            >

              <div
                className="
                  grid
                  gap-3
                  sm:grid-cols-2
                "
              >

                <button
                  type="button"
                  onClick={
                    sharing
                      ? stopSharing
                      : startGps
                  }
                  disabled={
                    !connected
                  }
                  className="
                    flex
                    h-12
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

                  <Navigation
                    size={16}
                  />

                  {sharing
                    ? "Stop live location"
                    : "Enable live location"}

                </button>

                <button
                  type="button"
                  onClick={
                    startDemo
                  }
                  className="
                    flex
                    h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-violet-400/20
                    bg-violet-400/[0.05]
                    text-sm
                    font-semibold
                    text-violet-300
                    hover:bg-violet-400/[0.10]
                  "
                >

                  <Crosshair
                    size={16}
                  />

                  Judge demo

                </button>

              </div>

              {locationError && (
                <div
                  className="
                    mt-4
                    rounded-2xl
                    border
                    border-red-400/15
                    bg-red-400/[0.05]
                    p-4
                    text-xs
                    leading-5
                    text-red-300
                  "
                >
                  {locationError}
                </div>
              )}

              <div
                className="
                  mt-4
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
                  Live coordinates stay inside
                  the verified FINDX recovery
                  session. GPS sharing occurs only
                  after the user grants location
                  permission.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          ANIMATIONS
          ====================================================== */}

      <style>
        {`
          @keyframes findxRadarSpin {
            from {
              transform:
                translateX(-50%)
                translateY(-100%)
                rotate(0deg);
            }

            to {
              transform:
                translateX(-50%)
                translateY(-100%)
                rotate(360deg);
            }
          }

          @keyframes findxMarkerPulse {
            0%, 100% {
              transform:
                translate(-50%, -50%)
                scale(0.9);

              opacity: 0.15;
            }

            50% {
              transform:
                translate(-50%, -50%)
                scale(1.3);

              opacity: 0.30;
            }
          }
        `}
      </style>

    </section>
  )
}

// ============================================================
// RADAR RING
// ============================================================

function RadarRing({
  size,
}) {
  return (
    <div
      style={{
        position:
          "absolute",

        left:
          "50%",

        top:
          "50%",

        width:
          size,

        height:
          size,

        transform:
          "translate(-50%, -50%)",

        borderRadius:
          "50%",

        border:
          "1px solid rgba(16,185,129,.16)",
      }}
    />
  )
}

// ============================================================
// RADAR MARKER
// ============================================================

function RadarMarker({
  x,
  y,
  color,
  label,
  active,
}) {
  return (
    <div
      style={{
        position:
          "absolute",

        left:
          `${x}%`,

        top:
          `${y}%`,

        transform:
          "translate(-50%, -50%)",

        zIndex:
          40,

        transition:
          "left .5s ease, top .5s ease",
      }}
    >

      {/* PULSE */}

      <div
        style={{
          position:
            "absolute",

          left:
            "50%",

          top:
            "50%",

          width:
            "42px",

          height:
            "42px",

          transform:
            "translate(-50%, -50%)",

          borderRadius:
            "50%",

          background:
            color,

          opacity:
            active
              ? 0.18
              : 0.08,

          filter:
            "blur(2px)",

          animation:
            active
              ? "findxMarkerPulse 1.5s ease-in-out infinite"
              : "none",
        }}
      />

      {/* MARKER */}

      <div
        style={{
          position:
            "relative",

          width:
            "24px",

          height:
            "24px",

          borderRadius:
            "50%",

          background:
            color,

          border:
            "2px solid white",

          boxShadow:
            `0 0 22px ${color}, 0 0 45px ${color}`,
        }}
      />

      {/* LABEL */}

      <div
        style={{
          position:
            "absolute",

          left:
            "50%",

          top:
            "calc(100% + 8px)",

          transform:
            "translateX(-50%)",

          whiteSpace:
            "nowrap",

          padding:
            "5px 9px",

          borderRadius:
            "7px",

          background:
            "rgba(0,0,0,.82)",

          border:
            "1px solid rgba(255,255,255,.10)",

          color:
            "#ffffff",

          fontSize:
            "10px",

          fontWeight:
            700,
        }}
      >
        {label}
      </div>

    </div>
  )
}

// ============================================================
// LEGEND
// ============================================================

function Legend({
  color,
  title,
  active,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-white/[0.07]
        bg-white/[0.02]
        p-4
      "
    >

      <span
        style={{
          width:
            "14px",

          height:
            "14px",

          borderRadius:
            "50%",

          backgroundColor:
            color,

          boxShadow:
            `0 0 18px ${color}`,
        }}
      />

      <div>

        <p
          className="
            text-xs
            font-semibold
            text-white
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-[10px]
            text-slate-600
          "
        >
          {active
            ? "Live location"
            : "Waiting"}
        </p>

      </div>

    </div>
  )
}

// ============================================================
// STAT
// ============================================================

function Stat({
  label,
  value,
}) {
  return (
    <div
      className="
        bg-[#080c13]
        p-4
      "
    >

      <p
        className="
          text-[9px]
          uppercase
          tracking-[0.14em]
          text-slate-600
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          text-sm
          font-semibold
          text-slate-300
        "
      >
        {value}
      </p>

    </div>
  )
}

export default RadarMap