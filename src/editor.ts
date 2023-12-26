import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper';

const scene = new THREE.Scene(); ``
const camera = initCamera();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const { transformControl } = initControls();

let trackMouse = true;
enum AVAILABLE_TOOLS {
  SELECT = 'SELECT',
  ADD_SHAPE = 'ADD_SHAPE',
  MOVE = 'MOVE',
  ROTATE = 'ROTATE',
  SCALE = 'SCALE',
};

enum AVAILABLE_SHAPES {
  CUBE = 'CUBE',
  SPHERE = 'SPHERE',
  CYLINDER = 'CYLINDER',
};

enum SHAPE_ICON {
  CUBE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="currentColor" d="m28.504 8.136l-12-7a1 1 0 0 0-1.008 0l-12 7A1 1 0 0 0 3 9v14a1 1 0 0 0 .496.864l12 7a1 1 0 0 0 1.008 0l12-7A1 1 0 0 0 29 23V9a1 1 0 0 0-.496-.864M16 3.158L26.016 9L16 14.842L5.984 9ZM5 10.74l10 5.833V28.26L5 22.426Zm12 17.52V16.574l10-5.833v11.685Z"/></svg>',
  SPHERE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10"/><path d="M12 22c-3.314 0-6-4.477-6-10S8.686 2 12 2"/></g></svg>',
  CYLINDER = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2c8 0 8 3 8 3s0 3-8 3s-8-3-8-3s0-3 8-3Zm0 14c8 0 8 3 8 3s0 3-8 3s-8-3-8-3s0-3 8-3Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M20 5v14M4 5v14"/></g></svg>'
};

enum TOOL_ICONS {
  SELECT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 9l5 12l1.8-5.2L21 14ZM7.2 2.2L8 5.1M5.1 8l-2.9-.8M14 4.1L12 6m-6 6l-1.9 2"/></svg>',
  ADD_SHAPE = SHAPE_ICON.CUBE,
  MOVE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 9l-3 3l3 3M9 5l3-3l3 3m0 14l-3 3l-3-3M19 9l3 3l-3 3M2 12h20M12 2v20"/></svg>',
  ROTATE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M16.466 7.5C15.643 4.237 13.952 2 12 2C9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2m2.194-8.093l3.814 1.86l-1.86 3.814"/><path d="M19 15.57c-1.804.885-4.274 1.43-7 1.43c-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4"/></g></svg>',
  SCALE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21l-6-6m6 6v-4.8m0 4.8h-4.8M3 16.2V21m0 0h4.8M3 21l6-6m12-7.2V3m0 0h-4.8M21 3l-6 6M3 7.8V3m0 0h4.8M3 3l6 6"/></svg>'
};

const MENU = [
  { type: 'button', tool: AVAILABLE_TOOLS.SELECT, icon: TOOL_ICONS.SELECT, action: () => { } },
  { type: 'select', tool: AVAILABLE_TOOLS.ADD_SHAPE, icon: SHAPE_ICON[AVAILABLE_SHAPES.CUBE], options: Object.values(AVAILABLE_SHAPES), action: () => console.log('add chape', EDITOR_STATE.selectedShape) },
  { type: 'button', tool: AVAILABLE_TOOLS.MOVE, icon: TOOL_ICONS.MOVE, action: setTransformControlMode },
  { type: 'button', tool: AVAILABLE_TOOLS.ROTATE, icon: TOOL_ICONS.ROTATE, action: setTransformControlMode },
  { type: 'button', tool: AVAILABLE_TOOLS.SCALE, icon: TOOL_ICONS.SCALE, action: setTransformControlMode },
]

const EDITOR_STATE = {
  transformControl,
  scene,
  camera,
  renderer,
  selectedTool: AVAILABLE_TOOLS.SELECT,
  selectedShape: AVAILABLE_SHAPES.CUBE,
  selectedObject: null as THREE.Object3D | null,
  selectBox: undefined as unknown as THREE.BoxHelper,
  viewHelper: undefined as unknown as ViewHelper,
  objects: [] as THREE.Object3D[],
  clock: undefined as unknown as THREE.Clock,
};

const PHANTOM_SHAPRES = initPhantomShpes();

const mousePosition = { x: 0, y: 0 };

export function initEditor(container: Element) {
  // scene.background = new THREE.Color(0x1D1D1D);

  renderer.setSize(window.innerWidth, window.innerHeight);
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

  const axesHelper = new THREE.AxesHelper(50);
  group.add(axesHelper);

  const boxHelper = getSelectionBox();
  scene.add(boxHelper);
  EDITOR_STATE.selectBox = boxHelper;

  const viewHelperElement = document.querySelector<HTMLElement>('.viewHelper');
  if (viewHelperElement) {
    viewHelperElement.style.position = 'absolute';
    viewHelperElement.style.bottom = '0';
    viewHelperElement.style.right = '0';
    viewHelperElement.style.width = '8rem';
    viewHelperElement.style.height = '8rem';
    EDITOR_STATE.viewHelper = new ViewHelper(camera, renderer.domElement);
    EDITOR_STATE.viewHelper.animating = false;
    viewHelperElement.addEventListener('pointerup', (event) => {
      event.stopPropagation();
      EDITOR_STATE.viewHelper.handleClick(event);
    });
    viewHelperElement.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
    });
  }
}

