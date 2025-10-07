import React, { Suspense } from "react";
import EmailVerificationPage from "./components/email-verification";

const EmailVerificationWrapper = () => {
    return (
        <Suspense>
            <EmailVerificationPage />
        </Suspense>
    );
};

export default EmailVerificationWrapper;
