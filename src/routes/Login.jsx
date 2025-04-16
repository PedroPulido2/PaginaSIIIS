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
import { useFirestore } from "../hooks/useFirestore";

// page Login
const Login = () => {
  const { loginUser, logoutUser } = useContext(UserContext);

  const { getData } =useFirestore();

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
      if (await loginUser(data.email, data.password)) {
        
        const user = await getData("users", data.email);

        if (user[0].name === "" && user[0].lastName === "" && user[0].phone === "") {
          window.location.href = "/profile";
        } else {
          window.location.href = "/";
        }
        
      } else {
        alert("Aún no has verificado tu cuenta");
        await logoutUser();
        window.location.href = "/login";
      }
    } catch (error) {
      const { code, message } = ErrorsFirebase(error.code);
      setError(code, { message });
    }
  };

  // render login form
  return (
    <>
      <FormErrors error={errors.errorIntern} />

      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-28 w-auto"
            src="https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/image_resource%2Flogo_black.png?alt=media&token=865e49f6-bc1f-46ec-8e4e-923f503f0e96"
            alt="Workflow"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Inicia sesión
          </h2>
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
              })}
            >
              <FormErrors error={errors.email} />
            </FormInput>

            <FormInput
              type="password"
              placeholder=" "
              label="Ingrese su contraseña"
              htmlFor="password"
              name="floating_password"
              error={errors.password}
              {...register("password", {
                required,
                validate: validateEmptyField,
              })}
            >
              <FormErrors error={errors.password} />
            </FormInput>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-amber-500 focus:ring-amber-400 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Recuerdame
              </label>
            </div>

            <div className="text-sm">
              <NavLink to="/forgot-password">
                <span className="font-medium text-amber-500 hover:text-amber-400">
                  Olvidaste tu contraseña?
                </span>
              </NavLink>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {/* <LockClosedIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" /> */}
              </span>
              Iniciar sesión
            </button>
          </div>
        </form>

        <div className="mt-12 pt-6 border-t"></div>
      </div>
    </>
  );
};
export default Login;
