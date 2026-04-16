import React, { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

const ALL_NAMES = ['Amandine', 'Catherine', 'Hélène', 'Léa', 'Matthieu', 'Nicolas']

function RollingName({ finalName, onDone }) {
  const [current, setCurrent] = useState('…')

  useEffect(() => {
    let count = 0
    const total = 18
    const interval = setInterval(() => {
      count++
      if (count >= total) {
        clearInterval(interval)
        setCurrent(finalName)
        onDone?.()
      } else {
        setCurrent(ALL_NAMES[Math.floor(Math.random() * ALL_NAMES.length)])
      }
    }, 80)
    return () => clearInterval(interval)
  }, [finalName])

  return <span style={{ color: 'var(--yellow)' }}>{current}</span>
}

export function Screen01f() {
  const { computePhase1Ranking, playerOrder, phase1Answers, goTo, initPhase2Themes } = useGameStore()

  const [ranking, setRanking] = useState([])
  const [revealedCount, setRevealedCount] = useState(0)
  const [tiebreakGroupIdx, setTiebreakGroupIdx] = useState(null) // reversed index in groupedReversed
  const [rollingGroups, setRollingGroups] = useState({}) // revIdx → shuffled order being animated
  const [rollingDone, setRollingDone] = useState({}) // revIdx → bool
  const [done, setDone] = useState(false)

  const scores = {}
  playerOrder.forEach(p => {
    scores[p] = (phase1Answers[p] || []).reduce((s, a) => s + a.points, 0)
  })

  useEffect(() => {
    const r = computePhase1Ranking()
    setRanking(r)
    const s = {}
    playerOrder.forEach(p => { s[p] = (phase1Answers[p] || []).reduce((acc, a) => acc + a.points, 0) })
    useGameStore.setState({ currentScores: s })
  }, [])

  // Build groups (same score = same group), sorted high→low
  const grouped = []
  ranking.forEach(player => {
    const score = scores[player]
    const last = grouped[grouped.length - 1]
    if (last && last.score === score) last.players.push(player)
    else grouped.push({ score, players: [player] })
  })
  // Reversed for bottom-to-top reveal
  const groupedReversed = [...grouped].reverse()

  const groupRank = (gi) => grouped.slice(0, gi).reduce((sum, g) => sum + g.players.length, 0) + 1

  const handleReveal = () => {
    if (tiebreakGroupIdx !== null) return // wait for tiebreak first
    const nextIdx = revealedCount
    if (nextIdx >= groupedReversed.length) return

    const group = groupedReversed[nextIdx]
    setRevealedCount(nextIdx + 1)

    if (group.players.length > 1) {
      // Tie — show all at once, then offer tiebreak button
      setTiebreakGroupIdx(nextIdx)
    }

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
    // Mark done when last player in group finishes rolling
    const group = groupedReversed[revIdx]
    if (playerIdx === group.players.length - 1) {
      setRollingDone(prev => ({ ...prev, [revIdx]: true }))
    }
  }

  const handleNext = () => {
    initPhase2Themes()
    goTo('02a')
  }

  // Build display: all slots pre-rendered top→bottom (high→low)
  return (
    <div className="screen diagonal-bg">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 600, padding: '0 40px', gap: 20 }}>
        <div className="phase-badge anim-fade-in">Fin de la Phase 01</div>
        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{ fontSize: '3.5rem' }}>Classement</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          {grouped.map((group, gi) => {
            const revIdx = grouped.length - 1 - gi
            const isRevealed = revIdx < revealedCount
            const rank = groupRank(gi)
            const resolvedOrder = rollingGroups[revIdx] || group.players
            const isRolling = rollingGroups[revIdx] && !rollingDone[revIdx]

            return resolvedOrder.map((player, pi) => (
              <div key={player} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 20px',
                borderRadius: 'var(--radius-md)',
                background: isRevealed ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.015)',
                border: `1px solid ${isRevealed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}`,
                transition: 'background 0.3s ease, border-color 0.3s ease',
                minHeight: 54,
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--yellow)', minWidth: 40, opacity: 0.8 }}>
                  {rank + pi}
                </span>
                {isRevealed ? (
                  <>
                    <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '0.05em', flex: 1 }}>
                      {isRolling
                        ? <RollingName finalName={player} onDone={() => handleRollingDone(revIdx, pi)} />
                        : player}
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--yellow)' }}>
                      {scores[player]} pts
                    </span>
                  </>
                ) : (
                  <span style={{ flex: 1 }} />
                )}
              </div>
            ))
          })}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {tiebreakGroupIdx !== null && (
            <button className="btn btn-secondary" style={{ minWidth: 180 }} onClick={handleTiebreak}>
              🎲 Départager
            </button>
          )}
          {tiebreakGroupIdx === null && !done && (
            <button className="btn btn-primary" style={{ minWidth: 180 }} onClick={handleReveal}>
              Révéler ↓
            </button>
          )}
          {done && tiebreakGroupIdx === null && (
            <button className="btn btn-primary" style={{ minWidth: 220 }} onClick={handleNext}>
              Passer à la Phase 2 →
            </button>
          )}
        </div>
      </div>
      <AdminControls />
      <Watermark />
    </div>
  )
}
