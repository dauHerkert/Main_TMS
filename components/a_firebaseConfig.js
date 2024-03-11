import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, updateEmail, updatePassword, sendPasswordResetEmail, deleteUser, reauthenticateWithCredential } from "firebase/auth";
import { getFirestore, collection, addDoc, setDoc, updateDoc, getDoc, doc, query, where, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuWqqoSEfawmsdJNQzIDKk6lfvEKAubmA",
  authDomain: "porsche-tms.firebaseapp.com",
  projectId: "porsche-tms",
  storageBucket: "porsche-tms.appspot.com",
  messagingSenderId: "267742806983",
  appId: "1:267742806983:web:7e8a7ed147f052676b8fe2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const user = auth.currentUser;

// Firebase functions export

export {initializeApp,
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile, 
  updateEmail, 
  updatePassword, 
  sendPasswordResetEmail, 
  deleteUser, 
  reauthenticateWithCredential,
  getFirestore, 
  collection, 
  addDoc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  writeBatch,
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
}

// Firebase variables export

export {
  app,
  auth,
  db,
  storage,
  user
}
