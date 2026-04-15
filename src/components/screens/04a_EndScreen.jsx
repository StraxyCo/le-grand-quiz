import React, { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import { useAudio } from '../../hooks/useAudio'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

export function Screen04a() {
  const { finalWinner, phase2Ranking, activePlayers } = useGameStore()
  const { playVictory, stop } = useAudio()
  const confettiRef = useRef(null)
  const hasPlayed = useRef(false)

  useEffect(() => {
    // Launch confetti
    launchConfetti()

    // Play winner song once
    if (finalWinner && !hasPlayed.current) {
      hasPlayed.current = true
      setTimeout(() => playVictory(finalWinner), 800)
    }
  }, [])

  const ranking = phase2Ranking?.length ? phase2Ranking : activePlayers

  return (
    <div className="screen diagonal-bg" style={{ justifyContent: 'center' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
        padding: '0 40px',
        textAlign: 'center',
        maxWidth: 800,
        width: '100%',
      }}>

        {/* Winner */}
        {finalWinner && (
          <div className="anim-scale-in" style={{ marginBottom: 8 }}>
            <div style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: '0.8rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--yellow)',
              marginBottom: 10,
            }}>
              🏆 Grand·e vainqueur·e
            </div>
            <h1 className="text-display text-gold" style={{ fontSize: '6rem', lineHeight: 1 }}>
              {finalWinner}
            </h1>
          </div>
        )}

        <div className="separator anim-fade-in stagger-2" style={{ maxWidth: 400 }}>✦</div>

        {/* Final ranking */}
        <div className="anim-fade-in stagger-3" style={{ width: '100%', maxWidth: 480 }}>
          <div style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--white-secondary)',
            marginBottom: 12,
          }}>
            Classement final
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ranking.map((player, i) => (
              <div key={player} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 20px',
                borderRadius: 'var(--radius-md)',
                background: i === 0 ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === 0 ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.05)'}`,
                animationDelay: `${0.3 + i * 0.1}s`,
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.6rem',
                  color: i === 0 ? 'var(--yellow)' : 'var(--white-secondary)',
                  minWidth: 36,
                }}>
                  {i + 1}
                </span>
                <span style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  flex: 1,
                  letterSpacing: '0.05em',
                }}>
                  {player}
                </span>
                {i === 0 && (
                  <span style={{ fontSize: '1.2rem' }}>🏆</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Victory songs */}
        <div className="anim-fade-in stagger-5" style={{ width: '100%', maxWidth: 480 }}>
          <div style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--white-secondary)',
            marginBottom: 10,
          }}>
            Chansons de victoire
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {activePlayers.map(player => (
              <button
                key={player}
                className="btn btn-ghost"
                style={{ fontSize: '0.8rem', padding: '8px 16px' }}
                onClick={() => playVictory(player)}
              >
                ♫ {player}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}

// Confetti launcher using canvas-confetti
function launchConfetti() {
  import('canvas-confetti').then(({ default: confetti }) => {
    const colors = ['#D4AF37', '#F0D060', '#FFFFFF', '#B09026']

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5, x: 0.3 },
      colors,
      scalar: 1.2,
    })
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5, x: 0.7 },
        colors,
        scalar: 1.2,
      })
    }, 300)
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.3, x: 0.5 },
        colors,
        scalar: 1.0,
      })
    }, 700)
  }).catch(() => {})
}
