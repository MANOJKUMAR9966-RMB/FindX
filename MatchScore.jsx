import { motion } from "framer-motion"
import { BrainCircuit, TrendingUp } from "lucide-react"

function MatchScore({
  score = 94,
  label = "Strong candidate",
}) {
  const circumference = 2 * Math.PI * 48
  const progress = circumference - (score / 100) * circumference

  return (
    <div className="flex items-center justify-between gap-5">

      {/* Score ring */}

      <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">

        <svg
          viewBox="0 0 120 120"
          className="absolute inset-0 h-full w-full -rotate-90"
        >

          {/* Background ring */}

          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="7"
          />

          {/* Progress ring */}

          <motion.circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="url(#findxScoreGradient)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{
              strokeDashoffset: circumference,
            }}
            animate={{
              strokeDashoffset: progress,
            }}
            transition={{
              delay: 0.45,
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
          />

          <defs>
            <linearGradient
              id="findxScoreGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#4f8cff" />
              <stop offset="100%" stopColor="#35d6ff" />
            </linearGradient>
          </defs>

        </svg>


        {/* Center */}

        <div className="relative text-center">

          <div className="flex items-baseline justify-center">

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="
                text-3xl
                font-semibold
                tracking-[-0.05em]
                text-white
              "
            >
              {score}
            </motion.span>

            <span className="ml-0.5 text-sm text-slate-500">
              /100
            </span>

          </div>

        </div>

      </div>


      {/* Score information */}

      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-2">

          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              border
              border-blue-400/15
              bg-blue-400/10
            "
          >
            <BrainCircuit
              size={15}
              className="text-blue-300"
            />
          </div>

          <div>

            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
              Match confidence
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              {label}
            </p>

          </div>

        </div>


        {/* Score interpretation */}

        <div className="mt-5 flex items-center gap-2">

          <TrendingUp
            size={14}
            className="text-emerald-400"
          />

          <span className="text-xs text-slate-400">
            High-confidence candidate
          </span>

        </div>


        {/* Confidence range */}

        <div className="mt-3 flex items-center gap-2">

          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

          <span className="text-[10px] text-slate-500">
            Verification required before recovery
          </span>

        </div>

      </div>

    </div>
  )
}

export default MatchScore