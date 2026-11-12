import {
  QrCode,
  ShieldCheck,
  MapPin,
} from "lucide-react"

import QuickFound from "./QuickFound"


function RecoveryNetwork() {

  function openQuickFound() {

    window.open(
      "/quick-found",
      "_blank",
      "noopener,noreferrer"
    )

  }


  return (
    <section
      className="
        relative
        border-t
        border-white/[0.06]
        bg-[#020617]
        py-16
      "
    >

      <div
        className="
          findx-container
        "
      >

        <div
          className="
            mx-auto
            max-w-4xl
          "
        >

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-blue-400/15
              bg-blue-400/[0.05]
              px-3.5
              py-2
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-blue-300
            "
          >

            <ShieldCheck
              size={14}
            />

            FINDX RECOVERY NETWORK

          </div>


          <h2
            className="
              mt-5
              text-3xl
              font-semibold
              tracking-[-0.04em]
              text-white
              sm:text-4xl
            "
          >
            Another way back home.
          </h2>


          <p
            className="
              mt-3
              max-w-2xl
              text-sm
              leading-6
              text-slate-500
            "
          >
            Not every finder will already be using FINDX.
            The recovery network provides a simple entry
            point for newly found items.
          </p>


          <div
            className="
              mt-8
              grid
              gap-4
              sm:grid-cols-2
            "
          >

            <button
              type="button"
              onClick={
                openQuickFound
              }
              className="
                rounded-3xl
                border
                border-white/[0.08]
                bg-white/[0.025]
                p-6
                text-left
                hover:border-blue-400/20
              "
            >

              <QrCode
                size={24}
                className="text-blue-300"
              />

              <p
                className="
                  mt-4
                  text-lg
                  font-semibold
                  text-white
                "
              >
                Quick Found
              </p>

              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                A finder can report an item without
                navigating the full FINDX workflow.
              </p>

            </button>


            <div
              className="
                rounded-3xl
                border
                border-white/[0.08]
                bg-white/[0.025]
                p-6
              "
            >

              <MapPin
                size={24}
                className="text-emerald-300"
              />

              <p
                className="
                  mt-4
                  text-lg
                  font-semibold
                  text-white
                "
              >
                Authorized recovery points
              </p>

              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Security, reception, library,
                lost-and-found desks and other
                controlled handover points can
                become recovery locations.
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  )
}


export default RecoveryNetwork