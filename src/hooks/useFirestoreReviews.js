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
export const useFirestoreReviews = () => {
  const [error, setError] = useState();
  const [loadingReview, setLoadingReview] = useState({});

  // get data from firestore with query
  const getDataReviewUser = async (userUID) => {
    try {
      setLoadingReview((prev) => ({ ...prev, getData: true }));

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

  // get data all Reviews from firestore
  const getDataReviews = async () => {
    try {
      setLoadingReview((prev) => ({ ...prev, getDataReviews: true }));

      const dataRef = collection(db, "reviews");
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
      setLoadingReview((prev) => ({ ...prev, getDataReviews: false }));
    }
  };

  //  add data to firestore
  const addDataReview = async (dataReview) => {
    try {
      setLoadingReview((prev) => ({ ...prev, addData: true }));
      const newDoc = dataReview;

      const dataRef = collection(db, "reviews");

      await addDoc(dataRef, newDoc);
      return newDoc;
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoadingReview((prev) => ({ ...prev, addData: false }));
    }
  };

  // update data to firestore
  const updateDataReview = async (dataReview) => {
    try {
      setLoadingReview((prev) => ({ ...prev, updateData: true }));
      const dataRef = doc(db, "reviews", dataReview.id);
      
      await updateDoc(dataRef, dataReview);

      return (prev) =>
        prev.map((item) => (item.id === dataReview.id ? dataReview : item));
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoadingReview((prev) => ({ ...prev, updateData: false }));
    }
  };

  // update Role to firestore
  const updateRoleReview = async (dataReview) => {
    try {
      setLoadingReview((prev) => ({ ...prev, updateData: true }));
      const dataRef = doc(db, "reviews", dataReview.id);
      const newData = {
        role: dataReview.role,
      };
      await updateDoc(dataRef, newData);

      return (prev) =>
        prev.map((item) => (item.id === dataReview.id ? newData : item));
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoadingReview((prev) => ({ ...prev, updateData: false }));
    }
  };

  // delete data to firestore
  const deleteDataReview = async (idReview) => {
    try {
      setLoadingReview((prev) => ({ ...prev, [idReview]: true }));
      const docRef = doc(db, "reviews", idReview);
      await deleteDoc(docRef);
      const dataReview = await getDataReviews();
      return dataReview.filter((item) => item.id !== idReview);
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoadingReview((prev) => ({ ...prev, [idReview]: false }));
    }
  };

  // return data
  return {
    error,
    loadingReview,
    getDataReviewUser,
    addDataReview,
    getDataReviews,
    deleteDataReview,
    updateDataReview,
    updateRoleReview,
  };
};
