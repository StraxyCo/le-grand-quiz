import React from 'react'

const RADIUS = 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function TimerRing({ timeLeft, progress, urgent, size = 100 }) {
  const offset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className="timer-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle
          className="timer-track"
          cx="50" cy="50" r={RADIUS}
        />
        <circle
          className={`timer-progress${urgent ? ' urgent' : ''}`}
          cx="50" cy="50" r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="timer-label" style={{
        fontSize: size < 80 ? '1rem' : '1.4rem',
        color: urgent ? 'var(--red)' : 'var(--white)',
      }}>
        {timeLeft}
      </span>
    </div>
  )
}
