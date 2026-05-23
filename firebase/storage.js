import { storage, isFirebaseConfigured } from "./firebase-config.js";
import { getDownloadURL, ref, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

export function uploadPpdbFile(nisn, file, type, onProgress = () => {}) {
  if (!isFirebaseConfigured || !file) return Promise.resolve({ simulated: true, path: `ppdb/${nisn}/${type}/${file?.name || "file"}` });
  const fileRef = ref(storage, `ppdb/${nisn}/${type}/${Date.now()}-${file.name}`);
  const task = uploadBytesResumable(fileRef, file);
  return new Promise((resolve, reject) => {
    task.on("state_changed", (snap) => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)), reject, async () => {
      resolve({ url: await getDownloadURL(task.snapshot.ref), path: task.snapshot.ref.fullPath });
    });
  });
}
