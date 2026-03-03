import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCCl4hAn0NCAx-Zt-xNimrjlCWdfUJ5j2U",
  authDomain: "sitc-45e52.firebaseapp.com",
  projectId: "sitc-45e52",
  storageBucket: "sitc-45e52.firebasestorage.app",
  messagingSenderId: "102333986888",
  appId: "1:102333986888:web:7fd815ece3d55858e9c07d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Expose for cleanup
(window as any).db = db;

export default app;
