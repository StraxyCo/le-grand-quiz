import React, { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { useTimer } from '../../hooks/useTimer'
import { TimerRing } from '../ui/Timer'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

// ─── 03a Title ────────────────────────────────────────────────────────────────
export function Screen03a() {
  const { finalists, goTo, initPhase3 } = useGameStore()

  const handleStart = () => {
    initPhase3()
    goTo('03b')
  }

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        padding: '0 40px',
        textAlign: 'center',
        maxWidth: 720,
      }}>
        <div className="phase-badge anim-fade-in">Phase 03</div>

        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{ fontSize: '5.5rem', lineHeight: 1 }}>
          La Finale
        </h1>

        {finalists?.length === 2 && (
          <div className="anim-fade-in stagger-2" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '1.6rem', fontWeight: 700 }}>
              {finalists[0]}
            </span>
            <span style={{ color: 'var(--yellow)', fontSize: '1.2rem' }}>VS</span>
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '1.6rem', fontWeight: 700 }}>
              {finalists[1]}
            </span>
          </div>
        )}

        <div className="separator anim-fade-in stagger-2" style={{ maxWidth: 360 }}>✦</div>

        <div className="anim-fade-in stagger-3" style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 520 }}>
          {[
            '8 questions, posées l\'une après l\'autre',
            'Chaque finaliste répond séparément — sans voir la réponse de l\'autre',
            'Le reveal se fait à la fin, question par question',
            'Le·la gagnant·e est celui ou celle qui a le plus de bonnes réponses',
          ].map((rule, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--white-secondary)' }}>
              <span style={{ color: 'var(--yellow)', fontSize: '0.6rem', marginTop: 6, flexShrink: 0 }}>◆</span>
              {rule}
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary anim-slide-up stagger-4"
          style={{ minWidth: 260, marginTop: 8 }}
          onClick={handleStart}
        >
          Lancer la Finale →
        </button>
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}

// ─── 03b Question title ────────────────────────────────────────────────────────
export function Screen03b() {
  const { phase3Questions, phase3CurrentQuestionIndex, finalists, goTo } = useGameStore()
  const q = phase3Questions[phase3CurrentQuestionIndex]

  // Phase 3 order: J1=finalists[0] (classé 1er), J2=finalists[1]
  // Pattern: Q1→J1 first, Q2→J2 first, Q3→J1, Q4→J2...
  // Wait — spec says Q1: J1 first (classé 1er)
  // finalists[0] = classé 1er, finalists[1] = classé 2e
  const qIndex = phase3CurrentQuestionIndex
  const firstPlayer = qIndex % 2 === 0 ? finalists[0] : finalists[1]

  if (!q) return null

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        textAlign: 'center',
        padding: '0 40px',
      }}>
        <div className="phase-badge anim-fade-in">
          Question {qIndex + 1} / 8
        </div>

        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{ fontSize: '3.5rem', lineHeight: 1 }}>
          {q.theme || 'Finale'}
        </h1>

        <div className="anim-fade-in stagger-2" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 24px',
          borderRadius: '100px',
          background: 'rgba(212,175,55,0.1)',
          border: '1px solid rgba(212,175,55,0.3)',
        }}>
          <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '1rem', color: 'var(--white-secondary)', letterSpacing: '0.08em' }}>
            Commence : <strong style={{ color: 'var(--yellow)' }}>{firstPlayer}</strong>
          </span>
        </div>

        <button
          className="btn btn-primary anim-slide-up stagger-3"
          style={{ minWidth: 220, marginTop: 12 }}
          onClick={() => goTo('03c')}
        >
          Prêt·e !
        </button>
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}

