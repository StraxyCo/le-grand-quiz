// Generic placeholder data injected in test mode

export const PLACEHOLDER_PLAYERS = ['Joueur 1', 'Joueur 2', 'Joueur 3', 'Joueur 4', 'Joueur 5', 'Joueur 6']

export const PLACEHOLDER_THEMES = [
  'Thème A', 'Thème B', 'Thème C',
  'Thème D', 'Thème E', 'Thème F',
  'Thème G', 'Thème H', 'Thème I',
  'Thème J', 'Thème K', 'Thème L',
  'Thème M', 'Thème N', 'Thème O',
  'Thème P', 'Thème Q', 'Thème R',
]

function makeQuestion(id, phase, theme) {
  return {
    id,
    phase,
    theme,
    question: `Question de test — ${id}`,
    media: null,
    answer: 'Bonne réponse',
    wrong1: 'Mauvaise A',
    wrong2: 'Mauvaise B',
    wrong3: 'Mauvaise C',
    note: null,
  }
}

export function makePlaceholderState(activePlayers) {
  const players = activePlayers?.length ? activePlayers : PLACEHOLDER_PLAYERS.slice(0, 6)
  const order = [...players]

  // Phase1 questions
  const phase1Questions = {}
  players.forEach((p, i) => {
    phase1Questions[p] = [0, 1, 2].map(j => makeQuestion(`P01-DEMO-${i}-${j}`, 'Phase01', 'Culture G.'))
  })

  // Phase1 answers with random scores
  const phase1Answers = {}
  players.forEach(p => {
    phase1Answers[p] = phase1Questions[p].map((q, j) => ({
      questionId: q.id,
      mode: ['Duo', 'Carré', 'Cash'][j % 3],
      correct: Math.random() > 0.4,
      points: [1, 2, 4][j % 3],
    }))
  })

  const rankingOrder = [...players].sort(() => Math.random() - 0.5)
  const finalists = rankingOrder.slice(0, 2)

  // Theme assignments (3 per player)
  const themeAssignments = {}
  players.forEach((p, i) => {
    themeAssignments[p] = PLACEHOLDER_THEMES.slice(i * 3, i * 3 + 3)
  })

  // Phase2 answers
  const phase2Answers = {}
  players.forEach(p => {
    phase2Answers[p] = {}
    themeAssignments[p].forEach(t => {
      phase2Answers[p][t] = [0, 1, 2, 3].map(j => ({
        questionId: `P02-DEMO-${p}-${t}-${j}`,
        mode: 'Carré',
        correct: Math.random() > 0.4,
        points: 2,
      }))
    })
  })

  // Phase3 questions
  const phase3Questions = Array.from({ length: 9 }, (_, i) => ({
    id: `P03-DEMO-${i}`,
    phase: 'Phase03',
    theme: 'Finale',
    question: `Question difficile ${i + 1} — test`,
    media: null,
    answer: 'Réponse exacte',
    note: null,
  }))

  const phase3Answers = phase3Questions.map((q, i) => ({
    questionId: q.id,
    player1Answer: 'Ma réponse',
    player2Answer: 'Mon autre réponse',
    player1Correct: i % 2 === 0,
    player2Correct: i % 3 === 0,
  }))

  const tiebreaker = {
    id: 'APC-DEMO-1',
    phase: 'AuPlusProche',
    theme: null,
    question: 'Combien de marches dans la Tour Eiffel ?',
    media: null,
    answer: '1 665',
    note: null,
  }

  const scores = {}
  players.forEach(p => {
    const p1 = (phase1Answers[p] || []).reduce((s, a) => s + a.points, 0)
    const p2 = Object.values(phase2Answers[p] || {}).flat().reduce((s, a) => s + a.points, 0)
    scores[p] = p1 + p2
  })

  return {
    activePlayers: players,
    playerOrder: order,
    phase1Questions,
    phase1Answers,
    phase1CurrentPlayerIndex: 0,
    phase1CurrentQuestionIndex: 0,
    phase1Ranking: rankingOrder,
    availableThemes: PLACEHOLDER_THEMES,
    themeAssignments,
    phase2Answers,
    phase2CurrentIndex: 0,
    phase2Ranking: rankingOrder,
    finalists,
    phase3Questions,
    phase3Answers,
    phase3CurrentQuestionIndex: 0,
    phase3CurrentPlayerStep: 'player1',
    finalWinner: finalists[0],
    tiebreakerQuestion: tiebreaker,
    currentScores: scores,
  }
}

export const ALL_SCREENS = [
  { id: '00a', label: '00a — Titre' },
  { id: '00b', label: '00b — Participants' },
  { id: '00c', label: '00c — Règles' },
  { id: '00d', label: '00d — Tirage au sort' },
  { id: '01intro', label: '01intro — Intro Phase 1' },
  { id: '01a', label: '01a — Règles Phase 1' },
  { id: '01b', label: '01b — Titre joueur·euse' },
  { id: '01c', label: '01c — Question + choix' },
  { id: '01d', label: '01d — Question + timer' },
  { id: '01e', label: '01e — Réponse' },
  { id: '01f', label: '01f — Classement Phase 1' },
  { id: '02intro', label: '02intro — Intro Phase 2' },
  { id: '02a', label: '02a — Règles Phase 2' },
  { id: '02b', label: '02b — Révélation thèmes' },
  { id: '02c', label: '02c — Attribution thèmes' },
  { id: '02e', label: '02e — Titre joueur·euse P2' },
  { id: '02f', label: '02f — Questions thème' },
  { id: '02g', label: '02g — Classement Phase 2' },
  { id: '02h', label: '02h — Départage P2' },
  { id: '03intro', label: '03intro — Intro Phase 3' },
  { id: '03a', label: '03a — Règles Finale' },
  { id: '03b', label: '03b — Titre question finale' },
  { id: '03c', label: '03c — Réponse finaliste 1' },
  { id: '03d', label: '03d — Réponse finaliste 2' },
  { id: '03e', label: '03e — Titre reveal' },
  { id: '03f', label: '03f — Reveal réponses' },
  { id: '03g', label: '03g — Scores finaux' },
  { id: '03h', label: '03h — Mort subite titre' },
  { id: '03i', label: '03i — Mort subite question' },
  { id: '04a', label: '04a — Écran de fin' },
]
