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
export const useFirestoreProjects = () => {
    const [error, setError] = useState(null);
    const [loadingProject, setLoadingProject] = useState({});

    // ✅ Obtener proyectos de un usuario por su UID
    const getDataProjectUser = async (userUID) => {
        try {
            setLoadingProject((prev) => ({...prev, getData: true}));
            setError(null);

            const dataRef = collection(db, "projects");
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
            setLoadingProject((prev) => ({...prev, getData: false}));
        }
    };

    // ✅ Obtener todos los proyectos
    const getDataProjects = async () => {
        try {
            setLoadingProject((prev) => ({...prev, getDataProjects: true}));
            setError(null);

            const dataRef = collection(db, "projects");
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
            setLoadingProject((prev) => ({...prev, getDataProjects: false}));
        }
    };

    // ✅ Agregar un proyecto
    const addDataProject = async (dataProject) => {
        try {
            setLoadingProject((prev) => ({...prev, addData: true}));
            setError(null);

            const dataRef = collection(db, "projects");
            await addDoc(dataRef, dataProject);

            return dataProject;
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoadingProject((prev) => ({...prev, addData: false}));
        }
    };

    // ✅ Actualizar un proyecto completo
    const updateDataProject = async (dataProject) => {
        try {
            setLoadingProject((prev) => ({...prev, updateData: true}));
            setError(null);

            const dataRef = doc(db, "projects", dataProject.id);
            await updateDoc(dataRef, dataProject);

            return true;
        } catch (error) {
            console.error(error);
            setError(error.message);
            return false;
        } finally {
            setLoadingProject((prev) => ({...prev, updateData: false}));
        }
    };

    // ✅ Actualizar solo el rol del proyecto
    const updateRoleProject = async (dataProject) => {
        try {
            setLoadingProject((prev) => ({...prev, updateRole: true}));
            setError(null);

            const dataRef = doc(db, "projects", dataProject.id);
            await updateDoc(dataRef, {role: dataProject.role});

            return true;
        } catch (error) {
            console.error(error);
            setError(error.message);
            return false;
        } finally {
            setLoadingProject((prev) => ({...prev, updateRole: false}));
        }
    };

    // ✅ Eliminar un proyecto
    const deleteDataProject = async (idProject) => {
        try {
            setLoadingProject((prev) => ({...prev, [idProject]: true}));
            setError(null);

            const docRef = doc(db, "projects", idProject);
            await deleteDoc(docRef);

            return true;
        } catch (error) {
            console.error(error);
            setError(error.message);
            return false;
        } finally {
            setLoadingProject((prev) => ({...prev, [idProject]: false}));
        }
    };

    return {
        error,
        loadingProject,
        getDataProjectUser,
        getDataProjects,
        addDataProject,
        updateDataProject,
        updateRoleProject,
        deleteDataProject,
    };
};
