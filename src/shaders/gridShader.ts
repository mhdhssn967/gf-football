import * as THREE from 'three'

/**
 * GridShader defines a custom GLSL shader configuration.
 * It creates a glowing tactical mesh overlay suitable for pitch markings
 * or obstacles in a football puzzle game.
 */
export const GridShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00f2fe') },
    uGridSize: { value: 20.0 },
    uGlowStrength: { value: 0.5 },
  },
  
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uGridSize;
    uniform float uGlowStrength;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      // Create a grid pattern based on UV coordinates
      vec2 grid = abs(fract(vUv * uGridSize - 0.5) - 0.5) / fwidth(vUv * uGridSize);
      float line = min(grid.x, grid.y);
      float gridAlpha = 1.0 - min(line, 1.0);
      
      // Add a pulsation glow wave effect over time
      float wave = sin(vPosition.z * 0.5 - uTime * 2.0) * 0.5 + 0.5;
      float glow = gridAlpha * (0.3 + wave * uGlowStrength);
      
      // Fade out near the edges of the mesh
      float edgeFade = 1.0 - length(vUv - 0.5) * 2.0;
      edgeFade = clamp(edgeFade * 1.5, 0.0, 1.0);
      
      gl_FragColor = vec4(uColor, glow * edgeFade);
    }
  `
}

export default GridShader
