import { create } from 'zustand'
import { saveState, loadState, clearState, saveSnapshot, loadSnapshot } from './localStorage'

// ─── Players ───────────────────────────────────────────────────────────────
const ALL_PLAYERS = ['Amandine', 'Catherine', 'Hélène', 'Léa', 'Matthieu', 'Nicolas']

// ─── Initial State ──────────────────────────────────────────────────────────
const INITIAL_STATE = {
  // Mode
  testMode: false,

  // Navigation
  currentScreen: '00a',
  screenHistory: [],

  // Setup
  activePlayers: [...ALL_PLAYERS],
  playerOrder: [],       // order after 00d draw
  questions: null,       // loaded from JSON
  themes: null,          // loaded from JSON
  validationError: null,

  // Phase 1
  phase1Questions: {},   // { playerName: [questionObj, ...] }
  phase1Answers: {},     // { playerName: [{ questionId, mode, correct, points }, ...] }
  phase1CurrentPlayerIndex: 0,
  phase1CurrentQuestionIndex: 0,
  phase1Ranking: [],     // ordered list of player names after phase 1

  // Phase 2
  availableThemes: [],   // theme names available for attribution
  themeAssignments: {},  // { playerName: [themeName, ...] }
  phase2Questions: {},   // { playerName: { themeName: [questionObj, ...] } }
  phase2Answers: {},     // { playerName: { themeName: [{ questionId, mode, correct, points }] } }
  phase2Order: [],       // playing order (reverse of phase1Ranking)
  phase2CurrentIndex: 0, // index in the full cycle list
  phase2Ranking: [],     // cumulative ranking after phase 2
  finalists: [],         // [first, second]

  // Phase 3
  phase3Questions: [],   // 8 questions in order
  phase3Answers: [],     // [{ questionId, player1Answer, player2Answer, player1Correct, player2Correct }]
  phase3CurrentQuestionIndex: 0,
  phase3CurrentPlayerStep: 'player1', // 'player1' | 'player2'
  finalWinner: null,

  // Tiebreaker
  tiebreakerQuestion: null,
  tiebreakerContext: null, // 'phase2' | 'phase3'

  // Scoreboard (computed, refreshed on demand)
  currentScores: {},     // { playerName: totalPoints }
}

