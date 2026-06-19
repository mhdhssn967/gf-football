import React from 'react'
import { RigidBody } from '@react-three/rapier'

export type CountryCode = 'BR' | 'ES' | 'FR' | 'AR' | 'DE'

interface FlagProps {
  country: CountryCode
  position: [number, number, number]
  rotationY?: number
}

export const Flag: React.FC<FlagProps> = ({ country, position, rotationY = 0 }) => {
  return (
    <RigidBody type="fixed" colliders="hull" position={position} rotation={[0, rotationY, 0]}>
      {/* Flagpole */}
      <mesh castShadow position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 1.4, 8]} />
        <meshStandardMaterial color="#8a7e72" roughness={0.4} />
      </mesh>
      
      {/* Flag Finial (gold ball at the top) */}
      <mesh position={[0, 1.42, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
      </mesh>
 
      {/* Flag Fabric Banners */}
      <group position={[0.22, 1.1, 0]} scale={[0.5, 0.5, 0.5]}>
        {/* FRANCE (Vertical Blue, White, Red bands) */}
        {country === 'FR' && (
          <group>
            {/* Blue */}
            <mesh position={[-0.3, 0, 0]}>
              <boxGeometry args={[0.3, 0.6, 0.02]} />
              <meshStandardMaterial color="#002395" roughness={0.6} />
            </mesh>
            {/* White */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.3, 0.6, 0.02]} />
              <meshStandardMaterial color="#ffffff" roughness={0.6} />
            </mesh>
            {/* Red */}
            <mesh position={[0.3, 0, 0]}>
              <boxGeometry args={[0.3, 0.6, 0.02]} />
              <meshStandardMaterial color="#ed2939" roughness={0.6} />
            </mesh>
          </group>
        )}

        {/* GERMANY (Horizontal Black, Red, Gold bands) */}
        {country === 'DE' && (
          <group>
            {/* Black */}
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.9, 0.2, 0.02]} />
              <meshStandardMaterial color="#000000" roughness={0.6} />
            </mesh>
            {/* Red */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.9, 0.2, 0.02]} />
              <meshStandardMaterial color="#dd0000" roughness={0.6} />
            </mesh>
            {/* Gold */}
            <mesh position={[0, -0.2, 0]}>
              <boxGeometry args={[0.9, 0.2, 0.02]} />
              <meshStandardMaterial color="#ffce00" roughness={0.6} />
            </mesh>
          </group>
        )}

        {/* ARGENTINA (Horizontal Sky Blue, White, Sky Blue bands) */}
        {country === 'AR' && (
          <group>
            {/* Sky Blue */}
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.9, 0.2, 0.02]} />
              <meshStandardMaterial color="#75aadb" roughness={0.6} />
            </mesh>
            {/* White */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.9, 0.2, 0.02]} />
              <meshStandardMaterial color="#ffffff" roughness={0.6} />
            </mesh>
            {/* Sky Blue */}
            <mesh position={[0, -0.2, 0]}>
              <boxGeometry args={[0.9, 0.2, 0.02]} />
              <meshStandardMaterial color="#75aadb" roughness={0.6} />
            </mesh>
            {/* Sun in center (Yellow dot) */}
            <mesh position={[0, 0, 0.012]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#f1a80a" />
            </mesh>
          </group>
        )}

        {/* SPAIN (Horizontal Red, Yellow, Red bands) */}
        {country === 'ES' && (
          <group>
            {/* Red (Top) */}
            <mesh position={[0, 0.225, 0]}>
              <boxGeometry args={[0.9, 0.15, 0.02]} />
              <meshStandardMaterial color="#ad1519" roughness={0.6} />
            </mesh>
            {/* Yellow (Middle, twice as thick) */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.9, 0.3, 0.02]} />
              <meshStandardMaterial color="#fabd00" roughness={0.6} />
            </mesh>
            {/* Red (Bottom) */}
            <mesh position={[0, -0.225, 0]}>
              <boxGeometry args={[0.9, 0.15, 0.02]} />
              <meshStandardMaterial color="#ad1519" roughness={0.6} />
            </mesh>
          </group>
        )}

        {/* BRAZIL (Green field, Yellow diamond, Blue circle) */}
        {country === 'BR' && (
          <group>
            {/* Green Banner */}
            <mesh>
              <boxGeometry args={[0.9, 0.6, 0.02]} />
              <meshStandardMaterial color="#009739" roughness={0.6} />
            </mesh>
            {/* Yellow Diamond */}
            <mesh position={[0, 0, 0.012]} rotation={[0, 0, Math.PI / 4]}>
              <planeGeometry args={[0.38, 0.38]} />
              <meshBasicMaterial color="#fedf00" />
            </mesh>
            {/* Blue Globe */}
            <mesh position={[0, 0, 0.015]}>
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshBasicMaterial color="#00185f" />
            </mesh>
          </group>
        )}
      </group>
    </RigidBody>
  )
}

export default Flag
