import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

import { getFreqData, getTimeData } from "./sound";

let scene;
let renderer;
let animationRequest;

const LEFT_END = -2.5;
const RIGHT_END = 2.5;
const LENGTH = RIGHT_END - LEFT_END;
const NUM_LINES = 10;
const LINE_SEPARATION = 0.1;
const FIRST_LINE_Z = -1;
const SIZE = 64;

function createParticlesScene() {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.insertBefore(
    renderer.domElement,
    document.getElementById("settings"),
  );

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1, // near
    100, // far
  );
  camera.position.set(0, 0, -2);
  camera.lookAt(0, 0, 0);

  // Add OrbitControls to increase user interaction
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  const lineMaterial = new LineMaterial({
    color: 0xffffff,
    linewidth: 5,
    // vertexColors: true,
  });

  let lines = [];

  for (let i = 0; i < NUM_LINES; ++i) {
    const geometry = new LineGeometry();
    geometry.setPositions([
      (0 / SIZE) * LENGTH + LEFT_END,
      0,
      i * LINE_SEPARATION + FIRST_LINE_Z,
      ((SIZE - 1) / SIZE) * LENGTH + LEFT_END,
      0,
      i * LINE_SEPARATION + FIRST_LINE_Z,
    ]);

    lines.push(new Line2(geometry, lineMaterial));
    lines[i].computeLineDistances();
    lines[i].scale.set(1, 1, 1);
    scene.add(lines[i]);
  }

  let counter = 0;

  function animate() {
    animationRequest = requestAnimationFrame(animate);

    const time = getTimeData();

    ++counter;

    if (time /* && (++counter) % 5 == 0 */) {
      let sum = 0;
      for (let i = 0; i < SIZE; ++i) {
        sum += time[i];
      }
      const avg = sum / SIZE;
      // console.log(avg);
      const offset = -(avg - 127);

      for (let i = 0; i < SIZE; ++i) {
        time[i] = time[i] + offset;
      }

      // for (let i = 0; i < NUM_LINES; ++i) {
      let i = counter % NUM_LINES;

      let points = [];

      // TODO: change constant dynamically (FFT_SIZE)
      // ...and add as constants all the other 'magic' numbers here
      for (let j = 0; j < SIZE; ++j) {
        points.push(
          new THREE.Vector3(
            (j / SIZE) * LENGTH + LEFT_END,
            ((time[j] - 127) / 128) * 2 + Math.exp(0.2 * i) * 0.1,
            i * LINE_SEPARATION + FIRST_LINE_Z,
          ),
        );
      }

      const curvedPoints = new THREE.CatmullRomCurve3(points)
        .getPoints(SIZE * 4)
        .reduce((acc, cur) => {
          acc.push(cur.x, cur.y, cur.z);
          return acc;
        }, []);
      const geometry = new LineGeometry();
      geometry.setPositions(curvedPoints);

      scene.remove(lines[i]);
      delete lines[i];
      lines[i] = new Line2(geometry, lineMaterial);
      lines[i].computeLineDistances();
      lines[i].scale.set(1, 1, 1);
      scene.add(lines[i]);

      // }
    }

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

function destroyParticlesScene() {
  if (animationRequest) cancelAnimationFrame(animationRequest);
  renderer.domElement.remove();

  scene = undefined;
  renderer = undefined;
  animationRequest = undefined;
}

export { createParticlesScene, destroyParticlesScene };
