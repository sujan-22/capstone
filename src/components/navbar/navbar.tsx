"use client";

import { IUser } from "../../../auth-client";
import MaxWidthWrapper from "../utilities/max-width-wrapper";
import Logo from "../utilities/logo";
import { Button } from "../ui/button";
import { FaArrowRight } from "react-icons/fa6";
import { UserDropdown } from "./user-dropdown";
import { useRouter } from "next/navigation";

const Navbar = ({ user }: { user: IUser | null | undefined }) => {
    const router = useRouter();
    return (
        <div className="sticky top-0 inset-x-0 z-1000">
            <div
                className={`bg-background/80 dark:bg-dark-background/80 backdrop-blur-md transition-colors duration-200`}
            >
                <header
                    className="relative h-16 mx-auto border-b duration-200"
                    // className={`bg-background/80 dark:bg-dark-background/80 relative h-16 mx-auto border-b  backdrop-blur-md transition-colors duration-200`}
                >
                    <MaxWidthWrapper>
                        <nav className="text-sm flex items-center justify-between w-full h-full">
                            <div className="flex-1 basis-0 h-full flex items-center">
                                <Logo />
                            </div>

                            <div className="flex items-center gap-4 flex-1 basis-0 justify-end">
                                {user ? (
                                    <Button
                                        className="hidden sm:inline-flex"
                                        size="sm"
                                        onClick={() =>
                                            router.push("/configure/upload")
                                        }
                                        icon={FaArrowRight}
                                        iconPosition="right"
                                    >
                                        Create Case{" "}
                                    </Button>
                                ) : (
                                    <Button
                                        className="hidden sm:inline-flex"
                                        size="sm"
                                        onClick={() => router.push("/sign-in")}
                                        icon={FaArrowRight}
                                        iconPosition="right"
                                    >
                                        Sign in{" "}
                                    </Button>
                                )}
                                <UserDropdown user={user} />
                            </div>
                        </nav>
                    </MaxWidthWrapper>
                </header>
            </div>
        </div>
    );
};

export default Navbar;
