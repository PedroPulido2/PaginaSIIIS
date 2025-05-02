import React, { useEffect, useState } from "react";
import { useFirestoreArticles } from "../hooks/useFirestoreArticles";
import { useFirestore } from "../hooks/useFirestore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useNavigate } from 'react-router-dom';

const ArticleCarousel = () => {
    const { getDataArticles, loadingArticle } = useFirestoreArticles();
    const { getDataUsers, loading } = useFirestore();
    const [articles, setArticles] = useState([]);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const articlesData = await getDataArticles();
            const usersData = await getDataUsers();
            setArticles(articlesData);
            setUsers(usersData);
        };
        fetchData();
    }, []);

    if (loadingArticle.getDataArticles || loading.getDataUsers) {
        return (
            <div className="text-center text-gray-500 text-xl font-bold h-screen flex items-center justify-center">
                Cargando artículos...
            </div>
        );
    }

    const getUserById = (userUID) => users.find(u => u.userUID === userUID);

    const handleViewArticle = (id) => {
        navigate(`/Article/${id}`);
    };

    const handleViewAllArticles = () => {
        navigate('/Article');
    };

    return (
        <div className="py-10" style={{ backgroundColor: "#FFF9E8" }}>
            <h2 className="text-3xl font-bold text-center mb-8" style={{ color: "#805325" }}>Artículos</h2>

            {/* Contenedor general */}
            <div className="relative max-w-7xl mx-auto px-4">

                {/* Carrusel */}
                <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 5000 }}
                    breakpoints={{
                        640: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                >
                    {articles.map((article) => {
                        const user = getUserById(article.userUID);
                        return (
                            <SwiperSlide key={article.id} className="overflow-hidden">
                                <div className="group relative rounded-lg border bg-white shadow-md">
                                    <div className="relative w-full h-60 bg-white rounded-t-lg overflow-hidden">
                                        <img
                                            src={article.imageArticle}
                                            alt={article.title}
                                            className="w-full h-full object-center object-cover"
                                        />
                                    </div>
                                    <div className="rounded-b-lg p-4">
                                        <h3 className="text-xl font-semibold text-gray-800">{article.title}</h3>
                                        <p className="text-sm text-gray-600">{article.description}</p>
                                        <div className="flex items-center mt-2 space-x-4">
                                            <img
                                                className="w-10 h-10 border rounded-full"
                                                src={user?.profileImage}
                                                alt={user?.name}
                                            />
                                            <div>
                                                <div>{user ? `${user.name} ${user.lastName}` : "Autor desconocido"}</div>
                                                <div className="text-xs text-gray-400">{article.date}</div>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-center">
                                            <button
                                                onClick={() => handleViewArticle(article.id)}
                                                className="px-6 py-2 rounded-lg transition"
                                                style={{
                                                    backgroundColor: "#9B6A2F",
                                                    color: "#ffffff",
                                                }}
                                                onMouseOver={(e) => (e.target.style.backgroundColor = "#805325")}
                                                onMouseOut={(e) => (e.target.style.backgroundColor = "#9B6A2F")}
                                            >
                                                Leer más
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

            </div>

            {/* Botón Ver más */}
            <div className="mt-5 text-center">
                <button
                    onClick={handleViewAllArticles}
                    className="px-8 py-3 font-semibold rounded-lg transition"
                    style={{
                        backgroundColor: "#9B6A2F",
                        color: "#ffffff",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#805325")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#9B6A2F")}
                >
                    Ver más artículos
                </button>
            </div>
        </div>
    );
};

export default ArticleCarousel;
