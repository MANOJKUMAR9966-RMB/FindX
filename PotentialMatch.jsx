import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  Bell,
  CheckCircle2,
  Clock3,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react"

import { io } from "socket.io-client"

const MATCH_API_URL = `${window.location.protocol}//${window.location.hostname}:5000/api/matches`

const MATCH_CONFIRMATION_API =
  "http://localhost:5000/api/match-confirmations"

const SOCKET_URL =
  "http://localhost:5000"

const POLL_INTERVAL = 5000

const STRONG_MATCH_SCORE = 70

const OWNER_ALERT_DURATION = 10000

function PotentialMatch({
  reportId,
  reportType = "lost",
  onMatchDetected,
  onReview,
  onFinderAccepted,
}) {
  // ==========================================================
  // STATE
  // ==========================================================

  const [
    lastChecked,
    setLastChecked,
  ] = useState(null)

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState("")

  const [
    appAlert,
    setAppAlert,
  ] = useState(null)

  const [
    finderOwnerAlert,
    setFinderOwnerAlert,
  ] = useState(null)

  const [
    finderSeconds,
    setFinderSeconds,
  ] = useState(10)

  const [
    finderDecision,
    setFinderDecision,
  ] = useState("")

  const [
    finderActionLoading,
    setFinderActionLoading,
  ] = useState(false)

  // ==========================================================
  // REFS
  // ==========================================================

  const seenMatchRef =
    useRef(new Set())

  const checkingRef =
    useRef(false)

  const socketRef =
    useRef(null)

  const finderTimerRef =
    useRef(null)

  const finderIntervalRef =
    useRef(null)

  // ==========================================================
  // ROLE
  // ==========================================================

  const isLost =
    reportType === "lost"

  const isFinder =
    reportType === "found"

  // ==========================================================
  // LOST PERSON ALERT
  // ==========================================================

  function showLostAlert(match) {
    const candidate =
      match?.candidate?.report

    const itemName =
      candidate?.itemName ||
      "your item"

    const score = Math.round(
      Number(
        match?.score ||
          match?.candidate?.score ||
          0
      )
    )

    setAppAlert({
      type: "lost-match",

      title:
        "Potential match found",

      message:
        `FINDX found a ${score}% matching found report for ${itemName}.`,

      score,

      itemName,

      match,
    })
  }

  // ==========================================================
  // FINDER OWNER ALERT
  // ==========================================================

  function showFinderOwnerAlert(payload) {
    if (!payload?.matchId) {
      return
    }

    console.log(
      "FINDX: FINDER RECEIVED ITEM OWNER FOUND:",
      payload
    )

    if (
      finderTimerRef.current
    ) {
      window.clearTimeout(
        finderTimerRef.current
      )

      finderTimerRef.current = null
    }

    if (
      finderIntervalRef.current
    ) {
      window.clearInterval(
        finderIntervalRef.current
      )

      finderIntervalRef.current = null
    }

    setFinderDecision("")
    setFinderSeconds(10)

    setFinderOwnerAlert(
      payload
    )

    let seconds = 10

    finderIntervalRef.current =
      window.setInterval(() => {
        seconds -= 1

        setFinderSeconds(
          Math.max(
            0,
            seconds
          )
        )

        if (seconds <= 0) {
          window.clearInterval(
            finderIntervalRef.current
          )

          finderIntervalRef.current =
            null
        }
      }, 1000)

    finderTimerRef.current =
      window.setTimeout(() => {
        setFinderSeconds(0)
      }, OWNER_ALERT_DURATION)
  }

  // ==========================================================
  // SOCKET.IO
  // ==========================================================

  useEffect(() => {
    if (!reportId) {
      return
    }

    const socket =
      io(SOCKET_URL, {
        transports: [
          "websocket",
          "polling",
        ],

        reconnection: true,
      })

    socketRef.current = socket

    socket.on(
      "connect",
      () => {
        console.log(
          "FINDX MATCH SOCKET CONNECTED:",
          socket.id
        )

        socket.emit(
          "report:watch",
          {
            reportId,
          }
        )

        socket.emit(
          "match:watch",
          {
            reportId,
          }
        )

        console.log(
          "FINDX: Watching report:",
          reportId
        )
      }
    )

    // ========================================================
    // OWNER FOUND
    // ========================================================

    socket.on(
      "match:owner-found",
      (payload) => {
        console.log(
          "FINDX: OWNER FOUND EVENT:",
          payload
        )

        if (!isFinder) {
          return
        }

        if (
          payload?.foundReportId &&
          String(
            payload.foundReportId
          ) !==
            String(reportId)
        ) {
          return
        }

        showFinderOwnerAlert(
          payload
        )
      }
    )

    // ========================================================
    // FINDER ACCEPTED
    //
    // IMPORTANT:
    // Forward this event to App.jsx.
    // ========================================================

    socket.on(
      "match:finder-accepted",
      (payload) => {
        console.log(
          "FINDX: FINDER ACCEPTED EVENT:",
          payload
        )

        setFinderDecision(
          "accepted"
        )

        if (
          typeof onFinderAccepted ===
          "function"
        ) {
          onFinderAccepted(
            payload
          )
        }
      }
    )

    // ========================================================
    // FINDER DECLINED
    // ========================================================

    socket.on(
      "match:finder-declined",
      (payload) => {
        console.log(
          "FINDX: FINDER DECLINED EVENT:",
          payload
        )

        setFinderDecision(
          "declined"
        )

        window.setTimeout(() => {
          setFinderOwnerAlert(
            null
          )
        }, 800)
      }
    )

    return () => {
      socket.disconnect()

      socketRef.current =
        null

      if (
        finderTimerRef.current
      ) {
        window.clearTimeout(
          finderTimerRef.current
        )
      }

      if (
        finderIntervalRef.current
      ) {
        window.clearInterval(
          finderIntervalRef.current
        )
      }
    }
  }, [
    reportId,
    reportType,
    onFinderAccepted,
  ])

  // ==========================================================
  // ACCEPT OWNER REQUEST
  // ==========================================================

  async function acceptOwnerRequest() {
    if (
      !finderOwnerAlert?.matchId ||
      finderActionLoading
    ) {
      return
    }

    try {
      setFinderActionLoading(
        true
      )

      setError("")

      const response =
        await fetch(
          `${MATCH_CONFIRMATION_API}/${encodeURIComponent(
            finderOwnerAlert.matchId
          )}/accept`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },
          }
        )

      const data =
        await response.json()

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            "Unable to accept the owner request."
        )
      }

      console.log(
        "FINDX: OWNER REQUEST ACCEPTED:",
        data
      )

      setFinderDecision(
        "accepted"
      )

      // ======================================================
      // IMMEDIATELY TELL APP.JSX
      //
      // Don't wait for another socket round-trip.
      // ======================================================

      if (
        typeof onFinderAccepted ===
        "function"
      ) {
        onFinderAccepted({
          ...data.match,

          matchId:
            data?.match?.matchId ||
            finderOwnerAlert.matchId,

          lostReportId:
            data?.match?.lostReportId ||
            finderOwnerAlert.lostReportId,

          foundReportId:
            data?.match?.foundReportId ||
            finderOwnerAlert.foundReportId,

          acceptedByFinder:
            true,
        })
      }
    } catch (err) {
      console.error(
        "FINDX: Accept failed:",
        err
      )

      setError(
        err.message ||
          "Unable to accept the owner request."
      )
    } finally {
      setFinderActionLoading(
        false
      )
    }
  }

  // ==========================================================
  // DECLINE OWNER REQUEST
  // ==========================================================

  async function declineOwnerRequest() {
    if (
      !finderOwnerAlert?.matchId ||
      finderActionLoading
    ) {
      return
    }

    try {
      setFinderActionLoading(
        true
      )

      setError("")

      const response =
        await fetch(
          `${MATCH_CONFIRMATION_API}/${encodeURIComponent(
            finderOwnerAlert.matchId
          )}/decline`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },
          }
        )

      const data =
        await response.json()

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            "Unable to decline the owner request."
        )
      }

      console.log(
        "FINDX: OWNER REQUEST DECLINED:",
        data
      )

      setFinderDecision(
        "declined"
      )

      window.setTimeout(() => {
        setFinderOwnerAlert(
          null
        )
      }, 800)
    } catch (err) {
      console.error(
        "FINDX: Decline failed:",
        err
      )

      setError(
        err.message ||
          "Unable to decline the owner request."
      )
    } finally {
      setFinderActionLoading(
        false
      )
    }
  }

  // ==========================================================
  // MATCH POLLING
  // ==========================================================

  async function checkMatches() {
    if (
      !reportId ||
      checkingRef.current
    ) {
      return
    }

    checkingRef.current =
      true

    try {
      setLoading(true)
      setError("")

      const response =
        await fetch(
          `${MATCH_API_URL}/${encodeURIComponent(
            reportId
          )}`,
          {
            cache: "no-store",
          }
        )

      let data

      try {
        data =
          await response.json()
      } catch {
        throw new Error(
          "Matcher returned an invalid response."
        )
      }

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            "Unable to check matches."
        )
      }

      setLastChecked(
        new Date()
      )

      const strongMatches =
        Array.isArray(
          data.matches
        )
          ? data.matches.filter(
              (candidate) =>
                Number(
                  candidate?.score
                ) >=
                STRONG_MATCH_SCORE
            )
          : []

      if (
        strongMatches.length === 0
      ) {
        return
      }

      const bestMatch =
        strongMatches[0]

      const candidateId =
        bestMatch?.report?.id ||
        bestMatch?.report?._id ||
        null

      if (!candidateId) {
        return
      }

      const matchKey =
        `${reportId}:${candidateId}`

      if (
        seenMatchRef.current.has(
          matchKey
        )
      ) {
        return
      }

      seenMatchRef.current.add(
        matchKey
      )

      const detectedMatch = {
        sourceReport:
          data.sourceReport ||
          null,

        candidate:
          bestMatch,

        score:
          Number(
            bestMatch?.score ||
              0
          ),

        signals:
          bestMatch?.signals ||
          {},

        matchReason:
          bestMatch?.matchReason ||
          "",

        itemFamily:
          bestMatch?.itemFamily ||
          null,

        reportType,
      }

      // ========================================================
      // LOST
      // ========================================================

      if (isLost) {
        console.log(
          "FINDX: LOST MATCH DETECTED:",
          detectedMatch
        )

        showLostAlert(
          detectedMatch
        )

        if (
          typeof onMatchDetected ===
          "function"
        ) {
          onMatchDetected(
            detectedMatch
          )
        }

        return
      }

      // ========================================================
      // FINDER
      // ========================================================

      console.log(
        "FINDX: FINDER MATCH EXISTS. WAITING FOR OWNER VERIFICATION."
      )
    } catch (err) {
      console.error(
        "FINDX: Match polling failed:",
        err
      )

      setError(
        err.message ||
          "Unable to check matches."
      )
    } finally {
      checkingRef.current =
        false

      setLoading(false)
    }
  }

  // ==========================================================
  // START POLLING
  // ==========================================================

  useEffect(() => {
    if (!reportId) {
      return
    }

    seenMatchRef.current =
      new Set()

    setAppAlert(null)
    setFinderOwnerAlert(null)
    setLastChecked(null)
    setError("")

    checkMatches()

    const interval =
      window.setInterval(
        checkMatches,
        POLL_INTERVAL
      )

    return () => {
      window.clearInterval(
        interval
      )
    }
  }, [
    reportId,
    reportType,
  ])

  // ==========================================================
  // REQUIRED REPORT
  // ==========================================================

  if (!reportId) {
    return null
  }

  // ==========================================================
  // FINDER OWNER ALERT
  // ==========================================================

  if (
    isFinder &&
    finderOwnerAlert
  ) {
    return (
      <>
        <FinderOwnerAlert
          alert={
            finderOwnerAlert
          }
          seconds={
            finderSeconds
          }
          decision={
            finderDecision
          }
          loading={
            finderActionLoading
          }
          onAccept={
            acceptOwnerRequest
          }
          onDecline={
            declineOwnerRequest
          }
          error={
            error
          }
        />

        <FinderWaiting
          reportId={
            reportId
          }
          lastChecked={
            lastChecked
          }
        />
      </>
    )
  }

  // ==========================================================
  // LOST ALERT
  // ==========================================================

  if (
    isLost &&
    appAlert
  ) {
    return (
      <>
        <FindxAlert
          alert={
            appAlert
          }
          onOpen={() => {
            setAppAlert(null)

            onReview?.(
              appAlert.match
            )
          }}
          onClose={() =>
            setAppAlert(null)
          }
        />

        <LostWaiting
          reportId={
            reportId
          }
          lastChecked={
            lastChecked
          }
        />
      </>
    )
  }

  // ==========================================================
  // FINDER WAITING
  // ==========================================================

  if (isFinder) {
    return (
      <FinderWaiting
        reportId={
          reportId
        }
        lastChecked={
          lastChecked
        }
      />
    )
  }

  // ==========================================================
  // LOST WAITING
  // ==========================================================

  return (
    <LostWaiting
      reportId={
        reportId
      }
      lastChecked={
        lastChecked
      }
      loading={
        loading
      }
      error={
        error
      }
    />
  )
}


