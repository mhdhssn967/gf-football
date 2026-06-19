import React, { Suspense, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import './GameScenePage.css'

// Lazy-load the heavy 3D scene content to optimize page load speeds
const GamePlayScene = lazy(() => import('@/scenes/GamePlayScene'))

const GameScenePage: React.FC = () => {
  // Helper to trigger specific kick animations in the character component
  const triggerKick = (kickName: string) => {
    window.dispatchEvent(new CustomEvent('trigger-kick', { detail: { name: kickName } }))
  }

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

      {/* Floating Sidebar containing Kick Animation Buttons */}
      <div className="kick-controls-sidebar">
        <button onClick={() => triggerKick('kick5')} className="kick-btn">1</button>
        <button onClick={() => triggerKick('kick1')} className="kick-btn">2</button>
        <button onClick={() => triggerKick('kick2')} className="kick-btn">3</button>
        <button onClick={() => triggerKick('kick3')} className="kick-btn">4</button>
      </div>
    </div>
  )
}

export default GameScenePage
