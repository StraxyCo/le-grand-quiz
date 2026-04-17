import React, { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

// ─── 02b Theme Reveal ─────────────────────────────────────────────────────────
export function Screen02b() {
  const { availableThemes, goTo } = useGameStore()
  const [revealed, setRevealed] = useState(0)
  const allRevealed = revealed >= availableThemes.length
  return (
    <div className="screen diagonal-bg">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 860, padding: '0 40px', gap: 24 }}>
        <div className="phase-badge anim-fade-in">Les thèmes</div>
        <h2 className="text-condensed anim-fade-in stagger-1" style={{ fontSize: '2rem' }}>Découvrez les thèmes disponibles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, width: '100%' }}>
          {availableThemes.map((theme, i) => (
            <div key={i} style={{
              padding: '14px 12px', borderRadius: 'var(--radius-sm)',
              border: `1.5px solid ${i < revealed ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.08)'}`,
              background: i < revealed ? 'rgba(212,175,55,0.07)' : 'rgba(10,37,68,0.5)',
              textAlign: 'center', fontFamily: 'var(--font-condensed)', fontSize: '1rem',
              fontWeight: 700, letterSpacing: '0.04em',
              color: i < revealed ? 'var(--white)' : 'rgba(255,255,255,0.15)',
              transition: 'all 0.35s var(--ease-out)', minHeight: 70,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {i < revealed ? theme : '?'}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {!allRevealed && (
            <button className="btn btn-primary" style={{ minWidth: 200 }} onClick={() => setRevealed(r => r + 1)}>
              Révéler un thème
            </button>
          )}
          {allRevealed && (
            <button className="btn btn-primary" style={{ minWidth: 220 }} onClick={() => goTo('02c')}>
              Passer à l'attribution →
            </button>
          )}
        </div>
      </div>
      <AdminControls />
      <Watermark />
    </div>
  )
}

// ─── 02c Theme Attribution ────────────────────────────────────────────────────
//
// Uses an explicit ACTION QUEUE stored in state (never recomputed from index).
//
// ROUND A — fixed sequence per phase1Ranking order:
//   { player, action:'self',  round:'A' }  — player picks 1 theme for themselves
//   { player, action:'other', round:'A' }  — player assigns 1 theme to someone else
//   Constraint: target cannot have received >2 themes FROM OTHERS in Round A
//
// ROUND B — rebuilt fresh after each Round A action:
//   { player, action:'self', round:'B' } × (3 - current count) for each player needing themes
//   Players already at 3 are automatically skipped (they generate 0 steps)
//
// Queue is CONSUMED (shifted) on each confirmed action.
// allDone is ONLY set when every player has exactly 3 themes.
//
export function Screen02c() {
  const {
    phase1Ranking,
    activePlayers,
    availableThemes,
    themeAssignments: savedAssignments,
    setThemeAssignments,
    initPhase2Questions,
    goTo,
  } = useGameStore()

  // assignments: { playerName: [{ theme, from }] }
  const [assignments, setAssignments] = useState(() => {
    if (savedAssignments && Object.keys(savedAssignments).length > 0) {
      return Object.fromEntries(
        Object.entries(savedAssignments).map(([p, themes]) =>
          [p, themes.map(t => typeof t === 'string' ? { theme: t, from: 'self' } : t)]
        )
      )
    }
    return Object.fromEntries(phase1Ranking.map(p => [p, []]))
  })

  // Build Round B steps from current assignments
  const buildRoundB = (currentAssignments) => {
    const steps = []
    for (const p of phase1Ranking) {
      const have = (currentAssignments[p] || []).length
      for (let i = have; i < 3; i++) {
        steps.push({ player: p, action: 'self', round: 'B' })
      }
    }
    return steps
  }

  // Initial queue: Round A (fixed) + Round B (computed from initial assignments)
  const [queue, setQueue] = useState(() => {
    const roundA = phase1Ranking.flatMap(p => [
      { player: p, action: 'self', round: 'A' },
      { player: p, action: 'other', round: 'A' },
    ])
    return [...roundA, ...buildRoundB(Object.fromEntries(phase1Ranking.map(p => [p, []])))]
  })

  const [selectedTheme, setSelectedTheme] = useState(null)

  const step = queue[0] || null
  const everyoneHas3 = phase1Ranking.every(p => (assignments[p] || []).length >= 3)

  // Pool of unassigned themes
  const assignedSet = new Set(Object.values(assignments).flat().map(e => e.theme))
  const poolThemes = availableThemes.filter(t => !assignedSet.has(t))

  const receivedFromOthers = (player, currentAssignments) =>
    (currentAssignments[player] || []).filter(e => e.from !== 'self' && e.from !== player).length

  const canAssignTo = (targetPlayer) => {
    if (!step) return false
    if (step.action === 'self') return targetPlayer === step.player
    if (step.action === 'other') {
      if (targetPlayer === step.player) return false
      if (step.round === 'A' && receivedFromOthers(targetPlayer, assignments) >= 2) return false
      if ((assignments[targetPlayer] || []).length >= 3) return false
      return true
    }
    return false
  }

  const handleConfirm = (targetPlayer) => {
    if (!selectedTheme || !canAssignTo(targetPlayer)) return

    const from = step.action === 'self' ? 'self' : step.player
    const newAssignments = {
      ...assignments,
      [targetPlayer]: [...(assignments[targetPlayer] || []), { theme: selectedTheme, from }],
    }
    setAssignments(newAssignments)
    setSelectedTheme(null)

    // Consume the current step
    const rest = queue.slice(1)

    // After every step, rebuild Round B fresh from new state
    // (this handles the case where receiving a theme in Round A reduces someone's Round B needs)
    const isLastRoundAStep = rest.length === 0 || rest[0]?.round === 'B'
    const freshRoundB = buildRoundB(newAssignments)

    // Determine new queue:
    // - If we're still in Round A and next step is also Round A, keep it
    // - Otherwise, use freshly built Round B
    let newQueue
    if (rest.length > 0 && rest[0].round === 'A') {
      // Still in Round A — keep Round A steps, but replace any Round B tail with fresh one
      const roundARemaining = rest.filter(s => s.round === 'A')
      newQueue = [...roundARemaining, ...freshRoundB]
    } else {
      // Transitioning to or already in Round B — use fresh Round B only
      newQueue = freshRoundB
    }

    setQueue(newQueue)
  }

  const handleLaunch = () => {
    const simple = Object.fromEntries(
      Object.entries(assignments).map(([p, entries]) => [p, entries.map(e => e.theme)])
    )
    setThemeAssignments(simple)
    initPhase2Questions()
    goTo('02e')
  }

  const consigne = step
    ? step.action === 'self'
      ? `${step.player}, choisis un thème pour toi`
      : `${step.player}, attribue un thème à quelqu'un d'autre`
    : everyoneHas3
      ? 'Attribution terminée ✓'
      : 'Attribution en cours…'

  const orderedPlayers = [...phase1Ranking]

  return (
    <div className="screen diagonal-bg" style={{ justifyContent: 'flex-start', paddingTop: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 1100, padding: '0 32px', gap: 16, height: '100%' }}>

        {/* Consigne */}
        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 'var(--radius-md)', padding: '12px 24px', textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--yellow)' }}>
            {consigne}
          </span>
          {selectedTheme && (
            <span style={{ marginLeft: 12, fontFamily: 'var(--font-condensed)', fontSize: '1rem', color: 'var(--white-secondary)' }}>
              — <strong style={{ color: 'var(--white)' }}>{selectedTheme}</strong> sélectionné·e
            </span>
          )}
          {step && (
            <span style={{ marginLeft: 12, fontFamily: 'var(--font-condensed)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Round {step.round}
            </span>
          )}
        </div>

        {/* Theme pool */}
        <div>
          <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--white-secondary)', marginBottom: 8 }}>
            Thèmes disponibles
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {poolThemes.map(theme => (
              <button
                key={theme}
                className={`theme-card${selectedTheme === theme ? ' selected' : ''}`}
                onClick={() => setSelectedTheme(prev => prev === theme ? null : theme)}
              >
                {theme}
              </button>
            ))}
            {poolThemes.length === 0 && (
              <span style={{ color: 'var(--white-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
                Tous les thèmes ont été attribués
              </span>
            )}
          </div>
        </div>

        {/* Player containers */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${orderedPlayers.length}, 1fr)`, gap: 10, flex: 1 }}>
          {orderedPlayers.map(player => {
            const playerThemes = assignments[player] || []
            const isActive = step?.player === player
            const canReceive = !!selectedTheme && canAssignTo(player)

            return (
              <div
                key={player}
                onClick={() => canReceive && handleConfirm(player)}
                style={{
                  padding: '12px 14px', borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${canReceive ? 'var(--yellow)' : isActive ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  background: canReceive ? 'rgba(212,175,55,0.08)' : 'var(--bg-light)',
                  cursor: canReceive ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  display: 'flex', flexDirection: 'column', gap: 6,
                  opacity: (!selectedTheme || canReceive) ? 1 : 0.5,
                }}
              >
                <div style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.05em', color: isActive ? 'var(--yellow)' : 'var(--white)', marginBottom: 4 }}>
                  {player}
                </div>
                {[0, 1, 2].map(slotIndex => {
                  const entry = playerThemes[slotIndex]
                  return (
                    <div key={slotIndex} style={{
                      padding: '7px 10px', borderRadius: 'var(--radius-sm)',
                      border: `1px ${entry ? 'solid rgba(212,175,55,0.25)' : 'dashed rgba(255,255,255,0.12)'}`,
                      background: entry ? 'rgba(212,175,55,0.07)' : 'rgba(255,255,255,0.02)',
                      fontSize: '0.78rem', fontFamily: 'var(--font-condensed)',
                      color: entry ? 'var(--white)' : 'rgba(255,255,255,0.2)',
                      minHeight: 32, display: 'flex', alignItems: 'center',
                    }}>
                      {entry ? entry.theme : `Thème ${slotIndex + 1}`}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Launch — only when truly everyone has 3 themes */}
        {everyoneHas3 && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 16 }}>
            <button className="btn btn-primary" style={{ minWidth: 260 }} onClick={handleLaunch}>
              Lancer le premier thème →
            </button>
          </div>
        )}
      </div>
      <AdminControls />
      <Watermark />
    </div>
  )
}
