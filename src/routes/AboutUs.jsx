import React from "react";
import Members from "../components/members";
const AboutUs = () => {
  return (
    <div className="mt-6 2xl:container 2xl:mx-auto lg:py-16 lg:px-20 md:py-12 md:px-6 py-9 px-4">
      <div className="flex flex-col lg:flex-row  gap-x-52">
        <div className="w-full lg:w-5/12 flex flex-col justify-center">
          <h1 className="text-3xl lg:text-4xl font-bold leading-9 text-gray-800 pb-4">
            Sobre nosotros
          </h1>
          <p className="font-normal text-base leading-6 text-gray-600 ">
            El grupo semillero (SIIIS) nace desde 2015 con el fin de demostrar
            actividades de investigación orientadas en la ingeniería de sistemas
            teniendo en cuenta con la colaboración del grupo de investigación
            GALASH de la seccional de Sogamoso, por lo tanto, teniendo en cuenta
            la cantidad de integrantes se creará proyectos de fortalecimiento
            para las diversas actividades. Es por ello que al tener herramientas
            tecnológicas de la información y la comunicación (TIC) y de la
            Transformación Digital, se pretenden orientar a los Estudiantes,
            Docentes y demás interesados de manera creativa, emocional e
            innovadora en procesos que se van a desarrollar. Así mismo se cuenta
            con una Identidad de Marca del Grupo SIIIS para promocionar las
            investigaciones en curso.
          </p>
        </div>
        <div className="w-auto self-center">
          <img
            className="w-full h-full "
            src="https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/image_resource%2Flogo_black.png?alt=media&token=865e49f6-bc1f-46ec-8e4e-923f503f0e96"
            alt="A group of People"
          />
        </div>
      </div>
      <Members />
      <div className="flex lg:flex-row flex-col justify-between gap-8 p-4 mt-12 bg-slate-100" style={{ borderRadius: "1rem" }}>
        <div className="w-full lg:w-5/12 flex flex-col justify-center">
          <h1 className="text-3xl lg:text-4xl font-bold leading-9 text-gray-800 pb-4">
            Desarrolladores
          </h1>
          <p className="font-normal text-base leading-6 text-gray-600 ">
            Somos estudiantes de Ingeniería de sistemas y computación de la
            Universidad Pedagógica y Tecnológica de Colombia, que nos hemos
            unido para crear un espacio de aprendizaje y colaboración para todos
            los estudiantes de la universidad.
          </p>
        </div>
        <div className="w-full lg:w-6/12 lg:pt-8">
          <p className="p-2 font-normal col-span-2 text-base text-center leading-6 text-gray-600 ">
            Ingenieros de Sistemas y Computación
          </p>
          <div className="flex flex-col lg:flex-row justify-center gap-4">
            <div className="p-4 pb-6 text-center">
              <img
                className="w-40 h-40 rounded-full mx-auto object-cover"
                src="https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/images_about%2FEsteban.jpg?alt=media&token=6c51bc88-0477-46bb-af98-b5319903885e"
                alt="Esteban featured Img"
              />
              <p className="font-semibold text-xl leading-5 text-gray-800 mt-4">
                Esteban Duarte
              </p>
              <p className="font-normal text-base leading-6 text-gray-600">
                <a href="mailto:yessidduarte7@gmail.com">
                  Correo:yessidduarte7@gmail.com
                </a>
              </p>
            </div>
            <div className="p-4 pb-6 text-center">
              <img
                className="w-40 h-40 rounded-full mx-auto object-cover"
                src="https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/images_about%2FJimmyZea.jpeg?alt=media&token=12f12f9b-f0f1-4a28-ad24-709d80821beb"
                alt="Jimmy featured Img"
              />
              <p className="font-semibold text-xl leading-5 text-gray-800 mt-4">
                Jimmy Zea
              </p>
              <p className="font-normal text-base leading-6 text-gray-600">
                <a href="mailto:yessidduarte7@gmail.com">
                  Correo:yessidduarte7@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

      </div>
      {/* ------------------------------------------------------------------------------------------------------- */}
    </div>
  );
};
export default AboutUs;
