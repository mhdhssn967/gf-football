import React, { useRef, useState } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BoundaryWallProps {
  position: [number, number, number]
  args: [number, number, number]
  color?: string
  glowColor?: string
}

export const BoundaryWall: React.FC<BoundaryWallProps> = ({ 
  position, 
  args, 
  color = '#22d3ee', 
  glowColor = '#06b6d4' 
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [glowIntensity, setGlowIntensity] = useState(0)

  // Handle collision enter
  const handleCollision = () => {
    // Set glow intensity to maximum on collision
    setGlowIntensity(2.5)
    // Dispatch a wall-hit event to trigger camera shake
    window.dispatchEvent(new CustomEvent('wall-hit'))
  }

  // Decay glow intensity back to 0
  useFrame((_state, delta) => {
    if (glowIntensity > 0) {
      setGlowIntensity(prev => Math.max(0, prev - 4.5 * delta))
    }
  })

  return (
    <RigidBody 
      name="wall"
      type="fixed" 
      colliders="cuboid" 
      position={position}
      restitution={0.9} 
      friction={0.1}
      onCollisionEnter={handleCollision}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={args} />
        {/* Futuristic glowing transparent glass material */}
        <meshStandardMaterial 
          color={color} 
          roughness={0.05}
          metalness={0.2}
          transparent={true}
          opacity={0.4}
          emissive={glowColor}
          emissiveIntensity={glowIntensity}
        />
      </mesh>
    </RigidBody>
  )
}

export default BoundaryWall
