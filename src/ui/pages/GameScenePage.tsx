import React, { Suspense, lazy, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/stores/useGameStore'
import { LEVELS } from '@/levels/levelsConfig'
import { Home, RotateCcw, Star } from 'lucide-react'
import './GameScenePage.css'

// Lazy-load the heavy 3D scene content to optimize page load speeds
const GamePlayScene = lazy(() => import('@/scenes/GamePlayScene'))

const AimSlider: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })

  // Max drag distance in pixels
  const maxDragX = 120 // Width of half the track minus half knob width
  const maxDragY = 120 // Maximum downward pull

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    e.preventDefault()
    e.stopPropagation()

    const dxRaw = e.clientX - dragStartRef.current.x
    const dyRaw = e.clientY - dragStartRef.current.y

    // Clamp X within [-maxDragX, maxDragX]
    const dx = Math.min(Math.max(dxRaw, -maxDragX), maxDragX)
    
    // Apply rubberband resistance/dampening to downward pull Y
    const limitY = maxDragY * 0.6 // 72px
    let dy = dyRaw
    if (dyRaw > limitY) {
      const overflow = dyRaw - limitY
      dy = limitY + (maxDragY - limitY) * (1 - Math.exp(-overflow / 60))
    } else {
      dy = Math.max(dyRaw, 0)
    }

    setPosition({ x: dx, y: dy })

    // Normalize values
    const angleFraction = dx / maxDragX // -1 to 1
    const powerFraction = dy / maxDragY // 0 to 1

    window.dispatchEvent(new CustomEvent('slider-aim', {
      detail: { angleFraction, powerFraction, isDragging: true }
    }))
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)

    const angleFraction = position.x / maxDragX
    const powerFraction = position.y / maxDragY

    // Dispatch release event
    window.dispatchEvent(new CustomEvent('slider-release', {
      detail: { angleFraction, powerFraction }
    }))

    // Reset knob position smoothly
    setPosition({ x: 0, y: 0 })
  }

  return (
    <div className="slider-control-container">
      {/* Dynamic SVG Slingshot Band Overlay */}
      <svg 
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '200px',
          pointerEvents: 'none',
          zIndex: 5
        }}
      >
        {isDragging && (
          <>
            {/* Left Elastic Band */}
            <line 
              x1="20" 
              y1="8" 
              x2={160 + position.x} 
              y2={8 + position.y} 
              stroke={position.y > 0 ? `rgb(${249 - (position.y / maxDragY) * 10}, ${115 - (position.y / maxDragY) * 47}, ${22 + (position.y / maxDragY) * 46})` : "#f97316"}
              strokeWidth={Math.max(6 - (position.y / maxDragY) * 3.5, 2.5)}
              strokeLinecap="round"
            />
            {/* Right Elastic Band */}
            <line 
              x1="300" 
              y1="8" 
              x2={160 + position.x} 
              y2={8 + position.y} 
              stroke={position.y > 0 ? `rgb(${249 - (position.y / maxDragY) * 10}, ${115 - (position.y / maxDragY) * 47}, ${22 + (position.y / maxDragY) * 46})` : "#f97316"}
              strokeWidth={Math.max(6 - (position.y / maxDragY) * 3.5, 2.5)}
              strokeLinecap="round"
            />
          </>
        )}
      </svg>

      <div className="slider-track">
        <div 
          className={`slider-knob ${isDragging ? 'dragging' : 'returning'}`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>
    </div>
  )
}

