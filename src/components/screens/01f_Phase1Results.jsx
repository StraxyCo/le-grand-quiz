import React, { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { shuffleArray } from '../../store/gameStore'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

export function Screen01f() {
  const { computePhase1Ranking, playerOrder, phase1Answers, goTo, initPhase2Themes } = useGameStore()

  const [ranking, setRanking] = useState([])
  const [revealed, setRevealed] = useState([]) // indices revealed so far (from bottom)
  const [rollingIndex, setRollingIndex] = useState(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const r = computePhase1Ranking()
    setRanking(r)
  }, [])

  // Scores
  const scores = {}
  playerOrder.forEach(p => {
    scores[p] = (phase1Answers[p] || []).reduce((s, a) => s + a.points, 0)
  })

  // Group ranking by score for tie detection
  const grouped = []
  ranking.forEach(player => {
    const score = scores[player]
    const last = grouped[grouped.length - 1]
    if (last && last.score === score) {
      last.players.push(player)
    } else {
      grouped.push({ score, players: [player] })
    }
  })
  // Reverse for bottom-to-top reveal
  const groupedReversed = [...grouped].reverse()

  const handleReveal = () => {
    const nextGroupIndex = revealed.length
    if (nextGroupIndex >= groupedReversed.length) return

    const group = groupedReversed[nextGroupIndex]

    if (group.players.length > 1) {
      // Tie — reveal + rolling animation
      setRevealed(prev => [...prev, nextGroupIndex])
      setRollingIndex(nextGroupIndex)
      setTimeout(() => setRollingIndex(null), 2000)
    } else {
      setRevealed(prev => [...prev, nextGroupIndex])
    }

    if (nextGroupIndex + 1 >= groupedReversed.length) {
      setDone(true)
    }
  }

  const handleNext = () => {
    initPhase2Themes()
    goTo('02a')
  }

  // Build display list (revealed groups from bottom to top)
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

        <div className="phase-badge anim-fade-in">Fin de la Phase 01</div>
        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{ fontSize: '3.5rem' }}>
          Classement
        </h1>

        {/* Ranking list */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          width: '100%',
          minHeight: 280,
        }}>
          {displayGroups.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: 'var(--white-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              paddingTop: 40,
            }}>
              Appuyez sur "Révéler" pour découvrir le classement
            </div>
          )}

          {/* Render from last to first (visually top = first) */}
          {[...displayGroups].reverse().map((group, gi) => {
            const globalRank = groupedReversed.length - (revealed.indexOf(groupedReversed.length - 1 - gi) ?? 0)
            const isRolling = rollingIndex === (groupedReversed.length - 1 - gi)

            return group.players.map((player, pi) => {
              const rank = grouped.findIndex(g => g.players.includes(player)) + 1
              return (
                <div key={player} className="rank-row" style={{ animationDelay: `${pi * 0.1}s` }}>
                  <span className="rank-number">{rank}</span>
                  <span className="rank-name">
                    {isRolling ? <RollingName player={player} /> : player}
                  </span>
                  <span className="rank-score">{scores[player]} pts</span>
                </div>
              )
            })
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          {!done && (
            <button className="btn btn-primary" style={{ minWidth: 180 }} onClick={handleReveal}>
              Révéler ↓
            </button>
          )}
          {done && (
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

function RollingName({ player }) {
  const [current, setCurrent] = useState(player)
  const names = ['Amandine', 'Catherine', 'Hélène', 'Léa', 'Matthieu', 'Nicolas']

  useEffect(() => {
    let count = 0
    const interval = setInterval(() => {
      setCurrent(names[Math.floor(Math.random() * names.length)])
      count++
      if (count > 12) {
        clearInterval(interval)
        setCurrent(player)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [player])

  return <span style={{ color: 'var(--yellow)' }}>{current}</span>
}
