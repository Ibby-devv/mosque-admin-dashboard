import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration
// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCFcrgT_hwmTSZqbh1b1AUuEZHmK_j_41k",
  authDomain: "al-madina-masjid-app.firebaseapp.com",
  projectId: "al-madina-masjid-app",
  storageBucket: "al-madina-masjid-app.firebasestorage.app",
  messagingSenderId: "677907945511",
  appId: "1:677907945511:web:22b20d135b00451ca41602"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { auth, db };