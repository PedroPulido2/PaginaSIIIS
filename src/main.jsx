import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import UserProvider from "./context/UserProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<UserProvider>
			<BrowserRouter>
				<App> </App>
			</BrowserRouter>
		</UserProvider>
	</React.StrictMode>
);
