import React from 'react'
import { useGameStore } from '../../store/gameStore'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

export function Screen01a() {
  const { goTo } = useGameStore()

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
        padding: '0 40px',
        textAlign: 'center',
        maxWidth: 680,
      }}>
        <div className="phase-badge anim-fade-in">Phase 01</div>

        <h1 className="text-display text-gold anim-fade-in stagger-1" style={{ fontSize: '5rem', lineHeight: 1 }}>
          Questions de<br />classement
        </h1>

        <div className="separator anim-fade-in stagger-2" style={{ maxWidth: 360 }}>✦</div>

        <div className="anim-fade-in stagger-3" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {[
            '3 questions chacun·e, dans un ordre tiré au sort',
            'Choisis entre Duo (1 pt), Carré (2 pts) ou Cash (4 pts)',
            '30 secondes pour répondre',
          ].map((rule, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'var(--white-secondary)',
            }}>
              <span style={{ color: 'var(--yellow)', fontSize: '0.6rem' }}>◆</span>
              {rule}
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary anim-slide-up stagger-4"
          style={{ minWidth: 260, marginTop: 8 }}
          onClick={() => goTo('01b')}
        >
          C'est parti →
        </button>
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}
