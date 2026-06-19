import * as THREE from 'three'

/**
 * Utility functions for math, vectors, and physics calculations.
 */
export class GameHelpers {
  /**
   * Generates points along a projectile path in 3D world space.
   * Useful for drawing the prediction dots/lines of where the football will fly.
   * 
   * @param startPos The ball's start position
   * @param velocity The velocity vector applied
   * @param gravity Gravity constant (usually positive, e.g. 9.81)
   * @param numPoints Number of trajectory coordinates to return
   * @param timeStep Time interval between each point
   */
  static getTrajectoryPoints(
    startPos: THREE.Vector3,
    velocity: THREE.Vector3,
    gravity: number = 9.81,
    numPoints: number = 20,
    timeStep: number = 0.05
  ): THREE.Vector3[] {
    const points: THREE.Vector3[] = []
    
    for (let i = 0; i < numPoints; i++) {
      const t = i * timeStep
      
      // x = x0 + vx * t
      // y = y0 + vy * t - 0.5 * g * t^2
      // z = z0 + vz * t
      const x = startPos.x + velocity.x * t
      const y = startPos.y + velocity.y * t - 0.5 * gravity * t * t
      const z = startPos.z + velocity.z * t
      
      // Stop tracing if the trajectory intersects the ground
      if (y < 0 && i > 0) {
        points.push(new THREE.Vector3(x, 0, z))
        break
      }
      
      points.push(new THREE.Vector3(x, y, z))
    }
    
    return points
  }

  /**
   * Calculate distance between two vectors in 3D space.
   */
  static getDistance(pos1: [number, number, number], pos2: [number, number, number]): number {
    const v1 = new THREE.Vector3(...pos1)
    const v2 = new THREE.Vector3(...pos2)
    return v1.distanceTo(v2)
  }

  /**
   * Lerps between two values.
   */
  static lerp(start: number, end: number, amt: number): number {
    return (1 - amt) * start + amt * end
  }
}

export default GameHelpers
