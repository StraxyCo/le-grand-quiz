import React, { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'
import { getShuffledOptions } from '../../utils/questionUtils'

export function Screen01e() {
  const {
    playerOrder,
    phase1CurrentPlayerIndex,
    phase1CurrentQuestionIndex,
    phase1Questions,
    pendingMode,
    pendingSelected,
    recordPhase1Answer,
    advancePhase1,
    isPhase1Done,
    goTo,
  } = useGameStore()

  const player = playerOrder[phase1CurrentPlayerIndex]
  const question = phase1Questions[player]?.[phase1CurrentQuestionIndex]
  const mode = pendingMode || 'Cash'
  const selected = pendingSelected

  const [options] = useState(() => getShuffledOptions(question, mode))
  const [cashResult, setCashResult] = useState(null) // 'correct' | 'wrong'
  const [revealed, setRevealed] = useState(mode !== 'Cash')

  // For QCM modes — correctness is auto-determined
  const isCorrect = mode !== 'Cash' ? selected?.isCorrect : cashResult === 'correct'

  const handleCashResult = (result) => {
    setCashResult(result)
    setRevealed(true)
  }

  const handleNext = () => {
    const correct = mode === 'Cash' ? cashResult === 'correct' : !!selected?.isCorrect
    recordPhase1Answer(player, question.id, mode, correct)

    if (isPhase1Done()) {
      goTo('01f')
    } else {
      advancePhase1()
      goTo('01b')
    }
  }

  if (!question) return null

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 760,
        padding: '0 40px',
        gap: 24,
      }}>

        {/* Theme */}
        {question.theme && <div className="phase-badge anim-fade-in">{question.theme}</div>}

        {/* Question */}
        <h2 className="anim-fade-in stagger-1" style={{
          fontFamily: 'var(--font-condensed)',
          fontWeight: 700,
          fontSize: '1.6rem',
          letterSpacing: '0.03em',
          lineHeight: 1.3,
          color: 'var(--white-secondary)',
          textAlign: 'center',
        }}>
          {question.question}
        </h2>

        {/* QCM answer display */}
        {mode !== 'Cash' && options.length > 0 && (
          <div className="answer-grid anim-slide-up stagger-2" style={{
            gridTemplateColumns: options.length === 2 ? '1fr 1fr' : '1fr 1fr',
            width: '100%',
          }}>
            {options.map((opt, i) => {
              let cls = 'answer-option'
              if (opt.isCorrect) cls += ' correct'
              else if (selected?.text === opt.text && !opt.isCorrect) cls += ' wrong'
              return (
                <div key={i} className={cls} style={{ cursor: 'default' }}
                  style={{ animationDelay: `${i * 0.08}s`, cursor: 'default' }}>
                  {opt.text}
                </div>
              )
            })}
          </div>
        )}

        {/* Cash mode: show answer + buttons */}
        {mode === 'Cash' && (
          <div className="anim-scale-in stagger-2" style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}>
            <div style={{
              padding: '24px 36px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(212,175,55,0.08)',
              border: '1.5px solid rgba(212,175,55,0.35)',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: '0.7rem',
                color: 'var(--yellow)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                La bonne réponse
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                color: 'var(--white)',
                letterSpacing: '0.03em',
              }}>
                {question.answer}
              </div>
              {question.note && (
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  color: 'var(--white-secondary)',
                  marginTop: 8,
                  fontStyle: 'italic',
                }}>
                  {question.note}
                </div>
              )}
            </div>

            {!cashResult && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-success" onClick={() => handleCashResult('correct')} style={{ minWidth: 140 }}>
                  ✓ Réussi
                </button>
                <button className="btn btn-danger" onClick={() => handleCashResult('wrong')} style={{ minWidth: 140 }}>
                  ✗ Raté
                </button>
              </div>
            )}

            {cashResult && (
              <div style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: '1.1rem',
                color: cashResult === 'correct' ? 'var(--green)' : 'var(--red)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {cashResult === 'correct' ? '✓ Bonne réponse' : '✗ Mauvaise réponse'}
              </div>
            )}
          </div>
        )}

        {/* Note for QCM */}
        {mode !== 'Cash' && question.note && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.82rem',
            color: 'var(--white-secondary)',
            fontStyle: 'italic',
            textAlign: 'center',
          }}>
            {question.note}
          </p>
        )}

        {/* Next button */}
        {(mode !== 'Cash' || cashResult) && (
          <button
            className="btn btn-primary anim-slide-up"
            style={{ minWidth: 220 }}
            onClick={handleNext}
          >
            Passer à la suite →
          </button>
        )}
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}
