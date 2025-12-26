// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD04Bf5xWHeyIJQvNJIRKUxcEmz4H-rYcw",
  authDomain: "dating-web-auth.firebaseapp.com",
  projectId: "dating-web-auth",
  storageBucket: "dating-web-auth.firebasestorage.app",
  messagingSenderId: "448965327740",
  appId: "1:448965327740:web:874587b6fd187a265082f9",
  measurementId: "G-P1MYJEQ8DY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);  