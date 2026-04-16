import React, { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { useTimer } from '../../hooks/useTimer'
import { MediaPlayer } from '../ui/MediaPlayer'
import { TimerRing } from '../ui/Timer'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'
import { getShuffledOptions, shuffle } from '../../utils/questionUtils'

// ─── 02e Player title ────────────────────────────────────────────────────────
export function Screen02e() {
  const { phase2Order, phase2CurrentIndex, goTo } = useGameStore()
  const current = phase2Order[phase2CurrentIndex]

  if (!current) return null

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
        <div className="phase-badge anim-fade-in">Phase 02 — {current.theme}</div>

        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{
          fontSize: '5.5rem',
          lineHeight: 1,
          textTransform: 'uppercase',
        }}>
          {current.player}
        </h1>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 24px',
          borderRadius: '100px',
          background: 'rgba(212,175,55,0.1)',
          border: '1px solid rgba(212,175,55,0.3)',
        }} className="anim-fade-in stagger-2">
          <span style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: '1.1rem',
            color: 'var(--yellow)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            {current.theme}
          </span>
        </div>

        <button
          className="btn btn-primary anim-slide-up stagger-3"
          style={{ minWidth: 220, marginTop: 12 }}
          onClick={() => goTo('02f')}
        >
          Prêt·e !
        </button>
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}

// ─── 02f Questions — identical style to Phase 1 (01c unified) ────────────────
export function Screen02f() {
  const {
    phase2Order, phase2CurrentIndex, phase2Questions, phase2Answers,
    recordPhase2Answer, advancePhase2, goTo,
  } = useGameStore()

  const current = phase2Order[phase2CurrentIndex]
  const { player, theme } = current || {}
  const allThemeQuestions = phase2Questions[player]?.[theme] || []
  const answeredCount = (phase2Answers[player]?.[theme] || []).length
  const question = allThemeQuestions[answeredCount]

  const [step, setStep] = useState('choice')
  const [mode, setMode] = useState(null)
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState(null)
  const [cashResult, setCashResult] = useState(null)

  const { timeLeft, running, finished, progress, urgent, start, skip } = useTimer(30)

  // Reset local state when question changes (next question in same theme)
  const questionKey = question?.id
  useEffect(() => {
    setStep('choice')
    setMode(null)
    setOptions([])
    setSelected(null)
    setCashResult(null)
  }, [questionKey])

  const handleModeSelect = (m) => {
    setMode(m)
    setOptions(getShuffledOptions(question, m))
    setStep('timer')
    start()
  }

  const handleShowAnswer = () => {
    skip()
    setStep('answer')
  }

  const handleRecord = () => {
    const correct = mode === 'Cash' ? cashResult === 'correct' : !!selected?.isCorrect
    recordPhase2Answer(player, theme, question.id, mode, correct)
    const newAnsweredCount = answeredCount + 1
    if (newAnsweredCount >= 4) {
      const nextIndex = phase2CurrentIndex + 1
      if (nextIndex >= phase2Order.length) goTo('02g')
      else { advancePhase2(); goTo('02e') }
    }
    // If not done, useEffect above will reset state when question changes
  }

  if (!question) return null

  const ext = question.media?.split('.').pop().toLowerCase()
  const isImage = question.media && ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)

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
              <div className="phase-badge">{theme}</div>
              <div className="progress-dots">
                {[0,1,2,3].map(i => (
                  <div key={i} className={`progress-dot${i < answeredCount ? ' done' : i === answeredCount ? ' active' : ''}`} />
                ))}
              </div>
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

          {question.media && !isImage && <MediaPlayer mediaPath={question.media} />}

          {/* Choice */}
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
                  <span style={{ fontSize: '0.7rem', color: 'var(--white-secondary)', fontWeight: 400, textTransform: 'none', letterSpacing: '0.02em' }}>{m.desc}</span>
                </button>
              ))}
            </div>
          )}

          {/* Timer - QCM */}
          {step === 'timer' && mode !== 'Cash' && (
            <div className="answer-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {options.map((opt, i) => (
                <button key={i} className={`answer-option${selected?.text === opt.text ? ' selected' : ''}`}
                  onClick={() => !selected && setSelected(opt)} disabled={!!selected}>
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

          {/* Answer - QCM */}
          {step === 'answer' && mode !== 'Cash' && (
            <div className="answer-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {options.map((opt, i) => {
                let cls = 'answer-option'
                if (opt.isCorrect) cls += ' correct'
                else if (selected?.text === opt.text) cls += ' wrong'
                return <div key={i} className={cls} style={{ cursor: 'default', animationDelay: `${i*0.07}s` }}>{opt.text}</div>
              })}
            </div>
          )}
          {step === 'answer' && mode !== 'Cash' && question.note && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--white-secondary)', fontStyle: 'italic' }}>{question.note}</p>
          )}

          {/* Answer - Cash */}
          {step === 'answer' && mode === 'Cash' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '18px 28px', borderRadius: 'var(--radius-md)', background: 'rgba(212,175,55,0.08)', border: '1.5px solid rgba(212,175,55,0.35)' }}>
                <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.65rem', color: 'var(--yellow)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>La bonne réponse</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--white)' }}>{question.answer}</div>
                {question.note && <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--white-secondary)', marginTop: 6, fontStyle: 'italic' }}>{question.note}</div>}
              </div>
              {!cashResult ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-success" onClick={() => setCashResult('correct')} style={{ minWidth: 130 }}>✓ Réussi</button>
                  <button className="btn btn-danger" onClick={() => setCashResult('wrong')} style={{ minWidth: 130 }}>✗ Raté</button>
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
          <button className="btn btn-primary" style={{ minWidth: 200 }} disabled={mode !== 'Cash' && !selected} onClick={handleShowAnswer}>
            Voir la réponse →
          </button>
        )}
        {step === 'answer' && (mode !== 'Cash' || cashResult) && (
          <button className="btn btn-primary" style={{ minWidth: 200 }} onClick={handleRecord}>
            {answeredCount + 1 >= 4 ? 'Joueur·euse suivant·e →' : 'Question suivante →'}
          </button>
        )}
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}



