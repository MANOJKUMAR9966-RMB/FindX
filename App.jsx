import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  FileSearch,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { io } from "socket.io-client"

import Login from "./components/auth/Login"
import FindXSplash from "./components/auth/FindXSplash"
import Hero from "./components/hero/Hero"
import ReportForm from "./components/report/ReportForm"
import PotentialMatch from "./components/matches/PotentialMatch"
import MatchReview from "./components/matches/MatchReview"
import History from "./components/history/History"
import Profile from "./components/profile/Profile"
import EditProfile from "./components/profile/EditProfile"
import ChangePassword from "./components/profile/ChangePassword"

import OwnershipVerification from "./components/verifications/OwnershipVerification"
import VerificationReview from "./components/verifications/VerificationReview"

import RecoveryHandover from "./components/recovery/RecoveryHandover"
import RecoveryChat from "./components/recovery/RecoveryChat"
import RadarMap from "./components/recovery/RadarMap"

import QrEntry from "./components/qr/QrEntry"

const BACKEND_BASE = "https://llc-lip-advert-wife.trycloudflare.com"

const MATCH_CONFIRMATION_API = `${BACKEND_BASE}/api/match-confirmations`
const SOCKET_URL = BACKEND_BASE

const VERIFICATION_KEY = "findx:pending-verification"
const RECOVERY_KEY = "findx:active-recovery"

