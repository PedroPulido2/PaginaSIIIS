import React from "react";
import { forwardRef } from "react";

const FormInput = forwardRef(
  (
    {
      type,
      placeholder,
      onChange,
      onBlur,
      name,
      label,
      error,
      children,
      showPassword,
      onTogglePassword,
    },
    ref
  ) => {
    const errorLabel = error
      ? "peer-focus:font-medium absolute text-sm text-red-500 dark:text-red-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-red-600 peer-focus:dark:text-red-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
      : "peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-amber-500 peer-focus:dark:text-amber-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6";

    const errorInput = error
      ? "block py-2.5 px-0 w-full text-sm text-red-900 bg-transparent border-0 border-b-2 border-red-300 appearance-none dark:border-gray-600 dark:focus:border-red-500 focus:outline-none focus:ring-0 focus:border-red-600 peer"
      : "block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-amber-500 focus:outline-none focus:ring-0 focus:border-amber-400 peer";

    return (
      <div className="relative z-0 w-full mb-6 group ">
        <input
          type={type === "password" && showPassword ? "text" : type}
          placeholder={placeholder}
          ref={ref}
          onChange={onChange}
          onBlur={onBlur}
          name={name}
          className={errorInput}
        />
        <label htmlFor={name} className={errorLabel}>
          {label}
        </label>
        {/* Icono de ojo para mostrar/ocultar contraseña */}
        {type === "password" && (
          <button
            type="button"
            tabIndex={-1}
            onClick={onTogglePassword}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-500 focus:outline-none"
            style={{ padding: 0, background: "none", border: "none" }}
          >
            {showPassword ? (
              // Ojo abierto
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12c0 2.25 3.75 7.5 9.75 7.5s9.75-5.25 9.75-7.5S17.25 4.5 12 4.5 2.25 9.75 2.25 12z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                />
              </svg>
            ) : (
              // Ojo cerrado
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3l18 18M9.88 9.88A3 3 0 0112 9c1.66 0 3 1.34 3 3 0 .35-.07.68-.18.99m-1.7 1.7A3 3 0 019 12c0-.35.07-.68.18-.99m-1.7-1.7A7.5 7.5 0 012.25 12c0 2.25 3.75 7.5 9.75 7.5 2.13 0 4.09-.57 5.75-1.54M15.12 15.12A7.48 7.48 0 0121.75 12c0-2.25-3.75-7.5-9.75-7.5-2.13 0-4.09.57-5.75 1.54"
                />
              </svg>
            )}
          </button>
        )}
        {children}
      </div>
    );
  }
);

export default FormInput;