// ─── 02g Phase 2 Ranking — identical to 01f ───────────────────────────────────
export function Screen02g() {
  const { computePhase2Ranking, playerOrder, goTo, setFinalists, initTiebreaker } = useGameStore()

  const [ranking, setRanking] = useState([])
  const [scores, setScores] = useState({})
  const [revealedCount, setRevealedCount] = useState(0)
  const [tiebreakGroupIdx, setTiebreakGroupIdx] = useState(null)
  const [rollingGroups, setRollingGroups] = useState({})
  const [rollingDone, setRollingDone] = useState({})
  const [done, setDone] = useState(false)

  useEffect(() => {
    const r = computePhase2Ranking()
    setRanking(r)
    const s = useGameStore.getState().currentScores
    setScores(s)
  }, [])

  const grouped = []
  ranking.forEach(p => {
    const score = scores[p] || 0
    const last = grouped[grouped.length - 1]
    if (last && last.score === score) last.players.push(p)
    else grouped.push({ score, players: [p] })
  })
  const groupedReversed = [...grouped].reverse()
  const groupRank = (gi) => grouped.slice(0, gi).reduce((sum, g) => sum + g.players.length, 0) + 1

  const handleReveal = () => {
    if (tiebreakGroupIdx !== null) return
    const nextIdx = revealedCount
    if (nextIdx >= groupedReversed.length) return
    const group = groupedReversed[nextIdx]
    setRevealedCount(nextIdx + 1)
    if (group.players.length > 1) setTiebreakGroupIdx(nextIdx)
    if (nextIdx + 1 >= groupedReversed.length) setDone(true)
  }

  const handleTiebreak = () => {
    if (tiebreakGroupIdx === null) return
    const group = groupedReversed[tiebreakGroupIdx]
    const shuffled = [...group.players].sort(() => Math.random() - 0.5)
    setRollingGroups(prev => ({ ...prev, [tiebreakGroupIdx]: shuffled }))
    setRollingDone(prev => ({ ...prev, [tiebreakGroupIdx]: false }))
    setTiebreakGroupIdx(null)
  }

  const handleRollingDone = (revIdx, playerIdx) => {
    const group = groupedReversed[revIdx]
    if (playerIdx === group.players.length - 1) {
      setRollingDone(prev => ({ ...prev, [revIdx]: true }))
    }
  }

  const handleNext = () => {
    // Check if tiebreak needed for top 2
    const top2Score = scores[ranking[0]]
    const secondScore = scores[ranking[1]]
    const tiedForSecond = ranking.filter(p => scores[p] === secondScore && ranking.indexOf(p) >= 1)

    if (tiedForSecond.length > 1) {
      initTiebreaker('phase2')
      goTo('02h')
      return
    }

    setFinalists(ranking.slice(0, 2))
    goTo('03a')
  }

  const ALL_NAMES = ['Amandine', 'Catherine', 'Hélène', 'Léa', 'Matthieu', 'Nicolas']

  function RollingName({ finalName, onDone }) {
    const [current, setCurrent] = useState('…')
    useEffect(() => {
      let count = 0
      const interval = setInterval(() => {
        count++
        if (count >= 18) { clearInterval(interval); setCurrent(finalName); onDone?.() }
        else setCurrent(ALL_NAMES[Math.floor(Math.random() * ALL_NAMES.length)])
      }, 80)
      return () => clearInterval(interval)
    }, [finalName])
    return <span style={{ color: 'var(--yellow)' }}>{current}</span>
  }

  return (
    <div className="screen diagonal-bg">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 600, padding: '0 40px', gap: 20 }}>
        <div className="phase-badge anim-fade-in">Fin de la Phase 02</div>
        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{ fontSize: '3.5rem' }}>Classement cumulé</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          {grouped.map((group, gi) => {
            const revIdx = grouped.length - 1 - gi
            const isRevealed = revIdx < revealedCount
            const rank = groupRank(gi)
            const resolvedOrder = rollingGroups[revIdx] || group.players
            const isRolling = rollingGroups[revIdx] && !rollingDone[revIdx]

            return resolvedOrder.map((player, pi) => {
              const isFinalist = rank + pi <= 2
              return (
                <div key={player} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 20px', borderRadius: 'var(--radius-md)',
                  background: isRevealed ? (isFinalist ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.04)') : 'rgba(255,255,255,0.015)',
                  border: `1px solid ${isRevealed ? (isFinalist ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.08)') : 'rgba(255,255,255,0.03)'}`,
                  transition: 'all 0.3s ease', minHeight: 54,
                }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--yellow)', minWidth: 40, opacity: 0.8 }}>{rank + pi}</span>
                  {isRevealed ? (
                    <>
                      <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '0.05em', flex: 1 }}>
                        {isRolling ? <RollingName finalName={player} onDone={() => handleRollingDone(revIdx, pi)} /> : player}
                        {isFinalist && !isRolling && (
                          <span style={{ marginLeft: 10, fontSize: '0.65rem', color: 'var(--yellow)', letterSpacing: '0.1em' }}>FINALISTE</span>
                        )}
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--yellow)' }}>{scores[player] || 0} pts</span>
                    </>
                  ) : <span style={{ flex: 1 }} />}
                </div>
              )
            })
          })}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {tiebreakGroupIdx !== null && (
            <button className="btn btn-secondary" style={{ minWidth: 180 }} onClick={handleTiebreak}>🎲 Départager</button>
          )}
          {tiebreakGroupIdx === null && !done && (
            <button className="btn btn-primary" style={{ minWidth: 180 }} onClick={handleReveal}>Révéler ↓</button>
          )}
          {done && tiebreakGroupIdx === null && (
            <button className="btn btn-primary" style={{ minWidth: 240 }} onClick={handleNext}>Passer à la Finale →</button>
          )}
        </div>
      </div>
      <AdminControls />
      <Watermark />
    </div>
  )
}


