import { useState } from "react";
import firebaseApp from "../Firebase";
import { getAuth } from "firebase/auth";
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
  const [error, setError] = useState();
  const [loadingArticle, setLoadingArticle] = useState({});

  // get data from firestore with query
  const getDataArticleUser = async (userUID) => {
    try {
      setLoadingArticle((prev) => ({ ...prev, getData: true }));

      const dataRef = collection(db, "users");
      if (auth.currentUser) {
        const filterQuery = query(
          dataRef,
          where("userUID", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(filterQuery);
        const dataDb = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return dataDb;
      }
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoading((prev) => ({ ...prev, getData: false }));
    }
  };

  // get data all Articles from firestore
  const getDataArticles = async () => {
    try {
      setLoadingArticle((prev) => ({ ...prev, getDataArticles: true }));

      const dataRef = collection(db, "articles");
      const querySnapshot = await getDocs(dataRef);
      const dataDb = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return dataDb;
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoadingArticle((prev) => ({ ...prev, getDataArticles: false }));
    }
  };

  //  add data to firestore
  const addDataArticle = async (dataArticle) => {
    try {
      setLoadingArticle((prev) => ({ ...prev, addData: true }));
      const newDoc = dataArticle;

      const dataRef = collection(db, "articles");

      await addDoc(dataRef, newDoc);
      return newDoc;
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoadingArticle((prev) => ({ ...prev, addData: false }));
    }
  };

  // update data to firestore
  const updateDataArticle = async (dataArticle) => {
    try {
      setLoadingArticle((prev) => ({ ...prev, updateData: true }));
      const dataRef = doc(db, "articles", dataArticle.id);
      await updateDoc(dataRef, dataArticle);

      return (prev) =>
        prev.map((item) => (item.id === dataArticle.id ? dataArticle : item));
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoadingArticle((prev) => ({ ...prev, updateData: false }));
    }
  };

  // update Role to firestore
  const updateRoleArticle = async (dataArticle) => {
    try {
      setLoadingArticle((prev) => ({ ...prev, updateData: true }));
      const dataRef = doc(db, "articles", dataArticle.id);
      const newData = {
        role: dataArticle.role,
      };
      await updateDoc(dataRef, newData);

      return (prev) =>
        prev.map((item) => (item.id === dataArticle.id ? newData : item));
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoadingArticle((prev) => ({ ...prev, updateData: false }));
    }
  };

  // delete data to firestore
  const deleteDataArticle = async (idArticle) => {
    try {
      setLoadingArticle((prev) => ({ ...prev, [idArticle]: true }));
      const docRef = doc(db, "articles", idArticle);
      await deleteDoc(docRef);
      const dataArticle = await getDataArticles();
      return dataArticle.filter((item) => item.id !== idArticle);
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoadingArticle((prev) => ({ ...prev, [idArticle]: false }));
    }
  };

  // return data
  return {
    error,
    loadingArticle,
    getDataArticleUser,
    addDataArticle,
    getDataArticles,
    deleteDataArticle,
    updateDataArticle,
    updateRoleArticle,
  };
};
