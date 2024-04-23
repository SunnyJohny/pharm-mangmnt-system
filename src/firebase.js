
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"; // Add this import
import { getAuth } from "firebase/auth"; // Add this import


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxhTI6rZLLbKCFrIU0jil6nDY2VO2Ma18",
  authDomain: "mydesktopapp-1bd6a.firebaseapp.com",
  projectId: "mydesktopapp-1bd6a",
  storageBucket: "mydesktopapp-1bd6a.appspot.com",
  messagingSenderId: "800343128337",
  appId: "1:800343128337:web:2862d7d340dc1e90c1b4b0",
  measurementId: "G-KX2LPRWM24"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Export db

// Export storage
export const storage = getStorage(app);
export const auth = getAuth(app); // Export auth

