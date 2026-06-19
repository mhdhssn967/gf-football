import React, { useLayoutEffect, useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls, useTexture, Sky, Stars } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import Football from '@/game/entities/Football'
import Raccoon from '@/game/entities/Raccoon'
import BoundaryWall from '@/game/components/BoundaryWall'
import groundTextureUrl from '@/assets/textures/ground.png'

export const GamePlayScene: React.FC = () => {
  const footballRef = useRef<{ 
    kick: (impulse: THREE.Vector3) => void 
    reset: () => void 
    getPosition: () => THREE.Vector3
    isMoving: () => boolean
  }>(null)
  const raccoonRef = useRef<THREE.Group>(null)
  const shakeRef = useRef(0)
  const currentAngleRef = useRef(0)
  const baseAngleRef = useRef(0)

  // Slingshot drag aiming refs
  const isDraggingRef = useRef(false)
  const dragStartPointRef = useRef(new THREE.Vector3())
  const dragCurrentPointRef = useRef(new THREE.Vector3())
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null)

  // Refs for aiming indicators (trajectory and ground guide dots)
  const trajectoryDotsRef = useRef<THREE.Mesh[]>([])
  const groundDotsRef = useRef<THREE.Mesh[]>([])

  // Load and configure ground grass texture mapping
  const groundTexture = useTexture(groundTextureUrl, (texture) => {
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(6, 9)
  })

  const { camera } = useThree()
  const cameraRef = useRef<THREE.Camera | null>(null)

  // Set the camera directly behind and above the character position
  useLayoutEffect(() => {
    cameraRef.current = camera
    camera.position.set(0, 8.0, 7.5)
    camera.lookAt(0, 0.5, -1.0)
    camera.updateProjectionMatrix()
  }, [camera])

  // Listen for wall hit events to trigger camera shake
  useEffect(() => {
    const handleWallHit = () => {
      shakeRef.current = 0.25
    }
    window.addEventListener('wall-hit', handleWallHit)
    return () => {
      window.removeEventListener('wall-hit', handleWallHit)
    }
  }, [])

  // Listen for reset-game to reset camera angle
  useEffect(() => {
    const handleReset = () => {
      currentAngleRef.current = 0
    }
    window.addEventListener('reset-game', handleReset)
    return () => {
      window.removeEventListener('reset-game', handleReset)
    }
  }, [])

  const sliderStateRef = useRef({
    angleFraction: 0,
    powerFraction: 0,
    isDragging: false
  })

  useEffect(() => {
    const handleSliderAim = (e: Event) => {
      const customEvent = e as CustomEvent<{ angleFraction: number; powerFraction: number; isDragging: boolean }>
      const { angleFraction, powerFraction, isDragging } = customEvent.detail

      if (isDragging && !isDraggingRef.current) {
        if (footballRef.current && footballRef.current.isMoving()) return
        isDraggingRef.current = true
        if (controlsRef.current) {
          controlsRef.current.enabled = false
        }
        // Lock initial base angle when aiming starts
        if (raccoonRef.current && footballRef.current) {
          const charPos = raccoonRef.current.position
          const ballPos = footballRef.current.getPosition()
          const toChar = new THREE.Vector3(charPos.x - ballPos.x, 0, charPos.z - ballPos.z)
          const dist = toChar.length()
          if (dist > 0.1) {
            baseAngleRef.current = Math.atan2(toChar.x, toChar.z)
          } else {
            baseAngleRef.current = 0
          }
        }
      }

      sliderStateRef.current = { angleFraction, powerFraction, isDragging }
    }

    const handleSliderRelease = (e: Event) => {
      const customEvent = e as CustomEvent<{ angleFraction: number; powerFraction: number }>
      const { angleFraction, powerFraction } = customEvent.detail

      isDraggingRef.current = false
      if (controlsRef.current) {
        controlsRef.current.enabled = true
      }

      window.dispatchEvent(new CustomEvent('stop-aim-ball'))

      if (powerFraction > 0.05 && raccoonRef.current && footballRef.current) {
        const sliderAngle = angleFraction * Math.PI
        const kickAngle = baseAngleRef.current + Math.PI + sliderAngle

        const minImpulse = 0.02
        const maxImpulse = 0.13
        const impulseMagnitude = minImpulse + (maxImpulse - minImpulse) * powerFraction
        
        const impulseY = impulseMagnitude * 0.15
        const impulse = new THREE.Vector3(
          Math.sin(kickAngle) * impulseMagnitude,
          impulseY,
          Math.cos(kickAngle) * impulseMagnitude
        )

        let kickName = 'kick5'
        if (powerFraction >= 0.33 && powerFraction < 0.66) {
          kickName = 'kick1'
        } else if (powerFraction >= 0.66) {
          kickName = 'kick3'
        }

        window.dispatchEvent(new CustomEvent('trigger-kick', {
          detail: {
            name: kickName,
            customImpulse: impulse
          }
        }))
      }

      sliderStateRef.current = { angleFraction: 0, powerFraction: 0, isDragging: false }
    }

    window.addEventListener('slider-aim', handleSliderAim as EventListener)
    window.addEventListener('slider-release', handleSliderRelease as EventListener)
    return () => {
      window.removeEventListener('slider-aim', handleSliderAim as EventListener)
      window.removeEventListener('slider-release', handleSliderRelease as EventListener)
    }
  }, [])

  // Smoothly translate and orbit the camera to follow the character and align with aims
  useFrame((state, delta) => {
    if (raccoonRef.current && footballRef.current) {
      const charPos = raccoonRef.current.position
      const ballPos = footballRef.current.getPosition()

      // Calculate vector from ball to character on ground plane
      const toChar = new THREE.Vector3(charPos.x - ballPos.x, 0, charPos.z - ballPos.z)
      const dist = toChar.length()

      // Determine target angle, keeping the previous angle if the distance is too small to avoid spinning
      let targetAngle = currentAngleRef.current
      if (dist > 0.1) {
        targetAngle = Math.atan2(toChar.x, toChar.z)
      }

      // If dragging the slider, override targetAngle to rotate camera and character accordingly
      if (sliderStateRef.current.isDragging) {
        const sliderAngle = sliderStateRef.current.angleFraction * Math.PI
        targetAngle = baseAngleRef.current + sliderAngle

        const targetX = ballPos.x + Math.sin(targetAngle) * 1.2
        const targetZ = ballPos.z + Math.cos(targetAngle) * 1.2
        const kickAngle = targetAngle + Math.PI

        window.dispatchEvent(new CustomEvent('aim-ball', { 
          detail: { 
            angle: kickAngle, 
            targetX, 
            targetZ 
          } 
        }))
      }

      // Smoothly interpolate camera rotation angle using shortest-path interpolation (framerate independent, no overshoot)
      let angleDiff = targetAngle - currentAngleRef.current
      angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff))
      currentAngleRef.current += angleDiff * Math.min(1.0, 10.0 * delta)

      // Reconstruct smooth direction vector from the angle
      const dirX = Math.sin(currentAngleRef.current)
      const dirZ = Math.cos(currentAngleRef.current)

      // Update OrbitControls lookAt target position (2.2 meters in front of the raccoon towards the ball/field)
      const targetLookAtX = charPos.x - dirX * 2.2
      const targetLookAtY = charPos.y + 0.5
      const targetLookAtZ = charPos.z - dirZ * 2.2

      // Camera position: positioned behind character (away from the ball)
      const targetCamX = charPos.x + dirX * 6.3
      const targetCamY = charPos.y + 7.78
      const targetCamZ = charPos.z + dirZ * 6.3

      const controls = state.controls as { target: THREE.Vector3; update: () => void; enabled: boolean } | null
      const t = Math.min(1.0, 12.0 * delta)

      if (controls) {
        // Calculate the translation delta for the controls target
        controls.target.x += (targetLookAtX - controls.target.x) * t
        controls.target.y += (targetLookAtY - controls.target.y) * t
        controls.target.z += (targetLookAtZ - controls.target.z) * t

        state.camera.position.x += (targetCamX - state.camera.position.x) * t
        state.camera.position.y += (targetCamY - state.camera.position.y) * t
        state.camera.position.z += (targetCamZ - state.camera.position.z) * t

        controls.update()

        // Apply transient camera shake after OrbitControls update so it doesn't cause position drift
        if (shakeRef.current > 0) {
          state.camera.position.x += (Math.random() - 0.5) * shakeRef.current
          state.camera.position.y += (Math.random() - 0.5) * shakeRef.current
          state.camera.position.z += (Math.random() - 0.5) * shakeRef.current
          shakeRef.current = Math.max(0, shakeRef.current - 1.5 * delta)
        }
      } else {
        // Fallback camera positioning if controls are not loaded yet
        let shakeOffsetX = 0
        let shakeOffsetY = 0
        let shakeOffsetZ = 0
        if (shakeRef.current > 0) {
          shakeOffsetX = (Math.random() - 0.5) * shakeRef.current
          shakeOffsetY = (Math.random() - 0.5) * shakeRef.current
          shakeOffsetZ = (Math.random() - 0.5) * shakeRef.current
          shakeRef.current = Math.max(0, shakeRef.current - 1.5 * delta)
        }

        state.camera.position.x += (targetCamX - state.camera.position.x) * t + shakeOffsetX
        state.camera.position.y += (targetCamY - state.camera.position.y) * t + shakeOffsetY
        state.camera.position.z += (targetCamZ - state.camera.position.z) * t + shakeOffsetZ
        state.camera.lookAt(targetLookAtX, targetLookAtY, targetLookAtZ)
      }
    }

    // Aiming Slingshot trajectory and ground guide dots update loop
    if (isDraggingRef.current && footballRef.current && raccoonRef.current) {
      const ballPos = footballRef.current.getPosition()
      const powerFraction = sliderStateRef.current.powerFraction

      if (powerFraction > 0.01) {
        // Calculate aiming direction
        const sliderAngle = sliderStateRef.current.angleFraction * Math.PI
        const kickAngle = baseAngleRef.current + Math.PI + sliderAngle
        const dirNorm = new THREE.Vector3(Math.sin(kickAngle), 0, Math.cos(kickAngle))

        // Slingshot mapping: pull distance to impulse magnitude
        const minImpulse = 0.02
        const maxImpulse = 0.13
        const impulseMagnitude = minImpulse + (maxImpulse - minImpulse) * powerFraction

        // Calculate launching velocity: v0 = impulse / mass
        const mass = 0.43
        const v0 = new THREE.Vector3(
          (dirNorm.x * impulseMagnitude) / mass,
          (impulseMagnitude * 0.15) / mass,
          (dirNorm.z * impulseMagnitude) / mass
        )

        // Interpolate color from Cyan (blue) to Red based on pull force ratio
        const color = new THREE.Color().lerpColors(
          new THREE.Color('#22d3ee'),
          new THREE.Color('#f43f5e'),
          powerFraction
        )

        // Calculate active dots count based on pull force (from 2 up to max dots)
        const activeTrajCount = Math.round(2 + powerFraction * 28)
        const activeGroundCount = Math.round(2 + powerFraction * 18)

        // 1. Calculate and display 3D flight trajectory curve
        trajectoryDotsRef.current.forEach((dot, index) => {
          if (dot) {
            if (dot.material) {
              (dot.material as THREE.MeshBasicMaterial).color.copy(color)
            }

            if (index < activeTrajCount) {
              const time = index * 0.08
              const x = ballPos.x + v0.x * time
              const y = ballPos.y + v0.y * time - 0.5 * 9.81 * time * time
              const z = ballPos.z + v0.z * time

              if (y >= 0.11) {
                dot.position.set(x, y, z)
                dot.visible = true
              } else {
                dot.visible = false
              }
            } else {
              dot.visible = false
            }
          }
        })

        // 2. Calculate and display 2D flat ground direction guide
        groundDotsRef.current.forEach((dot, index) => {
          if (dot) {
            if (dot.material) {
              (dot.material as THREE.MeshBasicMaterial).color.copy(color)
            }

            if (index < activeGroundCount) {
              const stepDistance = index * 0.45
              const x = ballPos.x + dirNorm.x * stepDistance
              const y = 0.02
              const z = ballPos.z + dirNorm.z * stepDistance
              dot.position.set(x, y, z)
              dot.visible = true
            } else {
              dot.visible = false
            }
          }
        })
      } else {
        trajectoryDotsRef.current.forEach(dot => { if (dot) dot.visible = false })
        groundDotsRef.current.forEach(dot => { if (dot) dot.visible = false })
      }
    } else {
      trajectoryDotsRef.current.forEach(dot => { if (dot) dot.visible = false })
      groundDotsRef.current.forEach(dot => { if (dot) dot.visible = false })
    }
  })

  // Pointer Down Handler: Initializes aiming slingshot
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (footballRef.current && footballRef.current.isMoving()) return
    e.stopPropagation()

    // Disable OrbitControls rotation and zooming during aiming
    if (controlsRef.current) {
      controlsRef.current.enabled = false
    }

    isDraggingRef.current = true
    dragStartPointRef.current.copy(e.point)
    dragCurrentPointRef.current.copy(e.point)
  }

  // Pointer Move Handler: Calculates live angle & power ratios
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDraggingRef.current) return
    e.stopPropagation()
    dragCurrentPointRef.current.copy(e.point)

    if (footballRef.current) {
      const ballPos = footballRef.current.getPosition()
      const dir = dragStartPointRef.current.clone().sub(dragCurrentPointRef.current)
      const pullLength = dir.length()

      if (pullLength > 0.1) {
        const dirNorm = dir.clone().normalize()
        const angle = Math.atan2(dirNorm.x, dirNorm.z)

        // The character orbits exactly 1.2m behind the ball, opposite to kick vector
        const targetX = ballPos.x - dirNorm.x * 1.2
        const targetZ = ballPos.z - dirNorm.z * 1.2

        window.dispatchEvent(new CustomEvent('aim-ball', { 
          detail: { angle, targetX, targetZ } 
        }))
      }
    }
  }

  // Pointer Up Handler: Releases and triggers the kick
  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!isDraggingRef.current) return
    e.stopPropagation()
    isDraggingRef.current = false

    // Re-enable OrbitControls zoom controls
    if (controlsRef.current) {
      controlsRef.current.enabled = true
    }

    window.dispatchEvent(new CustomEvent('stop-aim-ball'))

    const dir = dragStartPointRef.current.clone().sub(dragCurrentPointRef.current)
    const pullLength = dir.length()

    // Launch ball only if pull length meets threshold (avoiding noise/taps)
    if (pullLength > 0.2) {
      const dirNorm = dir.clone().normalize()
      
      const minImpulse = 0.02
      const maxImpulse = 0.13
      const t = Math.min(Math.max((pullLength - 0.5) / 3.5, 0), 1)
      const impulseMagnitude = minImpulse + (maxImpulse - minImpulse) * t
      
      const impulseY = impulseMagnitude * 0.15
      const impulse = new THREE.Vector3(dirNorm.x * impulseMagnitude, impulseY, dirNorm.z * impulseMagnitude)

      // Map animation kick style according to pull back force
      let kickName = 'kick5' // Short
      if (t >= 0.33 && t < 0.66) {
        kickName = 'kick1' // Medium
      } else if (t >= 0.66) {
        kickName = 'kick3' // Max
      }

      window.dispatchEvent(new CustomEvent('trigger-kick', {
        detail: {
          name: kickName,
          customImpulse: impulse
        }
      }))
    }
  }

  // Listen for trigger-kick events to play physics animations on impact frames
  useEffect(() => {
    const handleTriggerKick = (e: Event) => {
      const customEvent = e as CustomEvent<{ name: string; customImpulse?: THREE.Vector3 }>
      const { name: kickName, customImpulse } = customEvent.detail

      const impulse = new THREE.Vector3(0, 0, 0)
      let delay = 0

      if (customImpulse) {
        // Slingshot drag kick vector mapping
        impulse.copy(customImpulse)
        if (kickName === 'kick5') delay = 950
        else if (kickName === 'kick1') delay = 650
        else if (kickName === 'kick2') delay = 550
        else if (kickName === 'kick3') delay = 900
      } else {
        // Fallback for button triggers
        if (kickName === 'kick5') {
          impulse.set(0, 0.005, -0.02)
          delay = 950
        } else if (kickName === 'kick1') {
          impulse.set(0, 0.008, -0.05)
          delay = 650
        } else if (kickName === 'kick2') {
          impulse.set(0, 0.012, -0.08)
          delay = 550
        } else if (kickName === 'kick3') {
          impulse.set(0, 0.02, -0.13)
          delay = 900
        }
      }

      if (impulse.lengthSq() > 0) {
        setTimeout(() => {
          if (footballRef.current) {
            footballRef.current.kick(impulse)
          }
        }, delay)
      }
    }

    window.addEventListener('trigger-kick', handleTriggerKick as EventListener)
    return () => {
      window.removeEventListener('trigger-kick', handleTriggerKick as EventListener)
    }
  }, [])

  return (
    <>
      {/* 3D Camera Controls (Rotation disabled, locked behind player looking down-field) */}
      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        enableZoom={true} 
        enableRotate={false}
        minDistance={5}
        maxDistance={25}
        target={[0, 0.5, -1.0]}
      />

      {/* R3F Rapier Physics World */}
      <Physics>
        {/* Sky, atmosphere & warm sunset lights */}
        <Sky 
          distance={450000} 
          sunPosition={[12, 6, 10]} 
          inclination={0.2} 
          azimuth={0.25} 
        />
        <Stars 
          radius={100} 
          depth={50} 
          count={2000} 
          factor={3} 
          saturation={0.5} 
          fade 
          speed={0.5} 
        />
        <directionalLight
          castShadow
          position={[25, 30, 20]}
          intensity={1.5}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-bias={-0.0002}
        />
        <ambientLight intensity={0.55} />
        <hemisphereLight 
          args={['#fef08a', '#14532d', 0.45]} 
        />
        
        {/* Ground Collision Base */}
        <RigidBody type="fixed" colliders="cuboid" friction={0.6}>
          <mesh receiveShadow position={[0, -0.25, 0]}>
            <boxGeometry args={[30, 0.5, 45]} />
            <meshStandardMaterial map={groundTexture} roughness={0.9} />
          </mesh>
        </RigidBody>

        {/* Invisible pointer aiming catcher plane (clicks handled via slider now) */}
        <mesh
          position={[0, 0.22, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <planeGeometry args={[120, 120]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* 3D Flight Trajectory Arc Dots (Rose red glowing spheres) */}
        {Array.from({ length: 30 }).map((_, i) => (
          <mesh 
            key={`traj-${i}`} 
            ref={(el) => { if (el) trajectoryDotsRef.current[i] = el }}
            visible={false}
          >
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color="#f43f5e" toneMapped={false} />
          </mesh>
        ))}

        {/* 2D Flat Ground Heading Guide Dots (Flat cyan rings) */}
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh 
            key={`ground-${i}`} 
            ref={(el) => { if (el) groundDotsRef.current[i] = el }}
            visible={false}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.02, 0.06, 16]} />
            <meshBasicMaterial color="#22d3ee" side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        ))}

        {/* Enclosing boundary walls (neon glowing glass borders with high bounciness) */}
        {/* Left Wall */}
        <BoundaryWall position={[-15.1, 1.0, 0]} args={[0.2, 2.0, 45.0]} color="#22d3ee" glowColor="#06b6d4" />
        {/* Right Wall */}
        <BoundaryWall position={[15.1, 1.0, 0]} args={[0.2, 2.0, 45.0]} color="#22d3ee" glowColor="#06b6d4" />
        {/* Top Wall */}
        <BoundaryWall position={[0, 1.0, -22.6]} args={[30.4, 2.0, 0.2]} color="#f43f5e" glowColor="#e11d48" />
        {/* Bottom Wall */}
        <BoundaryWall position={[0, 1.0, 22.6]} args={[30.4, 2.0, 0.2]} color="#f43f5e" glowColor="#e11d48" />

        {/* 1. Character Raccoon (Positioned at Z=1.2, facing -Z) */}
        <Raccoon 
          ref={raccoonRef}
          position={[0, 0, 1.2]} 
          rotationY={Math.PI} 
          scale={0.8}
        />

        {/* 2. Physics-Simulated Soccer Ball (Positioned at Z=0.0 near the character) */}
        <Football 
          ref={footballRef} 
          position={[0, 0.22, 0]} 
          onStop={(ballPos) => {
            window.dispatchEvent(new CustomEvent('run-to-ball', { detail: { x: ballPos.x, z: ballPos.z } }))
          }}
        />

      </Physics>
    </>
  )
}

export default GamePlayScene
