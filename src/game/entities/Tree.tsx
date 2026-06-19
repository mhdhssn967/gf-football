import React from 'react'

interface TreeProps {
  position: [number, number, number]
  scale?: number
}

export const Tree: React.FC<TreeProps> = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh castShadow position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 1.5, 8]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
      
      {/* Lower Leaves */}
      <mesh castShadow position={[0, 1.75, 0]}>
        <coneGeometry args={[1.2, 1.5, 8]} />
        <meshStandardMaterial color="#1e4620" roughness={0.9} />
      </mesh>

      {/* Middle Leaves */}
      <mesh castShadow position={[0, 2.6, 0]}>
        <coneGeometry args={[0.9, 1.2, 8]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.9} />
      </mesh>

      {/* Top Leaves */}
      <mesh castShadow position={[0, 3.3, 0]}>
        <coneGeometry args={[0.6, 0.9, 8]} />
        <meshStandardMaterial color="#4caf50" roughness={0.9} />
      </mesh>
    </group>
  )
}

export default Tree
