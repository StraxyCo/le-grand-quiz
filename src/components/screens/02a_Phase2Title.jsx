import React from 'react'
import { useGameStore } from '../../store/gameStore'
import { RulesCards } from './00c_Rules'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

const RULES_P2 = [
  {
    icon: '🎴',
    title: 'Révélation des thèmes',
    desc: 'Les thèmes disponibles sont dévoilés un par un avant l\'attribution.',
  },
  {
    icon: '🔄',
    title: 'Premier tour',
    desc: 'Dans l\'ordre du classement, chacun·e choisit un thème pour soi et en attribue un à quelqu\'un d\'autre.',
  },
  {
    icon: '✅',
    title: 'Complétion',
    desc: 'On refait un tour pour que chacun·e arrive à exactement 3 thèmes.',
  },
  {
    icon: '🏁',
    title: 'Vers la finale',
    desc: 'Les points sont cumulés avec la Phase 1. Les deux premiers accèdent à la Finale !',
  },
]

export function Screen02a() {
  const { goTo } = useGameStore()
  return (
    <div className="screen diagonal-bg">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '0 40px', textAlign: 'center', maxWidth: 820 }}>
        <div className="phase-badge anim-fade-in">Phase 02</div>
        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{ fontSize: '4.5rem', lineHeight: 1 }}>
          Les Thèmes
        </h1>
        <RulesCards rules={RULES_P2} />
        <button className="btn btn-primary anim-slide-up stagger-5" style={{ minWidth: 260, marginTop: 4 }} onClick={() => goTo('02b')}>
          Dévoiler les thèmes →
        </button>
      </div>
      <AdminControls />
      <Watermark />
    </div>
  )
}
