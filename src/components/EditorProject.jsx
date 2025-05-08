import React from "react";
import { useEffect, useContext, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useFirestoreProjects } from "../hooks/useFirestoreProjects";
import FormErrors from "./FormErrors";
import FormInputEditor from "./FormInputEditor";
import { FormValidate } from "../utils/FormValidate";
import { useForm } from "react-hook-form";
import firebaseApp from "../Firebase";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { UserContext } from "../context/UserProvider";
import {
    getFirestore,
    addDoc,
    collection,
    doc,
    getDocs,
    query,
    updateDoc,
    where,
    arrayUnion,
    arrayRemove,
} from "firebase/firestore";

const storage = getStorage(firebaseApp);
const db = getFirestore(firebaseApp);

// Función para obtener datos completos del usuario
const getFullUserData = async (userUID) => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("userUID", "==", userUID));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        
        const userData = querySnapshot.docs[0].data();
        return {
            id: querySnapshot.docs[0].id,
            ...userData,
            fullName: `${userData.name} ${userData.lastName}`.trim()
        };
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
};

// Función para actualizar los proyectos del usuario
const updateUserProjects = async (userId, projectId, action = 'add') => {
    try {
        const userRef = doc(db, "users", userId);
        if (action === 'add') {
            await updateDoc(userRef, {
                projects: arrayUnion(projectId)
            });
        } else {
            await updateDoc(userRef, {
                projects: arrayRemove(projectId)
            });
        }
    } catch (error) {
        console.error(`Error ${action === 'add' ? 'adding' : 'removing'} project from user:`, error);
    }
};

