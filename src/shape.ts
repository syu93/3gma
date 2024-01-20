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

function createPhantomShape(shape) {
  removePhantomShape();

  let selectedGeometry;
  switch (shape) {
    case 'cube':
      selectedGeometry = PHANTOM_SHAPRES['phantomCube'];
      break;
    case 'sphere':
      selectedGeometry = PHANTOM_SHAPRES['phantomSphere'];
      break;
    case 'cylinder':
      selectedGeometry = PHANTOM_SHAPRES['phantomCylinder'];
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

function intersectObjectWithRay(object, raycaster, includeInvisible) {

  const allIntersections = raycaster.intersectObject(object, true);

  for (let i = 0; i < allIntersections.length; i++) {

    if (allIntersections[i].object.visible || includeInvisible) {

      return allIntersections[i];

    }

  }

  return false;

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
