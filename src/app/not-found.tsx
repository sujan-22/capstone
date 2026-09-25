import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Logo from "@/components/utilities/logo";
import ColorBar from "@/components/print/color-bar";
import RegistrationMark from "@/components/print/registration-mark";
import CropMarks from "@/components/print/crop-marks";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
    title: "Page not found",
};

// Three process inks, out of register. Multiplied together they make black,
// so hovering pulls the plates into line and the misprint corrects itself.
const PLATES = [
    { color: "var(--process-c)", offset: "-translate-x-[0.05em] translate-y-[0.02em]" },
    { color: "var(--process-m)", offset: "translate-x-[0.04em] -translate-y-[0.03em]" },
    { color: "var(--process-y)", offset: "translate-x-[0.015em] translate-y-[0.045em]" },
];

export default function NotFound() {
    return (
        <div className="flex min-h-dvh flex-col">
            <header className="border-b border-rule">
                <div className="mx-auto flex h-16 w-full max-w-[1360px] items-center justify-between px-4 sm:px-6 lg:px-10">
                    <Logo />
                    <Link
                        href="/"
                        className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
                    >
                        Back to the store
                    </Link>
                </div>
            </header>

            <main
                id="main"
                className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col justify-center px-4 py-16 sm:px-6 lg:px-10"
            >
                <div className="grid items-center gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <div
                            aria-hidden
                            className="group relative inline-block cursor-default select-none text-[clamp(8rem,26vw,20rem)] leading-[0.8] font-extrabold tracking-[-0.06em] wdth-expanded"
                        >
                            {PLATES.map((plate, i) => (
                                <span
                                    key={i}
                                    className={`${i === 0 ? "relative" : "absolute inset-0"} block mix-blend-multiply transition-transform duration-700 ease-out-expo group-hover:translate-x-0 group-hover:translate-y-0 ${plate.offset}`}
                                    style={{ color: plate.color }}
                                >
                                    404
                                </span>
                            ))}
                            <CropMarks gap={14} length={22} />
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <p className="type-label flex items-center gap-2 text-ink-soft">
                            <RegistrationMark size={13} />
                            Error 404 · page not found
                        </p>
                        <h1 className="type-display mt-5">Misprint.</h1>
                        <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
                            This page didn&rsquo;t make it off the press. It may
                            have moved, or the link might be out of date.
                        </p>
                        <div className="mt-9 flex flex-wrap gap-3">
                            <Link
                                href="/"
                                className={buttonVariants({ size: "lg" })}
                            >
                                Back to the store
                                <ArrowRight
                                    aria-hidden
                                    className="size-4 transition-transform duration-300 ease-out-expo group-hover/button:translate-x-0.5"
                                />
                            </Link>
                            <Link
                                href="/gallery-images"
                                className={buttonVariants({
                                    variant: "outline",
                                    size: "lg",
                                })}
                            >
                                Browse the gallery
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-rule">
                <div className="mx-auto flex h-14 w-full max-w-[1360px] items-center justify-between px-4 sm:px-6 lg:px-10">
                    <span className="type-label text-ink-soft">
                        DesignMyCase
                    </span>
                    <ColorBar size={8} />
                </div>
            </footer>
        </div>
    );
}
