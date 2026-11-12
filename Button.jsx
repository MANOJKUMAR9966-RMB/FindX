import { motion } from "framer-motion"

function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-white text-black hover:bg-slate-200 shadow-[0_8px_30px_rgba(255,255,255,0.08)]",

    blue:
      "bg-[#4f8cff] text-white hover:bg-[#6aa1ff] shadow-[0_8px_35px_rgba(79,140,255,0.22)]",

    secondary:
      "bg-white/[0.05] text-white border border-white/[0.10] hover:bg-white/[0.08]",

    ghost:
      "bg-transparent text-slate-300 hover:bg-white/[0.05] hover:text-white",
  }

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-13 px-7 text-base",
  }

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-full
        font-medium
        tracking-[-0.01em]
        transition-all
        duration-200
        outline-none
        focus-visible:ring-2
        focus-visible:ring-[#4f8cff]
        focus-visible:ring-offset-2
        focus-visible:ring-offset-[#05070a]

        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default Button