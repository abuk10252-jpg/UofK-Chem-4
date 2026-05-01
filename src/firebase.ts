import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBBq6jJ_25f6zPAxKPZew_kh-4UFAQLIEM",
  authDomain: "uofk-chem.firebaseapp.com",
  projectId: "uofk-chem",
  storageBucket: "uofk-chem.firebasestorage.app",
  messagingSenderId: "647909218035",
  appId: "1:647909218035:web:6838d2e4e6508c60b44986",
};

// 🔥 تهيئة Firebase بشكل آمن
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);

// للتتبع في الـ console
console.log("✅ Firebase initialized successfully with project:", firebaseConfig.projectId);