// ============================================================
// LOST ALERT
// ============================================================

function FindxAlert({
  alert,
  onOpen,
  onClose,
}) {
  return (
    <div
      className="
        fixed
        right-4
        top-4
        z-[9999]
        w-[min(92vw,410px)]
      "
    >
      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          border-blue-400/[0.18]
          bg-[#06101c]/95
          shadow-[0_25px_90px_rgba(37,99,235,0.20)]
          backdrop-blur-2xl
        "
      >
        <div
          className="
            h-1
            bg-gradient-to-r
            from-blue-500
            via-cyan-400
            to-emerald-400
          "
        />

        <div className="p-5">

          <div
            className="
              flex
              items-start
              justify-between
              gap-3
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
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-blue-400/[0.10]
                "
              >
                <Bell
                  size={22}
                  className="
                    text-blue-300
                  "
                />
              </div>

              <div>

                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-blue-300
                  "
                >
                  FINDX ALERT
                </p>

                <h3
                  className="
                    mt-1
                    text-base
                    font-semibold
                    text-white
                  "
                >
                  {alert.title}
                </h3>

              </div>

            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                text-slate-600
                hover:bg-white/[0.05]
                hover:text-white
              "
            >
              <X size={14} />
            </button>

          </div>

          <p
            className="
              mt-4
              text-xs
              leading-5
              text-slate-400
            "
          >
            {alert.message}
          </p>

          <div
            className="
              mt-4
              flex
              items-center
              justify-between
              rounded-2xl
              border
              border-white/[0.06]
              bg-white/[0.025]
              p-4
            "
          >

            <div>

              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.13em]
                  text-slate-600
                "
              >
                Matching item
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {alert.itemName}
              </p>

            </div>

            <div className="text-right">

              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.13em]
                  text-slate-600
                "
              >
                Confidence
              </p>

              <p
                className="
                  mt-1
                  text-xl
                  font-semibold
                  text-emerald-300
                "
              >
                {alert.score}%
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={
              onOpen
            }
            className="
              mt-4
              flex
              h-12
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-blue-500
              text-sm
              font-semibold
              text-white
              hover:bg-blue-400
            "
          >
            Review potential match
            <ChevronRight size={16} />
          </button>

          <div
            className="
              mt-3
              flex
              items-start
              gap-2.5
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
                leading-5
                text-slate-600
              "
            >
              Potential match only. Ownership
              verification is still required.
            </p>

          </div>

        </div>
      </div>
    </div>
  )
}


