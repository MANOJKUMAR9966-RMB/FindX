import { useState, useRef } from "react"
import {
  ChevronLeft,
  Camera,
  Pencil,
  CheckCircle2,
  ChevronDown,
  Save,
  ShieldCheck,
  User,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  FileText,
  Users,
  ArrowRight,
} from "lucide-react"

export default function EditProfile({ onBack, onSaveSuccess }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("findx:user-profile")
      return saved
        ? JSON.parse(saved)
        : {
            fullName: "MANOJ",
            email: "manojkumark6070@gmail.com",
            phone: "+91 98765 43210",
            college: "VIT-AP University",
            location: "Amaravati, Andhra Pradesh",
            bio: "Tech enthusiast | Always ready to help the campus community",
            accountType: "Student",
            avatarUrl:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
          }
    } catch {
      return {
        fullName: "MANOJ",
        email: "manojkumark6070@gmail.com",
        phone: "+91 98765 43210",
        college: "VIT-AP University",
        location: "Amaravati, Andhra Pradesh",
        bio: "Tech enthusiast | Always ready to help the campus community",
        accountType: "Student",
        avatarUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      }
    }
  })

  const fileInputRef = useRef(null)

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size exceeds 5MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      setProfile((prev) => ({
        ...prev,
        avatarUrl: uploadEvent.target.result,
      }))
    }
    reader.readAsDataURL(file)
  }

  function handleSave(e) {
    e.preventDefault()
    try {
      localStorage.setItem("findx:user-profile", JSON.stringify(profile))
      if (onSaveSuccess) onSaveSuccess(profile)
      if (onBack) onBack()
    } catch (err) {
      console.error("FINDX: Failed to save profile:", err)
    }
  }

  return (
    <div className="relative min-h-screen select-none bg-[#030712] pb-24 font-sans text-white antialiased">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoChange}
        accept="image/png, image/jpeg, image/jpg"
        className="hidden"
      />

      <div className="relative z-10 mx-auto max-w-md px-5 pt-4">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md transition hover:border-cyan-400/40"
          >
            <ChevronLeft size={20} className="text-slate-300" />
          </button>

          <div className="text-center">
            <h1 className="text-base font-bold text-white">Edit Profile</h1>
            <p className="text-[10px] text-slate-400">Keep your details up to date</p>
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

        {/* Profile Banner */}
        <div className="relative mt-6 overflow-hidden rounded-3xl border border-cyan-500/25 bg-gradient-to-r from-[#0c1a3b]/90 via-[#07132c]/90 to-[#120e2a]/90 p-4 shadow-[0_0_30px_rgba(14,165,233,0.15)] backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
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
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border border-cyan-400/60 bg-[#070e24] text-cyan-300 shadow-md transition hover:scale-110"
                >
                  <Camera size={12} />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-lg font-extrabold text-white uppercase">{profile.fullName}</h2>
                  <Pencil size={13} className="text-slate-400" />
                </div>
                <p className="text-xs font-semibold text-cyan-400">FINDX Member</p>
                <p className="mt-1 text-[10px] text-slate-400 italic leading-snug">
                  “Small actions make a safer campus.”
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)] transition hover:border-cyan-400 hover:bg-cyan-500/20"
              >
                <Camera size={14} />
                <span>Change Photo</span>
              </button>
              <span className="mt-1 text-[8px] text-slate-500">JPG, PNG (Max 5MB)</span>
            </div>
          </div>
        </div>

        {/* Form with autoComplete disabled to kill Chrome popup */}
        <form onSubmit={handleSave} autoComplete="off" className="mt-5 space-y-3.5">
          {/* 1. Full Name */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c1224]/80 p-3.5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <User size={19} />
              </div>
              <div className="w-full">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="font-bold uppercase tracking-wider text-slate-300">
                    Full Name
                  </span>
                  <span className="text-slate-500">This is how your name appears on FINDX</span>
                </div>
                <div className="relative mt-1 flex items-center">
                  <input
                    type="text"
                    name="findx_name_field"
                    autoComplete="off"
                    value={profile.fullName}
                    onChange={(e) =>
                      setProfile({ ...profile, fullName: e.target.value })
                    }
                    className="h-9 w-full rounded-lg bg-transparent text-sm font-medium text-white outline-none"
                  />
                  <Pencil size={13} className="absolute right-1 text-slate-500" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Email Address */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c1224]/80 p-3.5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Mail size={19} />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold uppercase tracking-wider text-slate-300">
                      Email Address
                    </span>
                    <span className="text-slate-500">Used for account access</span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                    <CheckCircle2 size={10} />
                    Verified
                  </span>
                </div>
                <div className="relative mt-1 flex items-center">
                  <input
                    type="text"
                    name="findx_email_field"
                    autoComplete="off"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="h-9 w-full rounded-lg bg-transparent text-sm font-medium text-white outline-none"
                  />
                  <Pencil size={13} className="absolute right-1 text-slate-500" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Phone Number */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c1224]/80 p-3.5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Phone size={19} />
              </div>
              <div className="w-full">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="font-bold uppercase tracking-wider text-slate-300">
                    Phone Number
                  </span>
                  <span className="text-slate-500">Helps in account recovery (kept private)</span>
                </div>
                <div className="relative mt-1 flex items-center">
                  <input
                    type="tel"
                    name="findx_phone_field"
                    autoComplete="off"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="h-9 w-full rounded-lg bg-transparent text-sm font-medium text-white outline-none font-mono"
                  />
                  <Pencil size={13} className="absolute right-1 text-slate-500" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. College / University */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c1224]/80 p-3.5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <GraduationCap size={19} />
              </div>
              <div className="w-full">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="font-bold uppercase tracking-wider text-slate-300">
                    College / University
                  </span>
                  <span className="text-slate-500">Tell us where you study</span>
                </div>
                <div className="relative mt-1 flex items-center">
                  <select
                    value={profile.college}
                    onChange={(e) =>
                      setProfile({ ...profile, college: e.target.value })
                    }
                    className="h-9 w-full cursor-pointer appearance-none rounded-lg bg-transparent text-sm font-medium text-white outline-none"
                  >
                    <option value="VIT-AP University" className="bg-[#0b1020] text-white">
                      VIT-AP University
                    </option>
                    <option value="Vignan's IIT (VIIT)" className="bg-[#0b1020] text-white">
                      Vignan's Institute of Information Technology
                    </option>
                    <option value="GITAM University" className="bg-[#0b1020] text-white">
                      GITAM University
                    </option>
                    <option value="Andhra University" className="bg-[#0b1020] text-white">
                      Andhra University
                    </option>
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-1 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* 5. Location */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c1224]/80 p-3.5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <MapPin size={19} />
              </div>
              <div className="w-full">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="font-bold uppercase tracking-wider text-slate-300">
                    Location
                  </span>
                  <span className="text-slate-500">Helps us show relevant results near you</span>
                </div>
                <div className="relative mt-1 flex items-center">
                  <select
                    value={profile.location}
                    onChange={(e) =>
                      setProfile({ ...profile, location: e.target.value })
                    }
                    className="h-9 w-full cursor-pointer appearance-none rounded-lg bg-transparent text-sm font-medium text-white outline-none"
                  >
                    <option value="Amaravati, Andhra Pradesh" className="bg-[#0b1020] text-white">
                      Amaravati, Andhra Pradesh
                    </option>
                    <option value="Visakhapatnam, Andhra Pradesh" className="bg-[#0b1020] text-white">
                      Visakhapatnam, Andhra Pradesh
                    </option>
                    <option value="Vijayawada, Andhra Pradesh" className="bg-[#0b1020] text-white">
                      Vijayawada, Andhra Pradesh
                    </option>
                    <option value="Hyderabad, Telangana" className="bg-[#0b1020] text-white">
                      Hyderabad, Telangana
                    </option>
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-1 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* 6. Bio */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c1224]/80 p-3.5 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <FileText size={19} />
              </div>
              <div className="w-full">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="font-bold uppercase tracking-wider text-slate-300">
                    Bio (Optional)
                  </span>
                  <span className="text-slate-500">A short line about you</span>
                </div>
                <div className="relative mt-1">
                  <textarea
                    rows={2}
                    maxLength={150}
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    className="w-full resize-none rounded-lg bg-transparent text-xs leading-relaxed text-white outline-none"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] text-slate-500 font-mono">
                      {profile.bio.length}/150
                    </span>
                    <Pencil size={13} className="text-slate-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7. Account Type */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c1224]/80 p-3.5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Users size={19} />
              </div>
              <div className="w-full">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="font-bold uppercase tracking-wider text-slate-300">
                    Account Type
                  </span>
                  <span className="text-slate-500">Let us know your role</span>
                </div>
                <div className="relative mt-1 flex items-center">
                  <select
                    value={profile.accountType}
                    onChange={(e) =>
                      setProfile({ ...profile, accountType: e.target.value })
                    }
                    className="h-9 w-full cursor-pointer appearance-none rounded-lg bg-transparent text-sm font-medium text-white outline-none"
                  >
                    <option value="Student" className="bg-[#0b1020] text-white">
                      Student
                    </option>
                    <option value="Faculty / Staff" className="bg-[#0b1020] text-white">
                      Faculty / Staff
                    </option>
                    <option value="Security Personnel" className="bg-[#0b1020] text-white">
                      Security Personnel
                    </option>
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-1 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Save Changes Button */}
          <button
            type="submit"
            className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-sm font-bold tracking-wider text-white shadow-[0_0_25px_rgba(6,182,212,0.45)] transition hover:brightness-110 active:scale-[0.99]"
          >
            <Save size={18} />
            <span>Save Changes</span>
            <ArrowRight size={17} className="ml-1" />
          </button>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-slate-400">
            <ShieldCheck size={14} className="text-cyan-400" />
            <span>Your information is safe and never shared publicly.</span>
          </div>
        </form>
      </div>
    </div>
  )
}