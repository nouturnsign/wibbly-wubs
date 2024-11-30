/*
// Original Code (Want to make the bars 3D though)
//NOTE: If we instead use an orthographic camera, the bars can be uniformly spaced
import * as THREE from "three";
import uniforms from "./uniforms";
import psychedelicMaterial from "./psychedelic";
import { getFreqData, getTimeData } from "./sound";

// Load Google Fonts
const link = document.createElement("link");
link.href =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap";
link.rel = "stylesheet";
document.head.appendChild(link);

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.insertBefore(
  renderer.domElement,
  document.getElementById("settings"),
);
// document.body.appendChild(renderer.domElement);

const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 50;
const camera = new THREE.OrthographicCamera(
  (frustumSize * aspect) / -2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  frustumSize / -2,
  1,
  1000,
);
camera.position.z = 40;

// Create an array of 32 bars
const barCount = 32;
const barWidth = 1.4; // Width
const barHeight = 20; // Initial height (Update to vary dynamically based off of audio input)
const barDepth = 1; // Depth
const spacing = 0.2; // Small spacing between bars (so they don't overlap)

const bars = [];
const startX = -(barCount * (barWidth + spacing) - spacing) / 2; // Calculate the starting x position for the first bar

for (let i = 0; i < barCount; i++) {
  // Create the bar geometry and material
  const geometry = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
  geometry.translate(0, barHeight / 2, 0);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const bar = new THREE.Mesh(geometry, material);

  // Position the bars
  bar.position.x = startX + i * (barWidth + spacing);
  bar.position.y = -20;
  //   bar.position.y = -10; // -10 pushes the bars down to make space for the settings bar

  // Add the bars to the scene
  scene.add(bar);
  bars.push(bar);
}

// Update meshes to toggle psychedelic mode
let isPsychedelic = false;
function togglePsychedelicMode() {
  if (!isPsychedelic) {
    for (let i = 0; i < barCount; i++) {
      bars[i].material = psychedelicMaterial;
    }
  } else {
    for (let i = 0; i < barCount; i++) {
      bars[i].material = new THREE.MeshBasicMaterial();
    }
    updateBarColors();
  }
  isPsychedelic = !isPsychedelic;
}

// Render loop
function animate() {
  requestAnimationFrame(animate);

  const freq = getFreqData();
  if (freq) {
    for (let i = 0; i < bars.length; ++i) {
      const scale = freq[i] / 255;
      //   bars[i].translateY(-10);
      bars[i].scale.set(1, scale, 1);
      //   bars[i].translateY(10);
    }
  }

  uniforms.time.value += 0.05;
  renderer.render(scene, camera);
}

animate();

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
document.getElementById("red").addEventListener("input", updateBarColors);
document.getElementById("green").addEventListener("input", updateBarColors);
document.getElementById("blue").addEventListener("input", updateBarColors);

// Placeholder buttons for switching modes
// Since the second mode hasn't yet been developed, this is still a WIP
document.getElementById("barMode").addEventListener("click", () => {
  alert("Switch to bar graph music visualizer");
});
document.getElementById("particleMode").addEventListener("click", () => {
  alert(
    "Switch to particle-like music visualizer with more interesting patterns",
  );
});

document
  .getElementById("psychedelic")
  .addEventListener("input", togglePsychedelicMode);
*/

import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import uniforms from "./uniforms";
import psychedelicMaterial from "./psychedelic";
import { getFreqData, getTimeData } from "./sound";

// Load Google Fonts
const link = document.createElement("link");
link.href =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap";
link.rel = "stylesheet";
document.head.appendChild(link);

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
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
  1000
);
camera.position.set(0, 35, 0); // Position the camera above the circle of 3D bars
camera.lookAt(0, 0, 0);

// Add OrbitControls to increase user interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Create an array of 32 bars
const barCount = 32;
const barWidth = 1.5; // Width
const barHeight = 15; // Initial height (Update to vary dynamically based off of audio input)
const barDepth = 1.5; // Depth
const spacing = 0.5; // Spacing in between bars (so they dont overlap)

const totalWidth = barCount * (barWidth + spacing);
const radius = totalWidth / (2 * Math.PI);

const bars = [];
const edges = [];

for (let i = 0; i < barCount; i++) {
  // Create the bar geometry and material
  const geometry = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
  geometry.translate(0, barHeight / 2, 0);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
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

// Update meshes to toggle psychedelic mode
let isPsychedelic = false;
function togglePsychedelicMode() {
  if (!isPsychedelic) {
    for (let i = 0; i < barCount; i++) {
      bars[i].material = psychedelicMaterial;
    }
  } else {
    for (let i = 0; i < barCount; i++) {
      bars[i].material = new THREE.MeshBasicMaterial();
    }
    updateBarColors();
  }
  isPsychedelic = !isPsychedelic;
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
document.getElementById("red").addEventListener("input", updateBarColors);
document.getElementById("green").addEventListener("input", updateBarColors);
document.getElementById("blue").addEventListener("input", updateBarColors);

// Placeholder buttons for switching modes
// Since the second mode hasn't yet been developed, this is still a WIP
document.getElementById("barMode").addEventListener("click", () => {
  alert("Switch to bar graph music visualizer");
});
document.getElementById("particleMode").addEventListener("click", () => {
  alert(
    "Switch to particle-like music visualizer with more interesting patterns",
  );
});

document
  .getElementById("psychedelic")
  .addEventListener("input", togglePsychedelicMode);