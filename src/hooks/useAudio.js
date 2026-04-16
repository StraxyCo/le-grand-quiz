import { useRef, useCallback } from 'react'

const audioInstances = {}

// Normalize name: remove accents, lowercase
function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritics
    .replace(/\s+/g, '-')
}

function getAudio(src) {
  if (!audioInstances[src]) {
    audioInstances[src] = new Audio(src)
  }
  return audioInstances[src]
}

export function useAudio() {
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
      const audio = getAudio(src)
      audio.pause()
      audio.currentTime = 0
    } catch (e) {}
  }, [])

  const stopAll = useCallback(() => {
    Object.values(audioInstances).forEach(a => {
      try { a.pause(); a.currentTime = 0 } catch (e) {}
    })
  }, [])

  // Pause all without resetting position (for a "pause" button)
  const pauseAll = useCallback(() => {
    Object.values(audioInstances).forEach(a => {
      try { a.pause() } catch (e) {}
    })
  }, [])

  const playCountdown = useCallback(() => {
    play('/media/structure/countdown.mp3', { volume: 0.6 })
  }, [play])

  const stopCountdown = useCallback(() => {
    stop('/media/structure/countdown.mp3')
  }, [stop])

  const playGong = useCallback(() => {
    play('/media/structure/gong.mp3', { volume: 0.9 })
  }, [play])

  const playTitleTheme = useCallback(() => {
    play('/media/structure/title-theme.mp3', { volume: 0.7 })
  }, [play])

  const playVictory = useCallback((playerName) => {
    stopAll()
    const normalized = normalizeName(playerName)
    play(`/media/phase04/${normalized}.mp3`, { volume: 0.9 })
  }, [play, stopAll])

  return {
    play,
    stop,
    stopAll,
    pauseAll,
    playCountdown,
    stopCountdown,
    playGong,
    playTitleTheme,
    playVictory,
  }
}
