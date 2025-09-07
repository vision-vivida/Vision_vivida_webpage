// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
    getFirestore,
    setDoc,
    doc,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB0sTjtO2BgdD69EHAQBewAgwP1V_A2NLQ",
    authDomain: "user-data-44775.firebaseapp.com",
    projectId: "user-data-44775",
    storageBucket: "user-data-44775.firebasestorage.app",
    messagingSenderId: "1099112451180",
    appId: "1:1099112451180:web:305cacc4f1767d48261c49",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const signUp = document.getElementById("signup");
signUp.addEventListener("click", (event) => {
    event.preventDefault();
    const email = document.getElementById("su_email").value;
    const password = document.getElementById("su_password").value;
    const name = document.getElementById("su_name").value;

    const auth = getAuth();
    const db = getFirestore();

    createUserWithEmailAndPassword(auth, email, password).then(
        (userCredential) => {
            const user = userCredential.user;
            const userData = {
                email: email,
                name: name,
            };

            const docRef = doc(db, "users", user.id);
            setDoc(docRef, userData)
                .then(() => {
                    window.location.href = "index.html";
                })
                .catch((error) => {
                    console.error("Error!", error);
                })
                .catch((error) => {
                    const errorCode = error.code;
                    if (errorCode == "auth/email-already-in-use") {
                        alert("Email already in use");
                    } else {
                        alert("Unable to create User");
                    }
                });
        }
    );
});
