import React from "react";
import { useContext, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useFirestoreArticles } from "../hooks/useFirestoreArticles";

import FormErrors from "./FormErrors";
import FormInputEditor from "./FormInputEditor";
import { FormValidate } from "../utils/FormValidate";
import { useForm } from "react-hook-form";

import firebaseApp from "../Firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserContext } from "../context/UserProvider";

const storage = getStorage(firebaseApp);

const EditorTiny = ({ dataArticle1, functionEdit }) => {
  const { user } = useContext(UserContext);
  const editorRef = useRef(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const imgRef = useRef();
  const locationImage = useRef();
  const [stateReadOnly, setStateReadOnly] = useState(
    (dataArticle1.userUID === user.uid && functionEdit === "update") ||
      functionEdit != "update"
      ? false
      : true
  );
  locationImage.current = "images_articles/SinImagen.jpg";
  imgRef.current =
    "https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/images_articles%2FsinImagen.png?alt=media&token=df4c7c05-07c0-4812-a2dc-e9ccc01dc054";

  // validate form with react-hook-form
  const { required } = FormValidate();
  const {
    dataArticle,
    loadingArticle,
    getDataArticles,
    getDataArticleUser,
    addDataArticle,
    deleteDataArticle,
    updateDataArticle,
  } = useFirestoreArticles();

  // useForm hook
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  // useState hook
  const onSubmit = async (data) => {
    data.content = editorRef.current.getContent();
    const dataNew = {
      ...dataArticle1,
      ...data,
      imageArticle: imgRef.current,
      userUID: user.uid,
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
      console.log(error.code);
      const { code, message } = ErrorsFirebase(error.code);
      setError(code, { message });
    }
  };

  const fileHandler = async (e) => {
    setLoadingImage(true);
    const file = e.target.files[0];
    const name_file = file.name + user.uid;
    const storageRef = ref(storage, `images_articles/${name_file}`);
    locationImage.current = `images_articles/${name_file}`;
    await uploadBytes(storageRef, file);
    setLoadingImage(false);
    const url = await getDownloadURL(storageRef);
    const img = document.getElementById("imageArticle");
    img.src = url;
    imgRef.current = url;
  };

  const useDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isSmallScreen = window.matchMedia("(max-width: 1023.5px)").matches;

  return (
    <>
      {/* -------------------------------------------start upload image--------------------------------------------------- */}
      <div
        className={
          "profile-image flex justify-center items-center my-0 mx-auto "
        }
      >
        <figure
          className={
            "relative w-40 h-40 rounded-full border-2 border-solid border-gray-300 z-0"
          }
        >
          <label
            htmlFor="file-input"
            className={"cursor-pointer w-full h-full flex justify-center"}
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
                id="imageArticle"
                className={
                  "w-full h-full rounded-full transition-all duration-300 ease-out object-cover object-center"
                }
                src={imgRef.current}
                alt={"profile"}
                loading="lazy"
                decoding="async"
              />
            )}

            <div
              className={
                "profile-image-edit absolute top-0 left-0 w-full h-full flex flex-col justify-end opacity-0 invisible text-center rounded-full text-xl text-white transition-all duration-300 ease-out hover:opacity-100 hover:visible"
              }
            >
              <span>Subir imagen</span>
              {/* <i className="fas fa-camera mb-2.5"></i> */}
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
          </label>

          <input
            className={"hidden"}
            id="file-input"
            name="image"
            type={stateReadOnly ? "" : "file"}
            onChange={fileHandler}
          />
        </figure>
      </div>

      {/* -------------------------------------------End upload image--------------------------------------------------- */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 my-6 lg:grid-cols-2">
          <FormInputEditor
            type="text"
            // placeholder={dataArticle1.title}
            value={dataArticle1.title}
            label="Título"
            htmlFor="title"
            name="title"
            readOnly={stateReadOnly}
            error={errors.title}
            {...register("title", {
              required,
            })}
          >
            <FormErrors error={errors.name} />
          </FormInputEditor>
          <FormInputEditor
            type="date"
            // placeholder={dataArticle1.date}
            value={dataArticle1.date}
            label="Fecha"
            htmlFor="date"
            name="date"
            readOnly={stateReadOnly}
            error={errors.date}
            {...register("date", {
              required,
            })}
          >
            <FormErrors error={errors.name} />
          </FormInputEditor>
        </div>
        <div className="grid gap-6 my-6 ">
          <label
            htmlFor="description"
            className="block text-lg font-medium text-gray-900 dark:text-gray-400"
          >
            Descripción corta
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            readOnly={stateReadOnly}
            className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-amber-400 focus:border-amber-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-400 dark:focus:border-amber-400"
            placeholder="Ejemplo: 'Relata historia de machine learning desde sus inicios hasta la actualidad'"
            defaultValue={dataArticle1.description}
            {...register("description", {
              required,
            })}
          ></textarea>
        </div>

        <label className="block m text-lg font-medium text-gray-900 dark:text-gray-400">
          Contenido
        </label>

        {/* -------------EDITOR----------------------------------------------------------------------------------------- */}
        {dataArticle1.userUID === user.uid || functionEdit != "update" ? (
          <>
            <Editor
              apiKey="xa7jibfvgt9hh2wyjzamlbtt8cq0hjb0niph3zn58qelqrnh"
              onInit={(evt, editor) => (editorRef.current = editor)}
              initialValue={dataArticle1.content}
              init={{
                selector: "textarea#open-source-plugins",
                plugins:
                  "preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons",
                editimage_cors_hosts: ["picsum.photos"],
                menubar: "file edit view insert format tools table help",
                toolbar:
                  "undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl",
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
                  /* Provide file and text for the link dialog */
                  if (meta.filetype === "file") {
                    callback("https://www.google.com/logos/google.jpg", {
                      text: "My text",
                    });
                  }

                  /* Provide image and alt text for the image dialog */
                  if (meta.filetype === "image") {
                    callback("https://www.google.com/logos/google.jpg", {
                      alt: "My alt text",
                    });
                  }

                  /* Provide alternative source and posted for the media dialog */
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
                    content:
                      '<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>',
                  },
                  {
                    title: "Starting my story",
                    description: "A cure for writers block",
                    content: "Once upon a time...",
                  },
                  {
                    title: "New list with dates",
                    description: "New List with dates",
                    content:
                      '<div class="mceTmpl"><span class="cdate">cdate</span><br><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>',
                  },
                ],
                template_cdate_format:
                  "[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]",
                template_mdate_format:
                  "[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]",
                height: 600,
                image_caption: true,
                quickbars_selection_toolbar:
                  "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
                noneditable_class: "mceNonEditable",
                toolbar_mode: "sliding",
                contextmenu: "link image table",
                skin: useDarkMode ? "oxide-dark" : "oxide",
                content_css: useDarkMode ? "dark" : "default",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
              }}
            />
            <div>
              <button
                type="submit"
                className="group mt-3 relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Agregar
              </button>
            </div>
          </>
        ) : (
          <>
            {/* convert html */}
            <div
              className="mt-1"
              dangerouslySetInnerHTML={{ __html: dataArticle1.content }}
            ></div>
          </>
        )}
      </form>
    </>
  );
};

export default EditorTiny;