// ─── 03c/03d Question + answer input ─────────────────────────────────────────
export function Screen03cd({ playerStep }) {
  const {
    phase3Questions,
    phase3CurrentQuestionIndex,
    phase3Answers,
    finalists,
    recordPhase3Answer,
    advancePhase3Question,
    goTo,
  } = useGameStore()

  const q = phase3Questions[phase3CurrentQuestionIndex]
  const qIndex = phase3CurrentQuestionIndex
  const [answer, setAnswer] = useState('')
  const [timerStarted, setTimerStarted] = useState(false)
  const { timeLeft, running, finished, progress, urgent, start, skip } = useTimer(30)

  // Which player is answering
  const firstPlayer = qIndex % 2 === 0 ? finalists[0] : finalists[1]
  const secondPlayer = qIndex % 2 === 0 ? finalists[1] : finalists[0]
  const currentPlayer = playerStep === 'player1' ? firstPlayer : secondPlayer

  const handleNext = () => {
    skip()
    recordPhase3Answer(playerStep, answer)

    if (playerStep === 'player1') {
      goTo('03d')
    } else {
      // Both answered — move to next question or reveal
      advancePhase3Question()
      if (phase3CurrentQuestionIndex + 1 >= 8) {
        goTo('03e')
      } else {
        goTo('03b')
      }
    }
  }

  if (!q) return null

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: 760,
        padding: '20px 40px',
        gap: 24,
        height: '100%',
        justifyContent: 'center',
      }}>

        {/* Top */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="phase-badge">Question {qIndex + 1} / 8</div>
            <div className="phase-badge" style={{ background: 'rgba(212,175,55,0.12)' }}>
              {currentPlayer}
            </div>
          </div>
          {timerStarted && <TimerRing timeLeft={timeLeft} progress={progress} urgent={urgent} size={72} />}
        </div>

        {/* Question */}
        <h2 style={{
          fontFamily: 'var(--font-condensed)',
          fontWeight: 700,
          fontSize: '2rem',
          letterSpacing: '0.03em',
          lineHeight: 1.3,
        }}>
          {q.question}
        </h2>

        {/* Timer launch */}
        {!timerStarted && (
          <button
            className="btn btn-secondary"
            style={{ alignSelf: 'flex-start', minWidth: 160 }}
            onClick={() => { setTimerStarted(true); start() }}
          >
            ▶ Lancer le timer
          </button>
        )}

        {/* Answer input */}
        {timerStarted && (
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Saisir la réponse…"
            rows={3}
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(212,175,55,0.3)',
              background: 'rgba(10,37,68,0.8)',
              color: 'var(--white)',
              fontFamily: 'var(--font-body)',
              fontSize: '1.1rem',
              resize: 'none',
              outline: 'none',
            }}
          />
        )}

        {/* Next */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-primary"
            style={{ minWidth: 200 }}
            disabled={timerStarted && !answer.trim()}
            onClick={handleNext}
          >
            {playerStep === 'player1' ? `Passer à ${secondPlayer} →` : 'Question suivante →'}
          </button>
        </div>
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}

export function Screen03c() { return <Screen03cd playerStep="player1" /> }
export function Screen03d() { return <Screen03cd playerStep="player2" /> }

// ─── 03e Reveal title ─────────────────────────────────────────────────────────
export function Screen03e() {
  const { goTo } = useGameStore()

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        textAlign: 'center',
        padding: '0 40px',
      }}>
        <div className="phase-badge anim-fade-in">Finale</div>
        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{ fontSize: '5rem', lineHeight: 1 }}>
          Le Reveal
        </h1>
        <p className="anim-fade-in stagger-2" style={{ fontFamily: 'var(--font-body)', color: 'var(--white-secondary)', fontSize: '1rem', maxWidth: 480 }}>
          On découvre maintenant les réponses — question par question. Qui a vu juste ?
        </p>
        <button
          className="btn btn-primary anim-slide-up stagger-3"
          style={{ minWidth: 260, marginTop: 8 }}
          onClick={() => goTo('03f')}
        >
          Commencer le reveal →
        </button>
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}

