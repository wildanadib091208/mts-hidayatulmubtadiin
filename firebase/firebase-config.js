import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDbpXMqlf8NpGv9kNz98XekJ4DpFCNFUrE",
  authDomain: "mtshidayatulmubtadiin.firebaseapp.com",
  projectId: "mtshidayatulmubtadiin",
  storageBucket: "mtshidayatulmubtadiin.firebasestorage.app",
  messagingSenderId: "892505776165",
  appId: "1:892505776165:web:a95bb1c4f8ba93d7e09fcc",
  measurementId: "G-K0EMZECQ0T"
};

export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith("ISI_");
export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

