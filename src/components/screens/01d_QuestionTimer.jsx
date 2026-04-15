import React, { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { useTimer } from '../../hooks/useTimer'
import { MediaPlayer } from '../ui/MediaPlayer'
import { TimerRing } from '../ui/Timer'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'
import { getShuffledOptions } from '../../utils/questionUtils'

export function Screen01d() {
  const {
    playerOrder,
    phase1CurrentPlayerIndex,
    phase1CurrentQuestionIndex,
    phase1Questions,
    pendingMode,
    goTo,
  } = useGameStore()

  const player = playerOrder[phase1CurrentPlayerIndex]
  const question = phase1Questions[player]?.[phase1CurrentQuestionIndex]
  const mode = pendingMode || 'Carré'

  const [selected, setSelected] = useState(null)
  const [options] = useState(() => getShuffledOptions(question, mode))

  const { timeLeft, running, finished, progress, urgent, start, skip } = useTimer(30)

  // Auto-start timer on mount
  useEffect(() => {
    start()
  }, [])

  const handleSelect = (option) => {
    if (selected) return
    setSelected(option)
  }

  const handleNext = () => {
    skip()
    useGameStore.setState({
      pendingSelected: selected,
    })
    goTo('01e')
  }

  if (!question) return null

  const hasMedia = !!question.media
  const mediaExt = question.media?.split('.').pop().toLowerCase()
  const isImage = ['png','jpg','jpeg','webp','gif'].includes(mediaExt)

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: isImage && hasMedia ? 1100 : 760,
        padding: '20px 40px',
        gap: 20,
        height: '100%',
        justifyContent: 'center',
      }}>

        {/* Top row: theme + timer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {question.theme && <div className="phase-badge">{question.theme}</div>}
            <span style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: '0.8rem',
              color: 'var(--yellow)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {mode} · {mode === 'Duo' ? '1 pt' : mode === 'Carré' ? '2 pts' : '4 pts'}
            </span>
          </div>
          <TimerRing timeLeft={timeLeft} progress={progress} urgent={urgent} size={72} />
        </div>

        {/* Main content row */}
        <div style={{
          display: 'flex',
          gap: 32,
          alignItems: 'center',
          flex: 1,
        }}>

          {/* Question + options */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h2 style={{
              fontFamily: 'var(--font-condensed)',
              fontWeight: 700,
              fontSize: isImage && hasMedia ? '1.5rem' : '1.9rem',
              letterSpacing: '0.03em',
              lineHeight: 1.3,
              color: 'var(--white)',
            }}>
              {question.question}
            </h2>

            {/* Audio player */}
            {hasMedia && !isImage && <MediaPlayer mediaPath={question.media} />}

            {/* Answer options */}
            {mode !== 'Cash' && (
              <div className={`answer-grid`} style={{
                gridTemplateColumns: options.length === 2 ? '1fr 1fr' : '1fr 1fr',
              }}>
                {options.map((opt, i) => (
                  <button
                    key={i}
                    className={`answer-option${selected?.text === opt.text ? ' selected' : ''}`}
                    onClick={() => handleSelect(opt)}
                    disabled={!!selected}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            {mode === 'Cash' && (
              <div style={{
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px dashed rgba(212,175,55,0.25)',
                textAlign: 'center',
              }}>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--white-secondary)',
                  fontSize: '0.9rem',
                  fontStyle: 'italic',
                }}>
                  Réponse libre — pas de proposition
                </p>
              </div>
            )}
          </div>

          {/* Image */}
          {isImage && hasMedia && (
            <div style={{ flexShrink: 0 }}>
              <MediaPlayer mediaPath={question.media} />
            </div>
          )}
        </div>

        {/* Next button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-primary"
            style={{ minWidth: 200 }}
            onClick={handleNext}
          >
            Voir la réponse →
          </button>
        </div>
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}
