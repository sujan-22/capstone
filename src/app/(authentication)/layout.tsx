import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/utilities/logo";
import AuthShowcase from "./components/auth-showcase";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:px-14">
                <header className="flex items-center justify-between gap-4">
                    <Logo />
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-ink-soft transition-colors hover:text-ink"
                    >
                        <ArrowLeft aria-hidden className="size-4" />
                        <span className="sm:hidden">Store</span>
                        <span className="hidden sm:inline">Back to the store</span>
                    </Link>
                </header>

                <main
                    id="main"
                    className="flex flex-1 items-center justify-center py-12"
                >
                    <div className="w-full max-w-[400px]">{children}</div>
                </main>

                <footer className="type-label flex justify-between gap-4 text-ink-soft">
                    <span>DesignMyCase</span>
                    <span>Custom cases, printed to order</span>
                </footer>
            </div>

            <AuthShowcase />
        </div>
    );
}
