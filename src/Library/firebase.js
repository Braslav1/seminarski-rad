// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import {getFirestore } from "firebase/firestore"
import {getStorage } from "firebase/storage"


const firebaseConfig = {
  apiKey: "AIzaSyB2mgRZfR0mv99wrvvkSKNXdHrCfCBz54M",
  authDomain: "reactchat-19a9c.firebaseapp.com",
  projectId: "reactchat-19a9c",
  storageBucket: "reactchat-19a9c.appspot.com",
  messagingSenderId: "1064695232391",
  appId: "1:1064695232391:web:0c3db0e6ef370c54378522"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const database = getFirestore()
export const storage = getStorage()
