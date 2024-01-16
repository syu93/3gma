import * as THREE from "three";
import { EDITOR_STATE } from "./state";
import { HELPER_GROUP_NAME } from "./helpers";
import { SHAPE_ICON } from "./menu";

type EditorObject = THREE.Mesh<THREE.BufferGeometry, THREE.Material>;

export function initSceneExplorer(container: Element): number {
  const leftPanel = container.querySelector('#sceneExplorer') as HTMLElement;
  if (!leftPanel) {
    return 0;
  }

  const resizeBar = document.createElement('div');
  resizeBar.classList.add('resize');
  leftPanel.appendChild(resizeBar);

  const resizeMethod = (e) => resize(leftPanel, e);

  resizeBar.addEventListener('mousedown', (e: MouseEvent) => {
    document.addEventListener("mousemove", resizeMethod, false);
  }, false);

  document.addEventListener("mouseup", function () {
    document.removeEventListener("mousemove", resizeMethod, false);
  }, false);

  return leftPanel.clientWidth;
}

export function getSidebarWidth(container: Element): number {
  const leftPanel = container.querySelector('#sceneExplorer') as HTMLElement;
  return leftPanel.clientWidth ?? 0;
}

export function updateSceneContent() {
  const sidebare = EDITOR_STATE.container?.querySelector('#sceneExplorer') as HTMLElement;
  const sceneList = sidebare.querySelector('ul');

  if (sceneList) {
    sceneList.innerHTML = '';
    EDITOR_STATE.scene.children
      .filter((item) => item.name !== HELPER_GROUP_NAME)
      .forEach((item) => {
        sceneList.appendChild(createSceneItem(item as EditorObject));
      });
  }
}

function createSceneItem(object: EditorObject) {
  const item = document.createElement('li');
  const { name, icon } = getNameAndIcon(object);

  const iconContainer = createIconContainer(icon);
  const nameContainer = createNameContainer(name);

  item.appendChild(iconContainer);
  item.appendChild(nameContainer);
  item.addEventListener('click', () => {
  });
  return item;
}

function createIconContainer(icon: string) {
  const iconContainer = document.createElement('div');
  iconContainer.classList.add('icon');
  iconContainer.innerHTML = icon;
  return iconContainer;
}

function createNameContainer(name: string) {
  const nameContainer = document.createElement('span');
  nameContainer.classList.add('name');
  nameContainer.innerHTML = name;
  return nameContainer;
}

function resize(leftPanel: HTMLElement, e: MouseEvent) {
  const dx = e.x;
  if (dx >= 20 * 16 || dx <= 15 * 16) return;
  leftPanel.style.width = dx + "px";

  const editorWidth = window.innerWidth - dx;
  const h = window.innerHeight;

  EDITOR_STATE.renderer.setSize(editorWidth, h);
  EDITOR_STATE.camera.aspect = editorWidth / h;
  EDITOR_STATE.camera.updateProjectionMatrix();
}

function getNameAndIcon(object: EditorObject): { name: string, icon: SHAPE_ICON } {
  let name = '';
  switch (object.type) {
    case 'Mesh':
      name = object.name || getMeshName(object);
      break;
    case 'Group':
      name = object.name || 'Group';
      break;
    default:
      name = object.type;
      break;
  }

  return { name, icon: SHAPE_ICON[getIconFromMesh(object.geometry.type)] };
}

function getMeshName(object: EditorObject) {
  switch (object.geometry.type) {
    case 'BoxGeometry':
      return 'Box';
    case 'SphereGeometry':
      return 'Sphere';
    case 'CylinderGeometry':
      return 'Cylinder';
    default:
      return object.geometry.type;
  }
}

function getIconFromMesh(type: THREE.BufferGeometry<THREE.NormalBufferAttributes>['type']) {
  switch (type) {
    case 'BoxGeometry':
      return 'CUBE';
    case 'SphereGeometry':
      return 'SPHERE';
    case 'CylinderGeometry':
      return 'CYLINDER';
    default:
      return 'CUBE';
  }
}