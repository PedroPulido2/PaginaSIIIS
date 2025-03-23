import React from "react";

const NotFound = () => {
	return (
		<div className="mt-20 p-4 w-full text-center rounded-lg shadow-md sm:p-8 dark:bg-gray-800 dark:border-gray-700">
			
			<h5 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
				404 Not Found
			</h5>
			<p className="mb-5 text-base text-gray-500 sm:text-lg dark:text-gray-400">
				¡Está ruta no es valida o está fuera de servicio!
			</p>
			<div className="justify-center items-center space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
				<a
					href="/"
					className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 text-white rounded-lg inline-flex items-center justify-center px-4 py-2.5 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fillRule="evenodd"
							d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
							clipRule="evenodd"
						/>
					</svg>
					<div className="text-left">
						<div className="mb-1 text-xs">Ir a página principal</div>
						<div className="-mt-1 font-sans text-sm font-semibold text-center">
							¡REGRESAR!
						</div>
					</div>
				</a>
			</div>
		</div>
	);
};
export default NotFound;
