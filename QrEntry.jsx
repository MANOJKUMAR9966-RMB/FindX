import {
  MapPin,
  PackageSearch,
  ShieldCheck,
} from "lucide-react"


function QrEntry() {

  // ==========================================================
  // QR ROLE SELECTION
  //
  // LOST  -> /qr?role=lost
  // FOUND -> /qr?role=found
  //
  // IMPORTANT:
  // "found" is the report type expected by ReportForm.
  // ==========================================================

  function chooseRole(
    role
  ) {

    if (
      role !== "lost" &&
      role !== "found"
    ) {
      return
    }


    console.log(
      "FINDX: QR selected:",
      role
    )


    window.location.href =
      `/qr?role=${role}`
  }


  return (
    <main
      className="
        findx-noise
        min-h-screen
        overflow-x-hidden
      "
    >

      <div
        className="
          findx-grid
          pointer-events-none
          fixed
          inset-0
          -z-10
        "
      />


      <div
        className="
          findx-ambient
          pointer-events-none
          fixed
          -left-40
          -top-40
          -z-10
        "
      />


      <section
        className="
          flex
          min-h-screen
          items-center
          justify-center
          px-5
          py-16
        "
      >

        <div
          className="
            w-full
            max-w-4xl
          "
        >

          {/* ==================================================
              HEADER
              ================================================== */}

          <div
            className="
              text-center
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
                bg-blue-400/[0.06]
                px-4
                py-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-blue-300
              "
            >

              <ShieldCheck
                size={14}
              />

              FINDX QUICK ENTRY

            </div>


            <h1
              className="
                mt-6
                text-4xl
                font-semibold
                tracking-[-0.05em]
                text-white
                sm:text-6xl
              "
            >
              Welcome to FINDX
            </h1>


            <p
              className="
                mx-auto
                mt-4
                max-w-2xl
                text-sm
                leading-7
                text-slate-500
                sm:text-base
              "
            >
              Choose what happened and FINDX will
              take you directly into the appropriate
              recovery process.
            </p>

          </div>


          {/* ==================================================
              LOST / FOUND
              ================================================== */}

          <div
            className="
              mx-auto
              mt-10
              grid
              max-w-4xl
              gap-5
              md:grid-cols-2
            "
          >

            {/* ==================================================
                LOST
                ================================================== */}

            <button
              type="button"
              onClick={() =>
                chooseRole(
                  "lost"
                )
              }
              className="
                group
                relative
                overflow-hidden
                rounded-3xl
                border
                border-white/[0.08]
                bg-white/[0.025]
                p-7
                text-left
                transition-all
                duration-200
                hover:-translate-y-1
                hover:border-red-400/20
                hover:bg-red-400/[0.025]
                active:scale-[0.99]
                sm:p-9
              "
            >

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16
                  h-40
                  w-40
                  rounded-full
                  bg-red-400/[0.06]
                  blur-3xl
                "
              />


              <div
                className="
                  relative
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-400/[0.08]
                "
              >

                <PackageSearch
                  size={27}
                  className="
                    text-red-300
                  "
                />

              </div>


              <h2
                className="
                  relative
                  mt-6
                  text-2xl
                  font-semibold
                  text-white
                "
              >
                I lost something
              </h2>


              <p
                className="
                  relative
                  mt-3
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Report the item you lost and let
                FINDX search for potential matches.
              </p>


              <div
                className="
                  relative
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-red-400/[0.06]
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-red-300
                "
              >

                Continue

              </div>

            </button>


            {/* ==================================================
                FOUND
                ================================================== */}

            <button
              type="button"
              onClick={() =>
                chooseRole(
                  "found"
                )
              }
              className="
                group
                relative
                overflow-hidden
                rounded-3xl
                border
                border-white/[0.08]
                bg-white/[0.025]
                p-7
                text-left
                transition-all
                duration-200
                hover:-translate-y-1
                hover:border-emerald-400/20
                hover:bg-emerald-400/[0.025]
                active:scale-[0.99]
                sm:p-9
              "
            >

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16
                  h-40
                  w-40
                  rounded-full
                  bg-emerald-400/[0.06]
                  blur-3xl
                "
              />


              <div
                className="
                  relative
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-emerald-400/[0.08]
                "
              >

                <MapPin
                  size={27}
                  className="
                    text-emerald-300
                  "
                />

              </div>


              <h2
                className="
                  relative
                  mt-6
                  text-2xl
                  font-semibold
                  text-white
                "
              >
                I found something
              </h2>


              <p
                className="
                  relative
                  mt-3
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Report the item you found so FINDX
                can check for a potential owner.
              </p>


              <div
                className="
                  relative
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-emerald-400/[0.06]
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-emerald-300
                "
              >

                Continue

              </div>

            </button>

          </div>


          {/* ==================================================
              PRIVACY
              ================================================== */}

          <div
            className="
              mx-auto
              mt-6
              flex
              max-w-3xl
              items-start
              gap-3
              rounded-2xl
              border
              border-emerald-400/[0.08]
              bg-emerald-400/[0.02]
              p-4
            "
          >

            <ShieldCheck
              size={17}
              className="
                mt-0.5
                shrink-0
                text-emerald-300
              "
            />


            <p
              className="
                text-[10px]
                leading-5
                text-slate-500
              "
            >
              FINDX uses the same privacy-first
              matching, verification and recovery
              system for both Lost and Found reports.
            </p>

          </div>


          {/* ==================================================
              FOOTER
              ================================================== */}

          <div
            className="
              mt-8
              flex
              items-center
              justify-center
              gap-2
              text-[9px]
              uppercase
              tracking-[0.16em]
              text-slate-700
            "
          >

            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-blue-400/50
              "
            />

            QR ENTRY

          </div>

        </div>

      </section>

    </main>
  )
}


export default QrEntry