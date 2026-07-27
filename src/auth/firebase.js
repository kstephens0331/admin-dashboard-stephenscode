import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Multi-Project Firebase Configuration
 *
 * StephensCode uses 3 separate Firebase projects:
 * 1. stephenscode-12f75 - All orders
 * 2. customer-stephenscode - Customer authorization and account info
 * 3. admin-dashboard-stephenscode - Admin login information
 */

// Project 1: Orders Database (stephenscode-12f75)
const ordersConfig = {
  apiKey: "AIzaSyCfeUf56zdhPtsV0QkVqjd_WBP5OuFLQBA",
  authDomain: "stephenscode-12f75.firebaseapp.com",
  projectId: "stephenscode-12f75",
  storageBucket: "stephenscode-12f75.firebasestorage.app",
  messagingSenderId: "960805602405",
  appId: "1:960805602405:web:6d5fa556d89ca2ccabb28c"
};

// Project 2: Customer Data (customer-stephenscode)
const customerConfig = {
  apiKey: "AIzaSyCN8KHXDHnXglsiCnGox40G_fQZGxFJbdw",
  authDomain: "customer-stephenscode.firebaseapp.com",
  projectId: "customer-stephenscode",
  storageBucket: "customer-stephenscode.firebasestorage.app",
  messagingSenderId: "1004875053671",
  appId: "1:1004875053671:web:67079df56e91e5dc7572c2"
};

// Project 3: Admin Auth (admin-dashboard-stephenscode)
const adminConfig = {
  apiKey: "AIzaSyDJuVsf9s0YUrSrZ-MX1PCldVwjSf80RWY",
  authDomain: "admin-dashboard-stephenscode.firebaseapp.com",
  projectId: "admin-dashboard-stephenscode",
  storageBucket: "admin-dashboard-stephenscode.firebasestorage.app",
  messagingSenderId: "265435005798",
  appId: "1:265435005798:web:fabccba1bf3cc15c0f7ea7"
};

// Initialize all three Firebase apps
const ordersApp =
  getApps().find((app) => app.name === "orders") ||
  initializeApp(ordersConfig, "orders");

const customerApp =
  getApps().find((app) => app.name === "customers") ||
  initializeApp(customerConfig, "customers");

const adminApp =
  getApps().find((app) => app.name === "admin") ||
  initializeApp(adminConfig, "admin");

// Export auth and db for each project
export const auth = getAuth(adminApp); // Admin authentication
export const db = getFirestore(customerApp); // Customer data (default)
export const ordersDb = getFirestore(ordersApp); // Orders database
export const customerDb = getFirestore(customerApp); // Customer database (explicit)
export const adminDb = getFirestore(adminApp); // Admin database

// Auth instances for the other two projects. Firestore security rules are scoped per-project,
// so a signed-in admin has no real identity in "orders" or "customers" unless we sign in there
// too -- previously nothing did this, which is why those two projects' rules were left wide
// open (there was no request.auth to check against for the admin dashboard's own reads/writes).
export const ordersAuth = getAuth(ordersApp);
export const customerAuth = getAuth(customerApp);

// Call after the primary admin sign-in succeeds, with the same credentials, so the dashboard
// has a real Firebase Auth identity in every project it reads from. If either secondary
// sign-in fails (e.g. the matching user hasn't been created in that project yet), we don't
// fail the whole login over it -- the admin project's own auth is still the source of truth
// for "is this really an authorized admin"; the secondary sign-ins only unlock stricter rules
// on the other two projects once those accounts exist there.
export async function signInToAllProjects(email, password) {
  const results = await Promise.allSettled([
    signInWithEmailAndPassword(ordersAuth, email, password),
    signInWithEmailAndPassword(customerAuth, email, password),
  ]);
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const projectName = i === 0 ? "orders" : "customers";
      console.warn(`Could not sign in to the ${projectName} project (rules there may still be wide-open until this account exists):`, result.reason?.code || result.reason);
    }
  });
}

// Export apps for advanced use
export const apps = {
  orders: ordersApp,
  customers: customerApp,
  admin: adminApp
};
