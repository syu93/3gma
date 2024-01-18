import { ViewHelper } from "three/examples/jsm/helpers/ViewHelper";
import { AVAILABLE_SHAPES, AVAILABLE_TOOLS } from "./menu";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

export const EDITOR_STATE = new Proxy(({
  transformControl: undefined as unknown as TransformControls,
  scene: undefined as unknown as THREE.Scene,
  camera: undefined as unknown as THREE.PerspectiveCamera,
  renderer: undefined as unknown as THREE.WebGLRenderer,
  selectedTool: AVAILABLE_TOOLS.SELECT,
  selectedShape: AVAILABLE_SHAPES.CUBE,
  selectedObject: null as THREE.Object3D | null,
  selectBox: undefined as unknown as THREE.BoxHelper,
  viewHelper: undefined as unknown as ViewHelper,
  objects: [] as THREE.Object3D[],
  clock: undefined as unknown as THREE.Clock,
  container: undefined as unknown as Element,
  sceneList: undefined as unknown as Element,
}), {
  set: (target, key, value) => {
    target[key] = value;
    return true;
  }
});
