import { useState, useEffect, useRef, useCallback } from 'react'
import { useAudio } from './useAudio'

export function useTimer(duration = 30) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef(null)
  const { playCountdown, stopCountdown, playGong } = useAudio()

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
    playCountdown()

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setRunning(false)
          setFinished(true)
          stopCountdown()
          playGong()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [duration, playCountdown, stopCountdown, playGong])

  const skip = useCallback(() => {
    clear()
    stopCountdown()
    setRunning(false)
    // Do NOT play gong on skip
  }, [stopCountdown])

  const reset = useCallback(() => {
    clear()
    stopCountdown()
    setTimeLeft(duration)
    setRunning(false)
    setFinished(false)
  }, [duration, stopCountdown])

  useEffect(() => {
    return () => {
      clear()
      stopCountdown()
    }
  }, [stopCountdown])

  const progress = timeLeft / duration // 1.0 → 0.0
  const urgent = timeLeft <= 10

  return { timeLeft, running, finished, progress, urgent, start, skip, reset }
}
