import { motion } from "framer-motion"
import {
  BrainCircuit,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react"

const features = [
  {
    number: "01",
    icon: BrainCircuit,
    title: "Multimodal matching",
    description:
      "FINDX can combine item descriptions, visual clues, context and time to identify stronger potential matches.",
    tags: ["Description", "Visual", "Context", "Time"],
  },
  {
    number: "02",
    icon: Fingerprint,
    title: "Ownership verification",
    description:
      "A similarity score is only a candidate signal. FINDX keeps ownership verification as a separate recovery step.",
    tags: ["Proof", "Verification", "Trust"],
  },
  {
    number: "03",
    icon: LockKeyhole,
    title: "Privacy-preserving contact",
    description:
      "People can communicate through FINDX without unnecessarily exposing personal contact details or private locations.",
    tags: ["Private", "Controlled", "Secure"],
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Controlled recovery",
    description:
      "Successful matches can move through an authorized lost-and-found desk or controlled pickup point for safer handover.",
    tags: ["Handover", "Security", "Recovery"],
  },
]

function Features() {
  return (
    <section
      id="safety"
      className="relative py-28 sm:py-36"
    >
      <div className="findx-container">

        {/* ========================================
            SECTION HEADER
            ======================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="max-w-2xl"
        >

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/[0.08]
              bg-white/[0.03]
              px-3.5
              py-2
              text-xs
              font-medium
              tracking-wide
              text-slate-400
            "
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

            WHY FINDX
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
            More than a
            <br />

            <span className="findx-gradient-text">
              lost-and-found board.
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
            FINDX is designed around the difficult parts of
            recovery: finding the right match, establishing
            ownership, protecting privacy, and completing the
            handover safely.
          </p>

        </motion.div>


        {/* ========================================
            FEATURE GRID
            ======================================== */}

        <div
          className="
            mt-16
            grid
            gap-4
            md:grid-cols-2
          "
        >

          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <motion.article
                key={feature.number}
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -4,
                }}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  p-6
                  transition-colors
                  duration-300
                  hover:border-white/[0.12]
                  hover:bg-white/[0.035]
                  sm:p-7
                "
              >

                {/* Subtle hover glow */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-40
                    w-40
                    rounded-full
                    bg-blue-500/[0.06]
                    blur-3xl
                    opacity-0
                    transition-opacity
                    duration-500
                    group-hover:opacity-100
                  "
                />


                {/* Top row */}

                <div className="relative flex items-start justify-between">

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-blue-400/15
                      bg-blue-400/[0.07]
                    "
                  >
                    <Icon
                      size={21}
                      className="text-blue-300"
                    />
                  </div>


                  <span
                    className="
                      text-[10px]
                      font-semibold
                      tracking-[0.18em]
                      text-slate-600
                    "
                  >
                    {feature.number}
                  </span>

                </div>


                {/* Content */}

                <div className="relative mt-7">

                  <h3
                    className="
                      text-xl
                      font-semibold
                      tracking-[-0.025em]
                      text-white
                    "
                  >
                    {feature.title}
                  </h3>


                  <p
                    className="
                      mt-3
                      max-w-lg
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    {feature.description}
                  </p>

                </div>


                {/* Tags */}

                <div className="relative mt-7 flex flex-wrap gap-2">

                  {feature.tags.map((tag) => (
                    <span
                      key={tag}
                      className="
                        rounded-full
                        border
                        border-white/[0.06]
                        bg-white/[0.025]
                        px-2.5
                        py-1
                        text-[10px]
                        font-medium
                        text-slate-500
                      "
                    >
                      {tag}
                    </span>
                  ))}

                </div>

              </motion.article>
            )
          })}

        </div>


        {/* ========================================
            CORE PRINCIPLE
            ======================================== */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.98,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.6,
          }}
          className="
            mt-5
            rounded-3xl
            border
            border-blue-400/[0.10]
            bg-blue-400/[0.025]
            p-6
            sm:p-8
          "
        >

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-blue-400/15
                bg-blue-400/[0.08]
              "
            >
              <BrainCircuit
                size={20}
                className="text-blue-300"
              />
            </div>


            <div>

              <p className="text-sm font-semibold text-white">
                FINDX principle
              </p>

              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                Matching identifies a potential connection.
                Verification establishes trust. Recovery
                completes the journey.
              </p>

            </div>

          </div>

        </motion.div>

      </div>
    </section>
  )
}

export default Features