import React from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import type { CollisionPayload } from '@react-three/rapier'
import { useGameStore } from '@/stores/useGameStore'

interface ProceduralGoalPostProps {
  position?: [number, number, number]
  width?: number
  height?: number
  depth?: number
  postRadius?: number
}

const NetFace: React.FC<{
  width: number
  height: number
  spacing?: number
  stringRadius?: number
}> = ({ width, height, spacing = 0.08, stringRadius = 0.002 }) => {
  const horizontalCount = Math.floor(height / spacing) + 1
  const verticalCount = Math.floor(width / spacing) + 1

  return (
    <group>
      {/* Horizontal strings */}
      {Array.from({ length: horizontalCount }).map((_, i) => {
        const y = i * spacing - height / 2
        return (
          <mesh key={`h-${i}`} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[stringRadius, stringRadius, width, 4]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.6} />
          </mesh>
        )
      })}
      {/* Vertical strings */}
      {Array.from({ length: verticalCount }).map((_, i) => {
        const x = i * spacing - width / 2
        return (
          <mesh key={`v-${i}`} position={[x, 0, 0]} castShadow>
            <cylinderGeometry args={[stringRadius, stringRadius, height, 4]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.6} />
          </mesh>
        )
      })}
    </group>
  )
}

export const ProceduralGoalPost: React.FC<ProceduralGoalPostProps> = ({
  position = [0, 0, -5],
  width = 2.4,
  height = 1.2,
  depth = 0.8,
  postRadius = 0.04,
}) => {
  const setPhase = useGameStore((state) => state.setPhase)
  const addScore = useGameStore((state) => state.addScore)

  const handleGoalCollision = (event: CollisionPayload) => {
    if (event.other.rigidBodyObject?.name === 'football') {
      addScore(100)
      setPhase('VICTORY')
    }
  }

  // Common white gloss material for the metal frame
  const frameMaterial = (
    <meshStandardMaterial 
      color="#f8fafc" 
      roughness={0.15} 
      metalness={0.1} 
    />
  )

  return (
    <group position={position}>
      {/* --- 1. METAL FRAME WORK --- */}
      
      {/* Corner Joint Spheres for clean connections */}
      <mesh position={[-width / 2, height, 0]} castShadow>{/* Front Top Left */}
        <sphereGeometry args={[postRadius, 16, 16]} />
        {frameMaterial}
      </mesh>
      <mesh position={[width / 2, height, 0]} castShadow>{/* Front Top Right */}
        <sphereGeometry args={[postRadius, 16, 16]} />
        {frameMaterial}
      </mesh>
      <mesh position={[-width / 2, height, -depth]} castShadow>{/* Back Top Left */}
        <sphereGeometry args={[postRadius, 16, 16]} />
        {frameMaterial}
      </mesh>
      <mesh position={[width / 2, height, -depth]} castShadow>{/* Back Top Right */}
        <sphereGeometry args={[postRadius, 16, 16]} />
        {frameMaterial}
      </mesh>
      <mesh position={[-width / 2, postRadius, 0]} castShadow>{/* Front Bottom Left */}
        <sphereGeometry args={[postRadius, 16, 16]} />
        {frameMaterial}
      </mesh>
      <mesh position={[width / 2, postRadius, 0]} castShadow>{/* Front Bottom Right */}
        <sphereGeometry args={[postRadius, 16, 16]} />
        {frameMaterial}
      </mesh>
      <mesh position={[-width / 2, postRadius, -depth]} castShadow>{/* Back Bottom Left */}
        <sphereGeometry args={[postRadius, 16, 16]} />
        {frameMaterial}
      </mesh>
      <mesh position={[width / 2, postRadius, -depth]} castShadow>{/* Back Bottom Right */}
        <sphereGeometry args={[postRadius, 16, 16]} />
        {frameMaterial}
      </mesh>

      {/* Front Posts (Vertical) */}
      <mesh position={[-width / 2, height / 2, 0]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, height, 16]} />
        {frameMaterial}
      </mesh>
      <mesh position={[width / 2, height / 2, 0]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, height, 16]} />
        {frameMaterial}
      </mesh>

      {/* Front Crossbar */}
      <mesh position={[0, height, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, width, 16]} />
        {frameMaterial}
      </mesh>

      {/* Back Posts (Vertical) */}
      <mesh position={[-width / 2, height / 2, -depth]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, height, 16]} />
        {frameMaterial}
      </mesh>
      <mesh position={[width / 2, height / 2, -depth]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, height, 16]} />
        {frameMaterial}
      </mesh>

      {/* Back Top Crossbar */}
      <mesh position={[0, height, -depth]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, width, 16]} />
        {frameMaterial}
      </mesh>

      {/* Back Bottom Crossbar */}
      <mesh position={[0, postRadius, -depth]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, width, 16]} />
        {frameMaterial}
      </mesh>

      {/* Left Top Support (Z-aligned) */}
      <mesh position={[-width / 2, height, -depth / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, depth, 16]} />
        {frameMaterial}
      </mesh>

      {/* Right Top Support (Z-aligned) */}
      <mesh position={[width / 2, height, -depth / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, depth, 16]} />
        {frameMaterial}
      </mesh>

      {/* Left Bottom Support (Z-aligned) */}
      <mesh position={[-width / 2, postRadius, -depth / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, depth, 16]} />
        {frameMaterial}
      </mesh>

      {/* Right Bottom Support (Z-aligned) */}
      <mesh position={[width / 2, postRadius, -depth / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, depth, 16]} />
        {frameMaterial}
      </mesh>


      {/* --- 2. NET GRID SURFACES --- */}
      
      {/* Back Net Face */}
      <group position={[0, height / 2, -depth + postRadius]}>
        <NetFace width={width - postRadius * 2} height={height - postRadius} />
      </group>

      {/* Top Net Face */}
      <group position={[0, height - postRadius, -depth / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <NetFace width={width - postRadius * 2} height={depth - postRadius * 2} />
      </group>

      {/* Left Net Face */}
      <group position={[-width / 2 + postRadius, height / 2, -depth / 2]} rotation={[0, Math.PI / 2, 0]}>
        <NetFace width={depth - postRadius * 2} height={height - postRadius} />
      </group>

      {/* Right Net Face */}
      <group position={[width / 2 - postRadius, height / 2, -depth / 2]} rotation={[0, Math.PI / 2, 0]}>
        <NetFace width={depth - postRadius * 2} height={height - postRadius} />
      </group>


      {/* --- 3. PHYSICS COLLIDERS --- */}

      {/* Left Post Collider */}
      <RigidBody type="fixed" colliders="cuboid" position={[-width / 2, height / 2, 0]}>
        <mesh visible={false}>
          <cylinderGeometry args={[postRadius, postRadius, height, 8]} />
        </mesh>
      </RigidBody>

      {/* Right Post Collider */}
      <RigidBody type="fixed" colliders="cuboid" position={[width / 2, height / 2, 0]}>
        <mesh visible={false}>
          <cylinderGeometry args={[postRadius, postRadius, height, 8]} />
        </mesh>
      </RigidBody>

      {/* Crossbar Collider */}
      <RigidBody
        type="fixed"
        colliders="cuboid"
        position={[0, height, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <mesh visible={false}>
          <cylinderGeometry args={[postRadius, postRadius, width, 8]} />
        </mesh>
      </RigidBody>

      {/* Top Left Support Collider */}
      <RigidBody
        type="fixed"
        colliders="cuboid"
        position={[-width / 2, height, -depth / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <mesh visible={false}>
          <cylinderGeometry args={[postRadius, postRadius, depth, 8]} />
        </mesh>
      </RigidBody>

      {/* Top Right Support Collider */}
      <RigidBody
        type="fixed"
        colliders="cuboid"
        position={[width / 2, height, -depth / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <mesh visible={false}>
          <cylinderGeometry args={[postRadius, postRadius, depth, 8]} />
        </mesh>
      </RigidBody>

      {/* Goal Target Sensor Trigger Volume */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[width / 2 - postRadius * 2, height / 2, depth / 2 - postRadius * 2]}
          position={[0, height / 2, -depth / 2]}
          sensor
          onIntersectionEnter={handleGoalCollision}
        />
      </RigidBody>
    </group>
  )
}

export default ProceduralGoalPost
