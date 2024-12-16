import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAddVFPUylRtcoNiEKXFuIuz4CDKwu4BIU",
    authDomain: "loudinhos-47369.firebaseapp.com",
    projectId: "loudinhos-47369",
    storageBucket: "loudinhos-47369.firebasestorage.app",
    messagingSenderId: "200419926947",
    appId: "1:200419926947:web:ca7aadf264f4b666983016",
    measurementId: "G-86Z91659K8"
  };

const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);

export const db = getFirestore(app);

