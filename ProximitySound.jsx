import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  Volume2,
  VolumeX,
} from "lucide-react"

const DEFAULT_THRESHOLD = 8

function ProximitySound({
  distance = null,
  sharing = false,
  threshold = DEFAULT_THRESHOLD,
}) {
  const audioContextRef =
    useRef(null)

  const oscillatorTimerRef =
    useRef(null)

  const enabledRef =
    useRef(true)

  const [enabled, setEnabled] =
    useState(true)

  const [supported, setSupported] =
    useState(true)

  // ============================================
  // AUDIO INITIALIZATION
  // ============================================

  function prepareAudio() {
    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext

      if (!AudioContext) {
        setSupported(false)
        return false
      }

      if (
        !audioContextRef.current
      ) {
        audioContextRef.current =
          new AudioContext()
      }

      if (
        audioContextRef.current
          .state === "suspended"
      ) {
        audioContextRef.current.resume()
      }

      return true
    } catch (error) {
      console.error(
        "FINDX SOUND: Audio initialization failed:",
        error
      )

      return false
    }
  }

  // ============================================
  // DISTANCE → SOUND CONFIG
  // ============================================

  function getSoundConfig(
    currentDistance
  ) {
    if (
      typeof currentDistance !==
      "number"
    ) {
      return null
    }

    // Too far away.
    if (
      currentDistance >
      30
    ) {
      return null
    }

    // 30m → 20m
    if (
      currentDistance >
      20
    ) {
      return {
        interval: 1400,
        volume: 0.10,
        frequency: 620,
        duration: 0.18,
      }
    }

    // 20m → 12m
    if (
      currentDistance >
      12
    ) {
      return {
        interval: 950,
        volume: 0.15,
        frequency: 680,
        duration: 0.22,
      }
    }

    // 12m → 8m
    if (
      currentDistance >
      threshold
    ) {
      return {
        interval: 550,
        volume: 0.20,
        frequency: 740,
        duration: 0.24,
      }
    }

    // ≤ 8m
    return {
      interval: 300,
      volume: 0.28,
      frequency: 820,
      duration: 0.26,
    }
  }

  // ============================================
  // ONE BEEP
  // ============================================

  function playBeep(
    config
  ) {
    if (
      !enabledRef.current ||
      !audioContextRef.current
    ) {
      return
    }

    try {
      const context =
        audioContextRef.current

      if (
        context.state ===
        "suspended"
      ) {
        context.resume()
      }

      const now =
        context.currentTime

      const oscillator =
        context.createOscillator()

      const gain =
        context.createGain()

      oscillator.type =
        "sine"

      oscillator.frequency.setValueAtTime(
        config.frequency,
        now
      )

      oscillator.frequency.exponentialRampToValueAtTime(
        config.frequency + 220,
        now +
          config.duration *
            0.55
      )

      oscillator.frequency.exponentialRampToValueAtTime(
        config.frequency,
        now +
          config.duration
      )

      gain.gain.setValueAtTime(
        0.0001,
        now
      )

      gain.gain.exponentialRampToValueAtTime(
        config.volume,
        now + 0.025
      )

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now +
          config.duration
      )

      oscillator.connect(gain)

      gain.connect(
        context.destination
      )

      oscillator.start(now)

      oscillator.stop(
        now +
          config.duration +
          0.03
      )
    } catch (error) {
      console.error(
        "FINDX SOUND: Beep failed:",
        error
      )
    }
  }

  // ============================================
  // STOP SOUND
  // ============================================

  function stopSound() {
    if (
      oscillatorTimerRef.current
    ) {
      window.clearInterval(
        oscillatorTimerRef.current
      )

      oscillatorTimerRef.current =
        null
    }
  }

  // ============================================
  // START / UPDATE SOUND
  // ============================================

  function startSound(config) {
    if (
      !enabledRef.current ||
      !sharing ||
      !config
    ) {
      stopSound()
      return
    }

    const ready =
      prepareAudio()

    if (!ready) {
      return
    }

    stopSound()

    // Immediate beep.
    playBeep(config)

    // Keep repeating.
    oscillatorTimerRef.current =
      window.setInterval(() => {
        if (
          enabledRef.current &&
          sharing
        ) {
          playBeep(config)
        }
      }, config.interval)
  }

  // ============================================
  // WATCH DISTANCE
  // ============================================

  useEffect(() => {
    const config =
      getSoundConfig(
        distance
      )

    if (
      !enabled ||
      !sharing ||
      !config
    ) {
      stopSound()
      return
    }

    startSound(config)

    return () => {
      stopSound()
    }
  }, [
    distance,
    sharing,
    enabled,
    threshold,
  ])

  // ============================================
  // ENABLE / DISABLE
  // ============================================

  function toggleSound() {
    if (enabled) {
      stopSound()

      enabledRef.current =
        false

      setEnabled(false)

      return
    }

    enabledRef.current =
      true

    prepareAudio()

    setEnabled(true)
  }

  // ============================================
  // CLEANUP
  // ============================================

  useEffect(() => {
    return () => {
      stopSound()

      if (
        audioContextRef.current
      ) {
        try {
          audioContextRef.current.close()
        } catch {
          // Ignore close errors.
        }
      }
    }
  }, [])

  // ============================================
  // RENDER
  // ============================================

  return (
    <div
      className="
        flex
        items-center
        gap-2
        rounded-2xl
        border
        border-white/[0.07]
        bg-white/[0.025]
        px-3
        py-2
      "
    >

      <button
        type="button"
        onClick={
          toggleSound
        }
        disabled={!supported}
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          border
          border-white/[0.07]
          bg-white/[0.03]
          text-slate-400
          transition-colors
          hover:text-white
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
        aria-label={
          enabled
            ? "Turn proximity sound off"
            : "Turn proximity sound on"
        }
      >
        {enabled ? (
          <Volume2 size={15} />
        ) : (
          <VolumeX size={15} />
        )}
      </button>

      <div>
        <p
          className="
            text-[10px]
            font-medium
            text-slate-300
          "
        >
          Proximity sound
        </p>

        <p
          className="
            mt-0.5
            text-[9px]
            text-slate-600
          "
        >
          {supported
            ? enabled
              ? sharing
                ? "Active on this device"
                : "Ready"
              : "Off on this device"
            : "Audio unavailable"}
        </p>
      </div>

    </div>
  )
}

export default ProximitySound