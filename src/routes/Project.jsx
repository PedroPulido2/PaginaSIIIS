import React, {useEffect, useState, useReducer} from "react";
import {useForm} from "react-hook-form";
import {useFirestore} from "../hooks/useFirestore";
import {useFirestoreProjects} from "../hooks/useFirestoreProjects";
import {ErrorsFirebase} from "../utils/ErrorsFirebase";
import {getStorage, ref, deleteObject} from "firebase/storage";
import Modal_Project from "../components/Modal_Project";
import {getAuth} from "firebase/auth";

const Project = ({idPerson}) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const {
        loadingProject,
        getDataProjects,
        deleteDataProject,
    } = useFirestoreProjects();

    const {
        loading,
        getDataUsers,
        getData,
    } = useFirestore();

    const {setError} = useForm();

    const [users, setUsers] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [projectsFiltered, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case "filter":
                return action.payload.data.filter(project =>
                    project.title.toLowerCase().includes(action.payload.filter.toLowerCase())
                );
            case "all":
                return action.payload;
            default:
                return state;
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const usersData = await getDataUsers();
            const projectsData = await getDataProjects();
            setUsers(usersData);
            setAllProjects(projectsData);
            dispatch({type: "all", payload: projectsData});
        };
        fetchData();
    }, []);

    if (
        loading.getDataUsers ||
        loadingProject.getDataProjects ||
        (loadingProject.getDataProjects === undefined && loading.getDataUsers)
    ) {
        return (
            <div className="text-center text-gray-500 text-xl font-bold h-screen">
                Cargando...
            </div>
        );
    }

    const handleDelete = async (project) => {
        try {
            await deleteDataProject(project.id);
            const storage = getStorage();
            const imageRef = ref(storage, project.locationImage);
            await deleteObject(imageRef);
            window.location.reload(); // opcional: reemplazar por manejo de estado
        } catch (error) {
            const {code, message} = ErrorsFirebase(error.code);
            setError(code, {message});
        }
    };

    const handleSearch = (e) => {
        dispatch({
            type: "filter",
            payload: {
                filter: e.target.value,
                data: allProjects,
            },
        });
    };

    const renderProjectCard = (project) => {
        const user = users.find(u => u.userUID === project.userUID);

        return (
            <div key={project.id} className="group relative rounded-lg border">
                <div className="relative w-full h-80 bg-white rounded-t-lg overflow-hidden">
                    <img
                        src={project.imageProject}
                        alt={project.title}
                        className="w-full h-full object-center object-cover"
                    />
                </div>
                <div className="rounded-b-lg w-full p-4 bg-gray-800 text-white">
                    {/* CATEGORÍA al inicio */}
                    <div className="mb-2">
                    <span
                        className="inline-block px-3 py-1 rounded-full bg-blue-200 text-blue-800 text-xs font-semibold">
                        {project.projectCategory}
                    </span>
                    </div>

                    <p className="font-semibold">{project.title}</p>
                    <p className="font-semibold text-slate-200">{project.description}</p>

                    <div className="flex justify-end gap-4 mt-4">
                        <div>
                            <Modal_Project dataProject1={project} functionEdit="update"/>
                        </div>
                        {(currentUser?.uid === project.userUID || users.find(u => u.userUID === currentUser?.uid)?.role === "admin") && (
                            <div>
                                <button
                                    onClick={() => handleDelete(project)}
                                    type="button"
                                    className="w-full py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-amber-500 hover:text-white focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                                >
                                    Eliminar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center mt-4 space-x-4">
                        <img
                            className="w-10 h-10 border rounded-full"
                            src={user?.profileImage}
                            alt=""
                        />
                        <div>
                            <div>{user ? `${user.name} ${user.lastName}` : "Usuario desconocido"}</div>
                            <div className="text-sm text-gray-300">{project.date}</div>
                        </div>
                    </div>

                    {/* ESTADO al final con colores */}
                    <div className="mt-4 flex justify-end">
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                            ${project.projectState === 'Terminado'
                            ? 'bg-green-200 text-green-800'
                            : project.projectState === 'Aprobado'
                                ? 'bg-yellow-200 text-yellow-800'
                                : project.projectState === 'En espera de aprobación'
                                    ? 'bg-red-200 text-red-800'
                                    : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                        {project.projectState}
                    </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col py-16 bg-white">
            {/* Navbar */}
            <nav className="px-2 sm:px-4 py-2.5 dark:bg-gray-900">
                <div className="container flex flex-wrap justify-between items-center mx-auto">
                    <div className="flex md:order-2">
                        <form>
                            <label htmlFor="search" className="sr-only">Buscar</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                </div>
                                <input
                                    type="search"
                                    id="search"
                                    onChange={handleSearch}
                                    className="block p-4 pl-10 w-full text-sm bg-gray-50 border rounded-lg"
                                    placeholder="Buscar proyectos..."
                                />
                            </div>
                        </form>
                    </div>
                    <div className="hidden w-full md:flex md:w-auto md:order-1" id="navbar-search">
                        <ul className="flex flex-col md:flex-row md:space-x-8">
                            <li>
                                <a href="/Project" className="text-amber-500 font-bold text-xl">PROYECTOS</a>
                            </li>
                            {currentUser && (
                                <li>
                                    <Modal_Project dataProject1 functionEdit="create"/>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Proyectos */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {projectsFiltered.map(article =>
                            idPerson ? (
                                idPerson === article.userUID && renderProjectCard(article)
                            ) : (
                                renderProjectCard(article)
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Project;