// ============================================================
// FINDER OWNER ALERT
// ============================================================

function FinderOwnerAlert({
  alert,
  seconds,
  decision,
  loading,
  onAccept,
  onDecline,
  error,
}) {
  return (
    <div
      className="
        fixed
        right-4
        top-4
        z-[9999]
        w-[min(92vw,430px)]
      "
    >

      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          border-emerald-400/[0.18]
          bg-[#06130f]/95
          shadow-[0_25px_90px_rgba(16,185,129,0.20)]
          backdrop-blur-2xl
        "
      >

        <div
          className="
            h-1
            bg-gradient-to-r
            from-emerald-400
            via-cyan-400
            to-blue-400
          "
        />

        <div className="p-5">

          <div
            className="
              flex
              items-start
              gap-3
            "
          >

            <div
              className="
                relative
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-emerald-400/[0.10]
              "
            >

              <UserCheck
                size={22}
                className="
                  text-emerald-300
                "
              />

              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  h-3
                  w-3
                  animate-ping
                  rounded-full
                  bg-emerald-400
                "
              />

            </div>

            <div>

              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-emerald-300
                "
              >
                FINDX OWNER ALERT
              </p>

              <h3
                className="
                  mt-1
                  text-xl
                  font-semibold
                  text-white
                "
              >
                ITEM OWNER FOUND
              </h3>

              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-slate-400
                "
              >
                A person has passed the FINDX
                ownership check for your found item.
              </p>

            </div>

          </div>

          <div
            className="
              mt-4
              rounded-2xl
              border
              border-white/[0.06]
              bg-white/[0.025]
              p-4
            "
          >

            <p
              className="
                text-[9px]
                uppercase
                tracking-[0.13em]
                text-slate-600
              "
            >
              Found item
            </p>

            <p
              className="
                mt-1
                text-sm
                font-semibold
                text-white
              "
            >
              {alert.itemName ||
                "Found item"}
            </p>

          </div>

          {decision ===
          "accepted" ? (
            <div
              className="
                mt-4
                rounded-2xl
                border
                border-emerald-400/[0.12]
                bg-emerald-400/[0.04]
                p-5
                text-center
              "
            >

              <CheckCircle2
                size={25}
                className="
                  mx-auto
                  text-emerald-300
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  font-semibold
                  text-white
                "
              >
                Chat request accepted
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  text-slate-500
                "
              >
                Communication can now be unlocked.
              </p>

            </div>
          ) : (
            <>
              <div
                className="
                  mt-4
                  rounded-2xl
                  border
                  border-emerald-400/[0.08]
                  bg-emerald-400/[0.025]
                  p-4
                  text-center
                "
              >

                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.14em]
                    text-emerald-300
                  "
                >
                  OWNER REQUEST ACTIVE
                </p>

                <p
                  className="
                    mt-1
                    text-3xl
                    font-semibold
                    text-white
                  "
                >
                  {seconds}s
                </p>

                <div
                  className="
                    mx-auto
                    mt-3
                    h-1.5
                    max-w-xs
                    overflow-hidden
                    rounded-full
                    bg-white/[0.06]
                  "
                >

                  <div
                    className="
                      h-full
                      rounded-full
                      bg-emerald-400
                      transition-all
                      duration-1000
                    "
                    style={{
                      width:
                        `${seconds * 10}%`,
                    }}
                  />

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

                <button
                  type="button"
                  onClick={
                    onAccept
                  }
                  disabled={
                    loading
                  }
                  className="
                    flex
                    h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-emerald-500
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-emerald-400
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  <CheckCircle2
                    size={16}
                  />

                  Accept chat

                </button>

                <button
                  type="button"
                  onClick={
                    onDecline
                  }
                  disabled={
                    loading
                  }
                  className="
                    flex
                    h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    border
                    border-white/[0.08]
                    bg-white/[0.02]
                    text-sm
                    font-medium
                    text-slate-400
                    hover:text-white
                    disabled:opacity-50
                  "
                >

                  <X size={16} />

                  Decline

                </button>

              </div>
            </>
          )}

          {error && (
            <div
              className="
                mt-3
                rounded-xl
                border
                border-red-400/[0.10]
                bg-red-400/[0.03]
                p-3
                text-[10px]
                text-red-300
              "
            >
              {error}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}


// ============================================================
// LOST WAITING
// ============================================================

function LostWaiting({
  reportId,
  lastChecked,
  loading,
  error,
}) {
  return (
    <section
      id="matching-stage"
      className="relative py-8"
    >

      <div className="findx-container">

        <div
          className="
            mx-auto
            max-w-3xl
            rounded-2xl
            border
            border-white/[0.06]
            bg-white/[0.02]
            px-4
            py-4
            sm:px-5
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
                  relative
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-400/[0.07]
                "
              >

                <Sparkles
                  size={15}
                  className="text-blue-300"
                />

                <span
                  className="
                    absolute
                    right-1
                    top-1
                    h-2
                    w-2
                    animate-pulse
                    rounded-full
                    bg-blue-400
                  "
                />

              </div>

              <div>

                <p
                  className="
                    text-xs
                    font-medium
                    text-slate-300
                  "
                >
                  FINDX is watching for a match
                </p>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    leading-5
                    text-slate-600
                  "
                >
                  A strong match will appear as a
                  FINDX alert inside the app.
                </p>

              </div>

            </div>

            {loading && (
              <span
                className="
                  hidden
                  text-[9px]
                  text-slate-700
                  sm:block
                "
              >
                Checking...
              </span>
            )}

          </div>

          {lastChecked && (
            <div
              className="
                mt-2
                flex
                items-center
                justify-end
                gap-1.5
                text-[9px]
                text-slate-700
              "
            >

              <Clock3 size={10} />

              Last checked{" "}
              {lastChecked.toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}

            </div>
          )}

          {error && (
            <div
              className="
                mt-3
                rounded-xl
                border
                border-red-400/[0.10]
                bg-red-400/[0.03]
                px-3
                py-2.5
                text-[10px]
                text-red-300
              "
            >
              {error}
            </div>
          )}

        </div>

      </div>

    </section>
  )
}


// ============================================================
// FINDER WAITING
// ============================================================

function FinderWaiting({
  reportId,
  lastChecked,
}) {
  return (
    <section
      id="matching-stage"
      className="relative py-8"
    >

      <div className="findx-container">

        <div
          className="
            mx-auto
            max-w-3xl
            rounded-2xl
            border
            border-emerald-400/[0.08]
            bg-emerald-400/[0.02]
            px-4
            py-4
            sm:px-5
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
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-400/[0.08]
                "
              >

                <Bell
                  size={17}
                  className="text-emerald-300"
                />

              </div>

              <div>

                <p
                  className="
                    text-xs
                    font-medium
                    text-slate-300
                  "
                >
                  FINDX is watching
                </p>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    leading-5
                    text-slate-600
                  "
                >
                  No action needed. FINDX will alert
                  you only after an owner passes verification.
                </p>

              </div>

            </div>

            <div
              className="
                hidden
                items-center
                gap-2
                sm:flex
              "
            >

              <span
                className="
                  h-2
                  w-2
                  animate-pulse
                  rounded-full
                  bg-emerald-400
                "
              />

              <span
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.12em]
                  text-emerald-300
                "
              >
                Waiting
              </span>

            </div>

          </div>

          {lastChecked && (
            <div
              className="
                mt-2
                text-right
                text-[9px]
                text-slate-700
              "
            >
              Last checked{" "}
              {lastChecked.toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </div>
          )}

        </div>

      </div>

    </section>
  )
}

export default PotentialMatch