// ─── 03f Reveal answers ────────────────────────────────────────────────────────
export function Screen03f() {
  const {
    phase3Questions,
    phase3Answers,
    finalists,
    setPhase3Correctness,
    goTo,
  } = useGameStore()

  const [currentQ, setCurrentQ] = useState(0)
  const [step, setStep] = useState('proposals') // 'proposals' | 'answer'

  const q = phase3Questions[currentQ]
  const ans = phase3Answers[currentQ] || {}
  const qIndex = currentQ
  const firstPlayer = qIndex % 2 === 0 ? finalists[0] : finalists[1]
  const secondPlayer = qIndex % 2 === 0 ? finalists[1] : finalists[0]

  const p1Correct = ans.player1Correct
  const p2Correct = ans.player2Correct
  const bothAttributed = p1Correct !== undefined && p2Correct !== undefined

  const isLast = currentQ >= phase3Questions.length - 1

  const handleNext = () => {
    if (isLast) {
      goTo('03g')
    } else {
      setCurrentQ(c => c + 1)
      setStep('proposals')
    }
  }

  if (!q) return null

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: 900,
        padding: '20px 40px',
        gap: 20,
        height: '100%',
        justifyContent: 'center',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="phase-badge">Question {currentQ + 1} / 8</div>
          <div className="progress-dots">
            {phase3Questions.map((_, i) => (
              <div key={i} className={`progress-dot${i < currentQ ? ' done' : i === currentQ ? ' active' : ''}`} />
            ))}
          </div>
        </div>

        {/* Question */}
        <h2 style={{
          fontFamily: 'var(--font-condensed)',
          fontWeight: 700,
          fontSize: '1.7rem',
          lineHeight: 1.3,
          color: 'var(--white-secondary)',
        }}>
          {q.question}
        </h2>

        {/* Player answers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: firstPlayer, answerKey: 'player1', player: 'player1', answer: ans.player1Answer, correct: ans.player1Correct },
            { label: secondPlayer, answerKey: 'player2', player: 'player2', answer: ans.player2Answer, correct: ans.player2Correct },
          ].map(({ label, player, answer, correct }) => (
            <div key={player} style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              background: correct === true ? 'rgba(39,174,96,0.1)' : correct === false ? 'rgba(214,85,72,0.1)' : 'var(--bg-light)',
              border: `1.5px solid ${correct === true ? 'rgba(39,174,96,0.4)' : correct === false ? 'rgba(214,85,72,0.4)' : 'rgba(255,255,255,0.08)'}`,
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.8rem', color: 'var(--yellow)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {label}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.1rem',
                color: step === 'proposals' ? 'var(--white)' : 'var(--white)',
                minHeight: 40,
                filter: step === 'proposals' ? 'none' : 'none',
              }}>
                {answer || <span style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>—</span>}
              </div>
              {step === 'answer' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    className={`btn ${correct === true ? 'btn-success' : 'btn-ghost'}`}
                    style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                    onClick={() => setPhase3Correctness(currentQ, player, true)}
                  >
                    ✓ Réussi
                  </button>
                  <button
                    className={`btn ${correct === false ? 'btn-danger' : 'btn-ghost'}`}
                    style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                    onClick={() => setPhase3Correctness(currentQ, player, false)}
                  >
                    ✗ Raté
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Answer reveal */}
        {step === 'answer' && (
          <div className="anim-scale-in" style={{
            padding: '16px 24px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(212,175,55,0.08)',
            border: '1.5px solid rgba(212,175,55,0.35)',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.65rem', color: 'var(--yellow)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
              La bonne réponse
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--white)' }}>
              {q.answer}
            </div>
            {q.note && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--white-secondary)', marginTop: 6, fontStyle: 'italic' }}>
                {q.note}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          {step === 'proposals' && (
            <button className="btn btn-primary" style={{ minWidth: 220 }} onClick={() => setStep('answer')}>
              Voir la réponse →
            </button>
          )}
          {step === 'answer' && (
            <button
              className="btn btn-primary"
              style={{ minWidth: 220 }}
              disabled={!bothAttributed}
              onClick={handleNext}
            >
              {isLast ? 'Découvrir le gagnant →' : 'Question suivante →'}
            </button>
          )}
        </div>
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}

// ─── 03g Final scores recap ───────────────────────────────────────────────────
export function Screen03g() {
  const { phase3Questions, phase3Answers, finalists, setFinalWinner, initTiebreaker, goTo } = useGameStore()

  const [revealed, setRevealed] = useState(0)
  const [autoAdvance, setAutoAdvance] = useState(false)

  useEffect(() => {
    if (revealed < phase3Questions.length) {
      const t = setTimeout(() => setRevealed(r => r + 1), 600)
      return () => clearTimeout(t)
    }
  }, [revealed, phase3Questions.length])

  // Compute scores
  const p1Score = phase3Answers.filter(a => a?.player1Correct).length
  const p2Score = phase3Answers.filter(a => a?.player2Correct).length
  const qIndex0 = 0
  const firstInQ1 = finalists[0]
  const player1 = finalists[0]
  const player2 = finalists[1]

  const allRevealed = revealed >= phase3Questions.length

  useEffect(() => {
    if (allRevealed && p1Score !== p2Score) {
      const t = setTimeout(() => {
        const winner = p1Score > p2Score ? player1 : player2
        setFinalWinner(winner)
        goTo('04a')
      }, 5000)
      return () => clearTimeout(t)
    }
  }, [allRevealed, p1Score, p2Score])

  const handleTiebreak = () => {
    initTiebreaker('phase3')
    goTo('03h')
  }

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: 760,
        padding: '20px 40px',
        gap: 20,
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
      }}>

        <div className="phase-badge anim-fade-in">Résultats de la Finale</div>

        {/* Score header */}
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.8rem', color: 'var(--white-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{player1}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--yellow)' }}>{p1Score}</div>
          </div>
          <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)' }}>VS</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.8rem', color: 'var(--white-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{player2}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--yellow)' }}>{p2Score}</div>
          </div>
        </div>

        {/* Q by Q table */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {phase3Questions.slice(0, revealed).map((q, i) => {
            const ans = phase3Answers[i] || {}
            const qFirstPlayer = i % 2 === 0 ? player1 : player2
            const qSecondPlayer = i % 2 === 0 ? player2 : player1
            return (
              <div key={i} className="anim-fade-in" style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 40px 40px',
                gap: 12,
                alignItems: 'center',
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.85rem',
              }}>
                <span style={{ fontFamily: 'var(--font-display)', color: 'var(--yellow)', fontSize: '1rem' }}>{i + 1}</span>
                <span style={{ fontFamily: 'var(--font-body)', color: 'var(--white-secondary)' }}>{q.question.slice(0, 60)}…</span>
                <span style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                  {ans.player1Correct === true ? '✓' : ans.player1Correct === false ? '✗' : '—'}
                </span>
                <span style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                  {ans.player2Correct === true ? '✓' : ans.player2Correct === false ? '✗' : '—'}
                </span>
              </div>
            )
          })}
        </div>

        {allRevealed && p1Score === p2Score && (
          <div className="anim-fade-in" style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--white-secondary)', marginBottom: 16 }}>
              Égalité parfaite ! Une question de départage s'impose.
            </p>
            <button className="btn btn-primary" style={{ minWidth: 200 }} onClick={handleTiebreak}>
              Départager →
            </button>
          </div>
        )}

        {allRevealed && p1Score !== p2Score && (
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--white-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
            Révélation du gagnant dans quelques instants…
          </p>
        )}
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}

