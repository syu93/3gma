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

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const phantomCube = new THREE.Mesh(geometry, material);

export function initEditor(container: Element) {
  scene.background = new THREE.Color(0x1D1D1D);

  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  addHelpers();
  animate();

  orbitControls.update();

  window.addEventListener('resize', onWindowResize);
  // addMenuListener(container);
}

export function initCamera() {
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
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
  const h = window.innerHeight;

  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function addMenuListener(container) {
  container.querySelector('.addElement').addEventListener('change', () => {
    createPhantomShape('cube');
  })
}

function addCube() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xcccccc });
  const cube = new THREE.Mesh(geometry, material);
  console.log(phantomCube.position.clone());

  cube.position.copy(phantomCube.position.clone());
  scene.add(cube);
}

function createPhantomShape(shape) {
  let trackMouse = true;
  switch (shape) {
    case 'cube':
      const { x, y } = mousePosition;
      phantomCube.position.x = x;
      phantomCube.position.y = y;
      window.addEventListener('mousemove', mouseListener);
      window.addEventListener('mousedown', () => trackMouse = false);
      window.addEventListener('mouseup', () => trackMouse = true);
      window.addEventListener('click', () => {
        addCube()
      })

      function mouseListener(event) {
        mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        mousePosition.y = - (event.clientY / window.innerHeight) * 2 + 1;

        // Make the sphere follow the mouse
        var vector = new THREE.Vector3(mousePosition.x, mousePosition.y, 0.5);
        vector.unproject(camera);
        var dir = vector.sub(camera.position).normalize();
        var distance = - camera.position.z / dir.z;
        var pos = camera.position.clone().add(dir.multiplyScalar(distance));
        if (trackMouse) {
          phantomCube.position.copy(pos);
        }
      }
      scene.add(phantomCube);
      return
  }
}