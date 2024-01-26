import { initializeApp } from 'firebase/app';
import page from 'page';
import { getAuth, setPersistence, browserLocalPersistence, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, push, set, serverTimestamp, onChildAdded, onChildRemoved, onChildChanged } from "firebase/database";

// @ts-ignore
import firebaseConfig from '../firebase.json';
import { EDITOR_STATE } from './state';
import { EditorObject } from './sceneExplorer.sidebare';

initializeApp(firebaseConfig);


export const auth = getAuth();

export function loginWithGoogle() {
  const provider = new GoogleAuthProvider();

  setPersistence(auth, browserLocalPersistence).then(() => {
    signInWithPopup(auth, provider)
      .then(() => page('/'))
      .catch(console.error);
  })
}

export function getProjectList(callback) {
  const database = getDatabase();
  const projectsRef = ref(database, '/projects');
  onChildAdded(projectsRef, (snapshot) => {
    callback({
      id: snapshot.key,
      ...snapshot.val()
    });
  });
}

export function createProject(name: string) {
  const user = auth.currentUser;
  if (!user) {
    return;
  }

  const database = getDatabase();
  const projectListRef = ref(database, 'projects');
  const newProjectRef = push(projectListRef);
  set(newProjectRef, {
    name: name,
    createdAt: serverTimestamp(),
    createdBy: user.uid,
    scene: { scene: {}, sceneHelper: {} }
  });
}

export function saveScene(projectId) {
  const database = getDatabase();
  const projectRef = ref(database, `projects/${projectId}/scene`);
  set(projectRef, EDITOR_STATE.scene.children.map((item) => {
    const { name, position, rotation, scale, type, userData } = item as EditorObject;
    console.log(item);

    return {
      name,
      position: { x: position.x, y: position.y, z: position.z },
      rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
      scale: { x: scale.x, y: scale.y, z: scale.z },
      type: item?.geometry?.type ?? type,
    };
  }));
}

export function getProjectScene(projectId, callback) {
  const database = getDatabase();
  const projectRef = ref(database, `projects/${projectId}/scene`);
  onChildAdded(projectRef, (snapshot) => {
    callback({
      id: snapshot.key,
      ...snapshot.val()
    });
  });
}

export function setPlayerPosition(projectId, position) {
  const user = auth.currentUser;
  if (!user) {
    return;
  }
  const database = getDatabase();
  const projectRef = ref(database, `projects/${projectId}/player/${user.uid}`);
  set(projectRef, position);
}

export function getPlayersPosition(projectId, callback) {
  const database = getDatabase();
  const projectRef = ref(database, `projects/${projectId}/player`);
  onChildChanged(projectRef, (snapshot) => {
    callback({
      id: snapshot.key,
      ...snapshot.val()
    });
  });
}
