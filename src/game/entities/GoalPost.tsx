import { RigidBody, CuboidCollider } from '@react-three/rapier'
import type { CollisionPayload } from '@react-three/rapier'
import { useGameStore } from '@/stores/useGameStore'

interface GoalPostProps {
  position?: [number, number, number]
  width?: number
  height?: number
  depth?: number
}

export const GoalPost: React.FC<GoalPostProps> = ({
  position = [0, 0, -10],
  width = 6,
  height = 3,
  depth = 2,
}) => {
  const setPhase = useGameStore((state) => state.setPhase)
  const addScore = useGameStore((state) => state.addScore)

  const handleGoalCollision = (event: CollisionPayload) => {
    // Check if the intersecting rigid body is the football
    if (event.other.rigidBodyObject?.name === 'football') {
      addScore(100)
      setPhase('VICTORY')
    }
  }

  return (
    <group position={position}>
      {/* 1. Static Physics Colliders for Metal Frame */}
      {/* Left Post */}
      <RigidBody type="fixed" colliders="cuboid" position={[-width / 2, height / 2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.08, height]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
      </RigidBody>

      {/* Right Post */}
      <RigidBody type="fixed" colliders="cuboid" position={[width / 2, height / 2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.08, height]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
      </RigidBody>

      {/* Crossbar */}
      <RigidBody
        type="fixed"
        colliders="cuboid"
        position={[0, height, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.08, width]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
      </RigidBody>

      {/* 2. Goal Net Visual Mesh */}
      <mesh receiveShadow position={[0, height / 2, -depth / 2]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color="#f1f5f9"
          wireframe
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Goal Sensor (Trigger Volume) */}
      {/* Triggers a goal when the ball enters the inside of the net */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[width / 2 - 0.2, height / 2, depth / 2 - 0.2]}
          position={[0, height / 2, -depth / 2]}
          sensor
          onIntersectionEnter={handleGoalCollision}
        />
      </RigidBody>
    </group>
  )
}

export default GoalPost
