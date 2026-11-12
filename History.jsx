import { useEffect, useState } from "react"
import {
  ChevronLeft,
  FileText,
  Clock,
  Search,
  SlidersHorizontal,
  Calendar,
  MapPin,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Package,
  Send,
  Handshake,
  Inbox,
  MoreHorizontal,
  Home,
  Compass,
  Plus,
  History as HistoryIcon,
  User,
} from "lucide-react"

const REPORTS_API = "https://llc-lip-advert-wife.trycloudflare.com/api/reports"

export default function History({ onBack, onSelectReport, onNavigate }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [mainTab, setMainTab] = useState("my-activity")
  const [reportsFilter, setReportsFilter] = useState("all")
  const [activityFilter, setActivityFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true)
        const res = await fetch(REPORTS_API)
        const data = await res.json()

        if (data?.success && Array.isArray(data.reports)) {
          setReports(data.reports)
        } else {
          setError("Failed to fetch reports.")
        }
      } catch (err) {
        console.error("FINDX: History loading error:", err)
        setError("Unable to connect to FindX backend.")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  function triggerReportType(type) {
    window.dispatchEvent(
      new CustomEvent("findx:select-report-type", {
        detail: { type },
      })
    )
  }

  function formatDate(dateString) {
    if (!dateString) return "Recent"
    const d = new Date(dateString)
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  function getActivityTag(item, index) {
    if (item.status === "resolved") {
      return index % 2 === 0 ? "You Received" : "You Claimed"
    }
    if (item.type === "lost") {
      return "You Reported"
    }
    return "You Posted"
  }

  function getActivitySubtext(item, tag) {
    if (tag === "You Reported") {
      return `Reported as ${item.type}`
    }
    if (tag === "You Received") {
      return item.type === "found" ? "Someone claimed your item" : "Someone returned your item"
    }
    if (tag === "You Claimed") {
      return "You claimed this item"
    }
    return item.description || `Active report at ${item.location || "campus"}`
  }

  const filteredReports = reports.filter((item, index) => {
    const matchesSearch =
      item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (mainTab === "my-reports") {
      if (reportsFilter === "lost") return item.type === "lost"
      if (reportsFilter === "found") return item.type === "found"
      if (reportsFilter === "resolved") return item.status === "resolved"
      if (reportsFilter === "pending")
        return item.status === "active" || item.status === "pending" || !item.status
      return true
    } else {
      const tag = getActivityTag(item, index)
      if (activityFilter === "posted") return tag === "You Reported" || tag === "You Posted"
      if (activityFilter === "claims") return tag === "You Claimed"
      if (activityFilter === "received") return tag === "You Received"
      if (activityFilter === "others") return item.status === "closed"
      return true
    }
  })

  return (
    <div className="relative min-h-screen select-none bg-[#030712] pb-36 font-sans text-white antialiased">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-cyan-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-blue-600/15 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-md px-5 pt-4">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md transition hover:border-cyan-400/40"
          >
            <ChevronLeft size={20} className="text-slate-300" />
          </button>

          <div className="text-center">
            <h1 className="text-base font-bold text-white">
              {mainTab === "my-activity" ? "My Activity" : "History"}
            </h1>
            <p className="text-[10px] text-slate-400">
              {mainTab === "my-activity"
                ? "All your recent activity"
                : "Your past reports and activity"}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-sm font-black text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              F
            </div>
            <div>
              <span className="text-xs font-black tracking-wider text-white">
                FIND<span className="text-cyan-400">X</span>
              </span>
              <p className="text-[7px] tracking-widest text-slate-400 uppercase">
                Find · Verify · Belong
              </p>
            </div>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMainTab("my-reports")}
            className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
              mainTab === "my-reports"
                ? "border-cyan-500/40 bg-gradient-to-r from-[#0c1c3d]/90 to-[#07132e]/90 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                : "border-white/[0.08] bg-[#0c1224]/50 opacity-70 hover:opacity-100"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                mainTab === "my-reports"
                  ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
                  : "border-white/10 bg-white/[0.04] text-slate-300"
              }`}
            >
              <FileText size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">My Reports</p>
              <p className="text-[10px] text-slate-400">Items you reported</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("my-activity")}
            className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
              mainTab === "my-activity"
                ? "border-cyan-500/40 bg-gradient-to-r from-[#0c1c3d]/90 to-[#07132e]/90 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                : "border-white/[0.08] bg-[#0c1224]/50 opacity-70 hover:opacity-100"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                mainTab === "my-activity"
                  ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
                  : "border-white/10 bg-white/[0.04] text-slate-300"
              }`}
            >
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">My Activity</p>
              <p className="text-[10px] text-slate-400">All your activity</p>
            </div>
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                mainTab === "my-activity"
                  ? "Search your activity..."
                  : "Search your reports..."
              }
              className="h-11 w-full rounded-2xl border border-cyan-500/20 bg-[#090e23]/80 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none backdrop-blur-xl transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          <button
            type="button"
            className="flex h-11 items-center gap-1.5 rounded-2xl border border-cyan-500/20 bg-[#090e23]/80 px-3.5 text-xs font-medium text-slate-300 backdrop-blur-xl hover:border-cyan-400/40"
          >
            <SlidersHorizontal size={14} className="text-cyan-400" />
            <span>Filter</span>
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {mainTab === "my-activity" ? (
            <>
              <button
                type="button"
                onClick={() => setActivityFilter("all")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  activityFilter === "all"
                    ? "border border-cyan-400/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    : "border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                }`}
              >
                <FileText size={12} />
                <span>All</span>
              </button>

              <button
                type="button"
                onClick={() => setActivityFilter("posted")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  activityFilter === "posted"
                    ? "border border-blue-400/50 bg-blue-500/20 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                    : "border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                }`}
              >
                <Send size={12} />
                <span>Posted</span>
              </button>

              <button
                type="button"
                onClick={() => setActivityFilter("claims")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  activityFilter === "claims"
                    ? "border border-cyan-400/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    : "border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                }`}
              >
                <Handshake size={12} />
                <span>Claims</span>
              </button>

              <button
                type="button"
                onClick={() => setActivityFilter("received")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  activityFilter === "received"
                    ? "border border-emerald-400/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    : "border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                }`}
              >
                <Inbox size={12} />
                <span>Received</span>
              </button>

              <button
                type="button"
                onClick={() => setActivityFilter("others")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  activityFilter === "others"
                    ? "border border-purple-400/50 bg-purple-500/20 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                }`}
              >
                <MoreHorizontal size={12} />
                <span>Others</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setReportsFilter("all")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  reportsFilter === "all"
                    ? "border border-cyan-400/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    : "border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                }`}
              >
                <FileText size={12} />
                <span>All</span>
              </button>

              <button
                type="button"
                onClick={() => setReportsFilter("lost")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  reportsFilter === "lost"
                    ? "border border-rose-500/50 bg-rose-500/20 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                    : "border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                }`}
              >
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500/20 text-[9px] font-bold text-rose-400">
                  !
                </span>
                <span>Lost</span>
              </button>

              <button
                type="button"
                onClick={() => setReportsFilter("found")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  reportsFilter === "found"
                    ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    : "border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                }`}
              >
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>Found</span>
              </button>

              <button
                type="button"
                onClick={() => setReportsFilter("resolved")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  reportsFilter === "resolved"
                    ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    : "border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                }`}
              >
                <span>Resolved</span>
              </button>

              <button
                type="button"
                onClick={() => setReportsFilter("pending")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  reportsFilter === "pending"
                    ? "border border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                    : "border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                }`}
              >
                <Clock size={12} className="text-amber-400" />
                <span>Pending</span>
              </button>
            </>
          )}
        </div>

        <div className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recent Activity
          </h2>
        </div>

        <div className="mt-3 space-y-3.5">
          {loading ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-10 text-center text-xs text-slate-500">
              Loading recent activity...
            </div>
          ) : error ? (
            <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/20 bg-rose-950/20 p-4 text-xs text-rose-300">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-10 text-center text-xs text-slate-500">
              No matching activity records found.
            </div>
          ) : (
            filteredReports.map((item, index) => {
              const tag = getActivityTag(item, index)
              const subtext = getActivitySubtext(item, tag)
              const isResolved = item.status === "resolved"
              const isClosed = item.status === "closed"

              const isReceived = tag === "You Received"
              const isClaimed = tag === "You Claimed"

              return (
                <div
                  key={item.id || item._id}
                  onClick={() => onSelectReport && onSelectReport(item)}
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-cyan-500/20 bg-[#090f23]/90 p-4 backdrop-blur-xl transition hover:border-cyan-400/40 hover:brightness-105 active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/50">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.itemName}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-600">
                          <Package size={28} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wider ${
                            isReceived
                              ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                              : isClaimed
                              ? "border border-cyan-500/40 bg-cyan-500/15 text-cyan-300"
                              : "border border-blue-500/40 bg-blue-500/15 text-blue-300"
                          }`}
                        >
                          {tag}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isResolved
                              ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                              : isClosed
                              ? "border border-slate-600/40 bg-slate-800/40 text-slate-400"
                              : "border border-amber-500/30 bg-amber-500/15 text-amber-400"
                          }`}
                        >
                          {isResolved ? (
                            <CheckCircle2 size={11} />
                          ) : isClosed ? (
                            <Package size={11} />
                          ) : (
                            <Clock size={11} />
                          )}
                          <span>
                            {isResolved ? "Resolved" : isClosed ? "Closed" : "Pending"}
                          </span>
                        </span>
                      </div>

                      <h3 className="mt-1.5 text-sm font-bold text-white group-hover:text-cyan-300 transition truncate">
                        {item.itemName}
                      </h3>

                      <p className="mt-0.5 truncate text-[10px] text-slate-400">
                        {subtext}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={11} />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={11} />
                          <span className="truncate max-w-[120px]">
                            {item.location || "Campus"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-center justify-end border-t border-white/[0.04] pt-2.5">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/20"
                    >
                      <span>View Details</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-4 z-50 mx-auto max-w-sm px-4">
        <nav className="flex h-16 items-center justify-around rounded-full border border-cyan-500/20 bg-[#070b19]/90 px-3 shadow-[0_0_35px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("hero")}
            className="flex flex-col items-center gap-1 text-slate-400 transition hover:text-cyan-300"
          >
            <Home size={18} />
            <span className="text-[9px] font-medium">Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate("history")}
            className="flex flex-col items-center gap-1 text-slate-400 transition hover:text-cyan-300"
          >
            <Compass size={18} />
            <span className="text-[9px] font-medium">Explore</span>
          </button>

          <button
            type="button"
            onClick={() => triggerReportType("lost")}
            className="relative -top-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 via-cyan-500 to-blue-400 text-white shadow-[0_0_25px_rgba(6,182,212,0.6)] transition hover:scale-105 active:scale-95"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate("history")}
            className="flex flex-col items-center gap-1 text-cyan-400"
          >
            <HistoryIcon size={18} />
            <span className="text-[9px] font-bold">History</span>
            <span className="h-1 w-3 rounded-full bg-cyan-400" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate("profile")}
            className="flex flex-col items-center gap-1 text-slate-400 transition hover:text-cyan-300"
          >
            <User size={18} />
            <span className="text-[9px] font-medium">Profile</span>
          </button>
        </nav>
      </div>
    </div>
  )
}