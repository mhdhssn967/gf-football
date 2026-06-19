import React from 'react'
import { RigidBody } from '@react-three/rapier'

interface TreeProps {
  position: [number, number, number]
  scale?: number
}

export const Tree: React.FC<TreeProps> = ({ position, scale = 1 }) => {
  return (
    <RigidBody type="fixed" colliders="hull" position={position}>
      <group scale={[scale, scale, scale]}>
        {/* Trunk */}
        <mesh castShadow position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.08, 0.14, 1.2, 16]} />
          <meshStandardMaterial color="#451a03" roughness={0.8} />
        </mesh>
        
        {/* Lower Leaves */}
        <mesh castShadow position={[0, 1.35, 0]}>
          <coneGeometry args={[0.75, 1.1, 16]} />
          <meshStandardMaterial color="#14532d" roughness={0.85} />
        </mesh>

        {/* Middle Leaves */}
        <mesh castShadow position={[0, 2.0, 0]}>
          <coneGeometry args={[0.6, 0.9, 16]} />
          <meshStandardMaterial color="#166534" roughness={0.85} />
        </mesh>

        {/* Top Leaves */}
        <mesh castShadow position={[0, 2.5, 0]}>
          <coneGeometry args={[0.45, 0.7, 16]} />
          <meshStandardMaterial color="#15803d" roughness={0.85} />
        </mesh>
      </group>
    </RigidBody>
  )
}

export default Tree
