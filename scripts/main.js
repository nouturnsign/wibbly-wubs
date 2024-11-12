/*
import * as THREE from 'three';
import { getFreqData, getTimeData } from "./sound";

const freqPar = document.getElementById("freq");
const timePar = document.getElementById("time");

setInterval(() => {
  const freq = getFreqData();
  if (freq === null) return;

  let out = "";

  for (let i = 0; i < freq.length; ++i) {
    out += "|" + "F".repeat(freq[i] / 2) + "\n";
  }

  freqPar.innerText = out;

  const time = getTimeData();

  out = "";

  for (let i = 0; i < time.length; ++i) {
    out += "|" + " ".repeat(time[i] / 2 - 1) + "*" + "\n";
  }

  timePar.innerText = out;
}, 1000 / 120);

const scene = new THREE.Scene();
// NOTE: Outer bars overlap while inner bars have a space between them ==> seems to be a problem with the perspective camera
// Can be fixed by using an orthographic camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 25;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create an array of 32 bars
const barCount = 32;
const barWidth = 1; // Width
const barHeight = 10; // Height (update later to change dynamically based on audio input)
const barDepth = 1; // Depth
const spacing = 0.5; // Small spacing between bars (so they don't overlap)

const bars = [];
const startX = -(barCount * (barWidth + spacing) - spacing) / 2; // Calculate the starting x position for the first bar
for (let i = 0; i < barCount; i++) {
  // Create the bars
  const geometry = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const bar = new THREE.Mesh(geometry, material);

  // Position the bars
  bar.position.x = startX + i * (barWidth + spacing);
  bar.position.y = -10; // -10 pushes the bars down to make space for the settings bar

  // Add the bars to the scene
  scene.add(bar);
  bars.push(bar);
}

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
*/

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
