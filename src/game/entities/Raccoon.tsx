import React, { useEffect, useRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '@/stores/useGameStore'
import { LEVELS } from '@/levels/levelsConfig'

interface RaccoonProps {
  position: [number, number, number]
  rotationY?: number
  scale?: number
  ref?: React.Ref<THREE.Group>
}

export const Raccoon: React.FC<RaccoonProps> = ({ position, rotationY = 0, scale = 1, ref }) => {
  const groupRef = useRef<THREE.Group>(null)

  // Expose groupRef to parent components for location tracking
  useImperativeHandle(ref, () => groupRef.current as THREE.Group)

  // Tracking base position and offsets for running & root-motion compensation
  const basePositionRef = useRef({ x: position[0], y: position[1], z: position[2] })
  const currentOffsetRef = useRef({ x: 0, z: 0 })
  const targetOffsetRef = useRef({ x: 0, z: 0 })
  const isWalkingBackRef = useRef(false)
  const currentRotationYRef = useRef(rotationY)

  // Aiming orientation refs
  const isAimingRef = useRef(false)
  const aimAngleRef = useRef(rotationY)
  const aimTargetXRef = useRef(position[0])
  const aimTargetZRef = useRef(position[2])

  // Kick rotation lock refs
  const isKickingRef = useRef(false)
  const kickAngleRef = useRef(rotationY)
  const idleRotationRef = useRef(rotationY)

  // Load the char2.glb model
  const gltf = useGLTF('/raccoon.glb')
  
  // Bind all animations
  const { actions, mixer } = useAnimations(gltf.animations, gltf.scene)

  // Sync internal position tracking state and play initial idle animation on mount or reset
  useEffect(() => {
    basePositionRef.current = { x: position[0], y: position[1], z: position[2] }
    isWalkingBackRef.current = false
    isKickingRef.current = false
    currentOffsetRef.current = { x: 0, z: 0 }
    targetOffsetRef.current = { x: 0, z: 0 }
    currentRotationYRef.current = rotationY
    idleRotationRef.current = rotationY

    const idleAction = actions['idle']
    if (idleAction) {
      idleAction.setEffectiveTimeScale(1)
      idleAction.setEffectiveWeight(1)
      idleAction.reset().fadeIn(0.2).play()
    }
    return () => {
      if (idleAction) idleAction.fadeOut(0.2)
    }
  }, [position[0], position[1], position[2], rotationY, actions])

  // Listen for reset-game or reset-raccoon event to return raccoon back to starting position
  useEffect(() => {
    const handleResetGame = () => {
      basePositionRef.current = { x: position[0], y: position[1], z: position[2] }
      isWalkingBackRef.current = false
      isKickingRef.current = false
      currentOffsetRef.current = { x: 0, z: 0 }
      targetOffsetRef.current = { x: 0, z: 0 }
      currentRotationYRef.current = rotationY
      idleRotationRef.current = rotationY
      const idleAction = actions['idle']
      if (idleAction) {
        idleAction.reset().play()
      }
    }
    window.addEventListener('reset-game', handleResetGame)
    window.addEventListener('reset-raccoon', handleResetGame)
    return () => {
      window.removeEventListener('reset-game', handleResetGame)
      window.removeEventListener('reset-raccoon', handleResetGame)
    }
  }, [position[0], position[1], position[2], rotationY, actions])

  // Trigger specific kick animation when the trigger-kick event is dispatched
  useEffect(() => {
    const handleTriggerKick = (e: Event) => {
      const customEvent = e as CustomEvent<{ name: string }>
      const kickName = customEvent.detail?.name
      
      const kickAction = actions[kickName]
      const idleAction = actions['idle']

      if (kickAction && idleAction) {
        // Lock rotation facing the ball during kick
        isKickingRef.current = true
        kickAngleRef.current = currentRotationYRef.current

        // Shift character left and backward for kick3 to align feet contact with the ball
        if (kickName === 'kick3') {
          targetOffsetRef.current = { x: -0.38, z: 0.3 }
          isWalkingBackRef.current = false // Move fast to kick pose
        } else {
          targetOffsetRef.current = { x: 0, z: 0 }
          isWalkingBackRef.current = false
        }

        // Prepare kick action: reset, and clamp on final frame (avoids T-pose!)
        kickAction.setEffectiveTimeScale(1)
        kickAction.setEffectiveWeight(1)
        kickAction.reset()
        kickAction.setLoop(THREE.LoopOnce, 1)
        kickAction.clampWhenFinished = true

        // Blend smoothly from idle to kick
        idleAction.crossFadeTo(kickAction, 0.2, false)
        kickAction.play()

        // Listen for completion to blend smoothly back to the idle loop
        const handleFinished = (evt: THREE.Event) => {
          const eventData = evt as unknown as { action: THREE.AnimationAction }
          if (eventData.action === kickAction) {
            mixer.removeEventListener('finished', handleFinished)

            // Kick completed: release rotation lock and hold the kick direction
            isKickingRef.current = false
            idleRotationRef.current = kickAngleRef.current

            // Smoothly slide back to origin
            isWalkingBackRef.current = true
            targetOffsetRef.current = { x: 0, z: 0 }

            // Reset idle action parameters and blend directly
            idleAction.setEffectiveTimeScale(1)
            idleAction.setEffectiveWeight(1)
            kickAction.crossFadeTo(idleAction, 0.45, false)
            idleAction.reset().play()
          }
        }
        mixer.addEventListener('finished', handleFinished)
      }
    }

    window.addEventListener('trigger-kick', handleTriggerKick as EventListener)
    return () => {
      window.removeEventListener('trigger-kick', handleTriggerKick as EventListener)
    }
  }, [actions, mixer])

  // Listen for ball stopping event to teleport to the new position
  useEffect(() => {
    const handleRunToBall = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; z: number }>
      const { x, z } = customEvent.detail

      // Target position: exactly 1.2m behind the ball on the Z axis
      const targetX = x
      const targetZ = z + 1.2

      // Teleport instantly
      basePositionRef.current = { x: targetX, y: basePositionRef.current.y, z: targetZ }
      currentOffsetRef.current = { x: 0, z: 0 }
      targetOffsetRef.current = { x: 0, z: 0 }
      isWalkingBackRef.current = false

      // Face down-field once arrived
      idleRotationRef.current = rotationY
      currentRotationYRef.current = rotationY

      const idleAction = actions['idle']
      if (idleAction) {
        idleAction.reset().play()
      }
    }

    window.addEventListener('run-to-ball', handleRunToBall as EventListener)
    return () => {
      window.removeEventListener('run-to-ball', handleRunToBall as EventListener)
    }
  }, [actions, rotationY])

  // Listen for aiming event to face the pull/aim direction in real-time
  useEffect(() => {
    const handleAimBall = (e: Event) => {
      const customEvent = e as CustomEvent<{ angle: number; targetX: number; targetZ: number }>
      const { angle, targetX, targetZ } = customEvent.detail
      isAimingRef.current = true
      aimAngleRef.current = angle
      aimTargetXRef.current = targetX
      aimTargetZRef.current = targetZ
    }
    const handleStopAimBall = () => {
      isAimingRef.current = false
    }
    window.addEventListener('aim-ball', handleAimBall as EventListener)
    window.addEventListener('stop-aim-ball', handleStopAimBall)
    return () => {
      window.removeEventListener('aim-ball', handleAimBall as EventListener)
      window.removeEventListener('stop-aim-ball', handleStopAimBall)
    }
  }, [])

  // Frame loop for smooth position interpolation & movement constraints
  useFrame((_state, delta) => {
    let targetRotation = idleRotationRef.current

    if (isAimingRef.current) {
      // Smoothly orbit/pivot around the ball
      basePositionRef.current.x += (aimTargetXRef.current - basePositionRef.current.x) * 12 * delta
      basePositionRef.current.z += (aimTargetZRef.current - basePositionRef.current.z) * 12 * delta
      targetRotation = aimAngleRef.current
    } else if (isKickingRef.current) {
      targetRotation = kickAngleRef.current
    }

    // Smoothly interpolate rotation to target angle (handling 360 wrap-around)
    let diff = targetRotation - currentRotationYRef.current
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    currentRotationYRef.current += diff * 12.0 * delta

    // 2. Slide-back interpolation (only when walking back, not while running)
    const lerpSpeed = isWalkingBackRef.current ? 1.2 : 12
    
    currentOffsetRef.current.x += (targetOffsetRef.current.x - currentOffsetRef.current.x) * lerpSpeed * delta
    currentOffsetRef.current.z += (targetOffsetRef.current.z - currentOffsetRef.current.z) * lerpSpeed * delta

    // A. Boundary constraints (clamped inside the brick walls clearance)
    basePositionRef.current.x = Math.max(-4.1, Math.min(4.1, basePositionRef.current.x))
    basePositionRef.current.z = Math.max(-9.1, Math.min(11.1, basePositionRef.current.z))

    // B. Level Obstacles collision resolution (AABB overlap check)
    const currentLevelIndex = useGameStore.getState().currentLevelIndex
    const currentLevel = LEVELS[currentLevelIndex]
    const obstacles = currentLevel ? currentLevel.obstacles : []
    obstacles.forEach(obs => {
      let obsX = obs.position[0]
      const obsZ = obs.position[2]
      if (obs.type === 'moving') {
        const speed = 2.0
        const range = 4.0
        const t = _state.clock.getElapsedTime()
        obsX = obs.position[0] + Math.sin(t * speed) * range
      }
      const halfX = obs.size[0] / 2 + 0.32
      const halfZ = obs.size[2] / 2 + 0.32

      const dx = basePositionRef.current.x - obsX
      const dz = basePositionRef.current.z - obsZ

      const overlapX = halfX - Math.abs(dx)
      const overlapZ = halfZ - Math.abs(dz)

      if (overlapX > 0 && overlapZ > 0) {
        if (overlapX < overlapZ) {
          basePositionRef.current.x += dx > 0 ? overlapX : -overlapX
        } else {
          basePositionRef.current.z += dz > 0 ? overlapZ : -overlapZ
        }
      }
    })

    // C. Scenic Rocks collision resolution (Circle overlap check)
    const scenicCircles = [
      { x: -3.1, z: 2.5, r: 1.0 }, // Left rock group
      { x: 2.7, z: -5.6, r: 0.9 }  // Right rock group
    ]
    scenicCircles.forEach(circle => {
      const dx = basePositionRef.current.x - circle.x
      const dz = basePositionRef.current.z - circle.z
      const dist = Math.hypot(dx, dz)
      if (dist < circle.r) {
        const overlap = circle.r - dist
        const angle = dist > 0.001 ? Math.atan2(dx, dz) : 0
        basePositionRef.current.x += Math.sin(angle) * overlap
        basePositionRef.current.z += Math.cos(angle) * overlap
      }
    })

    // D. Left Fence collision resolution (AABB overlap check)
    const fenceX = -2.0
    const fenceZ = 4.5
    const fenceHalfX = 1.3
    const fenceHalfZ = 0.5
    const fdx = basePositionRef.current.x - fenceX
    const fdz = basePositionRef.current.z - fenceZ
    const fOverlapX = fenceHalfX - Math.abs(fdx)
    const fOverlapZ = fenceHalfZ - Math.abs(fdz)
    if (fOverlapX > 0 && fOverlapZ > 0) {
      if (fOverlapX < fOverlapZ) {
        basePositionRef.current.x += fdx > 0 ? fOverlapX : -fOverlapX
      } else {
        basePositionRef.current.z += fdz > 0 ? fOverlapZ : -fOverlapZ
      }
    }

    if (groupRef.current) {
      groupRef.current.position.set(
        basePositionRef.current.x + currentOffsetRef.current.x,
        basePositionRef.current.y,
        basePositionRef.current.z + currentOffsetRef.current.z
      )
      groupRef.current.rotation.y = currentRotationYRef.current
    }

    // Dynamic termination of offset sliding when character is close to origin
    if (isWalkingBackRef.current) {
      const distance = Math.hypot(currentOffsetRef.current.x, currentOffsetRef.current.z)
      if (distance < 0.03) {
        isWalkingBackRef.current = false
      }
    }
  })

  // Enable shadows
  useEffect(() => {
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [gltf.scene])

  return (
    <group ref={groupRef}>
      {/* Skinned 3D GLTF Primitive */}
      <group position={[0, 0, 0]} scale={[scale * 1.5, scale * 1.5, scale * 1.5]}>
        <primitive object={gltf.scene} />
      </group>
    </group>
  )
}

// Preload the GLB model
useGLTF.preload('/raccoon.glb')

export default Raccoon
