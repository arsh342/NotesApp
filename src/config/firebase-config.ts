// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type Auth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getConfig } from "./app-config";

// Get configuration from the config system
const config = getConfig();

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: config.FIREBASE_API_KEY,
  authDomain: config.FIREBASE_AUTH_DOMAIN,
  databaseURL: config.FIREBASE_DATABASE_URL,
  projectId: config.FIREBASE_PROJECT_ID,
  storageBucket: config.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
  appId: config.FIREBASE_APP_ID,
  measurementId: config.FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase config is complete
const isFirebaseConfigured =
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;

console.log("Firebase Config Debug:", {
  apiKey: firebaseConfig.apiKey ? "[PRESENT]" : "[MISSING]",
  projectId: firebaseConfig.projectId ? "[PRESENT]" : "[MISSING]",
  appId: firebaseConfig.appId ? "[PRESENT]" : "[MISSING]",
  isConfigured: isFirebaseConfigured,
  env: import.meta.env.MODE,
});

// Initialize Firebase only if configured
let app: any;
let analytics: any;
let auth: Auth | undefined;
let db: any;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    // Skip analytics in Electron environment to avoid errors
    if (typeof window !== "undefined" && !window.electronAPI) {
      analytics = getAnalytics(app);
    }
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    // Set auth to undefined on error
    auth = undefined;
  }
} else {
  console.warn(
    "Firebase not configured. The app will work in offline mode without cloud sync."
  );
}

export {
  auth,
  db,
  signInWithCredential,
  GoogleAuthProvider,
  analytics,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
};
