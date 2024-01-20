import * as THREE from "three";
import { EDITOR_STATE } from "./state";
import { get3DMousePosition, getMousePosition, getNormilizedMousePosition, selectObject } from "./helpers";
import { TransformControlsPlane } from "three/examples/jsm/controls/TransformControls";
import { updateSceneContent } from "./sceneExplorer.sidebare";


export enum AVAILABLE_SHAPES {
  CUBE = 'CUBE',
  SPHERE = 'SPHERE',
  CYLINDER = 'CYLINDER',
};

export enum SHAPE_ICON {
  CUBE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="currentColor" d="m28.504 8.136l-12-7a1 1 0 0 0-1.008 0l-12 7A1 1 0 0 0 3 9v14a1 1 0 0 0 .496.864l12 7a1 1 0 0 0 1.008 0l12-7A1 1 0 0 0 29 23V9a1 1 0 0 0-.496-.864M16 3.158L26.016 9L16 14.842L5.984 9ZM5 10.74l10 5.833V28.26L5 22.426Zm12 17.52V16.574l10-5.833v11.685Z"/></svg>',
  SPHERE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10"/><path d="M12 22c-3.314 0-6-4.477-6-10S8.686 2 12 2"/></g></svg>',
  CYLINDER = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2c8 0 8 3 8 3s0 3-8 3s-8-3-8-3s0-3 8-3Zm0 14c8 0 8 3 8 3s0 3-8 3s-8-3-8-3s0-3 8-3Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M20 5v14M4 5v14"/></g></svg>'
};

const onDownPosition = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();

export function addCube(position: THREE.Vector3 | null) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  return createMesh(geometry, position);
}

export function addSphere(position: THREE.Vector3 | null) {
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  return createMesh(geometry, position);
}

export function addCylinder(position: THREE.Vector3 | null) {
  const geometry = new THREE.CylinderGeometry(1, 1, 1, 32);
  return createMesh(geometry, position);
}

function createMesh(geometry: THREE.BufferGeometry, position: THREE.Vector3 | null) {
  const material = getStandardMaterial();
  const mesh = new THREE.Mesh(geometry, material);

  if (position) {
    mesh.position.copy(position.clone());
  }
  EDITOR_STATE.scene.add(mesh);

  return mesh;
}

export function initPhantomShpes() {
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

  return { phantomCube, phantomSphere, phantomCylinder };
}

function getStandardMaterial() {
  const material = new THREE.MeshStandardMaterial();
  return material;
}

export function removePhantomShape() {
  Object.values(PHANTOM_SHAPRES).forEach((phantomObject) => {
    const object = scene.getObjectByName(phantomObject.name);
    if (object) {
      scene.remove(object);
    }
  });
}

export function createTargetShape() {
  const group = new THREE.Group();
  // Circle parameters
  const circleRadius = 3;
  const circleSegments = 64;

  // Create circle boundary
  const circleGeometry = new THREE.CircleGeometry(circleRadius, circleSegments);
  circleGeometry.rotateX(Math.PI / 2);
  const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFF000, side: THREE.DoubleSide, wireframe: true, transparent: true, opacity: 0.08 });
  const circle = new THREE.Mesh(circleGeometry, circleMaterial);
  group.add(circle);

  let distance = EDITOR_STATE.orbitControl.getDistance();
  EDITOR_STATE.orbitControl.addEventListener('change', () => {
    const delta = distance / EDITOR_STATE.orbitControl.getDistance();
    const zoom = Math.round(delta * 1e4) / 1e4;
    const scaleFactor = 1 / zoom

    group.scale.set(scaleFactor, 0, scaleFactor);
  });
  group.visible = false;
  group.userData.enabled = false;

  return group;
}

export function addTargetTracking() {
  document.addEventListener('mousemove', trackMouse);
}

export function removeTargetTracking() {
  document.removeEventListener('mousemove', trackMouse);
}

function trackMouse(event) {
  const worldPosition = get3DMousePosition(event);
  if (!worldPosition.x && !worldPosition.z) {
    EDITOR_STATE.pointerTarget.visible = false;
  } else {
    EDITOR_STATE.pointerTarget.visible = EDITOR_STATE.pointerTarget.userData.enabled;
    EDITOR_STATE.pointerTarget.position.copy(worldPosition);
  }
}

export function enableClickToAddShape() {
  EDITOR_STATE.renderer.domElement.addEventListener('mousedown', setMouseDownPosition);
  EDITOR_STATE.renderer.domElement.addEventListener('mouseup', shouldAddShape);
}

function setMouseDownPosition(event) {
  const { x, y } = getNormilizedMousePosition(event);
  onDownPosition.set(x, y);
}

function shouldAddShape(event) {
  const { x, y } = getNormilizedMousePosition(event);
  onUpPosition.set(x, y);
  if (onDownPosition.distanceTo(onUpPosition) >= 0.01) {
    return;
  }
  addShape();
}

export function disableClickToAddShape() {
  EDITOR_STATE.renderer.domElement.removeEventListener('mousedown', setMouseDownPosition);
  EDITOR_STATE.renderer.domElement.removeEventListener('mouseup', shouldAddShape);
}

export async function addShape() {
  let selectedGeometry;
  switch (EDITOR_STATE.selectedShape) {
    case AVAILABLE_SHAPES.CUBE:
      selectedGeometry = addCube(EDITOR_STATE.pointerTarget.position);
      break;
    case AVAILABLE_SHAPES.SPHERE:
      selectedGeometry = addSphere(EDITOR_STATE.pointerTarget.position);
      break;
    case AVAILABLE_SHAPES.CYLINDER:
      selectedGeometry = addCylinder(EDITOR_STATE.pointerTarget.position);
      break;
  }
  updateSceneContent();
  selectObject(selectedGeometry);
}
