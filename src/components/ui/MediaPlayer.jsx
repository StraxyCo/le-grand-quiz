import React, { useState, useRef, useEffect } from 'react'

// Global flag: is a media audio currently playing?
// Used by useTimer to duck countdown volume
let mediaAudioPlaying = false
export function isMediaAudioPlaying() { return mediaAudioPlaying }

// Notify countdown to duck/restore
const mediaAudioListeners = new Set()
export function onMediaAudioChange(fn) {
  mediaAudioListeners.add(fn)
  return () => mediaAudioListeners.delete(fn)
}
function notifyMediaAudio(playing) {
  mediaAudioPlaying = playing
  mediaAudioListeners.forEach(fn => fn(playing))
}

function resolvePath(mediaPath) {
  if (!mediaPath) return null
  return '/' + mediaPath.replace(/^public\//, '')
}

export function MediaPlayer({ mediaPath }) {
  if (!mediaPath) return null
  const src = resolvePath(mediaPath)
  const ext = mediaPath.split('.').pop().toLowerCase()
  const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)

  if (isImage) {
    return (
      <div style={{
        width: '100%', maxWidth: 420, aspectRatio: '1 / 1',
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
        border: '1px solid rgba(212,175,55,0.25)', flexShrink: 0,
        background: 'rgba(10,37,68,0.6)',
      }}>
        <img src={src} alt="Illustration de la question"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )
  }
  if (isAudio) return <AudioPlayer src={src} />
  return null
}

function AudioPlayer({ src }) {
  const [state, setState] = useState('idle')
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = document.createElement('audio')
    audio.preload = 'auto'
    audio.src = src
    audio.addEventListener('ended', () => {
      setState('idle')
      notifyMediaAudio(false)
    })
    audioRef.current = audio
    return () => {
      audio.pause()
      audio.src = ''
      notifyMediaAudio(false)
    }
  }, [src])

  const handlePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.play().then(() => {
      setState('playing')
      notifyMediaAudio(true)
    }).catch(console.warn)
  }

  const handlePause = () => {
    audioRef.current?.pause()
    setState('paused')
    notifyMediaAudio(false)
  }

  const handleRestart = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.play().then(() => {
      setState('playing')
      notifyMediaAudio(true)
    }).catch(console.warn)
  }

  const isPlaying = state === 'playing'

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 12,
      padding: '14px 20px', borderRadius: 'var(--radius-md)',
      background: 'rgba(10,37,68,0.8)', border: '1.5px solid rgba(212,175,55,0.25)',
    }}>
      <button onClick={isPlaying ? handlePause : handlePlay} style={{
        width: 48, height: 48, borderRadius: '50%',
        background: isPlaying ? 'var(--yellow-dark)' : 'var(--yellow)',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: '1.1rem', color: 'var(--bg-dark)',
      }}>
        {isPlaying ? '⏸' : '▶'}
      </button>
      <button onClick={handleRestart} title="Recommencer" style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: '0.9rem', color: 'var(--white-secondary)',
      }}>↺</button>
      <div>
        <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.7rem', color: 'var(--yellow)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
          Extrait audio
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--white-secondary)' }}>
          {isPlaying ? 'Lecture en cours…' : 'Appuyer pour écouter'}
        </div>
      </div>
    </div>
  )
}
