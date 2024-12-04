import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { getFreqData } from "./sound";

let scene, camera, renderer, animationReq, waterMesh;
const gridSize = 128; // Number of grid points along one axis
const containerRadius = 35; // Radius of the container
const cellSize = (containerRadius * 2) / gridSize; // Size of each grid cell

// Settings

let impulseStrength = 1.2; // Magnitude of sound-driven impulses
document.getElementById("impulseStrength").addEventListener("input", (e) => {
  impulseStrength = parseFloat(e.target.value);
});

let damping = 1.001; // Damping factor for wave energy dissipation
document.getElementById("damping").addEventListener("input", (e) => {
  damping = parseFloat(e.target.value);
});

let emissiveIntensity = 0.3;
document.getElementById("emissiveIntensity").addEventListener("input", (e) => {
  const intensity = parseFloat(e.target.value);
  waterMesh.material.emissiveIntensity = intensity;
});

// Heightfield data
let heights = [];
let velocities = [];
let accelerations = [];

function initializeWaterData() {
  heights = Array(gridSize * gridSize).fill(0);
  velocities = Array(gridSize * gridSize).fill(0);
  accelerations = Array(gridSize * gridSize).fill(0);
}

function createWaterMesh() {
  const geometry = new THREE.PlaneGeometry(
    containerRadius * 2,
    containerRadius * 2,
    gridSize - 1,
    gridSize - 1,
  );
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.MeshStandardMaterial({
    color: 0x1e90ff, // Blue water
    roughness: 0.3, // Adjust for better reflections
    metalness: 0.6, // Slight metallic effect for realistic highlights
    emissive: new THREE.Color(0x003366), // Subtle glow in darker areas
    emissiveIntensity: emissiveIntensity,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return mesh;
}

function createFluidScene() {
  document.getElementById("impulseStrength").value = impulseStrength;
  document.getElementById("damping").value = damping;
  document.getElementById("emissiveIntensity").value = emissiveIntensity;

  // Initialize Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111); // Dark background for contrast

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 50, 50);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; // Enable shadow rendering
  document.body.appendChild(renderer.domElement);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Lighting
  const ambientLight = new THREE.HemisphereLight(0x88aaff, 0x444466, 0.6);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(50, 100, 50);
  directionalLight.castShadow = true;

  // Increase shadow map resolution for finer detail
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;

  // Widen the shadow camera bounds to cover the entire water surface
  directionalLight.shadow.camera.left = -containerRadius * 1.5;
  directionalLight.shadow.camera.right = containerRadius * 1.5;
  directionalLight.shadow.camera.top = containerRadius * 1.5;
  directionalLight.shadow.camera.bottom = -containerRadius * 1.5;

  // Set shadow camera near and far planes
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 500;

  // Adjust shadow bias to reduce artifacts
  directionalLight.shadow.bias = -0.0005;

  scene.add(ambientLight);
  scene.add(directionalLight);

  // Water Mesh
  waterMesh = createWaterMesh();
  initializeWaterData();
  scene.add(waterMesh);

  // Render Loop
  function animate() {
    animationReq = requestAnimationFrame(animate);

    const freqData = getFreqData();
    if (freqData) {
      applyImpulses(freqData);
    }

    updateWaterSimulation();
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

function applyImpulses(freqData) {
  for (let i = 0; i < freqData.length; i++) {
    const magnitude = freqData[i] / 255;
    const angle = (i / freqData.length) * Math.PI * 2;

    const x = Math.cos(angle) * containerRadius * 0.5;
    const z = Math.sin(angle) * containerRadius * 0.5;

    const gridX = Math.round((x + containerRadius) / cellSize);
    const gridZ = Math.round((z + containerRadius) / cellSize);

    const index = gridZ * gridSize + gridX;

    if (index < accelerations.length) {
      accelerations[index] += impulseStrength * magnitude;
    }
  }
}

function updateWaterSimulation() {
  const positions = waterMesh.geometry.attributes.position.array;

  for (let z = 0; z < gridSize; z++) {
    for (let x = 0; x < gridSize; x++) {
      const index = z * gridSize + x;

      // Update velocity and height
      velocities[index] += accelerations[index];
      velocities[index] /= damping;
      heights[index] += velocities[index];
      accelerations[index] = 0;

      // Constrain to circular container
      const worldX = (x - gridSize / 2) * cellSize;
      const worldZ = (z - gridSize / 2) * cellSize;
      const distance = Math.sqrt(worldX * worldX + worldZ * worldZ);

      if (distance < containerRadius) {
        positions[3 * index + 1] = heights[index];
      } else {
        positions[3 * index + 1] = 0; // Outside the container
      }
    }
  }

  // Compute wave propagation
  for (let z = 1; z < gridSize - 1; z++) {
    for (let x = 1; x < gridSize - 1; x++) {
      const index = z * gridSize + x;
      const heightSum =
        heights[index - 1] +
        heights[index + 1] +
        heights[index - gridSize] +
        heights[index + gridSize];
      const laplacian = heightSum - 4 * heights[index];

      accelerations[index] += laplacian * 0.1; // Wave propagation constant
    }
  }

  waterMesh.geometry.attributes.position.needsUpdate = true;
  waterMesh.geometry.computeVertexNormals(); // Update normals for lighting
}

function destroyFluidScene() {
  if (animationReq) cancelAnimationFrame(animationReq);
  renderer.domElement.remove();

  scene = undefined;
  camera = undefined;
  renderer = undefined;
  animationReq = undefined;
  waterMesh = undefined;
}

export { createFluidScene, destroyFluidScene };
