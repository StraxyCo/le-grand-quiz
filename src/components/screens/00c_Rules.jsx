import React from 'react'
import { useGameStore } from '../../store/gameStore'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

// Reusable card grid — used across phase title screens
export function RulesCards({ rules, columns = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 14, width: '100%' }}>
      {rules.map((rule, i) => (
        <div key={i} className={`card anim-slide-up stagger-${i + 1}`}
          style={{ padding: '18px 22px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.6rem', flexShrink: 0, marginTop: 2 }}>{rule.icon}</span>
          <div>
            <div className="text-condensed" style={{ fontSize: '1rem', color: 'var(--yellow)', marginBottom: 6 }}>
              {rule.title}
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--white-secondary)', lineHeight: 1.5 }}>
              {rule.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

const RULES = [
  {
    icon: '🎯',
    title: '3 phases',
    desc: 'Classement, Thèmes, Finale. Chaque phase compte pour la suivante.',
  },
  {
    icon: '🃏',
    title: 'Duo · Carré · Cash',
    desc: '2 choix (1 pt), 4 choix (2 pts) ou sans filet (4 pts) : à toi de doser le risque.',
  },
  {
    icon: '⏱',
    title: '30 secondes',
    desc: 'Pour répondre à chaque question. Tour à tour — pas de rapidité.',
  },
  {
    icon: '🏆',
    title: 'La Finale',
    desc: "Les 2 premiers au classement s'affrontent en tête-à-tête pour le titre.",
  },
]

export function Screen00c() {
  const { goTo } = useGameStore()
  return (
    <div className="screen diagonal-bg">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 760, padding: '0 24px', gap: 28 }}>
        <div className="anim-fade-in" style={{ textAlign: 'center' }}>
          <h1 className="text-display text-gold" style={{ fontSize: '4rem' }}>Les Règles</h1>
        </div>
        <RulesCards rules={RULES} />
        <div className="anim-fade-in stagger-5">
          <button className="btn btn-primary" style={{ minWidth: 300, fontSize: '1.15rem' }} onClick={() => goTo('00d')}>
            Tirer au sort l'ordre des joueur·euses
          </button>
        </div>
      </div>
      <AdminControls />
      <Watermark />
    </div>
  )
}
