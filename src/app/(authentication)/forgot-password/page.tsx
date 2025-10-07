import React, { Suspense } from "react";
import ForgotPasswordPage from "./components/forgot-password";

const ForgotPasswordWrapper = () => {
    return (
        <Suspense>
            <ForgotPasswordPage />
        </Suspense>
    );
};

export default ForgotPasswordWrapper;