const GameScenePage: React.FC = () => {
  const navigate = useNavigate()
  const {
    phase,
    score,
    highScore,
    currentLevelIndex,
    kicksRemaining,
    setPhase,
    resetLevel,
    nextLevel,
  } = useGameStore()

  const currentLevel = LEVELS[currentLevelIndex] || LEVELS[0]

  return (
    <div className="game-page-container">
      {/* 3D R3F Viewport */}
      <div className="canvas-container">
        <Canvas
          shadows
          camera={{ position: [0, 8, 12], fov: 50 }}
          onPointerDown={(e) => {
            e.preventDefault()
          }}
        >
          <Suspense fallback={null}>
            <GamePlayScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Horizontal Slider Control below Canvas */}
      <AimSlider />

      {/* HUD Layer */}
      <div className="hud-layer">
        <header className="hud-header">
          <div className="hud-left">
            <button 
              className="hud-circle-btn" 
              onClick={() => {
                setPhase('MENU')
                navigate('/')
              }}
              title="Return to Menu"
            >
              <Home size={18} />
            </button>
            <div className="level-badge">
              <span className="level-num">Lvl {currentLevelIndex + 1}</span>
              <span className="level-name">{currentLevel?.name || 'Gameplay'}</span>
            </div>
          </div>

          <div className="hud-right">
            <div className="score-badge hs">
              <span className="label">High</span>
              <span className="val">{highScore}</span>
            </div>
            <div className="score-badge">
              <span className="label">Score</span>
              <span className="val">{score}</span>
            </div>
          </div>
        </header>

        <footer className="hud-footer">
          <div className="kicks-indicator">
            <span className="kicks-label">Kicks</span>
            <div className="kicks-dots">
              {Array.from({ length: currentLevel?.kicksAllowed || 3 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`kick-dot ${i < kicksRemaining ? 'active' : 'spent'}`} 
                />
              ))}
            </div>
          </div>

          <div className="quick-actions">
            <button 
              className="hud-circle-btn" 
              onClick={() => {
                resetLevel()
                window.dispatchEvent(new CustomEvent('reset-game'))
              }}
              title="Reset Level"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </footer>
      </div>

      {/* Victory Overlay Modal */}
      {phase === 'VICTORY' && (
        <div className="game-overlay-backdrop">
          <div className="overlay-card animate-pop">
            <h2 className="overlay-title success">Victory!</h2>
            <div className="star-rating">
              <Star size={32} fill="#eab308" stroke="#451a03" strokeWidth={2} className="star-pulse-1" />
              <Star size={40} fill="#eab308" stroke="#451a03" strokeWidth={2} className="star-pulse-2" />
              <Star size={32} fill="#eab308" stroke="#451a03" strokeWidth={2} className="star-pulse-3" />
            </div>
            <div className="overlay-stats">
              <div className="stat-row">
                <span>Level Score:</span>
                <span className="highlight-text">+100</span>
              </div>
              <div className="stat-row">
                <span>Kicks Saved:</span>
                <span className="highlight-text">{kicksRemaining}</span>
              </div>
              <div className="stat-row">
                <span>Total Score:</span>
                <span>{score}</span>
              </div>
            </div>
            <p className="overlay-desc">You solved the puzzle with brilliant kick tactics!</p>
            <div className="overlay-actions">
              {currentLevelIndex < LEVELS.length - 1 ? (
                <button 
                  className="hud-circle-btn" 
                  style={{ width: '100%', borderRadius: '12px', height: '48px', fontSize: '1.05rem', fontWeight: 900 }}
                  onClick={() => {
                    nextLevel()
                    window.dispatchEvent(new CustomEvent('reset-game'))
                  }}
                >
                  Next Level
                </button>
              ) : (
                <button 
                  className="hud-circle-btn" 
                  style={{ width: '100%', borderRadius: '12px', height: '48px', fontSize: '1.05rem', fontWeight: 900 }}
                  onClick={() => {
                    useGameStore.getState().setLevel(0)
                    useGameStore.getState().setPhase('MENU')
                    navigate('/')
                  }}
                >
                  Finish Game
                </button>
              )}
              <button 
                className="hud-circle-btn highlight" 
                style={{ width: '100%', borderRadius: '12px', height: '48px', fontSize: '1.05rem', fontWeight: 900 }}
                onClick={() => {
                  useGameStore.getState().setLevel(0)
                  useGameStore.getState().setPhase('MENU')
                  navigate('/')
                }}
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Overlay Modal */}
      {phase === 'GAMEOVER' && (
        <div className="game-overlay-backdrop">
          <div className="overlay-card animate-pop">
            <h2 className="overlay-title alert">Out of Kicks!</h2>
            <div style={{ margin: '14px 0', display: 'flex', justifyContent: 'center' }}>
              <div style={{ fontSize: '3rem' }}>😢</div>
            </div>
            <p className="overlay-desc">You ran out of kicks. Study the path and try again!</p>
            <div className="overlay-actions">
              <button 
                className="hud-circle-btn" 
                style={{ width: '100%', borderRadius: '12px', height: '48px', fontSize: '1.05rem', fontWeight: 900 }}
                onClick={() => {
                  resetLevel()
                  window.dispatchEvent(new CustomEvent('reset-game'))
                }}
              >
                Try Again
              </button>
              <button 
                className="hud-circle-btn highlight" 
                style={{ width: '100%', borderRadius: '12px', height: '48px', fontSize: '1.05rem', fontWeight: 900 }}
                onClick={() => {
                  useGameStore.getState().setLevel(0)
                  useGameStore.getState().setPhase('MENU')
                  navigate('/')
                }}
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameScenePage
