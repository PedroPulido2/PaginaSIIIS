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
      <div className="flex font-sans border-t-4 border-teal-800 rounded-lg w-full h-full">
        <div className="flex-none w-1/3 relative">
          <button
            onClick={() => setOpen(true)}
            type="button"
            className="w-full border-t-4 focus:outline-none bg-transparent rounded-lg hover:bg-gray-100  hover:text-amber-400 hover:border-amber-500 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 "
          >
            <img
              src={item.profileImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover shadow-lg shadow-slate-500/50 hover:shadow-gray-800"
              loading="lazy"
            />
          </button>
        </div>

        <form className="flex-auto shadow-lg p-6 rounded-r-lg shadow-slate-500/50 w-[calc(100%-200px)]">
          <div className="flex flex-wrap">
            <div
              className="w-full text-lg font-semibold text-slate-500 flex-auto text-right"
              id={`role-card-${item.id}`}
            >
              {item.role === "user" ? "Usuario" : item.role === "member" ? "Integrante" : "Administrador"}
            </div>
            <h1 className="w-full flex-auto text-lg font-semibold text-slate-900 text-center">
              {item.name + " " + item.lastName}
            </h1>

            {/* para resolucion de celular hacer la letra más pequeña */}
            <div className="flex-auto font-semibold text-teal-800 my-6 border-b-2 text-center" style={{ fontSize: "smaller" }}>

              {item.email}
            </div>
          </div>
          {data.role === "admin" && (
            <>
              <div className="flex space-x-4 mb-6 text-sm font-medium">
                <div className="flex-auto flex space-x-4">
                  <SelectRole idUser={item.id} role={item.role} />
                </div>
              </div>

              <button
                className="h-10 w-full  font-semibold rounded-md bg-black text-white"
                type="button"
                onClick={() => handleClickDelete(item.id, item.userUID)}
              >
                Eliminar
              </button>
            </>
          )}
        </form>
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
