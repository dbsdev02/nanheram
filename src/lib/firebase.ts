import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDCfhcThudCPAVNCTjnafR9ihDn_rpqQas",
  authDomain: "nanheram-15e3f.firebaseapp.com",
  projectId: "nanheram-15e3f",
  storageBucket: "nanheram-15e3f.firebasestorage.app",
  messagingSenderId: "759277377375",
  appId: "1:759277377375:web:de81dc69da82c3432688ea",
  measurementId: "G-02G81WQEGY",
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);

// Disable app verification for testing (remove in production)
// firebaseAuth.settings.appVerificationDisabledForTesting = true;

export { RecaptchaVerifier, signInWithPhoneNumber };
export type { ConfirmationResult };
