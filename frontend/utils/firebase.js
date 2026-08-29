// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "vidyut-40867.firebaseapp.com",
  projectId: "vidyut-40867",
  storageBucket: "vidyut-40867.firebasestorage.app",
  messagingSenderId: "747485466785",
  appId: "1:747485466785:web:b7606f18095e078e3320e0",
  measurementId: "G-YE59QB474H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth=getAuth(app)
export const googleProvider=new GoogleAuthProvider()