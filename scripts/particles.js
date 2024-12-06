import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

import { getFreqData, getTimeData, FREQ_BINS, TIME_BINS } from "./sound";

let scene;
let renderer;
let animationRequest;

const LEFT_END = -25;
const RIGHT_END = 0;
const WIDTH = RIGHT_END - LEFT_END;
const NUM_LINES = 100;
const LINE_WIDTH = 5;
const LINE_SEPARATION = 0.5;
const FIRST_LINE_Z = -20;
const SIZE = FREQ_BINS;
const INWARD_SHIFT = (1.5 / SIZE) * WIDTH;
const MAX_HEIGHT = 3;

const NUM_PARTICLES = 1000;
const PARTICLE_WIDTH = WIDTH * 4;
const PARTICLE_HEIGHT = 25;
const MIN_PARTICLE_Y = -5;
const PARTICLE_DEPTH = LINE_SEPARATION * NUM_LINES + 3;
const MIN_PARTICLE_Z = FIRST_LINE_Z - 2;
const MAX_PARTICLE_Z = MIN_PARTICLE_Z + PARTICLE_DEPTH;
const PARTICLE_X_Y_JITTER_RANGE = 1;
const HALF_PARTICLE_X_Y_JITTER_RANGE = PARTICLE_X_Y_JITTER_RANGE / 2;
const PARTICLE_MAX_Z_MOVEMENT = 0.5;
const PARTICLE_LERP_TIME = 64;

