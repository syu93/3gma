import * as THREE from "three";
import { EDITOR_STATE } from "./state";
import { HELPER_GROUP_NAME } from "./helpers";
import { SHAPE_ICON } from "./menu";

type EditorObject = THREE.Mesh<THREE.BufferGeometry, THREE.Material>;

export enum EYE_ICONS {
  VISIBLE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M2 12s3-7 10-7s10 7 10 7s-3 7-10 7s-10-7-10-7"/><circle cx="12" cy="12" r="3"/></g></svg>',
  HIDDEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24m-3.39-9.04A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/></g></svg>',
}

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
  const displayMode = createDisplayModeContainer(object);

  item.appendChild(iconContainer);
  item.appendChild(nameContainer);
  item.appendChild(displayMode);
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
  nameContainer.classList.add('name', 'flex-1');
  nameContainer.innerHTML = name;
  return nameContainer;
}

function createDisplayModeContainer(object: EditorObject) {
  const eyeContainer = document.createElement('button');
  eyeContainer.classList.add('displayMode', 'focus:ring-1');
  eyeContainer.innerHTML = object.visible ? EYE_ICONS.VISIBLE : EYE_ICONS.HIDDEN;
  eyeContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    object.visible = !object.visible;
    eyeContainer.innerHTML = object.visible ? EYE_ICONS.VISIBLE : EYE_ICONS.HIDDEN;
  });
  return eyeContainer;
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