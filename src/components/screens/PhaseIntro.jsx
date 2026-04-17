import React, { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

/**
 * Generic phase intro screen:
 * - Large phase number displayed
 * - Phase theme music plays automatically on mount
 * - Music stops when "Commencer" is clicked (goes to rules screen)
 * - Music also stops naturally at end of track
 */
function PhaseIntroScreen({ phaseNumber, label, musicSrc, nextScreen }) {
  const { goTo } = useGameStore()
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = new Audio(musicSrc)
    audio.volume = 0.8
    audioRef.current = audio
    audio.play().catch(() => {})
    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [musicSrc])

  const handleNext = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    goTo(nextScreen)
  }

  return (
    <div className="screen diagonal-bg" style={{ justifyContent: 'center' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        textAlign: 'center',
        padding: '0 40px',
      }}>
        {/* Phase label */}
        <div className="phase-badge anim-fade-in" style={{ fontSize: '0.8rem', letterSpacing: '0.2em' }}>
          Phase {String(phaseNumber).padStart(2, '0')}
        </div>

        {/* Big number */}
        <div className="anim-scale-in stagger-1" style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(8rem, 20vw, 16rem)',
          lineHeight: 0.85,
          background: 'linear-gradient(180deg, #F0D060 0%, #D4AF37 40%, #B09026 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          userSelect: 'none',
        }}>
          {String(phaseNumber).padStart(2, '0')}
        </div>

        {/* Phase name */}
        <h2 className="text-condensed anim-fade-in stagger-2" style={{
          fontSize: '1.8rem',
          color: 'var(--white)',
          letterSpacing: '0.12em',
        }}>
          {label}
        </h2>

        <div className="separator anim-fade-in stagger-3" style={{ maxWidth: 320 }}>✦</div>

        <button
          className="btn btn-primary anim-slide-up stagger-4"
          style={{ minWidth: 240, fontSize: '1.1rem', marginTop: 8 }}
          onClick={handleNext}
        >
          Commencer →
        </button>
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}

export function Screen01Intro() {
  return (
    <PhaseIntroScreen
      phaseNumber={1}
      label="Questions de classement"
      musicSrc="/media/structure/phase-1-theme.mp3"
      nextScreen="01a"
    />
  )
}

export function Screen02Intro() {
  return (
    <PhaseIntroScreen
      phaseNumber={2}
      label="Les Thèmes"
      musicSrc="/media/structure/phase-2-theme.mp3"
      nextScreen="02a"
    />
  )
}

export function Screen03Intro() {
  return (
    <PhaseIntroScreen
      phaseNumber={3}
      label="La Finale"
      musicSrc="/media/structure/phase-3-theme.mp3"
      nextScreen="03a"
    />
  )
}
