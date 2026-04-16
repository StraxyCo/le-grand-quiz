import React from 'react'
import { useGameStore } from '../../store/gameStore'
import { RulesCards } from './00c_Rules'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

const RULES_P1 = [
  {
    icon: '🔀',
    title: 'Ordre aléatoire',
    desc: '3 questions chacun·e, dans un ordre tiré au sort. Tour à tour, pas de rapidité.',
  },
  {
    icon: '🃏',
    title: 'Duo · Carré · Cash',
    desc: '2 choix (1 pt), 4 choix (2 pts) ou sans filet (4 pts) : à toi de doser le risque.',
  },
  {
    icon: '⏱',
    title: '30 secondes',
    desc: 'Le timer se lance automatiquement après ton choix. Tu peux valider avant la fin.',
  },
]

export function Screen01a() {
  const { goTo } = useGameStore()
  return (
    <div className="screen diagonal-bg">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '0 40px', textAlign: 'center', maxWidth: 760 }}>
        <div className="phase-badge anim-fade-in">Phase 01</div>
        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{ fontSize: '4.5rem', lineHeight: 1 }}>
          Questions de classement
        </h1>
        <RulesCards rules={RULES_P1} columns={3} />
        <button className="btn btn-primary anim-slide-up stagger-4" style={{ minWidth: 260, marginTop: 4 }} onClick={() => goTo('01b')}>
          C'est parti →
        </button>
      </div>
      <AdminControls />
      <Watermark />
    </div>
  )
}
