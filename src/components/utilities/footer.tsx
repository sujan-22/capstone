import React from "react";
import MaxWidthWrapper from "./max-width-wrapper";
import { Italiana } from "next/font/google";

const italiana = Italiana({
    subsets: ["latin"],
    weight: "400",
});

const FooterLogo = () => {
    return (
        <span
            className={`${italiana.className} text-base tracking-wide font-bold text-primary`}
        >
            DESIGN<span className="text-blue-600">MY</span>CASE
        </span>
    );
};

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t py-3">
            <MaxWidthWrapper>
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <p className="text-sm text-muted-foreground">
                        &copy; {currentYear} <FooterLogo />. All rights
                        reserved.
                    </p>
                </div>
            </MaxWidthWrapper>
        </footer>
    );
};

export default Footer;
