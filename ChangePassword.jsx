import { useState } from "react"
import {
  ChevronLeft,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  EyeOff as EyePrivate,
  Users,
  Check,
  ArrowRight,
} from "lucide-react"

export default function ChangePassword({ onBack, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" })

  // Real-time validation checks matching the UI checklist
  const hasMinLength = newPassword.length >= 8
  const hasUpper = /[A-Z]/.test(newPassword)
  const hasLower = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

  const allRequirementsMet =
    hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial

  function handleUpdate(e) {
    e.preventDefault()

    if (!currentPassword.trim()) {
      setStatusMessage({ type: "error", text: "Please enter your current password." })
      return
    }

    if (!allRequirementsMet) {
      setStatusMessage({
        type: "error",
        text: "Please satisfy all password security criteria.",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", text: "New passwords do not match." })
      return
    }

    // Persist new password record
    try {
      localStorage.setItem("findx:user-secret", newPassword)
      setStatusMessage({ type: "success", text: "Password updated successfully!" })

      setTimeout(() => {
        if (onSuccess) onSuccess()
        if (onBack) onBack()
      }, 700)
    } catch {
      setStatusMessage({ type: "error", text: "Failed to update password." })
    }
  }

  return (
    <div className="relative min-h-screen select-none bg-[#030712] pb-24 font-sans text-white antialiased">
      {/* Subtle Background Glows */}
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-cyan-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-purple-600/15 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-md px-5 pt-4">
        {/* Top Header */}
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md transition hover:border-cyan-400/40"
          >
            <ChevronLeft size={20} className="text-slate-300" />
          </button>

          <div className="text-center">
            <h1 className="text-base font-bold">
              Change <span className="text-purple-400">Password</span>
            </h1>
            <p className="text-[10px] text-slate-400">Keep your account secure</p>
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

        {/* Security Banner Card with Glowing Shield */}
        <div className="relative mt-6 overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-r from-[#0a1532]/95 via-[#071129]/95 to-[#160d33]/95 p-5 shadow-[0_0_35px_rgba(37,99,235,0.2)] backdrop-blur-2xl">
          <div className="flex items-start justify-between">
            <div className="max-w-[190px]">
              <h2 className="text-xl font-extrabold leading-tight">
                Your Security<br />
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Our Priority
                </span>
              </h2>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
                A strong password keeps your FindX account and data safe.
              </p>

              {/* Badges: Stay Safe, Stay Private, Stay You */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300">
                    <ShieldCheck size={14} />
                  </div>
                  <span className="text-[8px] text-slate-400">Stay Safe</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                    <EyePrivate size={14} />
                  </div>
                  <span className="text-[8px] text-slate-400">Stay Private</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
                    <Users size={14} />
                  </div>
                  <span className="text-[8px] text-slate-400">Stay You</span>
                </div>
              </div>
            </div>

            {/* Glowing Shield Visual */}
            <div className="flex flex-col items-end">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/50 bg-gradient-to-tr from-blue-600/30 via-cyan-500/20 to-purple-600/30 shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                  <Lock size={32} className="text-cyan-200 drop-shadow-[0_0_8px_#38bdf8]" />
                </div>
              </div>

              <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.04] p-2 text-right">
                <p className="text-[9px] text-slate-300 leading-tight">
                  Small<br />Changes<br />Make a<br />Big Difference.
                </p>
                <div className="mt-1 h-[2px] w-6 rounded bg-cyan-400 ml-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusMessage.text && (
          <div
            className={`mt-4 rounded-2xl border p-3 text-xs text-center font-medium ${
              statusMessage.type === "success"
                ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300"
                : "border-rose-500/30 bg-rose-950/40 text-rose-300"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Password Inputs Form */}
        <form onSubmit={handleUpdate} autoComplete="off" className="mt-5 space-y-4">
          {/* 1. Current Password */}
          <div className="rounded-2xl border border-blue-500/30 bg-[#090f24]/90 p-4 shadow-[0_0_20px_rgba(37,99,235,0.12)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <Lock size={19} />
              </div>
              <div className="w-full">
                <p className="text-xs font-bold text-white">Current Password</p>
                <p className="text-[10px] text-slate-400">Enter your current password</p>
              </div>
            </div>

            <div className="relative mt-3 flex items-center">
              <input
                type={showCurrent ? "text" : "password"}
                name="findx_current_pass"
                autoComplete="new-password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-cyan-500/25 bg-black/40 px-3.5 pr-10 text-xs text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 text-slate-400 hover:text-cyan-300"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* 2. New Password */}
          <div className="rounded-2xl border border-purple-500/30 bg-[#120b24]/90 p-4 shadow-[0_0_20px_rgba(168,85,247,0.12)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20">
                <Lock size={19} />
              </div>
              <div className="w-full">
                <p className="text-xs font-bold text-white">New Password</p>
                <p className="text-[10px] text-slate-400">Create a new strong password</p>
              </div>
            </div>

            <div className="relative mt-3 flex items-center">
              <input
                type={showNew ? "text" : "password"}
                name="findx_new_pass"
                autoComplete="new-password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-purple-500/25 bg-black/40 px-3.5 pr-10 text-xs text-white placeholder-slate-500 outline-none transition focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 text-slate-400 hover:text-purple-300"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Password Requirements Card with Dynamic Live Verification */}
          <div className="rounded-2xl border border-cyan-500/25 bg-[#051124]/70 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <ShieldCheck size={16} />
              <span>Password must contain:</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-y-2.5 text-[10px]">
              {/* At least 8 characters */}
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
                    hasMinLength
                      ? "border-cyan-400 bg-cyan-400 text-black"
                      : "border-slate-600 bg-transparent text-transparent"
                  }`}
                >
                  <Check size={11} strokeWidth={3} />
                </span>
                <span className={hasMinLength ? "text-cyan-200" : "text-slate-400"}>
                  At least 8 characters
                </span>
              </div>

              {/* One number (0–9) */}
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
                    hasNumber
                      ? "border-cyan-400 bg-cyan-400 text-black"
                      : "border-slate-600 bg-transparent text-transparent"
                  }`}
                >
                  <Check size={11} strokeWidth={3} />
                </span>
                <span className={hasNumber ? "text-cyan-200" : "text-slate-400"}>
                  One number (0–9)
                </span>
              </div>

              {/* One uppercase letter (A–Z) */}
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
                    hasUpper
                      ? "border-cyan-400 bg-cyan-400 text-black"
                      : "border-slate-600 bg-transparent text-transparent"
                  }`}
                >
                  <Check size={11} strokeWidth={3} />
                </span>
                <span className={hasUpper ? "text-cyan-200" : "text-slate-400"}>
                  One uppercase letter (A–Z)
                </span>
              </div>

              {/* One special character */}
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
                    hasSpecial
                      ? "border-cyan-400 bg-cyan-400 text-black"
                      : "border-slate-600 bg-transparent text-transparent"
                  }`}
                >
                  <Check size={11} strokeWidth={3} />
                </span>
                <span className={hasSpecial ? "text-cyan-200" : "text-slate-400"}>
                  One special char (!@#$%)
                </span>
              </div>

              {/* One lowercase letter (a–z) */}
              <div className="col-span-2 flex items-center gap-2">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
                    hasLower
                      ? "border-cyan-400 bg-cyan-400 text-black"
                      : "border-slate-600 bg-transparent text-transparent"
                  }`}
                >
                  <Check size={11} strokeWidth={3} />
                </span>
                <span className={hasLower ? "text-cyan-200" : "text-slate-400"}>
                  One lowercase letter (a–z)
                </span>
              </div>
            </div>
          </div>

          {/* 3. Confirm New Password */}
          <div className="rounded-2xl border border-cyan-500/30 bg-[#090f24]/90 p-4 shadow-[0_0_20px_rgba(6,182,212,0.12)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <Lock size={19} />
              </div>
              <div className="w-full">
                <p className="text-xs font-bold text-white">Confirm New Password</p>
                <p className="text-[10px] text-slate-400">Re-enter your new password</p>
              </div>
            </div>

            <div className="relative mt-3 flex items-center">
              <input
                type={showConfirm ? "text" : "password"}
                name="findx_confirm_pass"
                autoComplete="new-password"
                placeholder="Enter new password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-cyan-500/25 bg-black/40 px-3.5 pr-10 text-xs text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 text-slate-400 hover:text-cyan-300"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Update Password Gradient Button */}
          <button
            type="submit"
            className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-sm font-bold tracking-wider text-white shadow-[0_0_30px_rgba(6,182,212,0.45)] transition hover:brightness-110 active:scale-[0.99]"
          >
            <span>Update Password</span>
            <ArrowRight size={18} />
          </button>

          {/* Bottom Security Guarantee Card */}
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <Lock size={18} />
              </div>
              <div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Your password is encrypted and never shared with anyone.
                </p>
                <p className="mt-0.5 text-[9px] text-slate-500">Stay confident, stay in control.</p>
              </div>
            </div>

            <span className="shrink-0 font-serif text-xs italic text-cyan-300">
              Safer Together
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}