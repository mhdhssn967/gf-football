import React, { Suspense, lazy, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
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
    </div>
  )
}

export default GameScenePage
