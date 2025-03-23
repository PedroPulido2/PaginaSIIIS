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
export const useFirestore = () => {
  const [error, setError] = useState();
  const [loading, setLoading] = useState({});

  // get data from firestore with query
  const getData = async () => {
    try {
      setLoading((prev) => ({ ...prev, getData: true }));

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
  // get data user whit id from firestore with query
  const getDataUserId = async (userUID) => {
    try {
      setLoading((prev) => ({ ...prev, getDataUserId: true }));

      const dataRef = collection(db, "users");

      const filterQuery = query(
        dataRef,
        where("userUID", "==", userUID)
      );
      const querySnapshot = await getDocs(filterQuery);
      const dataDb = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return dataDb;

    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoading((prev) => ({ ...prev, getDataUserId: false }));
    }
  };

  // get data all users from firestore
  const getDataUsers = async () => {
    try {
      setLoading((prev) => ({ ...prev, getDataUsers: true }));

      const dataRef = collection(db, "users");
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
      setLoading((prev) => ({ ...prev, getDataUsers: false }));
    }
  };

  //  add data to firestore
  const addData = async (dataUser) => {
    try {
      setLoading((prev) => ({ ...prev, addData: true }));
      const newDoc = {
        name: dataUser.name,
        lastName: dataUser.lastName,
        email: auth.currentUser.email,
        phone: dataUser.phone,
        role: "user",
        userUID: auth.currentUser.uid,
        profileImage: dataUser.profileImage,
      };

      const dataRef = collection(db, "users");

      await addDoc(dataRef, newDoc);
      return newDoc;
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoading((prev) => ({ ...prev, addData: false }));
    }
  };

  // update data to firestore
  const updateData = async (dataUser) => {
    try {
      setLoading((prev) => ({ ...prev, updateData: true }));
      const dataRef = doc(db, "users", dataUser.id);
      await updateDoc(dataRef, dataUser);

      return ((prev) =>
        prev.map((item) => (item.id === dataUser.id ? dataUser : item))
      );

    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoading((prev) => ({ ...prev, updateData: false }));
    }
  };
  // update Role to firestore
  const updateRole = async (dataUser) => {
    try {
      setLoading((prev) => ({ ...prev, updateData: true }));
      const dataRef = doc(db, "users", dataUser.id);
      const newData = {
        role: dataUser.role,
      };
      await updateDoc(dataRef, newData);

      return ((prev) => {
        return prev.map((item) => (item.id === dataUser.id ? newData : item));
      });
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoading((prev) => ({ ...prev, updateData: false }));
    }
  };

  // delete data to firestore
  const deleteData = async (idUser) => {
    try {
      setLoading((prev) => ({ ...prev, [idUser]: true }));
      const docRef = doc(db, "users", idUser);
      await deleteDoc(docRef);
      const data = await getData();
      return data.filter((item) => item.id !== idUser);
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoading((prev) => ({ ...prev, [idUser]: false }));
    }
  };

  // return data
  return {    error,
    loading,
    getData,
    getDataUserId,
    addData,
    getDataUsers,
    deleteData,
    updateData,
    updateRole,
  };
};
