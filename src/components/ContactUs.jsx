import React from "react";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { UserContext } from "../context/UserProvider";
import { ErrorsFirebase } from "../utils/ErrorsFirebase";
import { FormValidate } from "../utils/FormValidate";
import { NavLink } from "react-router-dom";
import emailjs from "@emailjs/browser";

// import components
import FormErrors from "../components/FormErrors";
import FormInput from "../components/FormInput";
const ContacUs = () => {
  // validate form with react-hook-form
  const { required, patternEmail, validateEmptyField } = FormValidate();
  // useForm hook
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm();

  const sendEmail = async (data, event) => {
    try {
      const result = await emailjs.sendForm(
        'service_f3257sq',
        'template_fxqjp1f',
        event.target,
        '2Zgc6yupq1YAQYEjZ'
      );
      alert("Mensaje enviado");
      reset(); // se limpia el formulario SOLO si fue exitoso
    } catch (error) {
      console.log("Error al enviar el mensaje. ERROR:", error);
      const { code, message } = ErrorsFirebase(error.code);
      setError(code, { message });
    }
  };


  return (
    <>
      <FormErrors error={errors.errorIntern} />
      <section>
        <div className="py-8 lg:py-16 px-4 mx-auto max-w-screen-md">
          <h1 className="mb-5 text-6xl tracking-tight font-semibold text-center text-gray-700 dark:text-white">
            Contacto
          </h1>
          <p className="mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl">
            ¿Tienes un problema técnico? ¿Quieres enviar tus comentarios?
            ¿Necesitas información sobre nuestro semillero? Háganoslo saber.
          </p>
          <form className="space-y-8" onSubmit={handleSubmit(sendEmail)}>
            <FormInput
              type="emailContact"
              placeholder=""
              label="Ingrese su email"
              htmlFor="email-address"
              name="emailContact"
              error={errors.emailContact}
              {...register("emailContact", {
                required,
                pattern: patternEmail,
              })}
            >
              <FormErrors error={errors.email} />
            </FormInput>
            <FormInput
              type="text"
              placeholder=""
              label="Asunto"
              htmlFor="subject"
              name="subject"
              error={errors.email}
              {...register("subject", {
                required,
              })}
            >
              <FormErrors error={errors.email} />
            </FormInput>

            <div className="sm:col-span-2">
              {/* <label
                htmlFor="message"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
              >
                Comentario
              </label> */}
              <textarea
                id="message"
                name="message"
                rows={6}
                className="block p-2.5 w-full text-xs text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500"
                placeholder="Deja un comentario..."
                defaultValue={""}
                {...register("message", {
                  required,
                })}
              />
            </div>
            <div className="flex flex-row-reverse ...">
              <button
                type="submit"
                className="py-3 px-5 text-sm font-medium text-center border border-amber-400 text-amber-500 rounded-lg bg-primary-700 sm:w-fit hover:bg-primary-800 focus:ring-4 focus:outline-none hover:bg-amber-400 hover:text-white focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Enviar mensaje
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default ContacUs;
