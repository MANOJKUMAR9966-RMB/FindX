import { useEffect, useState } from "react"
import {
  Bell,
  Lock,
  History as HistoryIcon,
  BookOpen,
  User,
  Info,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Pencil,
  Home,
  Compass,
  Plus,
} from "lucide-react"

export default function Profile({ onNavigate, onLogout }) {
  const [profile, setProfile] = useState({
    fullName: "Student",
    email: "student@example.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  })

  // Load latest edited profile on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("findx:user-profile")
      if (saved) {
        setProfile(JSON.parse(saved))
      }
    } catch {
      // Keep defaults
    }
  }, [])

  function triggerReportType(type) {
    window.dispatchEvent(
      new CustomEvent("findx:select-report-type", {
        detail: { type },
      })
    )
  }

  return (
    <div className="relative min-h-screen select-none bg-[#030712] pb-36 font-sans text-white antialiased">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-purple-600/15 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-md px-5 pt-4">
        {/* Top Header */}
        <header className="flex items-center justify-between">
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

          <button
            type="button"
            onClick={() => onNavigate && onNavigate("history")}
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md transition hover:border-cyan-400/40"
          >
            <Bell size={18} className="text-slate-300" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]" />
          </button>
        </header>

        {/* User Profile Card */}
        <div className="mt-7 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.45)]">
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("edit-profile")}
                className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border border-cyan-400/50 bg-[#070e24] text-cyan-300 shadow-md transition hover:scale-110"
              >
                <Pencil size={11} />
              </button>
            </div>

            <div>
              <h2 className="flex items-center gap-1.5 text-lg font-bold text-white">
                Hi, {profile.fullName} <span>👋</span>
              </h2>
              <p className="text-xs text-slate-400">{profile.email}</p>

              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                <ShieldCheck size={13} className="text-cyan-400" />
                <span>FINDX Member</span>
              </div>
            </div>
          </div>

          <p className="mt-1 max-w-[110px] text-right font-serif text-[11px] italic leading-tight text-cyan-200/80">
            “Same Campus Brighter Tomorrows.”
          </p>
        </div>

        {/* Top 3 Feature Cards */}
        <div className="mt-7 space-y-3.5">
          {/* Change Password Card */}
          <div
            onClick={() => onNavigate && onNavigate("change-password")}
            className="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-blue-500/35 bg-gradient-to-r from-[#0c1836]/90 to-[#071024]/90 p-4 backdrop-blur-xl transition hover:border-cyan-400/50 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                  Change Password
                </h3>
                <p className="text-[11px] text-slate-400">Keep your account secure</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
          </div>

          {/* History Card */}
          <div
            onClick={() => onNavigate && onNavigate("history")}
            className="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-purple-500/35 bg-gradient-to-r from-[#180e30]/90 to-[#0d071d]/90 p-4 backdrop-blur-xl transition hover:border-purple-400/50 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-300">
                <HistoryIcon size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                  History
                </h3>
                <p className="text-[11px] text-slate-400">View your past reports and activity</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-purple-300" />
          </div>

          {/* How to Use Card */}
          <div className="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-emerald-500/35 bg-gradient-to-r from-[#0b241f]/90 to-[#051410]/90 p-4 backdrop-blur-xl transition hover:border-emerald-400/50 active:scale-[0.99]">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                  How to Use
                </h3>
                <p className="text-[11px] text-slate-400">A simple guide to help you get started</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-emerald-300" />
          </div>
        </div>

        {/* Secondary Navigation Options */}
        <div className="mt-3.5 space-y-3">
          {/* Edit Profile Row */}
          <div
            onClick={() => onNavigate && onNavigate("edit-profile")}
            className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0c1224]/80 p-4 backdrop-blur-xl transition hover:border-cyan-400/30 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] text-slate-300">
                <User size={19} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">Edit Profile</h4>
                <p className="text-[11px] text-slate-400">Update your personal information</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
          </div>

          {/* Notifications */}
          <div className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0c1224]/80 p-4 backdrop-blur-xl transition hover:border-cyan-400/30 active:scale-[0.99]">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] text-slate-300">
                <Bell size={19} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">Notifications</h4>
                <p className="text-[11px] text-slate-400">Manage your notification preferences</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
          </div>

          {/* About FINDX */}
          <div className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0c1224]/80 p-4 backdrop-blur-xl transition hover:border-cyan-400/30 active:scale-[0.99]">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] text-slate-300">
                <Info size={19} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">About FINDX</h4>
                <p className="text-[11px] text-slate-400">Learn more about our mission</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
          </div>

          {/* Logout */}
          <div
            onClick={onLogout}
            className="group flex cursor-pointer items-center justify-between rounded-2xl border border-red-500/30 bg-red-950/20 p-4 backdrop-blur-xl transition hover:border-red-500/50 hover:bg-red-950/30 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <LogOut size={19} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-red-400">Logout</h4>
                <p className="text-[11px] text-red-300/70">Sign out from your account</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-red-400 transition group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Floating Bottom Navigation Bar */}
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
            className="flex flex-col items-center gap-1 text-slate-400 transition hover:text-cyan-300"
          >
            <HistoryIcon size={18} />
            <span className="text-[9px] font-medium">History</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate("profile")}
            className="flex flex-col items-center gap-1 text-cyan-400"
          >
            <User size={18} />
            <span className="text-[9px] font-bold">Profile</span>
            <span className="h-1 w-3 rounded-full bg-cyan-400" />
          </button>
        </nav>
      </div>
    </div>
  )
}