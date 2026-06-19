import { useState, useCallback, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { InputSystem } from '@/game/systems/InputSystem'
import type { DragInput } from '@/game/systems/InputSystem'

export const useGameInput = (camera: THREE.Camera | null, onReleaseKick: (impulse: THREE.Vector3) => void) => {
  const [dragState, setDragState] = useState<DragInput>({
    startScreenPos: new THREE.Vector2(),
    currentScreenPos: new THREE.Vector2(),
    isDragging: false,
  })
  
  const dragStateRef = useRef(dragState)
  
  // Safely sync the ref with state outside the render path
  useEffect(() => {
    dragStateRef.current = dragState
  }, [dragState])

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setDragState({
      startScreenPos: new THREE.Vector2(clientX, clientY),
      currentScreenPos: new THREE.Vector2(clientX, clientY),
      isDragging: true,
    })
  }, [])

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    setDragState((prev) => {
      if (!prev.isDragging) return prev
      return {
        ...prev,
        currentScreenPos: new THREE.Vector2(clientX, clientY),
      }
    })
  }, [])

  const handleDragEnd = useCallback(() => {
    const state = dragStateRef.current
    if (!state.isDragging || !camera) return

    // Calculate final impulse vector using InputSystem
    const impulse = InputSystem.calculateImpulse(state, camera)

    // Trigger gameplay kick callback
    if (impulse.length() > 0.1) {
      onReleaseKick(impulse)
    }

    // Reset drag state
    setDragState({
      startScreenPos: new THREE.Vector2(),
      currentScreenPos: new THREE.Vector2(),
      isDragging: false,
    })
  }, [camera, onReleaseKick])

  // Browser Mouse Event Listeners
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY)
  }, [handleDragStart])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY)
  }, [handleDragMove])

  const onMouseUp = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  // Mobile Touch Event Listeners
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleDragStart(touch.clientX, touch.clientY)
  }, [handleDragStart])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleDragMove(touch.clientX, touch.clientY)
  }, [handleDragMove])

  const onTouchEnd = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  return {
    dragState,
    eventHandlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  }
}

export default useGameInput
