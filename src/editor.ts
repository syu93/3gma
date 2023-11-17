import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const camera = initCamera();
const renderer = new THREE.WebGLRenderer();
const orbitControls = new OrbitControls( camera, renderer.domElement );

const mousePosition = {
  x: 0,
  y: 0
};

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const phantomCube = new THREE.Mesh(geometry, material);

export function initEditor(container: Element) {
  scene.background = new THREE.Color(0x1D1D1D);

  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  animate();
  addHelpers();
  orbitControls.update();

  window.addEventListener('resize', onWindowResize);
  addMenuListener(container);
  window.addEventListener('mousemove', (event) => {
    mousePosition.x = (event.clientX / window.innerWidth) * 5;
    mousePosition.y = -(event.clientY / window.innerHeight) * 5;
  });
}

export function initCamera() {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 5000);
  camera.position.z = 5;

  return camera;
}

export function animate() {
  requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

function addHelpers() {
  const gridHelper = new THREE.GridHelper(100, 100);
  scene.add(gridHelper);


}

function onWindowResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  renderer.setSize(w, h);
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
}

function addMenuListener(container) {
  container.querySelector('.addElement').addEventListener('change', () => {
    createPhantomShape('cube');
  })
}

function addCube() {
  const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  const material = new THREE.MeshBasicMaterial( { color: 0xcccccc } );
  const cube = new THREE.Mesh(geometry, material);
  console.log(phantomCube.position.clone());
  
  cube.position.copy(phantomCube.position.clone());
  scene.add(cube);
}

function createPhantomShape(shape) {
  let trackMouse = true;
  switch(shape) {
    case 'cube':
      const { x, y } = mousePosition;
      phantomCube.position.x = x;
      phantomCube.position.y = y;
      window.addEventListener('mousemove', mouseListener);
      window.addEventListener('mousedown', () => trackMouse = false);
      window.addEventListener('mouseup', () => trackMouse = true);
      window.addEventListener('click', () => {
        addCube()
      })

      function mouseListener(event) {
        mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        mousePosition.y = - (event.clientY / window.innerHeight) * 2 + 1;
      
       // Make the sphere follow the mouse
        var vector = new THREE.Vector3(mousePosition.x, mousePosition.y, 0.5);
        vector.unproject(camera);
        var dir = vector.sub(camera.position).normalize();
        var distance = - camera.position.z / dir.z;
        var pos = camera.position.clone().add(dir.multiplyScalar(distance));
        if (trackMouse) {
          phantomCube.position.copy(pos);
        }
    }
      scene.add(phantomCube);
      return 
  }
}