import Members from "../components/members";
import Mision_Vision from "../components/Mision_Vision";
import React, { useState } from "react";


const AboutUs = () => {
  const [version, setVersion] = useState("V2");

  const desarrolladoresV1 = [
    {
      nombre: "Esteban Duarte",
      correo: "yessidduarte7@gmail.com",
      imagen: "https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/images_about%2FEsteban.jpg?alt=media&token=6c51bc88-0477-46bb-af98-b5319903885e"
    },
    {
      nombre: "Jimmy Zea",
      correo: "yessidduarte7@gmail.com",
      imagen: "https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/images_about%2FJimmyZea.jpeg?alt=media&token=12f12f9b-f0f1-4a28-ad24-709d80821beb"
    }
  ];

  const desarrolladoresV2 = [
    {
      nombre: "Julian Diaz",
      correo: "",
      imagen: "https://via.placeholder.com/150"
    },
    {
      nombre: "Juan Gonzalez",
      correo: "",
      imagen: "https://via.placeholder.com/150"
    },
    {
      nombre: "Luis Gonzalez",
      correo: "",
      imagen: "https://via.placeholder.com/150"
    },
    {
      nombre: "Pedro Pulido",
      correo: "",
      imagen: "https://via.placeholder.com/150"
    },
    {
      nombre: "Jeimmy Valderrama",
      correo: "",
      imagen: "https://via.placeholder.com/150"
    }
  ];
  

  const desarrolladores = version === "V1" ? desarrolladoresV1 : desarrolladoresV2;

  return (
    <div className="flex flex-col items-center w-full">

      {/* Imagen de fondo con texto encima */}
      <div className="relative w-full h-80 overflow-hidden">
        <img
          className="w-full h-full object-cover object-center"
          src="https://i.imgur.com/wVn9tnw.jpeg" // Enlace directo a la imagen de Imgur
          alt="Fondo SIIIS"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <h1 className="text-white text-4xl lg:text-5xl font-bold">ACERCA DE NOSOTROS</h1>
        </div>
      </div>

      {/* Sección azul con texto y logo */}
      <div className="w-full bg-blue-900 flex flex-col lg:flex-row items-center justify-center px-8 lg:px-32 py-12 gap-10" style={{ backgroundColor: '#0D3B66' }}>
        {/* Texto */}
        <div className="lg:w-7/12 text-white text-justify">
          <p className="text-base leading-7">
            El grupo semillero (SIIIS) nace desde 2015 con el fin de demostrar actividades de investigación
            orientadas en la ingeniería de sistemas teniendo en cuenta con la colaboración del grupo de
            investigación GALASH de la seccional de Sogamoso, por lo tanto, teniendo en cuenta la cantidad
            de integrantes se creará proyectos de fortalecimiento para las diversas actividades. Es por ello
            que al tener herramientas tecnológicas de la información y la comunicación (TIC) y de la
            Transformación Digital, se pretenden orientar a los Estudiantes, Docentes y demás interesados de
            manera creativa, emocional e innovadora en procesos que se van a desarrollar. Así mismo se cuenta
            con una Identidad de Marca del Grupo SIIIS para promocionar las investigaciones en curso.
          </p>
        </div>

        {/* Logo */}
        <div className="flex justify-center items-center">
          <img
            className="w-52 h-52 object-contain"
            src="https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/image_resource%2Flogo_black.png?alt=media&token=865e49f6-bc1f-46ec-8e4e-923f503f0e96"
            alt="Logo SIIIS"
          />
        </div>
      </div>

      {/* Sección de Misión y Visión */}
      <section className="container mx-auto text-center mt-16 mb-12">
        <div className="w-full mb-5">
          <div className="h-1 mx-auto bg-white w-1/6 opacity-25 rounded-t" />
        </div>
        <Mision_Vision/>
      </section>

      {/* Director del Semillero */}
      <section className="w-full flex flex-col md:flex-row items-stretch justify-between px-6 md:px-20 py-6 bg-[#f5d476] gap-4">
        <div className="w-full md:w-2/3 flex flex-col justify-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-1">
          Director del semillero
        </h2>
        <p className="text-xl text-gray-700 font-semibold">
          Edmundo Arturo Junco Orduz
        </p>
        <p className="text-lg text-gray-700 mb-2">
          Docente UPTC
        </p>

          <a
            href="https://www.grupogalash.com/researchers/junco"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-800 font-medium hover:underline"
          >
            Leer más
          </a>
        </div>
        <div className="w-full md:w-1/3">
          <img
            src="https://www.grupogalash.com/assets/research/EJunco.jpg"
            alt="Edmundo Arturo Junco Orduz"
            className="w-full h-full object-cover rounded-lg shadow-md"
          />
        </div>
      </section>



      {/* Integrantes del semillero */}
      <Members />

      {/* Desarrolladores */}
      <div className="flex flex-col gap-6 p-8 mt-12 bg-slate-100 rounded-xl w-full">
        {/* Fila superior: texto centrado y selector a la derecha */}
        <div className="flex flex-col gap-8 pt-12 px-4 items-center">     
          <div className="w-full text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 pb-4">
              Desarrolladores
            </h1>
            <p className="font-normal text-base text-gray-600">
              Somos estudiantes de Ingeniería de Sistemas y Computación de la Universidad Pedagógica y Tecnológica de Colombia.
            </p>
          </div>

          {/* Selector alineado abajo */}
          <div className="flex flex-col items-center mt-4 px-4 lg:px-8">
            <label htmlFor="version" className="mb-2 font-medium text-gray-700">
              Versión:
            </label>
            <select
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="px-4 py-2 rounded border border-gray-300"
            >
              <option value="V1">V1 -</option>
              <option value="V2">V2 -</option>
            </select>
          </div>
        </div>

        {/* Subtítulo */}
        <p className="p-2 font-normal text-center text-base text-gray-600">
          Ingenieros de Sistemas y Computación
        </p>

        {/* Avatares */}
        <div className="flex flex-wrap justify-center gap-6">
          {desarrolladores.map((dev, index) => (
            <div key={index} className="p-4 pb-6 text-center">
              <img
                className="w-40 h-40 rounded-full mx-auto object-cover"
                src={dev.imagen}
                alt={`${dev.nombre} featured Img`}
              />
              <p className="font-semibold text-xl text-gray-800 mt-4">
                {dev.nombre}
              </p>
              <p className="font-normal text-base text-gray-600">
                <a href={`mailto:${dev.correo}`}>Correo: {dev.correo}</a>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
