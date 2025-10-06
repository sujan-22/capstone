import React from "react";
import MaxWidthWrapper from "./max-width-wrapper";
import SmallLogo from "./small-logo";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t z-50 py-3 bg-slate-950 backdrop-blur-sm text-secondary">
            <MaxWidthWrapper>
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <p className="text-sm text-muted">
                        &copy; {currentYear}{" "}
                        <SmallLogo className="text-secondary" />. All rights
                        reserved.
                    </p>
                </div>
            </MaxWidthWrapper>
        </footer>
    );
};

export default Footer;
