import React from 'react'

interface TargetProps {
  position: [number, number, number]
  rotationY?: number
  scale?: number
}

export const Target: React.FC<TargetProps> = ({ position, rotationY = 0, scale = 1 }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={[scale, scale, scale]}>
      {/* 1. Wooden Stand Tripod Legs */}
      {/* Back leg */}
      <mesh castShadow position={[0, 0.5, -0.35]} rotation={[-0.3, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
      </mesh>
      {/* Left leg */}
      <mesh castShadow position={[-0.25, 0.5, 0]} rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
      </mesh>
      {/* Right leg */}
      <mesh castShadow position={[0.25, 0.5, 0]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
      </mesh>

      {/* 2. Concentric Target Face Rings */}
      <group position={[0, 1.0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        {/* Outer White Ring */}
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.08, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        
        {/* Second Red Ring */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.082, 32]} />
          <meshStandardMaterial color="#dc2626" roughness={0.5} />
        </mesh>

        {/* Third White Ring */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.084, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>

        {/* Bullseye Red Center */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.086, 32]} />
          <meshStandardMaterial color="#dc2626" roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

export default Target