function App() {
  const params = new URLSearchParams(window.location.search)

  const currentPath = window.location.pathname.toLowerCase()
  const isQrEntry = currentPath === "/qr"
  const urlRole = params.get("role")

  const isFinderPath =
    currentPath === "/found" || currentPath === "/finder"
  const isLostPath = currentPath === "/lost"

  const sessionRole =
    urlRole === "finder" ||
    urlRole === "found" ||
    isFinderPath
      ? "finder"
      : "lost"

  const isFinder = sessionRole === "finder"
  const isLost = sessionRole === "lost"

  const [flowStage, setFlowStage] = useState(
    isQrEntry
      ? urlRole === "lost" ||
        urlRole === "finder" ||
        urlRole === "found"
        ? "report"
        : "qr-entry"
      : isFinderPath || isLostPath
        ? "report"
        : "splash"
  )

  const [activeReport, setActiveReport] = useState(null)
  const [pendingMatch, setPendingMatch] = useState(null)
  const [confirmedMatch, setConfirmedMatch] = useState(null)
  const [submittedVerification, setSubmittedVerification] = useState(null)
  const [recoveryApproved, setRecoveryApproved] = useState(false)
  const [finderAccepted, setFinderAccepted] = useState(false)
  const [recovery, setRecovery] = useState(null)
  const [missionSuccessful, setMissionSuccessful] = useState(false)
  const [error, setError] = useState("")

  const socketRef = useRef(null)
  const pendingSocketEventsRef = useRef([])

  function emitSocketEvent(event, payload) {
    const socket = socketRef.current
    if (socket?.connected) {
      socket.emit(event, payload)
      return
    }
    pendingSocketEventsRef.current.push({ event, payload })
  }

  function flushPendingSocketEvents(socket) {
    if (!socket?.connected) return
    const pending = pendingSocketEventsRef.current
    pendingSocketEventsRef.current = []
    pending.forEach(({ event, payload }) => {
      socket.emit(event, payload)
    })
  }

  function goToStage(stage) {
    if (isLost && stage === "verification-review") {
      stage = finderAccepted ? "waiting-recovery" : "waiting-finder"
    }

    if (isLost && stage === "recovery-handover") {
      stage = "waiting-recovery"
    }

    setFlowStage(stage)
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 80)
  }

  useEffect(() => {
    if (flowStage !== "splash") return
    const timer = window.setTimeout(() => {
      setFlowStage("login")
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [flowStage])

  useEffect(() => {
    function handleHeroSelection(event) {
      const type = event.detail?.type
      if (type !== "lost" && type !== "found") return

      setActiveReport(null)
      setPendingMatch(null)
      setConfirmedMatch(null)
      setSubmittedVerification(null)
      setRecoveryApproved(false)
      setFinderAccepted(false)
      setRecovery(null)
      setMissionSuccessful(false)
      setError("")

      setFlowStage("report")
      window.setTimeout(() => {
        document.getElementById("report")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 100)
    }

    window.addEventListener("findx:select-report-type", handleHeroSelection)
    return () => window.removeEventListener("findx:select-report-type", handleHeroSelection)
  }, [])

  function handleReportCreated(reportData) {
    const resolvedId =
      reportData?.reportId || reportData?.id || reportData?._id

    if (!resolvedId) {
      setError("FINDX could not read the report ID.")
      return
    }

    const normalizedReport = {
      reportId: resolvedId,
      type: reportData.type === "found" ? "found" : "lost",
      report: reportData.report || reportData,
    }

    setActiveReport(normalizedReport)
    setPendingMatch(null)
    setConfirmedMatch(null)
    setSubmittedVerification(null)
    setRecoveryApproved(false)
    setFinderAccepted(false)
    setRecovery(null)
    setMissionSuccessful(false)
    setError("")
    setFlowStage("matching")
  }

  function handlePotentialMatch(match) {
    if (!isLost) return
    setPendingMatch(match)
  }

  function handleMatchReview(match) {
    if (!isLost) return
    setPendingMatch(match)
    goToStage("review")
  }

  async function handleMatchConfirmed(match) {
    if (!isLost || !match) return

    const sourceType = match?.sourceReport?.type
    const candidateType = match?.candidate?.report?.type

    const lostReportId =
      sourceType === "lost"
        ? match?.sourceReport?.id || match?.sourceReport?._id
        : candidateType === "lost"
          ? match?.candidate?.report?.id || match?.candidate?.report?._id
          : null

    const foundReportId =
      sourceType === "found"
        ? match?.sourceReport?.id || match?.sourceReport?._id
        : candidateType === "found"
          ? match?.candidate?.report?.id || match?.candidate?.report?._id
          : null

    if (!lostReportId || !foundReportId) {
      setError("FINDX could not identify both reports.")
      return
    }

    try {
      const response = await fetch(MATCH_CONFIRMATION_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lostReportId,
          foundReportId,
          score: Number(match?.score || match?.candidate?.score || 0),
          signals: match?.signals || match?.candidate?.signals || {},
        }),
      })

      const data = await response.json()
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to confirm the match.")
      }

      const backendMatch = data?.match || {}
      const normalizedMatch = {
        ...backendMatch,
        matchId:
          backendMatch?.matchId ||
          backendMatch?.id ||
          backendMatch?._id ||
          null,
        lostReportId: backendMatch?.lostReportId || lostReportId,
        foundReportId: backendMatch?.foundReportId || foundReportId,
      }

      if (!normalizedMatch.matchId) {
        throw new Error("Match confirmation returned no match ID.")
      }

      setConfirmedMatch(normalizedMatch)
      setPendingMatch(null)
      setActiveReport(null)
      goToStage("verification")
    } catch (confirmationError) {
      setError(confirmationError.message || "Unable to confirm the match.")
    }
  }

  function handleVerificationSubmitted(verification) {
    const completeVerification = {
      ...verification,
      matchId: verification?.matchId || confirmedMatch?.matchId || null,
      lostReportId:
        verification?.lostReportId || confirmedMatch?.lostReportId || null,
      foundReportId:
        verification?.foundReportId || confirmedMatch?.foundReportId || null,
    }

    setSubmittedVerification(completeVerification)

    if (isLost) {
      try {
        window.localStorage.setItem(
          VERIFICATION_KEY,
          JSON.stringify(completeVerification)
        )
      } catch {
        // Ignore local storage error
      }
      emitSocketEvent("verification:submitted", completeVerification)
      setRecoveryApproved(false)
      setFinderAccepted(false)
      goToStage("waiting-finder")
      return
    }

    if (isFinder) {
      goToStage("verification-review")
    }
  }

  function handleVerificationStatusChange(verification) {
    const updatedVerification = {
      ...submittedVerification,
      ...verification,
      matchId:
        verification?.matchId ||
        submittedVerification?.matchId ||
        confirmedMatch?.matchId ||
        null,
      lostReportId:
        verification?.lostReportId ||
        submittedVerification?.lostReportId ||
        confirmedMatch?.lostReportId ||
        null,
      foundReportId:
        verification?.foundReportId ||
        submittedVerification?.foundReportId ||
        confirmedMatch?.foundReportId ||
        null,
    }

    setSubmittedVerification(updatedVerification)

    try {
      window.localStorage.setItem(
        VERIFICATION_KEY,
        JSON.stringify(updatedVerification)
      )
    } catch {
      // Ignore local storage error
    }

    if (isFinder) {
      emitSocketEvent("verification:status", updatedVerification)
    }

    if (isFinder && updatedVerification.status === "approved") {
      setRecoveryApproved(true)
      setFinderAccepted(true)
      goToStage("recovery-handover")
      return
    }

    if (isFinder && updatedVerification.status === "rejected") {
      setRecoveryApproved(false)
      setFinderAccepted(false)
      return
    }

    if (isLost && updatedVerification.status === "approved") {
      setRecoveryApproved(true)
      setFinderAccepted(true)
      goToStage("waiting-recovery")
      return
    }

    if (isLost && updatedVerification.status === "rejected") {
      setRecoveryApproved(false)
      setFinderAccepted(false)
      setRecovery(null)
      goToStage("matching")
    }
  }

  function handleRecoveryCreated(createdRecovery) {
    if (!isFinder) return
    if (!createdRecovery?.recoveryId) {
      setError("Recovery ID was not returned.")
      return
    }

    const normalizedRecovery = {
      ...createdRecovery,
      matchId: createdRecovery.matchId || confirmedMatch?.matchId || null,
      lostReportId:
        createdRecovery.lostReportId ||
        submittedVerification?.lostReportId ||
        confirmedMatch?.lostReportId ||
        null,
      foundReportId:
        createdRecovery.foundReportId ||
        submittedVerification?.foundReportId ||
        confirmedMatch?.foundReportId ||
        null,
    }

    setRecovery(normalizedRecovery)
    setRecoveryApproved(true)
    setFinderAccepted(true)

    try {
      window.localStorage.setItem(
        RECOVERY_KEY,
        JSON.stringify(normalizedRecovery)
      )
    } catch {
      // Ignore local storage error
    }

    goToStage("recovery")
  }

  function handleMissionSuccessful() {
    setMissionSuccessful(true)
    goToStage("success")
  }

  useEffect(() => {
    function handleStorage(event) {
      if (event.key === VERIFICATION_KEY && event.newValue && isFinder) {
        try {
          const verification = JSON.parse(event.newValue)
          if (!verification?.verificationId) return
          if (
            activeReport?.reportId &&
            verification.foundReportId &&
            String(verification.foundReportId) !== String(activeReport.reportId)
          ) {
            return
          }
          setSubmittedVerification(verification)
          setConfirmedMatch({
            matchId: verification.matchId || null,
            lostReportId: verification.lostReportId || null,
            foundReportId: verification.foundReportId || null,
          })
          goToStage("verification-review")
        } catch {
          // Ignore parse errors
        }
      }

      if (event.key === VERIFICATION_KEY && event.newValue && isLost) {
        try {
          const verification = JSON.parse(event.newValue)
          if (
            verification?.status !== "approved" &&
            verification?.status !== "rejected"
          ) {
            return
          }
          if (
            confirmedMatch?.lostReportId &&
            verification.lostReportId &&
            String(confirmedMatch.lostReportId) !== String(verification.lostReportId)
          ) {
            return
          }
          handleVerificationStatusChange(verification)
        } catch {
          // Ignore parse errors
        }
      }

      if (event.key === RECOVERY_KEY && event.newValue) {
        try {
          const incomingRecovery = JSON.parse(event.newValue)
          if (!incomingRecovery?.recoveryId) return
          if (
            confirmedMatch?.matchId &&
            incomingRecovery?.matchId &&
            String(confirmedMatch.matchId) !== String(incomingRecovery.matchId)
          ) {
            return
          }
          setRecovery(incomingRecovery)
          setRecoveryApproved(true)
          setFinderAccepted(true)
          goToStage("recovery")
        } catch {
          // Ignore parse errors
        }
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [
    isFinder,
    isLost,
    activeReport?.reportId,
    confirmedMatch?.lostReportId,
    confirmedMatch?.matchId,
  ])

  useEffect(() => {
    const reportId =
      activeReport?.reportId ||
      confirmedMatch?.lostReportId ||
      confirmedMatch?.foundReportId

    if (!reportId) return

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      flushPendingSocketEvents(socket)
      socket.emit("report:watch", { reportId })
      if (confirmedMatch?.lostReportId && confirmedMatch?.foundReportId) {
        socket.emit("match:pair-watch", {
          lostReportId: confirmedMatch.lostReportId,
          foundReportId: confirmedMatch.foundReportId,
        })
      }
    })

    socket.on("verification:submitted", (payload) => {
      if (!isFinder || !payload?.verificationId) return
      if (
        activeReport?.reportId &&
        payload?.foundReportId &&
        String(payload.foundReportId) !== String(activeReport.reportId)
      ) {
        return
      }

      setSubmittedVerification(payload)
      setConfirmedMatch({
        matchId: payload.matchId || null,
        lostReportId: payload.lostReportId || null,
        foundReportId: payload.foundReportId || null,
      })
      setRecoveryApproved(false)
      setFinderAccepted(false)
      setError("")
      goToStage("verification-review")
    })

    socket.on("verification:status", (payload) => {
      if (!isLost) return
      if (
        payload?.lostReportId &&
        confirmedMatch?.lostReportId &&
        String(payload.lostReportId) !== String(confirmedMatch.lostReportId)
      ) {
        return
      }
      if (payload?.status !== "approved" && payload?.status !== "rejected") {
        return
      }
      handleVerificationStatusChange(payload)
    })

    socket.on("recovery:created", (payload) => {
      if (!payload?.recoveryId) return
      setRecovery(payload)
      setRecoveryApproved(true)
      setFinderAccepted(true)
      try {
        window.localStorage.setItem(RECOVERY_KEY, JSON.stringify(payload))
      } catch {
        // Ignore local storage error
      }
      goToStage("recovery")
    })

    return () => {
      socket.disconnect()
      if (socketRef.current === socket) {
        socketRef.current = null
      }
    }
  }, [
    activeReport?.reportId,
    confirmedMatch?.lostReportId,
    confirmedMatch?.foundReportId,
  ])

  const stages = [
    { id: "report", icon: FileSearch },
    { id: "matching", icon: Sparkles },
    { id: "verification", icon: ShieldCheck },
    { id: "recovery", icon: Radar },
    { id: "success", icon: CheckCircle2 },
  ]

  if (flowStage === "qr-entry") {
    return <QrEntry />
  }

  return (
    <main className="findx-noise min-h-screen overflow-x-hidden">
      <div className="findx-grid pointer-events-none fixed inset-0 -z-10" />
      <div className="findx-ambient pointer-events-none fixed -left-40 -top-40 -z-10" />

      {error && (
        <div className="fixed right-4 top-20 z-[9999] w-[min(92vw,420px)]">
          <div className="flex items-start gap-3 rounded-2xl border border-red-400/[0.14] bg-[#16090c]/95 p-4 backdrop-blur-xl">
            <AlertTriangle size={17} className="mt-0.5 shrink-0 text-red-300" />
            <p className="text-xs leading-5 text-red-300">{error}</p>
          </div>
        </div>
      )}

      {flowStage !== "hero" &&
        flowStage !== "profile" &&
        flowStage !== "edit-profile" &&
        flowStage !== "change-password" &&
        flowStage !== "history" &&
        flowStage !== "login" &&
        flowStage !== "splash" && (
          <div className="sticky top-0 z-[100] border-b border-white/[0.06] bg-[#020617]/90 backdrop-blur-2xl">
            <div className="findx-container">
              <div className="flex h-16 items-center justify-between">
                <span
                  onClick={() => setFlowStage("hero")}
                  className="cursor-pointer text-xs font-bold tracking-[0.16em] text-white hover:text-cyan-300 transition"
                >
                  FINDX
                </span>

                <div className="flex items-center gap-2">
                  {stages.map((stage) => {
                    const Icon = stage.icon
                    const active = flowStage === stage.id
                    const completed =
                      (stage.id === "report" &&
                        [
                          "matching",
                          "review",
                          "verification",
                          "verification-review",
                          "waiting-finder",
                          "waiting-recovery",
                          "recovery-handover",
                          "recovery",
                          "success",
                        ].includes(flowStage)) ||
                      (stage.id === "matching" &&
                        [
                          "review",
                          "verification",
                          "verification-review",
                          "waiting-finder",
                          "waiting-recovery",
                          "recovery-handover",
                          "recovery",
                          "success",
                        ].includes(flowStage)) ||
                      (stage.id === "verification" &&
                        [
                          "waiting-finder",
                          "waiting-recovery",
                          "recovery-handover",
                          "recovery",
                          "success",
                        ].includes(flowStage)) ||
                      (stage.id === "recovery" && ["success"].includes(flowStage))

                    return (
                      <div
                        key={stage.id}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                          completed
                            ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300"
                            : active
                              ? "border-blue-400/25 bg-blue-400/[0.08] text-blue-300"
                              : "border-white/[0.06] bg-white/[0.02] text-slate-700"
                        }`}
                      >
                        {completed ? <CheckCircle2 size={13} /> : <Icon size={13} />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      {flowStage === "login" && (
        <Login
          onLogin={() => {
            setError("")
            setFlowStage("hero")
            window.setTimeout(() => {
              window.scrollTo({ top: 0, behavior: "smooth" })
            }, 80)
          }}
        />
      )}

      {flowStage === "splash" && <FindXSplash />}

      {flowStage === "hero" && (
        <Hero
          onNavigate={(stage) => setFlowStage(stage)}
          onSelectReport={(report) => {
            handleReportCreated({
              reportId: report.id || report._id,
              type: report.type,
              report,
            })
          }}
        />
      )}

      {flowStage === "profile" && (
        <Profile
          onNavigate={(stage) => setFlowStage(stage)}
          onLogout={() => {
            setFlowStage("login")
          }}
        />
      )}

      {flowStage === "edit-profile" && (
        <EditProfile
          onBack={() => setFlowStage("profile")}
          onSaveSuccess={() => setFlowStage("profile")}
        />
      )}

      {flowStage === "change-password" && (
        <ChangePassword
          onBack={() => setFlowStage("profile")}
          onSuccess={() => setFlowStage("profile")}
        />
      )}

      {flowStage === "history" && (
        <History
          onBack={() => setFlowStage("hero")}
          onNavigate={(stage) => setFlowStage(stage)}
          onSelectReport={(report) => {
            handleReportCreated({
              reportId: report.id || report._id,
              type: report.type,
              report,
            })
          }}
        />
      )}

      {flowStage === "report" && (
        <ReportForm onReportCreated={handleReportCreated} />
      )}

      {flowStage === "matching" &&
        (activeReport?.reportId ? (
          <div id="matching-stage" className="py-6">
            {isLost ? (
              <PotentialMatch
                reportId={activeReport.reportId}
                reportType="lost"
                onMatchDetected={handlePotentialMatch}
                onReview={handleMatchReview}
              />
            ) : (
              <FinderWaiting />
            )}
          </div>
        ) : (
          <ReportForm onReportCreated={handleReportCreated} />
        ))}

      {flowStage === "review" && isLost && pendingMatch && (
        <div id="match-review" className="py-6">
          <MatchReview
            match={pendingMatch}
            reportType="lost"
            onConfirm={handleMatchConfirmed}
            onDismiss={() => {
              setPendingMatch(null)
              goToStage("matching")
            }}
          />
        </div>
      )}

      {isLost && flowStage === "verification" && confirmedMatch?.matchId && (
        <div id="ownership-verification" className="py-10">
          <OwnershipVerification
            matchId={confirmedMatch.matchId}
            onSubmitted={handleVerificationSubmitted}
          />
        </div>
      )}

      {isFinder &&
        flowStage === "verification-review" &&
        submittedVerification?.verificationId && (
          <div id="verification-review" className="py-10">
            <VerificationReview
              verificationId={submittedVerification.verificationId}
              matchId={submittedVerification.matchId}
              lostReportId={submittedVerification.lostReportId}
              foundReportId={submittedVerification.foundReportId}
              onStatusChange={handleVerificationStatusChange}
            />
          </div>
        )}

      {isLost && flowStage === "waiting-finder" && (
        <WaitingCard
          title="Waiting for the finder"
          label="VERIFICATION PASSED"
          icon={<ShieldCheck size={32} className="text-amber-300" />}
          text="Your item specifications have been sent to the finder for review."
        />
      )}

      {isLost && flowStage === "waiting-recovery" && (
        <WaitingCard
          title="Finder approved"
          label="APPROVED"
          icon={<CheckCircle2 size={32} className="text-emerald-300" />}
          text="The finder approved the request. FINDX is waiting for the shared recovery session to open."
        />
      )}

      {isFinder &&
        flowStage === "recovery-handover" &&
        finderAccepted &&
        recoveryApproved &&
        submittedVerification?.matchId &&
        submittedVerification?.lostReportId &&
        submittedVerification?.foundReportId && (
          <div id="recovery-handover" className="py-10">
            <RecoveryHandover
              matchId={submittedVerification.matchId}
              lostReportId={submittedVerification.lostReportId}
              foundReportId={submittedVerification.foundReportId}
              onRecoveryCreated={handleRecoveryCreated}
              onMissionSuccessful={handleMissionSuccessful}
            />
          </div>
        )}

      {flowStage === "recovery" &&
        finderAccepted &&
        recoveryApproved &&
        recovery?.recoveryId && (
          <div id="recovery-stage" className="py-6">
            <RecoveryChat
              recoveryId={recovery.recoveryId}
              role={sessionRole}
            />
            <RadarMap
              recoveryId={recovery.recoveryId}
              role={sessionRole}
            />
          </div>
        )}

      {flowStage === "success" && missionSuccessful && (
        <section id="mission-success" className="min-h-[80vh] py-24">
          <div className="findx-container text-center">
            <CheckCircle2 size={72} className="mx-auto text-emerald-300" />
            <h1 className="mt-8 text-5xl font-semibold text-white">
              MISSION
              <br />
              <span className="findx-gradient-text">SUCCESSFUL</span>
            </h1>
          </div>
        </section>
      )}
    </main>
  )
}

function FinderWaiting() {
  return (
    <section id="matching-stage" className="relative py-10">
      <div className="findx-container">
        <div className="mx-auto max-w-3xl rounded-3xl border border-emerald-400/[0.10] bg-emerald-400/[0.02] px-5 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/[0.08]">
                <Bell size={18} className="text-emerald-300" />
                <span className="absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-300">
                  FINDX is watching
                </p>
                <p className="mt-0.5 text-[10px] leading-5 text-slate-600">
                  No potential matches are shown to the finder. FINDX will alert
                  you after ownership verification.
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[9px] uppercase tracking-[0.12em] text-emerald-300">
                Waiting
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function WaitingCard({ title, label, icon, text }) {
  return (
    <section className="min-h-[60vh] py-20">
      <div className="findx-container">
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
            {icon}
          </div>

          <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500">
            {text}
          </p>
        </div>
      </div>
    </section>
  )
}

export default App