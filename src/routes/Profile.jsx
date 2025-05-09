import FormErrors from "../components/FormErrors";
import FormInputProfile from "../components/FormInputProfile";
import React from "react";

import { useFirestore } from "../hooks/useFirestore";
import { ErrorsFirebase } from "../utils/ErrorsFirebase";
import { FormValidate } from "../utils/FormValidate";
import { useForm } from "react-hook-form";
import { useContext, useEffect, Fragment, useRef, useState } from "react";
import { UserContext } from "../context/UserProvider";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationIcon } from "@heroicons/react/outline";
import firebaseApp from "../Firebase";
import ProjectCard from '../components/ProjectCard';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { 
  getFirestore, 
  collection, 
  query, 
  getDocs,
  where,
  limit
} from "firebase/firestore";
import Article from "./Article";
import Project from "./Project";
import { useFirestoreArticles } from "../hooks/useFirestoreArticles";
import { useFirestoreReviews } from "../hooks/useFirestoreReviews";

const storage = getStorage(firebaseApp);
const db = getFirestore(firebaseApp);

const Profile = () => {
  const [open, setOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingError, setLoadingError] = useState(null);
  const [projectsOwned, setProjectsOwned] = useState([]);
  const [projectsMember, setProjectsMember] = useState([]);
  const [loadingState, setLoadingState] = useState({
    profile: true,
    projects: true,
    image: false,
    action: false
  });

  const imgRefProfile = useRef();
  const hvRef = useRef();
  const locationHV = useRef();
  const locationImage = useRef();
  const cancelButtonRef = useRef(null);

  const { deleteUserWithID } = useContext(UserContext);
  const { deleteDataArticle } = useFirestoreArticles();
  const { deleteDataReview } = useFirestoreReviews();
  const { required } = FormValidate();
  const { getData, updateData, deleteData } = useFirestore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoadingState(prev => ({...prev, profile: true}));
        const data = await getData();
        if (data && data.length > 0) {
          setProfileData(data[0]);
          imgRefProfile.current = data[0].profileImage;
          await loadProjects(data[0].userUID);
        } else {
          setLoadingError("No se encontraron datos del perfil");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setLoadingError("Error al cargar el perfil");
      } finally {
        setLoadingState(prev => ({...prev, profile: false}));
      }
    };

    const loadProjects = async (userUID) => {
      if (!userUID) return;
      
      try {
        setLoadingState(prev => ({...prev, projects: true}));
        
        // Consulta 1: Proyectos donde es el creador (no necesita índice especial)
        const ownedQuery = query(
          collection(db, "projects"),
          where("createdBy", "==", userUID),
          limit(10)
        );
        
        // Consulta 2: Todos los proyectos (para buscar membresías)
        const allProjectsQuery = query(
          collection(db, "projects"),
          limit(50) // Limitar a una cantidad razonable
        );
    
        const [ownedSnapshot, allProjectsSnapshot] = await Promise.all([
          getDocs(ownedQuery),
          getDocs(allProjectsQuery)
        ]);
    
        setProjectsOwned(ownedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
        
        // Filtrar membresías en el cliente
        setProjectsMember(allProjectsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(project => 
            project.members?.includes(userUID) && 
            project.createdBy !== userUID
          ));
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setLoadingState(prev => ({...prev, projects: false}));
      }
    };

    loadProfileData();
  }, []);

  const onSubmit = async (dataUp) => {
    try {
      setLoadingState(prev => ({...prev, action: true}));
      const dataNew = {
        ...profileData,
        ...dataUp,
      };
      await updateData(dataNew);
      setProfileData(dataNew);
      alert("Datos actualizados");
    } catch (error) {
      console.log(error.code);
      const { code, message } = ErrorsFirebase(error.code);
      setError(code, { message });
    } finally {
      setLoadingState(prev => ({...prev, action: false, image: false}));
    }
  };

  const handleClickDelete = async (userData) => {
    try {
      setLoadingState(prev => ({...prev, action: true}));
      await deleteData(userData.id);
      
      // Eliminar imagen si existe
      if (userData.locationImage) {
        await deleteObject(ref(storage, userData.locationImage))
          .catch(error => console.error("Error deleting image:", error));
      }

      // Eliminar CV si existe
      if (userData.locationCurriculum) {
        await deleteObject(ref(storage, userData.locationCurriculum))
          .catch(error => console.error("Error deleting CV:", error));
      }

      await Promise.all([
        deleteDataArticle(userData.id),
        deleteDataReview(userData.id),
        deleteUserWithID()
      ]);

      window.location.href = "/";
    } catch (error) {
      console.log(error.code);
      const { code, message } = ErrorsFirebase(error.code);
      setError(code, { message });
    } finally {
      setLoadingState(prev => ({...prev, action: false}));
    }
  };

  const fileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida (jpg, png, etc).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen debe pesar menos de 2MB.");
      return;
    }

    try {
      setLoadingState(prev => ({...prev, image: true}));

      // Eliminar imagen anterior si existe
      if (profileData?.locationImage) {
        await deleteObject(ref(storage, profileData.locationImage))
          .catch(error => console.error(error));
      }

      const name_file = `${profileData.name.replace(/\s/g, "")}${profileData.userUID.replace(/\s/g, "")}`;
      const storageRef = ref(storage, `profile_images/${name_file}`);
      locationImage.current = `profile_images/${name_file}`;
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      imgRefProfile.current = url;

      const dataNew = {
        ...profileData,
        profileImage: url,
        locationImage: locationImage.current,
      };

      await onSubmit(dataNew);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error al subir la imagen");
    }
  };

  const hvHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Por favor sube un archivo PDF.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo PDF debe pesar menos de 5MB.");
      return;
    }

    try {
      setLoadingState(prev => ({...prev, image: true}));

      if (profileData?.locationCurriculum) {
        await deleteObject(ref(storage, profileData.locationCurriculum))
          .catch(error => console.error(error));
      }

      const name_file = `${profileData.name.replace(/\s/g, "")}${profileData.userUID.replace(/\s/g, "")}_CV`;
      const storageRef = ref(storage, `curriculums_users/${name_file}`);
      locationHV.current = `curriculums_users/${name_file}`;
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      hvRef.current = url;

      const dataNew = {
        ...profileData,
        curriculumPDF: url,
        locationCurriculum: locationHV.current,
      };

      await onSubmit(dataNew);
    } catch (error) {
      console.error("Error uploading PDF:", error);
      alert("Error al subir el PDF");
    }
  };

  const deleteResume = async () => {
    if (!profileData?.locationCurriculum) return;

    try {
      setLoadingState(prev => ({...prev, action: true}));
      await deleteObject(ref(storage, profileData.locationCurriculum));

      const dataNew = {
        ...profileData,
        curriculumPDF: null,
        locationCurriculum: null
      };

      await onSubmit(dataNew);
      alert("Hoja de vida eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar hoja de vida:", error);
      alert("Error al eliminar hoja de vida");
    } finally {
      setLoadingState(prev => ({...prev, action: false}));
    }
  };

  if (loadingState.profile && !profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">{loadingError}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500 mb-4">No se encontraron datos del perfil</div>
      </div>
    );
  }

  return (
    <>
      <FormErrors error={errors.errorIntern} />
      <div className="p-6 my-24 w-9/12 ml-auto mr-auto bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
        <div className="grid gap-6 mb-3 lg:grid-cols-4">
          <label className="col-end-5 text-lg font-semibold text-slate-500 text-right rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500">
            Rol: {profileData.role === "admin" ? "Administrador" : profileData.role === "user" ? "Usuario" : "Integrante"}
            <br />
            Estado Académico: {profileData.academicStatus}
          </label>
        </div>

        {/* Profile Image */}
        <div className="profile-image flex justify-center items-center my-0 mx-auto">
          <figure className="relative w-40 h-40 rounded-full border-2 border-solid border-gray-300 z-0">
            <label htmlFor="file-input-profile" className="cursor-pointer w-full h-full flex justify-center">
              {loadingState.image ? (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : (
                <img
                  id="image-profile"
                  className="w-full h-full rounded-full transition-all duration-300 ease-out object-cover object-center"
                  src={imgRefProfile.current || profileData.profileImage}
                  alt="profile"
                  loading="lazy"
                  decoding="async"
                />
              )}

              <div className="profile-image-edit absolute top-0 left-0 w-full h-full flex flex-col justify-end opacity-0 invisible text-center rounded-full text-xl text-white transition-all duration-300 ease-out hover:opacity-100 hover:visible">
                <span>Subir foto</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mb-2.5 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </label>

            <input
              className="hidden"
              id="file-input-profile"
              name="image"
              type="file"
              accept="image/*"
              onChange={fileHandler}
              disabled={loadingState.image}
            />
          </figure>
        </div>

        {/* Resume Section */}
        <div className="my-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Hoja de Vida (PDF)</h3>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {profileData?.curriculumPDF ? (
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">Documento subido</span>
                </div>

                <div className="flex gap-2">
                  <a
                    href={profileData.curriculumPDF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Ver PDF
                  </a>
                  <button
                    onClick={deleteResume}
                    disabled={loadingState.action}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {loadingState.action ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                No hay documento subido
              </div>
            )}

            <label className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loadingState.image ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {profileData?.curriculumPDF ? "Cambiar PDF" : "Subir PDF"}
              <input
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={hvHandler}
                disabled={loadingState.image}
              />
            </label>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 my-6 lg:grid-cols-2">
            <FormInputProfile
              type="text"
              placeholder={profileData.name}
              label="Nombres"
              htmlFor="name"
              name="name"
              error={errors.name}
              {...register("name", { required })}
            >
              <FormErrors error={errors.name} />
            </FormInputProfile>

            <FormInputProfile
              type="text"
              placeholder={profileData.lastName}
              label="Apellidos"
              htmlFor="lastName"
              name="lastName"
              error={errors.lastName}
              {...register("lastName", { required })}
            >
              <FormErrors error={errors.lastName} />
            </FormInputProfile>

            <FormInputProfile
              type="tel"
              placeholder={profileData.phone}
              label="Teléfono"
              htmlFor="phone"
              name="phone"
              error={errors.phone}
              {...register("phone", { required })}
            >
              <FormErrors error={errors.phone} />
            </FormInputProfile>

            <div className="mb-6">
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                Correo
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={profileData.email}
                defaultValue={profileData.email}
                readOnly
                {...register("email")}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingState.action}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${loadingState.action ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loadingState.action ? 'Actualizando...' : 'Actualizar Información'}
          </button>
          
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={loadingState.action}
            className={`mt-4 group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 ${loadingState.action ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Eliminar cuenta
          </button>
        </form>

        {/* Delete Account Dialog */}
        <Transition.Root show={open} as={Fragment}>
          <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                          <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                          <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                            Desactivar cuenta
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Estás a punto de eliminar tu cuenta, está acción es irreversible.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => handleClickDelete(profileData)}
                        disabled={loadingState.action}
                      >
                        {loadingState.action ? 'Eliminando...' : 'Eliminar cuenta'}
                      </button>
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => setOpen(false)}
                        ref={cancelButtonRef}
                        disabled={loadingState.action}
                      >
                        Cancelar
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </div>

      <div className="p-6 my-6 w-9/12 mx-auto bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
        {loadingState.projects ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <>         
          <h1 className="text-amber-500 font-bold text-3xl text-center my-6">Mis Articulos</h1>   
            <Article idPerson={profileData.userUID} />

            <h1 className="text-amber-500 font-bold text-3xl text-center my-6">Mis Proyectos</h1>       
            <Project idPerson={profileData.userUID} />
          </>
        )}
      </div>
      
      <div className="p-6 my-6 w-9/12 mx-auto bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
        {loadingState.projects ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <>            
           {/* Member Projects */}
            <div>
              <h1 className="text-amber-500 font-bold text-3xl text-center my-6">Proyectos en los que participo</h1>
              {projectsMember.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">         
                   {projectsMember.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}    
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No hay proyectos</h3>
                  <p className="mt-1 text-gray-500">No participas en ningún proyecto actualmente.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Profile;
