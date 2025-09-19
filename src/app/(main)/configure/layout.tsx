import Steps from "@/components/utilities/steps";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="flex-1 flex flex-col">
            <div className=" border rounded-md my-2">
                <Steps />
            </div>
            {children}
        </div>
    );
};

export default Layout;
