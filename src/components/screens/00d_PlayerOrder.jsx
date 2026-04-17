import React, { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import { shuffleArray } from '../../store/gameStore'
import { Watermark } from '../ui/Watermark'
import { AdminControls } from '../admin/AdminControls'

export function Screen00d() {
  const { activePlayers, setPlayerOrder, goTo, initPhase1 } = useGameStore()
  const [order, setOrder] = useState([])
  const [rolling, setRolling] = useState(false)
  const [locked, setLocked] = useState(false)
  const rollTimers = useRef([])

  const startDraw = () => {
    setRolling(true)
    setLocked(false)

    // Pre-compute final order
    const final = shuffleArray(activePlayers)

    // Animate each slot rolling
    const slots = activePlayers.map((_, i) => {
      let count = 0
      const maxRolls = 6 + i * 3

      return new Promise(resolve => {
        const interval = setInterval(() => {
          setOrder(prev => {
            const next = [...prev]
            next[i] = activePlayers[Math.floor(Math.random() * activePlayers.length)]
            return next
          })
          count++
          if (count >= maxRolls) {
            clearInterval(interval)
            setOrder(prev => {
              const next = [...prev]
              next[i] = final[i]
              return next
            })
            resolve()
          }
        }, 120)
        rollTimers.current.push(interval)
      })
    })

    Promise.all(slots).then(() => {
      setRolling(false)
      setLocked(true)
      setPlayerOrder(final)
    })
  }

  useEffect(() => {
    // Init empty slots
    setOrder(activePlayers.map(() => '—'))
    return () => rollTimers.current.forEach(clearInterval)
  }, [])

  const handleStart = () => {
    initPhase1()
    goTo('01intro')
  }

  return (
    <div className="screen diagonal-bg">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 560,
        padding: '0 24px',
        gap: 28,
      }}>

        {/* Header */}
        <div className="anim-fade-in" style={{ textAlign: 'center' }}>
          <div className="phase-badge" style={{ marginBottom: 14 }}>Tirage au sort</div>
          <h1 className="text-condensed" style={{ fontSize: '2.6rem' }}>
            Ordre de passage
          </h1>
        </div>

        {/* Slots */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          width: '100%',
        }}>
          {activePlayers.map((_, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-light)',
              border: `1px solid ${locked ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'}`,
              transition: 'border-color 0.3s ease',
              minHeight: 56,
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                color: 'var(--yellow)',
                minWidth: 32,
                opacity: 0.8,
              }}>
                {i + 1}
              </span>
              <span style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: '1.3rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: rolling ? 'var(--white-secondary)' : 'var(--white)',
                transition: 'color 0.2s ease',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}>
                {order[i] || '—'}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="anim-fade-in stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          {!locked ? (
            <button
              className="btn btn-primary"
              style={{ minWidth: 280 }}
              disabled={rolling}
              onClick={startDraw}
            >
              {rolling ? 'Tirage en cours…' : '🎲 Tirer au sort'}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              style={{ minWidth: 280 }}
              onClick={handleStart}
            >
              Démarrer la Phase 1 →
            </button>
          )}
        </div>
      </div>

      <AdminControls />
      <Watermark />
    </div>
  )
}
