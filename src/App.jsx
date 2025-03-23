// import dependencies
import React from "react";
import { Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./context/UserProvider";

// import routes
import Login from "./routes/Login";
import Register from "./routes/Register";
import Home from "./routes/Home";
import NotFound from "./routes/NotFound";
import Article from "./routes/Article";
import Profile from "./routes/Profile";
import Users from "./routes/Users";
import AboutUs from "./routes/AboutUs";

// import components
import "flowbite";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RequireAuth from "./components/RequireAuth";
import LayoutContainerForm from "./components/LayoutContainerForm";
import RequireAuthAdmin from "./components/RequireAuthAdmin";
import ForgotPassword from "./components/ForgotPassword";
import ContacUs from "./components/ContactUs";

// page index
const App = () => {
  const { user } = useContext(UserContext);

  if (user === false) {
    return (
      <div className="text-center text-gray-500 text-xl font-bold h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <Routes>
        <Route element={<LayoutContainerForm />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Contact" element={<ContacUs />} />
        </Route>

        <Route path="/" element={<Home />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route
          path="/Article"
          element={
            <RequireAuth>
              <Article />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/users"
          element={
            <RequireAuth>
                <Users />
            </RequireAuth>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </>
  );
};

export default App;
