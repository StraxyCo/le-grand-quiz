import React, { useRef, useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Watermark } from '../ui/Watermark'

export function Screen00a() {
  const { goTo, testMode, setTestMode } = useGameStore()
  const videoRef = useRef(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    vid.muted = false
    vid.play().catch(() => {
      vid.muted = true
      vid.play().catch(() => setVideoError(true))
    })
  }, [])

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#000',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {!videoError && (
        <video
          ref={videoRef}
          src="/media/structure/theme-title.mp4"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          playsInline
          onEnded={() => setVideoEnded(true)}
          onError={() => setVideoError(true)}
        />
      )}
      {videoError && (
        <div className="diagonal-bg" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo.png" alt="Le Grand Quiz" style={{ maxHeight: 220, maxWidth: '80vw', objectFit: 'contain' }} />
        </div>
      )}
      {(videoEnded || videoError) && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 80,
          animation: 'fadeIn 0.5s ease both',
        }}>
          <button
            className="btn btn-primary"
            style={{ minWidth: 280, fontSize: '1.3rem', padding: '20px 56px' }}
            onClick={() => goTo('00b')}
          >
            Démarrer →
          </button>
        </div>
      )}
      <div style={{ position: 'fixed', top: 20, right: 24, display: 'flex', alignItems: 'center', gap: 10, zIndex: 10 }}>
        <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: testMode ? 'var(--yellow)' : 'rgba(255,255,255,0.5)' }}>
          {testMode ? 'Mode Test' : 'Mode Jeu'}
        </span>
        <div onClick={() => setTestMode(!testMode)} style={{ cursor: 'pointer', width: 44, height: 24, borderRadius: 100, background: testMode ? 'var(--yellow)' : 'rgba(255,255,255,0.15)', border: `1.5px solid ${testMode ? 'var(--yellow)' : 'rgba(255,255,255,0.25)'}`, position: 'relative', transition: 'all 0.2s ease' }}>
          <div style={{ position: 'absolute', top: 2, left: 2, width: 16, height: 16, borderRadius: '50%', background: testMode ? 'var(--bg-dark)' : 'white', transform: testMode ? 'translateX(20px)' : 'none', transition: 'transform 0.2s var(--ease-spring)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
        </div>
      </div>
      <Watermark />
    </div>
  )
}
