import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import { useFirestore } from "../hooks/useFirestore";
import { ErrorsFirebase } from "../utils/ErrorsFirebase";
import React from "react";

const statuses = [
  {
    id: 1,
    name: "Activo",
    avatar: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
  },
  {
    id: 2,
    name: "Docente",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  },
  {
    id: 3,
    name: "Egresado",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  },
  {
    id: 4,
    name: "Otro",
    avatar: "https://cdn-icons-png.flaticon.com/512/1828/1828665.png",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// update academic status
const SelectAcademicStatus = ({ idUser, academicStatus }) => {
  const { updateAcademicStatus } = useFirestore(); 
  const [error, setError] = useState();

  const [selected, setSelected] = useState(
    statuses.find((s) => s.name === academicStatus) || statuses[0]
  );

  const handleChange = async (e) => {
    setSelected(e);
    const status_card = document.getElementById(`academic-status-card-${idUser}`);
    if (status_card) status_card.innerHTML = e.name;

    try {
      await updateAcademicStatus({ id: idUser, academicStatus: e.name });
      alert("Estado académico actualizado");
    } catch (error) {
      const { code, message } = ErrorsFirebase(error.code);
      setError(code, { message });
    }
  };

  return (
    <Listbox value={selected} onChange={handleChange}>
      {({ open }) => (
        <>
          <Listbox.Label className="block text-sm font-medium text-gray-700 m-auto">
            Estado Académico:
          </Listbox.Label>
          <div className="mt-1 relative w-full">
            <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <span className="flex items-center">
                <img
                  src={selected.avatar}
                  alt=""
                  className="flex-shrink-0 h-6 w-6 rounded-full"
                />
                <span className="ml-3 block truncate">{selected.name}</span>
              </span>
              <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {statuses.map((status) => (
                  <Listbox.Option
                    key={status.id}
                    className={({ active }) =>
                      classNames(
                        active ? "text-white bg-amber-500" : "text-gray-900",
                        "cursor-default select-none relative py-2 pl-3 pr-9"
                      )
                    }
                    value={status}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          <img
                            src={status.avatar}
                            alt=""
                            className="flex-shrink-0 h-6 w-6 rounded-full"
                          />
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "ml-3 block truncate"
                            )}
                          >
                            {status.name}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-indigo-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};

export default SelectAcademicStatus;

