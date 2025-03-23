import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import { useFirestore } from "../hooks/useFirestore";
import { ErrorsFirebase } from "../utils/ErrorsFirebase";
import React from "react";

const people = [
  {
    id: 1,
    name: "Usuario",
    avatar:
      "https://img2.freepng.es/20180714/ro/kisspng-computer-icons-user-membership-vector-5b498fc76f2a07.4607730515315475914553.jpg",
  },
  {
    id: 2,
    name: "Administrador",
    avatar:
      "https://e7.pngegg.com/pngimages/524/546/png-clipart-computer-icons-management-account-manager-account-manager-desktop-wallpaper-black.png",
  },
  {
    id: 3,
    name: "Integrante",
    avatar:
      "https://e7.pngegg.com/pngimages/524/546/png-clipart-computer-icons-management-account-manager-account-manager-desktop-wallpaper-black.png",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

//update to role
const SelectRole = ({ idUser, role }) => {
  const { updateRole } = useFirestore();
  const [error, setError] = useState();

  const [selected, setSelected] = useState(
    role === "user" ? people[0] : role === "admin" ? people[1] : people[2]
  );

  const handleChange = async (e) => {
    setSelected(e);
    const role_card = document.getElementById(`role-card-${idUser}`);
    role_card.innerHTML = e.name;

    try {
      await updateRole({ id: idUser, role: e.id === 1 ? "user" : e.id === 2 ? "admin" : "member" });
      alert("Rol Actualizado");
    } catch (error) {
      console.log(error.code);
      const { code, message } = ErrorsFirebase(error.code);
      setError(code, { message });
    }
  };

  return (
    <Listbox value={selected} onChange={handleChange}>
      {({ open }) => (
        <>
          <Listbox.Label className="block text-sm font-medium text-gray-700 m-auto">
            Rol:
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
                {people.map((person) => (
                  <Listbox.Option
                    key={person.id}
                    className={({ active }) =>
                      classNames(
                        active ? "text-white bg-amber-500" : "text-gray-900",
                        "cursor-default select-none relative py-2 pl-3 pr-9"
                      )
                    }
                    value={person}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          <img
                            src={person.avatar}
                            alt=""
                            className="flex-shrink-0 h-6 w-6 rounded-full"
                          />
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "ml-3 block truncate"
                            )}
                          >
                            {person.name}
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

export default SelectRole;
