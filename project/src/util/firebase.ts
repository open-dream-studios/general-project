import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAUJxDE_S9EmxmFqxNuqrOkAXoyKu3zUt0",
  authDomain: "general-backend-7fee3.firebaseapp.com",
  projectId: "general-backend-7fee3",
  storageBucket: "general-backend-7fee3.firebasestorage.app",
  messagingSenderId: "509869577166",
  appId: "1:509869577166:web:9932a0e2347c0d38e7919f",
  measurementId: "G-8YVPMYVQPD",
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
