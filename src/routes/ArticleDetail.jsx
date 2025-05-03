// src/routes/ArticleDetail.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFirestoreArticles } from "../hooks/useFirestoreArticles"; // Ajusta si tienes un hook similar

const ArticleDetail = () => {
    const { id } = useParams();
    const { getDataArticles } = useFirestoreArticles();
    const [article, setArticle] = useState(null);

    useEffect(() => {
        const fetchArticle = async () => {
            const articles = await getDataArticles();
            const foundArticle = articles.find((a) => a.id === id);
            setArticle(foundArticle);
        };
        fetchArticle();
    }, [id, getDataArticles]);

    if (!article) {
        return (
            <div className="text-center text-gray-500 text-xl font-bold h-screen">
                Cargando artículo...
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">{article.title}</h1>
            <img
                src={article.imageArticle}
                alt={article.title}
                className="w-full h-96 object-cover rounded-lg mb-6"
            />
            <p className="text-gray-700 text-lg">{article.description}</p>
            <p className="text-gray-400 text-sm mt-4">{article.date}</p>
        </div>
    );
};

export default ArticleDetail;
