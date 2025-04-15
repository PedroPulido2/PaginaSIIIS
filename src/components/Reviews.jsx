import { useEffect, useState, Fragment, useRef, useContext } from "react";
import { useForm } from "react-hook-form";
import { useFirestore } from "../hooks/useFirestore";
import { useFirestoreReviews } from "../hooks/useFirestoreReviews";
import { UserContext } from "../context/UserProvider";
import { Dropdown, Pagination } from "flowbite-react";
import Comments from "./Comments";
import React from "react";

const Reviews = () => {
  const {
    loadingReview,
    getDataReviews,
    addDataReview,
    getDataReviewUser,
    deleteDataReview,
  } = useFirestoreReviews();
  const { loading, getDataUsers, getData, deleteData, getDataUserId } =
    useFirestore();
  const { user } = useContext(UserContext);

  const [data, setData] = useState([]);
  const [dataUsers, setDataUsers] = useState([]);
  const [dataReview, setDataReview] = useState([]);

  // useForm hook
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  useEffect(() => {
    const loadData = async () => {
      const data = await getData();
      const dataUsers = await getDataUsers();
      const dataReview = await getDataReviews();
      setData(data);
      setDataReview(dataReview);
      setDataUsers(dataUsers);
    };
    loadData();
  }, []);

  const handleDeleteReview = async (id) => {
    try {
      await deleteDataReview(id);
      setDataReview(dataReview.filter((item) => item.id !== id));
      alert("Comentario eliminado");
    } catch (error) {
      console.log(error.code);
      const { code, message } = ErrorsFirebase(error.code);
      setError(code, { message });
    }
  };

  if (
    (loadingReview.getDataReviews && loading.getDataUsers) ||
    (loadingReview.getDataReviews === undefined && loading.getDataUsers)
  ) {
    return (
      <div className="text-center text-gray-500 text-xl font-bold h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <>
      <div className="min-w-screen min-h-screen bg-gray-50 flex items-center justify-center py-5">
        <div className="w-full bg-white border-t border-b border-gray-200 px-5 py-16 md:py-24 text-gray-800">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center max-w-xl mx-auto">
              <h1 className="text-6xl font-semibold mb-5 text-gray-700">
                Comentarios
              </h1>
              <h3 className="text-xl mb-5 font-light">
                En esta sección encontraras lo que las personas opinan sobre el
                semillero.
              </h3>
              <div className="text-center ">
                <span className="inline-block w-1 h-1 rounded-full bg-amber-500 ml-1" />
                <span className="inline-block w-3 h-1 rounded-full bg-amber-500 ml-1" />
                <span className="inline-block w-40 h-1 rounded-full bg-amber-500 ml-1 " />
                <span className="inline-block w-3 h-1 rounded-full bg-amber-500 ml-1" />
                <span className="inline-block w-1 h-1 rounded-full bg-amber-500 ml-1" />
              </div>

              {user && (
                <Comments
                  fucntionComent="Crear"
                  comment={{
                    id: "",
                    review: "",
                    userUID: "",
                  }}
                />
              )}

            </div>
            {/* ------------------------------------------------------------------------------------------------------------------ */}
            <div className="flex items-center flex-wrap -mx-3 mt-6 ">
              {dataReview.map((review) => (
                <div key={review.id} className="basis-1/3 px-3 ">
                  <div className="w-full mx-auto rounded-lg bg-white border border-gray-200 p-5 text-gray-800 font-light mb-3">
                    {user != null && (
                      <div className="flex justify-end px-4 pt-4">
                        {(user.uid === review.userUID ||
                          data[0].role == "admin") && (
                            <Dropdown inline={true} label="">
                              <Dropdown.Item>
                                <Comments
                                  fucntionComent="Editar"
                                  comment={review}
                                />
                              </Dropdown.Item>
                              <Dropdown.Item>
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="block py-2 px-4 text-sm text-red-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                >
                                  Eliminar
                                </button>
                              </Dropdown.Item>
                            </Dropdown>
                          )}
                      </div>
                    )}
                    <div className="w-full flex mb-4 items-center">
                      <div className="overflow-hidden rounded-full w-10 h-10 bg-gray-50 border border-gray-200">
                        <img
                          src={
                            dataUsers.find(
                              (user) => user.userUID == review.userUID
                            ).profileImage
                          }
                          alt=""
                        />
                      </div>
                      <div className="flex-grow pl-3">
                        <h6 className="font-bold text-sm uppercase text-gray-600">
                          {dataUsers.map((user) => {
                            if (user.userUID === review.userUID) {
                              return user.name + " " + user.lastName;
                            }
                          })}
                        </h6>
                      </div>
                    </div>

                    {/* Agregar Fecha de creacion de comentario*/}
                    {review.createdAt && (
                      <div className="text-right text-xs text-gray-400">
                        {new Date(
                          review.createdAt.seconds
                            ? review.createdAt.seconds * 1000
                            : review.createdAt
                        ).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                    {/* Agregar Fecha de creacion de comentario*/}


                    <div className="w-full">
                      <p className="text-sm leading-tight">
                        <span className="text-lg leading-none italic font-bold text-gray-400 mr-1">
                          "
                        </span>
                        {review.review}
                        <span className="text-lg leading-none italic font-bold text-gray-400 ml-1">
                          "
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reviews;
