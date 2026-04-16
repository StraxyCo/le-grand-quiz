import React from 'react'

const RADIUS = 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function TimerRing({ timeLeft, progress, urgent, size = 100 }) {
  const offset = CIRCUMFERENCE * (1 - progress)
  const finished = timeLeft === 0

  return (
    <div className="timer-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle className="timer-track" cx="50" cy="50" r={RADIUS} />
        {finished ? (
          <circle cx="50" cy="50" r={RADIUS} fill="var(--red)" />
        ) : (
          <circle
            className={`timer-progress${urgent ? ' urgent' : ''}`}
            cx="50" cy="50" r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        )}
      </svg>
      <span className="timer-label" style={{
        fontSize: size < 80 ? '1rem' : '1.4rem',
        color: finished ? 'white' : urgent ? 'var(--red)' : 'var(--white)',
        fontWeight: finished ? 700 : undefined,
      }}>
        {timeLeft}
      </span>
    </div>
  )
}
