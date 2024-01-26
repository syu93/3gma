import { initializeApp } from 'firebase/app';
import page from 'page';
import { getAuth, setPersistence, browserLocalPersistence, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, push, set, serverTimestamp, onChildAdded, onChildRemoved, onChildChanged } from "firebase/database";

// @ts-ignore
import firebaseConfig from '../firebase.json';
import { EDITOR_STATE } from './state';
import { EditorObject } from './sceneExplorer.sidebare';
import { SerializedSceneItem } from './scene.loader';

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

export function saveScene(serializedScene: SerializedSceneItem[]) {
  const database = getDatabase();
  const projectRef = ref(database, `projects/${EDITOR_STATE.PROJECT_ID}/scene`);
  set(projectRef, serializedScene);
}

export function getProjectScene(callback) {
  const database = getDatabase();
  const projectRef = ref(database, `projects/${EDITOR_STATE.PROJECT_ID}/scene`);
  onChildAdded(projectRef, (snapshot) => {
    callback({
      eventType: 'child_added',
      id: snapshot.key,
      ...snapshot.val()
    });
  });
  onChildChanged(projectRef, (snapshot) => {
    callback({
      eventType: 'child_changed',
      id: snapshot.key,
      ...snapshot.val()
    });
  });
}

export function setPlayerPosition(positionAndColor) {
  const user = auth.currentUser;
  if (!user) {
    return;
  }
  const database = getDatabase();
  const projectRef = ref(database, `projects/${EDITOR_STATE.PROJECT_ID}/player/${user.uid}`);
  set(projectRef, positionAndColor);
}

export function getPlayersPosition(callback) {
  const database = getDatabase();
  const projectRef = ref(database, `projects/${EDITOR_STATE.PROJECT_ID}/player`);
  onChildChanged(projectRef, (snapshot) => {
    callback({
      id: snapshot.key,
      ...snapshot.val()
    });
  });
}

export function getUser() {
  return auth.currentUser;
}