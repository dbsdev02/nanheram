import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDItXz-Qcn7XHbOQcXSi7z3Xo8LjEWBM9o",
  authDomain: "nanheram-ec8da.firebaseapp.com",
  projectId: "nanheram-ec8da",
  storageBucket: "nanheram-ec8da.firebasestorage.app",
  messagingSenderId: "266958448778",
  appId: "1:266958448778:web:39e1b62b7e6349f0b12573",
  measurementId: "G-9P1W4XSVFB",
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const firebaseAuth = getAuth(app);

export { RecaptchaVerifier, signInWithPhoneNumber };
export type { ConfirmationResult };
