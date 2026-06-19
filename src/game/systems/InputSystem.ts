import * as THREE from 'three'

export interface DragInput {
  startScreenPos: THREE.Vector2
  currentScreenPos: THREE.Vector2
  isDragging: boolean
}

/**
 * InputSystem processes screen drag coordinates and converts them into
 * 3D world space direction and force vectors suitable for R3F Rapier physics impulses.
 */
export class InputSystem {
  private static MAX_DRAG_DISTANCE = 150 // pixels on screen for max power
  private static KICK_FORCE_MULTIPLIER = 1.8 // factor to scale drag into physical impulse

  /**
   * Translates 2D drag coordinates into a 3D impulse vector.
   * Dragging down/back shoots forward.
   * 
   * @param drag The current drag input state
   * @param camera The Three.js camera to translate coordinates relative to the view
   * @returns A 3D vector representing the direction and magnitude of the shot
   */
  static calculateImpulse(drag: DragInput, camera: THREE.Camera): THREE.Vector3 {
    if (!drag.isDragging) return new THREE.Vector3()

    // 1. Calculate drag delta
    const delta = new THREE.Vector2()
      .subVectors(drag.startScreenPos, drag.currentScreenPos) // vector pointing in direction of release
    
    const dragDistance = Math.min(delta.length(), this.MAX_DRAG_DISTANCE)
    const powerRatio = dragDistance / this.MAX_DRAG_DISTANCE // 0.0 to 1.0

    // 2. Determine forward and right directions based on camera yaw
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    forward.y = 0 // project onto horizontal ground
    forward.normalize()

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
    right.y = 0
    right.normalize()

    // 3. Convert screen delta to camera-relative directions
    // delta.x controls horizontal aim (perpendicular to camera forward)
    // delta.y controls vertical power (parallel to camera forward)
    const impulse = new THREE.Vector3()
      .addScaledVector(right, delta.x * 0.05)
      .addScaledVector(forward, delta.y * 0.05)

    // Normalize and scale by physics multiplier and drag ratio
    const force = powerRatio * this.KICK_FORCE_MULTIPLIER
    
    // Add upward lift to the shot based on drag power
    impulse.y = powerRatio * 1.5 // vertical lift
    
    // Apply final scale
    impulse.normalize().multiplyScalar(force * 15) // Apply baseline kick impulse

    return impulse
  }
}
export default InputSystem
