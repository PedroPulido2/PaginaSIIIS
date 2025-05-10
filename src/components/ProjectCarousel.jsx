import React, {useEffect, useState} from "react";
import {useFirestoreProjects} from "../hooks/useFirestoreProjects";
import {useFirestore} from "../hooks/useFirestore";
import {Swiper, SwiperSlide} from "swiper/react";
import {Pagination, Autoplay} from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import {useNavigate} from 'react-router-dom';

const ProjectCarousel = () => {
    const {getDataProjects, loadingProject} = useFirestoreProjects();
    const {getDataUsers, loading} = useFirestore();
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const projectsData = await getDataProjects();
            const usersData = await getDataUsers();
            setProjects(projectsData);
            setUsers(usersData);
        };
        fetchData();
    }, []);

    if (loadingProject.getDataProjects || loading.getDataUsers) {
        return (
            <div className="text-center text-gray-500 text-xl font-bold h-screen flex items-center justify-center">
                Cargando proyectos...
            </div>
        );
    }

    const getUserById = (userUID) => users.find(u => u.userUID === userUID);

    const handleViewProject = (id) => {
        navigate(`/Project/${id}`);
    };

    const handleViewAllProjects = () => {
        navigate('/Project');
    };

    return (
        <div className="py-10" style={{backgroundColor: "#FFF9E8"}}>
            <h2 className="text-3xl font-bold text-center mb-8" style={{color: "#805325"}}>Proyectos</h2>

            {/* Contenedor general */}
            <div className="relative max-w-7xl mx-auto px-4">

                {/* Carrusel */}
                <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    pagination={{clickable: true}}
                    autoplay={{delay: 5000}}
                    breakpoints={{
                        640: {slidesPerView: 1},
                        768: {slidesPerView: 2},
                        1024: {slidesPerView: 3},
                    }}
                >
                    {projects.map((project) => {
                        const user = getUserById(project.userUID);
                        return (
                            <SwiperSlide key={project.id} className="overflow-hidden">
                                <div className="group relative rounded-lg border bg-white shadow-md">
                                    <div className="relative w-full h-60 bg-white rounded-t-lg overflow-hidden">
                                        <img
                                            src={project.imageProject}
                                            alt={project.title}
                                            className="w-full h-full object-center object-cover"
                                        />
                                    </div>
                                    <div className="rounded-b-lg p-4">
                                        <div className="mb-2">
                                            <span
                                                className="inline-block px-3 py-1 rounded-full bg-blue-200 text-blue-800 text-xs font-semibold">
                                                {project.projectCategory}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800">{project.title}</h3>
                                        <p className="text-sm text-gray-600">{project.description}</p>
                                        <div className="flex items-center mt-2 space-x-4">
                                            <img
                                                className="w-10 h-10 border rounded-full"
                                                src={user?.profileImage}
                                                alt={user?.name}
                                            />
                                            <div>
                                                <div>{user ? `${user.name} ${user.lastName}` : "Autor desconocido"}</div>
                                                <div className="text-xs text-gray-400">{project.date}</div>
                                            </div>
                                        </div>
                                        <div className="mt-2">
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

                                        <div className="mt-4 text-center">
                                            <button
                                                onClick={() => handleViewProject(project.id)}
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
                    onClick={handleViewAllProjects}
                    className="px-8 py-3 font-semibold rounded-lg transition"
                    style={{
                        backgroundColor: "#9B6A2F",
                        color: "#ffffff",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#805325")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#9B6A2F")}
                >
                    Ver más proyectos
                </button>
            </div>
        </div>
    );
};

export default ProjectCarousel;
