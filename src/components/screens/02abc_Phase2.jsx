// ─── 02a Phase 2 Title ────────────────────────────────────────────────────
import React, { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

export function Screen02a() {
  const { goTo } = useGameStore()

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
        <div className="phase-badge anim-fade-in">Phase 02</div>

        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{ fontSize: '5rem', lineHeight: 1 }}>
          Les Thèmes
        </h1>

        <div className="separator anim-fade-in stagger-2" style={{ maxWidth: 360 }}>✦</div>

        <div className="anim-fade-in stagger-3" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 540,
        }}>
          {[
            'Les thèmes sont dévoilés un par un',
            'Dans l\'ordre du classement, chacun·e s\'attribue un thème et en donne un à quelqu\'un d\'autre',
            'Puis chacun·e joue les questions de ses thèmes — 4 questions par thème',
            'Les 2 premiers au cumulé accèdent à la Finale !',
          ].map((rule, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: 'var(--white-secondary)',
              textAlign: 'left',
            }}>
              <span style={{ color: 'var(--yellow)', fontSize: '0.6rem', marginTop: 6, flexShrink: 0 }}>◆</span>
              {rule}
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary anim-slide-up stagger-4"
          style={{ minWidth: 260, marginTop: 8 }}
          onClick={() => goTo('02b')}
        >
          Dévoiler les thèmes →
        </button>
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}

