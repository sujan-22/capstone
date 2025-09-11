import { Italiana } from "next/font/google";
import Link from "next/link";
import React from "react";

const italiana = Italiana({
    subsets: ["latin"],
    weight: "400",
});

const Logo = () => {
    return (
        <Link
            href={"/"}
            className={`${italiana.className} text-3xl sm:text-4xl md:text-4xl lg:text-4xl tracking-wide`}
        >
            DESIGNMYCASE
        </Link>
    );
};

export default Logo;
