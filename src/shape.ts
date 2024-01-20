import * as THREE from "three";
import { EDITOR_STATE } from "./state";
import { get3DMousePosition, getMousePosition, getNormilizedMousePosition } from "./helpers";
import { TransformControlsPlane } from "three/examples/jsm/controls/TransformControls";

export function addCube(phantomCube) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = getStandardMaterial();
  const cube = new THREE.Mesh(geometry, material);

  // cube.position.copy(phantomCube.position.clone());
  EDITOR_STATE.objects.push(cube);
  EDITOR_STATE.scene.add(cube);

  return cube;
}

export function addSphere(phantomSphere) {
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = getStandardMaterial();
  const sphere = new THREE.Mesh(geometry, material);

  // sphere.position.copy(phantomSphere.position.clone());
  EDITOR_STATE.objects.push(sphere);
  EDITOR_STATE.scene.add(sphere);

  return sphere;
}

export function addCylinder(phantomCylinder) {
  const geometry = new THREE.CylinderGeometry(1, 1, 1, 32);
  const material = getStandardMaterial();
  const cylinder = new THREE.Mesh(geometry, material);

  // cylinder.position.copy(phantomCylinder.position.clone());
  EDITOR_STATE.scene.add(cylinder);

  return cylinder;
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

  group.visible = true;

  return group;
}

export function addTargetTracking() {
  document.addEventListener('mousemove', trackMouse);
}

export function removeTargetTracking() {
  document.removeEventListener('mousemove', trackMouse);
}

function trackMouse(event) {
  EDITOR_STATE.pointerTarget.position.copy(get3DMousePosition(event))
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