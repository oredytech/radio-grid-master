
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAefYkDBM1ouaLLjfzUb9zFm0hwmGEG7O8",
  authDomain: "radio-programmer-1eca6.firebaseapp.com",
  projectId: "radio-programmer-1eca6",
  storageBucket: "radio-programmer-1eca6.firebasestorage.app",
  messagingSenderId: "356789533960",
  appId: "1:356789533960:web:658803e1ccc41f54ca00bd",
  measurementId: "G-HMMSBWYS25"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
