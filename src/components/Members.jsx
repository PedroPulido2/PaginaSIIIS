import { useEffect, useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { useFirestore } from "../hooks/useFirestore";

const Members = () => {
    const { loading, getDataUsers } = useFirestore();
    const { setError } = useForm();
    const [dataUsers, setDataUsers] = useState([]);
    const [page, setPage] = useState(0);
    const perPage = 4; 

    useEffect(() => {
        const loadData = async () => {
            const users = await getDataUsers();
            setDataUsers(users);
        };
        loadData();
    }, []);

    const totalPages = Math.ceil(dataUsers.length / perPage);

    const paginatedUsers = dataUsers.slice(page * perPage, (page + 1) * perPage);

    if (loading.getDataUsers || loading.getDataUsers === undefined) {
        return (
            <div className="text-center text-gray-500 text-xl font-bold h-screen">
                Cargando...
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pt-12 px-4 items-center">
            <div className="w-full text-center">
                <h1 className="text-3xl lg:text-4xl font-bold leading-9 text-brown-700 pb-2">
                    Integrantes
                </h1>
                <p className="font-normal text-base text-gray-600">
                    Somos integrantes del semillero de investigación SIIIS
                </p>
            </div>

            {/* Grid de miembros paginados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                {paginatedUsers.map((user, index) => (
                    <div key={index} className="border-2 border-brown-700 rounded-lg p-6 flex flex-col items-center bg-white">
                        <img
                            className="w-24 h-24 rounded-full object-cover mb-4"
                            src={user.profileImage}
                            alt="Integrante"
                        />
                        <p className="font-semibold text-lg text-brown-700">
                            {user.name}
                        </p>
                        <p className="text-gray-600 text-sm break-words text-center">
                            <a href={`mailto:${user.email}`}>
                                {user.email}
                            </a>
                        </p>
                    </div>
                ))}
            </div>

            {/* Controles de navegación */}
            <div className="flex items-center justify-center gap-6 mt-4">
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        page === 0 ? 'bg-brown-300 cursor-not-allowed' : 'bg-brown-700 hover:bg-brown-800'
                    }`}
                    disabled={page === 0}
                >
                    <span className="text-black text-xl">←</span>
                </button>
                
                <span className="text-brown-700 font-medium text-lg">
                    {page + 1}/{totalPages}
                </span>
                
                <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        page >= totalPages - 1 ? 'bg-brown-300 cursor-not-allowed' : 'bg-brown-700 hover:bg-brown-800'
                    }`}
                    disabled={page >= totalPages - 1}
                >
                    <span className="text-black text-xl">→</span>
                </button>
            </div>


        </div>
    );
};

export default Members;
