import { useRef, useImperativeHandle, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, RapierRigidBody, BallCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { useGameStore } from '@/stores/useGameStore'
import { useGLTF } from '@react-three/drei'

interface FootballProps {
  position?: [number, number, number]
  onKick?: () => void
  onStop?: (position: THREE.Vector3) => void
  ref?: React.Ref<{ kick: (impulse: THREE.Vector3) => void }>
}

export const Football: React.FC<FootballProps> = ({
  position = [0, 0.5, 0],
  onKick,
  onStop,
  ref,
}) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const decrementKicks = useGameStore((state) => state.decrementKicks)

  // Load the 3D ball model served from the public folder
  const gltf = useGLTF('/newball.glb')

  // Setup cast/receive shadows and adjust material properties on the ball model parts
  useEffect(() => {
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial
          if (mat.isMaterial) {
            mat.roughness = 0.55 // Increase roughness to avoid plastic-like reflection
            mat.metalness = 0.15 // Add subtle metallic response for 3D depth
            if (mat.color) {
              // Tone down bright white values slightly to prevent flat overexposure
              mat.color.setRGB(0.75, 0.75, 0.75)
            }
          }
        }
      }
    })
  }, [gltf.scene])

  const isMovingRef = useRef(false)

  // Expose control methods to parent components via ref
  useImperativeHandle(ref, () => ({
    kick: (impulse: THREE.Vector3) => {
      if (rigidBodyRef.current) {
        rigidBodyRef.current.applyImpulse(impulse, true)
        isMovingRef.current = true
        decrementKicks()
        if (onKick) onKick()
      }
    },
    reset: () => {
      if (rigidBodyRef.current) {
        rigidBodyRef.current.setTranslation({ x: position[0], y: position[1], z: position[2] }, true)
        rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
        rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
        isMovingRef.current = false
      }
    },
    getPosition: () => {
      if (rigidBodyRef.current) {
        const pos = rigidBodyRef.current.translation()
        return new THREE.Vector3(pos.x, pos.y, pos.z)
      }
      return new THREE.Vector3(position[0], position[1], position[2])
    },
    isMoving: () => {
      return isMovingRef.current
    }
  }))

  // Listen for reset-game event to return to starting positions
  useEffect(() => {
    const handleResetGame = () => {
      if (rigidBodyRef.current) {
        rigidBodyRef.current.setTranslation({ x: position[0], y: position[1], z: position[2] }, true)
        rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
        rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
        isMovingRef.current = false
      }
    }
    window.addEventListener('reset-game', handleResetGame)
    return () => {
      window.removeEventListener('reset-game', handleResetGame)
    }
  }, [position])

  useFrame(() => {
    if (!rigidBodyRef.current) return

    // Get current velocity and position
    const velocity = rigidBodyRef.current.linvel()
    const pos = rigidBodyRef.current.translation()
    const speed = new THREE.Vector3(velocity.x, velocity.y, velocity.z).length()

    // Out of bounds check
    if (pos.y < -5) {
      window.dispatchEvent(new CustomEvent('reset-game'))
    }

    // Stop check: if ball is moving and slows down below threshold, treat it as stopped
    const MOVEMENT_THRESHOLD = 0.05
    if (isMovingRef.current && speed < MOVEMENT_THRESHOLD) {
      isMovingRef.current = false
      // Zero out velocity to stop any micro-drifting
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)

      // Trigger stop callback
      const ballPos = new THREE.Vector3(pos.x, pos.y, pos.z)
      if (onStop) onStop(ballPos)
    }
  })

  const handleBallCollision = (event: { other: { rigidBodyObject?: THREE.Object3D | null } }) => {
    if (event.other.rigidBodyObject?.name === 'wall') {
      if (rigidBodyRef.current) {
        const vel = rigidBodyRef.current.linvel()
        const speed = Math.hypot(vel.x, vel.z)
        if (speed > 0.01) {
          // Rotate the velocity vector on the XZ plane by a random angle (±20 degrees)
          const angle = (Math.random() - 0.5) * 0.7
          const cos = Math.cos(angle)
          const sin = Math.sin(angle)

          const newVx = vel.x * cos - vel.z * sin
          const newVz = vel.x * sin + vel.z * cos

          rigidBodyRef.current.setLinvel({ x: newVx, y: vel.y, z: newVz }, true)
        }
      }
    }
  }

  return (
    <group>
      {/* Physics Simulated Ball with manual collider */}
      <RigidBody
        ref={rigidBodyRef}
        colliders={false} // Use explicit SphereCollider below
        position={position}
        mass={0.43}
        restitution={0.75} // bounce factor
        friction={0.4} // roll friction
        linearDamping={0.8} // grass resistance
        angularDamping={0.8}
        name="football"
        onCollisionEnter={handleBallCollision}
      >
        <BallCollider args={[0.11]} />
        {/* Render 3D GLB model scaled to match the 0.11 radius (0.22 diameter) collider */}
        <group scale={[0.22, 0.22, 0.22]}>
          <primitive object={gltf.scene} />
        </group>
      </RigidBody>
    </group>
  )
}

// Preload the ball GLB file for optimization
useGLTF.preload('/newball.glb')

export default Football
