import { auth, db, isFirebaseConfigured } from "./firebase-config.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function loginAdmin(email, password) {
  if (!isFirebaseConfigured) return { ok: true, demo: true };
  try {
    await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem("mts-auth-role", "admin");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

export async function loginSiswa(nisn, password) {
  if (!isFirebaseConfigured) return { ok: true, demo: true };
  try {
    const found = await getDocs(query(collection(db, "users"), where("nisn", "==", nisn), where("role", "==", "siswa")));
    if (found.empty) throw new Error("NISN tidak ditemukan.");
    const user = found.docs[0].data();
    await signInWithEmailAndPassword(auth, user.email, password);
    localStorage.setItem("mts-auth-role", "siswa");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

export async function logout() {
  if (isFirebaseConfigured) await signOut(auth);
  localStorage.removeItem("mts-auth-role");
}

export function protect(role, redirect = "../login/index.html") {
  if (!isFirebaseConfigured) {
    if (localStorage.getItem("mts-auth-role") !== role) location.href = redirect;
    return;
  }
  onAuthStateChanged(auth, (user) => {
    if (!user) location.href = redirect;
  });
}

window.mtsFirebaseAuth = { loginAdmin, loginSiswa, logout, protect };
