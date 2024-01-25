import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, updateEmail, updatePassword, sendPasswordResetEmail, deleteUser, reauthenticateWithCredential } from "firebase/auth";
import { getFirestore, collection, addDoc, setDoc, updateDoc, getDoc, doc, query, where, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMoVGExyvb89NEa-M3EMl647-_rUN4XP4", 
  authDomain: "bho-copy.firebaseapp.com",
  projectId: "bho-copy",
  storageBucket: "bho-copy.appspot.com",
  messagingSenderId: "792136477405",
  appId: "1:792136477405:web:001c2802b72baa4321c934"
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