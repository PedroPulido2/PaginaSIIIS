// import dependencies
import React from "react";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { UserContext } from "../context/UserProvider";
import { ErrorsFirebase } from "../utils/ErrorsFirebase";
import { FormValidate } from "../utils/FormValidate";
import { NavLink } from "react-router-dom";

// import components
import FormErrors from "../components/FormErrors";
import FormInput from "../components/FormInput";

const ForgotPassword = () => {
  const { resetPassword } = useContext(UserContext);

  // validate form with react-hook-form
  const { required, patternEmail, validateEmptyField } = FormValidate();

  // useForm hook
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  // useState hook
  const onSubmit = async (data) => {
    try {
      await resetPassword(data.email);
      alert("Checa tu bandeja de entrada o spam y sigue las instrucciones");
    } catch (error) {
      const { code, message } = ErrorsFirebase(error.code);
      setError(code, { message });
    }
  };

  return (
    <div className="mt-24">
      <FormErrors error={errors.errorIntern} />

      <div className="max-w-md w-full space-y-8 mx-auto">
        <div>
          <img
            className="mx-auto h-28 w-auto"
            src="https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/image_resource%2Flogo_black.png?alt=media&token=865e49f6-bc1f-46ec-8e4e-923f503f0e96"
            alt="Workflow"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Recuperar contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            O{" "}
            <NavLink to="/login">
              <span className="text-amber-500 hover:text-amber-400">
                volver a login
              </span>
            </NavLink>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <FormInput
              type="email"
              placeholder=" "
              label="Ingrese su email"
              htmlFor="email-address"
              name="floating_email"
              error={errors.email}
              {...register("email", {
                required,
                pattern: patternEmail,
                validateEmptyField,
              })}
            >
              <FormErrors error={errors.email} />
            </FormInput>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3"></span>
              Recuperar
            </button>
          </div>
        </form>

        <div className="mt-12 pt-6 border-t"></div>
      </div>
    </div>
  );
};

export default ForgotPassword;