// ─── 03h Sudden death title ───────────────────────────────────────────────────
export function Screen03h() {
  const { goTo } = useGameStore()
  return (
    <div className="screen diagonal-bg">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center', padding: '0 40px' }}>
        <div className="phase-badge anim-fade-in">Finale</div>
        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{ fontSize: '5rem', lineHeight: 1 }}>
          La Mort Subite
        </h1>
        <p className="anim-fade-in stagger-2" style={{ fontFamily: 'var(--font-body)', color: 'var(--white-secondary)', maxWidth: 440 }}>
          Une question au plus proche pour tout régler. En cas d'égalité : chifoumi.
        </p>
        <button className="btn btn-primary anim-slide-up stagger-3" style={{ minWidth: 220, marginTop: 8 }} onClick={() => goTo('03i')}>
          C'est parti →
        </button>
      </div>
      <AdminControls />
      <Watermark />
    </div>
  )
}

// ─── 03i Sudden death question ────────────────────────────────────────────────
export function Screen03i() {
  const { tiebreakerQuestion, finalists, setFinalWinner, goTo } = useGameStore()
  const q = tiebreakerQuestion
  const [step, setStep] = useState('question')
  const [winner, setWinner] = useState(null)
  const { timeLeft, running, finished, progress, urgent, start, skip } = useTimer(30)

  useEffect(() => { if (step === 'question') start() }, [step])

  if (!q) return null

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
        {step === 'question' && (
          <>
            <div className="phase-badge anim-fade-in">Au plus proche</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 24 }}>
              <h2 className="anim-fade-in stagger-1" style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700, fontSize: '2rem', lineHeight: 1.3, flex: 1 }}>
                {q.question}
              </h2>
              <TimerRing timeLeft={timeLeft} progress={progress} urgent={urgent} size={80} />
            </div>
            <button className="btn btn-primary" style={{ minWidth: 220 }} onClick={() => { skip(); setStep('answer') }}>
              Voir la réponse →
            </button>
          </>
        )}

        {step === 'answer' && (
          <>
            <div className="phase-badge anim-fade-in">Résultat</div>
            <h2 style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700, fontSize: '1.6rem', color: 'var(--white-secondary)', textAlign: 'center' }}>
              {q.question}
            </h2>
            <div style={{ padding: '20px 36px', borderRadius: 'var(--radius-md)', background: 'rgba(212,175,55,0.08)', border: '1.5px solid rgba(212,175,55,0.35)', textAlign: 'center', minWidth: 300 }}>
              <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.65rem', color: 'var(--yellow)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>La bonne réponse</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--white)' }}>{q.answer}</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.9rem', color: 'var(--white-secondary)', marginBottom: 14, letterSpacing: '0.05em' }}>
                Qui a répondu le plus précisément ?
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                {finalists.map(p => (
                  <button key={p} className={`btn ${winner === p ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setWinner(p)} style={{ minWidth: 140 }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ minWidth: 200 }}
              disabled={!winner}
              onClick={() => { setFinalWinner(winner); goTo('04a') }}
            >
              Couronner le·la gagnant·e →
            </button>
          </>
        )}
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}
