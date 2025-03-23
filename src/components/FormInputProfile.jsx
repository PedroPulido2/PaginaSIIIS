import { forwardRef } from "react";
import React from "react";

const FormInputProfile = forwardRef(
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
		},
		ref
	) => {
		const errorLabel = error
			? "block mb-2 text-sm font-medium text-red-900 dark:text-red-300"
			: "block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300";

		const errorInput = error
			? "bg-gray-50 border border-red-300 text-red-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 dark:bg-red-700 dark:border-red-600 dark:placeholder-red-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500"
			: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

		return (
			<div>
				<label htmlFor={name} className={errorLabel}>
					{label}
				</label>
				<input
					id={name}
					type={type}
					placeholder={placeholder}
					defaultValue={placeholder}
					ref={ref}
					onChange={onChange}
					onBlur={onBlur}
					name={name}
					className={errorInput}
				/>

				{children}
			</div>
		);
	}
);

export default FormInputProfile;
