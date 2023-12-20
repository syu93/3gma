import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

const scene = new THREE.Scene();
const camera = initCamera();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const { transformControl } = initControls();

let trackMouse = true;
enum AVAILABLE_TOOLS {
  'SELECT',
  'ADD_SHAPE',
};

const TOOLS = {
  shapeTool: {
    selectedShape: 'cube',
  }
}

const EDITOR_STATE = {
  transformControl,
  scene,
  camera,
  renderer,
  selectedTool: AVAILABLE_TOOLS.SELECT,
  selectedObject: null as THREE.Object3D | null,
  selectBox: undefined as unknown as THREE.BoxHelper,
  preventSelection: false,
  objects: [] as unknown[],
};

const PHANTOM_SHAPRES = initPhantomShpes();

const mousePosition = { x: 0, y: 0 };

export function initEditor(container: Element) {
  // scene.background = new THREE.Color(0x1D1D1D);

  renderer.setSize(window.innerWidth, window.innerHeight);
  container.querySelector('main')?.appendChild(renderer.domElement);
  const aside = container.querySelector('aside');
  animate();
  addHelpers();

  window.addEventListener('resize', onWindowResize);
  addMenuListener(container);
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

  // const controlButtons = document.querySelectorAll('aside button');
  // // const canvas = document.querySelector('canvas');
  // // controlButtons.forEach((button) => {
  // //   switch(button.className) {
  // //     case 'move':
  // //       button.addEventListener('click', () => {
  // //         canvas.dataset.mode = 'translate';
  // //         transformControl.setMode('translate')}
  // //       );
  // //       break;
  // //     case 'rotate':
  // //       button.addEventListener('click', () => {
  // //         canvas.dataset.mode = 'rotate';
  // //         transformControl.setMode('rotate')}
  // //       );
  // //       break;
  // //     case 'scale':
  // //       button.addEventListener('click', () => {
  // //         canvas.dataset.mode = 'scale';
  // //         transformControl.setMode('scale')}
  // //       );
  // //       break;
  // //   }
  // });

  scene.add(transformControl);
  return { orbitControl, transformControl };
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function addHelpers() {
  const group = new THREE.Group();
  scene.add(group);

  const gridSize = 300;
  const gridColor = 0x3e3e3e;
  const subGridColor = 0x888888;

  const innerGrid = new THREE.GridHelper(gridSize, gridSize, gridColor);
  innerGrid.material.color.setHex(gridColor);
  innerGrid.material.vertexColors = false;
  group.add(innerGrid);

  const outterGrid = new THREE.GridHelper(gridSize, gridSize / 5, subGridColor);
  outterGrid.material.color.setHex(subGridColor);
  outterGrid.material.vertexColors = false;
  group.add(outterGrid);

  // const axesHelper = new THREE.AxesHelper(50);
  // group.add(axesHelper);

  const boxHelper = getSelectionBox();
  scene.add(boxHelper);
  EDITOR_STATE.selectBox = boxHelper;
}

function initObjectSelection() {
  const onDownPosition = new THREE.Vector2();
  const onUpPosition = new THREE.Vector2();

  renderer.domElement.addEventListener('mousemove', (event) => {
    const { x, y } = getNormilizedMousePosition(event);
    mousePosition.x = x;
    mousePosition.y = y;
  });

  renderer.domElement.addEventListener('mousedown', (event) => {
    onDownPosition.set(mousePosition.x, mousePosition.y);
  });
  renderer.domElement.addEventListener('mouseup', () => {
    onUpPosition.set(mousePosition.x, mousePosition.y);
    if (onDownPosition.distanceTo(onUpPosition) >= 0.01) {
      return;
    }

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mousePosition, camera);
    const intersects = raycaster.intersectObjects(EDITOR_STATE.objects, false);
    if (intersects.length > 0) {
      selectObject(intersects[0].object);
    } else {
      unselectObject();
    }
  });
}

