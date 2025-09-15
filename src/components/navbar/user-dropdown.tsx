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
    const MY_ACCOUNT_URL = [
        { label: "Account", href: "/account" },
        { label: "Orders", href: "/account/orders" },
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
                    {MY_ACCOUNT_URL.map((item) => {
                        return (
                            <DropdownMenuItem key={item.href}>
                                <Link href={item.href}>{item.label}</Link>
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
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
