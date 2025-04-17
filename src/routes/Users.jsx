import { useEffect, useState, useReducer } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import ModalArticlesPerPerson from "../components/ModalArticlesPerPeson";
import { useFirestore } from "../hooks/useFirestore";
import { ErrorsFirebase } from "../utils/ErrorsFirebase";
import SelectRole from "../components/SelectRole";
import {NavLink} from "react-router-dom";

const Users = () => {
  const { loading, getData, getDataUsers, deleteData } = useFirestore();
  const [data, setData] = useState([]);
  const [dataUsers, setDataUsers] = useState([]);


  const reducer = (state, action) => {
    switch (action.type) {
      case "filter":
        return action.payload.data.filter((dataUsers) => {
          return dataUsers.name
            .toLowerCase()
            .includes(action.payload.filter.toLowerCase());
        });
      case "all":
        return action.payload;
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    const loadData = async () => {
      const data = await getData();
      const dataUsers = await getDataUsers();
      dispatch({ type: "all", payload: dataUsers });
      setData(data);
      setDataUsers(
        dataUsers.sort((a, b) => {
          if (a.role === "admin" && b.role !== "admin") {
            return -1;
          } else if (a.role !== "admin" && b.role === "admin") {
            return 1;
          } else {
            return 0;
          }
        })
      );
    };
    loadData();
  }, []);

  if (
    loading.getDataUsers ||
    loading.getData ||
    loading.getDataUsers === undefined
  ) {
    return (
      <div className="text-center text-gray-500 text-xl font-bold h-screen">
        Cargando...
      </div>
    );
  }

  const handleSearch = (e) => {
    dispatch({
      type: "filter",
      payload: {
        filter: e.target.value,
        data: dataUsers,
      },
    });
  };


  return (
    <div className="flex flex-col p-4 pt-14 bg-white">
      <div className="grid grid-cols-6 gap-4 p-6">
        <div className="col-start-1 col-end-3 ...">
          <h1 className="font-semibold text-blue-900 text-3xl">USUARIOS</h1>
        </div>

        <NavLink
            key="register"
            to="/register"
            className="px-3 py-2 rounded-md text-lg font-medium text-[#947646] hover:text-[#7C501C] transition duration-300"
            style={{backgroundColor: "#F7D467"}} // Color inicial (naranja)
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F5BC4A")} // Color al pasar el mouse (naranja oscuro)
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F7D467")} // Vuelve al color original
            aria-current="page"
        >
          Registrar usuario
        </NavLink>

        <div className="col-end-7 col-span-2 ...">
          <form>
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300"
            >
              Buscar
            </label>
            <div className="relative">
              <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Busqueda..."
                required=""
                onChange={handleSearch}
              />
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-1 gap-x-8 lg:grid-cols-2 xl:grid-cols-3 xl:gap-x-8">
        {state.map((item) => (
          <div key={item.id}>
            <ModalArticlesPerPerson item={item} data={data[0]} />
          </div>
        ))}
      </div>
    </div>
  );
};
export default Users;
