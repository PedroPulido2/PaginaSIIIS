import React from "react";
import { forwardRef } from "react";

const FormInput = forwardRef(
  (
    { type, placeholder, onChange, onBlur, name, label, error, children },
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
          type={type}
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
        {children}
      </div>
    );
  }
);

export default FormInput;
