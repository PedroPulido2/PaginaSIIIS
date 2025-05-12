import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";  // <---- IMPORTANTE
import { useFirestoreProjects } from "../hooks/useFirestoreProjects";
import { useFirestore } from "../hooks/useFirestore";

const ProjectDetail = () => {
    const { id } = useParams();
    const { getDataProjects } = useFirestoreProjects();
    const { getDataUsers } = useFirestore();

    const [project, setProject] = useState(null);
    const [author, setAuthor] = useState(null);

    useEffect(() => {
        const fetchProjectAndAuthor = async () => {
            const projects = await getDataProjects();
            const foundProject = projects.find((a) => a.id === id);
            if (foundProject) {
                foundProject.safeContent = DOMPurify.sanitize(foundProject.content);
                setProject(foundProject);

                const users = await getDataUsers();
                const foundUser = users.find((u) => u.userUID === foundProject.userUID);
                setAuthor(foundUser);
            }
        };
        fetchProjectAndAuthor();
    }, [id]);

    if (!project) {
        return (
            <div className="text-center text-gray-500 text-xl font-bold h-screen">
                Cargando proyecto...
            </div>
        );
    }

    const statusClass =
        project.projectState === "Terminado"
            ? 'bg-green-200 text-green-800'
            : project.projectState === 'Aprobado'
                ? 'bg-yellow-200 text-yellow-800'
                : project.projectState === 'En espera de aprobación'
                    ? 'bg-red-200 text-red-800'
                    : 'bg-gray-200 text-gray-800'

    const categoryClass = "bg-blue-200 text-blue-800"

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <p className="text-gray-400 text-sm mb-8 mt-2">{project.date}</p>

            {/* Categoria del artículo */}
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${categoryClass}`}>
                {project.projectCategory}
            </div>

            <h1 className="text-4xl font-bold text-gray-800 mb-6">{project.title}</h1>

            <img
                src={project.imageProject}
                alt={project.title}
                className="w-full h-96 object-cover rounded-lg mb-6"
            />

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contenido</h2>
            <div
                className="text-gray-700 text-lg"
                dangerouslySetInnerHTML={{ __html: project.safeContent }}
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
            {/* Estado del artículo */}
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${statusClass}`}>
                {project.projectState}
            </div>

        </div>
    );
};

export default ProjectDetail;
