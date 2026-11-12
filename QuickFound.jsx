import {
  useState,
} from "react"

import {
  Camera,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Send,
} from "lucide-react"


const API_URL =
  `${window.location.protocol}//${window.location.hostname}:5000/api/reports`


function QuickFound({
  onSubmitted,
}) {

  const [
    itemName,
    setItemName,
  ] = useState("")

  const [
    location,
    setLocation,
  ] = useState("")

  const [
    description,
    setDescription,
  ] = useState("")

  const [
    submitting,
    setSubmitting,
  ] = useState(false)

  const [
    success,
    setSuccess,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState("")


  async function handleSubmit(
    event
  ) {

    event.preventDefault()

    if (submitting) {
      return
    }

    setError("")
    setSuccess(false)


    if (!itemName.trim()) {
      setError(
        "Please enter what you found."
      )
      return
    }

    if (!location.trim()) {
      setError(
        "Please enter where you found it."
      )
      return
    }

    if (!description.trim()) {
      setError(
        "Please describe the item."
      )
      return
    }


    try {

      setSubmitting(true)


      const response =
        await fetch(
          API_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                type:
                  "found",

                itemName:
                  itemName.trim(),

                location:
                  location.trim(),

                description:
                  description.trim(),

                recoverySource:
                  "quick-found",

                recoveryChannel:
                  "qr",
              }),
          }
        )


      let data

      try {

        data =
          await response.json()

      } catch {

        throw new Error(
          "FINDX returned an invalid response."
        )

      }


      if (
        !response.ok ||
        !data?.success
      ) {

        throw new Error(
          data?.message ||
          `Server error (${response.status}).`
        )

      }


      const createdReport =
        data.report ||
        {}


      const createdReportId =
        createdReport.id ||
        createdReport._id ||
        ""


      if (!createdReportId) {

        throw new Error(
          "FINDX created the report but returned no report ID."
        )

      }


      setSuccess(true)
      setError("")


      if (
        typeof onSubmitted ===
        "function"
      ) {

        onSubmitted({
          reportId:
            createdReportId,

          type:
            "found",

          report:
            createdReport,
        })

      }


      setItemName("")
      setLocation("")
      setDescription("")

    } catch (
      submitError
    ) {

      console.error(
        "FINDX: Quick Found submission failed:",
        submitError
      )

      setError(
        submitError.message ||
        "Unable to submit the found item."
      )

    } finally {

      setSubmitting(false)

    }
  }


  return (
    <section
      className="
        min-h-screen
        bg-[#020617]
        px-5
        py-16
        text-white
      "
    >

      <div
        className="
          mx-auto
          max-w-xl
        "
      >

        <div
          className="
            rounded-full
            border
            border-blue-400/15
            bg-blue-400/[0.05]
            px-3
            py-1.5
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.15em]
            text-blue-300
            inline-flex
          "
        >
          FINDX QUICK FOUND
        </div>


        <h1
          className="
            mt-5
            text-4xl
            font-semibold
            tracking-[-0.04em]
          "
        >
          Found something?
        </h1>


        <p
          className="
            mt-3
            text-sm
            leading-6
            text-slate-500
          "
        >
          Report it quickly. FINDX will check
          whether an active lost-item case matches it.
        </p>


        <form
          onSubmit={
            handleSubmit
          }
          className="
            mt-8
            rounded-3xl
            border
            border-white/[0.08]
            bg-white/[0.025]
            p-6
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <Camera
              size={18}
              className="text-blue-300"
            />

            <p
              className="
                text-sm
                font-medium
                text-slate-300
              "
            >
              Quick recovery report
            </p>

          </div>


          <label
            className="
              mt-6
              block
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-slate-500
            "
          >
            What did you find?
          </label>

          <input
            value={
              itemName
            }
            onChange={
              event =>
                setItemName(
                  event.target.value
                )
            }
            disabled={
              submitting ||
              success
            }
            placeholder="e.g. Black wallet"
            className="
              mt-3
              h-12
              w-full
              rounded-2xl
              border
              border-white/[0.07]
              bg-black/20
              px-4
              text-sm
              text-white
              outline-none
              placeholder:text-slate-700
            "
          />


          <label
            className="
              mt-5
              block
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-slate-500
            "
          >
            Where did you find it?
          </label>

          <div className="relative mt-3">

            <MapPin
              size={15}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-600
              "
            />

            <input
              value={
                location
              }
              onChange={
                event =>
                  setLocation(
                    event.target.value
                  )
              }
              disabled={
                submitting ||
                success
              }
              placeholder="e.g. Library, Block B"
              className="
                h-12
                w-full
                rounded-2xl
                border
                border-white/[0.07]
                bg-black/20
                pr-4
                text-sm
                text-white
                outline-none
                placeholder:text-slate-700
              "
              style={{
                paddingLeft:
                  "44px",
              }}
            />

          </div>


          <label
            className="
              mt-5
              block
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-slate-500
            "
          >
            Item details
          </label>

          <textarea
            value={
              description
            }
            onChange={
              event =>
                setDescription(
                  event.target.value
                )
            }
            disabled={
              submitting ||
              success
            }
            rows={5}
            placeholder="
              Add identifying details.
              Do not include private information.
            "
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
            "
          />


          <div
            className="
              mt-5
              flex
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
              FINDX does not require the finder
              to share a private address or phone number.
            </p>

          </div>


          {error && (

            <div
              className="
                mt-5
                rounded-2xl
                border
                border-red-400/10
                bg-red-400/[0.03]
                p-4
                text-xs
                leading-5
                text-red-300
              "
            >
              {error}
            </div>

          )}


          {success ? (

            <div
              className="
                mt-5
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-emerald-400/10
                bg-emerald-400/[0.03]
                p-4
              "
            >

              <CheckCircle2
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
                  Found item submitted
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  FINDX will check active lost-item
                  cases for a possible match.
                </p>

              </div>

            </div>

          ) : (

            <button
              type="submit"
              disabled={
                submitting
              }
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
                hover:bg-blue-400
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              {submitting
                ? "Submitting..."
                : "Submit found item"}

              {!submitting && (
                <Send
                  size={16}
                />
              )}

            </button>

          )}

        </form>

      </div>

    </section>
  )
}


export default QuickFound