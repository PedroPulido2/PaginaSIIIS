import { Outlet } from "react-router-dom"
import React from "react";

const LayoutContainerForm = () => {
    return (

        <div className="relative bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                    <svg
                        className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
                        fill="currentColor"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                        <polygon points="50,0 100,0 50,100 0,100" />
                    </svg>

                    <div className="relative pt-16 px-4 sm:px-6 lg:px-8"></div>

                    {/* login or register*/}
                    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

                        <Outlet />
                    </div>

                </div>
            </div>
            <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                <img
                    className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
                    src="https://firebasestorage.googleapis.com/v0/b/siiis-a2398.appspot.com/o/image_resource%2FlayoutContainer.webp?alt=media&token=1dc98561-ffba-4f95-ad85-9260f16c0dfe"
                    alt=""
                />
            </div>
        </div>
    )
}

export default LayoutContainerForm;