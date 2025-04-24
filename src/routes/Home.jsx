import React, {useState, useEffect} from "react";
import {Carousel} from "flowbite-react";
import firebaseApp from "../Firebase";
import {getStorage, ref, listAll, getDownloadURL, deleteObject, uploadBytes} from "firebase/storage";
import Contact_Us from "../components/ContactUs";
import Reviews from "../components/Reviews";
import {useFirestore} from "../hooks/useFirestore";

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
                    <div className="relative flex justify-center items-center z-20">
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
                <div className="w-screen bg-[#003366] text-white relative px-10">
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


                {/* -------------------------------------------------------------------------------------------------------------------- */}
                <div className="flex justify-center gap-4 p-4">
                    <div
                        className="bg-[#F7D467] hover:bg-[#F5BC4A] border-2 border-[#947646] rounded-lg p-4 w-72 h-80 shadow-md flex flex-col items-center transition-colors duration-300 group space-y-4">
                        <h2 className="text-8xl font-bold text-[#7C501C] group-hover:text-[#5A3210] transition-colors duration-300">
                            S
                        </h2>
                        <p className="text-2xl text-[#947646] group-hover:text-[#5A3210] transition-colors duration-300">
                            emillero
                        </p>
                        <img src="https://i.imgur.com/cR8iV6g.png" className="w-40 h-40 object-contain"/>
                    </div>


                    <div
                        className="bg-[#F7D467] hover:bg-[#F5BC4A] border-2 border-[#947646] rounded-lg p-4 w-72 h-80 shadow-md flex flex-col items-center transition-colors duration-300 group space-y-4">
                        <h2 className="text-8xl font-bold text-[#7C501C] group-hover:text-[#5A3210] transition-colors duration-300">
                            I
                        </h2>
                        <p className="text-2xl text-[#947646] group-hover:text-[#5A3210] transition-colors duration-300">
                            nvestigación
                        </p>
                        <img src="https://i.imgur.com/eMIinFD.png" className="w-25 h-25 object-contain"/>
                    </div>

                    <div
                        className="bg-[#F7D467] hover:bg-[#F5BC4A] border-2 border-[#947646] rounded-lg p-4 w-72 h-80 shadow-md flex flex-col items-center transition-colors duration-300 group space-y-4">
                        <h2 className="text-8xl font-bold text-[#7C501C] group-hover:text-[#5A3210] transition-colors duration-300">
                            I
                        </h2>
                        <p className="text-2xl text-[#947646] group-hover:text-[#5A3210] transition-colors duration-300">
                            nnovación
                        </p>
                        <img src="https://i.imgur.com/VQPRV1y.png" alt="Innovación"
                             className="max-w-[120px] max-h-[120px] object-contain"/>
                    </div>

                    <div
                        className="bg-[#F7D467] hover:bg-[#F5BC4A] border-2 border-[#947646] rounded-lg p-4 w-72 h-80 shadow-md flex flex-col items-center transition-colors duration-300 group space-y-4">
                        <h2 className="text-8xl font-bold text-[#7C501C] group-hover:text-[#5A3210] transition-colors duration-300">
                            I
                        </h2>
                        <p className="text-2xl text-[#947646] group-hover:text-[#5A3210] transition-colors duration-300">
                            ngenieria
                        </p>
                        <img src="https://i.imgur.com/Fio9MvZ.png" alt="Ingeniería"
                             className="max-w-[120px] max-h-[120px] object-contain"/>
                    </div>

                    <div
                        className="bg-[#F7D467] hover:bg-[#F5BC4A] border-2 border-[#947646] rounded-lg p-4 w-72 h-80 shadow-md flex flex-col items-center transition-colors duration-300 group space-y-4">
                        <h2 className="text-8xl font-bold text-[#7C501C] group-hover:text-[#5A3210] transition-colors duration-300">
                            S
                        </h2>
                        <p className="text-2xl text-[#947646] group-hover:text-[#5A3210] transition-colors duration-300">
                            istemas
                        </p>
                        <img src="https://i.imgur.com/uRRGblH.png" alt="Sistemas"
                             className="max-w-[120px] max-h-[120px] object-contain"/>
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

                <div className="w-full px-4 flex justify-center">
                    {/* Texto */}
                    <div className="w-full bg-[#FCD669] py-6 px-4 text-center">
                        <p className="text-[#6B3E00] font-medium text-3xl mb-4">
                            Conoce más del semillero en nuestro blog
                        </p>
                        <a
                            href="https://semillerosiiis.blogspot.com/"
                            className="inline-block bg-[#9B6A2F] text-white font-medium py-2 px-6 rounded"
                        >
                            Blog
                        </a>
                    </div>
                </div>

                {/* Sección azul: Conoce nuestros proyectos */}
                <div
                    className="bg-[#003366] text-white rounded-xl mt-10 flex flex-col md:flex-row overflow-hidden border-2 border-blue-300">

                    {/* Contenedor de texto centrado verticalmente */}
                    <div className="flex-1 flex items-center p-6">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">Conoce nuestros proyectos</h2>
                            <p className="mb-4 text-sm md:text-base">
                                Con nosotros podrás sacar adelante ese proyecto que más te gusta
                            </p>
                            <a
                                href="/article"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                            >
                                Ver más
                            </a>
                        </div>
                    </div>

                    {/* Imagen a la derecha */}
                    <div className="flex-1">
                        <img
                            src="https://scontent.feyp2-1.fna.fbcdn.net/v/t39.30808-6/468388102_437557126077592_8986359712512938943_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeG5O_oCqJaz8mKGIyX4DHaIgr-FBY6fa22Cv4UFjp9rbW39marFU9WORBtiHv-B-cpaoEOUxW8IAe4RNhf8R4fk&_nc_ohc=HRT849bgkEIQ7kNvwHQcC46&_nc_oc=Adn-OiXWrQIPN6ixfJKOOVo6oxRL6x0rFEKkfBvF2KMEplYW_MK7MhmWcAUonu4aCJQ&_nc_zt=23&_nc_ht=scontent.feyp2-1.fna&_nc_gid=teFEfm3vuvWMem3V-MGQnw&oh=00_AfEpjpL_TDnK3qkfU9RKV4crLZJbcJFFeBpbjrM5AbRQgA&oe=6800C423"
                            alt="Conoce nuestros proyectos"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-center p-6">
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
