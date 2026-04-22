import React, { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { useAudio } from '../../hooks/useAudio'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

/**
 * Build the final ranking:
 *
 * 1. Grand winner (finalWinner) — 1st
 * 2. Losing finalist (the other finalist) — 2nd
 * 3. Remaining players in their phase2Ranking order, preserving ties
 *    (players with the same cumulative score share the same rank)
 *
 * Phase2Ranking already reflects the tiebreaker result for who became a finalist,
 * so we just need to place the two finalists at the top, then append the rest.
 */
function buildFinalRanking({ finalWinner, finalists, phase2Ranking, currentScores }) {
  if (!finalWinner || !finalists?.length) {
    return (phase2Ranking || []).map(p => ({ name: p, rank: null }))
  }

  const losingFinalist = finalists.find(p => p !== finalWinner)

  // Non-finalists in their phase2Ranking order
  const rest = (phase2Ranking || []).filter(p => !finalists.includes(p))

  // Group rest by cumulative score to preserve ties
  const groups = []
  rest.forEach(player => {
    const score = currentScores[player] ?? 0
    const last = groups[groups.length - 1]
    if (last && last.score === score) {
      last.players.push(player)
    } else {
      groups.push({ score, players: [player] })
    }
  })

  // Assign ranks: 1 = winner, 2 = loser, then grouped by score
  const ranked = []
  ranked.push({ rank: 1, players: [finalWinner] })
  if (losingFinalist) ranked.push({ rank: 2, players: [losingFinalist] })

  let nextRank = 3
  groups.forEach(group => {
    ranked.push({ rank: nextRank, players: group.players })
    nextRank += group.players.length
  })

  return ranked
}

export function Screen04a() {
  const { finalWinner, finalists, phase2Ranking, currentScores, activePlayers } = useGameStore()
  const { playVictory, pauseAll } = useAudio()
  const hasPlayed = useRef(false)
  const [nowPlaying, setNowPlaying] = useState(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    launchConfetti()
    if (finalWinner && !hasPlayed.current) {
      hasPlayed.current = true
      setTimeout(() => {
        playVictory(finalWinner)
        setNowPlaying(finalWinner)
        setIsPaused(false)
      }, 800)
    }
  }, [])

  const handlePlayVictory = (player) => {
    playVictory(player)
    setNowPlaying(player)
    setIsPaused(false)
  }

  const handlePause = () => {
    pauseAll()
    setIsPaused(true)
  }

  const rankedGroups = buildFinalRanking({ finalWinner, finalists, phase2Ranking, currentScores })

  return (
    <div className="screen diagonal-bg" style={{ justifyContent: 'center' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 24, padding: '0 40px', textAlign: 'center', maxWidth: 800, width: '100%',
      }}>

        {/* Winner */}
        {finalWinner && (
          <div className="anim-scale-in" style={{ marginBottom: 4 }}>
            <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--yellow)', marginBottom: 10 }}>
              🏆 Grand·e vainqueur·e
            </div>
            <h1 className="text-display text-gold" style={{ fontSize: '6rem', lineHeight: 1 }}>
              {finalWinner}
            </h1>
          </div>
        )}

        <div className="separator anim-fade-in stagger-2" style={{ maxWidth: 400 }}>✦</div>

        {/* Final ranking */}
        <div className="anim-fade-in stagger-3" style={{ width: '100%', maxWidth: 520 }}>
          <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--white-secondary)', marginBottom: 12 }}>
            Classement final
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rankedGroups.map(({ rank, players }) =>
              players.map((player, pi) => (
                <div key={player} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '12px 20px', borderRadius: 'var(--radius-md)',
                  background: rank === 1 ? 'rgba(212,175,55,0.1)' : rank === 2 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${rank === 1 ? 'rgba(212,175,55,0.3)' : rank === 2 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: '1.6rem',
                    color: rank === 1 ? 'var(--yellow)' : 'var(--white-secondary)',
                    minWidth: 36,
                  }}>
                    {rank}
                  </span>
                  <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '1.2rem', fontWeight: 700, flex: 1, letterSpacing: '0.05em' }}>
                    {player}
                  </span>
                  {rank === 1 && pi === 0 && <span style={{ fontSize: '1.2rem' }}>🏆</span>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Victory songs + pause */}
        <div className="anim-fade-in stagger-5" style={{ width: '100%', maxWidth: 520 }}>
          <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--white-secondary)', marginBottom: 10 }}>
            Chansons de victoire
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {activePlayers.map(player => (
              <button
                key={player}
                className={`btn ${nowPlaying === player && !isPaused ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.8rem', padding: '8px 16px' }}
                onClick={() => handlePlayVictory(player)}
              >
                ♫ {player}
              </button>
            ))}
            {nowPlaying && !isPaused && (
              <button
                className="btn btn-ghost"
                style={{ fontSize: '0.8rem', padding: '8px 16px', borderColor: 'rgba(255,255,255,0.2)' }}
                onClick={handlePause}
              >
                ⏸ Pause
              </button>
            )}
          </div>
        </div>
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}

function launchConfetti() {
  import('canvas-confetti').then(({ default: confetti }) => {
    const colors = ['#D4AF37', '#F0D060', '#FFFFFF', '#B09026']
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5, x: 0.3 }, colors, scalar: 1.2 })
    setTimeout(() => confetti({ particleCount: 120, spread: 80, origin: { y: 0.5, x: 0.7 }, colors, scalar: 1.2 }), 300)
    setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { y: 0.3, x: 0.5 }, colors, scalar: 1.0 }), 700)
  }).catch(() => {})
}
