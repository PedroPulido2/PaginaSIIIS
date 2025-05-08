import React from "react";
import { getAuth } from "firebase/auth";
import Modal_Project from "./Modal_Project";

const ProjectCard = ({ project }) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const users = [];

    const handleDelete = async (project) => {
        console.log("Eliminar proyecto", project.id);
    };

    const user = users.find(u => u.userUID === project.userUID);

    return (
        <div className="group relative rounded-lg border">
            <div className="relative w-full h-80 bg-white rounded-t-lg overflow-hidden">
                <img
                    src={project.imageProject}
                    alt={project.title}
                    className="w-full h-full object-center object-cover"
                />
            </div>
            <div className="rounded-b-lg w-full p-4 bg-gray-800 text-white">
                {/* CATEGORÍA */}
                <div className="mb-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-200 text-blue-800 text-xs font-semibold">
                        {project.projectCategory}
                    </span>
                </div>

                <p className="font-semibold">{project.title}</p>
                <p className="font-semibold text-slate-200">{project.description}</p>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex justify-end gap-4 mt-4">
                    <div>
                        <Modal_Project dataProject1={project} functionEdit="update" />
                    </div>
                    {(currentUser?.uid === project.userUID || users.find(u => u.userUID === currentUser?.uid)) && (
                        <div>
                            <button
                                onClick={() => handleDelete(project)}
                                type="button"
                                className="w-full py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-amber-500 hover:text-white focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                            >
                      
                            </button>
                        </div>
                    )}
                </div>

                {/* INFO DEL USUARIO */}
                <div className="pt-3">
                  <div className="flex items-center space-x-2 text-white text-sm">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span>{project.userName || 'Usuario'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white text-sm mt-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>{project.date || '2025-05-05'}</span>
                  </div>
                </div>

                {/* ESTADO DEL PROYECTO */}
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

export default ProjectCard;