import React, { useEffect, useState } from "react";
import { useFirestoreArticles } from "../hooks/useFirestoreArticles";
import { useFirestore } from "../hooks/useFirestore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ArticleCarousel = () => {
    const { getDataArticles, loadingArticle } = useFirestoreArticles();
    const { getDataUsers, loading } = useFirestore();
    const [articles, setArticles] = useState([]);
    const [users, setUsers] = useState([]);

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
            <div className="text-center text-gray-500 text-xl font-bold h-screen">
                Cargando artículos...
            </div>
        );
    }

    const getUserById = (userUID) => users.find(u => u.userUID === userUID);

    return (
        <div className="py-10 bg-gray-100">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Últimos Artículos</h2>
            <div className="max-w-7xl mx-auto px-4">
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    navigation
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
                            <SwiperSlide key={article.id}>
                                <div className="group relative rounded-lg border bg-white shadow hover:shadow-lg transition-all">
                                    <div className="relative w-full h-60 overflow-hidden rounded-t-lg">
                                        <img
                                            src={article.imageArticle}
                                            alt={article.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800">{article.title}</h3>
                                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{article.description}</p>
                                        <div className="flex items-center mt-4 space-x-3">
                                            {user?.profileImage && (
                                                <img
                                                    src={user.profileImage}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full border"
                                                />
                                            )}
                                            <div className="text-sm">
                                                <p className="font-medium">{user ? `${user.name} ${user.lastName}` : "Desconocido"}</p>
                                                <p className="text-gray-400">{article.date}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
        </div>
    );
};

export default ArticleCarousel;
