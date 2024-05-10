
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { REACT_APP_FIREBASE_API_KEY } from "./fakeEnv";
import { REACT_APP_FIREBASE_AUTH_DOMAIN } from "./fakeEnv";
import { REACT_APP_FIREBASE_STORAGE_BUCKET } from "./fakeEnv";
import { REACT_APP_FIREBASE_MESSAGING_SENDER_ID } from "./fakeEnv";
import { REACT_APP_FIREBASE_APP_ID } from "./fakeEnv";
import { REACT_APP_FIREBASE_MEASUREMENT_ID } from "./fakeEnv";
import { REACT_APP_FIREBASE_PROJECT_ID } from "./fakeEnv";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: REACT_APP_FIREBASE_API_KEY,
  authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:  REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: REACT_APP_FIREBASE_APP_ID,
  measurementId: REACT_APP_FIREBASE_MEASUREMENT_ID
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(app);
enableIndexedDbPersistence(firestoreDb)
  .then(() => {
    console.log("Firestore persistence enabled.");
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log("Multiple tabs open, persistence can only be enabled in a single tab at a time.");
    } else if (err.code === 'unimplemented') {
      console.log("The current browser does not support all of the features required to enable persistence.");
    }
  });

// Export Firestore database
export const db = firestoreDb;

// Export other Firebase services
export const storage = getStorage(app);
export const auth = getAuth(app);
