import React, { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import { useTimer } from '../../hooks/useTimer'
import { MediaPlayer } from '../ui/MediaPlayer'
import { TimerRing } from '../ui/Timer'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'
import { getShuffledOptions, shuffle } from '../../utils/questionUtils'
import { playSfx } from '../../utils/soundUtils'

// Inline version of RulesCards (avoids circular imports)
function RulesCardsInline({ rules }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, width: '100%' }}>
      {rules.map((rule, i) => (
        <div key={i} className="card" style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.8rem' }}>{rule.icon}</span>
          <div style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {rule.title}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--white-secondary)', lineHeight: 1.5 }}>
            {rule.desc}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── 02e Player title ────────────────────────────────────────────────────────
export function Screen02e() {
  const { phase2Order, phase2CurrentIndex, themeAssignments, goTo } = useGameStore()
  const current = phase2Order[phase2CurrentIndex]

  // Compute theme progress for this player: which theme number is this?
  const playerThemes = themeAssignments[current?.player] || []
  const themeIndex = current ? playerThemes.indexOf(current.theme) : -1
  const themeProgress = themeIndex >= 0
    ? `Thème ${themeIndex + 1}/${playerThemes.length}`
    : null

  if (!current) return null

  return (
    <div className="screen diagonal-bg">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center', padding: '0 40px' }}>

        <div className="anim-fade-in" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="phase-badge">Phase 02</div>
          {themeProgress && (
            <div className="phase-badge" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--white-secondary)' }}>
              {themeProgress}
            </div>
          )}
        </div>

        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{ fontSize: '5.5rem', lineHeight: 1, textTransform: 'uppercase' }}>
          {current.player}
        </h1>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 'var(--radius-md)', background: 'rgba(212,175,55,0.12)', border: '1.5px solid rgba(212,175,55,0.4)' }} className="anim-fade-in stagger-2">
          <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--yellow)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {current.theme}
          </span>
        </div>

        <button className="btn btn-primary anim-slide-up stagger-3" style={{ minWidth: 220, marginTop: 12 }} onClick={() => goTo('02f')}>
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
  const soundPlayed = useRef(false)

  const playResult = (correct) => {
    if (soundPlayed.current) return
    soundPlayed.current = true
    playSfx(correct ? '/media/structure/success.mp3' : '/media/structure/failure.mp3')
  }

  // Reset local state when question changes
  const questionKey = question?.id
  useEffect(() => {
    setStep('choice')
    setMode(null)
    setOptions([])
    setSelected(null)
    setCashResult(null)
    soundPlayed.current = false
  }, [questionKey])

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
    if (mode !== 'Cash') {
      playResult(!!selected?.isCorrect)
    }
  }

  const handleCashResult = (result) => {
    setCashResult(result)
    playResult(result === 'correct')
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
    const nextIdx = revealedCount
    if (nextIdx >= groupedReversed.length) return
    setRevealedCount(nextIdx + 1)
    if (nextIdx + 1 >= groupedReversed.length) setDone(true)
  }

  // After all revealed, check if tiebreak is needed
  const needsTiebreak = done && (() => {
    if (!scores[ranking[0]]) return false
    const top1Score = scores[ranking[0]]
    const playersAt1st = ranking.filter(p => scores[p] === top1Score)
    if (playersAt1st.length === 2) return false // exactly 2 tied for 1st → fine
    if (playersAt1st.length >= 3) return true   // Cas 03
    // Cas 02: clear P1, check 2nd place tie
    const top2Score = scores[ranking[1]]
    const tiedFor2nd = ranking.filter(p => scores[p] === top2Score && scores[p] !== top1Score)
    return tiedFor2nd.length >= 2
  })()

  const handleNext = () => {
    const top1Score = scores[ranking[0]]
    const top2Score = scores[ranking[1]]

    // Group players by their score position
    const playersAt1st = ranking.filter(p => scores[p] === top1Score)
    const playersAt2nd = ranking.filter(p => scores[p] === top2Score && scores[p] !== top1Score)

    // CAS 01 — No tiebreak needed:
    // - No tie at all, OR
    // - Tie doesn't affect top 2 (e.g. 4th/5th tied), OR
    // - Exactly the 2 finalists are clear (including case where they're tied with each other)
    const finalistsAreClear =
      playersAt1st.length === 1 && playersAt2nd.length === 1 ||  // perfect 1st and 2nd
      playersAt1st.length === 1 && playersAt2nd.length === 0 ||  // only 1 person at top (can't happen with ≥2 players)
      playersAt1st.length === 2                                   // exactly 2 tied for 1st → both go to finale

    if (finalistsAreClear) {
      if (playersAt1st.length === 2) {
        setFinalists(playersAt1st.slice(0, 2))
      } else {
        setFinalists([playersAt1st[0], ...ranking.filter(p => scores[p] === top2Score).slice(0, 1)])
      }
      goTo('03intro')
      return
    }

    // CAS 02 — Tiebreak for 2nd place only:
    // P1 is clear, but 2+ players tied for 2nd
    // CAS 03 — Tiebreak for both places:
    // 3+ players all tied at the top
    // Either way → go to 02h (AuPlusProche)
    initTiebreaker('phase2')
    goTo('02h')
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

            return group.players.map((player, pi) => {
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
                        {player}
                        {isFinalist && !needsTiebreak && (
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
          {!done && (
            <button className="btn btn-primary" style={{ minWidth: 180 }} onClick={handleReveal}>Révéler ↓</button>
          )}
          {done && needsTiebreak && (
            <button className="btn btn-secondary" style={{ minWidth: 240 }} onClick={() => { initTiebreaker('phase2'); goTo('02h') }}>
              Question au plus proche →
            </button>
          )}
          {done && !needsTiebreak && (
            <button className="btn btn-primary" style={{ minWidth: 240 }} onClick={handleNext}>Passer à la Finale →</button>
          )}
        </div>
      </div>
      <AdminControls />
      <Watermark />
    </div>
  )
}


// ─── 02h Tiebreaker — Au Plus Proche ─────────────────────────────────────────
// Step 1: rules explanation
// Step 2: question + timer
// Step 3: reveal answer + admin selects finalist(s)
export function Screen02h() {
  const { tiebreakerQuestion, setFinalists, goTo, initTiebreaker } = useGameStore()

  const ranking = useGameStore.getState().phase2Ranking
  const scores = useGameStore.getState().currentScores

  const top1Score = scores[ranking[0]]
  const top2Score = scores[ranking[1]]
  const playersAt1st = ranking.filter(p => scores[p] === top1Score)

  // CAS 02: 1 clear first, 2+ tied for second
  // CAS 03: 3+ tied at the very top (top1Score === top2Score, playersAt1st.length >= 3)
  const isCas03 = playersAt1st.length >= 3  // 3+ at same top score
  const isCas02 = !isCas03 && playersAt1st.length === 1  // clear P1, tie for 2nd

  // Players who participate in the tiebreak
  const tiedPlayers = isCas03
    ? playersAt1st  // all tied at top
    : ranking.filter(p => scores[p] === top2Score && scores[p] !== top1Score)  // tied for 2nd only

  // How many finalists to select from the tiebreak group
  const neededFromTied = isCas03 ? 2 : 1

  const q = tiebreakerQuestion
  const [step, setStep] = useState('rules') // 'rules' | 'question' | 'answer'
  const [winners, setWinners] = useState([])
  const { timeLeft, running, finished, progress, urgent, start, skip } = useTimer(30)

  const toggleWinner = (p) => {
    setWinners(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  const handleValidate = () => {
    let finalists
    if (isCas03) {
      // 3+ tied at top → admin selected 2 from tiedPlayers
      finalists = winners.slice(0, 2)
    } else {
      // CAS 02 — clear P1 + 1 selected from tied 2nd group
      finalists = [playersAt1st[0], winners[0]]
    }
    setFinalists(finalists)
    goTo('03intro')
  }

  if (!q) return null

  return (
    <div className="screen diagonal-bg">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 760, padding: '0 40px', gap: 24 }}>

        {/* ── RULES STEP ── */}
        {step === 'rules' && (
          <>
            <div className="phase-badge anim-fade-in">Départage</div>
            <h1 className="text-display text-gold anim-fade-in stagger-1" style={{ fontSize: '3.5rem', lineHeight: 1 }}>
              Au Plus Proche
            </h1>
            <div className="anim-fade-in stagger-2" style={{ width: '100%', maxWidth: 700 }}>
              <RulesCardsInline rules={[
                {
                  icon: '⚖️',
                  title: isCas03 ? 'Égalité en tête' : 'Égalité pour la 2e place',
                  desc: isCas03
                    ? `${tiedPlayers.join(', ')} sont à égalité pour les deux premières places.`
                    : `${tiedPlayers.join(', ')} sont à égalité pour la deuxième place.`,
                },
                {
                  icon: '🔢',
                  title: 'Une question numérique',
                  desc: 'Chaque joueur·euse répond à voix haute. La réponse la plus proche gagne.',
                },
                {
                  icon: isCas03 ? '🥇🥈' : '🎟️',
                  title: isCas03 ? '2 finalistes à désigner' : '1 finaliste à désigner',
                  desc: isCas03
                    ? "L'administrateur·ice sélectionne les 2 joueur·euses les plus proches."
                    : `L'administrateur·ice sélectionne le·la finaliste le·la plus proche, qui rejoint ${playersAt1st[0]} en finale.`,
                },
                {
                  icon: '🤞',
                  title: 'Égalité parfaite ?',
                  desc: 'En cas d\'égalité absolue, un chifoumi départage.',
                },
              ]} />
            </div>
            <button className="btn btn-primary anim-slide-up stagger-3" style={{ minWidth: 240 }}
              onClick={() => { setStep('question'); start() }}>
              Lancer la question →
            </button>
          </>
        )}

        {/* ── QUESTION + TIMER STEP ── */}
        {step === 'question' && (
          <>
            <div className="phase-badge anim-fade-in">Au plus proche — Départage</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 24 }}>
              <h2 className="anim-fade-in stagger-1" style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700, fontSize: '2rem', lineHeight: 1.3, flex: 1 }}>
                {q.question}
              </h2>
              <TimerRing timeLeft={timeLeft} progress={progress} urgent={urgent} size={88} />
            </div>
            <button className="btn btn-primary" style={{ minWidth: 220 }} onClick={() => { skip(); setStep('answer') }}>
              Voir la réponse →
            </button>
          </>
        )}

        {/* ── ANSWER + FINALIST SELECTION STEP ── */}
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
                {isCas03
                  ? 'Sélectionne les 2 finalistes (les plus proches)'
                  : "Sélectionne le·la finaliste qui s'est le plus approché·e"}
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
              disabled={winners.length !== neededFromTied}
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