function initMenu(container: Element) {
  const menuCtn = container.querySelector('menu ul');
  MENU.forEach((menu) => {
    const item = createMenuItem(menu);
    if (menu.tool === AVAILABLE_TOOLS.SELECT) {
      item.classList.add('active');
    }
    item.addEventListener('click', () => {
      const activeItem = menuCtn?.querySelector('.active');
      if (activeItem) {
        activeItem.classList.remove('active');
      }
      item.classList.add('active');
      menu.action(menu.tool);
      changeSelectedTool(menu.tool);
    });
    menuCtn?.appendChild(item);
  });
}

function createMenuItem({ tool, icon, type, options, action }: { tool: AVAILABLE_TOOLS, icon: string, type: string, options?: string[], action: Function }) {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.setAttribute('title', tool.toString());
  if (type === 'button') {
    button.innerHTML = icon;
    button.querySelector('svg')?.classList.add('w-6');
  } else if (type === 'select') {
    button.classList.add('relative');
    const ctn = document.createElement('div');
    ctn.classList.add('flex', 'items-center', 'justify-between');

    const selected = document.createElement('span');
    setSelectedShapeMenu(selected, icon);
    selected.innerHTML = icon;
    selected.querySelector('svg')?.classList.add('w-6');

    const arrow = document.createElement('span');
    arrow.classList.add('arrow');
    arrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z"/></svg>'
    arrow.querySelector('svg')?.classList.add('w-5', 'hover:transform', 'hover:translate-y-1', 'transition', 'duration-300', 'ease-in-out');

    const dropdown = document.createElement('ul');
    dropdown.classList.add('absolute', 'left-0', 'hidden', 'bg-white', 'shadow', 'rounded', 'w-full', 'mt-2', 'py-2', 'z-10', 'space-y-1');
    options?.forEach((shape) => {
      const option = document.createElement('li');
      option.classList.add('text-gray-700', 'hover:bg-gray-200', 'hover:text-gray-900', 'cursor-pointer', 'flex', 'items-center', 'justify-center', 'px-2', 'py-1')
      option.innerHTML = SHAPE_ICON[shape];
      option?.querySelector('svg')?.classList.add('w-6');
      dropdown.appendChild(option);

      option.addEventListener('click', () => {
        EDITOR_STATE.selectedShape = AVAILABLE_SHAPES[shape];
        setSelectedShapeMenu(selected, SHAPE_ICON[EDITOR_STATE.selectedShape]);
        dropdown.classList.toggle('hidden');
        // createPhantomShape(shape);
      });
    });

    arrow.addEventListener('click', () => {
      dropdown.classList.toggle('hidden');
    });

    ctn.appendChild(selected);
    ctn.appendChild(arrow);
    button.appendChild(ctn);
    button.appendChild(dropdown);
  }
  item.appendChild(button);
  return item;
}

function setTransformControlMode(mode: string) {
  switch (mode) {
    case AVAILABLE_TOOLS.MOVE:
      EDITOR_STATE.transformControl.setMode('translate');
      break;
    case AVAILABLE_TOOLS.ROTATE:
      EDITOR_STATE.transformControl.setMode('rotate');
      break;
    case AVAILABLE_TOOLS.SCALE:
      EDITOR_STATE.transformControl.setMode('scale');
      break;
  }
}
function setSelectedShapeMenu(containter: Element, shape: string) {
  containter.innerHTML = shape;
  containter.querySelector('svg')?.classList.add('w-6');
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
  if ([AVAILABLE_TOOLS.MOVE, AVAILABLE_TOOLS.ROTATE, AVAILABLE_TOOLS.SCALE].includes(EDITOR_STATE.selectedTool)) {
    transformControl.attach(object);
  }
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

      EDITOR_STATE.selectedShape = value;

      createPhantomShape(EDITOR_STATE.selectedShape);
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
      switch (EDITOR_STATE.selectedShape) {
        case AVAILABLE_SHAPES.CUBE:
          addCube(PHANTOM_SHAPRES['phantomCube']);
          break;
        case AVAILABLE_SHAPES.SPHERE:
          addSphere(PHANTOM_SHAPRES['phantomSphere']);
          break;
        case AVAILABLE_SHAPES.CYLINDER:
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
  if ([AVAILABLE_TOOLS.MOVE, AVAILABLE_TOOLS.ROTATE, AVAILABLE_TOOLS.SCALE].includes(tool) && EDITOR_STATE.selectedObject) {
    transformControl.attach(EDITOR_STATE.selectedObject);
  } else {
    transformControl.detach();
  }
  EDITOR_STATE.selectedTool = tool;
}