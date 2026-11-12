import { useState } from "react"

import {
  Check,
  CheckCircle2,
  LockKeyhole,
  MapPin,
  Navigation,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserRoundX,
} from "lucide-react"

const API_URL =
  "http://localhost:5000/api/recoveries"

const LOCATION_OPTIONS = [
  {
    value: "class",
    label: "My current class",
  },
  {
    value: "department",
    label: "My department",
  },
  {
    value: "lab",
    label: "My current lab",
  },
  {
    value: "classroom",
    label: "My current classroom",
  },
  {
    value: "security_desk",
    label: "Security desk",
  },
  {
    value: "lost_and_found",
    label: "Lost & Found desk",
  },
  {
    value: "authorized_location",
    label: "Other authorized campus location",
  },
]

function RecoveryHandover({
  matchId,
  lostReportId,
  foundReportId,
  onRecoveryCreated,
}) {
  const [creating, setCreating] =
    useState(false)

  const [recovery, setRecovery] =
    useState(null)

  const [updating, setUpdating] =
    useState(false)

  const [
    markingUnavailable,
    setMarkingUnavailable,
  ] = useState(false)

  const [
    transferring,
    setTransferring,
  ] = useState(false)

  const [
    completing,
    setCompleting,
  ] = useState(false)

  const [error, setError] =
    useState("")

  const [locationType, setLocationType] =
    useState("class")

  const [institution, setInstitution] =
    useState("")

  const [className, setClassName] =
    useState("")

  const [department, setDepartment] =
    useState("")

  const [room, setRoom] =
    useState("")

  const [currentPlace, setCurrentPlace] =
    useState("")

  const [
    availabilityUntil,
    setAvailabilityUntil,
  ] = useState("")

  const [notes, setNotes] =
    useState("")

  // ============================================
  // CREATE CONTROLLED RECOVERY
  // ============================================

  async function createRecovery() {
    if (
      !matchId ||
      !lostReportId ||
      !foundReportId
    ) {
      setError(
        "Recovery information is incomplete."
      )

      return
    }

    try {
      setCreating(true)
      setError("")

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
            lostReportId,
            foundReportId,
          }),
        }
      )

      let data

      try {
        data = await response.json()
      } catch {
        throw new Error(
          "Recovery server returned an invalid response."
        )
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to create recovery."
        )
      }

      console.log(
        "FINDX: Recovery created:",
        data.recovery
      )

      setRecovery(
        data.recovery
      )

      if (onRecoveryCreated) {
        onRecoveryCreated(
          data.recovery
        )
      }
    } catch (error) {
      console.error(
        "FINDX: Failed to create recovery.",
        error
      )

      setError(
        error.message ||
          "Unable to create controlled recovery."
      )
    } finally {
      setCreating(false)
    }
  }

  // ============================================
  // UPDATE PRIVATE HANDOVER LOCATION
  // ============================================

  async function updateLocation() {
    if (!recovery?.recoveryId) {
      return
    }

    if (!currentPlace.trim()) {
      setError(
        "Enter the current place where the lost person should approach."
      )

      return
    }

    try {
      setUpdating(true)
      setError("")

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(
          recovery.recoveryId
        )}/location`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            type: locationType,

            institution:
              institution.trim(),

            className:
              className.trim(),

            department:
              department.trim(),

            room:
              room.trim(),

            currentPlace:
              currentPlace.trim(),

            availabilityUntil:
              availabilityUntil.trim(),

            notes:
              notes.trim(),
          }),
        }
      )

      let data

      try {
        data = await response.json()
      } catch {
        throw new Error(
          "Recovery server returned an invalid response."
        )
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to update recovery location."
        )
      }

      console.log(
        "FINDX: Private handover location updated:",
        data.recovery
      )

      setRecovery(
        data.recovery
      )

      if (onRecoveryCreated) {
        onRecoveryCreated(
          data.recovery
        )
      }
    } catch (error) {
      console.error(
        "FINDX: Failed to update recovery location.",
        error
      )

      setError(
        error.message ||
          "Unable to update recovery location."
      )
    } finally {
      setUpdating(false)
    }
  }

  // ============================================
  // FINDER UNAVAILABLE
  // ============================================

  async function markFinderUnavailable() {
    if (!recovery?.recoveryId) {
      return
    }

    try {
      setMarkingUnavailable(true)
      setError("")

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(
          recovery.recoveryId
        )}/unavailable`,
        {
          method: "PATCH",
        }
      )

      let data

      try {
        data = await response.json()
      } catch {
        throw new Error(
          "Recovery server returned an invalid response."
        )
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to update finder availability."
        )
      }

      console.log(
        "FINDX: Finder marked unavailable:",
        data.recovery
      )

      setRecovery(
        data.recovery
      )

      if (onRecoveryCreated) {
        onRecoveryCreated(
          data.recovery
        )
      }
    } catch (error) {
      console.error(
        "FINDX: Failed to mark finder unavailable.",
        error
      )

      setError(
        error.message ||
          "Unable to update finder availability."
      )
    } finally {
      setMarkingUnavailable(false)
    }
  }

  // ============================================
  // TRANSFER TO LOST & FOUND
  // ============================================

  async function transferToLostAndFound() {
    if (!recovery?.recoveryId) {
      return
    }

    try {
      setTransferring(true)
      setError("")

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(
          recovery.recoveryId
        )}/transfer`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            type: "lost_and_found",

            institution:
              institution.trim(),

            currentPlace:
              "Authorized Lost & Found desk",

            room:
              room.trim(),

            notes:
              "Item transferred by finder for controlled recovery.",
          }),
        }
      )

      let data

      try {
        data = await response.json()
      } catch {
        throw new Error(
          "Recovery server returned an invalid response."
        )
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to transfer item."
        )
      }

      console.log(
        "FINDX: Item transferred to Lost & Found:",
        data.recovery
      )

      setRecovery(
        data.recovery
      )

      if (onRecoveryCreated) {
        onRecoveryCreated(
          data.recovery
        )
      }
    } catch (error) {
      console.error(
        "FINDX: Failed to transfer item.",
        error
      )

      setError(
        error.message ||
          "Unable to transfer the item."
      )
    } finally {
      setTransferring(false)
    }
  }

  // ============================================
  // COMPLETE HANDOVER
  // ============================================

  async function completeHandover() {
    if (!recovery?.recoveryId) {
      return
    }

    const confirmed =
      window.confirm(
        "Confirm that the item has been safely handed over?"
      )

    if (!confirmed) {
      return
    }

    try {
      setCompleting(true)
      setError("")

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(
          recovery.recoveryId
        )}/complete`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            handoverNote:
              "Item successfully handed over.",
          }),
        }
      )

      let data

      try {
        data = await response.json()
      } catch {
        throw new Error(
          "Recovery server returned an invalid response."
        )
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to complete handover."
        )
      }

      console.log(
        "FINDX: Handover completed:",
        data.recovery
      )

      setRecovery(
        data.recovery
      )

      if (onRecoveryCreated) {
        onRecoveryCreated(
          data.recovery
        )
      }
    } catch (error) {
      console.error(
        "FINDX: Failed to complete handover.",
        error
      )

      setError(
        error.message ||
          "Unable to complete handover."
      )
    } finally {
      setCompleting(false)
    }
  }

  // ============================================
  // FINDER SESSION LINK
  // ============================================

  function getFinderSessionLink() {
    if (
      !recovery?.recoveryId
    ) {
      return ""
    }

    return `${window.location.origin}/?recovery=${encodeURIComponent(
      recovery.recoveryId
    )}&role=finder`
  }

  async function copyFinderLink() {
    const link =
      getFinderSessionLink()

    if (!link) {
      return
    }

    try {
      await navigator.clipboard.writeText(
        link
      )

      setError(
        "Finder session link copied."
      )

      window.setTimeout(() => {
        setError("")
      }, 2500)
    } catch (error) {
      console.error(
        "FINDX: Failed to copy finder link.",
        error
      )

      setError(
        "Unable to copy the finder session link."
      )
    }
  }

  // ============================================
  // REQUIRED DATA CHECK
  // ============================================

  if (
    !matchId ||
    !lostReportId ||
    !foundReportId
  ) {
    return null
  }

  const pickupLocation =
    recovery?.pickupLocation ||
    null

  const isCompleted =
    recovery?.status ===
    "completed"

  const isTransferred =
    recovery?.status ===
    "transferred_to_security"

  const isFinderUnavailable =
    recovery?.status ===
    "finder_unavailable"

  const canSetLocation =
    recovery &&
    !isCompleted &&
    recovery.status !==
      "cancelled"

  return (
    <section
      id="recovery"
      className="
        relative
        py-16
        sm:py-20
      "
    >
      <div className="findx-container">

        <div
          className="
            mx-auto
            max-w-3xl
          "
        >

          {/* ========================================
              HEADER
              ======================================== */}

          <div>

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-emerald-400/15
                bg-emerald-400/[0.05]
                px-3.5
                py-2
                text-xs
                font-medium
                tracking-wide
                text-emerald-300
              "
            >
              <PackageCheck size={14} />

              CONTROLLED RECOVERY
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
              Recover it
              <br />

              <span className="findx-gradient-text">
                safely.
              </span>
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
              Ownership has been approved.
              FINDX provides a controlled
              handover channel without requiring
              the finder to expose a private
              home address.
            </p>

          </div>

          {/* ========================================
              MAIN CARD
              ======================================== */}

          <div
            className="
              mt-8
              rounded-3xl
              border
              border-white/[0.08]
              bg-white/[0.025]
              p-6
              sm:p-8
            "
          >

            {/* =====================================
                CREATE RECOVERY
                ===================================== */}

            {!recovery ? (
              <>
                <div
                  className="
                    grid
                    gap-3
                    sm:grid-cols-3
                  "
                >

                  <RecoveryFeature
                    icon={ShieldCheck}
                    title="Verified owner"
                    text="Ownership verification approved."
                  />

                  <RecoveryFeature
                    icon={LockKeyhole}
                    title="Privacy protected"
                    text="Private addresses remain hidden."
                  />

                  <RecoveryFeature
                    icon={MapPin}
                    title="Controlled location"
                    text="Class, lab, classroom, or authorized desk."
                  />

                </div>

                <div
                  className="
                    mt-6
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

                    <Sparkles
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
                        Secure handover protocol
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-5
                          text-slate-500
                        "
                      >
                        The finder can provide a
                        current class, lab, classroom,
                        department, security desk, or
                        Lost & Found desk. FINDX does
                        not require a private home
                        address.
                      </p>

                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    createRecovery
                  }
                  disabled={creating}
                  className="
                    mt-6
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-emerald-500
                    text-sm
                    font-semibold
                    text-white
                    transition-colors
                    hover:bg-emerald-400
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {creating ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />

                      Creating controlled recovery...
                    </>
                  ) : (
                    <>
                      <PackageCheck
                        size={16}
                      />

                      Create controlled recovery
                    </>
                  )}

                </button>
              </>
            ) : (
              <>
                {/* =================================
                    RECOVERY HEADER
                    ================================= */}

                <div
                  className="
                    flex
                    items-start
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
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-emerald-400/[0.08]
                      "
                    >

                      {isCompleted ? (
                        <CheckCircle2
                          size={22}
                          className="text-emerald-300"
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
                          text-[10px]
                          uppercase
                          tracking-[0.14em]
                          text-slate-600
                        "
                      >
                        Recovery status
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-semibold
                          capitalize
                          text-emerald-300
                        "
                      >
                        {recovery.status?.replace(
                          /_/g,
                          " "
                        )}
                      </p>

                    </div>

                  </div>

                  <span
                    className="
                      break-all
                      text-right
                      text-[10px]
                      text-slate-600
                    "
                  >
                    {recovery.recoveryId}
                  </span>

                </div>

                {/* =================================
                    FINDER SESSION LINK
                    ================================= */}

                <div
                  className="
                    mt-6
                    rounded-2xl
                    border
                    border-violet-400/[0.12]
                    bg-violet-400/[0.025]
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

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-violet-400/[0.08]
                      "
                    >
                      <Navigation
                        size={17}
                        className="text-violet-300"
                      />
                    </div>

                    <div className="min-w-0 flex-1">

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "
                      >

                        <div>

                          <p
                            className="
                              text-sm
                              font-medium
                              text-violet-200
                            "
                          >
                            Private finder session
                          </p>

                          <p
                            className="
                              mt-1
                              text-xs
                              leading-5
                              text-slate-500
                            "
                          >
                            Give this session link
                            to the verified finder.
                            It opens the private
                            recovery chat and radar.
                          </p>

                        </div>

                      </div>

                      <div
                        className="
                          mt-3
                          rounded-xl
                          border
                          border-white/[0.07]
                          bg-black/20
                          p-3
                        "
                      >

                        <p
                          className="
                            break-all
                            text-[10px]
                            leading-5
                            text-slate-500
                          "
                        >
                          {getFinderSessionLink()}
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={
                          copyFinderLink
                        }
                        className="
                          mt-3
                          inline-flex
                          h-10
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-violet-500
                          px-4
                          text-xs
                          font-semibold
                          text-white
                          transition-colors
                          hover:bg-violet-400
                        "
                      >
                        <Navigation
                          size={14}
                        />

                        Copy finder session link
                      </button>

                    </div>

                  </div>

                </div>

                {/* =================================
                    PRIVATE LOCATION FORM
                    ================================= */}

                {canSetLocation &&
                  !isTransferred &&
                  !isFinderUnavailable && (
                    <div className="mt-7">

                      <h3
                        className="
                          text-lg
                          font-semibold
                          text-white
                        "
                      >
                        Where should the lost
                        person approach?
                      </h3>

                      <p
                        className="
                          mt-2
                          text-xs
                          leading-5
                          text-slate-500
                        "
                      >
                        Enter a safe school/college
                        location. Do not enter a
                        residential address.
                      </p>

                      <div className="mt-5">

                        <label
                          htmlFor="recoveryLocationType"
                          className="
                            text-xs
                            font-medium
                            uppercase
                            tracking-[0.14em]
                            text-slate-500
                          "
                        >
                          Approach location
                        </label>

                        <select
                          id="recoveryLocationType"
                          value={
                            locationType
                          }
                          onChange={(event) =>
                            setLocationType(
                              event.target.value
                            )
                          }
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
                            focus:border-blue-400/30
                          "
                        >

                          {LOCATION_OPTIONS.map(
                            (option) => (
                              <option
                                key={
                                  option.value
                                }
                                value={
                                  option.value
                                }
                                className="bg-slate-900"
                              >
                                {option.label}
                              </option>
                            )
                          )}

                        </select>

                      </div>

                      <RecoveryInput
                        label="School / College"
                        value={
                          institution
                        }
                        onChange={
                          setInstitution
                        }
                        placeholder="e.g. Vignan Institute"
                      />

                      {(locationType ===
                        "class" ||
                        locationType ===
                          "classroom") && (
                        <RecoveryInput
                          label="Class / Section"
                          value={
                            className
                          }
                          onChange={
                            setClassName
                          }
                          placeholder="e.g. AI-DS A, 2nd Year"
                        />
                      )}

                      {(locationType ===
                        "department" ||
                        locationType === "lab" ||
                        locationType ===
                          "classroom" ||
                        locationType ===
                          "class") && (
                        <RecoveryInput
                          label="Department"
                          value={
                            department
                          }
                          onChange={
                            setDepartment
                          }
                          placeholder="e.g. AI & Data Science"
                        />
                      )}

                      <RecoveryInput
                        label="Room / Lab"
                        value={room}
                        onChange={
                          setRoom
                        }
                        placeholder="e.g. Lab 204"
                      />

                      <RecoveryInput
                        label="Current place"
                        value={
                          currentPlace
                        }
                        onChange={
                          setCurrentPlace
                        }
                        placeholder="e.g. Block B, AI Lab"
                      />

                      <RecoveryInput
                        label="Available until"
                        value={
                          availabilityUntil
                        }
                        onChange={
                          setAvailabilityUntil
                        }
                        placeholder="e.g. 4:30 PM"
                      />

                      <div className="mt-5">

                        <label
                          htmlFor="recoveryNotes"
                          className="
                            text-xs
                            font-medium
                            uppercase
                            tracking-[0.14em]
                            text-slate-500
                          "
                        >
                          Additional instructions
                        </label>

                        <textarea
                          id="recoveryNotes"
                          value={notes}
                          onChange={(event) =>
                            setNotes(
                              event.target.value
                            )
                          }
                          rows={3}
                          maxLength={500}
                          placeholder="e.g. Approach the lab desk and ask for the item."
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
                          "
                        />

                      </div>

                      <button
                        type="button"
                        onClick={
                          updateLocation
                        }
                        disabled={updating}
                        className="
                          mt-6
                          flex
                          h-11
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-blue-500
                          text-sm
                          font-semibold
                          text-white
                          transition-colors
                          hover:bg-blue-400
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      >

                        {updating ? (
                          <>
                            <RefreshCw
                              size={15}
                              className="animate-spin"
                            />

                            Saving private location...
                          </>
                        ) : (
                          <>
                            <MapPin
                              size={15}
                            />

                            Share private handover details
                          </>
                        )}

                      </button>

                    </div>
                  )}

                {/* =================================
                    SAVED LOCATION
                    ================================= */}

                {pickupLocation?.currentPlace && (
                  <div
                    className="
                      mt-6
                      rounded-2xl
                      border
                      border-emerald-400/[0.10]
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
                          Private pickup information
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-slate-500
                          "
                        >
                          This information belongs to
                          the controlled recovery flow.
                          It should not be placed in
                          public reports or match results.
                        </p>

                      </div>

                    </div>

                    <div
                      className="
                        mt-5
                        grid
                        gap-3
                        sm:grid-cols-2
                      "
                    >

                      <RecoveryInfo
                        label="Approach place"
                        value={
                          pickupLocation.currentPlace
                        }
                      />

                      <RecoveryInfo
                        label="Location type"
                        value={
                          pickupLocation.type?.replace(
                            /_/g,
                            " "
                          )
                        }
                      />

                      {pickupLocation.institution && (
                        <RecoveryInfo
                          label="School / College"
                          value={
                            pickupLocation.institution
                          }
                        />
                      )}

                      {pickupLocation.className && (
                        <RecoveryInfo
                          label="Class / Section"
                          value={
                            pickupLocation.className
                          }
                        />
                      )}

                      {pickupLocation.department && (
                        <RecoveryInfo
                          label="Department"
                          value={
                            pickupLocation.department
                          }
                        />
                      )}

                      {pickupLocation.room && (
                        <RecoveryInfo
                          label="Room / Lab"
                          value={
                            pickupLocation.room
                          }
                        />
                      )}

                      {pickupLocation.availabilityUntil && (
                        <RecoveryInfo
                          label="Available until"
                          value={
                            pickupLocation.availabilityUntil
                          }
                        />
                      )}

                    </div>

                    {pickupLocation.notes && (
                      <div
                        className="
                          mt-3
                          rounded-xl
                          border
                          border-white/[0.06]
                          bg-black/10
                          p-3
                        "
                      >

                        <p
                          className="
                            text-[9px]
                            uppercase
                            tracking-[0.12em]
                            text-slate-600
                          "
                        >
                          Instructions
                        </p>

                        <p
                          className="
                            mt-1.5
                            text-xs
                            leading-5
                            text-slate-400
                          "
                        >
                          {pickupLocation.notes}
                        </p>

                      </div>
                    )}

                  </div>
                )}

                {/* =================================
                    FINDER UNAVAILABLE
                    ================================= */}

                {isFinderUnavailable && (
                  <div
                    className="
                      mt-6
                      rounded-2xl
                      border
                      border-amber-400/[0.10]
                      bg-amber-400/[0.025]
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

                      <UserRoundX
                        size={18}
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
                          Finder is currently unavailable
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-slate-500
                          "
                        >
                          The finder can update the
                          current handover location or
                          transfer the item to an
                          authorized Lost & Found desk.
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                {/* =================================
                    TRANSFERRED
                    ================================= */}

                {isTransferred && (
                  <div
                    className="
                      mt-6
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
                          Item transferred to Lost & Found
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-slate-500
                          "
                        >
                          The original finder no longer
                          needs to be present. The lost
                          person can use the authorized
                          pickup point shown in the
                          recovery flow.
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                {/* =================================
                    ACTIONS
                    ================================= */}

                {!isCompleted &&
                  recovery.status !==
                    "cancelled" && (
                    <div className="mt-6 space-y-3">

                      {!isTransferred && (
                        <button
                          type="button"
                          onClick={
                            markFinderUnavailable
                          }
                          disabled={
                            markingUnavailable
                          }
                          className="
                            flex
                            h-10
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-amber-400/10
                            bg-amber-400/[0.03]
                            text-xs
                            font-medium
                            text-amber-300
                            hover:bg-amber-400/[0.08]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >

                          {markingUnavailable ? (
                            <RefreshCw
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <UserRoundX
                              size={14}
                            />
                          )}

                          Finder is unavailable

                        </button>
                      )}

                      <button
                        type="button"
                        onClick={
                          transferToLostAndFound
                        }
                        disabled={
                          transferring ||
                          isTransferred
                        }
                        className="
                          flex
                          h-10
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-blue-400/10
                          bg-blue-400/[0.03]
                          text-xs
                          font-medium
                          text-blue-300
                          hover:bg-blue-400/[0.08]
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >

                        {transferring ? (
                          <RefreshCw
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <ShieldCheck
                            size={14}
                          />
                        )}

                        Transfer to Lost & Found

                      </button>

                    </div>
                  )}

                {/* =================================
                    COMPLETE HANDOVER
                    ================================= */}

                {!isCompleted &&
                  (
                    recovery.status ===
                      "handover_pending" ||
                    recovery.status ===
                      "transferred_to_security"
                  ) && (
                    <button
                      type="button"
                      onClick={
                        completeHandover
                      }
                      disabled={
                        completing
                      }
                      className="
                        mt-5
                        flex
                        h-11
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-emerald-500
                        text-sm
                        font-semibold
                        text-white
                        hover:bg-emerald-400
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >

                      {completing ? (
                        <>
                          <RefreshCw
                            size={15}
                            className="animate-spin"
                          />

                          Completing handover...
                        </>
                      ) : (
                        <>
                          <Check size={15} />

                          Confirm item handed over
                        </>
                      )}

                    </button>
                  )}

                {/* =================================
                    COMPLETED
                    ================================= */}

                {isCompleted && (
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
                          Handover completed
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-slate-500
                          "
                        >
                          The item has been marked as
                          successfully recovered.
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                {/* =================================
                    CANCELLED
                    ================================= */}

                {recovery.status ===
                  "cancelled" && (
                  <div
                    className="
                      mt-6
                      rounded-2xl
                      border
                      border-red-400/[0.10]
                      bg-red-400/[0.025]
                      p-4
                    "
                  >

                    <p
                      className="
                        text-sm
                        font-medium
                        text-red-200
                      "
                    >
                      Recovery cancelled
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-slate-500
                      "
                    >
                      This recovery is no longer active.
                    </p>

                  </div>
                )}

              </>
            )}

            {/* =====================================
                ERROR / STATUS MESSAGE
                ===================================== */}

            {error && (
              <div
                className={`
                  mt-5
                  rounded-2xl
                  border
                  px-4
                  py-3
                  text-sm
                  leading-6
                  ${
                    error.includes(
                      "copied"
                    )
                      ? "border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300"
                      : "border-red-400/15 bg-red-400/[0.05] text-red-300"
                  }
                `}
              >
                {error}
              </div>
            )}

            {/* =====================================
                RECOVERY ID
                ===================================== */}

            {recovery?.recoveryId && (
              <div
                className="
                  mt-5
                  flex
                  items-center
                  justify-between
                  gap-4
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-black/10
                  px-3
                  py-2.5
                "
              >

                <span
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    text-slate-600
                  "
                >
                  Recovery ID
                </span>

                <span
                  className="
                    break-all
                    text-right
                    text-[10px]
                    text-slate-400
                  "
                >
                  {recovery.recoveryId}
                </span>

              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// FEATURE
// ============================================

function RecoveryFeature({
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

      <div
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          bg-emerald-400/[0.07]
        "
      >

        <Icon
          size={16}
          className="text-emerald-300"
        />

      </div>

      <p
        className="
          mt-3
          text-sm
          font-medium
          text-white
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-xs
          leading-5
          text-slate-500
        "
      >
        {text}
      </p>

    </div>
  )
}

// ============================================
// INPUT
// ============================================

function RecoveryInput({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="mt-5">

      <label
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

      <input
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
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
          focus:border-blue-400/30
        "
      />

    </div>
  )
}

// ============================================
// INFO
// ============================================

function RecoveryInfo({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/[0.06]
        bg-black/10
        p-3
      "
    >

      <p
        className="
          text-[9px]
          uppercase
          tracking-[0.12em]
          text-slate-600
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          break-words
          text-sm
          text-slate-300
        "
      >
        {value ||
          "Not available"}
      </p>

    </div>
  )
}

export default RecoveryHandover