import React from "react";
import { useEffect, useContext, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useFirestoreArticles } from "../hooks/useFirestoreArticles";

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
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

const storage = getStorage(firebaseApp);

const getDataUserId = async (userUID) => {
  try {
    const db = getFirestore(firebaseApp);
    const dataRef = collection(db, "users");
    const filterQuery = query(dataRef, where("userUID", "==", userUID));
    const querySnapshot = await getDocs(filterQuery);
    const dataDb = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return dataDb;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

const EditorTiny = ({ dataProject1: dataProject1, functionEdit }) => {

  const { user } = useContext(UserContext);
  const [user1, setUser1] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  
  const editorRef = useRef(null);
  const imgRef = useRef(defaultImage);
  const locationImage = useRef("images_articles/SinImagen.jpg");

  useEffect(() => {
    if (!user || !user1) return;
  
    const canEdit =
      (dataProject1.userUID === user.uid || (user1 && user1.role === "admin") || functionEdit !== "update");
  
    setStateReadOnly(!canEdit);

    // 🔥 Si está en modo actualización, la fecha NO se puede editar
    if (functionEdit === "update") {
      setStateReadOnlyDate(true);
    } else {
      setStateReadOnlyDate(false);
    }
  

  }, [user, user1, functionEdit, dataProject1.userUID]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getDataUserId(user.uid);
        if (data.length > 0) {
          setUser1(data[0]);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
  
    if (user?.uid) {
      fetchUser();
    }
  }, [user]);

  // Form handling
  const { required } = FormValidate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const onSubmit = async (data) => {
    data.content = editorRef.current.getContent();
    const dataNew = {
      ...dataProject1,
      ...data,
      imageArticle: imgRef.current,
      userUID: functionEdit === "update" ? dataProject1.userUID : user.uid,
      locationImage: locationImage.current,
    };
    try {
      if (functionEdit == "update") {
        await updateDataArticle(dataNew);
      } else {
        await addDataArticle(dataNew);
      }
      
      window.location.href = "/Article";
    } catch (error) {
      console.error("Submission error:", error);
      setError("firebase", { 
        message: "Error al guardar el artículo. Inténtalo de nuevo." 
      });
    }
  };

  const fileHandler = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) {
        alert("No seleccionaste ningún archivo.");
        return;
      }

      // Validar tipo y tamaño de imagen
      if (!file.type.startsWith("image/")) {
        throw new Error("Por favor selecciona una imagen válida (jpg, png, etc).");
      }

      if (file.size > 2 * 1024 * 1024) {
        throw new Error("La imagen debe pesar menos de 2MB.");
      }

      // Eliminar imagen anterior si existía
      if (locationImage.current && locationImage.current !== "images_articles/SinImagen.jpg") {
        try {
          const oldImageRef = ref(storage, locationImage.current);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.warn("No se pudo eliminar imagen anterior:", error);
        }
      }

      setLoadingImage(true);

      const name_file = `${Date.now()}_${file.name.replace(/\s+/g, "")}`;
      const storageRef = ref(storage, `images_articles/${name_file}`);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // Actualizar referencias
      imgRef.current = url;
      locationImage.current = `images_articles/${name_file}`;

      // Mostrar imagen de inmediato
      const imgElement = document.getElementById("imageArticle");
      if (imgElement) imgElement.src = url;

    } catch (error) {
      console.error("Error al subir la imagen:", error);
      alert(error.message);
    } finally {
      setLoadingImage(false);
    }
  };

  return (
    <>
      {/* Sección de carga de imagen */}
      <div className="profile-image flex justify-center items-center my-0 mx-auto">
        <figure className="relative w-40 h-40 rounded-full border-2 border-solid border-gray-300 z-0">
          <label htmlFor="file-input" className="cursor-pointer w-full h-full flex justify-center">
            {loadingImage ? (
              <div className="flex items-center justify-center h-full">
                <svg className="animate-spin h-8 w-8 text-amber-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              </div>
            ) : (
              <img
                id="imageArticle"
                className="w-full h-full rounded-full transition-all duration-300 ease-out object-cover object-center"
                src={imgRef.current}
                alt="Imagen del artículo"
                loading="lazy"
              />
            )}

            {!stateReadOnly && (
              <div className="profile-image-edit absolute top-0 left-0 w-full h-full flex flex-col justify-end opacity-0 invisible text-center rounded-full text-xl text-white transition-all duration-300 ease-out hover:opacity-100 hover:visible bg-black bg-opacity-40">
                <span>Cambiar imagen</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2.5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}
          </label>

          {!stateReadOnly && (
            <input
              className="hidden"
              id="file-input"
              name="image"
              type="file"
              accept="image/*"
              onChange={fileHandler}
            />
          )}
        </figure>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 my-6 lg:grid-cols-2">
          <FormInputEditor
            type="text"
            // placeholder={dataArticle1.title}
            value={dataProject1.title}
            label="Título"
            htmlFor="title"
            name="title"
            readOnly={stateReadOnly}
            error={errors.title}
            {...register("title", { required })}
          >
            <FormErrors error={errors.title} />
          </FormInputEditor>

          <FormInputEditor
            type="date"
            // placeholder={dataArticle1.date}
            value={dataProject1.date}
            label="Fecha"
            htmlFor="date"
            name="date"
            readOnly={stateReadOnlyDate}
            error={errors.date}
            {...register("date", { required })}
          >
            <FormErrors error={errors.date} />
          </FormInputEditor>
        </div>

        <div>
          <label htmlFor="articleState" className="block text-lg font-medium text-gray-900 dark:text-gray-400">
            Estado del artículo
          </label>
          <select
            id="articleState"
            name="articleState"
            disabled={stateReadOnly || (!user1?.role === "admin" && dataArticle1.userUID !== user?.uid)}
            className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-amber-400 focus:border-amber-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-400 dark:focus:border-amber-400"
            defaultValue={dataArticle1.articleState || "En curso"}
            {...register("articleState")}
          >
            <option value="En curso">En curso</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </div>
        <div className="grid gap-6 my-6">
          <label htmlFor="description" className="block text-lg font-medium text-gray-900 dark:text-gray-400">
            Descripción corta
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            readOnly={stateReadOnly}
            className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-amber-400 focus:border-amber-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-400 dark:focus:border-amber-400"
            placeholder="Ejemplo: 'Relata historia de machine learning desde sus inicios hasta la actualidad'"
            defaultValue={dataProject1.description}
            {...register("description", {
              required,
            })}
          ></textarea>
        </div>

        <label className="block m text-lg font-medium text-gray-900 dark:text-gray-400">
          Contenido
        </label>

        {/* -------------EDITOR----------------------------------------------------------------------------------------- */}
        {dataProject1.userUID === user.uid || (user1 && user1.role === "admin") || functionEdit !== "update" ? (
          <>
            <Editor
              apiKey="xa7jibfvgt9hh2wyjzamlbtt8cq0hjb0niph3zn58qelqrnh"
              onInit={(evt, editor) => (editorRef.current = editor)}
              initialValue={dataProject1.content}
              init={{
                plugins: [
                  'preview', 'importcss', 'searchreplace', 'autolink', 'autosave', 'save', 'directionality', 'code',
                  'visualblocks', 'visualchars', 'fullscreen', 'image', 'link', 'media', 'codesample', 'table',
                  'charmap', 'pagebreak', 'nonbreaking', 'anchor', 'insertdatetime', 'advlist', 'lists', 'wordcount',
                  'help', 'charmap', 'quickbars', 'emoticons'
                ].join(' '),
                toolbar: [
                  'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify',
                  'outdent indent | numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons',
                  'fullscreen preview save print | insertfile image media link anchor codesample | ltr rtl'
                ].join(' | '),
                toolbar_sticky: true,
                toolbar_sticky_offset: isSmallScreen ? 102 : 108,
                autosave_ask_before_unload: true,
                autosave_interval: '30s',
                autosave_retention: '2m',
                image_advtab: true,
                height: 600,
                image_caption: true,
                quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
                skin: useDarkMode ? 'oxide-dark' : 'oxide',
                content_css: useDarkMode ? 'dark' : 'default',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
              }}
            />
            <div className="mt-6">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                disabled={loadingImage}
              >
                {functionEdit === "update" ? "Actualizar artículo" : "Publicar artículo"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* convert html */}
            <div
              className="mt-1"
              dangerouslySetInnerHTML={{ __html: dataProject1.content }}
            ></div>
          </>
        )}
      </form>
    </>
  );
};

export default EditorTiny;
