import { Italiana } from "next/font/google";
import React from "react";

const italiana = Italiana({
    subsets: ["latin"],
    weight: "400",
});

const Logo = () => {
    return (
        <div
            className={`${italiana.className} text-3xl sm:text-4xl md:text-5xl lg:text-5xl tracking-wide`}
        >
            DESIGNMYCASE
        </div>
    );
};

export default Logo;
