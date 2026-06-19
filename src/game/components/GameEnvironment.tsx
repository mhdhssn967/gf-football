import React from 'react'
import { Stars, Sky } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import Tree from '@/game/entities/Tree'

export const GameEnvironment: React.FC = () => {
  // Winding path nodes matching the visual layout of the reference image
  const pathNodes: [number, number, number][] = [
    [0, 0.02, 6.5],
    [-0.5, 0.02, 5.0],
    [-1.5, 0.02, 3.8],
    [-2.2, 0.02, 2.5],  // Near Brazil Flag
    [-2.0, 0.02, 1.0],
    [-1.0, 0.02, -0.2],
    [0.5, 0.02, -1.0],
    [2.0, 0.02, -2.2],   // Near Germany Flag
    [2.2, 0.02, -3.5],
    [1.5, 0.02, -4.8],
    [0.0, 0.02, -5.8],
    [-1.5, 0.02, -6.8],  // Near Spain Flag
    [-2.0, 0.02, -8.0],
    [-1.0, 0.02, -9.2],
    [0.0, 0.02, -10.5],  // Leading into the Goal
  ]

  // Pre-calculated tree coordinates to frame the path
  const leftForest: [number, number, number, number][] = [
    [-6.5, 0, 8, 1.2], [-8, 0, 6, 0.9], [-5.5, 0, 4, 1.1], [-7.5, 0, 2, 1.3],
    [-6.0, 0, 0, 1.0], [-8, 0, -2, 1.15], [-5.8, 0, -4, 0.8], [-7.2, 0, -6, 1.25],
    [-6.0, 0, -8, 1.05], [-7.8, 0, -10, 0.95], [-5.5, 0, -12, 1.2], [-7.0, 0, -14, 1.3],
    [-6.5, 0, -16, 1.1], [-5.0, 0, -18, 0.85]
  ]

  const rightForest: [number, number, number, number][] = [
    [6.5, 0, 7.5, 1.1], [8.0, 0, 5.5, 1.2], [5.5, 0, 3.0, 0.85], [7.2, 0, 1.0, 1.3],
    [6.2, 0, -1.0, 1.05], [7.8, 0, -3.0, 0.9], [5.8, 0, -5.0, 1.25], [7.0, 0, -7.0, 1.1],
    [6.0, 0, -9.0, 0.8], [7.5, 0, -11.0, 1.3], [5.8, 0, -13.0, 1.15], [7.2, 0, -15.0, 1.0],
    [6.5, 0, -17.0, 1.2], [5.5, 0, -19.0, 0.9]
  ]

  return (
    <group>
      {/* 1. Sky & Atmosphere */}
      <Sky 
        distance={450000} 
        sunPosition={[12, 6, 10]} // warmer sunset sun angle
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

      {/* 2. Warm Sunset Lighting */}
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
        args={['#fef08a', '#14532d', 0.45]} // Yellow-sky glow, green ground
      />

      {/* 3. Forest Trees (Left & Right Boundaries) */}
      {leftForest.map(([x, y, z, s], i) => (
        <Tree key={`tree_l_${i}`} position={[x, y, z]} scale={s} />
      ))}
      {rightForest.map(([x, y, z, s], i) => (
        <Tree key={`tree_r_${i}`} position={[x, y, z]} scale={s} />
      ))}

      {/* 4. River and Wooden Bridge on the Right */}
      {/* River Flow (Blue strip running down) */}
      <mesh position={[5.2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 40]} />
        <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.8} />
      </mesh>
      
      {/* Small Wooden Bridge crossing the River */}
      <group position={[5.2, 0.05, 4]}>
        {/* Bridge Planks */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.08, 1.2]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} /> {/* Dark Brown wood */}
        </mesh>
        {/* Left Handrail */}
        <mesh castShadow position={[0, 0.25, -0.55]}>
          <boxGeometry args={[1.8, 0.05, 0.05]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
        {/* Right Handrail */}
        <mesh castShadow position={[0, 0.25, 0.55]}>
          <boxGeometry args={[1.8, 0.05, 0.05]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
      </group>

      {/* 5. Scenic Boulders & Rocks */}
      <group>
        {/* Large Rock Left */}
        <mesh castShadow position={[-4.5, 0.3, 2]} rotation={[0.2, 0.5, 0.1]}>
          <dodecahedronGeometry args={[0.6]} />
          <meshStandardMaterial color="#64748b" roughness={0.8} />
        </mesh>
        {/* Small Rock Group Left */}
        <mesh castShadow position={[-4.2, 0.15, 3]} rotation={[0.4, 0.1, 0.5]}>
          <dodecahedronGeometry args={[0.35]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        {/* Rock Group Right */}
        <mesh castShadow position={[3.8, 0.2, -6]} rotation={[0.1, 0.2, 0.8]}>
          <dodecahedronGeometry args={[0.5]} />
          <meshStandardMaterial color="#64748b" roughness={0.8} />
        </mesh>
        <mesh castShadow position={[4.1, 0.1, -5.2]} rotation={[0.5, 0.6, 0.1]}>
          <dodecahedronGeometry args={[0.3]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
      </group>

      {/* 6. Tactical Winding Path Indicator (Dashed White circles) */}
      <group>
        {pathNodes.map(([x, y, z], i) => (
          <group key={`path_${i}`} position={[x, y, z]}>
            {/* Round path dot */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.12, 0.16, 16]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.65} />
            </mesh>
            {/* Smaller solid center dot */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.04, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 7. Scenic Fences (Wooden Rails) */}
      {/* Left side barricade fence */}
      <group position={[-2.5, 0.4, 4.5]} rotation={[0, -0.3, 0]}>
        {/* Fence Post 1 */}
        <mesh castShadow position={[-1, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        {/* Fence Post 2 */}
        <mesh castShadow position={[1, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        {/* Rail 1 */}
        <mesh castShadow position={[0, 0.2, 0]}>
          <boxGeometry args={[2.0, 0.06, 0.06]} />
          <meshStandardMaterial color="#a16207" />
        </mesh>
        {/* Rail 2 */}
        <mesh castShadow position={[0, -0.1, 0]}>
          <boxGeometry args={[2.0, 0.06, 0.06]} />
          <meshStandardMaterial color="#a16207" />
        </mesh>
      </group>

      {/* Right side fence by bridge */}
      <group position={[4.0, 0.4, 4.0]} rotation={[0, 1.57, 0]}>
        <mesh castShadow position={[-0.8, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh castShadow position={[0.8, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh castShadow position={[0, 0.15, 0]}>
          <boxGeometry args={[1.6, 0.06, 0.06]} />
          <meshStandardMaterial color="#a16207" />
        </mesh>
      </group>

      {/* 8. Invisible Boundaries (Rigid Bodies to keep ball in play) */}
      <RigidBody type="fixed" colliders="cuboid" restitution={0.8}>
        {/* Left boundary wall */}
        <mesh position={[-9, 0.5, 0]} visible={false}>
          <boxGeometry args={[0.5, 2, 40]} />
        </mesh>
        {/* Right boundary wall */}
        <mesh position={[9, 0.5, 0]} visible={false}>
          <boxGeometry args={[0.5, 2, 40]} />
        </mesh>
        {/* Back boundary wall */}
        <mesh position={[0, 0.5, -20.5]} visible={false}>
          <boxGeometry args={[18, 2, 0.5]} />
        </mesh>
        {/* Front boundary wall */}
        <mesh position={[0, 0.5, 20.5]} visible={false}>
          <boxGeometry args={[18, 2, 0.5]} />
        </mesh>
      </RigidBody>
    </group>
  )
}

export default GameEnvironment
