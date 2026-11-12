import React, { useState } from "react"
import {
  Users,
  Box,
  Globe2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Check
} from "lucide-react"

export default function Login({ onLogin }) {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onLogin) {
      onLogin({ identifier, password, rememberMe })
    }
  }

  return (
    <div className="relative min-h-screen w-full select-none overflow-x-hidden bg-[#070913] font-sans text-white antialiased">
      {/* Background Graphic with Cinematic Darkening Overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/login-bg.png')` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0d1e]/80 via-[#070914]/85 to-[#04060c]/95 backdrop-blur-[2px]" />

      {/* Floating Side Vertical Navigation Tabs (Left Sidebar) */}
      <div className="fixed left-3 top-28 z-20 hidden flex-col items-center gap-6 sm:flex">
        <button type="button" className="flex flex-col items-center gap-1 text-slate-400 transition hover:text-cyan-300">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
            <Users size={18} />
          </div>
          <span className="text-[10px] uppercase tracking-wider">People</span>
        </button>

        <button type="button" className="flex flex-col items-center gap-1 text-slate-400 transition hover:text-cyan-300">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
            <Box size={18} />
          </div>
          <span className="text-[10px] uppercase tracking-wider">Items</span>
        </button>

        <button type="button" className="flex flex-col items-center gap-1 text-slate-400 transition hover:text-cyan-300">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
            <Globe2 size={18} />
          </div>
          <span className="text-[9px] uppercase tracking-wider">Communities</span>
        </button>
      </div>

      {/* Ambient Side Slogans */}
      <div className="pointer-events-none fixed bottom-14 left-5 z-10 hidden text-slate-400/80 italic lg:block">
        <p className="text-sm font-light leading-snug">Lost Today.<br />New Stories<br />Same People :)</p>
      </div>

      <div className="pointer-events-none fixed right-6 top-28 z-10 hidden text-right italic lg:block">
        <p className="bg-gradient-to-r from-pink-300 to-amber-200 bg-clip-text text-sm font-medium text-transparent">
          Good Things<br />Find People<br />:)
        </p>
      </div>

      <div className="pointer-events-none fixed bottom-14 right-6 z-10 hidden text-right italic text-slate-400/80 lg:block">
        <p className="text-sm font-light leading-snug">More<br />Than<br />A Search</p>
      </div>

      {/* Main Container */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-between px-5 py-8 sm:px-6">
        {/* Top Header Section */}
        <div className="w-full">
          <div className="mb-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Lost Today.<br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Found Tomorrow.
              </span>
            </h1>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="h-[2px] w-6 rounded bg-gradient-to-r from-pink-500 to-cyan-400" />
              <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                A Smarter Way To Reunite What Matters.
              </p>
            </div>
          </div>

          {/* Glowing App Icon + Brand Name */}
          <div className="mt-5 flex flex-col items-center text-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-b from-cyan-500/20 to-blue-600/30 shadow-[0_0_25px_rgba(6,182,212,0.45)] backdrop-blur-xl">
              <Sparkles size={26} className="text-cyan-200" />
            </div>

            <h2 className="mt-3 text-3xl font-black tracking-wider text-white">
              FIND<span className="text-cyan-400">X</span>
            </h2>
            <p className="text-xs text-slate-300">
              Find it. Verify it. Recover it.
            </p>
          </div>
        </div>

        {/* Central Glowing Form Card */}
        <div className="relative mt-5 w-full rounded-3xl border border-cyan-500/30 bg-[#090e21]/75 p-6 shadow-[0_0_40px_rgba(14,165,233,0.18)] backdrop-blur-2xl">
          {/* Card Badge */}
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <ShieldCheck size={16} />
            <span>Secure Access</span>
          </div>

          <h3 className="mt-2 text-2xl font-extrabold text-white">
            Login to FIND<span className="text-cyan-400">X</span>
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Enter your account details to continue your recovery journey.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Username / Email Field */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                Username / Email
              </label>
              <div className="relative mt-1.5 flex items-center">
                <Mail size={18} className="absolute left-4 text-cyan-300" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter username or email"
                  className="h-12 w-full rounded-2xl border border-cyan-400/40 bg-white/[0.03] pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none shadow-inner transition focus:border-cyan-400 focus:bg-cyan-500/[0.05] focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <a href="#forgot" className="text-xs font-medium text-cyan-400 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative mt-1.5 flex items-center">
                <Lock size={18} className="absolute left-4 text-cyan-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="h-12 w-full rounded-2xl border border-cyan-400/40 bg-white/[0.03] pl-11 pr-11 text-sm text-white placeholder-slate-500 outline-none shadow-inner transition focus:border-cyan-400 focus:bg-cyan-500/[0.05] focus:ring-1 focus:ring-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 transition hover:text-cyan-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`flex h-4 w-4 items-center justify-center rounded-md border transition ${
                  rememberMe ? "border-cyan-400 bg-cyan-500 text-black" : "border-slate-600 bg-transparent"
                }`}
              >
                {rememberMe && <Check size={12} strokeWidth={3} />}
              </button>
              <label
                onClick={() => setRememberMe(!rememberMe)}
                className="cursor-pointer text-xs font-medium text-slate-300"
              >
                Remember me
              </label>
            </div>

            {/* Login CTA Button */}
            <button
              type="submit"
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-sm font-bold tracking-wider text-white shadow-[0_0_25px_rgba(6,182,212,0.5)] transition hover:brightness-110 active:scale-[0.99]"
            >
              <span>LOGIN</span>
              <ArrowRight size={17} />
            </button>

            {/* Signup Link */}
            <p className="text-center text-xs text-slate-400">
              Don't have an account?{" "}
              <a href="#signup" className="font-semibold text-cyan-400 hover:underline">
                Create account
              </a>
            </p>

            {/* Security Guarantee Notice */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/25 p-3 text-left">
              <ShieldCheck size={20} className="shrink-0 text-emerald-400" />
              <p className="text-[11px] leading-snug text-slate-300">
                Your FINDX recovery information is protected throughout the recovery process.
              </p>
            </div>
          </form>
        </div>

        {/* Bottom Accent Footer */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="h-[2px] w-8 rounded bg-cyan-400" />
          <span className="text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase">
            A Safer Tomorrow Together
          </span>
          <span className="h-[2px] w-8 rounded bg-purple-500" />
        </div>
      </div>
    </div>
  )
}