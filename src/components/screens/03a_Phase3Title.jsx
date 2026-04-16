import React from 'react'
import { useGameStore } from '../../store/gameStore'
import { RulesCards } from './00c_Rules'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

const RULES_P3 = [
  {
    icon: '🎯',
    title: '8 questions',
    desc: 'Sur des thèmes variés, de difficulté plus élevée. Toutes en mode Cash.',
  },
  {
    icon: '🙉',
    title: 'Réponses séparées',
    desc: 'Pendant que l\'un répond, l\'autre a les oreilles bouchées. Pas de triche !',
  },
  {
    icon: '📋',
    title: 'Reveal final',
    desc: 'À la fin des 8 questions, on révèle les réponses et la bonne réponse, une par une.',
  },
  {
    icon: '🏆',
    title: 'Le·la gagnant·e',
    desc: 'Celui ou celle avec le plus de bonnes réponses remporte le Grand Quiz.',
  },
]

export function Screen03a() {
  const { finalists, goTo, initPhase3 } = useGameStore()
  const handleStart = () => { initPhase3(); goTo('03b') }

  return (
    <div className="screen diagonal-bg">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '0 40px', textAlign: 'center', maxWidth: 820 }}>
        <div className="phase-badge anim-fade-in">Phase 03</div>
        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{ fontSize: '4.5rem', lineHeight: 1 }}>
          La Finale
        </h1>
        {finalists?.length === 2 && (
          <div className="anim-fade-in stagger-2" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '1.6rem', fontWeight: 700 }}>{finalists[0]}</span>
            <span style={{ color: 'var(--yellow)', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>VS</span>
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: '1.6rem', fontWeight: 700 }}>{finalists[1]}</span>
          </div>
        )}
        <RulesCards rules={RULES_P3} />
        <button className="btn btn-primary anim-slide-up stagger-5" style={{ minWidth: 260, marginTop: 4 }} onClick={handleStart}>
          Lancer la Finale →
        </button>
      </div>
      <AdminControls />
      <Watermark />
    </div>
  )
}
