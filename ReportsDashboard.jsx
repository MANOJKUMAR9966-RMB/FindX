import { useEffect, useMemo, useState } from "react"
import {
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  PackageSearch,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  X,
  XCircle,
  Zap,
} from "lucide-react"

const API_URL = "http://localhost:5000/api/reports"
const MATCH_API_URL = "http://localhost:5000/api/matches"
const CONFIRM_API_URL =
  "http://localhost:5000/api/match-confirmations"

function ReportsDashboard({
  onMatchConfirmed,
}) {
  const [reports, setReports] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [selectedReport, setSelectedReport] =
    useState(null)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  // ============================================
  // MATCH STATE
  // ============================================

  const [matches, setMatches] = useState({})
  const [matchingReportId, setMatchingReportId] =
    useState(null)

  const [matchErrors, setMatchErrors] =
    useState({})

  const [confirmingMatchId, setConfirmingMatchId] =
    useState(null)

  const [rejectingMatchId, setRejectingMatchId] =
    useState(null)

  const [confirmedMatches, setConfirmedMatches] =
    useState({})

  // ============================================
  // LOAD REPORTS
  // ============================================

  async function loadReports(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError("")

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        )
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to load reports."
        )
      }

      setReports(
        Array.isArray(data.reports)
          ? data.reports
          : []
      )
    } catch (error) {
      console.error(
        "FINDX: Failed to load reports.",
        error
      )

      setError(
        "Unable to connect to the FINDX server."
      )

      setReports([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    loadReports()
  }, [])

  // ============================================
  // SEARCH + FILTER
  // ============================================

  const filteredReports = useMemo(() => {
    const search = searchTerm
      .toLowerCase()
      .trim()

    return reports.filter((report) => {
      const matchesFilter =
        filter === "all" ||
        report.type === filter

      const itemName =
        report.itemName?.toLowerCase() || ""

      const description =
        report.description?.toLowerCase() || ""

      const location =
        report.location?.toLowerCase() || ""

      const matchesSearch =
        !search ||
        itemName.includes(search) ||
        description.includes(search) ||
        location.includes(search)

      return matchesFilter && matchesSearch
    })
  }, [reports, searchTerm, filter])

  // ============================================
  // FIND POTENTIAL MATCHES
  // ============================================

  async function findMatches(reportId) {
    if (!reportId) {
      return
    }

    try {
      setMatchingReportId(reportId)

      setMatchErrors((current) => ({
        ...current,
        [reportId]: "",
      }))

      const response = await fetch(
        `${MATCH_API_URL}/${encodeURIComponent(
          reportId
        )}`
      )

      let data

      try {
        data = await response.json()
      } catch {
        throw new Error(
          "The matching server returned an invalid response."
        )
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to find potential matches."
        )
      }

      const foundMatches = Array.isArray(
        data.matches
      )
        ? data.matches
        : []

      setMatches((current) => ({
        ...current,
        [reportId]: foundMatches,
      }))
    } catch (error) {
      console.error(
        "FINDX: Failed to find matches.",
        error
      )

      setMatchErrors((current) => ({
        ...current,
        [reportId]:
          error.message ||
          "Unable to find potential matches.",
      }))

      setMatches((current) => ({
        ...current,
        [reportId]: [],
      }))
    } finally {
      setMatchingReportId(null)
    }
  }

  // ============================================
  // CONFIRM MATCH
  // ============================================

  async function confirmMatch(
    sourceReport,
    matchedReport,
    match
  ) {
    const isLostSource =
      sourceReport.type === "lost"

    const lostReportId = isLostSource
      ? sourceReport.id
      : matchedReport.id

    const foundReportId = isLostSource
      ? matchedReport.id
      : sourceReport.id

    const confirmed = window.confirm(
      "Confirm this potential match?\n\nFINDX will mark both reports as matched."
    )

    if (!confirmed) {
      return
    }

    try {
      setConfirmingMatchId(
        matchedReport.id
      )

      setMatchErrors((current) => ({
        ...current,
        [sourceReport.id]: "",
      }))

      // ----------------------------------------
      // CONFIRM MATCH WITH BACKEND
      // ----------------------------------------

      const response = await fetch(
        CONFIRM_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            lostReportId,
            foundReportId,

            score:
              Number(match?.score) || 0,

            signals: {
              item:
                Number(
                  match?.signals?.item
                ) || 0,

              description:
                Number(
                  match?.signals?.description
                ) || 0,

              location:
                Number(
                  match?.signals?.location
                ) || 0,

              visual: null,
              time: null,
            },
          }),
        }
      )

      let data

      try {
        data = await response.json()
      } catch {
        throw new Error(
          "The confirmation server returned an invalid response."
        )
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to confirm match."
        )
      }

      // ----------------------------------------
      // DEBUG BACKEND RESPONSE
      // ----------------------------------------

      console.log(
        "FINDX: MATCH CONFIRMATION RESPONSE:",
        data
      )

      // ----------------------------------------
      // NORMALIZE BACKEND MATCH RESPONSE
      // ----------------------------------------

      const backendMatch =
        data.match ||
        data.confirmation ||
        data.matchConfirmation ||
        data

      const matchId =
        backendMatch?.matchId ||
        backendMatch?.id ||
        backendMatch?._id ||
        data.matchId ||
        data.confirmationId ||
        data.id ||
        null

      if (!matchId) {
        console.error(
          "FINDX: Match confirmed but no match ID returned.",
          data
        )

        throw new Error(
          "Match was confirmed, but the server did not return a match ID."
        )
      }

      // ----------------------------------------
      // BUILD NORMALIZED MATCH
      // ----------------------------------------

      const normalizedMatch = {
        ...backendMatch,

        matchId,

        lostReportId:
          backendMatch?.lostReportId ||
          lostReportId,

        foundReportId:
          backendMatch?.foundReportId ||
          foundReportId,

        score:
          Number(
            backendMatch?.score ??
              match?.score
          ) || 0,

        signals:
          backendMatch?.signals ||
          match?.signals ||
          {},
      }

      console.log(
        "FINDX: NORMALIZED MATCH:",
        normalizedMatch
      )

      // ----------------------------------------
      // STORE CONFIRMED MATCH LOCALLY
      // ----------------------------------------

      setConfirmedMatches((current) => ({
        ...current,

        [sourceReport.id]:
          normalizedMatch,
      }))

      // ----------------------------------------
      // SEND MATCH TO APP.JSX
      // ----------------------------------------

      if (onMatchConfirmed) {
        onMatchConfirmed(
          normalizedMatch
        )
      }

      // ----------------------------------------
      // REMOVE MATCH FROM RESULTS
      // ----------------------------------------

      setMatches((current) => ({
        ...current,

        [sourceReport.id]: (
          current[sourceReport.id] || []
        ).filter(
          (item) =>
            item?.report?.id !==
            matchedReport.id
        ),
      }))

      // ----------------------------------------
      // REFRESH REPORTS
      // ----------------------------------------

      await loadReports(true)
    } catch (error) {
      console.error(
        "FINDX: Failed to confirm match.",
        error
      )

      setMatchErrors((current) => ({
        ...current,

        [sourceReport.id]:
          error.message ||
          "Unable to confirm the match.",
      }))
    } finally {
      setConfirmingMatchId(null)
    }
  }

  // ============================================
  // REJECT MATCH
  // ============================================

  function rejectMatch(
    sourceReport,
    matchedReport
  ) {
    const confirmed = window.confirm(
      "Reject this potential match?"
    )

    if (!confirmed) {
      return
    }

    setRejectingMatchId(
      matchedReport.id
    )

    setMatches((current) => ({
      ...current,

      [sourceReport.id]: (
        current[sourceReport.id] || []
      ).filter(
        (item) =>
          item?.report?.id !==
          matchedReport.id
      ),
    }))

    setTimeout(() => {
      setRejectingMatchId(null)
    }, 250)
  }

  // ============================================
  // DELETE REPORT
  // ============================================

  async function handleDelete(reportId) {
    const confirmed = window.confirm(
      "Delete this FINDX report?"
    )

    if (!confirmed) {
      return
    }

    try {
      setError("")

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(
          reportId
        )}`,
        {
          method: "DELETE",
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to delete report."
        )
      }

      setSelectedReport(null)

      setMatches((current) => {
        const updated = {
          ...current,
        }

        delete updated[reportId]

        return updated
      })

      await loadReports(true)
    } catch (error) {
      console.error(
        "FINDX: Failed to delete report.",
        error
      )

      setError(
        "Unable to delete the report."
      )
    }
  }

  return (
    <section
      id="reports"
      className="
        relative
        py-28
        sm:py-36
      "
    >
      <div className="findx-container">

        {/* ========================================
            HEADER
            ======================================== */}

        <div
          className="
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >

          <div className="max-w-2xl">

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-blue-400/15
                bg-blue-400/[0.06]
                px-3.5
                py-2
                text-xs
                font-medium
                tracking-wide
                text-blue-300
              "
            >
              <Sparkles size={14} />

              FINDX REPORTS
            </div>

            <h2
              className="
                mt-6
                text-4xl
                font-semibold
                tracking-[-0.045em]
                text-white
                sm:text-5xl
              "
            >
              Your search

              <br />

              <span className="findx-gradient-text">
                starts here.
              </span>
            </h2>

            <p
              className="
                mt-5
                max-w-xl
                text-base
                leading-7
                text-slate-400
                sm:text-lg
                sm:leading-8
              "
            >
              View, manage, and verify FINDX
              reports stored securely in MongoDB.
            </p>

          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={() =>
              loadReports(true)
            }
            disabled={refreshing}
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              self-start
              rounded-xl
              border
              border-white/[0.08]
              bg-white/[0.025]
              px-4
              text-sm
              font-medium
              text-slate-400
              transition-colors
              duration-200
              hover:border-white/[0.14]
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
              lg:self-auto
            "
          >

            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>

        {/* ========================================
            ERROR
            ======================================== */}

        {error && (
          <div
            className="
              mt-6
              rounded-2xl
              border
              border-red-400/15
              bg-red-400/[0.05]
              px-4
              py-3
              text-sm
              text-red-300
            "
          >
            {error}
          </div>
        )}

        {/* ========================================
            SEARCH
            ======================================== */}

        <div
          className="
            mt-10
            flex
            flex-col
            gap-3
            sm:flex-row
          "
        >

          <div className="relative flex-1">

            <Search
              size={16}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-600
              "
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search reports..."
              className="
                h-12
                w-full
                rounded-2xl
                border
                border-white/[0.07]
                bg-white/[0.025]
                pl-11
                pr-4
                text-sm
                text-white
                outline-none
                placeholder:text-slate-700
                focus:border-blue-400/30
                focus:bg-blue-400/[0.025]
              "
            />

          </div>

          <div
            className="
              grid
              grid-cols-3
              gap-2
              sm:w-[360px]
            "
          >

            {[
              ["all", "All"],
              ["lost", "Lost"],
              ["found", "Found"],
            ].map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFilter(value)
                  }
                  className={`
                    rounded-2xl
                    border
                    px-4
                    py-3
                    text-sm
                    font-medium
                    transition-colors
                    ${
                      filter === value
                        ? "border-blue-400/30 bg-blue-400/[0.10] text-blue-200"
                        : "border-white/[0.07] bg-white/[0.025] text-slate-500 hover:border-white/[0.12] hover:text-slate-300"
                    }
                  `}
                >
                  {label}
                </button>
              )
            )}

          </div>

        </div>

        {/* ========================================
            SUMMARY
            ======================================== */}

        <div
          className="
            mt-6
            flex
            items-center
            justify-between
            border-b
            border-white/[0.07]
            pb-5
          "
        >

          <div className="flex items-center gap-2">

            <PackageSearch
              size={15}
              className="text-blue-300"
            />

            <span className="text-xs text-slate-500">

              {loading
                ? "Loading reports..."
                : `${filteredReports.length} ${
                    filteredReports.length === 1
                      ? "report"
                      : "reports"
                  } found`}

            </span>

          </div>

          <span className="text-[11px] text-slate-600">
            MongoDB
          </span>

        </div>

        {/* ========================================
            LOADING
            ======================================== */}

        {loading && (
          <div
            className="
              mt-8
              rounded-3xl
              border
              border-white/[0.07]
              bg-white/[0.02]
              px-6
              py-16
              text-center
            "
          >

            <RefreshCw
              size={24}
              className="
                mx-auto
                animate-spin
                text-blue-300
              "
            />

            <p
              className="
                mt-4
                text-sm
                text-slate-500
              "
            >
              Loading FINDX reports...
            </p>

          </div>
        )}

        {/* ========================================
            EMPTY
            ======================================== */}

        {!loading &&
          filteredReports.length === 0 && (
            <div
              className="
                mt-8
                rounded-3xl
                border
                border-white/[0.07]
                bg-white/[0.02]
                px-6
                py-16
                text-center
              "
            >

              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-blue-400/10
                  bg-blue-400/[0.05]
                "
              >

                <FileText
                  size={22}
                  className="text-blue-300"
                />

              </div>

              <h3
                className="
                  mt-5
                  text-base
                  font-semibold
                  text-white
                "
              >
                No reports found
              </h3>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-md
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                {reports.length === 0
                  ? "Create your first FINDX report and it will appear here."
                  : "Try changing your search term or filter."}
              </p>

            </div>
          )}

        {/* ========================================
            REPORT GRID
            ======================================== */}

        {!loading &&
          filteredReports.length > 0 && (
            <div
              className="
                mt-8
                grid
                gap-5
                lg:grid-cols-2
              "
            >

              {filteredReports.map(
                (report) => (
                  <ReportCard
                    key={
                      report._id ||
                      report.id
                    }

                    report={report}

                    onOpen={() =>
                      setSelectedReport(
                        report
                      )
                    }

                    onDelete={() =>
                      handleDelete(
                        report._id ||
                          report.id
                      )
                    }

                    onFindMatches={() =>
                      findMatches(
                        report.id
                      )
                    }

                    matches={
                      matches[
                        report.id
                      ] || []
                    }

                    matching={
                      matchingReportId ===
                      report.id
                    }

                    matchError={
                      matchErrors[
                        report.id
                      ] || ""
                    }

                    onConfirmMatch={
                      confirmMatch
                    }

                    onRejectMatch={
                      rejectMatch
                    }

                    confirmingMatchId={
                      confirmingMatchId
                    }

                    rejectingMatchId={
                      rejectingMatchId
                    }

                    confirmedMatch={
                      confirmedMatches[
                        report.id
                      ] || null
                    }
                  />
                )
              )}

            </div>
          )}

      </div>

      {/* ========================================
          MODAL
          ======================================== */}

      {selectedReport && (
        <ReportModal
          report={selectedReport}

          onClose={() =>
            setSelectedReport(null)
          }

          onDelete={() =>
            handleDelete(
              selectedReport._id ||
                selectedReport.id
            )
          }
        />
      )}

    </section>
  )
}


// ============================================
// REPORT CARD
// ============================================

function ReportCard({
  report,
  onOpen,
  onDelete,
  onFindMatches,
  matches,
  matching,
  matchError,
  onConfirmMatch,
  onRejectMatch,
  confirmingMatchId,
  rejectingMatchId,
  confirmedMatch,
}) {
  const createdDate =
    new Date(report.createdAt)

  const formattedDate =
    createdDate.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    )

  const formattedTime =
    createdDate.toLocaleTimeString(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    )

  const hasImage =
    Boolean(report.image?.dataUrl)

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-3xl
        border
        border-white/[0.08]
        bg-white/[0.025]
        transition-colors
        duration-200
        hover:border-white/[0.14]
        hover:bg-white/[0.035]
      "
    >

      {/* IMAGE */}

      {report.image && (
        <div
          className="
            relative
            h-56
            w-full
            overflow-hidden
            border-b
            border-white/[0.07]
            bg-black/20
          "
        >

          {hasImage ? (
            <img
              src={report.image.dataUrl}
              alt={
                report.itemName ||
                "Reported item"
              }
              className="
                block
                h-56
                w-full
                object-cover
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                items-center
                justify-center
                text-slate-700
              "
            >
              <PackageSearch
                size={30}
              />
            </div>
          )}

          <div
            className="
              absolute
              left-4
              top-4
              rounded-full
              border
              border-white/[0.10]
              bg-black/60
              px-3
              py-1.5
              text-[10px]
              font-medium
              uppercase
              tracking-[0.14em]
              text-slate-300
              backdrop-blur-md
            "
          >
            {hasImage
              ? "Image attached"
              : "Image unavailable"}
          </div>

        </div>
      )}

      {/* CONTENT */}

      <div className="p-6">

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >

          <div className="min-w-0">

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >

              <span
                className={`
                  rounded-full
                  border
                  px-2.5
                  py-1
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  ${
                    report.type === "lost"
                      ? "border-amber-400/15 bg-amber-400/[0.06] text-amber-300"
                      : "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300"
                  }
                `}
              >
                {report.type ||
                  "unknown"}
              </span>

              <span
                className="
                  text-[10px]
                  text-slate-600
                "
              >
                {report.id}
              </span>

            </div>

            <h3
              className="
                mt-4
                truncate
                text-lg
                font-semibold
                text-white
              "
            >
              {report.itemName ||
                "Unnamed item"}
            </h3>

          </div>

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-400/[0.06]
            "
          >

            <ShieldCheck
              size={17}
              className="text-blue-300"
            />

          </div>

        </div>

        <p
          className="
            mt-3
            line-clamp-3
            text-sm
            leading-6
            text-slate-500
          "
        >
          {report.description ||
            "No description provided."}
        </p>

        {/* METADATA */}

        <div
          className="
            mt-5
            grid
            gap-2
            border-t
            border-white/[0.06]
            pt-5
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
              size={14}
              className="
                shrink-0
                text-slate-600
              "
            />

            <span
              className="
                truncate
                text-xs
                text-slate-500
              "
            >
              {report.location ||
                "Location not provided"}
            </span>

          </div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <Clock3
              size={14}
              className="
                shrink-0
                text-slate-600
              "
            />

            <span
              className="
                text-xs
                text-slate-500
              "
            >
              {formattedDate} ·{" "}
              {formattedTime}
            </span>

          </div>

        </div>

        {/* STATUS */}

        <div
          className="
            mt-5
            flex
            items-center
            justify-between
            rounded-2xl
            border
            border-white/[0.06]
            bg-black/10
            px-4
            py-3
          "
        >

          <div
            className="
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
                  report.status === "matched"
                    ? "bg-amber-400"
                    : "bg-blue-400"
                }
              `}
            />

            <span
              className="
                text-xs
                capitalize
                text-slate-400
              "
            >
              {report.status ||
                "active"}
            </span>

          </div>

          <span
            className="
              text-[10px]
              text-slate-600
            "
          >
            FINDX
          </span>

        </div>

        {/* ACTIONS */}

        <div
          className="
            mt-4
            grid
            grid-cols-[1fr_auto]
            gap-2
          "
        >

          <button
            type="button"
            onClick={onOpen}
            className="
              h-10
              rounded-xl
              border
              border-blue-400/15
              bg-blue-400/[0.06]
              text-xs
              font-medium
              text-blue-300
              hover:bg-blue-400/[0.10]
            "
          >
            View report
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete report"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-red-400/10
              bg-red-400/[0.03]
              text-red-400/70
              hover:border-red-400/20
              hover:bg-red-400/[0.08]
              hover:text-red-300
            "
          >
            <Trash2 size={15} />
          </button>

        </div>

        {/* MATCHING */}

        {report.status !== "matched" &&
          report.status !== "resolved" && (
            <div className="mt-4">

              <button
                type="button"
                onClick={onFindMatches}
                disabled={matching}
                className="
                  flex
                  h-10
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-violet-400/15
                  bg-violet-400/[0.05]
                  text-xs
                  font-medium
                  text-violet-300
                  hover:border-violet-400/25
                  hover:bg-violet-400/[0.09]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {matching ? (
                  <>
                    <RefreshCw
                      size={14}
                      className="animate-spin"
                    />

                    Searching for matches...
                  </>
                ) : (
                  <>
                    <Target size={14} />

                    Find potential matches
                  </>
                )}

              </button>

              {matchError && (
                <div
                  className="
                    mt-3
                    rounded-xl
                    border
                    border-red-400/10
                    bg-red-400/[0.04]
                    px-3
                    py-2
                    text-xs
                    text-red-300
                  "
                >
                  {matchError}
                </div>
              )}

              {/* POTENTIAL MATCHES */}

              {matches.length > 0 && (
                <div
                  className="
                    mt-4
                    space-y-3
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <Zap
                        size={14}
                        className="text-violet-300"
                      />

                      <span
                        className="
                          text-xs
                          font-medium
                          text-slate-300
                        "
                      >
                        Potential matches
                      </span>

                    </div>

                    <span
                      className="
                        text-[10px]
                        text-slate-600
                      "
                    >
                      {matches.length} found
                    </span>

                  </div>

                  {matches.map(
                    (match, index) => {
                      const matchedReport =
                        match?.report || {}

                      const score =
                        Number(
                          match?.score
                        ) || 0

                      const isConfirming =
                        confirmingMatchId ===
                        matchedReport.id

                      const isRejecting =
                        rejectingMatchId ===
                        matchedReport.id

                      return (
                        <div
                          key={
                            matchedReport._id ||
                            matchedReport.id ||
                            `${report.id}-match-${index}`
                          }
                          className="
                            rounded-2xl
                            border
                            border-violet-400/[0.12]
                            bg-violet-400/[0.025]
                            p-4
                          "
                        >

                          {/* MATCH HEADER */}

                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-3
                            "
                          >

                            <div className="min-w-0">

                              <div
                                className="
                                  flex
                                  flex-wrap
                                  items-center
                                  gap-2
                                "
                              >

                                <span
                                  className="
                                    rounded-full
                                    border
                                    border-emerald-400/15
                                    bg-emerald-400/[0.06]
                                    px-2.5
                                    py-1
                                    text-[10px]
                                    font-semibold
                                    text-emerald-300
                                  "
                                >
                                  {score}% MATCH
                                </span>

                                <span
                                  className="
                                    text-[10px]
                                    uppercase
                                    text-slate-600
                                  "
                                >
                                  {matchedReport.type ||
                                    "unknown"}
                                </span>

                              </div>

                              <h4
                                className="
                                  mt-3
                                  text-sm
                                  font-semibold
                                  text-white
                                "
                              >
                                {matchedReport.itemName ||
                                  "Unnamed item"}
                              </h4>

                            </div>

                            <ShieldCheck
                              size={18}
                              className="
                                shrink-0
                                text-emerald-300
                              "
                            />

                          </div>

                          {/* DESCRIPTION */}

                          <p
                            className="
                              mt-2
                              text-xs
                              leading-5
                              text-slate-500
                            "
                          >
                            {matchedReport.description ||
                              "No description provided."}
                          </p>

                          {/* SIGNALS */}

                          <div
                            className="
                              mt-4
                              grid
                              grid-cols-3
                              gap-2
                            "
                          >

                            <MatchSignal
                              label="Item"
                              value={
                                match?.signals
                                  ?.item
                              }
                            />

                            <MatchSignal
                              label="Details"
                              value={
                                match?.signals
                                  ?.description
                              }
                            />

                            <MatchSignal
                              label="Area"
                              value={
                                match?.signals
                                  ?.location
                              }
                            />

                          </div>

                          {/* LOCATION */}

                          {matchedReport.location && (
                            <div
                              className="
                                mt-3
                                flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-white/[0.06]
                                bg-black/10
                                px-3
                                py-2.5
                              "
                            >

                              <MapPin
                                size={13}
                                className="
                                  shrink-0
                                  text-slate-600
                                "
                              />

                              <span
                                className="
                                  truncate
                                  text-[10px]
                                  text-slate-500
                                "
                              >
                                General area:{" "}
                                {matchedReport.location}
                              </span>

                            </div>
                          )}

                          {/* PRIVACY */}

                          <div
                            className="
                              mt-4
                              flex
                              items-start
                              gap-2
                              rounded-xl
                              border
                              border-emerald-400/[0.08]
                              bg-emerald-400/[0.02]
                              px-3
                              py-2.5
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
                                text-[10px]
                                leading-4
                                text-slate-500
                              "
                            >
                              FINDX protects private
                              addresses and personal
                              contact details during
                              recovery.
                            </p>

                          </div>

                          {/* CONFIRM / REJECT */}

                          <div
                            className="
                              mt-4
                              grid
                              grid-cols-2
                              gap-2
                            "
                          >

                            <button
                              type="button"
                              onClick={() =>
                                onConfirmMatch(
                                  report,
                                  matchedReport,
                                  match
                                )
                              }
                              disabled={
                                isConfirming ||
                                isRejecting
                              }
                              className="
                                flex
                                h-10
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-emerald-400/15
                                bg-emerald-400/[0.06]
                                text-xs
                                font-medium
                                text-emerald-300
                                hover:bg-emerald-400/[0.10]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >

                              {isConfirming ? (
                                <>
                                  <RefreshCw
                                    size={13}
                                    className="animate-spin"
                                  />

                                  Confirming...
                                </>
                              ) : (
                                <>
                                  <Check
                                    size={13}
                                  />

                                  Confirm match
                                </>
                              )}

                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onRejectMatch(
                                  report,
                                  matchedReport
                                )
                              }
                              disabled={
                                isConfirming ||
                                isRejecting
                              }
                              className="
                                flex
                                h-10
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-red-400/10
                                bg-red-400/[0.03]
                                text-xs
                                font-medium
                                text-red-300
                                hover:bg-red-400/[0.08]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >

                              {isRejecting ? (
                                <>
                                  <RefreshCw
                                    size={13}
                                    className="animate-spin"
                                  />

                                  Removing...
                                </>
                              ) : (
                                <>
                                  <XCircle
                                    size={13}
                                  />

                                  Reject
                                </>
                              )}

                            </button>

                          </div>

                        </div>
                      )
                    }
                  )}

                </div>
              )}

              {/* NO MATCHES YET */}

              {matches.length === 0 &&
                !matching &&
                !matchError && (
                  <p
                    className="
                      mt-3
                      text-center
                      text-[10px]
                      text-slate-600
                    "
                  >
                    Search to find possible
                    lost ↔ found matches.
                  </p>
                )}

            </div>
          )}

        {/* ========================================
            CONFIRMED MATCH
            ======================================== */}

        {confirmedMatch && (
          <div
            className="
              mt-4
              rounded-2xl
              border
              border-emerald-400/[0.12]
              bg-emerald-400/[0.025]
              p-4
            "
          >

            <div
              className="
                flex
                items-start
                gap-3
              "
            >

              <CheckCircle2
                size={18}
                className="
                  mt-0.5
                  shrink-0
                  text-emerald-300
                "
              />

              <div>

                <p
                  className="
                    text-sm
                    font-medium
                    text-emerald-200
                  "
                >
                  Match confirmed
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  FINDX has linked the two
                  reports for the recovery
                  workflow.
                </p>

                <p
                  className="
                    mt-2
                    text-[10px]
                    text-slate-600
                  "
                >
                  Match ID:{" "}
                  {confirmedMatch.matchId}
                </p>

              </div>

            </div>

          </div>
        )}

      </div>
    </article>
  )
}


