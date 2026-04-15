import React, { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { ConfirmModal } from '../ui/Modal'
import { ScoreboardModal } from '../ui/Scoreboard'
import { ALL_SCREENS, makePlaceholderState } from '../../utils/placeholders'

export function AdminControls() {
  const { goBack, reset, testMode, screenHistory, activePlayers } = useGameStore()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showScoreboard, setShowScoreboard] = useState(false)

  const handleReset = () => {
    reset()
    setShowResetConfirm(false)
  }

  return (
    <>
      <div className="admin-bar">
        {screenHistory.length > 0 && (
          <button className="btn btn-ghost" onClick={goBack} title="Écran précédent">
            ← Précédent
          </button>
        )}
        <button className="btn btn-ghost" onClick={() => setShowScoreboard(true)} title="Classement">
          📊
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => setShowResetConfirm(true)}
          title="Relancer"
          style={{ color: 'rgba(214,85,72,0.7)' }}
        >
          ↺
        </button>
      </div>

      {showResetConfirm && (
        <ConfirmModal
          message="Relancer le jeu ? Toute la progression sera effacée."
          onConfirm={handleReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      {showScoreboard && (
        <ScoreboardModal onClose={() => setShowScoreboard(false)} />
      )}
    </>
  )
}

export function AdminNavMenu() {
  const { goTo, activePlayers, testMode } = useGameStore()

  if (!testMode) return null

  const handleChange = (e) => {
    const screen = e.target.value
    if (!screen) return

    // Inject placeholder data before navigating to mid-game screens
    const midGameScreens = ['01b','01c','01d','01e','01f','02a','02b','02c','02e','02f','02g','02h','03a','03b','03c','03d','03e','03f','03g','03h','03i','04a']
    if (midGameScreens.includes(screen)) {
      const placeholder = makePlaceholderState(activePlayers)
      useGameStore.setState(placeholder)
    }

    goTo(screen)
    e.target.value = ''
  }

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 80, zIndex: 80 }}>
      <select
        className="admin-nav-select"
        defaultValue=""
        onChange={handleChange}
      >
        <option value="" disabled>🧪 Naviguer…</option>
        {ALL_SCREENS.map(s => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
    </div>
  )
}
