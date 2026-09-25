import Steps from "@/components/utilities/steps";
import MaxWidthWrapper from "@/components/utilities/max-width-wrapper";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <MaxWidthWrapper className="pb-16 pt-6 sm:pb-24 sm:pt-8">
            <Steps />
            <div className="mt-8">{children}</div>
        </MaxWidthWrapper>
    );
};

export default Layout;