// ─── Store ──────────────────────────────────────────────────────────────────
export const useGameStore = create((set, get) => ({
  ...INITIAL_STATE,

  // ── Load persisted state on boot ──────────────────────────────────────────
  hydrate: () => {
    const saved = loadState()
    if (saved) set(saved)
  },

  // ── Persist current state ─────────────────────────────────────────────────
  persist: () => {
    const state = get()
    saveState(state)
  },

  // ── Navigate to screen ────────────────────────────────────────────────────
  goTo: (screen) => {
    set(state => {
      const snapshot = { ...state }
      saveSnapshot(state.currentScreen, snapshot)
      return {
        currentScreen: screen,
        screenHistory: [...state.screenHistory, state.currentScreen],
      }
    })
    get().persist()
  },

  // ── Go back to previous screen ────────────────────────────────────────────
  goBack: () => {
    const { screenHistory, currentScreen } = get()
    if (screenHistory.length === 0) return

    const prev = screenHistory[screenHistory.length - 1]
    const snapshot = loadSnapshot(prev)

    if (snapshot) {
      set({ ...snapshot, currentScreen: prev })
    } else {
      set(state => ({
        currentScreen: prev,
        screenHistory: state.screenHistory.slice(0, -1),
      }))
    }
    get().persist()
  },

  // ── Reset everything ──────────────────────────────────────────────────────
  reset: () => {
    clearState()
    set(INITIAL_STATE)
  },

  // ── Toggle test mode ──────────────────────────────────────────────────────
  setTestMode: (val) => set({ testMode: val }),

  // ── Load JSON data ────────────────────────────────────────────────────────
  setData: (questions, themes) => {
    set({ questions, themes })
    get().persist()
  },

  setValidationError: (err) => set({ validationError: err }),

  // ── 00b: Toggle active player ─────────────────────────────────────────────
  togglePlayer: (name) => {
    set(state => {
      const active = state.activePlayers.includes(name)
        ? state.activePlayers.filter(p => p !== name)
        : [...state.activePlayers, name]
      return { activePlayers: active }
    })
    get().persist()
  },

  // ── 00d: Set player order after draw ─────────────────────────────────────
  setPlayerOrder: (order) => {
    set({ playerOrder: order })
    get().persist()
  },

  // ── Phase 1: assign questions to players ─────────────────────────────────
  initPhase1: () => {
    const { questions, playerOrder } = get()
    const pool = questions.filter(q => q.phase === 'Phase01')
    const used = new Set()
    const assignments = {}

    for (const player of playerOrder) {
      const available = pool.filter(q => !used.has(q.id))
      const picks = shuffleArray(available).slice(0, 3)
      picks.forEach(q => used.add(q.id))
      assignments[player] = picks
    }

    set({
      phase1Questions: assignments,
      phase1Answers: Object.fromEntries(playerOrder.map(p => [p, []])),
      phase1CurrentPlayerIndex: 0,
      phase1CurrentQuestionIndex: 0,
    })
    get().persist()
  },

  // ── Phase 1: record answer ────────────────────────────────────────────────
  recordPhase1Answer: (playerName, questionId, mode, correct) => {
    const pts = correct ? { Duo: 1, Carré: 2, Cash: 4 }[mode] : 0
    set(state => {
      const updatedAnswers = {
        ...state.phase1Answers,
        [playerName]: [
          ...(state.phase1Answers[playerName] || []),
          { questionId, mode, correct, points: pts },
        ],
      }
      // Recompute live scores
      const currentScores = {}
      state.playerOrder.forEach(p => {
        currentScores[p] = (updatedAnswers[p] || []).reduce((s, a) => s + a.points, 0)
      })
      return { phase1Answers: updatedAnswers, currentScores }
    })
    get().persist()
  },

  // ── Phase 1: advance to next question/player ──────────────────────────────
  advancePhase1: () => {
    const { phase1CurrentPlayerIndex, phase1CurrentQuestionIndex, playerOrder, phase1Questions } = get()
    const player = playerOrder[phase1CurrentPlayerIndex]
    const numQs = phase1Questions[player]?.length || 3

    if (phase1CurrentQuestionIndex + 1 < numQs) {
      set({ phase1CurrentQuestionIndex: phase1CurrentQuestionIndex + 1 })
    } else if (phase1CurrentPlayerIndex + 1 < playerOrder.length) {
      set({
        phase1CurrentPlayerIndex: phase1CurrentPlayerIndex + 1,
        phase1CurrentQuestionIndex: 0,
      })
    }
    get().persist()
  },

  isPhase1Done: () => {
    const { phase1CurrentPlayerIndex, phase1CurrentQuestionIndex, playerOrder, phase1Questions } = get()
    const lastPlayerIndex = playerOrder.length - 1
    const lastPlayer = playerOrder[lastPlayerIndex]
    const lastQIndex = (phase1Questions[lastPlayer]?.length || 3) - 1
    return phase1CurrentPlayerIndex >= lastPlayerIndex && phase1CurrentQuestionIndex >= lastQIndex
  },

  // ── Phase 1: compute ranking ──────────────────────────────────────────────
  computePhase1Ranking: () => {
    const { playerOrder, phase1Answers } = get()
    const scores = computeScores(phase1Answers)
    const ranking = rankPlayers(playerOrder, scores)
    set({ phase1Ranking: ranking })
    get().persist()
    return ranking
  },

  // ── Phase 2: init available themes ───────────────────────────────────────
  initPhase2Themes: () => {
    const { themes, activePlayers } = get()
    const absent = ALL_PLAYERS.filter(p => !activePlayers.includes(p))

    let assigned = [...themes.assigned]
    let generic = [...themes.generic]

    // Remove assigned themes for absent players
    const removedAssigned = []
    assigned = assigned.filter(t => {
      if (absent.includes(t.player)) {
        removedAssigned.push(t)
        return false
      }
      return true
    })

    // Remove one generic theme per absent player
    const shuffledGeneric = shuffleArray(generic)
    const numToRemove = absent.length
    generic = shuffledGeneric.slice(numToRemove)

    const allThemes = [
      ...assigned.map(t => t.name),
      ...generic,
    ]

    set({ availableThemes: shuffleArray(allThemes) })
    get().persist()
  },

  // ── Phase 2: set theme assignments ───────────────────────────────────────
  setThemeAssignments: (assignments) => {
    set({ themeAssignments: assignments })
    get().persist()
  },

  // ── Phase 2: init questions per theme per player ─────────────────────────
  initPhase2Questions: () => {
    const { questions, themeAssignments } = get()
    const phase2Pool = questions.filter(q => q.phase === 'Phase02')
    const byTheme = {}
    phase2Pool.forEach(q => {
      if (!byTheme[q.theme]) byTheme[q.theme] = []
      byTheme[q.theme].push(q)
    })

    const playerQuestions = {}
    for (const [player, playerThemes] of Object.entries(themeAssignments)) {
      playerQuestions[player] = {}
      for (const theme of playerThemes) {
        playerQuestions[player][theme] = byTheme[theme] || []
      }
    }

    const phase2Order = buildPhase2Order(get().phase1Ranking, themeAssignments)

    set({
      phase2Questions: playerQuestions,
      phase2Answers: Object.fromEntries(
        Object.keys(themeAssignments).map(p => [p, {}])
      ),
      phase2Order,
      phase2CurrentIndex: 0,
    })
    get().persist()
  },

  // ── Phase 2: record answer ────────────────────────────────────────────────
  recordPhase2Answer: (playerName, themeName, questionId, mode, correct) => {
    const pts = correct ? { Duo: 1, Carré: 2, Cash: 4 }[mode] : 0
    set(state => {
      const playerAnswers = { ...state.phase2Answers[playerName] }
      const themeAnswers = playerAnswers[themeName] || []
      playerAnswers[themeName] = [...themeAnswers, { questionId, mode, correct, points: pts }]
      return {
        phase2Answers: { ...state.phase2Answers, [playerName]: playerAnswers }
      }
    })
    get().persist()
  },

  advancePhase2: () => {
    set(state => ({ phase2CurrentIndex: state.phase2CurrentIndex + 1 }))
    get().persist()
  },

  // ── Phase 2: compute ranking ──────────────────────────────────────────────
  computePhase2Ranking: () => {
    const { playerOrder, phase1Answers, phase2Answers } = get()
    const p1Scores = computeScores(phase1Answers)
    const p2Scores = computePhase2Scores(phase2Answers)
    const combined = {}
    playerOrder.forEach(p => {
      combined[p] = (p1Scores[p] || 0) + (p2Scores[p] || 0)
    })
    const ranking = rankPlayers(playerOrder, combined)
    set({ phase2Ranking: ranking, currentScores: combined })
    get().persist()
    return ranking
  },

  setFinalists: (finalists) => {
    set({ finalists })
    get().persist()
  },

  // ── Phase 3: init questions ───────────────────────────────────────────────
  initPhase3: () => {
    const { questions } = get()
    const pool = questions.filter(q => q.phase === 'Phase03').slice(0, 8)
    set({
      phase3Questions: pool,
      phase3Answers: [],
      phase3CurrentQuestionIndex: 0,
      phase3CurrentPlayerStep: 'player1',
    })
    get().persist()
  },

  // ── Phase 3: record player answer ─────────────────────────────────────────
  recordPhase3Answer: (playerStep, answer) => {
    const { phase3CurrentQuestionIndex, phase3Answers } = get()
    const existing = phase3Answers[phase3CurrentQuestionIndex] || {}

    set(state => {
      const updated = [...state.phase3Answers]
      updated[phase3CurrentQuestionIndex] = {
        ...existing,
        [`${playerStep}Answer`]: answer,
      }
      return { phase3Answers: updated, phase3CurrentPlayerStep: 'player2' }
    })
    get().persist()
  },

  advancePhase3Question: () => {
    set(state => ({
      phase3CurrentQuestionIndex: state.phase3CurrentQuestionIndex + 1,
      phase3CurrentPlayerStep: 'player1',
    }))
    get().persist()
  },

  // ── Phase 3: set correctness ──────────────────────────────────────────────
  setPhase3Correctness: (questionIndex, player, correct) => {
    set(state => {
      const updated = [...state.phase3Answers]
      updated[questionIndex] = {
        ...updated[questionIndex],
        [`${player}Correct`]: correct,
      }
      return { phase3Answers: updated }
    })
    get().persist()
  },

  setFinalWinner: (name) => {
    set({ finalWinner: name })
    get().persist()
  },

  // ── Tiebreaker ─────────────────────────────────────────────────────────────
  initTiebreaker: (context) => {
    const { questions } = get()
    const pool = questions.filter(q => q.phase === 'AuPlusProche')
    const q = pool[Math.floor(Math.random() * pool.length)]
    set({ tiebreakerQuestion: q, tiebreakerContext: context })
    get().persist()
  },

  // ── Current scores helper ─────────────────────────────────────────────────
  getCurrentScores: () => {
    const { playerOrder, phase1Answers, phase2Answers } = get()
    const p1 = computeScores(phase1Answers)
    const p2 = computePhase2Scores(phase2Answers)
    const combined = {}
    playerOrder.forEach(p => {
      combined[p] = (p1[p] || 0) + (p2[p] || 0)
    })
    return combined
  },
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function computeScores(answersMap) {
  const scores = {}
  for (const [player, answers] of Object.entries(answersMap)) {
    scores[player] = (answers || []).reduce((sum, a) => sum + (a.points || 0), 0)
  }
  return scores
}

function computePhase2Scores(answersMap) {
  const scores = {}
  for (const [player, themes] of Object.entries(answersMap)) {
    scores[player] = Object.values(themes || {}).flat().reduce((sum, a) => sum + (a.points || 0), 0)
  }
  return scores
}

function rankPlayers(players, scores) {
  return [...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0))
}

// Build full question order for phase 2:
// reverse of phase1Ranking, cycle through 3 themes
function buildPhase2Order(phase1Ranking, themeAssignments) {
  const reversed = [...phase1Ranking].reverse()
  const order = []
  const maxThemes = 3
  for (let t = 0; t < maxThemes; t++) {
    for (const player of reversed) {
      const themes = themeAssignments[player] || []
      if (themes[t]) {
        order.push({ player, theme: themes[t], themeIndex: t })
      }
    }
  }
  return order
}
