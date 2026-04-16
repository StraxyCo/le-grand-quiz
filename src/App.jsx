import React, { useEffect, useState, useCallback } from 'react'
import { useGameStore } from './store/gameStore'
import { AdminNavMenu } from './components/admin/AdminControls'

import { Screen00a } from './components/screens/00a_TitleScreen'
import { Screen00b } from './components/screens/00b_SelectPlayers'
import { Screen00c } from './components/screens/00c_Rules'
import { Screen00d } from './components/screens/00d_PlayerOrder'
import { Screen01a } from './components/screens/01a_Phase1Title'
import { Screen01b } from './components/screens/01b_PlayerTitle'
import { Screen01c } from './components/screens/01c_QuestionChoice'
import { Screen01f } from './components/screens/01f_Phase1Results'
import { Screen02a, Screen02b, Screen02c } from './components/screens/02abc_Phase2'
import { Screen02e, Screen02f, Screen02g, Screen02h } from './components/screens/02efgh_Phase2'
import { Screen03a, Screen03b, Screen03c, Screen03d, Screen03e, Screen03f, Screen03g, Screen03h, Screen03i } from './components/screens/03_Phase3'
import { Screen04a } from './components/screens/04a_EndScreen'

const SCREEN_MAP = {
  '00a': Screen00a,
  '00b': Screen00b,
  '00c': Screen00c,
  '00d': Screen00d,
  '01a': Screen01a,
  '01b': Screen01b,
  '01c': Screen01c,
  '01d': Screen01c,
  '01e': Screen01c,
  '01f': Screen01f,
  '02a': Screen02a,
  '02b': Screen02b,
  '02c': Screen02c,
  '02e': Screen02e,
  '02f': Screen02f,
  '02g': Screen02g,
  '02h': Screen02h,
  '03a': Screen03a,
  '03b': Screen03b,
  '03c': Screen03c,
  '03d': Screen03d,
  '03e': Screen03e,
  '03f': Screen03f,
  '03g': Screen03g,
  '03h': Screen03h,
  '03i': Screen03i,
  '04a': Screen04a,
}

async function loadGameData() {
  const [questions, themes] = await Promise.all([
    fetch('/data/questions.json').then(r => r.json()),
    fetch('/data/themes.json').then(r => r.json()),
  ])
  return { questions, themes }
}

export default function App() {
  const { currentScreen, hydrate, setData, setValidationError, validationError } = useGameStore()
  const [loading, setLoading] = useState(true)

  const initData = useCallback(() => {
    setLoading(true)
    loadGameData()
      .then(({ questions, themes }) => {
        setData(questions, themes)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load data', err)
        setValidationError('Impossible de charger les données du jeu.')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    hydrate()
    initData()

    // Re-load data whenever the store is reset (questions become null)
    const unsub = useGameStore.subscribe((state, prev) => {
      if (prev.questions !== null && state.questions === null) {
        initData()
      }
    })
    return unsub
  }, [])

  if (loading) {
    return (
      <div className="screen diagonal-bg" style={{ gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(212,175,55,0.2)', borderTop: '3px solid var(--yellow)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ fontFamily: 'var(--font-condensed)', color: 'var(--white-secondary)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>Chargement…</p>
      </div>
    )
  }

  if (validationError) {
    return (
      <div className="screen diagonal-bg" style={{ gap: 20 }}>
        <div style={{ padding: '32px 40px', borderRadius: 'var(--radius-lg)', border: '1.5px solid rgba(214,85,72,0.4)', background: 'rgba(214,85,72,0.08)', maxWidth: 520, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontFamily: 'var(--font-condensed)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--red)', marginBottom: 12, letterSpacing: '0.05em' }}>
            Erreur de configuration
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--white-secondary)', lineHeight: 1.5 }}>
            {validationError}
          </p>
        </div>
      </div>
    )
  }

  const ScreenComponent = SCREEN_MAP[currentScreen] || Screen00a

  return (
    <>
      <ScreenComponent />
      <AdminNavMenu />
    </>
  )
}
