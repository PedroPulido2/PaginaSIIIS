// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // <-- Importa el Auth


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyCOIlveTW4sUKVAUYSKiF3MnZXMhE9pnWg",
	authDomain: "siiis-a2398.firebaseapp.com",
	projectId: "siiis-a2398",
	storageBucket: "siiis-a2398.appspot.com",
	messagingSenderId: "871879054586",
	appId: "1:871879054586:web:a0f6b820a46efc20c82543",
	measurementId: "G-P1KHRYDT5R",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp); // <-- Inicializa Auth


export { auth };
export default firebaseApp;