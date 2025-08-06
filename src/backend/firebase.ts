// firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';

// Going to need good security rules for this cuz we're going to plug it into our frontend immediately

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALuEqlKoQ6TevOdRjtiDDf1BpF2vS4APk",
  authDomain: "hangout-381ea.firebaseapp.com",
  projectId: "hangout-381ea",
  storageBucket: "hangout-381ea.firebasestorage.app",
  messagingSenderId: "747472194707",
  appId: "1:747472194707:web:bedf291b66aaf5a8aa1166",
  measurementId: "G-FR8RYFNYYJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const db = getFirestore(app);

export { db };
