"use client";

import React from "react";
import { ISession, IUser } from "../../../../../../auth-client";
import { Button } from "@/components/ui/button";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { useSignOut } from "@/hooks/use-sign-out";
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "../actions/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const QUICK_LINKS = [
    {
        title: "Start a new case",
        body: "Upload a photo and put it on a case.",
        href: "/configure/upload",
        primary: true,
    },
    {
        title: "Continue a design",
        body: "Pick up where you left off.",
        href: "/account/unfinished-designs",
    },
    {
        title: "Track your orders",
        body: "Status, tracking and receipts.",
        href: "/account/orders",
    },
    {
        title: "Browse featured designs",
        body: "Cases other customers have shared.",
        href: "/featured-designs",
    },
];

interface AccountOverviewProps {
    user: IUser;
    session: ISession;
}

const AccountOverview: React.FC<AccountOverviewProps> = ({ user, session }) => {
    const router = useRouter();
    const lastLogin = session?.createdAt;
    const { signOut } = useSignOut();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["get-user-info", user.id],
        queryFn: async () => await getUserInfo(),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
    });

    const stats = [
        { label: "Orders placed", value: data?.user?.totalOrders },
        { label: "Favourite designs", value: data?.user?.favoriteDesignsCount },
    ];

    return (
        <div className="space-y-12">
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex min-w-0 items-center gap-4">
                    <span className="relative inline-flex size-14 shrink-0 overflow-hidden rounded-full bg-cobalt text-white ring-1 ring-ink/10">
                        {user?.image ? (
                            <Image
                                src={user.image}
                                alt=""
                                fill
                                sizes="56px"
                                priority
                                referrerPolicy="no-referrer"
                                className="object-cover"
                            />
                        ) : (
                            <span
                                aria-hidden
                                className="flex size-full items-center justify-center text-base font-bold"
                            >
                                {getInitials(user)}
                            </span>
                        )}
                    </span>
                    <div className="min-w-0">
                        <h2 className="type-title">
                            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
                        </h2>
                        <p className="mt-2 truncate text-ink-soft">
                            {user.email} · Member since{" "}
                            {formatDate(user.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/account/orders")}
                    >
                        View orders
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={async () => user && (await signOut())}
                    >
                        Sign out
                    </Button>
                </div>
            </div>

            {!isLoading && (isError || !data?.success || !data.user) ? (
                <div className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-5 py-4">
                    <p className="text-sm">Failed to load account details.</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                        Retry
                    </Button>
                </div>
            ) : (
                <dl className="grid border-y border-ink sm:grid-cols-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="border-b border-rule py-6 last:border-b-0 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0"
                        >
                            <dt className="type-label text-ink-soft">{stat.label}</dt>
                            <dd className="mt-3 text-5xl leading-none font-extrabold tracking-[-0.05em] wdth-expanded">
                                {isLoading ? (
                                    <Skeleton className="h-12 w-16" />
                                ) : (
                                    stat.value ?? 0
                                )}
                            </dd>
                        </div>
                    ))}
                    <div className="py-6 sm:px-6">
                        <dt className="type-label text-ink-soft">Last signed in</dt>
                        <dd className="mt-3 text-xl font-semibold tracking-tight">
                            {formatDate(lastLogin)}
                        </dd>
                    </div>
                </dl>
            )}

            <div>
                <h3 className="type-label mb-4 text-ink-soft">Jump back in</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                    {QUICK_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "group flex items-center justify-between gap-4 rounded-md border p-5 transition-colors",
                                link.primary
                                    ? "border-cobalt bg-cobalt text-white hover:bg-cobalt-deep"
                                    : "border-rule bg-paper-raised hover:border-ink/40"
                            )}
                        >
                            <span>
                                <span className="type-heading block">{link.title}</span>
                                <span
                                    className={cn(
                                        "mt-1 block text-sm",
                                        link.primary ? "text-white/85" : "text-ink-soft"
                                    )}
                                >
                                    {link.body}
                                </span>
                            </span>
                            <ArrowRight
                                aria-hidden
                                className="size-5 shrink-0 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AccountOverview;
