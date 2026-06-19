import React from 'react'
import * as THREE from 'three'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import Flag from '@/game/entities/Flag'

export const GameEnvironment: React.FC = () => {
  // Generate a procedural repeating brown brick texture
  const brickTexture = React.useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Base color: Terracotta brown brick
      ctx.fillStyle = '#7c2d12'
      ctx.fillRect(0, 0, 256, 256)
      
      // Mortar lines: dark concrete brown
      ctx.strokeStyle = '#451a03'
      ctx.lineWidth = 3
      
      const rows = 16
      const cols = 8
      const rh = 256 / rows
      const cw = 256 / cols
      
      for (let r = 0; r < rows; r++) {
        const y = r * rh
        // Horizontal line
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(256, y)
        ctx.stroke()
        
        // Vertical offset joints
        const shift = (r % 2) * (cw / 2)
        for (let c = 0; c <= cols; c++) {
          const x = (c * cw + shift) % 256
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x, y + rh)
          ctx.stroke()
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture
  }, [])

  // Clone textures with appropriate repeats for different walls
  const sideTexture = React.useMemo(() => {
    const tex = brickTexture.clone()
    tex.repeat.set(1, 12)
    return tex
  }, [brickTexture])

  const frontBackTexture = React.useMemo(() => {
    const tex = brickTexture.clone()
    tex.repeat.set(6, 1)
    return tex
  }, [brickTexture])

  return (
    <group>
      {/* 1. Left Brick Wall Boundary */}
      <RigidBody type="fixed" colliders={false} position={[-4.5, 0.75, 1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.3, 1.5, 21]} />
          <meshStandardMaterial map={sideTexture} roughness={0.9} />
        </mesh>
        {/* Stone Cap */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[0.4, 0.1, 21.2]} />
          <meshStandardMaterial color="#d6d3d1" roughness={0.8} />
        </mesh>
        {/* Extra thick and tall outer collider to completely prevent tunneling */}
        <CuboidCollider args={[1.0, 1.0, 10.5]} position={[-0.85, 0.25, 0]} />
      </RigidBody>

      {/* 2. Right Brick Wall Boundary */}
      <RigidBody type="fixed" colliders={false} position={[4.5, 0.75, 1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.3, 1.5, 21]} />
          <meshStandardMaterial map={sideTexture} roughness={0.9} />
        </mesh>
        {/* Stone Cap */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[0.4, 0.1, 21.2]} />
          <meshStandardMaterial color="#d6d3d1" roughness={0.8} />
        </mesh>
        {/* Extra thick and tall outer collider to completely prevent tunneling */}
        <CuboidCollider args={[1.0, 1.0, 10.5]} position={[0.85, 0.25, 0]} />
      </RigidBody>

      {/* 3. Back Brick Wall Boundary (Behind the Goal) */}
      <RigidBody type="fixed" colliders={false} position={[0, 0.75, -9.5]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[9.3, 1.5, 0.3]} />
          <meshStandardMaterial map={frontBackTexture} roughness={0.9} />
        </mesh>
        {/* Stone Cap */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[9.5, 0.1, 0.4]} />
          <meshStandardMaterial color="#d6d3d1" roughness={0.8} />
        </mesh>
        {/* Extra thick and tall outer collider to completely prevent tunneling */}
        <CuboidCollider args={[4.65, 1.0, 1.0]} position={[0, 0.25, -0.85]} />
      </RigidBody>

      {/* 4. Front Brick Wall Boundary (Behind Shooter) */}
      <RigidBody type="fixed" colliders={false} position={[0, 0.75, 11.5]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[9.3, 1.5, 0.3]} />
          <meshStandardMaterial map={frontBackTexture} roughness={0.9} />
        </mesh>
        {/* Stone Cap */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[9.5, 0.1, 0.4]} />
          <meshStandardMaterial color="#d6d3d1" roughness={0.8} />
        </mesh>
        {/* Extra thick and tall outer collider to completely prevent tunneling */}
        <CuboidCollider args={[4.65, 1.0, 1.0]} position={[0, 0.25, 0.85]} />
      </RigidBody>

      {/* 5. Scenic Boulders & Rocks (pulled closer to center) */}
      <RigidBody type="fixed" colliders="hull">
        <group>
          {/* Large Rock Left */}
          <mesh castShadow position={[-3.2, 0.3, 2]} rotation={[0.2, 0.5, 0.1]}>
            <dodecahedronGeometry args={[0.6]} />
            <meshStandardMaterial color="#64748b" roughness={0.8} />
          </mesh>
          {/* Small Rock Group Left */}
          <mesh castShadow position={[-3.0, 0.15, 3]} rotation={[0.4, 0.1, 0.5]}>
            <dodecahedronGeometry args={[0.35]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
          {/* Rock Group Right */}
          <mesh castShadow position={[2.6, 0.2, -6]} rotation={[0.1, 0.2, 0.8]}>
            <dodecahedronGeometry args={[0.5]} />
            <meshStandardMaterial color="#64748b" roughness={0.8} />
          </mesh>
          <mesh castShadow position={[2.8, 0.1, -5.2]} rotation={[0.5, 0.6, 0.1]}>
            <dodecahedronGeometry args={[0.3]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
        </group>
      </RigidBody>

      {/* 6. Scenic Fences (Wooden Rails) */}
      {/* Left side barricade fence */}
      <RigidBody type="fixed" colliders="hull" position={[-2.0, 0.4, 4.5]} rotation={[0, -0.3, 0]}>
        <group>
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
      </RigidBody>

      {/* 7. Country Flags along the path (repositioned closer to match new spacing) */}
      <Flag country="BR" position={[-2.0, 0, 4.5]} rotationY={Math.PI / 4} />
      <Flag country="ES" position={[-1.5, 0, 1.0]} rotationY={-Math.PI / 6} />
      <Flag country="AR" position={[1.5, 0, -1.0]} rotationY={Math.PI / 6} />
      <Flag country="DE" position={[1.8, 0, -3.5]} rotationY={Math.PI / 3} />
      <Flag country="FR" position={[-1.5, 0, -6.8]} rotationY={-Math.PI / 4} />
    </group>
  )
}

export default GameEnvironment
