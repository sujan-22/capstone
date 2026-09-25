import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MaxWidthWrapper from "./max-width-wrapper";
import SmallLogo from "./small-logo";
import ColorBar from "../print/color-bar";
import RegistrationMark from "../print/registration-mark";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

const COLUMNS = [
    {
        title: "Make",
        links: [
            { label: "Start a case", href: "/configure/upload" },
            { label: "Image gallery", href: "/gallery-images" },
            { label: "Featured designs", href: "/featured-designs" },
        ],
    },
    {
        title: "Your account",
        links: [
            { label: "Overview", href: "/account" },
            { label: "Orders", href: "/account/orders" },
            { label: "Favourites", href: "/account/favorite-designs" },
            { label: "Unfinished designs", href: "/account/unfinished-designs" },
        ],
    },
];

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative overflow-hidden bg-ink text-paper">
            <MaxWidthWrapper className="pt-16 sm:pt-20">
                <div className="grid gap-12 border-b border-paper/15 pb-14 lg:grid-cols-12">
                    <div className="lg:col-span-6">
                        <p className="type-label text-paper/60">
                            Printed to order
                        </p>
                        <p className="type-display mt-5 max-w-[12ch]">
                            Got a photo in mind?
                        </p>
                        <Link
                            href="/configure/upload"
                            className={cn(
                                buttonVariants({ variant: "paper", size: "lg" }),
                                "mt-8"
                            )}
                        >
                            Start your case
                            <ArrowRight
                                aria-hidden
                                className="size-4 transition-transform duration-300 ease-out-expo group-hover/button:translate-x-0.5"
                            />
                        </Link>
                    </div>

                    <nav
                        aria-label="Footer"
                        className="grid grid-cols-2 gap-8 lg:col-span-5 lg:col-start-8"
                    >
                        {COLUMNS.map((col) => (
                            <div key={col.title}>
                                <p className="type-label text-paper/60">
                                    {col.title}
                                </p>
                                <ul className="mt-5 space-y-3">
                                    {col.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="text-[0.9375rem] text-paper/85 transition-colors hover:text-paper"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="flex flex-col gap-4 py-7 text-sm text-paper/70 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        &copy; {currentYear}{" "}
                        <SmallLogo className="text-paper [&>span]:text-cobalt-light" />
                        . All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="type-label text-paper/60">
                            Prices in CAD · Free shipping
                        </span>
                        <ColorBar size={8} />
                    </div>
                </div>
            </MaxWidthWrapper>

            <div
                aria-hidden
                className="relative select-none border-t border-paper/10"
            >
                <RegistrationMark
                    size={18}
                    className="absolute left-4 top-4 text-paper/40 sm:left-6 lg:left-10"
                />
                <RegistrationMark
                    size={18}
                    className="absolute right-4 top-4 text-paper/40 sm:right-6 lg:right-10"
                />
                <p className="translate-y-[18%] whitespace-nowrap pt-8 text-center text-[11.2vw] leading-[0.8] font-extrabold tracking-[-0.06em] text-paper/[0.07] wdth-expanded">
                    designmycase
                </p>
            </div>
        </footer>
    );
};

export default Footer;
