import React, { useEffect, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { useAudio } from '../../hooks/useAudio'
import { Watermark } from '../ui/Watermark'

export function Screen00a() {
  const { goTo, testMode, setTestMode } = useGameStore()
  const { playTitleTheme } = useAudio()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Small delay before playing so browser allows audio
    const t = setTimeout(() => {
      playTitleTheme()
      setReady(true)
    }, 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="screen diagonal-bg" style={{ justifyContent: 'center', gap: 0 }}>

      {/* Main content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 32,
        padding: '0 40px',
      }}>

        {/* Logo */}
        <div className="anim-fade-in" style={{ marginBottom: 8 }}>
          <img
            src="/logo.png"
            alt="Le Grand Quiz"
            style={{ maxHeight: 220, maxWidth: '80vw', objectFit: 'contain' }}
          />
        </div>

        {/* Separator */}
        <div className="separator anim-fade-in stagger-2" style={{ maxWidth: 400 }}>
          ✦
        </div>

        {/* CTA */}
        <button
          className="btn btn-primary anim-slide-up stagger-3"
          style={{ minWidth: 280, fontSize: '1.3rem', padding: '20px 56px' }}
          onClick={() => goTo('00b')}
        >
          Démarrer
        </button>
      </div>

      {/* Test / Jeu toggle */}
      <div
        className="anim-fade-in stagger-5"
        style={{
          position: 'fixed',
          top: 20,
          right: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-condensed)',
          fontSize: '0.7rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: testMode ? 'var(--yellow)' : 'var(--white-secondary)',
        }}>
          {testMode ? 'Mode Test' : 'Mode Jeu'}
        </span>
        <div
          className={`toggle-pip`}
          onClick={() => setTestMode(!testMode)}
          style={{
            cursor: 'pointer',
            background: testMode ? 'var(--yellow)' : 'rgba(255,255,255,0.1)',
            borderColor: testMode ? 'var(--yellow)' : 'rgba(255,255,255,0.2)',
          }}
        >
          <div style={{
            position: 'absolute',
            top: 2,
            left: 2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            transform: testMode ? 'translateX(20px)' : 'none',
            transition: 'transform 0.2s var(--ease-spring)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            background: testMode ? 'var(--bg-dark)' : 'white',
          }} />
        </div>
      </div>

      <Watermark />
    </div>
  )
}
