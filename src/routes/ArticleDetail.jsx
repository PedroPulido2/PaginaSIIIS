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
    }, [id]);

    if (!article) {
        return (
            <div className="text-center text-gray-500 text-xl font-bold h-screen">
                Cargando artículo...
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <p className="text-gray-400 text-sm mt-4">{article.date}</p>
            <h1 className="text-4xl font-bold text-gray-800 mb-6">{article.title}</h1>
            <img
                src={article.imageArticle}
                alt={article.title}
                className="w-full h-96 object-cover rounded-lg mb-6"
            />
            <p className="text-gray-700 text-lg">{article.description}</p>
            <div className="mt-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contenido</h2>
                <div
                    className="prose prose-lg text-gray-700"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />
            </div>
        </div>
    );
};

export default ArticleDetail;