function selectObject(object: THREE.Object3D) {
  EDITOR_STATE.selectedObject = object;
  transformControl.attach(object);
  if (EDITOR_STATE.selectBox) {
    EDITOR_STATE.selectBox.setFromObject(object);
    EDITOR_STATE.selectBox.position.copy(object.position);
    EDITOR_STATE.selectBox.visible = true;
    EDITOR_STATE.selectBox.update();
  }
}

function unselectObject() {
  transformControl.detach();
  EDITOR_STATE.selectBox.visible = false;
  EDITOR_STATE.selectBox?.dispose();
  EDITOR_STATE.selectedObject = null;
}

function getNormilizedMousePosition(event: MouseEvent) {
  const canvas = renderer.domElement;
  // Get the mouse coordinates in normalized device coordinates (-1 to 1)
  const x = ((event.clientX - canvas.getBoundingClientRect().left) / canvas.clientWidth) * 2 - 1;
  const y = -((event.clientY - (canvas.getBoundingClientRect().top)) / canvas.clientHeight) * 2 + 1;

  return { x, y };
}

function getSelectionBox(): THREE.BoxHelper {
  const box = new THREE.BoxHelper();
  box.material.depthTest = false;
  box.material.transparent = true;
  box.name = 'selectBox';
  box.visible = false;
  return box;
}

function getStandardMaterial() {
  const material = new THREE.MeshStandardMaterial();
  return material;
}

function onWindowResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function addMenuListener(container) {
  container.querySelector('.selectTool')?.addEventListener('click', () => {
    changeSelectedTool(AVAILABLE_TOOLS.SELECT);
    removePhantomShape();
  });

  container.querySelector('.addElement')
    ?.addEventListener('change', ({ target: { value } }) => {
      changeSelectedTool(AVAILABLE_TOOLS.ADD_SHAPE);

      TOOLS.shapeTool.selectedShape = value;

      createPhantomShape(TOOLS.shapeTool.selectedShape);
    });

  trackMouse = true;
  const currentMousePos = new THREE.Vector2(0, 0);
  renderer.domElement.addEventListener('mousedown', (e) => {
    trackMouse = false;
    currentMousePos.set(e.clientX, e.clientY);
  });
  renderer.domElement.addEventListener('mouseup', (event) => {
    if (EDITOR_STATE.selectedTool !== AVAILABLE_TOOLS.ADD_SHAPE) return;

    trackMouse = true;
    if (currentMousePos.x === event.clientX && currentMousePos.y === event.clientY) {
      switch (TOOLS.shapeTool.selectedShape) {
        case 'cube':
          addCube(PHANTOM_SHAPRES['phantomCube']);
          break;
        case 'sphere':
          addSphere(PHANTOM_SHAPRES['phantomSphere']);
          break;
        case 'cylinder':
          addCylinder(PHANTOM_SHAPRES['phantomCylinder']);
          break;
      }
    }
  });
}

function addCube(phantomCube) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = getStandardMaterial();
  const cube = new THREE.Mesh(geometry, material);
  cube.userData = { own: true };

  cube.position.copy(phantomCube.position.clone());
  EDITOR_STATE.objects.push(cube);
  scene.add(cube);
}

function addSphere(phantomSphere) {
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = getStandardMaterial();
  const sphere = new THREE.Mesh(geometry, material);
  sphere.userData = { own: true };

  sphere.position.copy(phantomSphere.position.clone());
  EDITOR_STATE.objects.push(sphere);
  scene.add(sphere);
}

function addCylinder(phantomCylinder) {
  const geometry = new THREE.CylinderGeometry(1, 1, 1, 32);
  const material = getStandardMaterial();
  const cylinder = new THREE.Mesh(geometry, material);
  cylinder.userData = { own: true };

  cylinder.position.copy(phantomCylinder.position.clone());
  scene.add(cylinder);
}

function removePhantomShape() {
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

function initPhantomShpes() {
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

function changeSelectedTool(tool) {
  console.log('changeSelectedTool', tool);
  EDITOR_STATE.selectedTool = tool;
}