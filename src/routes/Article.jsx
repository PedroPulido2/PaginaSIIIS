import React, {useEffect, useState, useReducer} from "react";
import {useForm} from "react-hook-form";
import {useFirestore} from "../hooks/useFirestore";
import {useFirestoreArticles} from "../hooks/useFirestoreArticles";
import {ErrorsFirebase} from "../utils/ErrorsFirebase";
import {getStorage, ref, deleteObject} from "firebase/storage";
import Modal_Article from "../components/Modal_Article";
import { getAuth } from "firebase/auth";
import { getDownloadURL } from "firebase/storage";

const Article = ({idPerson}) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const {
        loadingArticle,
        getDataArticles,
        deleteDataArticle,
    } = useFirestoreArticles();

    const {
        loading,
        getDataUsers,
        getData,
    } = useFirestore();

    const {setError} = useForm();

    const [users, setUsers] = useState([]);
    const [allArticles, setAllArticles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [uniqueYears, setUniqueYears] = useState([]);
    const [estadoFilter, setEstadoFilter] = useState('');
    const [anioFilter, setAnioFilter] = useState('');
    const [bannerUrl, setBannerUrl] = useState('');


    const [articlesFiltered, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case "filter":
                return action.payload.data.filter(article => {
                    const searchLower = action.payload.filter.toLowerCase();
                    const inTitle = article.title.toLowerCase().includes(searchLower);

                    return inTitle;
                });
            case "all":
                return action.payload;
            case "customFilter":
                return action.payload.data.filter(article => {
                    const matchEstado = action.payload.estado ? article.articleState.toLowerCase() === action.payload.estado.toLowerCase() : true;
                    const matchAnio = action.payload.anio ? article.date.includes(action.payload.anio) : true;
                    return matchEstado && matchAnio;
                });
            default:
                return state;
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const usersData = await getDataUsers();
            const articlesData = await getDataArticles();
            setUsers(usersData);
            setAllArticles(articlesData);
            dispatch({ type: "all", payload: articlesData });
            // Extraer años únicos
            const years = [...new Set(articlesData.map(article => article.date.slice(0, 4)))];
            setUniqueYears(years.sort((a, b) => b - a));

            //imagen banner
            const storage = getStorage();
            const bannerRef = ref(storage, 'images_banner/articulos.jpeg');

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
        loadingArticle.getDataArticles ||
        (loadingArticle.getDataArticles === undefined && loading.getDataUsers)
    ) {
        return (
            <div className="text-center text-gray-500 text-xl font-bold h-screen">
                Cargando...
            </div>
        );
    }

    const handleDelete = async (article) => {
        try {
            await deleteDataArticle(article.id);
            const storage = getStorage();
            const imageRef = ref(storage, article.locationImage);
            await deleteObject(imageRef);
            window.location.reload(); // opcional: reemplazar por manejo de estado
        } catch (error) {
            const {code, message} = ErrorsFirebase(error.code);
            setError(code, {message});
        }
    };

    const handleSearch = (e) => {
        const searchValue = e.target.value;
        setSearchTerm(searchValue);
        dispatch({
            type: "filter",
            payload: {
                filter: searchValue,
                data: allArticles
            },
        });
    };

    const handleViewArticle = (articleId) => {
        window.location.href = `/article/${articleId}`;
    };

    const handleEstadoFilter = (e) => {
        setEstadoFilter(e.target.value);
    };

    const handleAnioFilter = (e) => {
        setAnioFilter(e.target.value);
    };

    const handleFiltrar = () => {
        dispatch({
            type: "customFilter",
            payload: {
                estado: estadoFilter,
                anio: anioFilter,
                data: allArticles,
            },
        });
    };

    const renderArticleCard = (article) => {
        const user = users.find(u => u.userUID === article.userUID);

        const stateStyles = {
            "en curso": "bg-blue-100 text-blue-800",
            "finalizado": "bg-green-100 text-green-800"
        };

        return (
            <div key={article.id} className="group relative rounded-lg border">
                <div className="relative w-full h-80 bg-white rounded-t-lg overflow-hidden">
                    <img
                        src={article.imageArticle}
                        alt={article.title}
                        className="w-full h-full object-center object-cover"
                    />
                </div>
                <div className="rounded-b-lg w-full p-4 bg-gray-800 text-white">
                    <span className={`text-xs font-medium px-3 py-0.5 rounded-full ${stateStyles[article.articleState] || "bg-gray-100 text-gray-800"}`}>
                        {article.articleState}
                    </span>
                    <div className="flex justify-between items-start">
                        <div>
                            <br />
                            <p className="font-semibold">{article.title}</p>
                            <p className="font-semibold text-slate-200">{article.description}</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-4">
                        <div>
                            {currentUser ? (
                                <Modal_Article dataArticle1={article} functionEdit="update" />
                            ) : (
                                <button
                                    onClick={() => handleViewArticle(article.id)}
                                    className="w-full py-2.5 px-5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                                >
                                    Abrir
                                </button>
                            )}
                        </div>
                        {(currentUser?.uid === article.userUID || users.find(u => u.userUID === currentUser?.uid)?.role === "admin") && (
                            <div>
                                <button
                                    onClick={() => handleDelete(article)} // esta sí es tu función definida más arriba
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
                            <div className="text-sm text-gray-300">{article.date}</div>
                        </div>
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
                    <h1 className="text-white text-4xl lg:text-5xl font-bold">ARTÍCULOS</h1>
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
                            <option value="Finalizado">Finalizado</option>
                            <option value="En curso">En curso</option>
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
                                <Modal_Article dataArticle1 functionEdit="create" />
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
                                    onChange={handleSearch}
                                    className="block p-2 pl-10 w-full text-sm bg-gray-50 border rounded-lg"
                                    placeholder="Buscar artículos..."
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </nav>

            {/* Artículos */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {articlesFiltered.map(article =>
                            idPerson ? (
                                idPerson === article.userUID && renderArticleCard(article)
                            ) : (
                                renderArticleCard(article)
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Article;
