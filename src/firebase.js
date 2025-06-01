import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAein7xOH_1o_osRfcZTl3bnpqxaFEg4kA",
  authDomain: "project-manager-cc22d.firebaseapp.com",
  projectId: "project-manager-cc22d",
  storageBucket: "project-manager-cc22d.appspot.com",
  messagingSenderId: "565040816519",
  appId: "1:565040816519:web:151a15271f6d325c117322",
  measurementId: "G-13RDQ8MTV7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const updateUserDatabase = async (user, uid) => {
  console.log("user", user, uid)
  if (typeof user !== "object") return;
  const docRef = doc(db, "users", uid);
  await setDoc(docRef, { ...user, uid });
};
const addProjectInDatabase = async (project) => {
  if (typeof project !== "object") return;
  const collectionRef = collection(db, "projects");
  await addDoc(collectionRef, { ...project });
};
const updateProjectInDatabase = async (project, pid) => {
  if (!typeof project === "object") return;

  const docRef = doc(db, "projects", pid);
  await setDoc(docRef, { ...project });
};

const getAllProjects = async () => {
  return await getDocs(collection(db, "projects"));
};
const getAllProjectsForUser = async (uid) => {
  if (!uid) return;

  const collectionRef = collection(db, "projects");
  const condition = where("refUser", "==", uid);
  const dbQuery = query(collectionRef, condition);

  return await getDocs(dbQuery);
};

const deleteProject = async(pid) => {
  const docRef = doc(db,"projects", pid);
  await deleteDoc(docRef);
}


const getUserFromDatabase = async (uid) => {
  const docRef = doc(db, "users", uid);
  const result = await getDoc(docRef);
  if (!result.exists()) return null;
  return result.data();
};
const uploadImage = (file, progressCallback, urlCallback, errorCallback) => {
  if (!file) {
    errorCallback("File not found");
    return;
  }

  const fileType = file.type;
  const fileSize = file.size / 1024 / 1024;
  if (!fileType.includes("image")) {
    errorCallback("File must be an image");
    return;
  }
  if (fileSize > 2) {
    errorCallback("File must be less than 2Mb");
    return;
  }
  const storageRef = ref(storage, `images/${file.name}`);
  const task = uploadBytesResumable(storageRef, file);
  task.on(
    `state_changed`,
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      progressCallback(progress);
    },
    (error) => {
      errorCallback(error.message);
    },
    () => {
      getDownloadURL(storageRef).then((url) => {
        urlCallback(url);
      });
    }
  );
};
export {
  app as default,
  auth,
  db,
  updateUserDatabase,
  getUserFromDatabase,
  uploadImage,
  addProjectInDatabase,
  updateProjectInDatabase ,
  getAllProjects,
  getAllProjectsForUser,
  deleteProject
};
