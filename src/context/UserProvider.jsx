import React, { createContext, useEffect, useState } from "react";
import firebaseApp from "../Firebase";
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    deleteUser,
    sendPasswordResetEmail,
    sendEmailVerification,
} from "firebase/auth";

const auth = getAuth(firebaseApp);

export const UserContext = createContext();

const UserProvider = (props) => {
    const [user, setUser] = useState(false);

    // 👇 control de intentos y bloqueo
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockTime, setBlockTime] = useState(null);

    const BLOCK_DURATION = 5 * 60 * 1000; // bloqueo por limite de intentos fallidos

    // cerrar sesión tras inactividad (5 min)
    useEffect(() => {
        const unsuscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setTimeout(() => {
                    setUser(null);
                    signOut(auth);
                    alert("Sesión cerrada por inactividad");
                }, 5 * 60 * 1000);

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

    // registrar usuario
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
                throw error;
            });

    // login con bloqueo
    const loginUser = async (email, password) => {
        if (isBlocked) {
            throw new Error("blocked");
        }

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            if (user.emailVerified) {
                // resetear intentos al loguearse bien
                setLoginAttempts(0);
                setIsBlocked(false);
                return user;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error en login:", error.code, error.message);

            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);

            if (newAttempts >= 5) {
                setIsBlocked(true);
                setBlockTime(Date.now());

                setTimeout(() => {
                    setIsBlocked(false);
                    setLoginAttempts(0);
                }, BLOCK_DURATION);
            }

            throw error;
        }
    };

    // logout
    const logoutUser = () => signOut(auth);

    // eliminar usuario actual
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
            throw error;
        }
    };

    // eliminar usuario con id
    const deleteUserID = (id) => {
        const userTest = id;
        return deleteUser(userTest);
    };

    // reset password
    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                registerUser,
                loginUser,
                logoutUser,
                deleteUserWithID,
                resetPassword,
                isBlocked,
                loginAttempts,
                blockTime,
            }}
        >
            {props.children}
        </UserContext.Provider>
    );
};

export default UserProvider;
