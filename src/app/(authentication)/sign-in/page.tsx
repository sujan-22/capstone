import React, { Suspense } from "react";
import SignInPage from "./components/sign-in";

const SignInWrapper = () => {
    return (
        <Suspense>
            <SignInPage />
        </Suspense>
    );
};

export default SignInWrapper;
