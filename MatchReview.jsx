import {
  useEffect,
  useState,
} from "react"

import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  Radar,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react"


function MatchReview({
  match,
  reportType = "lost",
  onConfirm,
  onDismiss,
}) {

  if (!match) {
    return null
  }


  const candidate =
    match?.candidate ||
    match?.report ||
    null


  const source =
    match?.sourceReport ||
    null


  const score = Math.min(
    100,
    Math.max(
      0,
      Number(
        match?.score ||
        candidate?.score ||
        0
      )
    )
  )


  const isLost =
    reportType === "lost"


  /*
    This screen is intended for the LOST PERSON.

    Finder should never be sent here from the
    PotentialMatch flow.
  */

  if (!isLost) {
    return null
  }


  const signal = {
    item:
      match?.signals?.item ??
      candidate?.signals?.item ??
      null,

    description:
      match?.signals?.description ??
      candidate?.signals?.description ??
      null,

    location:
      match?.signals?.location ??
      candidate?.signals?.location ??
      null,

    details:
      match?.signals?.details ??
      candidate?.signals?.details ??
      null,
  }


  function numericSignal(
    value
  ) {

    const number =
      Number(value)


    if (
      !Number.isFinite(number)
    ) {
      return null
    }


    return Math.min(
      100,
      Math.max(
        0,
        number
      )
    )
  }


  function confirmMatch() {

    if (
      typeof onConfirm !==
      "function"
    ) {
      return
    }


    onConfirm(match)
  }


  const evidence = [
    {
      key: "item",
      label: "Item identity",
      short: "01",
      value: numericSignal(
        signal.item
      ),
    },

    {
      key: "description",
      label: "Description",
      short: "02",
      value: numericSignal(
        signal.description
      ),
    },

    {
      key: "location",
      label: "Location",
      short: "03",
      value: numericSignal(
        signal.location
      ),
    },

    {
      key: "details",
      label: "Distinctive details",
      short: "04",
      value: numericSignal(
        signal.details
      ),
    },
  ]


  const [
    activeEvidence,
    setActiveEvidence,
  ] = useState(0)


  useEffect(() => {

    const timer =
      window.setInterval(
        () => {

          setActiveEvidence(
            current =>
              (
                current + 1
              ) %
              evidence.length
          )

        },
        2600
      )


    return () => {

      window.clearInterval(
        timer
      )

    }

  }, [
    evidence.length,
  ])


  const active =
    evidence[
      activeEvidence
    ]


  const strongMatch =
    score >= 80


  const coverage =
    evidence.filter(
      item =>
        Number.isFinite(
          item.value
        )
    ).length


  return (
    <section
      id="match-review"
      className="
        relative
        overflow-hidden
        py-8
        sm:py-12
      "
    >

      <style>
        {`
          @keyframes findxScan {
            0% {
              transform: translateX(-140%);
              opacity: 0;
            }
            15% {
              opacity: 1;
            }
            50% {
              opacity: 1;
            }
            85% {
              opacity: 1;
            }
            100% {
              transform: translateX(430%);
              opacity: 0;
            }
          }

          @keyframes findxPulseRing {
            0% {
              transform: scale(0.92);
              opacity: 0.35;
            }
            70% {
              transform: scale(1.08);
              opacity: 0;
            }
            100% {
              transform: scale(1.08);
              opacity: 0;
            }
          }

          @keyframes findxRise {
            0% {
              opacity: 0;
              transform: translateY(12px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes findxSlide {
            0% {
              opacity: 0;
              transform: translateX(18px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>


      {/* ======================================================
          AMBIENT BACKGROUND
          ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          overflow-hidden
        "
      >

        <div
          className="
            absolute
            left-[5%]
            top-10
            h-72
            w-72
            rounded-full
            bg-blue-500/[0.06]
            blur-[110px]
          "
        />

        <div
          className="
            absolute
            right-[5%]
            top-[35%]
            h-80
            w-80
            rounded-full
            bg-emerald-400/[0.05]
            blur-[120px]
          "
        />

      </div>


      <div
        className="
          findx-container
        "
      >

        <div
          className="
            mx-auto
            max-w-6xl
          "
        >

          {/* ==================================================
              MASTER CONSOLE
              ================================================== */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[34px]
              border
              border-white/[0.09]
              bg-[#050b14]
              shadow-[0_35px_120px_rgba(0,0,0,0.55)]
            "
          >

            <div
              className="
                absolute
                inset-x-0
                top-0
                h-px
                overflow-hidden
              "
            >

              <div
                className="
                  h-px
                  w-1/3
                  bg-gradient-to-r
                  from-transparent
                  via-cyan-400
                  to-transparent
                  animate-[findxScan_2.7s_ease-in-out_infinite]
                "
              />

            </div>


            <div
              className="
                pointer-events-none
                absolute
                -right-32
                -top-32
                h-80
                w-80
                rounded-full
                bg-blue-500/[0.08]
                blur-3xl
              "
            />


            <div
              className="
                pointer-events-none
                absolute
                -bottom-32
                -left-32
                h-80
                w-80
                rounded-full
                bg-emerald-400/[0.06]
                blur-3xl
              "
            />


            <div
              className="
                relative
                p-5
                sm:p-8
                lg:p-10
              "
            >

              {/* ==================================================
                  LIVE HEADER
                  ================================================== */}

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-3
                "
              >

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2.5
                    rounded-full
                    border
                    border-emerald-400/15
                    bg-emerald-400/[0.045]
                    px-3.5
                    py-2
                  "
                >

                  <span
                    className="
                      relative
                      flex
                      h-2
                      w-2
                    "
                  >

                    <span
                      className="
                        absolute
                        inset-0
                        animate-ping
                        rounded-full
                        bg-emerald-400/50
                      "
                    />

                    <span
                      className="
                        relative
                        h-2
                        w-2
                        rounded-full
                        bg-emerald-400
                      "
                    />

                  </span>


                  <span
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-emerald-300
                    "
                  >
                    AI MATCH ANALYSIS LIVE
                  </span>

                </div>


                <div
                  className="
                    flex
                    items-center
                    gap-3
                    text-[9px]
                    uppercase
                    tracking-[0.13em]
                    text-slate-600
                  "
                >

                  <Activity
                    size={12}
                    className="
                      text-cyan-300
                    "
                  />

                  Signal coverage {coverage}/4

                  <span
                    className="
                      h-1
                      w-1
                      rounded-full
                      bg-slate-700
                    "
                  />

                  FINDX ENGINE

                </div>

              </div>


              {/* ==================================================
                  HERO
                  ================================================== */}

              <div
                className="
                  mt-7
                  grid
                  gap-7
                  lg:grid-cols-[1fr_320px]
                  lg:items-end
                "
              >

                <div>

                  <div
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-blue-400/15
                      bg-blue-400/[0.05]
                      px-3
                      py-1.5
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-blue-300
                    "
                  >

                    <Sparkles
                      size={12}
                    />

                    FINDX MATCH REVIEW

                  </div>


                  <h2
                    className="
                      mt-5
                      text-4xl
                      font-semibold
                      leading-[1.03]
                      tracking-[-0.055em]
                      text-white
                      sm:text-6xl
                    "
                  >

                    We may have

                    <br />

                    <span
                      className="
                        findx-gradient-text
                      "
                    >
                      found your item.
                    </span>

                  </h2>


                  <p
                    className="
                      mt-4
                      max-w-2xl
                      text-sm
                      leading-7
                      text-slate-400
                    "
                  >
                    FINDX found a strong matching
                    found-item report. Review the
                    evidence before claiming ownership.
                  </p>

                </div>


                {/* ==================================================
                    CONFIDENCE ORB
                    ================================================== */}

                <div
                  className="
                    relative
                    flex
                    min-h-[230px]
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-[30px]
                    border
                    border-white/[0.08]
                    bg-white/[0.02]
                    p-6
                  "
                >

                  <div
                    className="
                      absolute
                      h-48
                      w-48
                      rounded-full
                      border
                      border-blue-400/[0.08]
                    "
                  />


                  <div
                    className="
                      absolute
                      h-40
                      w-40
                      rounded-full
                      border
                      border-cyan-400/[0.10]
                      animate-[findxPulseRing_2.4s_ease-out_infinite]
                    "
                  />


                  <div
                    className="
                      absolute
                      h-32
                      w-32
                      rounded-full
                      border
                      border-emerald-400/[0.10]
                    "
                  />


                  <div
                    className="
                      relative
                      z-10
                      text-center
                    "
                  >

                    <p
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.15em]
                        text-slate-500
                      "
                    >
                      AI confidence
                    </p>


                    <p
                      className="
                        mt-1
                        text-6xl
                        font-semibold
                        tracking-[-0.07em]
                        text-white
                      "
                    >
                      {score}%
                    </p>


                    <div
                      className={`
                        mt-2
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        px-3
                        py-1.5
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        ${
                          strongMatch
                            ? "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300"
                            : "border-amber-400/15 bg-amber-400/[0.06] text-amber-300"
                        }
                      `}
                    >

                      <CheckCircle2
                        size={12}
                      />

                      {strongMatch
                        ? "Strong match"
                        : "Potential match"}

                    </div>

                  </div>

                </div>

              </div>


              {/* ==================================================
                  CONFIDENCE BAR
                  ================================================== */}

              <div
                className="
                  mt-5
                  rounded-3xl
                  border
                  border-white/[0.07]
                  bg-white/[0.018]
                  p-5
                  sm:p-6
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >

                  <div>

                    <p
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.14em]
                        text-slate-500
                      "
                    >
                      Overall match confidence
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-600
                      "
                    >
                      Combined FINDX similarity signal
                    </p>

                  </div>


                  <span
                    className="
                      text-sm
                      font-bold
                      text-white
                    "
                  >
                    {score}%
                  </span>

                </div>


                <div
                  className="
                    mt-4
                    h-3
                    overflow-hidden
                    rounded-full
                    border
                    border-white/[0.05]
                    bg-slate-950
                  "
                >

                  <div
                    className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-blue-500
                      via-cyan-400
                      to-emerald-400
                      shadow-[0_0_20px_rgba(34,211,238,0.20)]
                      transition-all
                      duration-700
                    "
                    style={{
                      width:
                        `${score}%`,
                    }}
                  />

                </div>

              </div>


              {/* ==================================================
                  LIVE EVIDENCE
                  ================================================== */}

              <div
                className="
                  mt-5
                  rounded-[30px]
                  border
                  border-cyan-400/[0.10]
                  bg-gradient-to-r
                  from-cyan-400/[0.025]
                  via-white/[0.015]
                  to-emerald-400/[0.025]
                  p-5
                  sm:p-6
                "
              >

                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    gap-3
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-cyan-400/10
                        bg-cyan-400/[0.05]
                      "
                    >

                      <Radar
                        size={18}
                        className="
                          text-cyan-300
                        "
                      />

                    </div>


                    <div>

                      <p
                        className="
                          text-xs
                          font-semibold
                          text-white
                        "
                      >
                        Live evidence analysis
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[9px]
                          text-slate-600
                        "
                      >
                        FINDX is cycling through
                        matching signals.
                      </p>

                    </div>

                  </div>


                  <div
                    className="
                      flex
                      gap-1.5
                    "
                  >

                    {evidence.map(
                      (
                        item,
                        index
                      ) => (

                        <button
                          key={
                            item.key
                          }
                          type="button"
                          onClick={() =>
                            setActiveEvidence(
                              index
                            )
                          }
                          aria-label={
                            item.label
                          }
                          className={`
                            h-1.5
                            rounded-full
                            transition-all
                            ${
                              activeEvidence === index
                                ? "w-7 bg-cyan-300"
                                : "w-1.5 bg-white/[0.10]"
                            }
                          `}
                        />

                      )
                    )}

                  </div>

                </div>


                <div
                  key={
                    active.key
                  }
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-white/[0.07]
                    bg-black/15
                    p-4
                    animate-[findxSlide_450ms_ease-out]
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >

                      <span
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          bg-white/[0.04]
                          text-[9px]
                          font-bold
                          text-slate-500
                        "
                      >
                        {active.short}
                      </span>


                      <div>

                        <p
                          className="
                            text-xs
                            font-semibold
                            text-slate-200
                          "
                        >
                          {active.label}
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[9px]
                            uppercase
                            tracking-[0.11em]
                            text-slate-700
                          "
                        >
                          Live signal
                        </p>

                      </div>

                    </div>


                    <span
                      className="
                        text-sm
                        font-bold
                        text-white
                      "
                    >
                      {Number.isFinite(
                        active.value
                      )
                        ? `${Math.round(
                            active.value
                          )}%`
                        : "N/A"}
                    </span>

                  </div>


                  <div
                    className="
                      mt-4
                      h-2
                      overflow-hidden
                      rounded-full
                      bg-white/[0.06]
                    "
                  >

                    <div
                      className="
                        h-full
                        rounded-full
                        bg-gradient-to-r
                        from-blue-500
                        via-cyan-400
                        to-emerald-400
                        transition-all
                        duration-700
                      "
                      style={{
                        width:
                          Number.isFinite(
                            active.value
                          )
                            ? `${active.value}%`
                            : "0%",
                      }}
                    />

                  </div>

                </div>

              </div>


              {/* ==================================================
                  REPORT COMPARISON
                  ================================================== */}

              <div
                className="
                  mt-5
                  grid
                  gap-4
                  lg:grid-cols-2
                "
              >

                <ReviewReportCard
                  title="YOUR LOST REPORT"
                  report={source}
                  type="lost"
                />


                <ReviewReportCard
                  title="FOUND-ITEM REPORT"
                  report={candidate}
                  type="found"
                />

              </div>


              {/* ==================================================
                  EVIDENCE GRID
                  ================================================== */}

              <div
                className="
                  mt-5
                  rounded-[30px]
                  border
                  border-white/[0.08]
                  bg-white/[0.018]
                  p-5
                  sm:p-6
                "
              >

                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >

                  <div>

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-white
                      "
                    >
                      Why FINDX connected these reports
                    </p>


                    <p
                      className="
                        mt-1
                        text-[10px]
                        leading-5
                        text-slate-500
                      "
                    >
                      These signals are supporting evidence,
                      not final ownership proof.
                    </p>

                  </div>


                  <ShieldCheck
                    size={18}
                    className="
                      shrink-0
                      text-blue-300
                    "
                  />

                </div>


                <div
                  className="
                    mt-5
                    grid
                    gap-3
                    sm:grid-cols-2
                  "
                >

                  {evidence.map(
                    item => (

                      <Evidence
                        key={
                          item.key
                        }
                        label={
                          item.label
                        }
                        value={
                          item.value
                        }
                      />

                    )
                  )}

                </div>

              </div>


              {/* ==================================================
                  PRIVACY + NEXT STEP
                  ================================================== */}

              <div
                className="
                  mt-5
                  grid
                  gap-4
                  lg:grid-cols-2
                "
              >

                <div
                  className="
                    rounded-3xl
                    border
                    border-emerald-400/[0.12]
                    bg-emerald-400/[0.025]
                    p-5
                  "
                >

                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-emerald-400/[0.08]
                      "
                    >

                      <ShieldCheck
                        size={18}
                        className="
                          text-emerald-300
                        "
                      />

                    </div>


                    <div>

                      <p
                        className="
                          text-sm
                          font-semibold
                          text-white
                        "
                      >
                        Privacy protected
                      </p>


                      <p
                        className="
                          mt-1
                          text-[10px]
                          leading-5
                          text-slate-500
                        "
                      >
                        No private address or direct
                        contact information is exposed.
                      </p>

                    </div>

                  </div>

                </div>


                <div
                  className="
                    rounded-3xl
                    border
                    border-amber-400/[0.12]
                    bg-amber-400/[0.025]
                    p-5
                  "
                >

                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-amber-400/[0.07]
                      "
                    >

                      <Clock3
                        size={18}
                        className="
                          text-amber-300
                        "
                      />

                    </div>


                    <div>

                      <p
                        className="
                          text-sm
                          font-semibold
                          text-amber-200
                        "
                      >
                        Next step: ownership verification
                      </p>


                      <p
                        className="
                          mt-1
                          text-[10px]
                          leading-5
                          text-slate-500
                        "
                      >
                        Confirming this potential match does
                        not complete recovery. Private chat,
                        GPS, radar and recovery stay locked.
                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* ==================================================
                  ACTIONS
                  ================================================== */}

              <div
                className="
                  mt-6
                  grid
                  gap-3
                  sm:grid-cols-[1fr_auto]
                "
              >

                {onConfirm && (

                  <button
                    type="button"
                    onClick={
                      confirmMatch
                    }
                    className="
                      group
                      flex
                      h-14
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-gradient-to-r
                      from-blue-500
                      via-cyan-500
                      to-emerald-400
                      px-6
                      text-sm
                      font-semibold
                      text-white
                      shadow-[0_20px_50px_rgba(37,99,235,0.22)]
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:shadow-[0_25px_65px_rgba(37,99,235,0.30)]
                      active:scale-[0.99]
                    "
                  >

                    <CheckCircle2
                      size={17}
                    />

                    Yes, this is my item

                    <ChevronRight
                      size={17}
                      className="
                        transition-transform
                        group-hover:translate-x-1
                      "
                    />

                  </button>

                )}


                {onDismiss && (

                  <button
                    type="button"
                    onClick={
                      onDismiss
                    }
                    className="
                      flex
                      h-14
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      border
                      border-white/[0.09]
                      bg-white/[0.025]
                      px-6
                      text-sm
                      font-medium
                      text-slate-400
                      transition-all
                      hover:border-red-400/20
                      hover:bg-red-400/[0.04]
                      hover:text-red-300
                      active:scale-[0.99]
                    "
                  >

                    <X
                      size={15}
                    />

                    Not my item

                  </button>

                )}

              </div>


              <div
                className="
                  mt-5
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[9px]
                  uppercase
                  tracking-[0.10em]
                  text-slate-700
                "
              >

                <ShieldCheck
                  size={11}
                />

                Private recovery tools stay locked
                until verification succeeds.

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  )
}


// ============================================================
// REPORT CARD
// ============================================================

function ReviewReportCard({
  title,
  report,
  type,
}) {

  const isFound =
    type === "found"


  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-3xl
        border
        p-5
        sm:p-6
        ${
          isFound
            ? "border-emerald-400/[0.12] bg-gradient-to-br from-emerald-400/[0.045] to-white/[0.015]"
            : "border-red-400/[0.12] bg-gradient-to-br from-red-400/[0.045] to-white/[0.015]"
        }
      `}
    >

      <div
        className={`
          pointer-events-none
          absolute
          -right-12
          -top-12
          h-32
          w-32
          rounded-full
          blur-3xl
          ${
            isFound
              ? "bg-emerald-400/[0.07]"
              : "bg-red-400/[0.07]"
          }
        `}
      />


      <div
        className="
          relative
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <span
            className={`
              h-2.5
              w-2.5
              rounded-full
              ${
                isFound
                  ? "bg-emerald-400"
                  : "bg-red-400"
              }
            `}
          />


          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-slate-500
            "
          >
            {title}
          </p>

        </div>


        <div
          className="
            mt-4
            flex
            items-start
            justify-between
            gap-3
          "
        >

          <h3
            className="
              break-words
              text-2xl
              font-semibold
              tracking-[-0.025em]
              text-white
            "
          >
            {report?.itemName ||
              "Item unavailable"}
          </h3>


          <span
            className={`
              shrink-0
              rounded-full
              border
              px-2.5
              py-1
              text-[8px]
              font-semibold
              uppercase
              tracking-[0.11em]
              ${
                isFound
                  ? "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300"
                  : "border-red-400/15 bg-red-400/[0.06] text-red-300"
              }
            `}
          >
            {isFound
              ? "Found"
              : "Lost"}
          </span>

        </div>


        {report?.location && (

          <div
            className="
              mt-4
              flex
              items-start
              gap-2.5
              rounded-2xl
              border
              border-white/[0.06]
              bg-black/15
              px-3
              py-3
            "
          >

            <MapPin
              size={14}
              className="
                mt-0.5
                shrink-0
                text-slate-500
              "
            />


            <p
              className="
                break-words
                text-[10px]
                leading-5
                text-slate-400
              "
            >
              {report.location}
            </p>

          </div>

        )}


        {report?.description && (

          <div
            className="
              mt-4
              rounded-2xl
              border
              border-white/[0.06]
              bg-black/15
              p-4
            "
          >

            <p
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-slate-600
              "
            >
              Description
            </p>


            <p
              className="
                mt-2
                whitespace-pre-line
                break-words
                text-[11px]
                leading-6
                text-slate-400
              "
            >
              {report.description}
            </p>

          </div>

        )}


        {isFound && (

          <div
            className="
              mt-4
              rounded-2xl
              border
              border-emerald-400/[0.10]
              bg-emerald-400/[0.03]
              px-4
              py-3
            "
          >

            <p
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-emerald-300
              "
            >
              Found by another participant
            </p>


            <p
              className="
                mt-1
                text-[10px]
                leading-5
                text-slate-500
              "
            >
              Exact private contact and home
              addresses remain protected.
            </p>

          </div>

        )}

      </div>

    </div>
  )
}


// ============================================================
// EVIDENCE
// ============================================================

function Evidence({
  label,
  value,
}) {

  const available =
    Number.isFinite(value)


  const percentage =
    available
      ? Math.round(value)
      : 0


  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.06]
        bg-black/10
        p-4
        transition-all
        hover:border-white/[0.11]
        hover:bg-white/[0.025]
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >

        <span
          className="
            text-[10px]
            font-medium
            text-slate-500
          "
        >
          {label}
        </span>


        <span
          className="
            text-[10px]
            font-bold
            text-white
          "
        >
          {available
            ? `${percentage}%`
            : "Not available"}
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

        <div
          className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-blue-500
            via-cyan-400
            to-emerald-400
            transition-all
            duration-700
          "
          style={{
            width:
              available
                ? `${percentage}%`
                : "0%",
          }}
        />

      </div>

    </div>
  )
}


export default MatchReview
