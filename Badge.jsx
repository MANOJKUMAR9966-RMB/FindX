function Badge({
  children,
  variant = "default",
}) {
  const variants = {
    default:
      "border-white/[0.10] bg-white/[0.04] text-slate-300",

    blue:
      "border-blue-400/20 bg-blue-400/10 text-blue-300",

    success:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",

    warning:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",

    danger:
      "border-red-400/20 bg-red-400/10 text-red-300",
  }

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        px-3
        py-1.5
        text-xs
        font-medium
        tracking-wide
        ${variants[variant]}
      `}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {children}
    </span>
  )
}

export default Badge