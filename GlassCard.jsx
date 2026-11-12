import { motion } from "framer-motion"

function GlassCard({
  children,
  className = "",
  hover = true,
}) {
  return (
    <motion.div
      whileHover={
        hover
          ? {
              y: -4,
              borderColor: "rgba(255,255,255,0.14)",
            }
          : undefined
      }
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`
        relative
        overflow-hidden
        rounded-[20px]
        border
        border-white/[0.08]
        bg-white/[0.035]
        backdrop-blur-xl
        shadow-[0_20px_60px_rgba(0,0,0,0.22)]

        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard