import React from 'react'
import { useGameStore } from '../../store/gameStore'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

const ALL_PLAYERS = ['Amandine', 'Catherine', 'Hélène', 'Léa', 'Matthieu', 'Nicolas']

export function Screen00b() {
  const { activePlayers, togglePlayer, goTo } = useGameStore()

  const canStart = activePlayers.length >= 2

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 560,
        padding: '0 24px',
        gap: 32,
      }}>

        {/* Header */}
        <div className="anim-fade-in" style={{ textAlign: 'center' }}>
          <div className="phase-badge" style={{ marginBottom: 14 }}>Participants</div>
          <h1 className="text-condensed" style={{ fontSize: '2.8rem', color: 'var(--white)' }}>
            Qui joue ce soir ?
          </h1>
        </div>

        {/* Player list */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          width: '100%',
        }}>
          {ALL_PLAYERS.map((player, i) => {
            const active = activePlayers.includes(player)
            return (
              <div
                key={player}
                className={`player-toggle anim-slide-up${active ? ' active' : ''}`}
                style={{ animationDelay: `${i * 0.06}s` }}
                onClick={() => togglePlayer(player)}
              >
                <span className="player-toggle-name">{player}</span>
                <div className={`toggle-pip${active ? ' active' : ''}`} />
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="anim-fade-in stagger-4" style={{ textAlign: 'center' }}>
          {activePlayers.length < 2 && (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              color: 'var(--red)',
              marginBottom: 16,
            }}>
              Sélectionne au moins 2 participant·es
            </p>
          )}
          <button
            className="btn btn-primary"
            style={{ minWidth: 240 }}
            disabled={!canStart}
            onClick={() => goTo('00c')}
          >
            Commencer →
          </button>
        </div>
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}
