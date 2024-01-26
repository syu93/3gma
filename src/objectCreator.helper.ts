import * as THREE from "three";
import { get3DMousePosition, getNormilizedMousePosition } from "./helpers";
import { addLight } from "./light";
import { AVAILABLE_TOOLS } from "./menu";
import { addShape } from "./shape";
import { EDITOR_STATE } from "./state";

const onDownPosition = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();

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

export function enableClickToAddObject() {
  EDITOR_STATE.renderer.domElement.addEventListener('mousedown', setMouseDownPosition);
  EDITOR_STATE.renderer.domElement.addEventListener('mouseup', shouldAddObject);
}

function setMouseDownPosition(event) {
  const { x, y } = getNormilizedMousePosition(event);
  onDownPosition.set(x, y);
}

function shouldAddObject(event) {
  const { x, y } = getNormilizedMousePosition(event);
  onUpPosition.set(x, y);
  if (onDownPosition.distanceTo(onUpPosition) >= 0.01) {
    return;
  }
  if (EDITOR_STATE.selectedTool === AVAILABLE_TOOLS.ADD_SHAPE) {
    addShape();
  } else if (EDITOR_STATE.selectedTool === AVAILABLE_TOOLS.ADD_LIGHT) {
    addLight();
  }
}

export function disableClickToAddObject() {
  EDITOR_STATE.renderer.domElement.removeEventListener('mousedown', setMouseDownPosition);
  EDITOR_STATE.renderer.domElement.removeEventListener('mouseup', shouldAddObject);
}