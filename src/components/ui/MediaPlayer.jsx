import React, { useState, useRef, useEffect } from 'react'

export function MediaPlayer({ mediaPath }) {
  if (!mediaPath) return null
  const ext = mediaPath.split('.').pop().toLowerCase()
  const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)

  if (isImage) {
    return (
      <div style={{
        width: '100%',
        maxWidth: 420,
        aspectRatio: '1 / 1',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid rgba(212,175,55,0.25)',
        flexShrink: 0,
        background: 'rgba(10,37,68,0.8)',
      }}>
        <img
          src={`/${mediaPath}`}
          alt="Illustration de la question"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => { e.target.style.display = 'none' }}
        />
      </div>
    )
  }
  if (isAudio) return <AudioPlayer src={`/${mediaPath}`} />
  return null
}

function AudioPlayer({ src }) {
  const [playing, setPlaying] = useState(false)
  const [canPlay, setCanPlay] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = new Audio(src)
    audioRef.current = audio
    audio.addEventListener('canplaythrough', () => setCanPlay(true))
    audio.addEventListener('ended', () => setPlaying(false))
    audio.load()
    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [src])

  const handlePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.play().then(() => setPlaying(true)).catch(console.error)
  }

  const handlePause = () => {
    audioRef.current?.pause()
    setPlaying(false)
  }

  const handleRestart = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.play().then(() => setPlaying(true)).catch(console.error)
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 20px',
      borderRadius: 'var(--radius-md)',
      background: 'rgba(10,37,68,0.8)',
      border: '1.5px solid rgba(212,175,55,0.25)',
      maxWidth: 360,
    }}>
      {/* Play/Pause */}
      <button
        onClick={playing ? handlePause : handlePlay}
        style={{
          width: 48, height: 48, borderRadius: '50%',
          background: playing ? 'var(--yellow-dark)' : 'var(--yellow)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: '1.1rem', color: 'var(--bg-dark)',
          transition: 'transform 0.15s ease',
          opacity: canPlay ? 1 : 0.5,
        }}
        disabled={!canPlay}
      >
        {playing ? '⏸' : '▶'}
      </button>
      {/* Restart */}
      <button
        onClick={handleRestart}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: '0.85rem', color: 'var(--white-secondary)',
          transition: 'all 0.15s ease',
          opacity: canPlay ? 1 : 0.5,
        }}
        disabled={!canPlay}
        title="Recommencer"
      >
        ↺
      </button>
      <div>
        <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.7rem', color: 'var(--yellow)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
          Extrait audio
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--white-secondary)' }}>
          {!canPlay ? 'Chargement…' : playing ? 'Lecture en cours…' : 'Appuyer pour écouter'}
        </div>
      </div>
    </div>
  )
}
