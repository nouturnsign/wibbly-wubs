import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

import { getFreqData, getTimeData } from "./sound";

let scene;
let renderer;
let animationRequest;

const LEFT_END = -5;
const RIGHT_END = 5;
const LENGTH = RIGHT_END - LEFT_END;
const NUM_LINES = 100;
const LINE_WIDTH = 5;
const LINE_SEPARATION = 0.5;
const FIRST_LINE_Z = -20;
const SIZE = 32;

const RED_MIN = 0;
const RED_MAX = 0 - RED_MIN;
const GREEN_MIN = 0;
const GREEN_MAX = 175 - GREEN_MIN;
const BLUE_MIN = 0;
const BLUE_MAX = 250 - BLUE_MIN;

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
  camera.position.set(2, 5, 0);
  camera.lookAt(0, 0, 0);

  // Add OrbitControls to increase user interaction
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  let lines = [];
  let times = [];

  for (let i = 0; i < NUM_LINES; ++i) {
    const proportion = 1 - i / NUM_LINES;
    const red = Math.floor(proportion * RED_MAX + RED_MIN);
    const green = Math.floor(proportion * GREEN_MAX + GREEN_MIN);
    const blue = Math.floor(proportion * BLUE_MAX + BLUE_MIN);

    const lineMaterial = new LineMaterial({
      color: new THREE.Color(`rgb(${red}, ${green}, ${blue})`).getHex(),
      linewidth: LINE_WIDTH,
      // vertexColors: true,
    });

    const geometry = new LineGeometry();

    const positions = [
      (0 / SIZE) * LENGTH + LEFT_END,
      0,
      i * LINE_SEPARATION + FIRST_LINE_Z,
    ];

    for (let i = 0, n = SIZE * 2 - 2; i < n; ++i) {
      positions.push(
        (i / (SIZE * 2)) * LENGTH + LEFT_END,
        0,
        i * LINE_SEPARATION + FIRST_LINE_Z,
      );
    }

    positions.push(
      ((SIZE - 1) / SIZE) * LENGTH + LEFT_END,
      0,
      i * LINE_SEPARATION + FIRST_LINE_Z,
    );

    geometry.setPositions(positions);

    lines.push(new Line2(geometry, lineMaterial));
    lines[i].computeLineDistances();
    lines[i].scale.set(1, 1, 1);
    scene.add(lines[i]);

    times.push(new Uint8Array(Array(SIZE).fill(127)));
  }

  let counter = 0;
  let timesFrontIndex = 0;

  function animate() {
    animationRequest = requestAnimationFrame(animate);

    const time = getFreqData();

    // ++counter;

    if (time /* && (++counter) % 3 == 0 */) {
      let sum = 0;
      for (let i = 0; i < SIZE; ++i) {
        sum += time[i];
      }
      const avg = sum / SIZE;
      // console.log(avg);
      const offset = -(avg - 127);

      if (--timesFrontIndex < 0) timesFrontIndex = NUM_LINES - 1;

      for (let i = 0; i < SIZE; ++i) {
        times[timesFrontIndex][i] = time[i] + offset;
      }

      // console.log(timesFrontIndex);

      // let i = counter % NUM_LINES;
      for (let i = 0; i < NUM_LINES; ++i) {
        const index = (timesFrontIndex + i) % NUM_LINES;
        // const index = timesFrontIndex;

        let points = [];

        // TODO: change constant dynamically (FFT_SIZE)
        // ...and add as constants all the other 'magic' numbers here
        for (let j = 0; j < SIZE; ++j) {
          points.push(
            new THREE.Vector3(
              (j / SIZE) * LENGTH + LEFT_END,
              ((times[index][j] - 127) / 128) * 2,
              i * LINE_SEPARATION + FIRST_LINE_Z,
            ),
          );
        }

        // console.log(points);

        const curvedPoints = new THREE.CatmullRomCurve3(points)
          .getPoints(SIZE * 2)
          .reduce((acc, cur) => {
            acc.push(cur.x, cur.y, cur.z);
            return acc;
          }, []);
        lines[i].geometry.setPositions(curvedPoints);
        lines[i].geometry.getAttribute("position").needsUpdate = true;

        // scene.remove(lines[i]);
        // delete lines[i];
        // lines[i] = new Line2(geometry, lineMaterial);
        lines[i].computeLineDistances();
        lines[i].geometry.computeBoundingBox();
        lines[i].geometry.computeBoundingSphere();
        // lines[i].scale.set(1, 1, 1);
        // scene.add(lines[i]);
      }
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
