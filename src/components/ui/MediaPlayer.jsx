import React, { useState, useRef } from 'react'

/**
 * Renders the media associated with a question.
 * - Images: displayed automatically (square 1200×1200 → shown as square block)
 * - Audio:  manual play button
 */
export function MediaPlayer({ mediaPath }) {
  if (!mediaPath) return null

  const ext = mediaPath.split('.').pop().toLowerCase()
  const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)

  if (isImage) {
    return (
      <div style={{
        width: '100%',
        maxWidth: 360,
        aspectRatio: '1 / 1',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid rgba(212,175,55,0.2)',
        flexShrink: 0,
      }}>
        <img
          src={`/${mediaPath}`}
          alt="Illustration de la question"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    )
  }

  if (isAudio) {
    return <AudioPlayer src={`/${mediaPath}`} />
  }

  return null
}

function AudioPlayer({ src }) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.currentTime = 0
      audioRef.current.play()
      setPlaying(true)
    }
  }

  const handleEnded = () => setPlaying(false)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 22px',
      borderRadius: 'var(--radius-md)',
      background: 'rgba(10,37,68,0.8)',
      border: '1.5px solid rgba(212,175,55,0.25)',
      maxWidth: 340,
    }}>
      <audio ref={audioRef} src={src} onEnded={handleEnded} />
      <button
        onClick={toggle}
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: playing ? 'var(--yellow-dark)' : 'var(--yellow)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '1.1rem',
          color: 'var(--bg-dark)',
          transition: 'transform 0.15s ease',
        }}
      >
        {playing ? '⏸' : '▶'}
      </button>
      <div>
        <div style={{
          fontFamily: 'var(--font-condensed)',
          fontSize: '0.75rem',
          color: 'var(--yellow)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 2,
        }}>
          Extrait audio
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.8rem',
          color: 'var(--white-secondary)',
        }}>
          {playing ? 'Lecture en cours…' : 'Appuyer pour écouter'}
        </div>
      </div>
    </div>
  )
}
