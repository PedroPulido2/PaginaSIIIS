import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useContext, useState } from "react";
import { Fragment } from "react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { UserContext } from "../context/UserProvider";
import { useFirestore } from "../hooks/useFirestore";
import { useFirestoreArticles } from "../hooks/useFirestoreArticles";
import { useFirestoreReviews } from "../hooks/useFirestoreReviews";
import Article from "../routes/Article";
import { ErrorsFirebase } from "../utils/ErrorsFirebase";
import SelectRole from "./SelectRole";
import SelectAcademicStatus from "./academicStatus";

const ModalArticlesPerPerson = ({ item, data }) => {
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);
  const { deleteData } = useFirestore();
  const { deleteDataArticle } = useFirestoreArticles();
  const { deleteDataReview } = useFirestoreReviews();
  const { deleteUserID } = useContext(UserContext);

  const { setError } = useForm();

  const handleClickDelete = async (id) => {
    try {
      await deleteData(id);
      await deleteDataArticle(id);
      await deleteDataReview(id);
      await deleteUserID(id);
      alert("Se ha eliminado el usuario");
      window.location.href = "/users";
    } catch (error) {
      console.log(error.code);
      const { code, message } = ErrorsFirebase(error.code);
      setError(code, { message });
    }
  };
  return (
    <>
      {/* Tarjeta de usuario */}
      <div className="flex bg-white font-sans border-t-4 border-teal-800 rounded-lg w-full h-full shadow-md hover:shadow-lg transition-shadow duration-300">
        {/* Sección de imagen */}
        <div className="flex-none w-1/3 relative min-h-[200px]">
          <button
            onClick={() => setOpen(true)}
            type="button"
            className="w-full h-full focus:outline-none bg-transparent rounded-l-lg overflow-hidden hover:opacity-90 transition-opacity"
          >
            <img
              src={item.profileImage}
              alt={`Foto de perfil de ${item.name}`}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        </div>

        {/* Sección de contenido */}
        <div className="flex-auto p-6 w-[calc(100%-200px)]">
          {/* Encabezado */}
          <div className="flex justify-between items-start mb-2">
            <span className="text-lg font-semibold text-slate-500 capitalize">
              {item.role === "user" ? "Usuario" : item.role === "member" ? "Integrante" : "Administrador"}
            </span>
            
            {!data || data.role !== "admin" ? (
              <span className={`text-sm font-semibold ${
                item.academicStatus === 'Activo' ? 'text-teal-700' : 'text-teal-700'
              }`}>
                {item.academicStatus}
              </span>
            ) : null}
          </div>

          {/* Nombre */}
          <h1 className="text-xl font-bold text-slate-900 mb-2 text-center">
            {`${item.name} ${item.lastName}`}
          </h1>

          {/* Email */}
          <div className="text-teal-800 mb-4 text-center border-b pb-4 text-sm font-medium">
            {item.email}
          </div>

          {/* Botón de hoja de vida */}
          {item.curriculumPDF && (
            <div className="w-full text-center mb-4">
              <a 
                href={item.curriculumPDF} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-[#00365D] hover:bg-[#00497F] text-white font-bold py-2 px-6 rounded transition-colors duration-200"
              >
                Ver hoja de vida
              </a>
            </div>
          )}

          {/* Controles de admin */}
          {data.role === "admin" && (
            <div className="space-y-4 mt-4">
              <SelectRole 
                idUser={item.id} 
                role={item.role} 
                className="w-full"
              />
              
              <SelectAcademicStatus 
                idUser={item.id} 
                academicStatus={item.academicStatus} 
                className="w-full"
              />
              
              <button
                className="h-10 w-full font-semibold rounded-md bg-black text-white"
                type="button"
                onClick={() => handleClickDelete(item.id)}
              >
                Eliminar usuario
              </button>
            </div>
          )}
        </div>
      </div>

      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all  w-auto my-8 mx-auto max-w-6xl">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="sm:m-4 stext-left">
                        <div className="grid grid-cols-6 gap-4">
                          <Dialog.Title
                            as="h1"
                            className="col-start-1 col-end-3 text-lg leading-6 font-medium text-gray-900"
                          >
                            Articulos publicados por {item.name}
                          </Dialog.Title>
                          <button
                            type="button"
                            className="col-end-7 mt-3 rounded-md border border-red-500 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={() => setOpen(false)}
                            ref={cancelButtonRef}
                          >
                            X
                          </button>
                        </div>

                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Aquí podras ver todos los articulos publicados por
                            el integrante seleccionado, etc...
                          </p>
                          <Article idPerson={item.userUID} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default ModalArticlesPerPerson;
