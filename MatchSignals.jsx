import { motion } from "framer-motion"
import {
  Clock3,
  FileText,
  Image,
  MapPin,
} from "lucide-react"


function MatchSignals({
  item = 0,
  description = 0,
  location = 0,
  visual = null,
  time = null,
}) {
  const signals = [
    {
      label: "Item",
      value: item,
      icon: FileText,
    },
    {
      label: "Description",
      value: description,
      icon: FileText,
    },
    {
      label: "Visual",
      value: visual,
      icon: Image,
    },
    {
      label: "Location",
      value: location,
      icon: MapPin,
    },
    {
      label: "Time",
      value: time,
      icon: Clock3,
    },
  ]


  const visibleSignals = signals.filter(
    (signal) =>
      signal.value !== null &&
      signal.value !== undefined
  )


  return (
    <div className="space-y-4">

      {visibleSignals.map((signal, index) => {
        const Icon = signal.icon

        const safeValue = Math.max(
          0,
          Math.min(
            100,
            Number(signal.value) || 0
          )
        )

        return (
          <div
            key={signal.label}
            className="
              rounded-2xl
              border
              border-white/[0.06]
              bg-white/[0.025]
              p-3.5
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2.5
                "
              >

                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/[0.04]
                    text-slate-400
                  "
                >
                  <Icon size={14} />
                </div>

                <span
                  className="
                    text-xs
                    font-medium
                    text-slate-300
                  "
                >
                  {signal.label} similarity
                </span>

              </div>

              <span
                className="
                  text-xs
                  font-semibold
                  text-white
                "
              >
                {safeValue}%
              </span>

            </div>


            <div
              className="
                mt-3
                h-1.5
                overflow-hidden
                rounded-full
                bg-white/[0.06]
              "
            >

              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${safeValue}%`,
                }}
                transition={{
                  delay: 0.3 + index * 0.12,
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-blue-500
                  to-cyan-300
                "
              />

            </div>

          </div>
        )
      })}

    </div>
  )
}


export default MatchSignals