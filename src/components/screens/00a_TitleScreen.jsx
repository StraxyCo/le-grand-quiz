import React, { useRef, useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Watermark } from '../ui/Watermark'

// Screen has 2 phases:
// 'title'  — logo + "Démarrer" button (triggers video)
// 'video'  — fullscreen video, then "Commencer" button → 00b

export function Screen00a() {
  const { goTo, testMode, setTestMode } = useGameStore()
  const videoRef = useRef(null)
  const [phase, setPhase] = useState('title') // 'title' | 'video'
  const [videoEnded, setVideoEnded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const startVideo = () => {
    setPhase('video')
  }

  useEffect(() => {
    if (phase !== 'video') return
    const vid = videoRef.current
    if (!vid) return
    vid.muted = false
    vid.play().catch(() => {
      vid.muted = true
      vid.play().catch(() => setVideoError(true))
    })
  }, [phase])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* ── TITLE PHASE ─────────────────────────────────────────── */}
      {phase === 'title' && (
        <div className="screen diagonal-bg" style={{ justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, padding: '0 40px' }}>
            <div className="anim-fade-in">
              <img src="/logo.png" alt="Le Grand Quiz" style={{ maxHeight: 220, maxWidth: '80vw', objectFit: 'contain' }} />
            </div>
            <div className="separator anim-fade-in stagger-2" style={{ maxWidth: 400 }}>✦</div>
            <button
              className="btn btn-primary anim-slide-up stagger-3"
              style={{ minWidth: 280, fontSize: '1.3rem', padding: '20px 56px' }}
              onClick={startVideo}
            >
              Démarrer
            </button>
          </div>
        </div>
      )}

      {/* ── VIDEO PHASE ─────────────────────────────────────────── */}
      {phase === 'video' && (
        <div style={{ width: '100%', height: '100%', background: '#000', position: 'relative' }}>
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

          {/* Passer (discret) */}
          <button
            className="btn btn-ghost"
            style={{ position: 'absolute', top: 20, left: 20, opacity: 0.5, zIndex: 10 }}
            onClick={() => setVideoEnded(true)}
          >
            Passer →
          </button>

          {/* Commencer — apparaît après la fin */}
          {(videoEnded || videoError) && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: 80,
              animation: 'fadeIn 0.5s ease both',
            }}>
              <button
                className="btn btn-primary"
                style={{ minWidth: 280, fontSize: '1.3rem', padding: '20px 56px' }}
                onClick={() => goTo('00b')}
              >
                Commencer →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TEST / JEU toggle — always visible ──────────────────── */}
      <div style={{ position: 'fixed', top: 20, right: 24, display: 'flex', alignItems: 'center', gap: 10, zIndex: 20 }}>
        <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: testMode ? 'var(--yellow)' : 'rgba(255,255,255,0.5)' }}>
          {testMode ? 'Mode Test' : 'Mode Jeu'}
        </span>
        <div
          onClick={() => setTestMode(!testMode)}
          style={{ cursor: 'pointer', width: 44, height: 24, borderRadius: 100, background: testMode ? 'var(--yellow)' : 'rgba(255,255,255,0.15)', border: `1.5px solid ${testMode ? 'var(--yellow)' : 'rgba(255,255,255,0.25)'}`, position: 'relative', transition: 'all 0.2s ease' }}
        >
          <div style={{ position: 'absolute', top: 2, left: 2, width: 16, height: 16, borderRadius: '50%', background: testMode ? 'var(--bg-dark)' : 'white', transform: testMode ? 'translateX(20px)' : 'none', transition: 'transform 0.2s var(--ease-spring)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
        </div>
      </div>

      <Watermark />
    </div>
  )
}
