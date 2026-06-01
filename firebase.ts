import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { isAllowedEmailDomain } from './authPolicy';

export const isAuthEnabled = import.meta.env.VITE_ENABLE_AUTH === 'true';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isConfigComplete =
  isAuthEnabled &&
  Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );

const app: FirebaseApp | null = isConfigComplete ? getApps()[0] ?? initializeApp(firebaseConfig) : null;

export const auth: Auth | null = app ? getAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app) : null;
export const googleProvider: GoogleAuthProvider | null = app ? new GoogleAuthProvider() : null;

export async function signInWithGoogle(): Promise<User> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Auth is not configured. Check your VITE_FIREBASE_* environment variables.');
  }

  const result = await signInWithPopup(auth, googleProvider);

  if (!isAllowedEmailDomain(result.user.email)) {
    await signOut(auth);
    throw new Error('This email domain is not allowed for this project.');
  }

  return result.user;
}

export async function logout(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}
