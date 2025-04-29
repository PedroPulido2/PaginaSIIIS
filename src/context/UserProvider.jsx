import React from "react";
import { createContext, useEffect, useState } from "react";
import firebaseApp from "../Firebase";
import { ErrorsFirebase } from "../utils/ErrorsFirebase";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
const auth = getAuth(firebaseApp);

export const UserContext = createContext();

const UserProvider = (props) => {
  const [user, setUser] = useState(false);
  // method to logout user
  useEffect(() => {
    const unsuscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setTimeout(() => {
          setUser(null);
          signOut(auth);
        }, 8 * 60 * 60 * 1000);
        const { email, metadata, phoneNumber, photoURL, displayName, uid } =
          user;
        setUser({
          email,
          metadata,
          phoneNumber,
          photoURL,
          displayName,
          uid,
        });
      } else {
        setUser(null);
      }
    });
    return () => {
      unsuscribe();
    };
  }, []);

  // register user
  const registerUser = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        sendEmailVerification(user);
        alert("Se ha enviado un correo de verificación");
        return user;
      })
      .catch((error) => {
        console.error("Error en registro:", error.code, error.message);
        // Lanza el error para que lo capture el try/catch en el componente
        throw error; 
      });


  // login user
  const loginUser = (email, password) =>
    // validate email verification
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user.emailVerified) {
          return user;
        } else {
          return false;
        }
      })
      .catch((error) => {
        console.error("Error en registro:", error.code, error.message);
        // Lanza el error para que lo capture el try/catch en el componente
        throw error; 
      });

  // logout user
  const logoutUser = () => signOut(auth);

  // delete user
  const deleteUserWithID = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error("No hay usuario autenticado");
      }
      
      await deleteUser(user);
      console.log("Usuario eliminado correctamente");
      return true;
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      throw error; // Re-lanzamos el error para manejo superior
    }
  };

  // delete user whit id
  const deleteUserID = (id) => {
    const userTest = id;
    return deleteUser(userTest);
  };

  // reset password
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        registerUser,
        loginUser,
        logoutUser,
        deleteUserWithID,
        resetPassword
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export default UserProvider;
