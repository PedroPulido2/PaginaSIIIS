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
                        {/* Botón de carga */}
                    </div>
                )}

                <Carousel
                    indicators={true}
                    slideInterval={5000}
                    className="w-full h-full"
                    leftControl={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute top-1/2 left-4 transform -translate-y-1/2 h-10 w-10 text-white bg-black/50 rounded-full p-2 transition duration-300 hover:bg-gray-300 hover:text-black z-50"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="white"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                        </svg>
                    }
                    rightControl={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute top-1/2 right-4 transform -translate-y-1/2 h-10 w-10 text-white bg-black/50 rounded-full p-2 transition duration-300 hover:bg-gray-300 hover:text-black z-50"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="white"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                        </svg>
                    }
                >
                    {images.map((image, index) => (
                        <div key={index} className="w-full h-full relative">
                            {data && data[0].role === "admin" && (
                                <div className="absolute top-4 right-4 z-50">
                                    <button
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                                        onClick={() => {
                                            const imageRef = ref(storage, `images_slider/${image.name}`);
                                            deleteObject(imageRef)
                                                .then(() => {
                                                    alert("Imagen eliminada con éxito");
                                                    const imagesRef = ref(storage, "images_slider");
                                                    return listAll(imagesRef);
                                                })
                                                .then((res) =>
                                                    Promise.all(
                                                        res.items.map(async (item) => {
                                                            const url = await getDownloadURL(item);
                                                            return {url, name: item.name};
                                                        })
                                                    )
                                                )
                                                .then((images) => {
                                                    setImages(images);
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
                                alt="slider"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </Carousel>
            </div>

            <section className="pb-20 mt-6">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap items-center">
                        {/* Video */}
                        <div className="w-full md:w-1/2 px-4">
                            <div className="shadow-lg rounded-lg overflow-hidden">
                                <video className="w-full h-full object-cover" controls>
                                    <source
                                        src="https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/videos%2Fvideo_home.mp4?alt=media&token=d4728384-b3cd-46fd-9b46-bc0f009bb91e"
                                        type="video/mp4"
                                    />
                                </video>
                            </div>
                        </div>

                        {/* Texto */}
                        <div className="w-full md:w-1/2 px-4 mt-10 md:mt-0">
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="text-yellow-500 text-4xl font-bold mb-4 leading-tight">
                                    Todos los años son bienvenidos todos aquellos que deseen mejorar
                                </div>
                                <p className="text-gray-700 text-base mb-4">
                                    Sabemos lo difícil que es encajar en un ambiente nuevo como lo es la universidad,
                                    por eso se ofrece este espacio, el cual es un grupo en el que conocerás nuevas
                                    personas y nuevas maneras de pensar.
                                </p>
                                <p className="text-gray-700 text-base mb-6">
                                    ¿Quieres saber más acerca de nosotros?
                                </p>
                                <a
                                    href="/AboutUs"
                                    className="inline-block bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300"
                                >
                                    Más información!
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección azul: Conoce nuestros proyectos */}
                <div className="w-screen bg-[#003054] text-white mt-10 relative px-10">
                    <div className="flex items-center justify-between p-6">
                        {/* Texto */}
                        <div className="flex-1">
                            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-[#FFFFFF]">
                                Conoce nuestros proyectos
                            </h2>
                            <p className="mb-4 text-sm md:text-base text-[#D9D9D9]">
                                Con nosotros podrás sacar adelante ese proyecto que más te gusta
                            </p>
                            <a
                                href="/users"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                            >
                                Ver más
                            </a>
                        </div>
                        {/* Carrusel de imágenes en la zona derecha */}
                        <div className="w-1/2 pl-6">
                            <div id="carouselExample" className="relative" data-te-carousel-init>
                                {/* Imágenes del carrusel */}
                                <div className="relative overflow-hidden">
                                    <div className="flex transition-transform duration-700 ease-in-out"
                                         id="carouselImages">
                                        <img
                                            src="https://scontent.feyp2-1.fna.fbcdn.net/v/t39.30808-6/468388102_437557126077592_8986359712512938943_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=107&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeG5O_oCqJaz8mKGIyX4DHaIgr-FBY6fa22Cv4UFjp9rbW39marFU9WORBtiHv-B-cpaoEOUxW8IAe4RNhf8R4fk&_nc_ohc=HRT849bgkEIQ7kNvwHQcC46&_nc_oc=Adn-OiXWrQIPN6ixfJKOOVo6oxRL6x0rFEKkfBvF2KMEplYW_MK7MhmWcAUonu4aCJQ&_nc_zt=23&_nc_ht=scontent.feyp2-1.fna&_nc_gid=56EPfH5jhn5FLJaMLQSXeQ&oh=00_AfGwMInjbsyZYLU3xeOjEOrRTT7dCYl7YxxcuCLfLl0M2g&oe=680053A3"
                                            alt="Proyecto 1"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full px-4 flex justify-center">
                    {/* Texto */}
                    <div className="w-full px-4 mt-10">
                        <div className="bg-white rounded-xl shadow-lg p-8 w-full">
                            <div className="text-yellow-500 text-4xl font-bold mb-4 leading-tight text-center">
                                Conoce más del semillero en nuestro blog
                            </div>
                            <div className="text-center">
                                <a
                                    href="https://semillerosiiis.blogspot.com/"
                                    className="inline-block bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300"
                                >
                                    Ver más
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-screen bg-[#003366] text-white mt-10 relative px-10">
                    <div className="flex items-center justify-center p-6">
                        {/* Texto */}
                        <div className="text-center">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                ¡Estamos a un solo click de distancia de ti!
                            </h2>
                            <a
                                href="/Contact"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                            >
                                Contactar
                            </a>
                        </div>
                    </div>
                </div>

                {/* Testimonios */}
                <Reviews/>

            </section>
        </div>
    );
};

export default Home;
