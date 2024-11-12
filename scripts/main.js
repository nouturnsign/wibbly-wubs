/*
import * as THREE from 'three';

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
import * as THREE from 'three';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 50;
const camera = new THREE.OrthographicCamera(
  frustumSize * aspect / -2,
  frustumSize * aspect / 2,
  frustumSize / 2,
  frustumSize / -2,
  1,
  1000
);
camera.position.z = 40;

// Create an array of 32 bars
const barCount = 32;
const barWidth = 1.4; // Width
const barHeight = 10; // Initial height (Update to vary dynamically based off of audio input)
const barDepth = 1; // Depth
const spacing = 0.2; // Small spacing between bars (so they don't overlap)

const bars = [];
const startX = -(barCount * (barWidth + spacing) - spacing) / 2; // Calculate the starting x position for the first bar

for (let i = 0; i < barCount; i++) {
  // Create the bar geometry and material
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