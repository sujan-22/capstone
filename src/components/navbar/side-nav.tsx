"use client";

import Link from "next/link";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "../ui/sheet";
import { useRouter } from "next/navigation";
import { authClient, IUser } from "../../../auth-client";
import { Italiana } from "next/font/google";
import { RxHamburgerMenu } from "react-icons/rx";

interface SideMenuProps {
    user: IUser | null | undefined;
}

const italiana = Italiana({
    subsets: ["latin"],
    weight: "400",
});

const SideMenu = ({ user }: SideMenuProps) => {
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/");
                        router.refresh();
                    },
                },
            });
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const SideMenuItems = [
        { label: "Home", href: "/" },
        { label: "Create Case", href: "/create-case/upload" },
        { label: "Account", href: "/account" },
        { label: "Featured Designs", href: "/featured-designs" },
        { label: "Image Gallery", href: "/image-gallery" },
        { label: "Account", href: "/account" },
        ...(user?.role === "admin"
            ? [{ label: "Admin Dashboard", href: "/dashboard" }]
            : []),
        ...(user
            ? [{ label: "Sign out", action: handleSignOut }]
            : [{ label: "Sign In", href: "/sign-in" }]),
    ];

    return (
        <Sheet>
            <SheetTrigger className="group flex items-center hover:text-muted-foreground">
                <div className="rounded-full hidden max-[950px]:inline-block">
                    <RxHamburgerMenu className="w-5 h-5" />
                </div>
            </SheetTrigger>
            <SheetContent
                side={"right"}
                className="flex w-full flex-col sm:max-w-sm z-[1000000] h-full"
            >
                <SheetTitle className="sr-only">Main menu</SheetTitle>
                <div className="flex flex-col h-full justify-between p-2">
                    <div className="flex flex-col justify-center flex-grow">
                        <ul className="flex flex-col items-end gap-3">
                            {SideMenuItems.map((item, index) => (
                                <li key={index}>
                                    {item.href ? (
                                        <SheetClose asChild>
                                            <Link
                                                href={item.href}
                                                className="text-lg font-medium hover:text-muted-foreground"
                                            >
                                                {item.label}
                                            </Link>
                                        </SheetClose>
                                    ) : (
                                        <SheetClose asChild>
                                            <button
                                                className="text-lg font-medium hover:text-muted-foreground"
                                                onClick={item.action}
                                            >
                                                {item.label}
                                            </button>
                                        </SheetClose>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-6 border-t pt-4">
                        <p className="text-sm flex items-center text-center">
                            <span>
                                © {new Date().getFullYear()}{" "}
                                <span
                                    className={`${italiana.className} text-md tracking-wide`}
                                >
                                    DESIGNMYCASE
                                </span>
                                , Inc. All rights reserved.
                            </span>
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default SideMenu;
