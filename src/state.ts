import { ViewHelper } from "three/examples/jsm/helpers/ViewHelper";
import { AVAILABLE_TOOLS } from "./menu";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { AVAILABLE_SHAPES } from "./shape";

export const EDITOR_STATE = new Proxy(({
  transformControl: undefined as unknown as TransformControls,
  orbitControl: undefined as unknown as OrbitControls,
  scene: undefined as unknown as THREE.Scene,
  sceneHelper: undefined as unknown as THREE.Scene,
  camera: undefined as unknown as THREE.PerspectiveCamera,
  renderer: undefined as unknown as THREE.WebGLRenderer,
  selectedTool: AVAILABLE_TOOLS.SELECT,
  selectedShape: AVAILABLE_SHAPES.CUBE,
  selectedObject: null as THREE.Object3D | null,
  selectBox: undefined as unknown as THREE.BoxHelper,
  pointerTarget: undefined as unknown as THREE.Object3D,
  viewHelper: undefined as unknown as ViewHelper,
  clock: undefined as unknown as THREE.Clock,
  container: undefined as unknown as Element,
  sceneList: undefined as unknown as Element,
  mouved: false,
}), {
  set: (target, key, value) => {
    target[key] = value;
    return true;
  }
});
