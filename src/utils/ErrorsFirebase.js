// errrors firebase
export const ErrorsFirebase = (codeError) => {
	switch (codeError) {
		case "auth/email-already-in-use":
			return {
				code: "email",
				message: "El correo ya esta en uso",
			};
		case "auth/invalid-email":
			return {
				code: "email",
				message: "El correo no es valido",
			};
		case "auth/weak-password":
			return {
				code: "password",
				message: "La contraseña es muy debil",
			};
		case "auth/wrong-password":
			return {
				code: "password",
				message: "La contraseña es incorrecta",
			};
		case "auth/user-not-found":
			return {
				code: "email",
				message: "El usuario no existe",
			};
		case "auth/user-disabled":
			return {
				code: "email",
				message: "El usuario esta deshabilitado",
			};
		case "auth/invalid-phone-number":
			return {
				code: "phone",
				message: "El numero de telefono no es valido",
			};
		case "auth/missing-phone-number":
			return {
				code: "phone",
				message: "Falta el numero de telefono",
			};
		default:
			return {
				code: "errorIntern",
				message: "Error desconocido en el servidor",
			};
	}
};
