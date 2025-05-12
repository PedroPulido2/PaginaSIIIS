import React from "react";

/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import EditorTiny from "./Editor";

const Modal_Article = ({ dataArticle1, functionEdit }) => {
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        type="button"
          className="p-3 bg-[#F7D467] hover:bg-[#F5BC4A] text-[#947646] hover:text-[#7C501C] rounded-lg text-sm"
      >
        {functionEdit === "create" ? "Crear" : "Abrir"}
      </button>
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
                            SIIIS
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
                            Aquí podras ver o editar tu Articulo, noticia,
                            opinión, reseña, etc...
                          </p>

                          <EditorTiny
                            dataArticle1={dataArticle1}
                            functionEdit={functionEdit}
                          />
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

export default Modal_Article;
