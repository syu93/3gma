import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

const scene = new THREE.Scene();
const camera = initCamera();
const renderer = new THREE.WebGLRenderer();
const { orbitControl, transformControl } = initControls();

let trackMouse = true;
enum AVAILABLE_TOOLS {
  'SELECT',
  'ADD_SHAPE',
};

const tools = {
  shapeTool: {
    selectedShape: 'cube',
  }
}

const editorState = {
  selectedTool: AVAILABLE_TOOLS.SELECT,
  selectedObject: null,
  selectBox: null,
  hasMoved: false,
};

const PHANTOM_SHAPRES = initPhantomShpes();

const mousePosition = {
  x: 0,
  y: 0
};


export function initEditor(container: Element) {
  scene.background = new THREE.Color(0x1D1D1D);

  renderer.setSize(window.innerWidth, window.innerHeight);
  container.querySelector('main')?.appendChild(renderer.domElement);
  const aside = container.querySelector('aside');
  animate();
  addHelpers();

  window.addEventListener('resize', onWindowResize);
  addMenuListener(container);
  addSelectElementListener();

  addCube(PHANTOM_SHAPRES['phantomCube']);
}

export function initCamera() {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 5000);
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

export function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function addHelpers() {
  // const gridHelper = new THREE.GridHelper(100, 100);
  // scene.add(gridHelper);

  // const axesHelper = new THREE.AxesHelper(50);
  // scene.add(axesHelper);
}

const currentMousePos = new THREE.Vector2(0, 0);
renderer.domElement.addEventListener('mousedown', (e) => {
  currentMousePos.set(e.clientX, e.clientY);
});

renderer.domElement.addEventListener('mouseup', (event) => {
  if (currentMousePos.x === event.clientX && currentMousePos.y === event.clientY) {
    transformControl.detach();
    editorState.selectedObject = null;
    const object = scene.getObjectByName(editorState.selectBox?.name);
    scene.remove(object);
  }
});

function addSelectElementListener() {
  renderer.domElement.addEventListener('click', (event) => {
    mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = - (event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mousePosition, camera);

    const intersects = raycaster.intersectObjects(scene.children, false);

    if (intersects.length > 0 && intersects[0].object.userData.own) {
      if (!editorState.selectedObject
        || (editorState.selectedObject && editorState.selectedObject.uuid !== intersects[0].object.uuid)) {
        editorState.selectedObject = intersects[0].object;
        return addSelectionBox(editorState.selectedObject);
      }
    }
  });
}

function addSelectionBox(selectedObject) {
  transformControl.attach(selectedObject);
  switch (selectedObject.geometry.type) {
    case 'BoxGeometry':
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0xffdd00, wireframe: true });
      editorState.selectBox = new THREE.Mesh(geometry, material);
      editorState.selectBox.name = 'boxHelper';
      editorState.selectBox.position.copy(selectedObject.position.clone());
      scene.add(editorState.selectBox);
      break;
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
  container.querySelector('.addElement').addEventListener('change', ({ target: { value } }) => {
    changeSelectedTool(AVAILABLE_TOOLS.ADD_SHAPE);
    tools.shapeTool.selectedShape = value;
    createPhantomShape(tools.shapeTool.selectedShape);
  });
  trackMouse = true;
  const currentMousePos = new THREE.Vector2(0, 0);
  renderer.domElement.addEventListener('mousedown', (e) => {
    trackMouse = false;
    currentMousePos.set(e.clientX, e.clientY);
  });
  renderer.domElement.addEventListener('mouseup', (event) => {
    if (editorState.selectedTool !== AVAILABLE_TOOLS.ADD_SHAPE) return;
    trackMouse = true;
    if (currentMousePos.x === event.clientX && currentMousePos.y === event.clientY) {
      switch (tools.shapeTool.selectedShape) {
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

  container.querySelector('.selectTool').addEventListener('click', () => {
    changeSelectedTool(AVAILABLE_TOOLS.SELECT);
    removePhantomShape();
  });

}

function addCube(phantomCube) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xcccccc });
  const cube = new THREE.Mesh(geometry, material);
  cube.userData = { own: true };

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
  editorState.selectedTool = tool;
}