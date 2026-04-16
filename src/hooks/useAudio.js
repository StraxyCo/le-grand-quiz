import { useRef, useCallback } from 'react'

// Singleton audio instances reused across calls
const audioInstances = {}

function getAudio(src) {
  if (!audioInstances[src]) {
    audioInstances[src] = new Audio(src)
  }
  return audioInstances[src]
}

export function useAudio() {
  const countdownRef = useRef(null)

  const play = useCallback((src, { loop = false, volume = 1 } = {}) => {
    try {
      const audio = getAudio(src)
      audio.loop = loop
      audio.volume = volume
      audio.currentTime = 0
      audio.play().catch(() => {})
    } catch (e) {}
  }, [])

  const stop = useCallback((src) => {
    try {
      if (src) {
        const audio = getAudio(src)
        audio.pause()
        audio.currentTime = 0
      }
    } catch (e) {}
  }, [])

  const stopAll = useCallback(() => {
    Object.values(audioInstances).forEach(a => {
      a.pause()
      a.currentTime = 0
    })
  }, [])

  const playVictory = useCallback((playerName) => {
    stopAll()
    play(`/media/phase04/${playerName.toLowerCase()}.mp3`, { volume: 0.9 })
  }, [play, stopAll])

  const playTitleTheme = useCallback(() => {
    play('/media/structure/title-theme.mp3', { volume: 0.7 })
  }, [play])

  const playCountdown = useCallback(() => {
    play('/media/structure/countdown.mp3', { volume: 0.6 })
  }, [play])

  const stopCountdown = useCallback(() => {
    stop('/media/structure/countdown.mp3')
  }, [stop])

  const playGong = useCallback(() => {
    play('/media/structure/gong.mp3', { volume: 0.9 })
  }, [play])

  return {
    play,
    stop,
    stopAll,
    playCountdown,
    stopCountdown,
    playGong,
    playTitleTheme,
    playVictory,
  }
}
