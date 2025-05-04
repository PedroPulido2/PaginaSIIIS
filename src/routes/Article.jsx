import React, { useEffect, useState, useReducer } from "react";
import { useForm } from "react-hook-form";
import { useFirestore } from "../hooks/useFirestore";
import { useFirestoreArticles } from "../hooks/useFirestoreArticles";
import { ErrorsFirebase } from "../utils/ErrorsFirebase";
import { getStorage, ref, deleteObject } from "firebase/storage";
import Modal_Article from "../components/Modal_Article";
import { getAuth } from "firebase/auth";

const Article = ({ idPerson }) => {
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

    const { setError } = useForm();

    const [users, setUsers] = useState([]);
    const [allArticles, setAllArticles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [articlesFiltered, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case "filter":
                return action.payload.data.filter(article => {
                    const searchLower = action.payload.filter.toLowerCase();
                    const inTitle = article.title.toLowerCase().includes(searchLower);
                    const inState = article.articleState.toLowerCase().includes(searchLower);
                    
                    const isStateSearch = 
                        searchLower.includes("curso") || 
                        searchLower.includes("finalizado");
                    if (searchLower === "finalizado" || searchLower === "en curso") {
                        return article.articleState.toLowerCase() === searchLower;
                        }
                    
                    if (isStateSearch) {
                        return inState && 
                               (searchLower.includes("curso") ? 
                                article.articleState === "en curso" : 
                                article.articleState === "finalizado");
                    }
                    
                    return inTitle || inState;
                });
            case "all":
                return action.payload;
            default:
                return state;
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const usersData = await getDataUsers();
            const articlesData = (await getDataArticles()).map(article => ({
                articleState: article.articleState || "en curso", // Valor por defecto
                ...article
            }));
            setUsers(usersData);
            setAllArticles(articlesData);
            dispatch({ type: "all", payload: articlesData });
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
            window.location.reload();
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
                data: allArticles
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
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold">{article.title}</p>
                            <p className="font-semibold text-slate-200">{article.description}</p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${stateStyles[article.articleState] || "bg-gray-100 text-gray-800"}`}>
                            {article.articleState}
                        </span>
                    </div>
                    <div className="flex justify-end gap-4 mt-4">
                        <div>
                            <Modal_Article dataArticle1={article} functionEdit="update" />
                        </div>
                        {(currentUser?.uid === article.userUID || users.find(u => u.userUID === currentUser?.uid)?.role === "admin") && (
                            <div>
                                <button
                                    onClick={() => handleDelete(article)}
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
                            <div className="text-sm text-gray-300">{article.date}</div>
                        </div>
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
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                </div>
                                <input
                                    type="search"
                                    id="search"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="block p-4 pl-10 w-full text-sm bg-gray-50 border rounded-lg"
                                    placeholder="Buscar por título o estado (ej: 'finalizado')"
                                />
                            </div>
                        </form>
                    </div>
                    <div className="hidden w-full md:flex md:w-auto md:order-1" id="navbar-search">
                        <ul className="flex flex-col md:flex-row md:space-x-8">
                            <li>
                                <a href="/Article" className="text-amber-500 font-bold text-xl">ARTÍCULOS</a>
                            </li>
                            {currentUser && (
                                <li>
                                    <Modal_Article dataArticle1 functionEdit="create"/>
                                </li>
                            )}
                        </ul>
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
