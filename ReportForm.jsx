import {
  useEffect,
  useState,
} from "react"

import { motion } from "framer-motion"

import {
  Camera,
  CheckCircle2,
  FileText,
  MapPin,
  PackageSearch,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react"


// ============================================================
// LAN-SAFE API URL
//
// Automatically uses the hostname that opened FINDX.
//
// Your laptop:
//   http://192.168.31.79:5173
//   -> API: http://192.168.31.79:5000
//
// Friend's laptop:
//   http://192.168.31.79:5173
//   -> API: http://192.168.31.79:5000
//
// ============================================================

const API_URL =
  `${window.location.protocol}//${window.location.hostname}:5000/api/reports`

const FOUND_REPORT_STORAGE_KEY =
  "findx:found-report"


const INITIAL_FORM = {
  itemName: "",
  generalLocation: "",
  description: "",
  currentLocation: "",
}


// ============================================================
// REPORT FORM
// ============================================================

function ReportForm({
  onReportCreated,
}) {

  // ==========================================================
  // ROLE FROM URL PATH & QUERY
  //
  // Inspects pathname (/found, /finder) as well as query (?role=finder)
  // to avoid defaulting finder paths to lost reports.
  // ==========================================================

  const currentPath =
    window.location.pathname.toLowerCase()

  const params =
    new URLSearchParams(
      window.location.search
    )

  const urlRole =
    params.get("role")

  const isFinderRoute =
    currentPath === "/found" ||
    currentPath === "/finder" ||
    urlRole === "finder" ||
    urlRole === "found"


  // ==========================================================
  // REPORT TYPE
  //
  // FINDER -> FOUND
  // NORMAL -> LOST
  // User can still change manually.
  // ==========================================================

  const initialType =
    isFinderRoute
      ? "found"
      : "lost"


  const [
    reportType,
    setReportType,
  ] = useState(
    initialType
  )


  // ==========================================================
  // FORM
  // ==========================================================

  const [
    formData,
    setFormData,
  ] = useState(
    INITIAL_FORM
  )


  // ==========================================================
  // IMAGE
  // ==========================================================

  const [
    imageFile,
    setImageFile,
  ] = useState(null)


  const [
    imagePreview,
    setImagePreview,
  ] = useState("")


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    error,
    setError,
  ] = useState("")


  const [
    success,
    setSuccess,
  ] = useState(false)


  const [
    reportId,
    setReportId,
  ] = useState("")


  const [
    submitting,
    setSubmitting,
  ] = useState(false)


  // ==========================================================
  // HERO EVENT
  // ==========================================================

  useEffect(() => {

    function handleHeroSelection(
      event
    ) {

      const type =
        event.detail?.type


      if (
        type !== "lost" &&
        type !== "found"
      ) {
        return
      }


      resetEverything(
        type
      )

    }


    window.addEventListener(
      "findx:select-report-type",
      handleHeroSelection
    )


    return () => {

      window.removeEventListener(
        "findx:select-report-type",
        handleHeroSelection
      )

    }

  }, [])


  // ==========================================================
  // IMAGE CLEANUP
  // ==========================================================

  useEffect(() => {

    return () => {

      if (imagePreview) {

        URL.revokeObjectURL(
          imagePreview
        )

      }

    }

  }, [imagePreview])


  // ==========================================================
  // CHANGE REPORT TYPE
  // ==========================================================

  function chooseReportType(
    type
  ) {

    if (
      type !== "lost" &&
      type !== "found"
    ) {
      return
    }


    if (
      imagePreview
    ) {

      URL.revokeObjectURL(
        imagePreview
      )

    }


    setReportType(
      type
    )

    setFormData(
      INITIAL_FORM
    )

    setImageFile(
      null
    )

    setImagePreview(
      ""
    )

    setError(
      ""
    )

    setSuccess(
      false
    )

    setReportId(
      ""
    )

  }


  // ==========================================================
  // RESET ALL
  // ==========================================================

  function resetEverything(
    nextType
  ) {

    if (
      imagePreview
    ) {

      URL.revokeObjectURL(
        imagePreview
      )

    }


    setReportType(
      nextType ||
      "lost"
    )

    setFormData(
      INITIAL_FORM
    )

    setImageFile(
      null
    )

    setImagePreview(
      ""
    )

    setError(
      ""
    )

    setSuccess(
      false
    )

    setReportId(
      ""
    )


    window.setTimeout(() => {

      document
        .getElementById(
          "report"
        )
        ?.scrollIntoView({
          behavior:
            "smooth",
          block:
            "start",
        })

    }, 50)

  }


  // ==========================================================
  // INPUT
  // ==========================================================

  function handleChange(
    event
  ) {

    const {
      name,
      value,
    } = event.target


    setFormData(
      current => ({
        ...current,
        [name]:
          value,
      })
    )


    setError(
      ""
    )

    setSuccess(
      false
    )

  }


  // ==========================================================
  // IMAGE SELECT
  // ==========================================================

  function handleImageChange(
    event
  ) {

    const file =
      event.target.files?.[0]


    if (!file) {
      return
    }


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      setError(
        "Please select a valid image file."
      )

      event.target.value =
        ""

      return
    }


    const maxSize =
      10 * 1024 * 1024


    if (
      file.size >
      maxSize
    ) {

      setError(
        "Image must be smaller than 10 MB."
      )

      event.target.value =
        ""

      return
    }


    if (
      imagePreview
    ) {

      URL.revokeObjectURL(
        imagePreview
      )

    }


    const preview =
      URL.createObjectURL(
        file
      )


    setImageFile(
      file
    )

    setImagePreview(
      preview
    )

    setError(
      ""
    )

    setSuccess(
      false
    )

  }


  // ==========================================================
  // REMOVE IMAGE
  // ==========================================================

  function removeImage() {

    if (
      imagePreview
    ) {

      URL.revokeObjectURL(
        imagePreview
      )

    }


    setImageFile(
      null
    )

    setImagePreview(
      ""
    )


    const input =
      document.getElementById(
        "itemPhoto"
      )


    if (input) {
      input.value = ""
    }


    setError(
      ""
    )

  }


  // ==========================================================
  // FILE -> DATA URL
  // ==========================================================

  function fileToDataUrl(
    file
  ) {

    return new Promise(
      (
        resolve,
        reject
      ) => {

        if (!file) {

          resolve(
            null
          )

          return
        }


        const reader =
          new FileReader()


        reader.onload =
          () => {

            resolve(
              reader.result
            )

          }


        reader.onerror =
          () => {

            reject(
              new Error(
                "Failed to process the image."
              )
            )

          }


        reader.readAsDataURL(
          file
        )

      }
    )

  }


  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function handleSubmit(
    event
  ) {

    event.preventDefault()


    if (
      submitting
    ) {
      return
    }


    setError(
      ""
    )

    setSuccess(
      false
    )


    // ========================================================
    // REQUIRED TYPE
    // ========================================================

    if (
      reportType !== "lost" &&
      reportType !== "found"
    ) {

      setError(
        "Please choose Lost or Found."
      )

      return
    }


    // ========================================================
    // CLEAN VALUES
    // ========================================================

    const itemName =
      formData.itemName.trim()


    const generalLocation =
      formData.generalLocation.trim()


    const description =
      formData.description.trim()


    const currentLocation =
      formData.currentLocation.trim()


    // ========================================================
    // VALIDATION
    // ========================================================

    if (!itemName) {

      setError(
        reportType === "lost"
          ? "Tell us what you lost."
          : "Tell us what you found."
      )

      return
    }


    if (!generalLocation) {

      setError(
        reportType === "lost"
          ? "Tell us where you last had it."
          : "Tell us where you found it."
      )

      return
    }


    if (!description) {

      setError(
        reportType === "lost"
          ? "Enter the specifications of the lost item."
          : "Enter the specifications of the found item."
      )

      return
    }


    if (
      reportType === "found" &&
      !currentLocation
    ) {

      setError(
        "Tell us where the item is now."
      )

      return
    }


    try {

      setSubmitting(
        true
      )


      // ======================================================
      // IMAGE
      // ======================================================

      let image =
        null


      if (imageFile) {

        const dataUrl =
          await fileToDataUrl(
            imageFile
          )


        image = {

          name:
            imageFile.name,

          type:
            imageFile.type,

          size:
            imageFile.size,

          dataUrl,

        }

      }


      // ======================================================
      // DESCRIPTION
      //
      // Keep user's specification text intact.
      // ======================================================

      const finalDescription =
        description


      // ======================================================
      // LOCATION
      // ======================================================

      const finalLocation =
        reportType === "found"
          ? (
              `${generalLocation}` +
              (
                currentLocation
                  ? ` | Current location: ${currentLocation}`
                  : ""
              )
            )
          : generalLocation


      // ======================================================
      // PAYLOAD
      // ======================================================

      const payload = {

        type:
          reportType,

        itemName:
          itemName,

        description:
          finalDescription,

        location:
          finalLocation,

        image,

      }


      console.log(
        "FINDX: Creating report:",
        payload
      )

      console.log(
        "FINDX: Report API:",
        API_URL
      )


      // ======================================================
      // BACKEND
      // ======================================================

      const response =
        await fetch(
          API_URL,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        )


      let data


      try {

        data =
          await response.json()

      } catch {

        throw new Error(
          "The FINDX server returned an invalid response."
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


      // ======================================================
      // CREATED REPORT
      // ======================================================

      const createdReport =
        data.report ||
        {}


      const createdReportId =
        createdReport.id ||
        createdReport._id ||
        ""


      if (!createdReportId) {

        throw new Error(
          "FINDX created the report but did not return a report ID."
        )

      }


      console.log(
        "FINDX: Report created:",
        createdReport
      )


      setReportId(
        createdReportId
      )


      setSuccess(
        true
      )

      setError(
        ""
      )


      // ======================================================
      // IMPORTANT:
      // SAVE FOUND REPORT FOR FINDER SESSION
      // ======================================================

      if (
        reportType === "found"
      ) {

        try {

          window.localStorage.setItem(
            FOUND_REPORT_STORAGE_KEY,
            JSON.stringify({
              reportId:
                createdReportId,

              type:
                "found",

              report:
                createdReport,
            })
          )

        } catch (
          storageError
        ) {

          console.warn(
            "FINDX: Could not store found report locally:",
            storageError
          )

        }

      }


      // ======================================================
      // SEND TO APP
      // ======================================================

      if (
        typeof onReportCreated ===
          "function"
      ) {

        onReportCreated({

          reportId:
            createdReportId,

          type:
            reportType,

          report:
            createdReport,

        })

      }


      // ======================================================
      // CLEAR FORM
      // ======================================================

      setFormData(
        INITIAL_FORM
      )


      if (
        imagePreview
      ) {

        URL.revokeObjectURL(
          imagePreview
        )

      }


      setImageFile(
        null
      )

      setImagePreview(
        ""
      )


      const input =
        document.getElementById(
          "itemPhoto"
        )


      if (input) {
        input.value = ""
      }


    } catch (
      submitError
    ) {

      console.error(
        "FINDX: Report creation failed:",
        submitError
      )


      if (
        submitError instanceof
          TypeError &&
        submitError.message ===
          "Failed to fetch"
      ) {

        setError(
          `Cannot connect to FINDX backend at ${window.location.hostname}:5000. Make sure the backend is running and both laptops are on the same Wi-Fi.`
        )

      } else {

        setError(
          submitError.message ||
          "Unable to create the report."
        )

      }


      setSuccess(
        false
      )

    } finally {

      setSubmitting(
        false
      )

    }

  }


  // ==========================================================
  // TYPE SELECTION
  //
  // Normally hidden because role decides the initial type.
  // Kept available through Change.
  // ==========================================================

  function showTypeSelector() {

    if (
      submitting
    ) {
      return
    }


    setReportType(
      ""
    )

    setFormData(
      INITIAL_FORM
    )

    if (
      imagePreview
    ) {

      URL.revokeObjectURL(
        imagePreview
      )

    }

    setImageFile(
      null
    )

    setImagePreview(
      ""
    )

    setError(
      ""
    )

    setSuccess(
      false
    )

    setReportId(
      ""
    )

  }


  // ==========================================================
  // TYPE SELECTOR
  // ==========================================================

  if (
    !reportType
  ) {

    return (
      <section
        id="report"
        className="
          relative
          py-24
          sm:py-32
        "
      >

        <div
          className="findx-container"
        >

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              mx-auto
              max-w-3xl
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
                px-3.5
                py-2
                text-xs
                font-medium
                tracking-wide
                text-blue-300
              "
            >

              <Sparkles
                size={14}
              />

              FINDX SMART REPORT

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

              What happened?

              <br />

              <span
                className="findx-gradient-text"
              >
                Let's get it back.
              </span>

            </h2>


            <p
              className="
                mt-5
                max-w-2xl
                text-base
                leading-7
                text-slate-400
                sm:text-lg
              "
            >
              Choose whether you lost an item
              or found one so FINDX can start
              the correct recovery flow.
            </p>

          </motion.div>


          <div
            className="
              mx-auto
              mt-12
              grid
              max-w-4xl
              gap-5
              md:grid-cols-2
            "
          >

            <TypeCard
              type="lost"
              title="I lost something"
              subtitle="Find an item that belongs to me."
              icon={
                PackageSearch
              }
              onClick={() =>
                chooseReportType(
                  "lost"
                )
              }
            />


            <TypeCard
              type="found"
              title="I found something"
              subtitle="Help return an item to its owner."
              icon={
                MapPin
              }
              onClick={() =>
                chooseReportType(
                  "found"
                )
              }
            />

          </div>

        </div>

      </section>
    )

  }


  // ==========================================================
  // REPORT FORM
  // ==========================================================

  return (
    <section
      id="report"
      className="
        relative
        py-24
        sm:py-32
      "
    >

      <div className="findx-container">

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            mx-auto
            max-w-3xl
          "
        >

          {/* ==================================================
              HEADER
              ================================================== */}

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

              <div
                className={`
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  ${
                    reportType ===
                    "lost"
                      ? "bg-red-400/[0.08]"
                      : "bg-emerald-400/[0.08]"
                  }
                `}
              >

                {reportType ===
                "lost" ? (

                  <PackageSearch
                    size={20}
                    className="text-red-300"
                  />

                ) : (

                  <MapPin
                    size={20}
                    className="text-emerald-300"
                  />

                )}

              </div>


              <div>

                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.14em]
                    text-slate-600
                  "
                >
                  FINDX REPORT
                </p>


                <h2
                  className="
                    mt-1
                    text-xl
                    font-semibold
                    text-white
                    sm:text-2xl
                  "
                >

                  {reportType ===
                  "lost"
                    ? "Report a lost item"
                    : "Report a found item"}

                </h2>

              </div>

            </div>


            <button
              type="button"
              onClick={
                showTypeSelector
              }
              disabled={
                submitting
              }
              className="
                rounded-xl
                border
                border-white/[0.07]
                bg-white/[0.025]
                px-3
                py-2
                text-[10px]
                font-medium
                text-slate-500
                hover:border-white/[0.14]
                hover:text-white
                disabled:opacity-50
              "
            >
              Change
            </button>

          </div>


          {/* ==================================================
              FORM
              ================================================== */}

          <form
            onSubmit={
              handleSubmit
            }
            noValidate
            className="
              findx-glass
              mt-6
              overflow-hidden
              rounded-3xl
              border
              border-white/[0.08]
              bg-white/[0.025]
              p-5
              sm:p-8
            "
          >

            {/* =================================================
                ITEM
                ================================================= */}

            <InputField
              id="itemName"
              name="itemName"
              label={
                reportType ===
                "lost"
                  ? "What did you lose?"
                  : "What did you find?"
              }
              value={
                formData.itemName
              }
              onChange={
                handleChange
              }
              placeholder="e.g. Silver Lenovo laptop"
              icon={
                FileText
              }
              disabled={
                submitting
              }
            />


            {/* =================================================
                GENERAL LOCATION
                ================================================= */}

            <InputField
              id="generalLocation"
              name="generalLocation"
              label={
                reportType ===
                "lost"
                  ? "Where did you last have it?"
                  : "Where did you find it?"
              }
              value={
                formData.generalLocation
              }
              onChange={
                handleChange
              }
              placeholder={
                reportType ===
                "lost"
                  ? "e.g. Vignan campus / Lab 25"
                  : "e.g. Vignan campus / Lab 25"
              }
              icon={
                MapPin
              }
              disabled={
                submitting
              }
            />


            {/* =================================================
                FOUND CURRENT LOCATION
                ================================================= */}

            {reportType ===
              "found" && (

              <div
                className="mt-5"
              >

                <InputField
                  id="currentLocation"
                  name="currentLocation"
                  label="Where is the item now?"
                  value={
                    formData.currentLocation
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. AI Lab / Security Desk / Block B"
                  icon={
                    MapPin
                  }
                  disabled={
                    submitting
                  }
                />


                <p
                  className="
                    mt-2
                    text-[10px]
                    leading-4
                    text-slate-600
                  "
                >
                  Use a safe public or controlled
                  location. Do not enter a private
                  home address.
                </p>

              </div>

            )}


            {/* =================================================
                SPECIFICATIONS
                ================================================= */}

            <div
              className="mt-5"
            >

              <label
                htmlFor="description"
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.14em]
                  text-slate-500
                "
              >

                {reportType ===
                "lost"
                  ? "Specifications of lost item"
                  : "Specifications of found item"}

              </label>


              <textarea
                id="description"
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                disabled={
                  submitting
                }
                rows={6}
                maxLength={1200}
                placeholder={
                  reportType ===
                  "lost"
                    ? "Example: Silver Lenovo laptop, black sticker near the left hinge, 512 GB, small scratch on the lid."
                    : "Example: Silver Lenovo laptop, black sticker near the left hinge, 512 GB, found with a small scratch on the lid."
                }
                className="
                  mt-3
                  min-h-[150px]
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
                  disabled:opacity-50
                "
              />


              <div
                className="
                  mt-2
                  flex
                  items-center
                  justify-between
                "
              >

                <span
                  className="
                    text-[10px]
                    text-slate-700
                  "
                >
                  Include identifying details
                  known only to the real owner.
                </span>


                <span
                  className="
                    text-[10px]
                    text-slate-700
                  "
                >
                  {
                    formData
                      .description
                      .length
                  }
                  /1200
                </span>

              </div>

            </div>


            {/* =================================================
                PHOTO
                ================================================= */}

            <div
              className="mt-6"
            >

              <div>

                <p
                  className="
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.14em]
                    text-slate-500
                  "
                >
                  Item photo
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    text-slate-600
                  "
                >
                  Optional
                </p>

              </div>


              {!imagePreview ? (

                <label
                  htmlFor="itemPhoto"
                  className="
                    mt-3
                    flex
                    cursor-pointer
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-dashed
                    border-white/[0.10]
                    bg-white/[0.015]
                    px-4
                    py-4
                    hover:border-blue-400/25
                    hover:bg-blue-400/[0.025]
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
                      bg-blue-400/[0.07]
                    "
                  >

                    <Camera
                      size={17}
                      className="text-blue-300"
                    />

                  </div>


                  <div>

                    <p
                      className="
                        text-xs
                        font-medium
                        text-slate-300
                      "
                    >
                      Add a photo
                    </p>

                    <p
                      className="
                        mt-1
                        text-[10px]
                        text-slate-600
                      "
                    >
                      JPG, PNG, WEBP · Max 10 MB
                    </p>

                  </div>

                </label>

              ) : (

                <div
                  className="
                    relative
                    mt-3
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/[0.08]
                    bg-black/20
                  "
                >

                  <img
                    src={
                      imagePreview
                    }
                    alt="Selected item"
                    className="
                      h-48
                      w-full
                      object-cover
                    "
                  />


                  <div
                    className="
                      absolute
                      inset-x-0
                      bottom-0
                      flex
                      items-center
                      justify-between
                      bg-black/70
                      px-4
                      py-3
                    "
                  >

                    <div
                      className="min-w-0"
                    >

                      <p
                        className="
                          truncate
                          text-xs
                          font-medium
                          text-white
                        "
                      >
                        {
                          imageFile?.name
                        }
                      </p>

                      <p
                        className="
                          mt-1
                          text-[10px]
                          text-slate-500
                        "
                      >
                        Photo ready
                      </p>

                    </div>


                    <button
                      type="button"
                      onClick={
                        removeImage
                      }
                      disabled={
                        submitting
                      }
                      className="
                        ml-3
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-white/[0.08]
                        text-slate-400
                        hover:bg-red-400/10
                        hover:text-red-300
                        disabled:opacity-50
                      "
                    >

                      <X
                        size={15}
                      />

                    </button>

                  </div>

                </div>

              )}


              <input
                id="itemPhoto"
                name="itemPhoto"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={
                  handleImageChange
                }
                disabled={
                  submitting
                }
                className="hidden"
              />

            </div>


            {/* =================================================
                PRIVACY
                ================================================= */}

            <div
              className="
                mt-6
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


              <div>

                <p
                  className="
                    text-xs
                    font-medium
                    text-emerald-200
                  "
                >
                  Privacy-first recovery
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    leading-5
                    text-slate-600
                  "
                >
                  FINDX uses general location
                  information for matching.
                  Private addresses are never required.
                </p>

              </div>

            </div>


            {/* =================================================
                ERROR
                ================================================= */}

            {error && (

              <motion.div
                initial={{
                  opacity: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-red-400/15
                  bg-red-400/[0.05]
                  px-4
                  py-3
                  text-sm
                  leading-5
                  text-red-300
                "
              >
                {error}
              </motion.div>

            )}


            {/* =================================================
                SUCCESS
                ================================================= */}

            {success && (

              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-emerald-400/15
                  bg-emerald-400/[0.05]
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

                  <CheckCircle2
                    size={19}
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
                      {reportType ===
                      "lost"
                        ? "Lost report created"
                        : "Found report created"}
                    </p>


                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-slate-500
                      "
                    >
                      FINDX is now checking
                      for a potential match.
                    </p>


                    {reportId && (

                      <p
                        className="
                          mt-2
                          text-[10px]
                          text-slate-600
                        "
                      >

                        Report ID:{" "}

                        <span
                          className="text-slate-400"
                        >
                          {reportId}
                        </span>

                      </p>

                    )}

                  </div>

                </div>

              </motion.div>

            )}


            {/* =================================================
                SUBMIT
                ================================================= */}

            {!success && (

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
                  disabled:opacity-60
                "
              >

                {submitting
                  ? "Creating report..."
                  : reportType ===
                      "lost"
                    ? "Report lost item"
                    : "Report found item"}


                {!submitting && (

                  <Send
                    size={16}
                  />

                )}

              </button>

            )}

          </form>


          {/* ==================================================
              INFO
              ================================================== */}

          <div
            className="
              mt-5
              grid
              gap-3
              sm:grid-cols-3
            "
          >

            <MiniInfo
              icon={
                Sparkles
              }
              title="Simple"
              text="Only essential information."
            />

            <MiniInfo
              icon={
                ShieldCheck
              }
              title="Private"
              text="No private address required."
            />

            <MiniInfo
              icon={
                CheckCircle2
              }
              title="Smart"
              text="FINDX searches for matches."
            />

          </div>

        </motion.div>

      </div>

    </section>
  )
}


// ============================================================
// TYPE CARD
// ============================================================

function TypeCard({
  type,
  title,
  subtitle,
  icon: Icon,
  onClick,
}) {

  const isLost =
    type === "lost"


  return (
    <button
      type="button"
      onClick={
        onClick
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
        hover:-translate-y-1
        hover:border-white/[0.15]
        sm:p-9
      "
    >

      <div
        className={`
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-40
          w-40
          rounded-full
          blur-3xl
          ${
            isLost
              ? "bg-red-400/[0.08]"
              : "bg-emerald-400/[0.08]"
          }
        `}
      />


      <div
        className={`
          relative
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          ${
            isLost
              ? "bg-red-400/[0.08]"
              : "bg-emerald-400/[0.08]"
          }
        `}
      >

        <Icon
          size={26}
          className={
            isLost
              ? "text-red-300"
              : "text-emerald-300"
          }
        />

      </div>


      <h3
        className="
          relative
          mt-6
          text-2xl
          font-semibold
          tracking-[-0.03em]
          text-white
        "
      >
        {title}
      </h3>


      <p
        className="
          relative
          mt-3
          text-sm
          leading-6
          text-slate-500
        "
      >
        {subtitle}
      </p>


      <span
        className={`
          relative
          mt-6
          inline-flex
          items-center
          gap-2
          rounded-xl
          px-3
          py-2
          text-xs
          font-semibold
          ${
            isLost
              ? "bg-red-400/[0.06] text-red-300"
              : "bg-emerald-400/[0.06] text-emerald-300"
          }
        `}
      >

        Start

        <Send
          size={13}
        />

      </span>

    </button>
  )
}


// ============================================================
// INPUT
// ============================================================

function InputField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  disabled,
}) {

  return (
    <div
      className="mt-5"
    >

      <label
        htmlFor={id}
        className="
          text-xs
          font-medium
          uppercase
          tracking-[0.14em]
          text-slate-500
        "
      >
        {label}
      </label>


      <div
        className="
          relative
          mt-3
        "
      >

        {Icon && (

          <Icon
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

        )}


        <input
          id={id}
          name={name}
          type="text"
          value={
            value
          }
          onChange={
            onChange
          }
          disabled={
            disabled
          }
          placeholder={
            placeholder
          }
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
            focus:border-blue-400/30
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
          style={{
            paddingLeft:
              Icon
                ? "44px"
                : "16px",
          }}
        />

      </div>

    </div>
  )
}


// ============================================================
// MINI INFO
// ============================================================

function MiniInfo({
  icon: Icon,
  title,
  text,
}) {

  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.02]
        p-4
      "
    >

      <Icon
        size={16}
        className="text-blue-300"
      />


      <p
        className="
          mt-3
          text-xs
          font-semibold
          text-white
        "
      >
        {title}
      </p>


      <p
        className="
          mt-1
          text-[10px]
          leading-4
          text-slate-600
        "
      >
        {text}
      </p>

    </div>
  )
}


export default ReportForm