import React, {useState, useEffect} from "react";
import {Carousel} from "flowbite-react";
import firebaseApp from "../Firebase";
import {getStorage, ref, listAll, getDownloadURL, deleteObject, uploadBytes} from "firebase/storage";
import Contact_Us from "../components/ContactUs";
import Reviews from "../components/Reviews";
import {useFirestore} from "../hooks/useFirestore";
import Article from "../routes/Article";
import ArticleCarousel from "../components/ArticleCarousel";
import ProjectCarousel from "../components/ProjectCarousel";

const storage = getStorage(firebaseApp);

// page principal
const Home = () => {
    const [images, setImages] = useState([]);
    const {loading, getData} = useFirestore();
    const [data, setData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

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
                        return {url, name};
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

    const slideCarousel = (direction) => {
        const totalImages = images.length;
        let newIndex = (currentIndex + direction + totalImages) % totalImages;
        setCurrentIndex(newIndex);
    };

    if (loading.getData || loading.getData === undefined) {
        return (
            <div className="text-center text-gray-500 text-xl font-bold h-screen">
                Cargando...
            </div>
        );
    }

    return (
        <div className={"bg-[#FFF9E8]"}>
            <div className="relative w-full h-80 sm:h-96 md:h-[500px] lg:h-[600px] xl:h-[700px]">
                {data && data.length !== 0 && data[0].role === "admin" && (
                    <div className="absolute top-4 left-4 z-20">
                        <label
                            htmlFor="file"
                            className="flex flex-col items-center px-4 py-2 bg-white text-blue-600 rounded-lg shadow-lg tracking-wide uppercase border border-blue-600 cursor-pointer hover:bg-blue-600 hover:text-white pointer-events-auto"
                        >
                            <svg
                                className="w-8 h-8"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
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
                                    alert("Imagen subida con éxito");
                                    const imagesRef = ref(storage, "images_slider");
                                    const querySnapshot = await listAll(imagesRef);
                                    const items = querySnapshot.items;
                                    const images = await Promise.all(
                                        items.map(async (item) => {
                                            const url = await getDownloadURL(item);
                                            const name = item.name;
                                            return {url, name};
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
                            className="absolute top-1/2 left-4 transform -translate-y-1/2 h-10 w-10 text-white bg-black/50 rounded-full p-2 transition duration-300 hover:bg-gray-300 hover:text-black"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="white"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    }
                    rightControl={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute top-1/2 right-4 transform -translate-y-1/2 h-10 w-10 text-white bg-black/50 rounded-full p-2 transition duration-300 hover:bg-gray-300 hover:text-black"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="white"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
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
                                            deleteObject(imageRef)
                                                .then(() => {
                                                    alert("Imagen eliminada con éxito");
                                                    const imagesRef = ref(storage, "images_slider");
                                                    listAll(imagesRef)
                                                        .then((res) => {
                                                            const items = res.items;
                                                            return Promise.all(
                                                                items.map(async (item) => {
                                                                    const url = await getDownloadURL(item);
                                                                    const name = item.name;
                                                                    return {url, name};
                                                                })
                                                            );
                                                        })
                                                        .then((images) => {
                                                            setImages(images);
                                                        });
                                                })
                                                .catch((error) => {
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
                                className={"w-full h-full object-cover"}
                            />
                        </div>
                    ))}
                </Carousel>
            </div>

            <section className="pb-20">
                {/* Sección azul: Bienvenida centrada */}
                <div className="w-screen bg-[#002B4C] text-white relative px-10">
                    <div className="flex items-center justify-center p-6">
                        {/* Texto centrado */}
                        <div className="text-center max-w-3xl">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                BIENVENIDOS AL SEMILLERO DE INVESTIGACIÓN SIIIS
                            </h2>
                            <p className="mb-4 text-sm md:text-base">
                                El grupo semillero (SIIIS) nace desde 2015 con el fin de demostrar actividades de
                                investigación orientadas en la ingeniería de sistemas teniendo en cuenta con la
                                colaboración del grupo de investigación GALASH de la seccional de Sogamoso, por lo
                                tanto, teniendo en cuenta la cantidad de integrantes se creará proyectos de
                                fortalecimiento para las diversas actividades.
                            </p>
                            <a
                                href="/AboutUs"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                            >
                                Ver más
                            </a>
                        </div>
                    </div>
                </div>


                {/* SIIIS */}
                <div className="flex flex-wrap justify-center gap-2 p-2">
                    {/* Card 1 */}
                    <div
                        className="bg-[#F7D467] hover:bg-[#F5BC4A] border-2 border-[#947646] rounded-lg p-4 w-56 h-64 shadow-md flex flex-col items-center transition-colors duration-300 group space-y-4">
                        <h2 className="text-8xl font-bold text-[#7C501C] group-hover:text-[#5A3210] transition-colors duration-300">S</h2>
                        <p className="text-2xl text-[#947646] group-hover:text-[#5A3210] transition-colors duration-300">emillero</p>
                        <img src="https://res.cloudinary.com/drcjskiqi/image/upload/v1748971502/def1_yhslcm.png" className="w-20 h-20 object-contain"/>
                    </div>

                    {/* Card 2 */}
                    <div
                        className="bg-[#F7D467] hover:bg-[#F5BC4A] border-2 border-[#947646] rounded-lg p-4 w-56 h-64 shadow-md flex flex-col items-center transition-colors duration-300 group space-y-4">
                        <h2 className="text-8xl font-bold text-[#7C501C] group-hover:text-[#5A3210] transition-colors duration-300">I</h2>
                        <p className="text-2xl text-[#947646] group-hover:text-[#5A3210] transition-colors duration-300">nvestigación</p>
                        <img src="https://res.cloudinary.com/drcjskiqi/image/upload/v1748971502/def2_itlf0b.png" className="w-14 h-14 object-contain"/>
                    </div>

                    {/* Card 3 */}
                    <div
                        className="bg-[#F7D467] hover:bg-[#F5BC4A] border-2 border-[#947646] rounded-lg p-4 w-56 h-64 shadow-md flex flex-col items-center transition-colors duration-300 group space-y-4">
                        <h2 className="text-8xl font-bold text-[#7C501C] group-hover:text-[#5A3210] transition-colors duration-300">I</h2>
                        <p className="text-2xl text-[#947646] group-hover:text-[#5A3210] transition-colors duration-300">nnovación</p>
                        <img src="https://res.cloudinary.com/drcjskiqi/image/upload/v1748971502/def3_tlorht.png" className="w-14 h-14 object-contain"/>
                    </div>

                    {/* Card 4 */}
                    <div
                        className="bg-[#F7D467] hover:bg-[#F5BC4A] border-2 border-[#947646] rounded-lg p-4 w-56 h-64 shadow-md flex flex-col items-center transition-colors duration-300 group space-y-4">
                        <h2 className="text-8xl font-bold text-[#7C501C] group-hover:text-[#5A3210] transition-colors duration-300">I</h2>
                        <p className="text-2xl text-[#947646] group-hover:text-[#5A3210] transition-colors duration-300">ngeniería</p>
                        <img src="https://res.cloudinary.com/drcjskiqi/image/upload/v1748971502/def4_nigdaq.png" alt="Ingeniería" className="w-14 h-14 object-contain"/>
                    </div>

                    {/* Card 5 */}
                    <div
                        className="bg-[#F7D467] hover:bg-[#F5BC4A] border-2 border-[#947646] rounded-lg p-4 w-56 h-64 shadow-md flex flex-col items-center transition-colors duration-300 group space-y-4">
                        <h2 className="text-8xl font-bold text-[#7C501C] group-hover:text-[#5A3210] transition-colors duration-300">S</h2>
                        <p className="text-2xl text-[#947646] group-hover:text-[#5A3210] transition-colors duration-300">istemas</p>
                        <img src="https://res.cloudinary.com/drcjskiqi/image/upload/v1748971502/def5_rwqfhk.png" alt="Sistemas" className="w-14 h-14 object-contain"/>
                    </div>
                </div>

                {/* Video */}
                <div className="w-full md:w-1/2 px-4 mx-auto">
                    <div className="shadow-lg rounded-lg overflow-hidden">
                        <video className="w-full h-full object-cover" controls>
                            <source
                                src="https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/videos%2Fvideo_home.mp4?alt=media&token=d4728384-b3cd-46fd-9b46-bc0f009bb91e"
                                type="video/mp4"
                            />
                        </video>
                    </div>
                </div>

                <div className="w-full mt-4 flex justify-center">
                    {/* Texto */}
                    <div className="w-full bg-[#FCD669] py-6 px-4 text-center">
                        <p className="text-[#6B3E00] font-medium text-3xl mb-4">
                            Conoce más del semillero en nuestro blog
                        </p>
                        <a
                            href="https://semillerosiiis.blogspot.com/"
                            className="inline-block bg-[#9B6A2F] hover:bg-[#805325] text-white font-semibold text-lg py-3 px-6 rounded transition-colors duration-300"
                        >
                            Blog
                        </a>
                    </div>
                </div>

                {/* Aquí abajo tu componente grande de artículos */}
                <ArticleCarousel/>
                <ProjectCarousel/>

                <div className="flex items-center justify-center">
                    {/* Texto */}
                    <div className="w-full bg-[#FCD669] py-6 px-4 text-center">
                        <h2 className="text-[#6B3E00] font-bold text-2xl md:text-3xl mb-4">
                            ¡Estamos a un solo click de distancia de ti!
                        </h2>
                        <a
                            href="/Contact"
                            className="inline-block bg-[#9B6A2F] hover:bg-[#805325] text-white font-semibold text-lg py-3 px-6 rounded transition-colors duration-300"
                        >
                            Contactar
                        </a>
                    </div>
                </div>


                {/* Testimonios */}
                <Reviews/>
                {/* Mapa de Google */}
                <div className="w-full mt-10">
                    <div className="relative w-full h-[400px]">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.0613215180033!2d-72.94456112501372!3d5.704281294277565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e6a45cb8472448f%3A0x63b776a002185d75!2sUniversidad%20Pedag%C3%B3gica%20y%20Tecnol%C3%B3gica%20de%20Colombia%20-%20Sede%20Sogamoso!5e0!3m2!1ses!2sco!4v1744476899737!5m2!1ses!2sco"
                            width="100%"
                            height="100%"
                            style={{border: 0}}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </section>
        </div>

    );
};

export default Home;