const OSCILLO_LINE_WIDTH = 3;
const OSCILLO_SIZE = TIME_BINS;
const OSCILLO_MIN_X = -40;
const OSCILLO_MAX_X = 40;
const OSCILLO_WIDTH = OSCILLO_MAX_X - OSCILLO_MIN_X;
const OSCILLO_Y = 6;
const OSCILLO_Z = 8;
const OSCILLO_MAX_HEIGHT = 8;

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
  camera.position.set(0, 10, FIRST_LINE_Z - 5);
  camera.lookAt(0, 0, -6);

  // Add OrbitControls to increase user interaction
  // const controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableDamping = true;
  // controls.dampingFactor = 0.05;

  // LINES

  let linesRight = [];
  let linesLeft = [];
  let freqs = [];

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

    const rGeometry = new LineGeometry();
    const lGeometry = new LineGeometry();

    const rPositions = [
      (0 / SIZE) * WIDTH + LEFT_END + INWARD_SHIFT,
      0,
      i * LINE_SEPARATION + FIRST_LINE_Z,
    ];
    const lPositions = [
      (0 / SIZE) * WIDTH + RIGHT_END - INWARD_SHIFT,
      0,
      i * LINE_SEPARATION + FIRST_LINE_Z,
    ];

    for (let j = 0, n = SIZE * 2 - 2; j < n; ++j) {
      rPositions.push(
        (j / (SIZE * 2)) * WIDTH + LEFT_END + INWARD_SHIFT,
        0,
        i * LINE_SEPARATION + FIRST_LINE_Z,
      );
      lPositions.push(
        (j / (SIZE * 2)) * WIDTH + RIGHT_END - INWARD_SHIFT,
        0,
        i * LINE_SEPARATION + FIRST_LINE_Z,
      );
    }

    rPositions.push(
      ((SIZE - 1) / SIZE) * WIDTH + LEFT_END + INWARD_SHIFT,
      0,
      i * LINE_SEPARATION + FIRST_LINE_Z,
    );
    lPositions.push(
      ((SIZE - 1) / SIZE) * WIDTH + RIGHT_END - INWARD_SHIFT,
      0,
      i * LINE_SEPARATION + FIRST_LINE_Z,
    );

    rGeometry.setPositions(rPositions);
    lGeometry.setPositions(lPositions);

    linesRight.push(new Line2(rGeometry, lineMaterial));
    linesRight[i].computeLineDistances();
    linesRight[i].scale.set(1, 1, 1);
    scene.add(linesRight[i]);

    linesLeft.push(new Line2(lGeometry, lineMaterial));
    linesLeft[i].computeLineDistances();
    linesLeft[i].scale.set(1, 1, 1);
    scene.add(linesLeft[i]);

    freqs.push(new Uint8Array(Array(SIZE).fill(127)));
  }

  // PARTICLES

  const particleGeometry = new THREE.BufferGeometry();
  const sprite = new THREE.TextureLoader().load("../textures/circle.png");
  sprite.colorSpace = THREE.SRGBColorSpace;

  const particleVertices = [];

  for (let i = 0; i < NUM_PARTICLES; ++i) {
    const x = PARTICLE_WIDTH * Math.random() - PARTICLE_WIDTH / 2;
    const y = PARTICLE_HEIGHT * Math.random() + MIN_PARTICLE_Y;
    const z = PARTICLE_DEPTH * Math.random() + MIN_PARTICLE_Z;

    // console.log(x, y, z);

    particleVertices.push(x, y, z);
  }

  const particlePositions = new THREE.Float32BufferAttribute(
    particleVertices,
    3,
  );
  const nextParticlePositions = new THREE.Float32BufferAttribute(
    particleVertices,
    3,
  );
  particleGeometry.setAttribute("position", particlePositions);

  // console.log(particlePositions);
  // console.log(particleGeometry.getAttribute('position'));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.5,
    sizeAttenuation: true,
    map: sprite,
    transparent: true,
    opacity: 0.6,
    // color: '#2abce8'
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // OSCILLOSCOPE

  const oscilloMaterial = new LineMaterial({
    color: 0xb0b0b0,
    linewidth: OSCILLO_LINE_WIDTH,
  });
  const oscilloGeometry = new LineGeometry();

  const oscilloPositions = [];
  for (let i = 0; i < OSCILLO_SIZE; ++i) {
    oscilloPositions.push(
      (i / OSCILLO_SIZE) * OSCILLO_WIDTH + OSCILLO_MIN_X,
      OSCILLO_Y + OSCILLO_MAX_HEIGHT / 2,
      OSCILLO_Z,
    );
  }
  oscilloGeometry.setPositions(oscilloPositions);

  const oscilloscope = new Line2(oscilloGeometry, oscilloMaterial);
  oscilloscope.computeLineDistances();
  oscilloscope.scale.set(1, 1, 1);
  scene.add(oscilloscope);

  let counter = 0;
  let freqsFrontIndex = 0;

  function animate() {
    animationRequest = requestAnimationFrame(animate);

    const freq = getFreqData();

    ++counter;

    let z_movement = 0;

    if (freq && counter % 2 == 0) {
      // average freq array
      let sum = 0;
      for (let i = 0; i < SIZE; ++i) {
        sum += freq[i];
      }
      const avg = sum / SIZE;
      z_movement = (Math.min(130, avg) / 130) * PARTICLE_MAX_Z_MOVEMENT;
      // console.log(offset);
      const offset = -(avg - 127);

      if (--freqsFrontIndex < 0) freqsFrontIndex = NUM_LINES - 1;

      for (let i = 0; i < SIZE; ++i) {
        freqs[freqsFrontIndex][i] = freq[i]; // + offset;
      }

      // console.log(timesFrontIndex);

      // LINES

      // let i = counter % NUM_LINES;
      for (let i = 0; i < NUM_LINES; ++i) {
        const index = (freqsFrontIndex + i) % NUM_LINES;
        // const index = timesFrontIndex;

        let rPoints = [];
        let lPoints = [];

        for (let j = 0; j < SIZE; ++j) {
          rPoints.push(
            new THREE.Vector3(
              (j / SIZE) * WIDTH + LEFT_END + INWARD_SHIFT,
              ((freqs[index][j] - 127) / 128) * MAX_HEIGHT,
              i * LINE_SEPARATION + FIRST_LINE_Z,
            ),
          );
          lPoints.push(
            new THREE.Vector3(
              WIDTH - (j / SIZE) * WIDTH - INWARD_SHIFT,
              ((freqs[index][j] - 127) / 128) * MAX_HEIGHT,
              i * LINE_SEPARATION + FIRST_LINE_Z,
            ),
          );
        }

        // console.log(points);

        const lCurvedPoints = new THREE.CatmullRomCurve3(rPoints)
          .getPoints(SIZE * 2)
          .reduce((acc, cur) => {
            acc.push(cur.x, cur.y, cur.z);
            return acc;
          }, []);
        const rCurvedPoints = new THREE.CatmullRomCurve3(lPoints)
          .getPoints(SIZE * 2)
          .reduce((acc, cur) => {
            acc.push(cur.x, cur.y, cur.z);
            return acc;
          }, []);

        linesRight[i].geometry.setPositions(lCurvedPoints);
        linesLeft[i].geometry.setPositions(rCurvedPoints);
        linesRight[i].geometry.getAttribute("position").needsUpdate = true;
        linesLeft[i].geometry.getAttribute("position").needsUpdate = true;

        // scene.remove(lines[i]);
        // delete lines[i];
        // lines[i] = new Line2(geometry, lineMaterial);
        linesRight[i].computeLineDistances();
        linesRight[i].geometry.computeBoundingBox();
        linesRight[i].geometry.computeBoundingSphere();
        linesLeft[i].computeLineDistances();
        linesLeft[i].geometry.computeBoundingBox();
        linesLeft[i].geometry.computeBoundingSphere();
        // lines[i].scale.set(1, 1, 1);
        // scene.add(lines[i]);
      }
    }

    // PARTICLES

    for (let i = 0; i < NUM_PARTICLES; ++i) {
      if (particlePositions.getZ(i) > MAX_PARTICLE_Z) {
        const x = PARTICLE_WIDTH * Math.random() - PARTICLE_WIDTH / 2;
        const y = PARTICLE_HEIGHT * Math.random() + MIN_PARTICLE_Y;
        const z = PARTICLE_DEPTH * Math.random() + MIN_PARTICLE_Z;

        particlePositions.setXYZ(i, x, y, z);
        nextParticlePositions.setXYZ(i, x, y, z);
      }

      particlePositions.setZ(i, particlePositions.getZ(i) + z_movement);

      if ((counter + i) % PARTICLE_LERP_TIME === 0) {
        particlePositions.setXY(
          i,
          nextParticlePositions.getX(i),
          nextParticlePositions.getY(i),
        );

        nextParticlePositions.setXY(
          i,
          particlePositions.getX(i) +
            Math.random() * PARTICLE_X_Y_JITTER_RANGE -
            HALF_PARTICLE_X_Y_JITTER_RANGE,
          particlePositions.getY(i) +
            Math.random() * PARTICLE_X_Y_JITTER_RANGE -
            HALF_PARTICLE_X_Y_JITTER_RANGE,
        );
      } else {
        const proportion =
          1 / (PARTICLE_LERP_TIME - ((counter + i) % PARTICLE_LERP_TIME));

        particlePositions.setXY(
          i,
          THREE.MathUtils.lerp(
            particlePositions.getX(i),
            nextParticlePositions.getX(i),
            proportion,
          ),
          THREE.MathUtils.lerp(
            particlePositions.getY(i),
            nextParticlePositions.getY(i),
            proportion,
          ),
        );
      }
    }

    particlePositions.needsUpdate = true;

    // OSCILLOSCOPE

    const time = getTimeData();

    if (time) {
      for (let i = 0; i < OSCILLO_SIZE; ++i) {
        oscilloPositions[i * 3 + 1] =
          (time[i] / 255) * OSCILLO_MAX_HEIGHT + OSCILLO_Y;
      }

      oscilloGeometry.setPositions(oscilloPositions);
      oscilloGeometry.getAttribute("position").needsUpdate = true;
      oscilloscope.computeLineDistances();
      oscilloGeometry.computeBoundingBox();
      oscilloGeometry.computeBoundingSphere();
    }

    // controls.update();
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
