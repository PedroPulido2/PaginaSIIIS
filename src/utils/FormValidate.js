// validation rules for forms
export const FormValidate = () => {
	return {
		required: {
			value: true,
			message: "Este campo es requerido",
		},
		patternEmail: {
			value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
			message: "El email no es válido",
		},
		setValues: (value) => value.trim(),
		patternPassword: {
			value: /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
			message:
				"La contraseña debe tener al menos una mayúscula, una minúscula, un número y un caracter especial",
		},
		setValues: (value) => value.trim(),
		validateEmptyField: {
			trim: (value) => {
				if (!value.trim()) {
					return "El campo no puede estar vacío";
				} else {
					return true;
				}
			},
		},
		validateEqualsPasswords(getValues) {
			return {
				equals: (value) =>
					value === getValues("password") ||
					"Las contraseñas no coinciden",
			};
		},
	};
};
