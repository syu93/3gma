import * as THREE from 'three';
import { EDITOR_STATE } from './state';
import { addHelpers, initObjectSelection } from './helpers';
import { initMenu } from './menu';
import { addDirectionalLight } from './light';
import { getSidebarWidth, initSceneExplorer, updateSceneContent } from './sceneExplorer.sidebare';

export function initEditor(container: Element) {
  EDITOR_STATE.scene = new THREE.Scene();

  const leftPanelWidth = getSidebarWidth(container);
  const editorWidth = window.innerWidth - leftPanelWidth;
  EDITOR_STATE.camera = initCamera(editorWidth);

  EDITOR_STATE.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  EDITOR_STATE.renderer.setSize(editorWidth, window.innerHeight);

  EDITOR_STATE.container = container;

  container.querySelector('main')?.appendChild(EDITOR_STATE.renderer.domElement);

  EDITOR_STATE.clock = new THREE.Clock();


  initMenu(container);
  initObjectSelection();
  addHelpers();
  initSceneExplorer(container);

  window.addEventListener('resize', onWindowResize);

  const fogColor = new THREE.Color(0x27272a);
  EDITOR_STATE.scene.fog = new THREE.FogExp2(fogColor, 0.01);
  EDITOR_STATE.sceneHelper.fog = new THREE.FogExp2(fogColor, 0.01);

  loadScene();
  updateSceneContent();

  animate();
}

function initCamera(editorWidth) {
  const camera = new THREE.PerspectiveCamera(75, editorWidth / window.innerHeight, 0.01, 600);
  camera.position.z = 20;
  camera.position.x = 5;
  camera.position.y = 10;
  camera.lookAt(EDITOR_STATE.scene.position);

  return camera;
}

function animate() {
  const delta = EDITOR_STATE.clock.getDelta();
  requestAnimationFrame(animate);
  if (EDITOR_STATE.selectedObject) {
    EDITOR_STATE.selectBox.setFromObject(EDITOR_STATE.selectedObject);
  }
  if (EDITOR_STATE.viewHelper) {
    EDITOR_STATE.viewHelper.render(EDITOR_STATE.renderer);
    if (EDITOR_STATE.viewHelper.animating === true) {
      EDITOR_STATE.viewHelper.update(delta);
    }
  }
  EDITOR_STATE.renderer.autoClear = false;
  EDITOR_STATE.renderer.render(EDITOR_STATE.scene, EDITOR_STATE.camera);
  EDITOR_STATE.renderer.render(EDITOR_STATE.sceneHelper, EDITOR_STATE.camera);
}

function onWindowResize() {
  const leftPanelWidth = getSidebarWidth(EDITOR_STATE.container);
  const editorWidth = window.innerWidth - leftPanelWidth;
  const h = window.innerHeight;

  EDITOR_STATE.renderer.setSize(editorWidth, h);
  EDITOR_STATE.camera.aspect = editorWidth / h;
  EDITOR_STATE.camera.updateProjectionMatrix();
}

function loadScene() {
  addDirectionalLight(new THREE.Vector3(5, 5, 0));
}
