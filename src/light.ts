import * as THREE from "three";
import { selectObjectWithHelpers } from "./helpers";
import { updateSceneContent } from "./sceneExplorer.sidebare";
import { EDITOR_STATE } from "./state";


const geometry = new THREE.SphereGeometry(2, 4, 2);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false });

export enum AVAILABLE_LIGHTS {
  SUNLIGHT = 'SUNLIGHT',
  // LIGHT_BULB = 'LIGHT_BULB',
  // SPOT = 'SPOT',
  // SPOT_LIGHTS = 'SPOT_LIGHTS'
}

export enum LIGHTS_ICON {
  SUNLIGHT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></g></svg>',
  LIGHT_BULB = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 14c.2-1 .7-1.7 1.5-2.5c1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5c.7.7 1.3 1.5 1.5 2.5m0 4h6m-5 4h4"/></svg>'
}

export function addDirectionalLight(position: THREE.Vector3 | null): { light: THREE.DirectionalLight, helper: THREE.DirectionalLightHelper } {
  const light = new THREE.DirectionalLight(0xffffff, 1);
  if (position) {
    light.position.copy(position.clone());
  }

  const helper = new THREE.DirectionalLightHelper(light, 1);
  helper.userData.setSelectedState = (state: boolean) => {
    const color = state ? 0xffff00 : 0xffffff;
    helper.color = new THREE.Color(color);
    helper.update();
  }

  const picker = createHelperPicker(light, helper);
  helper.add(picker);

  light.userData = { picker };

  return { light, helper };
}

export function addLight() {
  const position = EDITOR_STATE.pointerTarget.position.clone();
  position.y = 5;
  switch (EDITOR_STATE.selectedLight) {
    case AVAILABLE_LIGHTS.SUNLIGHT:
      const { light, helper } = addDirectionalLight(position);
      updateSceneContent();
      selectObjectWithHelpers(light, helper);
      break;
  }

}

function createHelperPicker(light: THREE.Light, helper: THREE.Object3D) {
  const picker = new THREE.Mesh(geometry, material);
  picker.material.color.setHex(0xff0000);
  picker.userData = { isTargetHelper: true, target: light, helper };
  return picker;
}
