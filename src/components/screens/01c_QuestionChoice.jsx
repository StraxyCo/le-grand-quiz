import React, { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { MediaPlayer } from '../ui/MediaPlayer'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

const MODES = [
  { id: 'Duo',   pts: '1 pt',  desc: '2 propositions' },
  { id: 'Carré', pts: '2 pts', desc: '4 propositions' },
  { id: 'Cash',  pts: '4 pts', desc: 'Sans filet'     },
]

export function Screen01c() {
  const {
    playerOrder,
    phase1CurrentPlayerIndex,
    phase1CurrentQuestionIndex,
    phase1Questions,
    goTo,
  } = useGameStore()

  const player = playerOrder[phase1CurrentPlayerIndex]
  const question = phase1Questions[player]?.[phase1CurrentQuestionIndex]

  if (!question) return null

  const hasMedia = !!question.media
  const mediaExt = question.media?.split('.').pop().toLowerCase()
  const isImage = ['png','jpg','jpeg','webp','gif'].includes(mediaExt)

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: isImage && hasMedia ? 'row' : 'column',
        alignItems: 'center',
        gap: isImage && hasMedia ? 40 : 28,
        width: '100%',
        maxWidth: isImage && hasMedia ? 1100 : 760,
        padding: '0 40px',
      }}>

        {/* Left: question */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          alignItems: isImage && hasMedia ? 'flex-start' : 'center',
          textAlign: isImage && hasMedia ? 'left' : 'center',
        }}>

          {/* Theme */}
          {question.theme && (
            <div className="phase-badge anim-fade-in">{question.theme}</div>
          )}

          {/* Question text */}
          <h2 className="anim-fade-in stagger-1" style={{
            fontFamily: 'var(--font-condensed)',
            fontWeight: 700,
            fontSize: hasMedia && isImage ? '1.5rem' : '2rem',
            letterSpacing: '0.03em',
            lineHeight: 1.3,
            color: 'var(--white)',
          }}>
            {question.question}
          </h2>

          {/* Audio/inline media if not image */}
          {hasMedia && !isImage && (
            <div className="anim-fade-in stagger-2">
              <MediaPlayer mediaPath={question.media} />
            </div>
          )}

          {/* Mode choices */}
          <div className="anim-slide-up stagger-2" style={{
            display: 'flex',
            gap: 12,
            width: '100%',
          }}>
            {MODES.map(mode => (
              <button
                key={mode.id}
                className="choice-btn"
                onClick={() => {
                  useGameStore.setState({ pendingMode: mode.id })
                  goTo('01d')
                }}
              >
                <span>{mode.id}</span>
                <span className="choice-pts">{mode.pts}</span>
                <span style={{
                  fontSize: '0.7rem',
                  color: 'var(--white-secondary)',
                  fontWeight: 400,
                  textTransform: 'none',
                  letterSpacing: '0.02em',
                }}>
                  {mode.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: image */}
        {isImage && hasMedia && (
          <div className="anim-scale-in stagger-1">
            <MediaPlayer mediaPath={question.media} />
          </div>
        )}
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}
