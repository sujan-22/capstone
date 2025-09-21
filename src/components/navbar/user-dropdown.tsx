import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { useSignOut } from "@/hooks/use-sign-out";
import Link from "next/link";
import { FaUserAlt } from "react-icons/fa";
import { IUser } from "../../../auth-client";
import { useRouter } from "next/navigation";

export function UserDropdown({ user }: { user: IUser | null | undefined }) {
    const router = useRouter();
    const MY_ACCOUNT_LINKS = [
        { label: "Account", href: "/account" },
        { label: "Profile", href: "/account/profile" },
        { label: "Orders", href: "/account/orders" },
    ];

    const USER_MENU_LINKS = [
        { label: "Image Gallery", href: "/image-gallery" },
        { label: "Featured Designs", href: "/featured-designs" },
    ];

    const ADMIN_DASHBOARD_LINKS = [
        { label: "Admin Dashboard", href: "/admin-dashboard" },
    ];

    const { signOut } = useSignOut();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size={"icon"} className="rounded-full">
                    <FaUserAlt className="w-5 h-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuGroup>
                    {MY_ACCOUNT_LINKS.map((item) => {
                        return (
                            <DropdownMenuItem key={item.href}>
                                <Link href={item.href}>{item.label}</Link>
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                <DropdownMenuLabel className="sm:hidden">
                    Actions
                </DropdownMenuLabel>
                <DropdownMenuItem className="sm:hidden">
                    <Link href="/configure/upload">Create Case</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="sm:hidden" />

                <DropdownMenuLabel>Explore</DropdownMenuLabel>
                <DropdownMenuGroup>
                    {USER_MENU_LINKS.map((item) => {
                        return (
                            <DropdownMenuItem key={item.href}>
                                <Link href={item.href}>{item.label}</Link>
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                {user?.role === "admin" && (
                    <>
                        <DropdownMenuLabel>Admin</DropdownMenuLabel>
                        <DropdownMenuGroup>
                            {ADMIN_DASHBOARD_LINKS.map((item) => {
                                return (
                                    <DropdownMenuItem key={item.href}>
                                        <Link href={item.href}>
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                    </>
                )}
                <DropdownMenuItem
                    className="hover:cursor-pointer"
                    onClick={async () => {
                        if (user) {
                            await signOut();
                        } else {
                            router.push("/sign-in");
                        }
                    }}
                >
                    {user ? `Sign out` : `Sign in`}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
