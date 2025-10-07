import React, { Suspense } from "react";
import PasswordResetPage from "./components/password-reset";

const PasswordResetWrapper = () => {
    return (
        <Suspense>
            <PasswordResetPage />
        </Suspense>
    );
};

export default PasswordResetWrapper;
