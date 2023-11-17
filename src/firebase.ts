import { initializeApp } from 'firebase/app';
import page from 'page';
import { getAuth, setPersistence, browserLocalPersistence, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

import firebaseConfig from '../firebase.json';

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