// ─── 02b Theme Reveal ─────────────────────────────────────────────────────
export function Screen02b() {
  const { availableThemes, goTo } = useGameStore()
  const [revealed, setRevealed] = useState(0)
  const allRevealed = revealed >= availableThemes.length

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 860,
        padding: '0 40px',
        gap: 24,
      }}>

        <div className="phase-badge anim-fade-in">Les thèmes</div>
        <h2 className="text-condensed anim-fade-in stagger-1" style={{ fontSize: '2rem' }}>
          Découvrez les thèmes disponibles
        </h2>

        {/* Theme grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 10,
          width: '100%',
        }}>
          {availableThemes.map((theme, i) => (
            <div key={i} style={{
              padding: '14px 12px',
              borderRadius: 'var(--radius-sm)',
              border: `1.5px solid ${i < revealed ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.08)'}`,
              background: i < revealed ? 'rgba(212,175,55,0.07)' : 'rgba(10,37,68,0.5)',
              textAlign: 'center',
              fontFamily: 'var(--font-condensed)',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: i < revealed ? 'var(--white)' : 'transparent',
              transition: 'all 0.35s var(--ease-out)',
              minHeight: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {i < revealed ? theme : '?'}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {!allRevealed && (
            <button
              className="btn btn-primary"
              style={{ minWidth: 200 }}
              onClick={() => setRevealed(r => r + 1)}
            >
              Révéler un thème
            </button>
          )}
          {allRevealed && (
            <button
              className="btn btn-primary"
              style={{ minWidth: 220 }}
              onClick={() => goTo('02c')}
            >
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

// ─── 02c Theme Attribution ────────────────────────────────────────────────
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

  // Local assignment state: { playerName: [theme, ...] }
  const [assignments, setAssignments] = useState(() => {
    if (savedAssignments && Object.keys(savedAssignments).length > 0) return savedAssignments
    return Object.fromEntries(activePlayers.map(p => [p, []]))
  })

  // Attribution steps: for each player in ranking order → 'self' then 'other'
  const steps = phase1Ranking.flatMap(p => [
    { player: p, action: 'self' },
    { player: p, action: 'other' },
  ])
  // Then tour 2: players who need more themes
  const tour2Steps = phase1Ranking
    .filter(p => (assignments[p]?.length || 0) < 3)
    .flatMap(p => Array(3 - (assignments[p]?.length || 0)).fill({ player: p, action: 'self' }))

  const allSteps = [...steps, ...tour2Steps]

  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTheme, setSelectedTheme] = useState(null)
  const [allDone, setAllDone] = useState(false)

  const step = allSteps[currentStep]
  const assignedThemes = new Set(Object.values(assignments).flat())
  const poolThemes = availableThemes.filter(t => !assignedThemes.has(t))

  // Max received check
  const receivedCounts = {}
  activePlayers.forEach(p => { receivedCounts[p] = 0 })
  // Count themes received from others (not self-chosen) — simplified: just count total
  Object.entries(assignments).forEach(([p, themes]) => {
    receivedCounts[p] = themes.length
  })

  const canAssignTo = (targetPlayer) => {
    if (!step) return false
    if (step.action === 'other' && targetPlayer === step.player) return false
    // Max 2 themes from others in tour 1 (simplified: max 3 total in tour 1)
    const currentCount = (assignments[targetPlayer] || []).length
    const tour1Limit = currentStep < steps.length ? 2 : 3
    return currentCount < tour1Limit
  }

  const handleThemeClick = (theme) => {
    if (!step) return
    setSelectedTheme(prev => prev === theme ? null : theme)
  }

  const handleConfirm = (targetPlayer) => {
    if (!selectedTheme || !canAssignTo(targetPlayer)) return

    const newAssignments = {
      ...assignments,
      [targetPlayer]: [...(assignments[targetPlayer] || []), selectedTheme],
    }
    setAssignments(newAssignments)
    setSelectedTheme(null)

    const nextStep = currentStep + 1
    if (nextStep >= allSteps.length) {
      setAllDone(true)
    } else {
      setCurrentStep(nextStep)
    }
  }

  const handleLaunch = () => {
    setThemeAssignments(assignments)
    initPhase2Questions()
    goTo('02e')
  }

  const consigne = step
    ? step.action === 'self'
      ? `${step.player} choisit un thème pour lui·elle`
      : `${step.player} attribue un thème à quelqu'un d'autre`
    : 'Attribution terminée'

  return (
    <div className="screen diagonal-bg" style={{ justifyContent: 'flex-start', paddingTop: 24 }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: 1100,
        padding: '0 32px',
        gap: 20,
        height: '100%',
      }}>

        {/* Consigne */}
        <div style={{
          background: 'rgba(212,175,55,0.08)',
          border: '1px solid rgba(212,175,55,0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 24px',
          textAlign: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: '1.3rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: 'var(--yellow)',
          }}>
            {consigne}
          </span>
          {selectedTheme && (
            <span style={{
              marginLeft: 12,
              fontFamily: 'var(--font-condensed)',
              fontSize: '1rem',
              color: 'var(--white-secondary)',
            }}>
              — Thème sélectionné : <strong style={{ color: 'var(--white)' }}>{selectedTheme}</strong>
            </span>
          )}
        </div>

        {/* Themes pool */}
        <div>
          <div style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--white-secondary)',
            marginBottom: 10,
          }}>
            Thèmes disponibles
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            {poolThemes.map(theme => (
              <button
                key={theme}
                className={`theme-card${selectedTheme === theme ? ' selected' : ''}`}
                onClick={() => handleThemeClick(theme)}
              >
                {theme}
              </button>
            ))}
            {poolThemes.length === 0 && (
              <span style={{ color: 'var(--white-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
                Tous les thèmes sont attribués
              </span>
            )}
          </div>
        </div>

        {/* Player containers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${activePlayers.length}, 1fr)`,
          gap: 10,
          flex: 1,
        }}>
          {activePlayers.map(player => {
            const playerThemes = assignments[player] || []
            const isTarget = step?.action === 'other' && player !== step?.player
            const isSelf = step?.action === 'self' && player === step?.player
            const canReceive = selectedTheme && canAssignTo(player) && step && (
              (step.action === 'self' && player === step.player) ||
              (step.action === 'other' && player !== step.player)
            )

            return (
              <div
                key={player}
                onClick={() => canReceive && handleConfirm(player)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${
                    canReceive ? 'var(--yellow)' :
                    (isSelf || isTarget) ? 'rgba(212,175,55,0.3)' :
                    'rgba(255,255,255,0.08)'
                  }`,
                  background: canReceive ? 'rgba(212,175,55,0.08)' : 'var(--bg-light)',
                  cursor: canReceive ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: isSelf ? 'var(--yellow)' : 'var(--white)',
                }}>
                  {player}
                </div>
                {[0, 1, 2].map(slotIndex => (
                  <div key={slotIndex} style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px dashed rgba(255,255,255,0.15)',
                    background: playerThemes[slotIndex]
                      ? 'rgba(212,175,55,0.08)'
                      : 'rgba(255,255,255,0.02)',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-condensed)',
                    color: playerThemes[slotIndex] ? 'var(--white)' : 'rgba(255,255,255,0.2)',
                    minHeight: 36,
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {playerThemes[slotIndex] || `Thème ${slotIndex + 1}`}
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Launch button */}
        {allDone && (
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
