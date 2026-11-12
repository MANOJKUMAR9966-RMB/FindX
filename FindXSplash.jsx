import {
  Sparkles,
} from "lucide-react"

function FindXSplash() {
  return (
    <main
      className="
        findx-noise
        fixed
        inset-0
        z-[99999]
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        bg-[#020617]
      "
    >

      {/* Background grid */}

      <div
        className="
          findx-grid
          pointer-events-none
          absolute
          inset-0
          opacity-60
        "
      />

      {/* Ambient glow */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[420px]
          w-[420px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-blue-500/[0.08]
          blur-[120px]
        "
      />

      {/* Logo */}

      <div
        className="
          relative
          flex
          flex-col
          items-center
          justify-center
          animate-[findxSplashIn_1.1s_ease-out]
        "
      >

        <div
          className="
            relative
            flex
            h-24
            w-24
            items-center
            justify-center
            rounded-[28px]
            border
            border-blue-400/20
            bg-blue-400/[0.07]
            shadow-[0_0_80px_rgba(59,130,246,0.18)]
          "
        >

          <div
            className="
              absolute
              inset-0
              rounded-[28px]
              border
              border-cyan-400/10
              animate-pulse
            "
          />

          <Sparkles
            size={40}
            strokeWidth={1.7}
            className="
              relative
              text-blue-300
            "
          />

        </div>


        <h1
          className="
            mt-7
            text-5xl
            font-semibold
            tracking-[-0.06em]
            text-white
            sm:text-6xl
          "
        >
          FINDX
        </h1>


        <p
          className="
            mt-3
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.28em]
            text-blue-300
          "
        >
          Intelligence · Recovery · Trust
        </p>

      </div>


      <style>
        {`
          @keyframes findxSplashIn {
            0% {
              opacity: 0;
              transform:
                translateY(18px)
                scale(.92);
            }

            60% {
              opacity: 1;
              transform:
                translateY(0)
                scale(1.03);
            }

            100% {
              opacity: 1;
              transform:
                translateY(0)
                scale(1);
            }
          }
        `}
      </style>

    </main>
  )
}

export default FindXSplash