/**
 * Validate questions.json against active players and themes
 * Returns null if valid, or an error message string
 */
export function validateQuestions(questions, activePlayers, activeThemes) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return 'Le fichier questions.json est vide ou invalide.'
  }

  const phase1 = questions.filter(q => q.phase === 'Phase01')
  const required = activePlayers.length * 3
  if (phase1.length < required) {
    return `Pas assez de questions Phase 1 (${phase1.length} disponibles, ${required} requises)`
  }

  const phase2ByTheme = {}
  questions.filter(q => q.phase === 'Phase02').forEach(q => {
    phase2ByTheme[q.theme] = (phase2ByTheme[q.theme] || 0) + 1
  })
  for (const theme of activeThemes) {
    const count = phase2ByTheme[theme] || 0
    if (count < 4) {
      return `Thème "${theme}" : questions insuffisantes (${count}/4)`
    }
  }

  const phase3 = questions.filter(q => q.phase === 'Phase03')
  if (phase3.length < 8) {
    return `Pas assez de questions pour la finale (${phase3.length}/8)`
  }

  const apc = questions.filter(q => q.phase === 'AuPlusProche')
  if (apc.length === 0) {
    return 'Aucune question de départage disponible'
  }

  return null
}

/**
 * Shuffle an array (Fisher-Yates)
 */
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Get shuffled answer options for a question
 * Returns array of { text, isCorrect }
 */
export function getShuffledOptions(question, mode) {
  if (mode === 'Cash') return []

  const correct = { text: question.answer, isCorrect: true }

  let wrongs
  if (mode === 'Duo') {
    // Always use wrong1 as the single distractor (ordered by difficulty in CSV)
    wrongs = question.wrong1 ? [{ text: question.wrong1, isCorrect: false }] : []
  } else {
    // Carré: all 3 wrong answers, shuffled
    wrongs = [question.wrong1, question.wrong2, question.wrong3]
      .filter(Boolean)
      .map(t => ({ text: t, isCorrect: false }))
    wrongs = shuffle(wrongs)
  }

  return shuffle([correct, ...wrongs])
}
