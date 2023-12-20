import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper';

const scene = new THREE.Scene();
const camera = initCamera();
let viewHelper: ViewHelper;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
const orbitControls = new OrbitControls(camera, renderer.domElement);

const mousePosition = {
  x: 0,
  y: 0
};

export function initEditor(container: Element) {
  scene.background = new THREE.Color(0x1D1D1D);

  renderer.setSize(window.innerWidth, window.innerHeight - 64);
  container.appendChild(renderer.domElement);

  addHelpers();
  animate();

  orbitControls.update();

  window.addEventListener('resize', onWindowResize);
  const selector = container?.querySelector('gma-dropdown');
  selector?.addEventListener('shape-selected', ({ detail }) => createPhantomShape(detail));
}

export function initCamera() {
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / (window.innerHeight - 64), 0.01, 1000);
  camera.position.set(0, 10, 30);

  return camera;
}

export function animate() {
  requestAnimationFrame(animate);
  // Prevent the renderer from clearing the buffers every frame.
  // This is required for the view helper to work properly.
  renderer.autoClear = false;
  renderer.render(scene, camera);
  viewHelper.render(renderer);
}

function addHelpers() {
  const grid = new THREE.Group();
  scene.add(grid);

  const grid1 = new THREE.GridHelper(30, 30, 0x3e3e3e);
  grid1.material.color.setHex(0x3e3e3e);
  grid1.material.vertexColors = false;
  grid.add(grid1);

  const grid2 = new THREE.GridHelper(30, 6, 0x888888);
  grid2.material.color.setHex(0x888888);
  grid2.material.vertexColors = false;
  grid.add(grid2);

  const viewHelperElement = document.querySelector<HTMLElement>('.viewHelper');
  if (viewHelperElement) {
    viewHelperElement.style.position = 'absolute';
    viewHelperElement.style.bottom = '0';
    viewHelperElement.style.right = '0';
    viewHelperElement.style.width = '8rem';
    viewHelperElement.style.height = '8rem';

    viewHelper = new ViewHelper(camera, renderer.domElement);

    // viewHelperElement.addEventListener('pointerup', (event) => {
    //   event.stopPropagation();
    //   viewHelper.handleClick(event);
    // });
    // viewHelperElement.addEventListener('pointerdown', (event) => {
    //   event.stopPropagation();
    // });
  }
}

function onWindowResize() {
  const w = window.innerWidth;
  const h = window.innerHeight - 64;

  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function addCube(phantomCube) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xcccccc });
  const cube = new THREE.Mesh(geometry, material);

  cube.position.copy(phantomCube.position.clone());
  scene.add(cube);
}

function addSphere(phantomSphere) {
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xcccccc });
  const sphere = new THREE.Mesh(geometry, material);

  sphere.position.copy(phantomSphere.position.clone());
  scene.add(sphere);
}

function addCylinder(phantomCylinder) {
  const geometry = new THREE.CylinderGeometry(1, 1, 1, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xcccccc });
  const cylinder = new THREE.Mesh(geometry, material);

  cylinder.position.copy(phantomCylinder.position.clone());
  scene.add(cylinder);
}

function createPhantomShape(shape) {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  const phantomCube = new THREE.Mesh(cubeGeometry, material);
  phantomCube.name = 'phantomCube';
  const phantomSphere = new THREE.Mesh(sphereGeometry, material);
  phantomSphere.name = 'phantomSphere';
  const phantomCylinder = new THREE.Mesh(cylinderGeometry, material);
  phantomCylinder.name = 'phantomCylinder';

  const phantomObjects = [phantomCube, phantomSphere, phantomCylinder];

  phantomObjects.forEach((phantomObject) => {
    const object = scene.getObjectByName(phantomObject.name);
    console.log(object);

    if (object) {
      scene.remove(object);
    }
  });

  let trackMouse = true;
  const currentMousePos = new THREE.Vector2(0, 0);
  renderer.domElement.addEventListener('mousedown', (e) => {
    trackMouse = false;
    currentMousePos.set(e.clientX, e.clientY);
  });
  renderer.domElement.addEventListener('mouseup', (event) => {
    trackMouse = true;
    if (currentMousePos.x === event.clientX && currentMousePos.y === event.clientY) {
      switch (shape) {
        case 'cube':
          addCube(phantomCube);
          break;
        case 'sphere':
          addSphere(phantomSphere);
          break;
        case 'cylinder':
          addCylinder(phantomCylinder);
          break;
      }
    }
  });

  let selectedGeometry;
  switch (shape) {
    case 'cube':
      selectedGeometry = phantomCube;
      break;
    case 'sphere':
      selectedGeometry = phantomSphere;
      break;
    case 'cylinder':
      selectedGeometry = phantomCylinder;
      break;
  }
  if (selectedGeometry) {
    scene.add(selectedGeometry);
  }

  window.addEventListener('mousemove', mouseListener);
  function scaleFactor(mousePositionY) {
    // Calculate the normalized position
    var normalizedY = mousePositionY / window.innerHeight;

    // Calculate the distance from the camera
    var distance = camera.position.z;

    // Apply a gradual increase in the scaling factor as the mouse approaches the edge and the distance from the camera increases
    var scalingFactor = 0.1 + normalizedY * 1.5 * distance * 0.001;

    // Limit the scaling factor to a reasonable range
    scalingFactor = Math.min(scalingFactor, 0.5);
    scalingFactor = Math.max(scalingFactor, window.innerHeight * 0.9);

    return scalingFactor;
  }
  function mouseListener(event) {
    mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Make the sphere follow the mouse
    var vector = new THREE.Vector3(mousePosition.x, 0, mousePosition.y);
    vector.unproject(camera);
    var dir = vector.sub(camera.position).normalize();

    var distance = - camera.position.z / dir.z;

    var pos = camera.position.clone().add(dir.multiplyScalar(distance));
    if (trackMouse) {
      pos.y = 0;

      // Scale mousePosition.y to prevent extreme values
      var scaledY = mousePosition.y * (1 / window.innerHeight);

      // Apply the custom scaling factor
      var adjustedScalingFactor = scaleFactor(scaledY);
      pos.z = -scaledY * distance * adjustedScalingFactor;

      selectedGeometry.position.copy(pos);
    }
  }
}