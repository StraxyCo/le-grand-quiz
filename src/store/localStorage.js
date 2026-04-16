const STATE_KEY = 'lgq_state'
const SNAPSHOT_PREFIX = 'lgq_snap_'

export function saveState(state) {
  try {
    // Don't persist functions or large raw data in the base key
    const toSave = {
      testMode: state.testMode,
      currentScreen: state.currentScreen,
      screenHistory: state.screenHistory,
      activePlayers: state.activePlayers,
      playerOrder: state.playerOrder,
      phase1Questions: state.phase1Questions,
      phase1Answers: state.phase1Answers,
      phase1CurrentPlayerIndex: state.phase1CurrentPlayerIndex,
      phase1CurrentQuestionIndex: state.phase1CurrentQuestionIndex,
      phase1Ranking: state.phase1Ranking,
      availableThemes: state.availableThemes,
      themeAssignments: state.themeAssignments,
      phase2Questions: state.phase2Questions,
      phase2Answers: state.phase2Answers,
      phase2Order: state.phase2Order,
      phase2CurrentIndex: state.phase2CurrentIndex,
      phase2Ranking: state.phase2Ranking,
      finalists: state.finalists,
      phase3Questions: state.phase3Questions,
      phase3Answers: state.phase3Answers,
      phase3CurrentQuestionIndex: state.phase3CurrentQuestionIndex,
      phase3CurrentPlayerStep: state.phase3CurrentPlayerStep,
      finalWinner: state.finalWinner,
      tiebreakerQuestion: state.tiebreakerQuestion,
      tiebreakerContext: state.tiebreakerContext,
      currentScores: state.currentScores,
    }
    localStorage.setItem(STATE_KEY, JSON.stringify(toSave))
  } catch (e) {
    console.warn('localStorage save failed', e)
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export function clearState() {
  try {
    // Clear main state
    localStorage.removeItem(STATE_KEY)
    // Clear all snapshots
    const keys = Object.keys(localStorage).filter(k => k.startsWith(SNAPSHOT_PREFIX))
    keys.forEach(k => localStorage.removeItem(k))
  } catch (e) {
    console.warn('localStorage clear failed', e)
  }
}

export function saveSnapshot(screenId, state) {
  try {
    const key = `${SNAPSHOT_PREFIX}${screenId}`
    const snap = {
      currentScreen: screenId,
      screenHistory: state.screenHistory,
      activePlayers: state.activePlayers,
      playerOrder: state.playerOrder,
      phase1Questions: state.phase1Questions,
      phase1Answers: state.phase1Answers,
      phase1CurrentPlayerIndex: state.phase1CurrentPlayerIndex,
      phase1CurrentQuestionIndex: state.phase1CurrentQuestionIndex,
      phase1Ranking: state.phase1Ranking,
      availableThemes: state.availableThemes,
      themeAssignments: state.themeAssignments,
      phase2Questions: state.phase2Questions,
      phase2Answers: state.phase2Answers,
      phase2Order: state.phase2Order,
      phase2CurrentIndex: state.phase2CurrentIndex,
      phase2Ranking: state.phase2Ranking,
      finalists: state.finalists,
      phase3Questions: state.phase3Questions,
      phase3Answers: state.phase3Answers,
      phase3CurrentQuestionIndex: state.phase3CurrentQuestionIndex,
      phase3CurrentPlayerStep: state.phase3CurrentPlayerStep,
      finalWinner: state.finalWinner,
      tiebreakerQuestion: state.tiebreakerQuestion,
      tiebreakerContext: state.tiebreakerContext,
      currentScores: state.currentScores,
    }
    localStorage.setItem(key, JSON.stringify(snap))
  } catch (e) {
    console.warn('Snapshot save failed', e)
  }
}

export function loadSnapshot(screenId) {
  try {
    const key = `${SNAPSHOT_PREFIX}${screenId}`
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}
