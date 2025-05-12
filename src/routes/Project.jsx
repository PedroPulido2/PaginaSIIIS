import React, { useEffect, useState, useReducer } from "react";
import { useForm } from "react-hook-form";
import { useFirestore } from "../hooks/useFirestore";
import { useFirestoreProjects } from "../hooks/useFirestoreProjects";
import { ErrorsFirebase } from "../utils/ErrorsFirebase";
import { getStorage, ref, deleteObject } from "firebase/storage";
import Modal_Project from "../components/Modal_Project";
import { getAuth } from "firebase/auth";
import { getDownloadURL } from "firebase/storage";

const Project = ({ idPerson }) => {
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

    const { setError } = useForm();

    const [users, setUsers] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [bannerUrl, setBannerUrl] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const [uniqueYears, setUniqueYears] = useState([]);
    const [anioFilter, setAnioFilter] = useState('');
    const [categoriaFilter, setCategoriaFilter] = useState('');

    const [projectsFiltered, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case "filter":
                return action.payload.data.filter(project => {
                    const searchLower = action.payload.filter.toLowerCase();
                    const inTitle = project.title.toLowerCase().includes(searchLower);

                    return inTitle;
                });
            case "all":
                return action.payload;
            case "customFilter":
                return action.payload.data.filter(project => {
                    const matchEstado = action.payload.estado ? project.projectState.toLowerCase() === action.payload.estado.toLowerCase() : true;
                    const matchCategoria = action.payload.categoria ? project.projectCategory.toLowerCase() === action.payload.categoria.toLowerCase() : true;
                    const matchAnio = action.payload.anio ? project.date.includes(action.payload.anio) : true;
                    return matchEstado && matchAnio && matchCategoria;
                });
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
            dispatch({ type: "all", payload: projectsData });

            // Extraer años únicos
            const years = [...new Set(projectsData.map(project => project.date.slice(0, 4)))];
            setUniqueYears(years.sort((a, b) => b - a));

            //imagen banner
            const storage = getStorage();
            const bannerRef = ref(storage, 'images_banner/proyectos.jpeg');

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
            const { code, message } = ErrorsFirebase(error.code);
            setError(code, { message });
        }
    };

    const handleSearch = (e) => {
        const searchValue = e.target.value;
        setSearchTerm(searchValue);
        dispatch({
            type: "filter",
            payload: {
                filter: searchValue,
                data: allProjects
            },
        });
    };

    const handleEstadoFilter = (e) => {
        setEstadoFilter(e.target.value);
    };

    const handleCategoriaFilter = (e) => {
        setCategoriaFilter(e.target.value);
    };

    const handleAnioFilter = (e) => {
        setAnioFilter(e.target.value);
    };

    const handleFiltrar = () => {
        dispatch({
            type: "customFilter",
            payload: {
                estado: estadoFilter,
                categoria: categoriaFilter,
                anio: anioFilter,
                data: allProjects,
            },
        });
    };

    const handleViewProject = (projectId) => {
        window.location.href = `/project/${projectId}`;
    };

    const renderProjectCard = (project) => {
        const user = users.find(u => u.userUID === project.userUID);
        const isOwnerOrAdmin =
            currentUser?.uid === project.userUID ||
            users.find(u => u.userUID === currentUser?.uid)?.role === "admin";

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
                            {currentUser ? (
                                <Modal_Project dataProject1={project} functionEdit="update" />
                            ) : (
                                <button
                                    onClick={() => handleViewProject(project.id)}
                                    className="w-full py-2.5 px-5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                                >
                                    Abrir
                                </button>)}
                        </div>
                        {(currentUser?.uid === project.userUID || users.find(u => u.userUID === currentUser?.uid)?.role === "admin") && (
                            <div>
                                <button
                                    onClick={() => handleDelete(project)}
                                    type="button"
                                    className="p-3 bg-red-500 hover:bg-red-700 text-white rounded-lg text-sm"
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
        <div className={"bg-[#FFF9E8] flex flex-col"}>
            <div className="relative w-full h-80 overflow-hidden">
                <img
                    className="w-full h-full object-cover object-center"
                    src={bannerUrl || "https://via.placeholder.com/1200x400?text=Banner"}
                    alt="Fondo SIIIS"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                    <h1 className="text-white text-4xl lg:text-5xl font-bold">PROYECTOS</h1>
                </div>
            </div>
            {/* Navbar */}
            <nav className="px-2 sm:px-4 py-2.5 dark:bg-gray-900">
                <div className="container flex flex-wrap justify-between items-center mx-auto">
                    <div className="flex flex-wrap items-center gap-2 md:order-1">
                        <select
                            className="p-2 text-sm bg-gray-50 border rounded-lg min-w-[120px]"
                            onChange={handleEstadoFilter}
                        >
                            <option value="">Estado</option>
                            <option value="Terminado">Terminado</option>
                            <option value="Aprobado">Aprobado</option>
                            <option value="En espera de aprobación">En espera de aprobación</option>
                        </select>

                        <select
                            className="p-2 text-sm bg-gray-50 border rounded-lg min-w-[120px]"
                            onChange={handleCategoriaFilter}
                        >
                            <option value="">Categoria</option>
                            <option value="Software">Software</option>
                            <option value="Inteligencia Artificial">Inteligencia Artificial</option>
                            <option value="Telecomunicaciones">Telecomunicaciones</option>
                            <option value="Otra">Otra</option>
                        </select>

                        <select
                            className="p-2 text-sm bg-gray-50 border rounded-lg min-w-[100px]"
                            onChange={handleAnioFilter}
                        >
                            <option value="">Año</option>
                            {uniqueYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleFiltrar}
                            className="p-3 bg-[#9B6A2F] hover:bg-[#805325] text-white rounded-lg text-sm"
                        >
                            Filtrar
                        </button>

                        {currentUser && (
                            <div className="ml-2">
                                <Modal_Project dataProject1 functionEdit="create" />
                            </div>
                        )}
                    </div>

                    <div className="flex md:order-2 w-full md:w-auto mt-2 md:mt-0">
                        <form className="w-full">
                            <label htmlFor="search" className="sr-only">Buscar</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="search"
                                    id="search"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="block p-3 pl-10 w-full text-sm bg-gray-50 border rounded-lg"
                                    placeholder="Buscar proyectos..."
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </nav>

            {/* Proyectos */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {projectsFiltered.map(project =>
                            idPerson ? (
                                idPerson === project.userUID && renderProjectCard(project)
                            ) : (
                                renderProjectCard(project)
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Project;
