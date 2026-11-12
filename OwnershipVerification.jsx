import { useState } from "react"
import {
  CheckCircle2,
  FileCheck2,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

const API_URL =
  "http://localhost:5000/api/verifications"

function OwnershipVerification({
  matchId,
  onSubmitted,
}) {
  const [evidence, setEvidence] =
    useState("")

  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] =
    useState("")

  const [verification, setVerification] =
    useState(null)

  // ============================================
  // SUBMIT VERIFICATION
  // ============================================

  async function handleSubmit(event) {
    event.preventDefault()

    if (submitting) {
      return
    }

    setError("")

    const cleanedEvidence =
      evidence.trim()

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!matchId) {
      setError(
        "No confirmed match was provided."
      )
      return
    }

    if (!cleanedEvidence) {
      setError(
        "Please provide ownership evidence."
      )
      return
    }

    if (cleanedEvidence.length < 10) {
      setError(
        "Please provide more specific ownership evidence."
      )
      return
    }

    try {
      setSubmitting(true)

      // ----------------------------------------
      // SEND TO BACKEND
      // ----------------------------------------

      const response = await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            matchId,
            ownershipEvidence:
              cleanedEvidence,
          }),
        }
      )

      let data

      try {
        data = await response.json()
      } catch {
        throw new Error(
          "Verification server returned an invalid response."
        )
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to submit ownership verification."
        )
      }

      // ----------------------------------------
      // SUCCESS
      // ----------------------------------------

      setVerification(
        data.verification
      )

      setError("")

      if (onSubmitted) {
        onSubmitted(
          data.verification
        )
      }
    } catch (error) {
      console.error(
        "FINDX: Verification submission failed.",
        error
      )

      setError(
        error.message ||
          "Unable to submit ownership verification."
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ============================================
  // NO MATCH ID
  // ============================================

  if (!matchId) {
    return (
      <section className="relative py-20">
        <div className="findx-container">

          <div
            className="
              rounded-3xl
              border
              border-amber-400/[0.10]
              bg-amber-400/[0.025]
              p-6
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <ShieldCheck
                size={19}
                className="
                  mt-0.5
                  shrink-0
                  text-amber-300
                "
              />

              <div>
                <p
                  className="
                    text-sm
                    font-medium
                    text-amber-200
                  "
                >
                  Verification unavailable
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  Ownership verification
                  requires a confirmed FINDX
                  match first.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    )
  }

  // ============================================
  // SUCCESS
  // ============================================

  if (verification) {
    return (
      <section
        id="verification"
        className="
          relative
          py-20
          sm:py-28
        "
      >
        <div className="findx-container">

          <div
            className="
              mx-auto
              max-w-2xl
              rounded-3xl
              border
              border-emerald-400/[0.12]
              bg-emerald-400/[0.025]
              p-6
              sm:p-8
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-emerald-400/[0.08]
              "
            >
              <CheckCircle2
                size={23}
                className="text-emerald-300"
              />
            </div>

            <h2
              className="
                mt-5
                text-2xl
                font-semibold
                tracking-tight
                text-white
              "
            >
              Verification submitted
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-slate-400
              "
            >
              Your ownership evidence has
              been securely submitted to FINDX.
              It is not exposed to the other
              party.
            </p>

            <div
              className="
                mt-6
                grid
                gap-3
                sm:grid-cols-2
              "
            >

              <div
                className="
                  rounded-2xl
                  border
                  border-white/[0.06]
                  bg-black/10
                  p-4
                "
              >
                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    text-slate-600
                  "
                >
                  Verification ID
                </p>

                <p
                  className="
                    mt-2
                    break-all
                    text-sm
                    font-medium
                    text-slate-300
                  "
                >
                  {verification.verificationId}
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-white/[0.06]
                  bg-black/10
                  p-4
                "
              >
                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    text-slate-600
                  "
                >
                  Status
                </p>

                <p
                  className="
                    mt-2
                    text-sm
                    font-medium
                    capitalize
                    text-amber-300
                  "
                >
                  {verification.status}
                </p>
              </div>

            </div>

            <div
              className="
                mt-6
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-blue-400/[0.10]
                bg-blue-400/[0.025]
                p-4
              "
            >

              <ShieldCheck
                size={18}
                className="
                  mt-0.5
                  shrink-0
                  text-blue-300
                "
              />

              <div>

                <p
                  className="
                    text-sm
                    font-medium
                    text-blue-200
                  "
                >
                  Privacy protected
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  FINDX keeps your ownership
                  evidence private while the
                  verification process is
                  completed.
                </p>

              </div>
            </div>

          </div>

        </div>
      </section>
    )
  }

  // ============================================
  // FORM
  // ============================================

  return (
    <section
      id="verification"
      className="
        relative
        py-20
        sm:py-28
      "
    >
      <div className="findx-container">

        <div
          className="
            mx-auto
            max-w-3xl
          "
        >

          {/* HEADER */}

          <div className="max-w-2xl">

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-blue-400/15
                bg-blue-400/[0.06]
                px-3.5
                py-2
                text-xs
                font-medium
                tracking-wide
                text-blue-300
              "
            >
              <Sparkles size={14} />

              OWNERSHIP VERIFICATION
            </div>

            <h2
              className="
                mt-6
                text-4xl
                font-semibold
                tracking-[-0.045em]
                text-white
                sm:text-5xl
              "
            >
              Prove it's
              <br />

              <span className="findx-gradient-text">
                yours.
              </span>
            </h2>

            <p
              className="
                mt-5
                text-base
                leading-7
                text-slate-400
                sm:text-lg
              "
            >
              A strong match is not automatic
              proof of ownership. Tell FINDX
              something about the item that only
              the legitimate owner would know.
            </p>

          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="
              mt-10
              rounded-3xl
              border
              border-white/[0.08]
              bg-white/[0.025]
              p-6
              sm:p-8
            "
          >

            <div
              className="
                rounded-2xl
                border
                border-blue-400/[0.10]
                bg-blue-400/[0.025]
                p-4
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >

                <FileCheck2
                  size={18}
                  className="
                    mt-0.5
                    shrink-0
                    text-blue-300
                  "
                />

                <div>

                  <p
                    className="
                      text-sm
                      font-medium
                      text-blue-200
                    "
                  >
                    What counts as useful evidence?
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    Describe a distinctive mark,
                    hidden detail, customization,
                    damage, accessory, or other
                    identifying information that
                    was not publicly disclosed.
                  </p>

                </div>

              </div>

            </div>

            <div className="mt-6">

              <label
                htmlFor="ownershipEvidence"
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.16em]
                  text-slate-500
                "
              >
                Ownership evidence
              </label>

              <textarea
                id="ownershipEvidence"
                value={evidence}
                onChange={(event) => {
                  setEvidence(
                    event.target.value
                  )
                  setError("")
                }}
                disabled={submitting}
                rows={6}
                maxLength={1000}
                placeholder="Example: The watch has a small scratch on the lower-right edge of the glass and a blue mark underneath the strap..."
                className="
                  mt-3
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-black/20
                  p-4
                  text-sm
                  leading-6
                  text-white
                  outline-none
                  placeholder:text-slate-700
                  focus:border-blue-400/30
                  focus:bg-blue-400/[0.025]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              />

              <div
                className="
                  mt-2
                  flex
                  justify-between
                "
              >
                <span
                  className="
                    text-[11px]
                    text-slate-600
                  "
                >
                  Keep sensitive personal information
                  out of this field.
                </span>

                <span
                  className="
                    text-[11px]
                    text-slate-600
                  "
                >
                  {evidence.length}/1000
                </span>
              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-red-400/15
                  bg-red-400/[0.05]
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-red-300
                "
              >
                {error}
              </div>
            )}

            {/* PRIVACY */}

            <div
              className="
                mt-6
                rounded-2xl
                border
                border-emerald-400/[0.10]
                bg-emerald-400/[0.025]
                p-4
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >

                <ShieldCheck
                  size={18}
                  className="
                    mt-0.5
                    shrink-0
                    text-emerald-300
                  "
                />

                <div>

                  <p
                    className="
                      text-sm
                      font-medium
                      text-emerald-200
                    "
                  >
                    Your evidence stays private
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    FINDX does not show your
                    ownership evidence to the
                    person who submitted the
                    matching report.
                  </p>

                </div>

              </div>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={submitting}
              className="
                mt-6
                flex
                h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-blue-500
                text-sm
                font-semibold
                text-white
                shadow-[0_12px_35px_rgba(59,130,246,0.18)]
                transition-colors
                hover:bg-blue-400
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              {submitting ? (
                <>
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />

                  Submitting verification...
                </>
              ) : (
                <>
                  Submit ownership verification

                  <FileCheck2
                    size={16}
                  />
                </>
              )}

            </button>

          </form>

        </div>

      </div>
    </section>
  )
}

export default OwnershipVerification