const EditorTiny = ({ dataProject1: dataProject1, functionEdit }) => {
    const { user } = useContext(UserContext);
    const [user1, setUser1] = useState(null);
    const [canEdit, setCanEdit] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [projectMembers, setProjectMembers] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [projectOwner, setProjectOwner] = useState(null);

    const editorRef = useRef(null);
    const [loadingImage, setLoadingImage] = useState(false);
    const imgRef = useRef();
    const locationImage = useRef();
    const [stateReadOnly, setStateReadOnly] = useState(true);
    const [stateReadOnlyDate, setStateReadOnlyDate] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        const loadInitialData = async () => {
            // Cargar dueño del proyecto
            if (dataProject1.userUID) {
                const owner = await getFullUserData(dataProject1.userUID);
                setProjectOwner(owner);
            }

            // Cargar miembros del proyecto
            if (dataProject1.members && dataProject1.members.length > 0) {
                const membersData = await Promise.all(
                    dataProject1.members.map(memberId => getFullUserData(memberId))
                );
                setProjectMembers(membersData.filter(m => m !== null));
            }

            // Cargar datos del usuario actual
            if (user?.uid) {
                const currentUser = await getFullUserData(user.uid);
                setUser1(currentUser);
            }
        };

        loadInitialData();
    }, [user, dataProject1]);

    // Determinar permisos
    useEffect(() => {
        if (!user) {
            setCanEdit(false);
            setStateReadOnly(true);
            setStateReadOnlyDate(true);
            return;
        }
    
        // Para creación de nuevos proyectos (functionEdit !== "update")
        if (functionEdit !== "update") {
            setCanEdit(true);
            setStateReadOnly(false);
            setStateReadOnlyDate(false);
            return;
        }
    
        // Para edición de proyectos existentes
        const isOwner = dataProject1.userUID === user.uid;
        const isAdmin = user1?.role === "admin";
        const hasEditPermission = isOwner || isAdmin;
    
        setCanEdit(hasEditPermission);
        setStateReadOnly(!hasEditPermission);
        setStateReadOnlyDate(true); // La fecha no se puede editar en actualización
    }, [user, user1, dataProject1.userUID, functionEdit]);

    // Inicializar referencias de imagen
    useEffect(() => {
        if (functionEdit === "update" && dataProject1.imageProject && dataProject1.locationImage) {
            imgRef.current = dataProject1.imageProject;
            locationImage.current = dataProject1.locationImage;
        } else {
            locationImage.current = "images_projects/SinImagen.jpg";
            imgRef.current = "https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/images_projects%2FsinImagen.png?alt=media&token=b7f1da2e-ee80-406f-b26a-47f3a493dcd2";
        }
    }, [functionEdit, dataProject1]);

    const searchUsers = async (term) => {
        if (!term.trim()) {
            setSearchResults([]);
            return;
        }
        
        setLoadingSearch(true);
        try {
            const usersRef = collection(db, "users");
            const querySnapshot = await getDocs(usersRef);
            
            const results = querySnapshot.docs
                .map(doc => {
                    const userData = doc.data();
                    return {
                        id: doc.id,
                        userUID: userData.userUID,
                        ...userData,
                        fullName: `${userData.name} ${userData.lastName}`.trim()
                    };
                })
                .filter(userResult => {
                    // No excluir al usuario actual si es admin (puede necesitar añadirse a proyectos)
                    if (userResult.userUID === user?.uid && user1?.role !== "admin") {
                        return false;
                    }
                                        
                    // Excluir miembros ya agregados
                    if (projectMembers.some(m => m.userUID === userResult.userUID)) {
                        return false;
                    }
                    
                    // Excluir al dueño del proyecto (si estamos editando)
                    if (functionEdit === "update" && dataProject1.userUID === userResult.userUID) {
                        return false;
                    }
                    
                    // Búsqueda case-insensitive
                    const searchLower = term.toLowerCase();
                    const nameMatch = userResult.fullName.toLowerCase().includes(searchLower);
                    const emailMatch = userResult.email.toLowerCase().includes(searchLower);
                    
                    return nameMatch || emailMatch;
                });
            
            setSearchResults(results);
        } catch (error) {
            console.error("Error searching users:", error);
        } finally {
            setLoadingSearch(false);
        }
    };

    // Añadir miembro (y actualizar su perfil)
    const addMember = async (userToAdd) => {
        if (!canEdit) return;
        
        try {
            // Agregar a la lista local
            setProjectMembers([...projectMembers, userToAdd]);
            setSearchTerm('');
            setSearchResults([]);
            
            // Si estamos editando un proyecto existente, actualizar en Firestore
            if (functionEdit === "update" && dataProject1.id) {
                await updateUserProjects(userToAdd.userUID, dataProject1.id, 'add');
            }
        } catch (error) {
            console.error("Error adding member:", error);
        }
    };

    // Eliminar miembro (y actualizar su perfil)
    const removeMember = async (userUID) => {
        if (!canEdit) return;
        
        try {
            // Eliminar de la lista local
            setProjectMembers(projectMembers.filter(member => member.userUID !== userUID));
            
            // Si estamos editando un proyecto existente, actualizar en Firestore
            if (functionEdit === "update" && dataProject1.id) {
                await updateUserProjects(userUID, dataProject1.id, 'remove');
            }
        } catch (error) {
            console.error("Error removing member:", error);
        }
    };

    // Configuración del formulario
    const { required } = FormValidate();
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm();

    const {
        updateDataProject,
        addDataProject,
    } = useFirestoreProjects();

    const onSubmit = async (data) => {
        if (!canEdit) return;
        
        data.content = editorRef.current?.getContent() || dataProject1.content;
        const dataNew = {
            ...dataProject1,
            ...data,
            imageProject: imgRef.current,
            userUID: functionEdit === "update" ? dataProject1.userUID : user.uid,
            locationImage: locationImage.current,
            members: projectMembers.map(m => m.userUID), // Guardamos solo los UIDs
            userName: projectOwner?.fullName || user1?.fullName // Guardar nombre del dueño
        };
        
        try {
            let projectId;
            if (functionEdit === "update") {
                await updateDataProject(dataNew);
                projectId = dataProject1.id;
            } else {
                const docRef = await addDataProject(dataNew);
                projectId = docRef.id;
                
                // Actualizar el proyecto en el perfil del dueño
                if (user?.uid) {
                    await updateUserProjects(user.uid, projectId, 'add');
                }
            }
            
            // Actualizar proyectos en los perfiles de los miembros
            if (projectMembers.length > 0) {
                await Promise.all(
                    projectMembers.map(member => 
                        updateUserProjects(member.userUID, projectId, 'add')
                    )
                );
            }
            
            window.location.href = "/Project";
        } catch (error) {
            console.log(error.code);
            const { code, message } = ErrorsFirebase(error.code);
            setError(code, { message });
        }
    };

    const fileHandler = async (e) => {
        if (!canEdit) return;
        
        try {
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

            if (locationImage.current && locationImage.current !== "images_projects/SinImagen.jpg") {
                try {
                    const oldImageRef = ref(storage, locationImage.current);
                    await deleteObject(oldImageRef);
                } catch (error) {
                    console.warn("No se pudo eliminar imagen anterior:", error);
                }
            }

            setLoadingImage(true);
            const name_file = `${Date.now()}_${file.name.replace(/\s+/g, "")}`;
            const storageRef = ref(storage, `images_projects/${name_file}`);

            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            imgRef.current = url;
            locationImage.current = `images_projects/${name_file}`;

            const img = document.getElementById("imageProject");
            if (img) img.src = url;

        } catch (error) {
            console.error("Error al subir la imagen:", error);
            alert("Error al subir la imagen. Por favor intenta de nuevo.");
        } finally {
            setLoadingImage(false);
        }
    };

    const useDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isSmallScreen = window.matchMedia("(max-width: 1023.5px)").matches;

    return (
        <>
            {/* Sección de imagen del proyecto */}
            <div className="profile-image flex justify-center items-center my-0 mx-auto">
                <figure className="relative w-40 h-40 rounded-full border-2 border-solid border-gray-300 z-0">
                    <label
                        htmlFor="file-input"
                        className="cursor-pointer w-full h-full flex justify-center"
                    >
                        {loadingImage ? (
                            <label className="text-center font-bold h-screen">
                                <svg
                                    className="animate-spin"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 01 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            </label>
                        ) : (
                            <img
                                id="imageProject"
                                className="w-full h-full rounded-full transition-all duration-300 ease-out object-cover object-center"
                                src={imgRef.current}
                                alt="profile"
                                loading="lazy"
                                decoding="async"
                            />
                        )}

                        {canEdit && (
                            <div className="profile-image-edit absolute top-0 left-0 w-full h-full flex flex-col justify-end opacity-0 invisible text-center rounded-full text-xl text-white transition-all duration-300 ease-out hover:opacity-100 hover:visible">
                                <span>Subir imagen</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 mb-2.5"
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
                        )}
                    </label>

                    <input
                        className="hidden"
                        id="file-input"
                        name="image"
                        type={canEdit ? "file" : ""}
                        accept="image/*"
                        onChange={fileHandler}
                        disabled={!canEdit}
                    />
                </figure>
            </div>

            {/* Formulario del proyecto */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-6 my-6 lg:grid-cols-2">
                    <FormInputEditor
                        type="text"
                        value={dataProject1.title}
                        label="Título"
                        htmlFor="title"
                        name="title"
                        readOnly={!canEdit}
                        error={errors.title}
                        {...register("title", { required })}
                    >
                        <FormErrors error={errors.name} />
                    </FormInputEditor>
                    <FormInputEditor
                        type="date"
                        value={dataProject1.date}
                        label="Fecha"
                        htmlFor="date"
                        name="date"
                        readOnly={functionEdit === "update" || !canEdit}
                        error={errors.date}
                        {...register("date", { required })}
                    >
                        <FormErrors error={errors.name} />
                    </FormInputEditor>
                </div>

                <div className="mb-4">
                    <label htmlFor="projectCategory" className="block mb-1">Categoría</label>
                    <select
                        id="projectCategory"
                        {...register("projectCategory", { required })}
                        defaultValue={dataProject1.projectCategory}
                        disabled={!canEdit}
                        className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-amber-400 focus:border-amber-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-400 dark:focus:border-amber-400"
                    >
                        <option value="">Seleccione una categoría</option>
                        <option value="Software">Software</option>
                        <option value="Telecomunicaciones">Telecomunicaciones</option>
                        <option value="Inteligencia Artificial">Inteligencia Artificial</option>
                        <option value="Otra">Otra</option>
                    </select>
                    <FormErrors error={errors.projectCategory} />
                </div>

                <div className="mb-4">
                    <label htmlFor="projectState" className="block mb-1">Estado</label>
                    <select
                        id="projectState"
                        {...register("projectState", { required })}
                        defaultValue={dataProject1.projectState}
                        disabled={!canEdit}
                        className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-amber-400 focus:border-amber-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-400 dark:focus:border-amber-400"
                    >
                        <option value="">Seleccione un estado</option>
                        <option value="Terminado">Terminado</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="En espera de aprobación">En espera de aprobación</option>
                    </select>
                    <FormErrors error={errors.projectState} />
                </div>

                {/* Sección de integrantes del proyecto */}
                <div className="mb-6">
                    <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-300">
                        Integrantes del proyecto
                    </label>
                    
                    {/* Lista de miembros actuales */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {/* Dueño del proyecto */}
                        {projectOwner && (
                            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
                                <span className="mr-2">{projectOwner.fullName}</span>
                                <span className="text-xs text-gray-500">(Dueño)</span>
                            </div>
                        )}
                        
                        {/* Miembros agregados */}
                        {projectMembers.map(member => (
                            <div key={member.userUID} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
                                <span className="mr-2">{member.fullName}</span>
                                {canEdit && (
                                    <button 
                                        type="button"
                                        onClick={() => removeMember(member.userUID)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {/* Barra de búsqueda (solo para usuarios con permiso) */}
                    {canEdit && (
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    searchUsers(e.target.value);
                                }}
                                placeholder="Buscar por nombre o email..."
                                className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                            
                            {/* Indicador de carga */}
                            {loadingSearch && (
                                <div className="absolute right-3 top-3">
                                    <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            )}
                            
                            {/* Resultados de búsqueda */}
                            {searchResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                                    {searchResults.map(userResult => (
                                        <div 
                                            key={userResult.userUID} 
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                                        >
                                            <div>
                                                <div className="font-medium">{userResult.fullName}</div>
                                                <div className="text-sm text-gray-500">{userResult.email}</div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => addMember(userResult)}
                                                className="ml-2 px-2 py-1 bg-amber-400 hover:bg-amber-500 text-white rounded text-sm"
                                            >
                                                Agregar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid gap-6 my-6">
                    <label htmlFor="description" className="block text-lg font-medium text-gray-900 dark:text-gray-400">
                        Descripción corta
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows="4"
                        readOnly={!canEdit}
                        className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-amber-400 focus:border-amber-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-400 dark:focus:border-amber-400"
                        placeholder="Ejemplo: 'Relata historia de machine learning desde sus inicios hasta la actualidad'"
                        defaultValue={dataProject1.description}
                        {...register("description", { required })}
                    ></textarea>
                </div>

                <label className="block m text-lg font-medium text-gray-900 dark:text-gray-400">
                    Contenido
                </label>

                {/* Editor o visualización según permisos */}
                {canEdit ? (
                    <>
                        <Editor
                            apiKey="xa7jibfvgt9hh2wyjzamlbtt8cq0hjb0niph3zn58qelqrnh"
                            onInit={(evt, editor) => (editorRef.current = editor)}
                            initialValue={dataProject1.content}
                            init={{
                                selector: "textarea#open-source-plugins",
                                plugins: "preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons",
                                editimage_cors_hosts: ["picsum.photos"],
                                menubar: "file edit view insert format tools table help",
                                toolbar: "undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl",
                                toolbar_sticky: true,
                                toolbar_sticky_offset: isSmallScreen ? 102 : 108,
                                autosave_ask_before_unload: true,
                                autosave_interval: "30s",
                                autosave_prefix: "{path}{query}-{id}-",
                                autosave_restore_when_empty: false,
                                autosave_retention: "2m",
                                image_advtab: true,
                                link_list: [
                                    { title: "My page 1", value: "https://www.tiny.cloud" },
                                    { title: "My page 2", value: "http://www.moxiecode.com" },
                                ],
                                image_list: [
                                    { title: "My page 1", value: "https://www.tiny.cloud" },
                                    { title: "My page 2", value: "http://www.moxiecode.com" },
                                ],
                                image_class_list: [
                                    { title: "None", value: "" },
                                    { title: "Some class", value: "class-name" },
                                ],
                                importcss_append: true,
                                file_picker_callback: (callback, value, meta) => {
                                    if (meta.filetype === "file") {
                                        callback("https://www.google.com/logos/google.jpg", {
                                            text: "My text",
                                        });
                                    }
                                    if (meta.filetype === "image") {
                                        callback("https://www.google.com/logos/google.jpg", {
                                            alt: "My alt text",
                                        });
                                    }
                                    if (meta.filetype === "media") {
                                        callback("movie.mp4", {
                                            source2: "alt.ogg",
                                            poster: "https://www.google.com/logos/google.jpg",
                                        });
                                    }
                                },
                                templates: [
                                    {
                                        title: "New Table",
                                        description: "creates a new table",
                                        content: '<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>',
                                    },
                                    {
                                        title: "Starting my story",
                                        description: "A cure for writers block",
                                        content: "Once upon a time...",
                                    },
                                    {
                                        title: "New list with dates",
                                        description: "New List with dates",
                                        content: '<div class="mceTmpl"><span class="cdate">cdate</span><br><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>',
                                    },
                                ],
                                template_cdate_format: "[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]",
                                template_mdate_format: "[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]",
                                height: 600,
                                image_caption: true,
                                quickbars_selection_toolbar: "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
                                noneditable_class: "mceNonEditable",
                                toolbar_mode: "sliding",
                                contextmenu: "link image table",
                                skin: useDarkMode ? "oxide-dark" : "oxide",
                                content_css: useDarkMode ? "dark" : "default",
                                content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
                            }}
                        />
                        <div>
                            <button
                                type="submit"
                                className="group mt-3 relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                            >
                                {functionEdit === "update" ? "Actualizar" : "Agregar"}
                            </button>
                        </div>
                    </>
                ) : (
                    <div
                        className="mt-1"
                        dangerouslySetInnerHTML={{ __html: dataProject1.content }}
                    ></div>
                )}
            </form>
        </>
    );
};

export default EditorTiny;