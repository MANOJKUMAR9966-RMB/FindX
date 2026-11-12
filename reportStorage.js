const REPORTS_KEY = "findx_reports"

/* ============================================
   GET ALL REPORTS
   ============================================ */

export function getReports() {
  try {
    const storedReports =
      localStorage.getItem(REPORTS_KEY)

    if (!storedReports) {
      return []
    }

    const reports = JSON.parse(storedReports)

    return Array.isArray(reports)
      ? reports
      : []
  } catch (error) {
    console.error(
      "FINDX: Failed to read reports.",
      error
    )

    return []
  }
}


/* ============================================
   SAVE REPORT
   ============================================ */

export function saveReport(report) {
  try {
    const reports = getReports()

    const updatedReports = [
      ...reports,
      report,
    ]

    localStorage.setItem(
      REPORTS_KEY,
      JSON.stringify(updatedReports)
    )

    return report
  } catch (error) {
    console.error(
      "FINDX: Failed to save report.",
      error
    )

    return null
  }
}


/* ============================================
   GET REPORT BY ID
   ============================================ */

export function getReportById(reportId) {
  const reports = getReports()

  return (
    reports.find(
      (report) =>
        report.id === reportId
    ) || null
  )
}


/* ============================================
   DELETE REPORT
   ============================================ */

export function deleteReport(reportId) {
  try {
    const reports = getReports()

    const updatedReports =
      reports.filter(
        (report) =>
          report.id !== reportId
      )

    localStorage.setItem(
      REPORTS_KEY,
      JSON.stringify(
        updatedReports
      )
    )

    return updatedReports
  } catch (error) {
    console.error(
      "FINDX: Failed to delete report.",
      error
    )

    return getReports()
  }
}


/* ============================================
   CLEAR ALL REPORTS
   ============================================ */

export function clearReports() {
  try {
    localStorage.removeItem(
      REPORTS_KEY
    )
  } catch (error) {
    console.error(
      "FINDX: Failed to clear reports.",
      error
    )
  }
}


/* ============================================
   IMAGE → DATA URL
   ============================================ */

export function fileToDataUrl(file) {
  return new Promise(
    (resolve, reject) => {
      if (!file) {
        resolve(null)
        return
      }

      const reader =
        new FileReader()

      reader.onload = () => {
        resolve(
          reader.result
        )
      }

      reader.onerror = () => {
        reject(
          new Error(
            "FINDX: Failed to read image file."
          )
        )
      }

      reader.readAsDataURL(file)
    }
  )
}