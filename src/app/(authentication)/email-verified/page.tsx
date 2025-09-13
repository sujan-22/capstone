"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/utilities/logo";
import { authClient } from "../../../../auth-client";

const EmailVerificationPage: React.FC = () => {
    const session = authClient.getSession().then((res) => console.log(res));
    console.log(session);
    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            <div className="w-full max-w-md mx-4 p-6 bg-white/0 rounded-lg flex flex-col items-center">
                <div className="mb-6 w-full flex flex-col items-center space-y-4">
                    <Logo />
                    <p className="md:text-xl lg:text-xl sm:text-xl text-md">
                        Your email is verified!
                    </p>
                    <p className="text-muted-foreground text-sm text-center">
                        You can now close this tab and return to the app.
                    </p>
                </div>
                <div className="mt-4 w-full flex justify-center">
                    <Button>Go to Home</Button>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPage;
