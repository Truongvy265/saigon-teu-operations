import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";

const env = (import.meta as ImportMeta & { env: Record<string, string> }).env;
export const frontendAuthMode = env.VITE_AUTH_MODE || "development";
export const isFirebaseAuth = frontendAuthMode === "firebase";
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};
if (isFirebaseAuth && Object.values(config).some((value) => !value)) {
  throw new Error("Firebase web configuration is incomplete");
}
const auth = isFirebaseAuth ? getAuth(initializeApp(config)) : null;

export const getFirebaseToken = async () =>
  auth?.currentUser ? auth.currentUser.getIdToken() : null;
export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Firebase authentication is not enabled");
  return signInWithPopup(auth, new GoogleAuthProvider());
};
export const signOutUser = () => (auth ? signOut(auth) : Promise.resolve());
export const observeAuth = (callback: (user: User | null) => void) =>
  auth ? onAuthStateChanged(auth, callback) : () => {};
