import * as THREE from "three";
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
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setAnimationLoop(animate);
// document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
