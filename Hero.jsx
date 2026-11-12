import { useEffect, useState } from "react"
import {
  Bell,
  Search,
  SlidersHorizontal,
  Send,
  Box,
  MapPin,
  Clock,
  ChevronRight,
  Plus,
  Home,
  Compass,
  History as HistoryIcon,
  User,
} from "lucide-react"

const REPORTS_API = "https://llc-lip-advert-wife.trycloudflare.com/api/reports"

export default function Hero({ onNavigate, onSelectReport }) {
  const [recentReports, setRecentReports] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("home")

  useEffect(() => {
    async function loadRecent() {
      try {
        const res = await fetch(REPORTS_API)
        const data = await res.json()
        if (data?.success && Array.isArray(data.reports)) {
          setRecentReports(data.reports)
        }
      } catch (err) {
        console.error("FINDX: Failed to fetch recent reports:", err)
      } finally {
        setLoading(false)
      }
    }
    loadRecent()
  }, [])

  function triggerReportType(type) {
    window.dispatchEvent(
      new CustomEvent("findx:select-report-type", {
        detail: { type },
      })
    )
  }

  function getTimeAgo(dateString) {
    if (!dateString) return "Recently"
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000)
    if (diff < 60) return "Just now"
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
  }

  const displayedReports = searchQuery.trim()
    ? recentReports.filter(
        (r) =>
          r.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recentReports

  return (
    <div className="relative min-h-screen select-none bg-[#030712] pb-36 font-sans text-white antialiased">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[430px] bg-gradient-to-b from-[#0b132b] via-[#050a1a] to-[#030712]" />
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-cyan-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-purple-600/15 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-md px-5 pt-3">
        <header className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-2xl font-black text-white shadow-[0_0_22px_rgba(6,182,212,0.45)]">
              F
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider text-white">
                FIND<span className="text-cyan-400">X</span>
              </h1>
              <p className="text-[10px] tracking-widest text-slate-400 uppercase">
                Find · Verify · Belong
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("history")}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md transition hover:border-cyan-400/40"
            >
              <Bell size={18} className="text-slate-300" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]" />
            </button>

            <div
              onClick={() => onNavigate && onNavigate("profile")}
              className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-cyan-400/40 bg-gradient-to-tr from-slate-800 to-slate-700 text-sm font-bold text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)] transition hover:scale-105"
            >
              S
            </div>
          </div>
        </header>

        <div className="mt-3 flex justify-end">
          <p className="rotate-2 text-right font-serif text-xs italic leading-tight text-cyan-200/90 drop-shadow-[0_0_12px_rgba(6,182,212,0.7)]">
            Same Campus<br />Brighter Tomorrows.
          </p>
        </div>

        <div className="mt-1">
          <p className="text-xs font-medium text-slate-400">Good Evening,</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight">
            <span className="text-white">Lost today?</span>
            <br />
            <span className="text-cyan-400">Found tomorrow.</span>
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            A safer, smarter campus for everyone.
          </p>
        </div>

        <div className="relative mt-6 flex items-center">
          <Search size={18} className="absolute left-4 text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for lost or found items..."
            className="h-12 w-full rounded-2xl border border-cyan-500/25 bg-[#090e23]/80 pl-11 pr-12 text-xs text-white placeholder-slate-500 outline-none backdrop-blur-xl transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("history")}
            className="absolute right-4 text-slate-400 transition hover:text-cyan-300"
          >
            <SlidersHorizontal size={17} />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3.5">
          <div
            onClick={() => triggerReportType("lost")}
            className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-blue-500/35 bg-gradient-to-b from-[#0e1d3e]/90 to-[#070f22]/95 p-4 shadow-[0_0_30px_rgba(37,99,235,0.22)] backdrop-blur-2xl transition hover:border-cyan-400/50 active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
              <Send size={20} className="-rotate-12" />
            </div>

            <div className="mt-6">
              <div className="h-[2px] w-5 rounded bg-cyan-400" />
              <h3 className="mt-2 text-base font-bold text-white">
                Report <span className="text-cyan-400">Lost Item</span>
              </h3>
              <p className="mt-1.5 text-[10px] leading-snug text-slate-400">
                Tell us what you lost. We’ll help you find it.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-md transition group-hover:scale-110">
                <ChevronRight size={16} />
              </div>
            </div>
          </div>

          <div
            onClick={() => triggerReportType("found")}
            className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-purple-500/35 bg-gradient-to-b from-[#1c1236]/90 to-[#0d071c]/95 p-4 shadow-[0_0_30px_rgba(168,85,247,0.22)] backdrop-blur-2xl transition hover:border-purple-400/50 active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-300">
              <Box size={22} />
            </div>

            <div className="mt-6">
              <div className="h-[2px] w-5 rounded bg-purple-400" />
              <h3 className="mt-2 text-base font-bold text-white">
                Report <span className="text-purple-400">Found Item</span>
              </h3>
              <p className="mt-1.5 text-[10px] leading-snug text-slate-400">
                Found something? Help it reach its owner.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white shadow-md transition group-hover:scale-110">
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-wide text-white">Recent Activity</h3>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("history")}
              className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:underline"
            >
              <span>See All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="mt-3.5 space-y-3">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Loading campus feed...
              </div>
            ) : displayedReports.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center text-xs text-slate-500">
                No reports found yet. Click a card above to submit one!
              </div>
            ) : (
              displayedReports.slice(0, 3).map((item) => {
                const isLost = item.type === "lost"
                return (
                  <div
                    key={item.id || item._id}
                    onClick={() => onSelectReport && onSelectReport(item)}
                    className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0c1224]/80 p-3.5 backdrop-blur-xl transition hover:border-cyan-400/30 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.itemName}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-600">
                            <Box size={22} />
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                          {item.itemName}
                        </h4>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin size={11} className="text-slate-500" />
                          <span className="truncate max-w-[140px]">
                            {item.location || "Campus"}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                          <Clock size={10} />
                          <span>{getTimeAgo(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase ${
                          isLost
                            ? "border border-rose-500/30 bg-rose-500/15 text-rose-400"
                            : "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        {item.type}
                      </span>
                      <ChevronRight
                        size={15}
                        className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-300"
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-4 z-50 mx-auto max-w-sm px-4">
        <nav className="flex h-16 items-center justify-around rounded-full border border-cyan-500/20 bg-[#070b19]/90 px-3 shadow-[0_0_35px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab("home")
              if (onNavigate) onNavigate("hero")
            }}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === "home" ? "text-cyan-400" : "text-slate-400 hover:text-cyan-300"
            }`}
          >
            <Home size={18} />
            <span className="text-[9px] font-bold">Home</span>
            {activeTab === "home" && (
              <span className="h-1 w-3 rounded-full bg-cyan-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("explore")
              if (onNavigate) onNavigate("history")
            }}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === "explore" ? "text-cyan-400" : "text-slate-400 hover:text-cyan-300"
            }`}
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
            onClick={() => {
              setActiveTab("history")
              if (onNavigate) onNavigate("history")
            }}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === "history" ? "text-cyan-400" : "text-slate-400 hover:text-cyan-300"
            }`}
          >
            <HistoryIcon size={18} />
            <span className="text-[9px] font-medium">History</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("profile")
              if (onNavigate) onNavigate("profile")
            }}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === "profile" ? "text-cyan-400" : "text-slate-400 hover:text-cyan-300"
            }`}
          >
            <User size={18} />
            <span className="text-[9px] font-medium">Profile</span>
          </button>
        </nav>
      </div>
    </div>
  )
}