import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  X,
  ShieldCheck,
  ArrowRight,
} from "lucide-react"

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Safety", href: "#safety" },
    { label: "About", href: "#about" },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50">

      {/* Navigation shell */}
      <div className="mx-auto mt-4 w-[calc(100%-28px)] max-w-7xl">

        <nav
          className="
            relative
            flex
            h-16
            items-center
            justify-between
            rounded-2xl
            border
            border-white/[0.08]
            bg-[#080b10]/75
            px-4
            shadow-[0_16px_50px_rgba(0,0,0,0.28)]
            backdrop-blur-2xl
            md:px-5
          "
        >

          {/* ================================
              LOGO
              ================================= */}

          <a
            href="#"
            className="group flex items-center gap-3"
            aria-label="FINDX home"
          >
            <div
              className="
                relative
                flex
                h-9
                w-9
                items-center
                justify-center
                overflow-hidden
                rounded-xl
                border
                border-blue-400/20
                bg-blue-400/10
              "
            >
              <div className="absolute inset-0 bg-blue-400/10 blur-xl" />

              <span className="relative text-sm font-bold text-blue-300">
                F
              </span>
            </div>

            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-[0.18em] text-white">
                FINDX
              </span>

              <span className="mt-1 hidden text-[9px] tracking-[0.18em] text-slate-500 sm:block">
                RECOVERY INTELLIGENCE
              </span>
            </div>
          </a>

          {/* ================================
              DESKTOP NAVIGATION
              ================================= */}

          <div className="hidden items-center gap-1 md:flex">

            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="
                  rounded-xl
                  px-4
                  py-2
                  text-sm
                  text-slate-400
                  transition-colors
                  duration-200
                  hover:bg-white/[0.04]
                  hover:text-white
                "
              >
                {link.label}
              </a>
            ))}

          </div>

          {/* ================================
              DESKTOP ACTIONS
              ================================= */}

          <div className="hidden items-center gap-2 md:flex">

            <a
              href="#signin"
              className="
                rounded-xl
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-300
                transition-colors
                duration-200
                hover:text-white
              "
            >
              Sign in
            </a>

            <a
              href="#report"
              className="
                group
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-white
                px-4
                py-2.5
                text-sm
                font-semibold
                text-black
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-slate-100
              "
            >
              <ShieldCheck size={15} />

              Report lost

              <ArrowRight
                size={14}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                "
              />
            </a>

          </div>

          {/* ================================
              MOBILE MENU BUTTON
              ================================= */}

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-white/[0.08]
              bg-white/[0.04]
              text-slate-300
              transition-colors
              hover:bg-white/[0.08]
              hover:text-white
              md:hidden
            "
            aria-label={
              mobileOpen
                ? "Close navigation"
                : "Open navigation"
            }
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X size={19} />
            ) : (
              <Menu size={19} />
            )}
          </button>

        </nav>

        {/* ================================
            MOBILE MENU
            ================================= */}

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -10,
                scale: 0.98,
              }}
              transition={{
                duration: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                mt-2
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.08]
                bg-[#080b10]/95
                p-2
                shadow-[0_20px_60px_rgba(0,0,0,0.35)]
                backdrop-blur-2xl
                md:hidden
              "
            >

              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="
                    block
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    text-slate-300
                    transition-colors
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  {link.label}
                </a>
              ))}

              <div className="my-2 h-px bg-white/[0.06]" />

              <a
                href="#signin"
                onClick={() => setMobileOpen(false)}
                className="
                  block
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  text-slate-300
                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >
                Sign in
              </a>

              <a
                href="#report"
                onClick={() => setMobileOpen(false)}
                className="
                  mt-1
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-black
                "
              >
                <ShieldCheck size={15} />
                Report lost
              </a>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </header>
  )
}

export default Navbar