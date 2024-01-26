import * as THREE from "three";
import { EditorObject, updateSceneContent } from "./sceneExplorer.sidebare";
import { addCube, addCylinder, addSphere } from "./shape";
import { EDITOR_STATE } from "./state";
import { addDirectionalLight } from "./light";
import { getProjectScene, saveScene } from "./firebase";

type Vector3 = {
  x: number,
  y: number,
  z: number
}

export type SerializedSceneItem = {
  uuid: string,
  name: string,
  position: Vector3,
  rotation: Vector3,
  scale: Vector3,
  type: string,
  userData?: string
}


export function loadScene() {
  getProjectScene((serializedSceneItem) => {
    if (serializedSceneItem.eventType === 'child_added') {
      deserialiseScene(serializedSceneItem);
      updateSceneContent();
    } else if (serializedSceneItem.eventType === 'child_changed') {
      const { uuid, name, position, rotation, scale } = serializedSceneItem;

      const object = EDITOR_STATE.scene.children.find(item => item.uuid === uuid) as EditorObject;
      if (object) {
        object.name = name;
        object.position.set(position.x, position.y, position.z);
        object.rotation.set(rotation.x, rotation.y, rotation.z);
        object.scale.set(scale.x, scale.y, scale.z);
      }
    }
  });
}

export function syncScene() {
  const serializedScene = serialiseScene();
  saveScene(serializedScene);
}

function serialiseScene(): SerializedSceneItem[] {
  return EDITOR_STATE.scene.children.map((item) => {
    const { uuid, name, position, rotation, scale, type, userData } = item as EditorObject;

    return {
      uuid,
      name,
      position: { x: position.x, y: position.y, z: position.z },
      rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
      scale: { x: scale.x, y: scale.y, z: scale.z },
      // @ts-ignore
      type: item?.geometry?.type ?? type,
      // materialType: item?.material?.type,
      // userData: JSON.stringify(userData)
    };
  })
}

function deserialiseScene(serializedSceneItem: SerializedSceneItem) {
  const { uuid, name, position, rotation, scale, type, userData } = serializedSceneItem;
  const { x, y, z } = position;
  const vectorePosition = new THREE.Vector3(x, y, z);

  let objectItem = null as unknown as EditorObject;
  let helperItem = null as unknown as THREE.DirectionalLightHelper;
  switch (type) {
    case 'BoxGeometry':
      objectItem = addCube(vectorePosition);
      break;
    case 'SphereGeometry':
      objectItem = addSphere(vectorePosition);
      break;
    case 'CylinderGeometry':
      objectItem = addCylinder(vectorePosition);
      break;
    case 'DirectionalLight':
      const { light, helper } = addDirectionalLight(vectorePosition);
      objectItem = light;
      helperItem = helper;
      break;
  }

  objectItem.name = name;
  objectItem.uuid = serializedSceneItem.uuid;
  objectItem.rotation.set(rotation.x, rotation.y, rotation.z);
  objectItem.scale.set(scale.x, scale.y, scale.z);

  const object = EDITOR_STATE.scene.children.find(item => item.uuid === uuid) as EditorObject;
  if (!object) {
    EDITOR_STATE.scene.add(objectItem);
  }
  if (helperItem) {
    EDITOR_STATE.sceneHelper.add(helperItem);
  }
}
