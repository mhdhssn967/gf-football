import React, { useEffect, useState } from 'react'
import './LoadingScreen.css'

interface LoadingScreenProps {
  progress?: number
  tipIntervalMs?: number
}

const GAME_TIPS = [
  'Drag back and release to kick the football.',
  'Bounce the ball off the field borders to reach difficult angles!',
  'Timing is key: wait for moving obstacles to clear before shooting.',
  'Keep an eye on your remaining kicks! Try to solve each puzzle efficiently.',
  'Obstacles with green borders are bouncers; they give the ball extra speed.',
]

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress = 0,
  tipIntervalMs = 4000,
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in')

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState('out')
      setTimeout(() => {
        setCurrentTipIndex((prevIndex) => (prevIndex + 1) % GAME_TIPS.length)
        setFadeState('in')
      }, 500) // matches fade transition time
    }, tipIntervalMs)

    return () => clearInterval(interval)
  }, [tipIntervalMs])

  return (
    <div className="loading-container">
      <div className="loading-bg-glow"></div>

      <div className="loading-content">
        <div className="game-logo-container">
          <h1 className="game-title">
            KICK<span className="accent">TACTICS</span>
          </h1>
          <p className="game-subtitle">3D Football Puzzle Quest</p>
        </div>

        {/* Animated Football Spinner (Golden rim loader) */}
        <div className="football-spinner">
          <svg
            viewBox="0 0 100 100"
            className="spinner-svg"
            width="82"
            height="82"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#5c2d11"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#eab308"
              strokeWidth="6"
              strokeDasharray="276"
              strokeDashoffset={276 - (276 * Math.min(progress, 100)) / 100}
              strokeLinecap="round"
              className="progress-circle"
            />
            {/* Minimal soccer ball graphic */}
            <path
              d="M 50 18 L 63 31 L 58 49 L 42 49 L 37 31 Z"
              fill="#ffffff"
              stroke="#3f1e03"
              strokeWidth="2.5"
            />
            <path d="M 50 18 L 50 8" stroke="#3f1e03" strokeWidth="2.5" />
            <path d="M 63 31 L 71 27" stroke="#3f1e03" strokeWidth="2.5" />
            <path d="M 58 49 L 66 55" stroke="#3f1e03" strokeWidth="2.5" />
            <path d="M 42 49 L 34 55" stroke="#3f1e03" strokeWidth="2.5" />
            <path d="M 37 31 L 29 27" stroke="#3f1e03" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Progress Bar with sliding soccer ball */}
        <div className="progress-bar-container">
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              <div className="progress-glow"></div>
              <div className="progress-ball-marker">⚽</div>
            </div>
          </div>
          <div className="progress-text">
            Preparing Field... {Math.round(progress)}%
          </div>
        </div>

        {/* Gameplay Tips */}
        <div className={`tips-container tip-fade-${fadeState}`}>
          <div className="tip-header">Pro Tip</div>
          <p className="tip-text">"{GAME_TIPS[currentTipIndex]}"</p>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
