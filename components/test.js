jQuery(function() {
    console.log('firebase test');
    jQuery('.text-block1').addClass('foo23432');
});



import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, updateEmail, updatePassword, sendPasswordResetEmail, deleteUser, reauthenticateWithCredential } from "firebase/auth";
import { getFirestore, collection, addDoc, setDoc, updateDoc, getDoc, doc, query, where, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

console.log('------------------------------------------------------------------------------------------------------');
console.log('Starting firebase configurationnn');
console.log('------------------------------------------------------------------------------------------------------');