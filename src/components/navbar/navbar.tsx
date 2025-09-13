"use client";

import { ISession, IUser } from "../../../auth-client";
import MaxWidthWrapper from "../utilities/max-width-wrapper";
import Link from "next/link";
import Logo from "../utilities/logo";
import { Button } from "../ui/button";
import { FaArrowRightLong } from "react-icons/fa6";
import SideMenu from "./side-nav";
import { UserDropdown } from "./user-dropdown";

const Navbar = ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    session,
    user,
}: {
    session: ISession | null;
    user: IUser | null | undefined;
}) => {
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

                            <div className="max-[950px]:hidden flex items-center gap-6">
                                <Link
                                    className="hover:underline underline-offset-4"
                                    href="/admin-dashboard"
                                >
                                    Admin Dashboard
                                </Link>
                                <Link
                                    className="hover:underline underline-offset-4"
                                    href="/image-gallery"
                                >
                                    Image Gallery
                                </Link>
                                <Link
                                    className="hover:underline underline-offset-4"
                                    href="/featured-designs"
                                >
                                    Featured Designs
                                </Link>
                            </div>

                            <div className="flex items-center gap-4 flex-1 basis-0 justify-end">
                                <Button
                                    className="hidden sm:inline-flex"
                                    size="sm"
                                >
                                    Create Case{" "}
                                    <FaArrowRightLong className="ml-1" />
                                </Button>
                                <UserDropdown user={user} />
                                <SideMenu user={user} />
                            </div>
                        </nav>
                    </MaxWidthWrapper>
                </header>
            </div>
        </div>
    );
};

export default Navbar;
