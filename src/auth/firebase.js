import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJuVsf9s0YUrSrZ-MX1PCldVwjSf80RWY",
  authDomain: "admin-dashboard-stephenscode.firebaseapp.com",
  projectId: "admin-dashboard-stephenscode",
  storageBucket: "admin-dashboard-stephenscode.firebasestorage.app",
  messagingSenderId: "265435005798",
  appId: "1:265435005798:web:fabccba1bf3cc15c0f7ea7"
};

// ✅ Initialize Firebase only once to avoid duplicate app error
const app =
  getApps().find((app) => app.name === "admin") ||
  initializeApp(firebaseConfig, "admin");

export const auth = getAuth(app);
export const db = getFirestore(app);