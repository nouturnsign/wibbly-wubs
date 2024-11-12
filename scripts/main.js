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

// Load Google Fonts
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

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

/*
// Create the settings bar
const settingsBar = document.createElement('div');
settingsBar.style.position = 'absolute';
settingsBar.style.top = '10px';
settingsBar.style.right = '10px';
settingsBar.style.padding = '20px';
settingsBar.style.backgroundColor = 'rgba(30, 30, 30, 0.8)';
settingsBar.style.border = '1px solid #444';
settingsBar.style.borderRadius = '10px';
settingsBar.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
settingsBar.style.color = '#fff';
settingsBar.style.fontFamily = "'Roboto', sans-serif";
settingsBar.innerHTML = `
  <h2 style="margin-top: 0; font-size: 1.5em;">Color</h2>
  <label for="red">Red: </label>
  <input type="range" id="red" name="red" min="0" max="255" value="0"><br><br>
  <label for="green">Green: </label>
  <input type="range" id="green" name="green" min="0" max="255" value="255"><br><br>
  <label for="blue">Blue: </label>
  <input type="range" id="blue" name="blue" min="0" max="255" value="0"><br><br>
`;
document.body.appendChild(settingsBar);

// Update bar colors based on RGB sliders
function updateBarColors() {
  const red = document.getElementById('red').value;
  const green = document.getElementById('green').value;
  const blue = document.getElementById('blue').value;
  const color = new THREE.Color(`rgb(${red}, ${green}, ${blue})`);

  bars.forEach(bar => {
    bar.material.color.set(color);
  });
}

document.getElementById('red').addEventListener('input', updateBarColors);
document.getElementById('green').addEventListener('input', updateBarColors);
document.getElementById('blue').addEventListener('input', updateBarColors);
*/

// Create the settings bar
const settingsBar = document.createElement('div');
settingsBar.style.position = 'absolute';
settingsBar.style.top = '10px';
settingsBar.style.right = '10px';
settingsBar.style.padding = '20px';
settingsBar.style.backgroundColor = 'rgba(30, 30, 30, 0.8)';
settingsBar.style.border = '1px solid #444';
settingsBar.style.borderRadius = '10px';
settingsBar.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
settingsBar.style.color = '#fff';
settingsBar.style.fontFamily = "'Poppins', sans-serif";
settingsBar.innerHTML = `
  <h2 style="margin-top: 0; font-size: 1.5em;">Settings Bar</h2>
  <label for="modeToggle" style="font-size: 1.2em;">Mode:</label><br>
  <button id="barMode" style="margin: 10px 0; padding: 5px 10px; font-size: 1em;">Bar</button>
  <button id="particleMode" style="margin: 10px 0; padding: 5px 10px; font-size: 1em;">Particle</button><br><br>
  <label for="red">Red: </label>
  <input type="range" id="red" name="red" min="0" max="255" value="0"><br><br>
  <label for="green">Green: </label>
  <input type="range" id="green" name="green" min="0" max="255" value="255"><br><br>
  <label for="blue">Blue: </label>
  <input type="range" id="blue" name="blue" min="0" max="255" value="0"><br><br>
`;

document.body.appendChild(settingsBar);

// Update bar colors based on RGB sliders
function updateBarColors() {
  const red = document.getElementById('red').value;
  const green = document.getElementById('green').value;
  const blue = document.getElementById('blue').value;
  const color = new THREE.Color(`rgb(${red}, ${green}, ${blue})`);

  bars.forEach(bar => {
    bar.material.color.set(color);
  });
}
document.getElementById('red').addEventListener('input', updateBarColors);
document.getElementById('green').addEventListener('input', updateBarColors);
document.getElementById('blue').addEventListener('input', updateBarColors);

// Placeholder buttons for switching modes
// Since the second mode hasn't yet been developed, this is still a WIP
document.getElementById('barMode').addEventListener('click', () => {
  alert("Switch to bar graph music visualizer");
});
document.getElementById('particleMode').addEventListener('click', () => {
  alert("Switch to particle-like music visualizer with more interesting patterns");
});