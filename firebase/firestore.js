import { db, isFirebaseConfigured } from "./firebase-config.js";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const collections = {
  berita: "berita",
  galeri: "galeri",
  pengumuman: "pengumuman",
  agenda: "agenda",
  ppdb: "ppdb",
  users: "users"
};

export async function createDocument(collectionName, payload) {
  if (!isFirebaseConfigured) return null;
  return addDoc(collection(db, collectionName), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function updateDocument(collectionName, id, payload) {
  if (!isFirebaseConfigured) return null;
  return setDoc(doc(db, collectionName, id), { ...payload, updatedAt: serverTimestamp() }, { merge: true });
}

export async function removeDocument(collectionName, id) {
  if (!isFirebaseConfigured) return null;
  return deleteDoc(doc(db, collectionName, id));
}

export async function getCollection(collectionName) {
  if (!isFirebaseConfigured) return [];
  const snap = await getDocs(query(collection(db, collectionName), orderBy("createdAt", "desc")));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export function watchCollection(collectionName, callback) {
  if (!isFirebaseConfigured) return () => {};
  return onSnapshot(query(collection(db, collectionName), orderBy("createdAt", "desc")), (snap) => {
    callback(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}

window.addEventListener("mts:ppdb-submit", (event) => {
  createDocument(collections.ppdb, { ...event.detail, status: "Baru" });
});

window.addEventListener("mts:admin-save", (event) => {
  if (!isFirebaseConfigured) return;
  Object.entries(event.detail).forEach(([name, rows]) => {
    rows.forEach((row) => createDocument(collections[name] || name, row));
  });
});
