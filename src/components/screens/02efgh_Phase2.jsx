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

// ─── 02f Questions ────────────────────────────────────────────────────────────
export function Screen02f() {
  const {
    phase2Order,
    phase2CurrentIndex,
    phase2Questions,
    phase2Answers,
    pendingMode,
    pendingSelected,
    recordPhase2Answer,
    advancePhase2,
    goTo,
  } = useGameStore()

  const current = phase2Order[phase2CurrentIndex]
  const { player, theme } = current || {}

  const allThemeQuestions = phase2Questions[player]?.[theme] || []
  const answeredCount = (phase2Answers[player]?.[theme] || []).length
  const question = allThemeQuestions[answeredCount]

  const [step, setStep] = useState('choice') // 'choice' | 'timer' | 'answer'
  const [mode, setMode] = useState(null)
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState(null)
  const [cashResult, setCashResult] = useState(null)

  const { timeLeft, running, finished, progress, urgent, start, skip } = useTimer(30)

  const handleModeSelect = (m) => {
    setMode(m)
    setOptions(getShuffledOptions(question, m))
    setStep('timer')
    start()
  }

  const handleNext = () => {
    skip()
    setStep('answer')
  }

  const handleRecord = () => {
    const correct = mode === 'Cash' ? cashResult === 'correct' : !!selected?.isCorrect
    recordPhase2Answer(player, theme, question.id, mode, correct)

    // Check if theme done (4 questions)
    const newAnsweredCount = answeredCount + 1
    if (newAnsweredCount >= 4) {
      // Move to next in phase2Order
      const nextIndex = phase2CurrentIndex + 1
      if (nextIndex >= phase2Order.length) {
        goTo('02g')
      } else {
        advancePhase2()
        goTo('02e')
      }
    } else {
      // Next question in same theme — reload screen
      setStep('choice')
      setMode(null)
      setOptions([])
      setSelected(null)
      setCashResult(null)
    }
  }

  if (!question) return null

  const isImage = question.media && ['png','jpg','jpeg','webp','gif'].includes(question.media.split('.').pop())

  const progressLabel = `${answeredCount + 1} / 4`

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: isImage && question.media ? 1100 : 760,
        padding: '20px 40px',
        gap: 18,
        height: '100%',
        justifyContent: 'center',
      }}>

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="phase-badge">{theme}</div>
            <div className="progress-dots">
              {[0,1,2,3].map(i => (
                <div key={i} className={`progress-dot${i < answeredCount ? ' done' : i === answeredCount ? ' active' : ''}`} />
              ))}
            </div>
          </div>
          {step === 'timer' && (
            <TimerRing timeLeft={timeLeft} progress={progress} urgent={urgent} size={72} />
          )}
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center', flex: 1 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>

            <h2 style={{
              fontFamily: 'var(--font-condensed)',
              fontWeight: 700,
              fontSize: '1.8rem',
              letterSpacing: '0.03em',
              lineHeight: 1.3,
              color: step === 'answer' ? 'var(--white-secondary)' : 'var(--white)',
            }}>
              {question.question}
            </h2>

            {question.media && !isImage && <MediaPlayer mediaPath={question.media} />}

            {/* Choice step */}
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
                    <span style={{ fontSize: '0.7rem', color: 'var(--white-secondary)', fontWeight: 400, textTransform: 'none' }}>
                      {m.desc}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Timer step — QCM */}
            {step === 'timer' && mode !== 'Cash' && (
              <div className="answer-grid">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    className={`answer-option${selected?.text === opt.text ? ' selected' : ''}`}
                    onClick={() => !selected && setSelected(opt)}
                    disabled={!!selected}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            {step === 'timer' && mode === 'Cash' && (
              <div style={{
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px dashed rgba(212,175,55,0.25)',
                textAlign: 'center',
                color: 'var(--white-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                fontStyle: 'italic',
              }}>
                Réponse libre — pas de proposition
              </div>
            )}

            {/* Answer step */}
            {step === 'answer' && mode !== 'Cash' && options.length > 0 && (
              <div className="answer-grid">
                {options.map((opt, i) => {
                  let cls = 'answer-option'
                  if (opt.isCorrect) cls += ' correct'
                  else if (selected?.text === opt.text) cls += ' wrong'
                  return <div key={i} className={cls} style={{ cursor: 'default', animationDelay: `${i*0.07}s` }}>{opt.text}</div>
                })}
              </div>
            )}

            {step === 'answer' && mode === 'Cash' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  padding: '20px 28px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(212,175,55,0.08)',
                  border: '1.5px solid rgba(212,175,55,0.35)',
                }}>
                  <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.65rem', color: 'var(--yellow)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                    La bonne réponse
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--white)' }}>
                    {question.answer}
                  </div>
                  {question.note && (
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--white-secondary)', marginTop: 6, fontStyle: 'italic' }}>
                      {question.note}
                    </div>
                  )}
                </div>
                {!cashResult ? (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-success" onClick={() => setCashResult('correct')} style={{ minWidth: 120 }}>✓ Réussi</button>
                    <button className="btn btn-danger" onClick={() => setCashResult('wrong')} style={{ minWidth: 120 }}>✗ Raté</button>
                  </div>
                ) : (
                  <div style={{ fontFamily: 'var(--font-condensed)', color: cashResult === 'correct' ? 'var(--green)' : 'var(--red)', fontSize: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {cashResult === 'correct' ? '✓ Bonne réponse' : '✗ Mauvaise réponse'}
                  </div>
                )}
              </div>
            )}

            {question.note && step === 'answer' && mode !== 'Cash' && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--white-secondary)', fontStyle: 'italic' }}>
                {question.note}
              </p>
            )}
          </div>

          {isImage && question.media && (
            <div style={{ flexShrink: 0 }}>
              <MediaPlayer mediaPath={question.media} />
            </div>
          )}
        </div>

        {/* Next buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {step === 'timer' && (
            <button className="btn btn-primary" style={{ minWidth: 200 }} onClick={handleNext}>
              Voir la réponse →
            </button>
          )}
          {step === 'answer' && (mode !== 'Cash' || cashResult) && (
            <button className="btn btn-primary" style={{ minWidth: 200 }} onClick={handleRecord}>
              {answeredCount + 1 >= 4 ? 'Joueur·euse suivant·e →' : 'Question suivante →'}
            </button>
          )}
        </div>
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}

// ─── 02g Phase 2 Ranking ─────────────────────────────────────────────────────
export function Screen02g() {
  const { computePhase2Ranking, playerOrder, goTo, setFinalists, initTiebreaker } = useGameStore()

  const [ranking, setRanking] = useState([])
  const [scores, setScores] = useState({})
  const [revealed, setRevealed] = useState([])
  const [done, setDone] = useState(false)
  const [needsTiebreak, setNeedsTiebreak] = useState(false)

  useEffect(() => {
    const r = computePhase2Ranking()
    setRanking(r)
    const s = useGameStore.getState().currentScores
    setScores(s)
  }, [])

  // Group by score
  const grouped = []
  ranking.forEach(p => {
    const score = scores[p] || 0
    const last = grouped[grouped.length - 1]
    if (last && last.score === score) last.players.push(p)
    else grouped.push({ score, players: [p] })
  })
  const groupedReversed = [...grouped].reverse()

  const handleReveal = () => {
    const next = revealed.length
    if (next >= groupedReversed.length) return
    setRevealed(prev => [...prev, next])
    if (next + 1 >= groupedReversed.length) setDone(true)
  }

  const handleNext = () => {
    // Determine finalists
    const top2 = ranking.slice(0, 2)
    const top2Score = scores[top2[0]]
    const top2SecondScore = scores[top2[1]]
    const tiedForSecond = ranking.filter(p => scores[p] === top2SecondScore)

    if (tiedForSecond.length > 1 && tiedForSecond.includes(top2[1]) && !tiedForSecond.includes(top2[0])) {
      setNeedsTiebreak(true)
      initTiebreaker('phase2')
      goTo('02h')
      return
    }

    setFinalists(top2)
    goTo('03a')
  }

  const displayGroups = groupedReversed.filter((_, i) => revealed.includes(i))

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 600,
        padding: '0 40px',
        gap: 24,
      }}>
        <div className="phase-badge anim-fade-in">Fin de la Phase 02</div>
        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{ fontSize: '3.5rem' }}>
          Classement cumulé
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', minHeight: 280 }}>
          {displayGroups.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--white-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', paddingTop: 40 }}>
              Appuyez sur "Révéler" pour découvrir le classement
            </div>
          )}
          {[...displayGroups].reverse().map((group) =>
            group.players.map((player, pi) => {
              const rank = grouped.findIndex(g => g.players.includes(player)) + 1
              const isFinalist = rank <= 2
              return (
                <div key={player} className="rank-row" style={{
                  animationDelay: `${pi * 0.1}s`,
                  borderColor: isFinalist ? 'rgba(212,175,55,0.4)' : undefined,
                }}>
                  <span className="rank-number">{rank}</span>
                  <span className="rank-name">
                    {player}
                    {isFinalist && (
                      <span style={{ marginLeft: 10, fontSize: '0.7rem', color: 'var(--yellow)', letterSpacing: '0.1em' }}>
                        FINALISTE
                      </span>
                    )}
                  </span>
                  <span className="rank-score">{scores[player] || 0} pts</span>
                </div>
              )
            })
          )}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {!done && (
            <button className="btn btn-primary" style={{ minWidth: 180 }} onClick={handleReveal}>Révéler ↓</button>
          )}
          {done && (
            <button className="btn btn-primary" style={{ minWidth: 240 }} onClick={handleNext}>
              Passer à la Finale →
            </button>
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
