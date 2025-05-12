import { useEffect, useState, useReducer } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import ModalPerPerson from "../components/ModalPerPeson";
import { useFirestore } from "../hooks/useFirestore";
import { ErrorsFirebase } from "../utils/ErrorsFirebase";
import SelectRole from "../components/SelectRole";
import { NavLink } from "react-router-dom";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { getDownloadURL } from "firebase/storage";

const Users = () => {
  const { loading, getData, getDataUsers, deleteData } = useFirestore();
  const [data, setData] = useState([]);
  const [dataUsers, setDataUsers] = useState([]);
  const [bannerUrl, setBannerUrl] = useState('');


  const reducer = (state, action) => {
    switch (action.type) {
      case "filter":
        return action.payload.data.filter((user) => {
          const filter = action.payload.filter.toLowerCase();
          return (
            user.name.toLowerCase().includes(filter) ||
            (user.academicStatus &&
              user.academicStatus.toLowerCase().includes(filter))
          );
        });
      case "all":
        return action.payload;
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getData();
      const dataUsers = await getDataUsers();
      dispatch({ type: "all", payload: dataUsers });
      setData(data);
      setDataUsers(
        dataUsers.sort((a, b) => {
          if (a.role === "admin" && b.role !== "admin") return -1;
          if (a.role !== "admin" && b.role === "admin") return 1;
          return 0;
        })
      );
      //imagen banner
      const storage = getStorage();
      const bannerRef = ref(storage, 'images_banner/usuarios.jpeg');

      getDownloadURL(bannerRef)
        .then((url) => {
          setBannerUrl(url);
        })
        .catch((error) => {
          console.error('Error al obtener la imagen del banner:', error);
        });
    };
    fetchData();
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
    <div className={"bg-[#FFF9E8] flex flex-col"}>
      <div className="relative w-full h-80 overflow-hidden">
        <img
          className="w-full h-full object-cover object-center"
          src={bannerUrl || "https://via.placeholder.com/1200x400?text=Banner"}
          alt="Fondo SIIIS"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <h1 className="text-white text-4xl lg:text-5xl font-bold">USUARIOS</h1>
        </div>
      </div>
      <div className="container flex flex-wrap justify-between items-center mx-auto pt-5 p-5">

        {data[0]?.role === "admin" && (
          <NavLink
            key="register"
            to="/register"
          className="p-3 bg-[#F7D467] hover:bg-[#F5BC4A] text-[#947646] hover:text-[#7C501C] rounded-lg text-sm"
            style={{ backgroundColor: "#F7D467" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F5BC4A")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F7D467")}
            aria-current="page"
          >
            Registrar usuario
          </NavLink>
        )}

        <div className="col-span-1 sm:col-span-2 md:col-end-7 md:col-span-2">
          <form>
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only"
            >
              Buscar
            </label>
            <div className="relative">
              <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500"
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
                className="block w-full p-4 pl-10 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Buscar..."
                required
                onChange={handleSearch}
              />
            </div>
          </form>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-1 gap-x-8 lg:grid-cols-2 xl:grid-cols-3 xl:gap-x-8">
        {state.map((item) => (
          <div key={item.id}>
            <ModalPerPerson item={item} data={data[0]} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
