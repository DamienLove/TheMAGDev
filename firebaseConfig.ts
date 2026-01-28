import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Ignore analytics init errors to avoid blocking app render.
    });
}
const auth = getAuth(app);
const db = getFirestore(app);
export { app, analytics, auth, db };
