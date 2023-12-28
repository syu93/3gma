import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper';
import { EDITOR_STATE } from './state';
import { addHelpers, initObjectSelection } from './helpers';
import { AVAILABLE_TOOLS, setSelectedTool, initMenu } from './menu';
import { addCube, initPhantomShpes, removePhantomShape } from './shape';

const scene = new THREE.Scene(); ``
const camera = initCamera();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const { transformControl } = initControls();

let trackMouse = true;

const PHANTOM_SHAPRES = initPhantomShpes();

export function initEditor(container: Element) {
  EDITOR_STATE.scene = scene;
  EDITOR_STATE.camera = camera;
  EDITOR_STATE.renderer = renderer;
  EDITOR_STATE.transformControl = transformControl;
  EDITOR_STATE.container = container;

  EDITOR_STATE.renderer.setSize(window.innerWidth, window.innerHeight);
  container.querySelector('main')?.appendChild(renderer.domElement);

  EDITOR_STATE.clock = new THREE.Clock();
  animate();
  addHelpers();

  window.addEventListener('resize', onWindowResize);
  initMenu(container);
  // addMenuListener(container);
  initObjectSelection();

  addCube(PHANTOM_SHAPRES['phantomCube']);
}

function initCamera() {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 50000);
  camera.position.z = 5;

  return camera;
}

function initControls() {
  const orbitControl = new OrbitControls(camera, renderer.domElement);
  orbitControl.enablePan = true;
  orbitControl.update();

  const transformControl = new TransformControls(camera, renderer.domElement);
  transformControl.addEventListener('mouseDown', () => orbitControl.enabled = false);
  transformControl.addEventListener('mouseUp', () => orbitControl.enabled = true);
  scene.add(transformControl);
  return { orbitControl, transformControl };
}

function animate() {
  const delta = EDITOR_STATE.clock.getDelta();
  requestAnimationFrame(animate);
  if (EDITOR_STATE.selectedObject) {
    EDITOR_STATE.selectBox.setFromObject(EDITOR_STATE.selectedObject);
  }
  if (EDITOR_STATE.viewHelper) {
    EDITOR_STATE.viewHelper.render(renderer);
    if (EDITOR_STATE.viewHelper.animating === true) {
      EDITOR_STATE.viewHelper.update(delta);
    }
  }
  renderer.autoClear = false;
  renderer.render(scene, camera);
}

function onWindowResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
