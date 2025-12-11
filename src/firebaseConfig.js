import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBYh0X-ClFEmNs3o2uXjEgyWYSq4Q8R-4Y",
  authDomain: "madara-moba-e9ece.firebaseapp.com",
  databaseURL: "https://madara-moba-e9ece-default-rtdb.firebaseio.com",
  projectId: "madara-moba-e9ece",
  storageBucket: "madara-moba-e9ece.firebasestorage.app",
  messagingSenderId: "185739151066",
  appId: "1:185739151066:web:62cfe21dce7bace7320f7f"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Realtime Database
const rtdb = getDatabase(app);

// ❗ Export BOTH
export { firebaseConfig, app, rtdb };
