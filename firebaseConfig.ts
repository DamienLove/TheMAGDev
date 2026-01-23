import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAO-DXZ8knhGC_YwuOSO5uy1O88vUJrzgk",
  authDomain: "themagdev-a4363.firebaseapp.com",
  projectId: "themagdev-a4363",
  storageBucket: "themagdev-a4363.firebasestorage.app",
  messagingSenderId: "947338942541",
  appId: "1:947338942541:web:b49270814bfd08a54b2404",
  measurementId: "G-W8MXZXRSVX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, analytics };
