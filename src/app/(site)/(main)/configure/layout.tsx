import Steps from "@/components/utilities/steps";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="flex-1 flex flex-col">
            <div className=" border rounded-md mt-3">
                <Steps />
            </div>
            <div className="my-8">
                <div className="container">{children}</div>
            </div>
        </div>
    );
};

export default Layout;
