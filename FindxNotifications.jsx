import {
  Bell,
  CheckCircle2,
  ShieldCheck,
  X,
} from "lucide-react"

function FindxNotification({
  notification,
  onOpen,
  onClose,
}) {
  if (!notification) {
    return null
  }

  const type =
    notification.type ===
    "finder-owner"
      ? "finder-owner"
      : "lost-match"

  const isFinder =
    type === "finder-owner"

  return (
    <div
      className="
        fixed
        right-4
        top-4
        z-[9999]
        w-[min(92vw,390px)]
        animate-[findxNotificationIn_.45s_ease-out]
      "
    >
      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          border-white/[0.10]
          bg-[#06101a]/95
          shadow-[0_25px_80px_rgba(0,0,0,0.45)]
          backdrop-blur-2xl
        "
      >

        {/* TOP STRIP */}

        <div
          className={`
            h-1
            ${
              isFinder
                ? "bg-emerald-400"
                : "bg-blue-400"
            }
          `}
        />

        <div className="p-5">

          {/* HEADER */}

          <div
            className="
              flex
              items-start
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
                className={`
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  ${
                    isFinder
                      ? "bg-emerald-400/[0.10]"
                      : "bg-blue-400/[0.10]"
                  }
                `}
              >

                {isFinder ? (
                  <CheckCircle2
                    size={20}
                    className="
                      text-emerald-300
                    "
                  />
                ) : (
                  <Bell
                    size={20}
                    className="
                      text-blue-300
                    "
                  />
                )}

              </div>

              <div>

                <p
                  className={`
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.15em]
                    ${
                      isFinder
                        ? "text-emerald-300"
                        : "text-blue-300"
                    }
                  `}
                >
                  {isFinder
                    ? "FINDX OWNER ALERT"
                    : "FINDX MATCH ALERT"}
                </p>

                <h3
                  className="
                    mt-1
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  {notification.title}
                </h3>

              </div>

            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                text-slate-600
                hover:bg-white/[0.05]
                hover:text-white
              "
              aria-label="Close notification"
            >
              <X size={14} />
            </button>

          </div>


          {/* MESSAGE */}

          <p
            className="
              mt-4
              text-xs
              leading-5
              text-slate-400
            "
          >
            {notification.message}
          </p>


          {/* ITEM */}

          {notification.itemName && (
            <div
              className="
                mt-4
                rounded-2xl
                border
                border-white/[0.06]
                bg-white/[0.02]
                p-3
              "
            >

              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.13em]
                  text-slate-600
                "
              >
                Item
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {notification.itemName}
              </p>

            </div>
          )}


          {/* ACTION */}

          <button
            type="button"
            onClick={
              onOpen
            }
            className={`
              mt-4
              flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              text-sm
              font-semibold
              text-white
              transition
              ${
                isFinder
                  ? "bg-emerald-500 hover:bg-emerald-400"
                  : "bg-blue-500 hover:bg-blue-400"
              }
            `}
          >

            {isFinder
              ? "Review owner request"
              : "Open FINDX"}

          </button>


          {/* SECURITY */}

          <div
            className="
              mt-3
              flex
              items-start
              gap-2
              rounded-xl
              border
              border-emerald-400/[0.07]
              bg-emerald-400/[0.02]
              p-3
            "
          >

            <ShieldCheck
              size={13}
              className="
                mt-0.5
                shrink-0
                text-emerald-300
              "
            />

            <p
              className="
                text-[9px]
                leading-4
                text-slate-600
              "
            >
              {isFinder
                ? "The owner has passed the FINDX matching stage. Review the request before opening communication."
                : "Verify ownership before communicating or sharing a precise location."}
            </p>

          </div>

        </div>

      </div>

      <style>
        {`
          @keyframes findxNotificationIn {
            from {
              opacity: 0;
              transform:
                translateY(-18px)
                translateX(12px)
                scale(.97);
            }

            to {
              opacity: 1;
              transform:
                translateY(0)
                translateX(0)
                scale(1);
            }
          }
        `}
      </style>

    </div>
  )
}

export default FindxNotification