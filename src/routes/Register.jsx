// import dependencies
import React from "react";
import { useContext } from "react";
import { UserContext } from "../context/UserProvider";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { ErrorsFirebase } from "../utils/ErrorsFirebase";
import { FormValidate } from "../utils/FormValidate";

// import components
import FormErrors from "../components/FormErrors";
import FormInput from "../components/FormInput";
import { useFirestore } from "../hooks/useFirestore";

// page register
const Register = () => {
	const { registerUser, logoutUser } = useContext(UserContext);
	const { addData } = useFirestore();
	// validate form with react-hook-form
	const {
		required,
		patternEmailRegister,
		patternPassword,
		validateEmptyField,
		validateEqualsPasswords,
	} = FormValidate();

	// useForm hook
	const {
		register,
		handleSubmit,
		formState: { errors },
		getValues,
		setError,
	} = useForm();

	// useState hook
	const onSubmit = async (data) => {
		try {
			const userl = await registerUser(data.email, data.password);
			if (userl) {
				await addData({
					name: data.name,
					lastName: data.lastName,
					phone: data.phone,
					email: data.email,
					profileImage: "https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg"
				});
				window.location.href = "/";
			}

		} catch (error) {
			console.log(error.code);
			const { code, message } = ErrorsFirebase(error.code);
			setError(code, { message });
		}
	};

	// render register form
	return (
		<>
			<FormErrors error={errors.firebase} />

			<div className="max-w-md w-full space-y-8">
				<div>
					<img
						className="mx-auto h-28 w-auto"
						src="https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/image_resource%2Flogo_black.png?alt=media&token=865e49f6-bc1f-46ec-8e4e-923f503f0e96"
						alt="Workflow"
					/>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Registro Usuario
					</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
					<FormInput
						type="text"
						placeholder=" "
						label="Nombre"
						htmlFor="name"
						error={errors.name}
						autoComplete="off"
						{...register("name", {
							required: "El nombre es obligatorio",
							pattern: {
								value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
								message: "El nombre solo puede contener letras y espacios",
							},
						})}
					>
						<FormErrors error={errors.name} />
					</FormInput>

					<FormInput
						type="text"
						placeholder=" "
						label="Apellidos"
						htmlFor="lastName"
						error={errors.lastName}
						autoComplete="off"
						{...register("lastName", {
							required: "Los apellidos son obligatorios",
							pattern: {
								value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
								message: "Los apellidos solo pueden contener letras y espacios",
							},
						})}
					>
						<FormErrors error={errors.lastName} />
					</FormInput>

					<FormInput
						type="tel"
						placeholder=" "
						label="Celular"
						htmlFor="phone"
						error={errors.phone}
						autoComplete="off"
						{...register("phone", {
							required: "El número de celular es obligatorio",
							pattern: {
								value: /^[0-9]{10,}$/,
								message: "El número debe tener al menos 10 dígitos y solo contener números",
							},
						})}
					>
						<FormErrors error={errors.phone} />
					</FormInput>

					<FormInput
						type="email"
						placeholder=" "
						label="Ingrese su email"
						htmlFor="email"
						error={errors.email}
						{...register("email", {
							required,
							pattern: patternEmailRegister,
						})}
					>
						<FormErrors error={errors.email} />
					</FormInput>

					<FormInput
						type="password"
						placeholder=" "
						label="Ingrese su contraseña"
						htmlFor="password"
						error={errors.password}
						{...register("password", {
							required,
							pattern: patternPassword,
							validate: validateEmptyField,
						})}
					>
						<FormErrors error={errors.password} />
					</FormInput>

					<FormInput
						type="password"
						placeholder=" "
						label="Repita su contraseña"
						htmlFor="password"
						error={errors.repassword}
						{...register("repassword", {
							validate: validateEqualsPasswords(getValues),
						})}
					>
						<FormErrors error={errors.repassword} />
					</FormInput>

					<div>
						<button
							type="submit"
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
						>
							<span className="absolute left-0 inset-y-0 flex items-center pl-3">
								{/* <LockClosedIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" /> */}
							</span>
							Registrar
						</button>
					</div>
				</form>
				<div className="mt-12 pt-6 border-t"></div>
			</div>
		</>
	);
};

export default Register;