// ============================================
// MATCH SIGNAL
// ============================================

function MatchSignal({
  label,
  value,
}) {
  const safeValue = Math.max(
    0,
    Math.min(
      100,
      Number(value) || 0
    )
  )

  return (
    <div
      className="
        rounded-xl
        border
        border-white/[0.06]
        bg-black/10
        p-3
        text-center
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
          text-sm
          font-semibold
          text-violet-300
        "
      >
        {safeValue}%
      </p>

    </div>
  )
}


// ============================================
// REPORT MODAL
// ============================================

function ReportModal({
  report,
  onClose,
  onDelete,
}) {
  const createdDate =
    new Date(report.createdAt)

  const formattedDate =
    createdDate.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    )

  const formattedTime =
    createdDate.toLocaleTimeString(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    )

  const hasImage =
    Boolean(report.image?.dataUrl)

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-black/80
        px-4
        py-8
        backdrop-blur-md
      "
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose()
        }
      }}
    >

      <div
        className="
          relative
          w-full
          max-w-2xl
          overflow-hidden
          rounded-3xl
          border
          border-white/[0.10]
          bg-[#080b12]
          shadow-2xl
        "
      >

        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            right-4
            top-4
            z-10
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-white/[0.10]
            bg-black/50
            text-slate-400
            hover:text-white
          "
          aria-label="Close report"
        >
          <X size={17} />
        </button>

        {hasImage && (
          <div className="h-72 w-full">

            <img
              src={report.image.dataUrl}
              alt={
                report.itemName ||
                "Reported item"
              }
              className="
                h-full
                w-full
                object-cover
              "
            />

          </div>
        )}

        <div className="p-6 sm:p-8">

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <span
              className={`
                rounded-full
                border
                px-3
                py-1.5
                text-[10px]
                font-medium
                uppercase
                tracking-[0.12em]
                ${
                  report.type === "lost"
                    ? "border-amber-400/15 bg-amber-400/[0.06] text-amber-300"
                    : "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300"
                }
              `}
            >
              {report.type}
            </span>

            <span
              className="
                text-[10px]
                text-slate-600
              "
            >
              {report.id}
            </span>

          </div>

          <h2
            className="
              mt-4
              text-2xl
              font-semibold
              tracking-tight
              text-white
            "
          >
            {report.itemName ||
              "Unnamed item"}
          </h2>

          <p
            className="
              mt-4
              text-sm
              leading-7
              text-slate-400
            "
          >
            {report.description ||
              "No description provided."}
          </p>

          <div
            className="
              mt-6
              grid
              gap-3
              sm:grid-cols-2
            "
          >

            <Detail
              icon={MapPin}
              label="General location"
              value={
                report.location ||
                "Not provided"
              }
            />

            <Detail
              icon={Clock3}
              label="Created"
              value={`${formattedDate} · ${formattedTime}`}
            />

            <Detail
              icon={ShieldCheck}
              label="Status"
              value={
                report.status ||
                "active"
              }
            />

            <Detail
              icon={FileText}
              label="Report ID"
              value={
                report.id ||
                "Unknown"
              }
            />

          </div>

          <div
            className="
              mt-6
              rounded-2xl
              border
              border-emerald-400/[0.10]
              bg-emerald-400/[0.025]
              p-4
            "
          >

            <div
              className="
                flex
                items-start
                gap-3
              "
            >

              <ShieldCheck
                size={18}
                className="
                  mt-0.5
                  shrink-0
                  text-emerald-300
                "
              />

              <div>

                <p
                  className="
                    text-sm
                    font-medium
                    text-emerald-200
                  "
                >
                  Privacy protected
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  FINDX uses a general
                  location. Never expose
                  a private home address.
                </p>

              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={onDelete}
            className="
              mt-6
              flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-red-400/10
              bg-red-400/[0.03]
              text-sm
              font-medium
              text-red-300
              hover:border-red-400/20
              hover:bg-red-400/[0.08]
            "
          >
            <Trash2 size={15} />

            Delete report
          </button>

        </div>

      </div>

    </div>
  )
}


// ============================================
// DETAIL
// ============================================

function Detail({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.02]
        p-4
      "
    >

      <div
        className="
          flex
          items-center
          gap-2
        "
      >

        <Icon
          size={14}
          className="text-blue-300"
        />

        <span
          className="
            text-[10px]
            uppercase
            tracking-[0.12em]
            text-slate-600
          "
        >
          {label}
        </span>

      </div>

      <p
        className="
          mt-2
          break-words
          text-sm
          text-slate-300
        "
      >
        {value}
      </p>

    </div>
  )
}

export default ReportsDashboard