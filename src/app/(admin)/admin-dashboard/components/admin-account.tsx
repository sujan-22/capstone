"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";
import { useSignOut } from "@/hooks/use-sign-out";
import { getInitials } from "@/lib/utils";
import { IUser } from "../../../../../auth-client";

/** The signed-in admin, with a way out. Sits at the foot of the sidebar. */
export default function AdminAccount({
    user,
    compact = false,
}: {
    user: IUser;
    compact?: boolean;
}) {
    const { signOut } = useSignOut();
    const name = user.name || user.username || "Admin";

    return (
        <div className="flex items-center gap-3">
            <span className="relative inline-flex size-9 shrink-0 overflow-hidden rounded-full bg-cobalt text-white ring-1 ring-paper/15">
                {user.image ? (
                    <Image
                        src={user.image}
                        alt=""
                        fill
                        sizes="36px"
                        referrerPolicy="no-referrer"
                        className="object-cover"
                    />
                ) : (
                    <span
                        aria-hidden
                        className="flex size-full items-center justify-center text-xs font-bold"
                    >
                        {getInitials(user)}
                    </span>
                )}
            </span>
            {compact ? null : (
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-paper">
                        {name}
                    </span>
                    <span className="block truncate text-xs text-paper/60">
                        {user.email}
                    </span>
                </span>
            )}
            <button
                type="button"
                onClick={() => signOut()}
                title="Sign out"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-paper/70 transition-colors hover:bg-paper/[0.08] hover:text-paper"
            >
                <LogOut aria-hidden className="size-4" />
                <span className="sr-only">Sign out</span>
            </button>
        </div>
    );
}
