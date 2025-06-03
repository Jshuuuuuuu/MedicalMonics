
import { initializeApp, setLogLevel } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfigFromEnv = typeof __firebase_config !== 'undefined' ? __firebase_config : null;


const defaultConfig = {
  apiKey: "AIzaSyCJ2Iy14TS9XsOiEaYeuAJydi-spMV1OKk",
  authDomain: "medmonics-a2cf3.firebaseapp.com",
  projectId: "medmonics-a2cf3",
  storageBucket: "medmonics-a2cf3.firebasestorage.app",
  messagingSenderId: "545139689649",
  appId: "1:545139689649:web:d9409d427e9bf590123a90",
  measurementId: "G-RT0G9DSPFE"
};

const firebaseConfig = firebaseConfigFromEnv ? JSON.parse(firebaseConfigFromEnv) : defaultConfig;


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setLogLevel('debug'); 


const currentAppId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.appId || 'default-mnemonics-app';


export const getMnemonicsCollectionPath = (userId) => {
    if (!userId) throw new Error("User ID is required for Firestore path.");

    return `artifacts/${currentAppId}/users/${userId}/mnemonics`;
};

export { app, auth, db, currentAppId as appId };
