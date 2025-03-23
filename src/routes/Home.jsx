import React from "react";
import { useState, useEffect } from "react";
import { Carousel } from "flowbite-react";
import firebaseApp from "../Firebase";
import { getStorage, ref, listAll, getDownloadURL, deleteObject, uploadBytes } from "firebase/storage";
import Mision_Vision from "../components/Mision_Vision";
import Contact_Us from "../components/ContactUs";
import Reviews from "../components/Reviews";
import { useFirestore } from "../hooks/useFirestore";
const storage = getStorage(firebaseApp);

// page principale
const Home = () => {
  const [images, setImages] = useState([]);
  // traer el usuario logueado
  const { loading, getData } = useFirestore();
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await getData();
      setData(data);
    };
    const getImages = async () => {
      try {
        const imagesRef = ref(storage, "images_slider");
        const querySnapshot = await listAll(imagesRef);
        const items = querySnapshot.items;
        const images = await Promise.all(
          items.map(async (item) => {
            const url = await getDownloadURL(item);
            const name = item.name;
            return { url, name };
          })
        );
        setImages(images);
      } catch (error) {
        console.log(error);
      }
    };
    loadData();
    getImages();
  }, []);

  
  if (loading.getData || loading.getData === undefined) {
    return (
      <div className="text-center text-gray-500 text-xl font-bold h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <div className={"mt-14 bg-white"}>
      <div className="border rounded p-6 h-56 sm:h-64 xl:h-80 2xl:h-96">
      {data && data.length !== 0 && data[0].role === "admin" && (
            <div className="flex justify-center items-center z-20 absolute">
              <label
                htmlFor="file"
                className="flex flex-col items-center px-4 py-2 bg-white text-blue-600 rounded-lg shadow-lg tracking-wide uppercase border border-blue-600 cursor-pointer hover:bg-blue-600 hover:text-white"
              >
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 100-20 10 10 0 000 20z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="mt-2 text-base leading-normal">
                  Seleccionar una imagen
                </span>
                <input
                  type="file"
                  id="file"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    const storageRef = ref(storage, `images_slider/${file.name}`);
                    await uploadBytes(storageRef, file);
                    alert("Imagen subida con exito");
                    const imagesRef = ref(storage, "images_slider");
                    const querySnapshot = await listAll(imagesRef);
                    const items = querySnapshot.items;
                    const images = await Promise.all(
                      items.map(async (item) => {
                        const url = await getDownloadURL(item);
                        const name = item.name;
                        return { url, name };
                      })
                    );
                    setImages(images);
                  }}
                />
              </label>
            </div>
          )}
        <Carousel
          indicators={false}
          slideInterval={5000}
          leftControl={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          }
          rightControl={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          }
        >

          
          {images.map((image, index) => (
            <div key={index} className="w-full h-full">
              {data && data[0].role === "admin" && (
                <div className="flex justify-end z-0">
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full z-30 absolute"
                    onClick={() => {
                      const imageRef = ref(storage, `images_slider/${image.name}`);
                      deleteObject(imageRef).then(() => {
                        alert("Imagen eliminada con exito");
                        const imagesRef = ref(storage, "images_slider");
                        listAll(imagesRef)
                          .then((res) => {
                            const items = res.items;
                            return Promise.all(
                              items.map(async (item) => {
                                const url = await getDownloadURL(item);
                                const name = item.name;
                                return { url, name };
                              })
                            );
                          })
                          .then((images) => {
                            setImages(images);
                          });
                      

                      }).catch((error) => {
                        console.log(error);
                      });
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              )}
              <img
              src={image.url}
              alt={"slider"}
              className={"w-full h-full object-contain"}
            />
            </div>

          ))}
        </Carousel>
      </div>

      {/* -------------------------------------------------------------------------------------------------------------------- */}
      <section className="pb-20 bg-gray-700 -mt-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-row flex-wrap mx-auto">
            <div className="lg:pt-12 pt-6 w-full md:w-4/12 px-2 text-center">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                <div className="px-4 py-5 flex-auto">
                  <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-red-400">
                    <i className="fas fa-award" />
                  </div>
                  <h6 className="text-xl font-semibold">
                    Estás en el nivel inicial
                  </h6>
                  <p className="mt-2 mb-4 text-gray-600">
                    “Vamos a subir de nivel hasta que llegues a conseguir un
                    trabajo”
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-4/12 px-2 text-center">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                <div className="px-4 py-5 flex-auto">
                  <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-blue-400">
                    <i className="fas fa-retweet" />
                  </div>
                  <h6 className="text-xl font-semibold">
                    ¡Bienvenido al Semillero!
                  </h6>
                  <p className="mt-2 mb-4 text-gray-600">
                    “Este es un sitio donde la curiosidad jamás termina”
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-12 w-full md:w-4/12 px-2 text-center">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                <div className="px-4 py-5 flex-auto">
                  <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-green-400">
                    <i className="fas fa-fingerprint" />
                  </div>
                  <h6 className="text-xl font-semibold">
                    ¿No sabes por dónde empezar?
                  </h6>
                  <p className="mt-2 mb-4 text-gray-600">
                    “Entre todos nos ayudamos para saber a dónde queremos
                    llegar”
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t"></div>
          <div className="flex flex-wrap items-center mt-32">
            <div className="w-full md:w-5/12 px-4 mr-auto ml-auto">
              <div className="text-gray-600 p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg rounded-full bg-gray-100">
                <i className="fas fa-user-friends text-xl" />
              </div>
              <h3 className="text-3xl mb-2 font-semibold leading-normal text-amber-400">
                Todos los años son bienvenidos todos aquellos que deseen mejorar
              </h3>
              <p className="text-lg font-light leading-relaxed mt-4 mb-4 text-white">
                Sabemos lo difícil que es encajar en un ambiente nuevo como lo
                es la universidad, por eso se ofrece este espacio, el cual es un
                grupo en el que conocerás nuevas personas y nuevas maneras de
                pensar.
              </p>
              <p className="text-lg font-light leading-relaxed mt-0 mb-8 text-white">
                Así que si quieres saber más dale click en “más información"
              </p>
              <a
                href="https://semillerosiiis.blogspot.com/"
                className="font-bold text-gray-500 px-8 py-4 rounded-md bg-gray-50 hover:bg-gray-400 hover:text-gray-50"
              >
                Más información!
              </a>
            </div>
            <div className="w-full md:w-4/12 px-4 mr-auto ml-auto">
              <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-amber-400">
                <video className="w-full align-middle rounded-t-lg" controls>
                  <source
                    src="https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/videos%2Fvideo_home.mp4?alt=media&token=d4728384-b3cd-46fd-9b46-bc0f009bb91e"
                    type="video/mp4"
                  />
                </video>
                <blockquote className="relative p-8 mb-4">
                  <svg
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 583 95"
                    className="absolute left-0 w-full block"
                    style={{ height: 95, top: "-94px" }}
                  >
                    <polygon
                      points="-30,95 583,95 583,65"
                      className="text-amber-400 fill-current"
                    />
                  </svg>

                  <h4 className="text-xl font-bold text-white">SIIIS</h4>
                  <p className="text-md font-light mt-2 text-white">
                    “Somos un equipo que se apoya mutuamente para lograr los objetivos propuestos”
                  </p>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------------------------------------------------- */}
      <section className="container mx-auto text-center  mb-6">
        <div className="w-full mb-5">
          <div className="h-1 mx-auto bg-white w-1/6 opacity-25  rounded-t" />
        </div>
        <h3 className=" text-slate-700 text-3xl leading-tight font-semibold">
          Semillero de Investigación e Innovación en Ingeniería de
          Sistemas. (SIIIS)
        </h3>
      </section>
      <Mision_Vision />

      <Reviews/>
      
      <Contact_Us/>
      
    </div>
  );
};
export default Home;
