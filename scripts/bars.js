import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import uniforms from "./uniforms";
import psychedelicMaterial from "./psychedelic";
import { getFreqData, getTimeData } from "./sound";

let scene;
let renderer;
let animationReq;

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

  // Create ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Modify this to make shadows/light more pronounced
  scene.add(ambientLight);

  // Create four spotlights
  const spotlight1 = new THREE.SpotLight(0xffffff, 100);
  spotlight1.position.set(8, 25, 8);
  spotlight1.lookAt(0, 0, 0);
  spotlight1.castShadow = true;
  scene.add(spotlight1);
  
  const spotlight2 = new THREE.SpotLight(0xffffff, 100);
  spotlight2.position.set(-8, 25, -8);
  spotlight2.lookAt(0, 0, 0);
  spotlight2.castShadow = true;
  scene.add(spotlight2);

  const spotlight3 = new THREE.SpotLight(0xffffff, 100);
  spotlight3.position.set(8, 25, -8);
  spotlight3.lookAt(0, 0, 0);
  spotlight3.castShadow = true;
  scene.add(spotlight3);

  const spotlight4 = new THREE.SpotLight(0xffffff, 100);
  spotlight4.position.set(-8, 25, 8);
  spotlight4.lookAt(0, 0, 0);
  spotlight4.castShadow = true;
  scene.add(spotlight4);

  // If you want to visualize a single spotlight, uncomment this part of the code
  /*
  const spotlightHelper1 = new THREE.SpotLightHelper(spotlight1);
  scene.add(spotlightHelper1);
  */

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
    animationReq = requestAnimationFrame(animate);

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

function destroyBarsScene() {
  if (animationReq) cancelAnimationFrame(animationReq);
  renderer.domElement.remove();

  scene = undefined;
  renderer = undefined;
  animationReq = undefined;

  bars = undefined;
  edges = undefined;
}

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

// Update bar colors based on RGB sliders
function updateBarColors() {
  const red = document.getElementById("red").value;
  const green = document.getElementById("green").value;
  const blue = document.getElementById("blue").value;
  const color = new THREE.Color(`rgb(${red}, ${green}, ${blue})`);

  bars.forEach((bar) => {
    bar.material.color.set(color);
  });
}

export {
  createBarsScene,
  destroyBarsScene,
  togglePsychedelicMode,
  updateBarColors,
};
