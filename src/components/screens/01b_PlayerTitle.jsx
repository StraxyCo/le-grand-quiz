import React from 'react'
import { useGameStore } from '../../store/gameStore'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

export function Screen01b() {
  const {
    playerOrder,
    phase1CurrentPlayerIndex,
    phase1CurrentQuestionIndex,
    phase1Questions,
    goTo,
  } = useGameStore()

  const player = playerOrder[phase1CurrentPlayerIndex]
  const question = phase1Questions[player]?.[phase1CurrentQuestionIndex]
  const qNumber = phase1CurrentPlayerIndex * 3 + phase1CurrentQuestionIndex + 1
  const total = playerOrder.length * 3

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        padding: '0 40px',
        textAlign: 'center',
      }}>

        {/* Question counter */}
        <div className="phase-badge anim-fade-in">
          Question {qNumber} / {total}
        </div>

        {/* Player name */}
        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{
          fontSize: '5.5rem',
          lineHeight: 1,
          textTransform: 'uppercase',
        }}>
          {player}
        </h1>

        {/* Theme pill */}
        {question?.theme && (
          <div className="anim-fade-in stagger-2" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
            borderRadius: '100px',
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.3)',
          }}>
            <span style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: '0.9rem',
              color: 'var(--yellow)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {question.theme}
            </span>
          </div>
        )}

        <button
          className="btn btn-primary anim-slide-up stagger-3"
          style={{ minWidth: 220, marginTop: 12 }}
          onClick={() => goTo('01c')}
        >
          Prêt·e !
        </button>
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}