// ─── 02h Tiebreaker ───────────────────────────────────────────────────────────
export function Screen02h() {
  const { tiebreakerQuestion, phase2Ranking, scores: rawScores, currentScores, setFinalists, goTo } = useGameStore()
  const q = tiebreakerQuestion

  const [step, setStep] = useState('question') // 'question' | 'answer'
  const [winners, setWinners] = useState([])
  const { timeLeft, running, finished, progress, urgent, start, skip } = useTimer(30)

  // Find tied players
  const ranking = useGameStore.getState().phase2Ranking
  const scores = useGameStore.getState().currentScores
  const secondScore = scores[ranking[1]] || 0
  const tiedPlayers = ranking.filter(p => scores[p] === secondScore && ranking.indexOf(p) >= 1)

  useEffect(() => { if (step === 'question') start() }, [step])

  const toggleWinner = (p) => {
    setWinners(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  const needed = tiedPlayers.length - 1 // how many to select

  const handleValidate = () => {
    const finalist1 = ranking[0]
    const finalist2 = winners[0]
    setFinalists([finalist1, finalist2])
    goTo('03a')
  }

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
            <div className="phase-badge anim-fade-in">Départage — Au plus proche</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <h2 className="anim-fade-in stagger-1" style={{
                fontFamily: 'var(--font-condensed)',
                fontWeight: 700,
                fontSize: '2rem',
                lineHeight: 1.3,
                flex: 1,
              }}>
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
            <div className="phase-badge anim-fade-in">Résultat du départage</div>
            <h2 style={{
              fontFamily: 'var(--font-condensed)',
              fontWeight: 700,
              fontSize: '1.6rem',
              color: 'var(--white-secondary)',
              textAlign: 'center',
            }}>
              {q.question}
            </h2>

            <div style={{
              padding: '20px 36px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(212,175,55,0.08)',
              border: '1.5px solid rgba(212,175,55,0.35)',
              textAlign: 'center',
              minWidth: 300,
            }}>
              <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.65rem', color: 'var(--yellow)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
                La bonne réponse
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--white)' }}>
                {q.answer}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.9rem', color: 'var(--white-secondary)', marginBottom: 14, letterSpacing: '0.05em' }}>
                Qui s'est le plus approché·e ? Sélectionne le/la finaliste
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {tiedPlayers.map(p => (
                  <button
                    key={p}
                    className={`btn ${winners.includes(p) ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => toggleWinner(p)}
                    style={{ minWidth: 130 }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ minWidth: 220 }}
              disabled={winners.length !== needed}
              onClick={handleValidate}
            >
              Passer à la Finale →
            </button>
          </>
        )}
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}
