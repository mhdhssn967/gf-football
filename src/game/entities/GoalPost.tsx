import { useEffect } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import type { CollisionPayload } from '@react-three/rapier'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '@/stores/useGameStore'

interface GoalPostProps {
  position?: [number, number, number]
  width?: number
  height?: number
  depth?: number
}

export const GoalPost: React.FC<GoalPostProps> = ({
  position = [0, 0, -20],
  width = 0.06,
  height = 0.04,
  depth = 0.03,
}) => {
  const setPhase = useGameStore((state) => state.setPhase)
  const addScore = useGameStore((state) => state.addScore)

  // Load the 3D GoalPost model served from the public folder
  const gltf = useGLTF('/goalpost.glb')

  useEffect(() => {
    gltf.scene.traverse((child) => {
      // Deactivate any embedded light sources bundled inside the GLTF model
      if (child instanceof THREE.Light) {
        child.visible = false
        child.intensity = 0
      }
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        // Turn down any high emissive glow on the material
        const mesh = child as THREE.Mesh
        if (mesh.material && 'emissive' in mesh.material) {
          ;(mesh.material as any).emissive.setScalar(0)
        }
      }
    })
  }, [gltf.scene])

  const handleGoalCollision = (event: CollisionPayload) => {
    // Check if the intersecting rigid body is the football
    if (event.other.rigidBodyObject?.name === 'football') {
      addScore(100)
      setPhase('VICTORY')
    }
  }

  return (
    <group position={position}>
      {/* Render the 3D GoalPost GLB Model scaled down */}
      <primitive object={gltf.scene} scale={[0.0075, 0.0075, 0.0075]} />

      {/* 1. Static Physics Colliders for Metal Frame (Invisible) */}
      {/* Left Post */}
      <RigidBody type="fixed" colliders="cuboid" position={[-width / 2, height / 2, 0]}>
        <mesh visible={false}>
          <cylinderGeometry args={[0.004, 0.004, height]} />
        </mesh>
      </RigidBody>

      {/* Right Post */}
      <RigidBody type="fixed" colliders="cuboid" position={[width / 2, height / 2, 0]}>
        <mesh visible={false}>
          <cylinderGeometry args={[0.004, 0.004, height]} />
        </mesh>
      </RigidBody>

      {/* Crossbar */}
      <RigidBody
        type="fixed"
        colliders="cuboid"
        position={[0, height, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <mesh visible={false}>
          <cylinderGeometry args={[0.004, 0.004, width]} />
        </mesh>
      </RigidBody>

      {/* 3. Goal Sensor (Trigger Volume) */}
      {/* Triggers a goal when the ball enters the inside of the net */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[width / 2, height / 2, depth / 2]}
          position={[0, height / 2, -depth / 2]}
          sensor
          onIntersectionEnter={handleGoalCollision}
        />
      </RigidBody>
    </group>
  )
}

// Preload the goalpost GLB file for optimization
useGLTF.preload('/goalpost.glb')

export default GoalPost
