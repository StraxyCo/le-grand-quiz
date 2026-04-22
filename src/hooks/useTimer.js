import { useState, useEffect, useRef, useCallback } from 'react'
import { useAudio } from './useAudio'
import { onMediaAudioChange, isMediaAudioPlaying } from '../components/ui/MediaPlayer'

const COUNTDOWN_SRC = '/media/structure/countdown.mp3'

export function useTimer(duration = 30) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef(null)
  const countdownAudioRef = useRef(null)
  const { playGong } = useAudio()

  // Duck countdown reactively when media audio starts/stops
  useEffect(() => {
    const unsub = onMediaAudioChange((playing) => {
      if (!countdownAudioRef.current) return
      countdownAudioRef.current.volume = playing ? 0 : 0.6
    })
    return unsub
  }, [])

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const start = useCallback(() => {
    setTimeLeft(duration)
    setFinished(false)
    setRunning(true)

    const audio = new Audio(COUNTDOWN_SRC)
    // If media audio is already playing at the moment countdown starts, duck immediately
    audio.volume = isMediaAudioPlaying() ? 0 : 0.6
    audio.play().catch(() => {})
    countdownAudioRef.current = audio

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setRunning(false)
          setFinished(true)
          audio.pause()
          countdownAudioRef.current = null
          playGong()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [duration, playGong])

  const skip = useCallback(() => {
    clear()
    if (countdownAudioRef.current) {
      countdownAudioRef.current.pause()
      countdownAudioRef.current = null
    }
    setRunning(false)
    // Do NOT play gong on skip
  }, [])

  const reset = useCallback(() => {
    clear()
    if (countdownAudioRef.current) {
      countdownAudioRef.current.pause()
      countdownAudioRef.current = null
    }
    setTimeLeft(duration)
    setRunning(false)
    setFinished(false)
  }, [duration])

  useEffect(() => {
    return () => {
      clear()
      if (countdownAudioRef.current) {
        countdownAudioRef.current.pause()
        countdownAudioRef.current = null
      }
    }
  }, [])

  const progress = timeLeft / duration
  const urgent = timeLeft <= 10

  return { timeLeft, running, finished, progress, urgent, start, skip, reset }
}
