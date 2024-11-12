import * as THREE from "three";
import uniforms from "./uniforms";

// Vertex Shader
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Fragment Shader
const fragmentShader = `
    uniform float time;
    uniform vec2 resolution;
    varying vec2 vUv;

    void main() {
        vec2 st = vUv;
        st.x *= resolution.x / resolution.y;

        // Create a trippy effect by using sine waves and color shifting
        float colorR = sin(st.x * 10.0 + time * 2.0) * 0.5 + 0.5;
        float colorG = sin(st.y * 10.0 + time * 3.0) * 0.5 + 0.5;
        float colorB = sin((st.x + st.y) * 10.0 + time * 4.0) * 0.5 + 0.5;

        gl_FragColor = vec4(colorR, colorG, colorB, 1.0);
    }
`;

// Create Shader Material
const psychedelicMaterial = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
});

export default psychedelicMaterial;
