import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import AdminSubnav from "@/components/utilities/dashboard-tabs";
import { BrandMark } from "@/components/utilities/logo";
import ColorBar from "@/components/print/color-bar";
import { getServerSideSession } from "@/hooks/use-session";
import AdminAccount from "./components/admin-account";

function Wordmark() {
    return (
        <span className="text-[1.15rem] leading-none font-extrabold tracking-[-0.045em] wdth-expanded">
            design<span className="text-cobalt-light">my</span>case
        </span>
    );
}

export default async function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = await getServerSideSession();
    if (!user) notFound();

    return (
        <div className="min-h-dvh lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-paper focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
            >
                Skip to content
            </a>

            {/* Desktop: a fixed ink sidebar. */}
            <aside className="sticky top-0 hidden h-dvh flex-col bg-ink text-paper lg:flex">
                <div className="px-6 pb-8 pt-6">
                    <Link
                        href="/admin-dashboard/overview"
                        className="inline-flex items-center gap-2 rounded-sm"
                        aria-label="Press room overview"
                    >
                        <BrandMark className="text-paper" />
                        <Wordmark />
                    </Link>
                    <p className="type-label mt-4 text-paper/60">
                        Press room · Admin
                    </p>
                </div>

                <AdminSubnav className="px-3" />

                <div className="mt-auto space-y-5 px-3 pb-5">
                    <Link
                        href="/"
                        className="flex items-center justify-between rounded-lg border border-paper/15 px-3 py-2.5 text-sm font-medium text-paper/80 transition-colors hover:border-paper/40 hover:text-paper"
                    >
                        View storefront
                        <ArrowUpRight aria-hidden className="size-4" />
                    </Link>
                    <div className="border-t border-paper/10 px-1 pt-5">
                        <AdminAccount user={user} />
                    </div>
                    <ColorBar size={8} className="px-1" />
                </div>
            </aside>

            {/* Mobile: an ink bar with the sections underneath. */}
            <header className="sticky top-0 z-40 bg-ink text-paper lg:hidden">
                <div className="flex h-14 items-center justify-between px-4">
                    <Link
                        href="/admin-dashboard/overview"
                        className="inline-flex items-center gap-2"
                        aria-label="Press room overview"
                    >
                        <BrandMark size={22} className="text-paper" />
                        <Wordmark />
                    </Link>
                    <div className="flex items-center gap-1">
                        <Link
                            href="/"
                            className="flex size-9 items-center justify-center rounded-lg text-paper/70 hover:text-paper"
                            title="View storefront"
                        >
                            <ArrowUpRight aria-hidden className="size-4" />
                            <span className="sr-only">View storefront</span>
                        </Link>
                        <AdminAccount user={user} compact />
                    </div>
                </div>
                <AdminSubnav orientation="horizontal" className="px-3 pb-3" />
            </header>

            <main id="main" className="isolate min-w-0">
                <div className="mx-auto w-full max-w-[1320px] px-4 pb-20 pt-8 sm:px-6 lg:px-10 lg:pt-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
