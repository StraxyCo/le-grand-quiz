import React, { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

export function Screen01f() {
  const { computePhase1Ranking, playerOrder, phase1Answers, goTo, initPhase2Themes } = useGameStore()

  const [ranking, setRanking] = useState([])
  const [revealedCount, setRevealedCount] = useState(0) // how many groups revealed so far (bottom-up)
  const [tiebreakGroup, setTiebreakGroup] = useState(null) // group index being broken
  const [resolvedTies, setResolvedTies] = useState({}) // groupIndex → shuffled order
  const [done, setDone] = useState(false)

  // Scores from answers
  const scores = {}
  playerOrder.forEach(p => {
    scores[p] = (phase1Answers[p] || []).reduce((s, a) => s + a.points, 0)
  })

  useEffect(() => {
    const r = computePhase1Ranking()
    setRanking(r)
    // Also update live scoreboard
    const s = {}
    playerOrder.forEach(p => { s[p] = (phase1Answers[p] || []).reduce((acc, a) => acc + a.points, 0) })
    useGameStore.setState({ currentScores: s })
  }, [])

  // Build groups (same score = same group)
  const grouped = []
  ranking.forEach(player => {
    const score = scores[player]
    const last = grouped[grouped.length - 1]
    if (last && last.score === score) last.players.push(player)
    else grouped.push({ score, players: [player] })
  })
  // Reversed for bottom-to-top reveal
  const groupedReversed = [...grouped].reverse()

  // Get rank position for a group (1-based)
  const groupRank = (groupIndex) => {
    // groupIndex in grouped (not reversed)
    return grouped.slice(0, groupIndex).reduce((sum, g) => sum + g.players.length, 0) + 1
  }

  const handleReveal = () => {
    if (tiebreakGroup !== null) return // wait for tiebreak to resolve first
    const nextIdx = revealedCount
    if (nextIdx >= groupedReversed.length) return

    const group = groupedReversed[nextIdx]
    setRevealedCount(nextIdx + 1)

    if (nextIdx + 1 >= groupedReversed.length) setDone(true)

    // If tie, set tiebreakGroup (but don't auto-resolve)
    if (group.players.length > 1) {
      setTiebreakGroup(nextIdx)
    }
  }

  const handleTiebreak = () => {
    if (tiebreakGroup === null) return
    const group = groupedReversed[tiebreakGroup]
    // Shuffle to resolve tie order
    const shuffled = [...group.players].sort(() => Math.random() - 0.5)
    setResolvedTies(prev => ({ ...prev, [tiebreakGroup]: shuffled }))
    setTiebreakGroup(null)
  }

  const handleNext = () => {
    initPhase2Themes()
    goTo('02a')
  }

  // Determine display order of players within a group
  const getGroupPlayers = (group, revGroupIdx) => {
    const actualGroupIdx = groupedReversed.length - 1 - revGroupIdx // index in grouped[]
    return resolvedTies[groupedReversed.length - 1 - revGroupIdx] || group.players
  }

  // Build the full list of slots (all positions, top to bottom)
  // Total positions = playerOrder.length
  const totalPositions = playerOrder.length

  // Build revealed rows (from top of ranking down)
  // revealedCount tells us how many groups from bottom are revealed
  // So top groups are revealed last
  const numGroupsRevealed = revealedCount
  // The revealed groups are the LAST numGroupsRevealed in groupedReversed
  // But we display top-to-bottom, so we show from the top of grouped[]
  // groups revealed = grouped[grouped.length - numGroupsRevealed ... end]
  const revealedGroupsFromTop = grouped.filter((_, i) => i >= grouped.length - numGroupsRevealed)

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 600,
        padding: '0 40px',
        gap: 20,
      }}>
        <div className="phase-badge anim-fade-in">Fin de la Phase 01</div>
        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{ fontSize: '3.5rem' }}>
          Classement
        </h1>

        {/* All slots pre-rendered */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          {grouped.map((group, gi) => {
            const isRevealed = gi >= grouped.length - numGroupsRevealed
            const rank = groupRank(gi)
            // reversed group index for tiebreak lookup
            const revIdx = grouped.length - 1 - gi
            const players = resolvedTies[revIdx] || group.players

            return players.map((player, pi) => (
              <div key={player} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 20px',
                borderRadius: 'var(--radius-md)',
                background: isRevealed ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isRevealed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
                transition: 'all 0.3s ease',
                minHeight: 54,
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.8rem',
                  color: 'var(--yellow)',
                  minWidth: 40,
                  opacity: 0.8,
                }}>
                  {rank + pi}
                </span>
                {isRevealed ? (
                  <>
                    <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '0.05em', flex: 1 }}>
                      {player}
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--yellow)' }}>
                      {scores[player]} pts
                    </span>
                  </>
                ) : (
                  <span style={{ flex: 1 }} /> // empty placeholder
                )}
              </div>
            ))
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          {tiebreakGroup !== null && (
            <button className="btn btn-secondary" style={{ minWidth: 180 }} onClick={handleTiebreak}>
              🎲 Départager
            </button>
          )}
          {tiebreakGroup === null && !done && (
            <button className="btn btn-primary" style={{ minWidth: 180 }} onClick={handleReveal}>
              Révéler ↓
            </button>
          )}
          {done && tiebreakGroup === null && (
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
