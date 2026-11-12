// ============================================
// FINDX MATCHING ENGINE
// ============================================

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "with",
  "for",
  "of",
  "to",
  "in",
  "on",
  "at",
  "is",
  "was",
  "my",
  "this",
  "that",
  "item",
  "lost",
  "found",
])


// ============================================
// TEXT NORMALIZATION
// ============================================

function normalizeText(value = "") {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}


// ============================================
// TOKENIZE
// ============================================

function tokenize(value = "") {
  return normalizeText(value)
    .split(" ")
    .filter(
      (word) =>
        word.length > 1 &&
        !STOP_WORDS.has(word)
    )
}


// ============================================
// JACCARD SIMILARITY
// ============================================

function calculateTextSimilarity(first = "", second = "") {
  const firstWords = new Set(tokenize(first))
  const secondWords = new Set(tokenize(second))

  if (
    firstWords.size === 0 ||
    secondWords.size === 0
  ) {
    return 0
  }

  let intersection = 0

  firstWords.forEach((word) => {
    if (secondWords.has(word)) {
      intersection += 1
    }
  })

  const union =
    firstWords.size +
    secondWords.size -
    intersection

  if (union === 0) {
    return 0
  }

  return intersection / union
}


// ============================================
// ITEM NAME SIMILARITY
// ============================================

function calculateItemSimilarity(lostReport, foundReport) {
  const lostName = normalizeText(
    lostReport.itemName
  )

  const foundName = normalizeText(
    foundReport.itemName
  )

  if (!lostName || !foundName) {
    return 0
  }

  if (lostName === foundName) {
    return 1
  }

  const similarity =
    calculateTextSimilarity(
      lostName,
      foundName
    )

  return similarity
}


// ============================================
// DESCRIPTION SIMILARITY
// ============================================

function calculateDescriptionSimilarity(
  lostReport,
  foundReport
) {
  return calculateTextSimilarity(
    lostReport.description,
    foundReport.description
  )
}


// ============================================
// LOCATION SIMILARITY
// ============================================

function calculateLocationSimilarity(
  lostReport,
  foundReport
) {
  const lostLocation = normalizeText(
    lostReport.location
  )

  const foundLocation = normalizeText(
    foundReport.location
  )

  if (!lostLocation || !foundLocation) {
    return 0
  }

  if (lostLocation === foundLocation) {
    return 1
  }

  return calculateTextSimilarity(
    lostLocation,
    foundLocation
  )
}


// ============================================
// TIME SIMILARITY
// ============================================

function calculateTimeSimilarity(
  lostReport,
  foundReport
) {
  if (
    !lostReport.createdAt ||
    !foundReport.createdAt
  ) {
    return 0
  }

  const lostTime = new Date(
    lostReport.createdAt
  ).getTime()

  const foundTime = new Date(
    foundReport.createdAt
  ).getTime()

  if (
    Number.isNaN(lostTime) ||
    Number.isNaN(foundTime)
  ) {
    return 0
  }

  const difference =
    Math.abs(lostTime - foundTime)

  const hours =
    difference / (1000 * 60 * 60)

  // Same day = strongest temporal relationship
  if (hours <= 6) {
    return 1
  }

  if (hours <= 24) {
    return 0.85
  }

  if (hours <= 72) {
    return 0.65
  }

  if (hours <= 168) {
    return 0.4
  }

  return 0.15
}


// ============================================
// IMAGE SIGNAL
// ============================================

function calculateVisualSimilarity(
  lostReport,
  foundReport
) {
  const lostImage =
    Boolean(lostReport.image)

  const foundImage =
    Boolean(foundReport.image)

  if (!lostImage || !foundImage) {
    return 0
  }

  /*
    This is intentionally NOT pretending to perform
    computer vision.

    Real image embedding / vision matching will be
    connected later.
  */

  return 0.5
}


// ============================================
// MATCH SCORE
// ============================================

export function calculateMatchScore(
  lostReport,
  foundReport
) {
  if (!lostReport || !foundReport) {
    return null
  }

  if (
    lostReport.type !== "lost" ||
    foundReport.type !== "found"
  ) {
    return null
  }

  const itemScore =
    calculateItemSimilarity(
      lostReport,
      foundReport
    )

  const descriptionScore =
    calculateDescriptionSimilarity(
      lostReport,
      foundReport
    )

  const locationScore =
    calculateLocationSimilarity(
      lostReport,
      foundReport
    )

  const timeScore =
    calculateTimeSimilarity(
      lostReport,
      foundReport
    )

  const visualScore =
    calculateVisualSimilarity(
      lostReport,
      foundReport
    )


  // ============================================
  // WEIGHTED MATCHING
  // ============================================

  const weightedScore =
    itemScore * 0.35 +
    descriptionScore * 0.25 +
    locationScore * 0.15 +
    timeScore * 0.15 +
    visualScore * 0.10


  const confidence = Math.round(
    weightedScore * 100
  )


  return {
    confidence,

    signals: {
      item: Math.round(
        itemScore * 100
      ),

      description: Math.round(
        descriptionScore * 100
      ),

      location: Math.round(
        locationScore * 100
      ),

      time: Math.round(
        timeScore * 100
      ),

      visual: Math.round(
        visualScore * 100
      ),
    },

    strength:
      confidence >= 85
        ? "strong"
        : confidence >= 65
          ? "possible"
          : "weak",
  }
}


// ============================================
// FIND MATCHES
// ============================================

export function findMatches(
  lostReport,
  reports = []
) {
  if (
    !lostReport ||
    lostReport.type !== "lost"
  ) {
    return []
  }

  return reports
    .filter(
      (report) =>
        report &&
        report.type === "found" &&
        report.id !== lostReport.id
    )
    .map((foundReport) => {
      const match =
        calculateMatchScore(
          lostReport,
          foundReport
        )

      return {
        report: foundReport,
        ...match,
      }
    })
    .filter(
      (match) =>
        match.confidence >= 40
    )
    .sort(
      (a, b) =>
        b.confidence -
        a.confidence
    )
}


// ============================================
// FIND BEST MATCH
// ============================================

export function findBestMatch(
  lostReport,
  reports = []
) {
  const matches =
    findMatches(
      lostReport,
      reports
    )

  return matches[0] || null
}