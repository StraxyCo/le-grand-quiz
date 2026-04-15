import React from 'react'
import { Modal } from './Modal'
import { useGameStore } from '../../store/gameStore'

export function ScoreboardModal({ onClose }) {
  const { playerOrder, getCurrentScores } = useGameStore()
  const scores = getCurrentScores()

  const ranked = [...playerOrder].sort((a, b) => (scores[b] || 0) - (scores[a] || 0))

  return (
    <Modal onClose={onClose}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2rem',
        color: 'var(--yellow)',
        textAlign: 'center',
        marginBottom: 24,
        letterSpacing: '0.05em',
      }}>
        Classement
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ranked.map((player, i) => (
          <div key={player} className="rank-row" style={{
            animationDelay: `${i * 0.06}s`,
          }}>
            <span className="rank-number">{i + 1}</span>
            <span className="rank-name">{player}</span>
            <span className="rank-score">{scores[player] || 0} pts</span>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button className="btn btn-secondary" onClick={onClose} style={{ minWidth: 140 }}>
          Fermer
        </button>
      </div>
    </Modal>
  )
}
