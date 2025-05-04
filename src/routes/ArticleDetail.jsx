import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";  // <---- IMPORTANTE
import { useFirestoreArticles } from "../hooks/useFirestoreArticles";
import { useFirestore } from "../hooks/useFirestore";

const ArticleDetail = () => {
    const { id } = useParams();
    const { getDataArticles } = useFirestoreArticles();
    const { getDataUsers } = useFirestore();

    const [article, setArticle] = useState(null);
    const [author, setAuthor] = useState(null);

    useEffect(() => {
        const fetchArticleAndAuthor = async () => {
            const articles = await getDataArticles();
            const foundArticle = articles.find((a) => a.id === id);
            if (foundArticle) {
                foundArticle.safeContent = DOMPurify.sanitize(foundArticle.content);
                setArticle(foundArticle);

                const users = await getDataUsers();
                const foundUser = users.find((u) => u.userUID === foundArticle.userUID);
                setAuthor(foundUser);
            }
        };
        fetchArticleAndAuthor();
    }, [id, getDataArticles, getDataUsers]);

    if (!article) {
        return (
            <div className="text-center text-gray-500 text-xl font-bold h-screen">
                Cargando artículo...
            </div>
        );
    }

    const statusClass =
        article.articleState === "Finalizado"
            ? "bg-green-200 text-green-800"
            : "bg-yellow-200 text-yellow-800";

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            {/* Estado del artículo */}
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${statusClass}`}>
                {article.articleState}
            </div>

            <h1 className="text-4xl font-bold text-gray-800 mb-6">{article.title}</h1>

            <img
                src={article.imageArticle}
                alt={article.title}
                className="w-full h-96 object-cover rounded-lg mb-6"
            />

            <div
                className="text-gray-700 text-lg"
                dangerouslySetInnerHTML={{ __html: article.safeContent }}
            ></div>

            {author ? (
                <div className="flex items-center space-x-4 mt-5">
                    <img
                        className="w-12 h-12 border rounded-full"
                        src={author.profileImage}
                        alt={`${author.name} ${author.lastName}`}
                    />
                    <div>
                        <div className="font-semibold text-gray-800">
                            {author.name} {author.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                            {author.role || "Autor"}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-gray-500 text-sm">Autor desconocido</div>
            )}
            <p className="text-gray-400 text-sm mb-8 mt-2">{article.date}</p>
        </div>
    );
};

export default ArticleDetail;
