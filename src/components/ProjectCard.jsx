// components/ProjectCard.jsx
import React from "react";

const ProjectCard = ({ project }) => {
  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Imagen del proyecto */}
      <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        {project.imageProject ? (
          <img 
            src={project.imageProject} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400">Sin imagen</span>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-xl text-gray-800 mb-1">{project.title}</h3>
            <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
              {project.category || 'Telecomunicaciones'}
            </span>
          </div>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
            project.status === 'Terminado' 
              ? 'bg-green-100 text-green-800' 
              : project.status === 'En progreso'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {project.status || 'Activo'}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {project.description || 'Descripción del proyecto...'}
        </p>

        {/* Información del creador y fecha */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-gray-600 text-sm">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>{project.userName || 'Usuario'}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 text-sm mt-1">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{project.date || '2025-05-05'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;