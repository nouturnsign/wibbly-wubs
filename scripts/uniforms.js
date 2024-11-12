import * as THREE from "three";

const uniforms = {
  time: { value: 1.0 },
  resolution: {
    value: new THREE.Vector2(window.innerWidth, window.innerHeight),
  },
};

export default uniforms;
