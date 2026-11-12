import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Package,
  RefreshCw,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

const API_URL = `${window.location.protocol}//${window.location.hostname}:5000/api/verifications`;
const REPORT_API_URL = `${window.location.protocol}//${window.location.hostname}:5000/api/reports`;

function VerificationReview({
  verificationId,
  matchId,
  lostReportId,
  foundReportId,
  onStatusChange,
  role = "finder",
}) {
  /* ==========================================================
     NORMALIZE ROLE
     ========================================================== */

  const normalizedRole = String(role || "finder").toLowerCase();

  const isFinder =
    normalizedRole === "finder" ||
    normalizedRole === "found" ||
    normalizedRole === "founder";

  /* ==========================================================
     STATE
     ========================================================== */

  const [verification, setVerification] = useState(null);
  const [lostReport, setLostReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [reportError, setReportError] = useState("");

  const [reviewerNote, setReviewerNote] = useState("");

  /* ==========================================================
     HELPERS
     ========================================================== */

  const notifyStatusChange = useCallback(
    (updatedVerification) => {
      if (typeof onStatusChange === "function") {
        onStatusChange(updatedVerification);
      }
    },
    [onStatusChange]
  );

  /* ==========================================================
     LOAD LOST REPORT
     ========================================================== */

  const loadLostReport = useCallback(async (reportId) => {
    if (!reportId) {
      setLostReport(null);
      return;
    }

    try {
      setReportLoading(true);
      setReportError("");

      const response = await fetch(
        `${REPORT_API_URL}/${encodeURIComponent(reportId)}`
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            `Unable to load lost report (${response.status}).`
        );
      }

      const report =
        data.report ||
        data.data ||
        null;

      if (!report) {
        throw new Error(
          "Lost report details were not returned by the server."
        );
      }

      setLostReport(report);
    } catch (requestError) {
      console.error(
        "FINDX: Failed to load lost report.",
        requestError
      );

      setReportError(
        requestError?.message ||
          "Unable to load the lost-item details."
      );
    } finally {
      setReportLoading(false);
    }
  }, []);

  /* ==========================================================
     LOAD VERIFICATION
     ========================================================== */

  const loadVerification = useCallback(async () => {
    if (!verificationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(verificationId)}`
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            `Unable to load verification (${response.status}).`
        );
      }

      const loadedVerification =
        data.verification ||
        data.data ||
        null;

      if (!loadedVerification) {
        throw new Error(
          "Verification details were not returned by the server."
        );
      }

      const normalizedVerification = {
        ...loadedVerification,

        verificationId:
          loadedVerification.verificationId ||
          loadedVerification._id ||
          verificationId,

        matchId:
          loadedVerification.matchId ||
          matchId ||
          null,

        lostReportId:
          loadedVerification.lostReportId ||
          lostReportId ||
          null,

        foundReportId:
          loadedVerification.foundReportId ||
          foundReportId ||
          null,

        status:
          loadedVerification.status ||
          "pending",
      };

      setVerification(normalizedVerification);

      const resolvedLostReportId =
        normalizedVerification.lostReportId;

      if (resolvedLostReportId) {
        await loadLostReport(resolvedLostReportId);
      }
    } catch (requestError) {
      console.error(
        "FINDX: Failed to load verification.",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to load ownership verification."
      );
    } finally {
      setLoading(false);
    }
  }, [
    verificationId,
    matchId,
    lostReportId,
    foundReportId,
    loadLostReport,
  ]);

  /* ==========================================================
     INITIAL LOAD
     ========================================================== */

  useEffect(() => {
    loadVerification();
  }, [loadVerification]);

  /* ==========================================================
     APPROVE / REJECT
     ONLY FINDER CAN DO THIS
     ========================================================== */

  const reviewVerification = useCallback(
    async (action) => {
      if (!isFinder) {
        return;
      }

      if (!verificationId || actionLoading) {
        return;
      }

      const isApprove = action === "approve";

      const confirmationMessage = isApprove
        ? "Approve this ownership verification and allow the recovery workflow to continue?"
        : "Reject this ownership verification request?";

      const confirmed = window.confirm(
        confirmationMessage
      );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/${encodeURIComponent(
            verificationId
          )}/${isApprove ? "approve" : "reject"}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reviewerNote: reviewerNote.trim(),
            }),
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message ||
              `Failed to ${
                isApprove ? "approve" : "reject"
              } verification.`
          );
        }

        const serverVerification =
          data.verification ||
          data.data ||
          {};

        const updatedVerification = {
          ...verification,
          ...serverVerification,

          verificationId:
            serverVerification.verificationId ||
            serverVerification._id ||
            verification.verificationId,

          matchId:
            serverVerification.matchId ||
            verification.matchId ||
            matchId ||
            null,

          lostReportId:
            serverVerification.lostReportId ||
            verification.lostReportId ||
            lostReportId ||
            null,

          foundReportId:
            serverVerification.foundReportId ||
            verification.foundReportId ||
            foundReportId ||
            null,

          status:
            serverVerification.status ||
            (isApprove ? "approved" : "rejected"),
        };

        setVerification(updatedVerification);

        setReviewerNote("");

        notifyStatusChange(updatedVerification);
      } catch (requestError) {
        console.error(
          "FINDX: Verification action failed.",
          requestError
        );

        setError(
          requestError?.message ||
            "Unable to update verification."
        );
      } finally {
        setActionLoading(false);
      }
    },
    [
      isFinder,
      verificationId,
      actionLoading,
      reviewerNote,
      verification,
      matchId,
      lostReportId,
      foundReportId,
      notifyStatusChange,
    ]
  );

  /* ==========================================================
     NO VERIFICATION ID
     ========================================================== */

  if (!verificationId) {
    return null;
  }

  /* ==========================================================
     LOADING
     ========================================================== */

  if (loading) {
    return (
      <section
        id="verification-review"
        className="relative py-16 sm:py-20"
      >
        <div className="findx-container">
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/[0.08] bg-white/[0.025] px-6 py-14 text-center">
            <RefreshCw
              size={26}
              className="mx-auto animate-spin text-blue-300"
            />

            <p className="mt-4 text-sm font-medium text-white">
              Loading ownership verification...
            </p>

            <p className="mt-2 text-xs text-slate-300">
              Secure verification data is being retrieved.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ==========================================================
     ERROR
     ========================================================== */

  if (error && !verification) {
    return (
      <section
        id="verification-review"
        className="relative py-16 sm:py-20"
      >
        <div className="findx-container">
          <div className="mx-auto max-w-4xl rounded-3xl border border-red-400/20 bg-red-400/[0.04] p-6">
            <div className="flex items-start gap-3">
              <XCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-300"
              />

              <div>
                <p className="text-sm font-semibold text-red-200">
                  Verification review unavailable
                </p>

                <p className="mt-2 text-sm leading-6 text-red-100">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadVerification}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!verification) {
    return null;
  }

  /* ==========================================================
     RESOLVED DATA
     ========================================================== */

  const status = String(
    verification.status || "pending"
  ).toLowerCase();

  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isRejected = status === "rejected";

  const itemName =
    lostReport?.itemName ||
    lostReport?.title ||
    lostReport?.item?.name ||
    "Lost item";

  const specifications =
    lostReport?.description ||
    lostReport?.specifications ||
    lostReport?.details ||
    "No item-specific specifications were supplied.";

  const lastKnownArea =
    lostReport?.location ||
    lostReport?.generalLocation ||
    lostReport?.area ||
    "Location information is not available.";

  /* ==========================================================
     IMPORTANT ROLE BEHAVIOUR
     ========================================================== */

  /*
     LOST USER:
     They MUST NOT see approve/reject controls.

     They only wait for the finder review.
  */

  if (!isFinder) {
    return (
      <section
        id="verification-review"
        className="relative py-16 sm:py-20"
      >
        <div className="findx-container">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl border border-blue-400/15 bg-blue-400/[0.035] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-400/[0.1]">
                  <ShieldCheck
                    size={22}
                    className="text-blue-300"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">
                    OWNERSHIP VERIFICATION
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    Waiting for the finder
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                    Your ownership information has been submitted.
                    The finder must review it before the recovery
                    workflow can continue.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <StatusMiniCard
                  label="Match"
                  value="Confirmed"
                  tone="blue"
                />

                <StatusMiniCard
                  label="Verification"
                  value={
                    isApproved
                      ? "Approved"
                      : isRejected
                        ? "Rejected"
                        : "Under review"
                  }
                  tone={
                    isApproved
                      ? "green"
                      : isRejected
                        ? "red"
                        : "amber"
                  }
                />

                <StatusMiniCard
                  label="Recovery"
                  value={
                    isApproved
                      ? "Ready"
                      : "Locked"
                  }
                  tone={
                    isApproved
                      ? "green"
                      : "slate"
                  }
                />
              </div>

              {isApproved && (
                <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0 text-emerald-300"
                    />

                    <div>
                      <p className="text-sm font-semibold text-emerald-200">
                        Verification approved
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        Ownership has been verified. The recovery
                        workflow can now continue.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isRejected && (
                <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-4">
                  <div className="flex items-start gap-3">
                    <XCircle
                      size={19}
                      className="mt-0.5 shrink-0 text-red-300"
                    />

                    <div>
                      <p className="text-sm font-semibold text-red-200">
                        Verification rejected
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        The finder did not approve the submitted
                        ownership verification.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ==========================================================
     FINDER REVIEW UI
     ========================================================== */

  return (
    <section
      id="verification-review"
      className="relative py-16 sm:py-20"
    >
      <div className="findx-container">
        <div className="mx-auto max-w-4xl">
          {/* HEADER */}

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-200">
              <ShieldCheck size={14} />
              FINDER VERIFICATION REVIEW
            </div>

            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Review ownership
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              A potential owner has submitted private
              item-specific information. Review it before
              approving the recovery.
            </p>
          </div>

          {/* MAIN CARD */}

          <div className="mt-8 rounded-3xl border border-white/[0.09] bg-white/[0.025] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.22)] sm:p-8">
            {/* STATUS BAR */}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={[
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    isApproved
                      ? "bg-emerald-400/[0.1]"
                      : isRejected
                        ? "bg-red-400/[0.1]"
                        : "bg-amber-400/[0.1]",
                  ].join(" ")}
                >
                  {isApproved ? (
                    <CheckCircle2
                      size={21}
                      className="text-emerald-300"
                    />
                  ) : isRejected ? (
                    <XCircle
                      size={21}
                      className="text-red-300"
                    />
                  ) : (
                    <ShieldCheck
                      size={21}
                      className="text-amber-300"
                    />
                  )}
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white">
                    VERIFICATION STATUS
                  </p>

                  <p
                    className={[
                      "mt-1 text-sm font-semibold capitalize",
                      isApproved
                        ? "text-emerald-300"
                        : isRejected
                          ? "text-red-300"
                          : "text-amber-300",
                    ].join(" ")}
                  >
                    {status}
                  </p>
                </div>
              </div>

              <span className="max-w-full break-all text-right text-[10px] text-slate-400">
                ID:{" "}
                {verification.verificationId}
              </span>
            </div>

            {/* ITEM UNDER REVIEW */}

            <div className="mt-8 overflow-hidden rounded-3xl border border-blue-400/15 bg-blue-400/[0.03]">
              <div className="border-b border-blue-400/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/[0.1]">
                    <Package
                      size={18}
                      className="text-blue-300"
                    />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-200">
                      CLAIMANT INFORMATION
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-white">
                      Item ownership details
                    </h3>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {reportLoading ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-5">
                    <RefreshCw
                      size={16}
                      className="animate-spin text-blue-300"
                    />

                    <span className="text-sm text-white">
                      Loading claimant information...
                    </span>
                  </div>
                ) : (
                  <>
                    {/* ITEM NAME */}

                    <ReviewField
                      label="ITEM"
                      value={itemName}
                      large
                    />

                    {/* SPECIFICATIONS */}

                    <ReviewField
                      label="ITEM-SPECIFIC DETAILS"
                      value={specifications}
                      multiline
                    />

                    {/* AREA */}

                    <ReviewField
                      label="LAST KNOWN AREA"
                      value={lastKnownArea}
                    />
                  </>
                )}

                {reportError && (
                  <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-4">
                    <p className="text-sm font-semibold text-red-200">
                      Unable to load report details
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-100">
                      {reportError}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* PRIVACY NOTE */}

            <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-300"
                />

                <div>
                  <p className="text-sm font-semibold text-emerald-200">
                    Privacy-preserving verification
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Review item-specific information only.
                    FINDX does not expose the claimant's private
                    phone number or private address through this
                    review.
                  </p>
                </div>
              </div>
            </div>

            {/* REVIEW NOTE */}

            {isPending && (
              <div className="mt-6">
                <label
                  htmlFor="reviewerNote"
                  className="text-xs font-bold uppercase tracking-[0.14em] text-white"
                >
                  REVIEW NOTE
                </label>

                <textarea
                  id="reviewerNote"
                  value={reviewerNote}
                  onChange={(event) =>
                    setReviewerNote(
                      event.target.value
                    )
                  }
                  disabled={actionLoading}
                  rows={4}
                  maxLength={1000}
                  placeholder="Optional note for the claimant..."
                  className="mt-3 w-full resize-none rounded-2xl border border-white/[0.12] bg-[#07101c] p-4 text-sm leading-6 text-white outline-none placeholder:text-slate-400 focus:border-blue-400/50 focus:ring-4 focus:ring-blue-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <div className="mt-2 flex justify-between text-[10px]">
                  <span className="text-slate-400">
                    Optional
                  </span>

                  <span className="text-slate-400">
                    {reviewerNote.length}/1000
                  </span>
                </div>
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-4">
                <p className="text-sm font-semibold text-red-200">
                  Verification action failed
                </p>

                <p className="mt-1 text-sm leading-6 text-red-100">
                  {error}
                </p>
              </div>
            )}

            {/* ACTIONS */}

            {isPending && (
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    reviewVerification("approve")
                  }
                  disabled={actionLoading}
                  className="findx-button flex h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.09] text-sm font-bold text-emerald-200 transition hover:border-emerald-300/40 hover:bg-emerald-400/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading ? (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Check size={16} />
                  )}

                  APPROVE VERIFICATION
                </button>

                <button
                  type="button"
                  onClick={() =>
                    reviewVerification("reject")
                  }
                  disabled={actionLoading}
                  className="findx-button flex h-12 items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/[0.05] text-sm font-bold text-red-200 transition hover:border-red-300/35 hover:bg-red-400/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading ? (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <X size={16} />
                  )}

                  REJECT VERIFICATION
                </button>
              </div>
            )}

            {/* APPROVED STATE */}

            {isApproved && (
              <div className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-300"
                  />

                  <div>
                    <p className="text-base font-bold text-emerald-200">
                      Ownership verified
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      Verification has been approved. The match
                      can now move to the protected recovery
                      workflow.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* REJECTED STATE */}

            {isRejected && (
              <div className="mt-7 rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5">
                <div className="flex items-start gap-3">
                  <XCircle
                    size={20}
                    className="mt-0.5 shrink-0 text-red-300"
                  />

                  <div>
                    <p className="text-base font-bold text-red-200">
                      Verification rejected
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      The ownership evidence was not approved.
                      The recovery workflow remains locked.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   REVIEW FIELD
   ============================================================ */

function ReviewField({
  label,
  value,
  large = false,
  multiline = false,
}) {
  return (
    <div className="mt-3 rounded-2xl border border-white/[0.08] bg-[#07101c] p-5 first:mt-0">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white">
        {label}
      </p>

      <p
        className={[
          "mt-3 text-white",
          large
            ? "text-2xl font-bold"
            : "text-sm font-medium leading-7",
          multiline
            ? "whitespace-pre-wrap break-words"
            : "",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   MINI STATUS CARD
   ============================================================ */

function StatusMiniCard({
  label,
  value,
  tone = "slate",
}) {
  const toneClasses = {
    blue: {
      box: "border-blue-400/15 bg-blue-400/[0.04]",
      label: "text-blue-200",
      value: "text-blue-100",
    },

    green: {
      box: "border-emerald-400/15 bg-emerald-400/[0.04]",
      label: "text-emerald-200",
      value: "text-emerald-100",
    },

    amber: {
      box: "border-amber-400/15 bg-amber-400/[0.04]",
      label: "text-amber-200",
      value: "text-amber-100",
    },

    red: {
      box: "border-red-400/15 bg-red-400/[0.04]",
      label: "text-red-200",
      value: "text-red-100",
    },

    slate: {
      box: "border-white/[0.08] bg-white/[0.025]",
      label: "text-slate-200",
      value: "text-white",
    },
  };

  const theme =
    toneClasses[tone] ||
    toneClasses.slate;

  return (
    <div
      className={[
        "rounded-2xl border p-4",
        theme.box,
      ].join(" ")}
    >
      <p
        className={[
          "text-[9px] font-bold uppercase tracking-[0.14em]",
          theme.label,
        ].join(" ")}
      >
        {label}
      </p>

      <p
        className={[
          "mt-2 text-sm font-bold",
          theme.value,
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

export default VerificationReview;