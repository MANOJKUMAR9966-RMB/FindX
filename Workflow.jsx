import { motion } from "framer-motion"
import {
  ArrowRight,
  FileSearch,
  ShieldCheck,
  PackageCheck,
} from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Report",
    description:
      "Describe what was lost or found and provide the details FINDX needs to search intelligently.",
    icon: FileSearch,
  },
  {
    number: "02",
    title: "Match",
    description:
      "FINDX compares descriptions, visual clues, context and timing to identify potential matches.",
    icon: ArrowRight,
  },
  {
    number: "03",
    title: "Verify",
    description:
      "A potential match is not ownership proof. FINDX requires verification before recovery.",
    icon: ShieldCheck,
  },
  {
    number: "04",
    title: "Recover",
    description:
      "The item is transferred through a controlled handover point without exposing private locations.",
    icon: PackageCheck,
  },
]

function Workflow() {
  return (
    <section
      id="how-it-works"
      className="relative py-28 sm:py-36"
    >
      <div className="findx-container">

        {/* ========================================
            SECTION HEADER
            ======================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
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

            THE FINDX LOOP
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
            From a lost report
            <br />

            <span className="findx-gradient-text">
              to safe recovery.
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
            FINDX turns a fragmented lost-and-found process
            into a structured intelligence pipeline:
            report, match, verify, and recover.
          </p>

        </motion.div>


        {/* ========================================
            WORKFLOW
            ======================================== */}

        <div className="relative mt-16">

          {/* Desktop connecting line */}

          <div
            className="
              pointer-events-none
              absolute
              left-[8%]
              right-[8%]
              top-12
              hidden
              h-px
              bg-gradient-to-r
              from-blue-500/0
              via-blue-400/25
              to-blue-500/0
              lg:block
            "
          />


          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >

            {steps.map((step, index) => {
              const Icon = step.icon

              return (
                <motion.div
                  key={step.number}
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
                    amount: 0.25,
                  }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative"
                >

                  {/* Step marker */}

                  <div
                    className="
                      relative
                      z-10
                      flex
                      h-24
                      w-24
                      items-center
                      justify-center
                      rounded-3xl
                      border
                      border-white/[0.08]
                      bg-[#080c13]
                      shadow-[0_16px_50px_rgba(0,0,0,0.25)]
                    "
                  >

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
                        bg-blue-400/[0.08]
                      "
                    >
                      <Icon
                        size={20}
                        className="text-blue-300"
                      />
                    </div>


                    <span
                      className="
                        absolute
                        -right-2
                        -top-2
                        flex
                        h-7
                        min-w-7
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/[0.08]
                        bg-[#0b0f16]
                        px-2
                        text-[10px]
                        font-semibold
                        text-slate-400
                      "
                    >
                      {step.number}
                    </span>

                  </div>


                  {/* Content */}

                  <div className="mt-6">

                    <h3
                      className="
                        text-xl
                        font-semibold
                        tracking-[-0.025em]
                        text-white
                      "
                    >
                      {step.title}
                    </h3>


                    <p
                      className="
                        mt-3
                        max-w-xs
                        text-sm
                        leading-6
                        text-slate-500
                      "
                    >
                      {step.description}
                    </p>

                  </div>

                </motion.div>
              )
            })}

          </div>

        </div>


        {/* ========================================
            PRIVACY CALLOUT
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
          }}
          className="
            mt-16
            overflow-hidden
            rounded-3xl
            border
            border-emerald-400/[0.12]
            bg-emerald-400/[0.025]
          "
        >

          <div
            className="
              flex
              flex-col
              gap-6
              p-6
              sm:p-8
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            <div className="flex items-start gap-4">

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
                  border-emerald-400/15
                  bg-emerald-400/[0.08]
                "
              >
                <ShieldCheck
                  size={20}
                  className="text-emerald-300"
                />
              </div>


              <div>

                <p className="text-sm font-semibold text-white">
                  Recovery without exposing private locations
                </p>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                  FINDX can route a successful recovery through
                  an authorized lost-and-found desk or controlled
                  pickup point instead of revealing the finder's
                  private location.
                </p>

              </div>

            </div>


            <div
              className="
                shrink-0
                rounded-full
                border
                border-emerald-400/15
                bg-emerald-400/[0.06]
                px-3
                py-1.5
                text-xs
                font-medium
                text-emerald-300
              "
            >
              Privacy by design
            </div>

          </div>

        </motion.div>

      </div>
    </section>
  )
}

export default Workflow