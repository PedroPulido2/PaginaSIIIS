import {useState} from "react";
import firebaseApp from "../Firebase";
import {getAuth} from "firebase/auth";
import {
    getFirestore,
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    updateDoc,
    where,
} from "firebase/firestore";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Hook
export const useFirestoreArticles = () => {
    const [error, setError] = useState(null);
    const [loadingArticle, setLoadingArticle] = useState({});

    // ✅ Obtener artículos de un usuario por su UID
    const getDataArticleUser = async (userUID) => {
        try {
            setLoadingArticle((prev) => ({...prev, getData: true}));
            setError(null);

            const dataRef = collection(db, "articles");
            const filterQuery = query(dataRef, where("userUID", "==", userUID));
            const querySnapshot = await getDocs(filterQuery);

            return querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error(error);
            setError(error.message);
            return [];
        } finally {
            setLoadingArticle((prev) => ({...prev, getData: false}));
        }
    };

    // ✅ Obtener todos los artículos
    const getDataArticles = async () => {
        try {
            setLoadingArticle((prev) => ({...prev, getDataArticles: true}));
            setError(null);

            const dataRef = collection(db, "articles");
            const querySnapshot = await getDocs(dataRef);

            return querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error(error);
            setError(error.message);
            return [];
        } finally {
            setLoadingArticle((prev) => ({...prev, getDataArticles: false}));
        }
    };

    // ✅ Agregar un artículo
    const addDataArticle = async (dataArticle) => {
        try {
            setLoadingArticle((prev) => ({...prev, addData: true}));
            setError(null);

            const dataRef = collection(db, "articles");
            await addDoc(dataRef, dataArticle);

            return dataArticle;
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoadingArticle((prev) => ({...prev, addData: false}));
        }
    };

    // ✅ Actualizar un artículo completo
    const updateDataArticle = async (dataArticle) => {
        try {
            setLoadingArticle((prev) => ({...prev, updateData: true}));
            setError(null);

            const dataRef = doc(db, "articles", dataArticle.id);
            await updateDoc(dataRef, dataArticle);

            return true;
        } catch (error) {
            console.error(error);
            setError(error.message);
            return false;
        } finally {
            setLoadingArticle((prev) => ({...prev, updateData: false}));
        }
    };

    // ✅ Actualizar solo el rol del artículo
    const updateRoleArticle = async (dataArticle) => {
        try {
            setLoadingArticle((prev) => ({...prev, updateRole: true}));
            setError(null);

            const dataRef = doc(db, "articles", dataArticle.id);
            await updateDoc(dataRef, {role: dataArticle.role});

            return true;
        } catch (error) {
            console.error(error);
            setError(error.message);
            return false;
        } finally {
            setLoadingArticle((prev) => ({...prev, updateRole: false}));
        }
    };

    // ✅ Eliminar un artículo
    const deleteDataArticle = async (idArticle) => {
        try {
            setLoadingArticle((prev) => ({...prev, [idArticle]: true}));
            setError(null);

            const docRef = doc(db, "articles", idArticle);
            await deleteDoc(docRef);

            return true;
        } catch (error) {
            console.error(error);
            setError(error.message);
            return false;
        } finally {
            setLoadingArticle((prev) => ({...prev, [idArticle]: false}));
        }
    };

    return {
        error,
        loadingArticle,
        getDataArticleUser,
        getDataArticles,
        addDataArticle,
        updateDataArticle,
        updateRoleArticle,
        deleteDataArticle,
    };
};
