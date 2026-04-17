import React, { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import { useTimer } from '../../hooks/useTimer'
import { MediaPlayer } from '../ui/MediaPlayer'
import { TimerRing } from '../ui/Timer'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'
import { getShuffledOptions } from '../../utils/questionUtils'
import { playSfx } from '../../utils/soundUtils'

// Unified 01c + 01d + 01e — also used for Phase 2 questions (02f imports this logic)
export function Screen01c() {
  const {
    playerOrder, phase1CurrentPlayerIndex, phase1CurrentQuestionIndex,
    phase1Questions, recordPhase1Answer, advancePhase1, isPhase1Done, goTo,
  } = useGameStore()

  const player = playerOrder[phase1CurrentPlayerIndex]
  const question = phase1Questions[player]?.[phase1CurrentQuestionIndex]

  const [step, setStep] = useState('choice')
  const [mode, setMode] = useState(null)
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState(null)
  const [cashResult, setCashResult] = useState(null)
  const soundPlayed = useRef(false)

  const { timeLeft, running, finished, progress, urgent, start, skip } = useTimer(30)

  const playResult = (correct) => {
    if (soundPlayed.current) return
    soundPlayed.current = true
    playSfx(correct ? '/media/structure/success.mp3' : '/media/structure/failure.mp3')
  }

  const handleModeSelect = (m) => {
    setMode(m)
    setOptions(getShuffledOptions(question, m))
    setStep('timer')
    soundPlayed.current = false
    start()
  }

  const handleShowAnswer = () => {
    skip()
    setStep('answer')
    // For Duo/Carré: play sound immediately on reveal (correctness is known from selection)
    if (mode !== 'Cash') {
      playResult(!!selected?.isCorrect)
    }
  }

  const handleCashResult = (result) => {
    setCashResult(result)
    playResult(result === 'correct')
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

  const ext = question.media?.split('.').pop().toLowerCase()
  const isImage = question.media && ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)
  const hasMedia = !!question.media

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: isImage ? 'row' : 'column',
        alignItems: isImage ? 'center' : 'stretch',
        gap: isImage ? 40 : 20,
        width: '100%',
        maxWidth: isImage ? 1100 : 800,
        padding: '20px 40px',
        height: '100%',
        justifyContent: 'center',
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center' }}>

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {question.theme && <div className="phase-badge">{question.theme}</div>}
              {step !== 'choice' && mode && (
                <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.8rem', color: 'var(--yellow)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {mode} · {mode === 'Duo' ? '1 pt' : mode === 'Carré' ? '2 pts' : '4 pts'}
                </span>
              )}
            </div>
            {step === 'timer' && <TimerRing timeLeft={timeLeft} progress={progress} urgent={urgent} size={88} />}
          </div>

          {/* Question */}
          <h2 style={{
            fontFamily: 'var(--font-condensed)', fontWeight: 700,
            fontSize: step === 'choice' ? '2.2rem' : '1.9rem',
            letterSpacing: '0.03em', lineHeight: 1.3,
            color: step === 'answer' ? 'var(--white-secondary)' : 'var(--white)',
            transition: 'color 0.3s ease',
          }}>
            {question.question}
          </h2>

          {hasMedia && !isImage && <MediaPlayer mediaPath={question.media} />}

          {/* CHOICE */}
          {step === 'choice' && (
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { id: 'Duo', pts: '1 pt', desc: '2 propositions' },
                { id: 'Carré', pts: '2 pts', desc: '4 propositions' },
                { id: 'Cash', pts: '4 pts', desc: 'Sans filet' },
              ].map(m => (
                <button key={m.id} className="choice-btn" onClick={() => handleModeSelect(m.id)}>
                  <span>{m.id}</span>
                  <span className="choice-pts">{m.pts}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--white-secondary)', fontWeight: 400, textTransform: 'none', letterSpacing: '0.02em' }}>
                    {m.desc}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* TIMER - QCM */}
          {step === 'timer' && mode !== 'Cash' && (
            <div className="answer-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {options.map((opt, i) => (
                <button key={i}
                  className={`answer-option${selected?.text === opt.text ? ' selected' : ''}`}
                  onClick={() => !selected && setSelected(opt)}
                  disabled={!!selected}>
                  {opt.text}
                </button>
              ))}
            </div>
          )}
          {step === 'timer' && mode === 'Cash' && (
            <div style={{ padding: '24px', borderRadius: 'var(--radius-md)', border: '1.5px solid rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.05)', textAlign: 'center', fontFamily: 'var(--font-condensed)', fontSize: '1.1rem', letterSpacing: '0.08em', color: 'var(--yellow)' }}>
              Réponse Cash
            </div>
          )}

          {/* ANSWER - QCM: scale animation instead of fadeInScale to avoid disappear/reappear */}
          {step === 'answer' && mode !== 'Cash' && (
            <div className="answer-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {options.map((opt, i) => {
                let cls = 'answer-option'
                if (opt.isCorrect) cls += ' correct'
                else if (selected?.text === opt.text) cls += ' wrong'
                return (
                  <div key={i} className={cls} style={{
                    cursor: 'default',
                    animation: 'answerReveal 0.25s ease both',
                    animationDelay: `${i * 0.06}s`,
                  }}>
                    {opt.text}
                  </div>
                )
              })}
            </div>
          )}
          {step === 'answer' && mode !== 'Cash' && question.note && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--white-secondary)', fontStyle: 'italic' }}>
              {question.note}
            </p>
          )}

          {/* ANSWER - Cash */}
          {step === 'answer' && mode === 'Cash' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '18px 28px', borderRadius: 'var(--radius-md)', background: 'rgba(212,175,55,0.08)', border: '1.5px solid rgba(212,175,55,0.35)' }}>
                <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.65rem', color: 'var(--yellow)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>La bonne réponse</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--white)' }}>{question.answer}</div>
                {question.note && <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--white-secondary)', marginTop: 6, fontStyle: 'italic' }}>{question.note}</div>}
              </div>
              {!cashResult ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-success" onClick={() => handleCashResult('correct')} style={{ minWidth: 130 }}>✓ Réussi</button>
                  <button className="btn btn-danger" onClick={() => handleCashResult('wrong')} style={{ minWidth: 130 }}>✗ Raté</button>
                </div>
              ) : (
                <div style={{ fontFamily: 'var(--font-condensed)', color: cashResult === 'correct' ? 'var(--green)' : 'var(--red)', fontSize: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {cashResult === 'correct' ? '✓ Bonne réponse' : '✗ Mauvaise réponse'}
                </div>
              )}
            </div>
          )}
        </div>

        {isImage && <MediaPlayer mediaPath={question.media} />}
      </div>

      {/* Bottom action */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', gap: 12, zIndex: 10 }}>
        {step === 'timer' && (
          <button className="btn btn-primary" style={{ minWidth: 200 }}
            disabled={mode !== 'Cash' && !selected} onClick={handleShowAnswer}>
            Voir la réponse →
          </button>
        )}
        {step === 'answer' && (mode !== 'Cash' || cashResult) && (
          <button className="btn btn-primary" style={{ minWidth: 200 }} onClick={handleNext}>
            Passer à la suite →
          </button>
        )}
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}
