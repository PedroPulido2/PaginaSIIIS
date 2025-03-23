// import dependencies
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useFirestore } from "../hooks/useFirestore";
import React from "react";

const RequireAuthAdmin = ({ children }) => {
	const { getData, loading } = useFirestore();
	const [data, setData] = useState([]);

	useEffect(() => {
		const loadData = async () => {
			const data = await getData();
			setData(data);
		}
		loadData();
	}, []);

	if (loading.getData || loading.getData === undefined) {
		return <div
			className="text-center text-gray-500 text-xl font-bold h-screen"
		>Cargando...</div>;
	} else {
		return data.map((item) => {
			return (
				<div key={item.userUID}>
					{item.role == "admin" ? children : <Navigate to="/" />}
				</div>
			);
		});
	}


};
export default RequireAuthAdmin;
