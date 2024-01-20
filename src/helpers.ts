import * as THREE from 'three';
import { ViewHelper } from "three/examples/jsm/helpers/ViewHelper";
import { AVAILABLE_TOOLS } from "./menu";
import { EDITOR_STATE } from "./state";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { EditorObject, selectItemInList, unselectItemInList } from './sceneExplorer.sidebare';
import { addTargetTracking, createTargetShape } from './shape';

export const targetPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const mousePosition = new THREE.Vector2(0, 0);
const raycaster = new THREE.Raycaster();

export const HELPER_GROUP_NAME = 'helpers';

export function addHelpers() {
  const group = new THREE.Group();
  group.name = HELPER_GROUP_NAME;
  EDITOR_STATE.scene.add(group);

  const gridSize = 3000;
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
  group.add(boxHelper);
  EDITOR_STATE.selectBox = boxHelper;

  const viewHelperElement = document.querySelector<HTMLElement>('.viewHelper');
  if (viewHelperElement) {
    viewHelperElement.style.position = 'absolute';
    viewHelperElement.style.bottom = '0';
    viewHelperElement.style.right = '0';
    viewHelperElement.style.width = '8rem';
    viewHelperElement.style.height = '8rem';
    EDITOR_STATE.viewHelper = new ViewHelper(EDITOR_STATE.camera, EDITOR_STATE.renderer.domElement);
    EDITOR_STATE.viewHelper.animating = false;
    viewHelperElement.addEventListener('pointerup', (event) => {
      event.stopPropagation();
      EDITOR_STATE.viewHelper.handleClick(event);
    });
    viewHelperElement.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
    });
  }

  const { orbitControl, transformControl } = initControls();
  group.add(transformControl);
  EDITOR_STATE.orbitControl = orbitControl;
  EDITOR_STATE.transformControl = transformControl;

  EDITOR_STATE.pointerTarget = createTargetShape();
  group.add(EDITOR_STATE.pointerTarget);

  addTargetTracking();
}

export function initObjectSelection() {
  const onDownPosition = new THREE.Vector2();
  const onUpPosition = new THREE.Vector2();

  EDITOR_STATE.renderer.domElement.addEventListener('mousemove', (event) => {
    const { x, y } = getNormilizedMousePosition(event);
    mousePosition.x = x;
    mousePosition.y = y;
  });

  EDITOR_STATE.renderer.domElement.addEventListener('mousedown', (event) => {
    onDownPosition.set(mousePosition.x, mousePosition.y);
  });
  EDITOR_STATE.renderer.domElement.addEventListener('mouseup', () => {
    onUpPosition.set(mousePosition.x, mousePosition.y);
    if (onDownPosition.distanceTo(onUpPosition) >= 0.01) {
      return;
    }

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mousePosition, EDITOR_STATE.camera);
    const intersects = raycaster.intersectObjects(EDITOR_STATE.objects, false);
    if (intersects.length > 0 && intersects[0].object.visible) {
      selectObject(intersects[0].object);
    } else if (!EDITOR_STATE.pointerTarget.userData.enabled) {
      // @FIXME: prevent unselect when add a new object
      unselectObject();
    }
  });
}

export function selectObject(object: THREE.Object3D) {
  EDITOR_STATE.selectedObject = object;
  if ([AVAILABLE_TOOLS.MOVE, AVAILABLE_TOOLS.ROTATE, AVAILABLE_TOOLS.SCALE].includes(EDITOR_STATE.selectedTool)) {
    EDITOR_STATE.transformControl.attach(object);
  }
  if (EDITOR_STATE.selectBox) {
    EDITOR_STATE.selectBox.setFromObject(object);
    EDITOR_STATE.selectBox.position.copy(object.position);
    EDITOR_STATE.selectBox.visible = true;
    EDITOR_STATE.selectBox.update();
    selectItemInList(object as EditorObject);
  }
}

export function unselectObject() {
  EDITOR_STATE.transformControl.detach();
  EDITOR_STATE.selectBox.visible = false;
  EDITOR_STATE.selectBox?.dispose();
  EDITOR_STATE.selectedObject = null;
  unselectItemInList();
}

export function getNormilizedMousePosition(event: MouseEvent): { x: number, y: number } {
  const canvas = EDITOR_STATE.renderer.domElement;
  const rect = canvas.getBoundingClientRect();

  // Get the mouse coordinates in normalized device coordinates (-1 to 1)
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  return { x, y };
}

export function getMousePosition(event: MouseEvent) {
  const canvas = EDITOR_STATE.renderer.domElement;
  const rect = canvas.getBoundingClientRect();

  // Get the mouse coordinates in normalized device coordinates (-1 to 1)
  const x = (event.clientX - rect.left) / rect.width;
  const y = -(event.clientY - rect.top) / rect.height;

  return { x, y };
}

export function get3DMousePosition(event): THREE.Vector3 {
  const { x, y } = getNormilizedMousePosition(event);
  mousePosition.x = x;
  mousePosition.y = y;
  raycaster.setFromCamera(mousePosition, EDITOR_STATE.camera);
  const targetPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(targetPlane, targetPoint);
  return targetPoint;
}

function getSelectionBox(): THREE.BoxHelper {
  // @ts-ignore
  const box = new THREE.BoxHelper();
  box.material.depthTest = false;
  box.material.transparent = true;
  box.name = 'selectBox';
  box.visible = false;
  return box;
}

function initControls() {
  const orbitControl = new OrbitControls(EDITOR_STATE.camera, EDITOR_STATE.renderer.domElement);
  orbitControl.enablePan = true;
  orbitControl.update();

  const transformControl = new TransformControls(EDITOR_STATE.camera, EDITOR_STATE.renderer.domElement);
  transformControl.addEventListener('mouseDown', () => orbitControl.enabled = false);
  transformControl.addEventListener('mouseUp', () => orbitControl.enabled = true);
  return { orbitControl, transformControl };
}