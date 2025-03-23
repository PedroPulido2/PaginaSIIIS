import { useEffect, useState, useReducer } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { useFirestore } from "../hooks/useFirestore";

const Members = () => {
  const { loading, getDataUsers } = useFirestore();
  const { setError } = useForm();
  const [dataUsers, setDataUsers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const dataUsers = await getDataUsers();
      setDataUsers(dataUsers);
    };
    loadData();
  }, []);

  if (loading.getDataUsers || loading.getDataUsers === undefined) {
    return (
      <div className="text-center text-gray-500 text-xl font-bold h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <div className="flex lg:flex-row flex-col justify-between gap-8 pt-12">
      <div className="w-full lg:w-5/12 flex flex-col justify-center">
        <h1 className="text-3xl lg:text-4xl font-bold leading-9 text-gray-800 pb-4">
          Integrantes del semillero
        </h1>
        <p className="font-normal text-base leading-6 text-gray-600 ">
          Somos integrantes del semillero de investigación SIIIS
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full lg:w-6/12 lg:pt-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        {dataUsers.map((user) => (
          user.role === "member" && (
            <div className="p-4 pb-6 text-center">
              <img className="w-40 h-40 rounded-full mx-auto object-cover" src={user.profileImage} alt="featured Img" />
              <p className="font-semibold text-xl leading-5 text-gray-800 mt-4">
                {user.name}
              </p>
              <p className="leading-6 text-gray-600" style={{ fontSize: "smaller" }}>
                <a href={`mailto:${user.email}`}>
                  {user.email}
                </a>
              </p>
            </div>
          )))}
      </div>

    </div >
  );
};
export default Members;
