import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import uniforms from "./uniforms";
import psychedelicMaterial from "./psychedelic";
import { getFreqData, getTimeData } from "./sound";

let scene;
let renderer;

let bars;
let edges;

let isPsychedelic = false;

const barCount = 32;
const barWidth = 1.5; // Width
const barHeight = 15; // Initial height (Update to vary dynamically based off of audio input)
const barDepth = 1.5; // Depth
const spacing = 0.5; // Spacing in between bars (so they dont overlap)

const totalWidth = barCount * (barWidth + spacing);
const radius = totalWidth / (2 * Math.PI);

function createBarsScene() {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.insertBefore(
    renderer.domElement,
    document.getElementById("settings"),
  );

  // Use Perspective Camera for a better 3D view
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 35, 0); // Position the camera above the circle of 3D bars
  camera.lookAt(0, 0, 0);

  // Add OrbitControls to increase user interaction
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Create an array of 32 bars
  bars = [];
  edges = [];

  // Create point light
  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(0, 0.5, 0);
  scene.add(pointLight);

  // Create ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Load the turntable texture
  const textureLoader = new THREE.TextureLoader();
  const platformTexture = textureLoader.load("./TransparentCropped.png");

  // Create the platform geometry and material
  const platformSize = radius * 4;
  const platformHeight = 1;
  const platformGeometry = new THREE.BoxGeometry(
    platformSize,
    platformHeight,
    platformSize,
  );
  const platformMaterial = new THREE.MeshPhongMaterial({
    map: platformTexture,
    color: 0x888888, // Gray color for the platform
  });

  const platform = new THREE.Mesh(platformGeometry, platformMaterial);
  platform.position.y = -0.51; // A little below -0.5 to avoid platform/bar overlap
  platform.position.x = 4; // Center the circle on the turntable disk
  // Add the platform to the scene
  scene.add(platform);

  for (let i = 0; i < barCount; i++) {
    // Create the bar geometry and material
    const geometry = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
    geometry.translate(0, barHeight / 2, 0);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const bar = new THREE.Mesh(geometry, material);

    // Create edges for the bar
    const edge = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const line = new THREE.LineSegments(edge, lineMaterial);

    // Position the bars in a circle
    const angle = (i / barCount) * Math.PI * 2;
    bar.position.x = Math.cos(angle) * radius;
    bar.position.z = Math.sin(angle) * radius;
    bar.position.y = 0;

    // Rotate the bars to face outward
    bar.rotation.y = -angle;

    // Position the edges to be on the bars
    line.position.copy(bar.position);
    line.rotation.copy(bar.rotation);

    // Add the bars and edges to the scene
    scene.add(bar);
    scene.add(line);
    bars.push(bar);
    edges.push(line);
  }

  // Render loop
  function animate() {
    requestAnimationFrame(animate);

    const freq = getFreqData();
    if (freq) {
      for (let i = 0; i < bars.length; ++i) {
        const scale = freq[i] / 255;
        bars[i].scale.set(1, scale, 1);
        edges[i].scale.set(1, scale, 1);
      }
    }

    uniforms.time.value += 0.05;
    // Update the controls
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

function destroyBarsScene() {}

// Update meshes to toggle psychedelic mode
function togglePsychedelicMode() {
  if (!isPsychedelic) {
    for (let i = 0; i < barCount; i++) {
      bars[i].material = psychedelicMaterial;
    }
  } else {
    for (let i = 0; i < barCount; i++) {
      bars[i].material = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        shininess: 100,
      });
    }
    updateBarColors();
  }
  isPsychedelic = !isPsychedelic;
}

// Handle texture input
function handleTextureInput(event) {
  const file = event.target.files[0];

  if (!file) {
    updateBarColors();
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const dataURL = e.target.result;
    const texture = new THREE.TextureLoader().load(dataURL, () => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      // One small problem -- the top and bottom faces on each bar aren't done right
      texture.repeat.set(1, barHeight / barWidth);
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;

      bars.forEach((bar) => {
        bar.material = new THREE.MeshBasicMaterial({
          map: texture,
          color: 0xffffff,
          transparent: true,
        });
        bar.material.needsUpdate = true;
      });
    });
  };

  reader.readAsDataURL(file);
}

// Update bar colors based on RGB sliders
function updateBarColors() {
  const red = document.getElementById("red").value;
  const green = document.getElementById("green").value;
  const blue = document.getElementById("blue").value;
  const color = new THREE.Color(`rgb(${red}, ${green}, ${blue})`);

  bars.forEach((bar) => {
    bar.material.map = null; // Remove the texture
    bar.material.color.set(color);
    bar.material.needsUpdate = true;
  });
}

export {
  createBarsScene,
  destroyBarsScene,
  togglePsychedelicMode,
  handleTextureInput,
  updateBarColors,
};
