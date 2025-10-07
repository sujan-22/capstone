import React, { Suspense } from "react";
import SignUpPage from "./components/sign-up";
const SignUpWrapper = () => {
    return (
        <Suspense>
            <SignUpPage />
        </Suspense>
    );
};

export default SignUpWrapper;
