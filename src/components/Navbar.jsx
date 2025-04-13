import React from "react";
import {useContext, useEffect, useState} from "react";
import {NavLink} from "react-router-dom";
import {UserContext} from "../context/UserProvider";
import {useNavigate} from "react-router-dom";

/* This example requires Tailwind CSS v2.0+ */
import {Fragment} from "react";
import {Disclosure, Menu, Transition} from "@headlessui/react";
import {BellIcon, MenuIcon, XIcon} from "@heroicons/react/outline";
import {useFirestore} from "../hooks/useFirestore";

const navigation = [
  {name: "INICIO", href: "/", current: true},
  {name: "ACERCA DE", href: "/AboutUs", current: false},
  {name: "USUARIOS", href: "/users", current: false},
  {name: "PROYECTOS", href: "/article", current: false},
  {
    name: "BLOG",
    href: "https://semillerosiiis.blogspot.com/",
    current: false,
  },
  
  {name: "CONTACTO", href: "/Contact", current: false},
  {name: "Login", href: "/login", current: false},
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Navbar = () => {
  const {user, logoutUser} = useContext(UserContext);
  const {loading, getData} = useFirestore();
  const [data, setData] = useState([]);
  const navegate = useNavigate();
  const [open, setOpen] = useState(true);

  //carga de datos desde Firestore
  useEffect(() => {
    const loadData = async () => {
      const data = await getData();
      setData(data);
    };
    loadData();
  }, []);

  //Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await logoutUser();
      navegate("/login");
    } catch (error) {
      console.log(error.code);
    }
  };

  if (loading.getData || loading.getData === undefined) {
    return (
        <div className="text-center text-gray-500 text-xl font-bold h-screen">
          Cargando...
        </div>
    );
  }

  // render navbar
  return (
      <Disclosure as="nav" className="w-full z-30 top-0 bg-[#003054]">
        {({open}) => (
            <>
              <div className="max-w-full mx-auto px-2 sm:px-6 lg:px-6">
                <div className="relative flex items-center justify-between h-28">
                  <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                    {/* Mobile menu button*/}
                    <Disclosure.Button
                        className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                      <span className="sr-only">Abrir menú</span>
                      {open ? (
                          <XIcon className="block h-6 w-6" aria-hidden="true"/>
                      ) : (
                          <MenuIcon className="block h-6 w-6" aria-hidden="true"/>
                      )}
                    </Disclosure.Button>
                  </div>
                  <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                    <div className="flex-shrink-0 flex items-center">
                      <NavLink to="/">
                        <img
                            className="block lg:hidden h-20 w-auto"
                            src="https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/image_resource%2FLogo_white.png?alt=media&token=a444e9fd-bc8f-4918-a620-30e28a26e3ca"
                            alt="Workflow"
                        />
                      </NavLink>
                      <NavLink to="/">
                        <img
                            className="hidden lg:block h-24 w-auto"
                            src="https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/image_resource%2FLogo_white.png?alt=media&token=a444e9fd-bc8f-4918-a620-30e28a26e3ca"
                            alt="Workflow"
                        />
                      </NavLink>
                    </div>
                    <div className="hidden sm:block sm:ml-6 my-auto">
                      <div className="flex space-x-4">
                        {
                          navigation.map((item) => (
                              <div key={item.name}>
                                {
                                  // menu web
                                  item.name === "Login" || item.name === "Registro" ? (
                                          ""
                                      ) :
                                      item.name == "Blog" ? (
                                          <a
                                              target={"_blank"}
                                              href={item.href}
                                              className={classNames(
                                                  item.current
                                                      ? "bg-gray-900 text-white"
                                                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                                                  "px-3 py-2 rounded-md text-sm font-medium"
                                              )}
                                          >
                                            {item.name}
                                          </a>
                                      ) : (
                                          <NavLink
                                              to={item.href}
                                              className={({isActive}) =>
                                                  classNames(
                                                      isActive ? "text-[#F5BC4A]" : "text-gray-300 hover:text-[#F5BC4A]",
                                                      "px-3 py-2 text- font-medium"
                                                  )
                                              }
                                              aria-current={item.current ? "page" : undefined}
                                          >
                                            {item.name}
                                          </NavLink>

                                      )}
                              </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                  <div
                      className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    {user ? (
                        // user is logged in

                        <>
                          {/* button notification */}
                          <button
                              type="button"
                              className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                          >
                            <span className="sr-only">View notifications</span>
                            <BellIcon className="h-6 w-6" aria-hidden="true"/>
                          </button>
                          {/* Profile dropdown */}
                          <Menu as="div" className="ml-3 z-20">
                            <div>
                              <Menu.Button
                                  className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                <span className="sr-only">Open user menu</span>
                                <img
                                    id={"image-profile"}
                                    className="h-8 w-8 rounded-full object-cover object-center"
                                    src={data[0].profileImage}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                />
                              </Menu.Button>
                            </div>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items
                                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <Menu.Item>
                                  {({active}) => (
                                      <NavLink
                                          to="/profile"
                                          className={classNames(
                                              active ? "bg-gray-100" : "",
                                              "block px-4 py-2 text-sm text-gray-700"
                                          )}
                                      >
                                        Perfil
                                      </NavLink>
                                  )}
                                </Menu.Item>

                                <Menu.Item>
                                  {({active}) => (
                                      <button
                                          type="button"
                                          onClick={handleLogout}
                                          className={classNames(
                                              active ? "w-full bg-red-100  " : "",
                                              "text-gray-700  text-sm px-4 py-2 text-center inline-flex items-center   "
                                          )}
                                      >
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                          />
                                        </svg>
                                        Cerrar sesión
                                      </button>
                                  )}
                                </Menu.Item>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </>
                    ) : (
                        <>
                          <div className="hidden sm:block sm:ml-6">
                            <div className="flex space-x-4">
                              <NavLink
                                  key="login"
                                  to="/login"
                                  className="px-3 py-2 rounded-md text-lg font-medium text-[#947646] hover:text-[#7C501C] transition duration-300"
                                  style={{backgroundColor: "#F7D467"}} // Color inicial (naranja)
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F5BC4A")} // Color al pasar el mouse (naranja oscuro)
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F7D467")} // Vuelve al color original
                                  aria-current="page"
                              >
                                Iniciar sesión
                              </NavLink>
                            </div>
                          </div>
                        </>
                    )}
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 z-50">
                  {
                    // mobile menu
                    navigation.map((item) =>
                        user && (item.name === "Login" || item.name === "Registro") ? (
                                ""
                            ) :
                            item.name == "Blog" ? (
                                    <a
                                        key={item.name}
                                        target={"_blank"}
                                        href={item.href}
                                        className={classNames(
                                            item.current
                                                ? "bg-gray-900 text-white"
                                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                                            "px-3 py-2 rounded-md text-sm font-medium"
                                        )}
                                    >
                                      {item.name}
                                    </a>
                                ) :
                                item.name === "Registro" || item.name === "Login" ? (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        className={classNames(
                                            true
                                                ? "bg-amber-500 text-white"
                                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                                            "block px-3 py-2 rounded-md text-base font-medium"
                                        )}
                                        aria-current="page"
                                    >
                                      {item.name}
                                    </NavLink>
                                ) : (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        className={classNames(
                                            item.current
                                                ? "bg-gray-900 text-white"
                                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                                            "block px-3 py-2 rounded-md text-base font-medium"
                                        )}
                                        aria-current={item.current ? "page" : undefined}
                                    >
                                      {item.name}
                                    </NavLink>
                                )
                    )
                  }
                </div>
              </Disclosure.Panel>
            </>
        )}
      </Disclosure>
  );
};
export default Navbar;
