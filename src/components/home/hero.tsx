import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MaxWidthWrapper from "@/components/utilities/max-width-wrapper";
import RegistrationMark from "@/components/print/registration-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import HeroPress from "./hero-press";

const FACTS = [
    { label: "Shipping", value: "Free, FedEx" },
    { label: "Warranty", value: "5-year print" },
    { label: "Phones", value: "All major models" },
];

export default function Hero({ signedIn }: { signedIn: boolean }) {
    const startHref = signedIn
        ? "/configure/upload"
        : `/sign-in?redirectTo=${encodeURIComponent("/configure/upload")}`;

    return (
        <section className="relative overflow-hidden">
            <MaxWidthWrapper className="grid gap-16 pb-20 pt-10 sm:pt-14 lg:grid-cols-12 lg:gap-8 lg:pb-28 lg:pt-16">
                <div className="flex flex-col justify-center lg:col-span-7">
                    <p className="type-label flex items-center gap-2.5 text-ink-soft">
                        <RegistrationMark size={14} />
                        Custom phone cases · Printed to order
                    </p>

                    <h1 className="mt-8">
                        <span className="type-mega block">One</span>
                        <span className="type-mega block">
                            of one<span className="text-cobalt">.</span>
                        </span>
                        <span className="mt-8 block max-w-[30ch] text-[1.375rem] leading-snug font-medium tracking-[-0.02em] sm:text-2xl">
                            Your photo, printed on a case made for your phone
                            and nobody else&rsquo;s.
                        </span>
                    </h1>

                    <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-ink-soft sm:text-lg">
                        Upload an image or pick one from our gallery, place it
                        on a live case, and choose your model, material and
                        finish while the price updates.
                    </p>

                    <div className="mt-9 flex flex-wrap items-center gap-3">
                        <Link
                            href={startHref}
                            className={buttonVariants({ size: "xl" })}
                        >
                            Start with your photo
                            <ArrowRight
                                aria-hidden
                                className="size-[18px] transition-transform duration-300 ease-out-expo group-hover/button:translate-x-1"
                            />
                        </Link>
                        <Link
                            href="/gallery-images"
                            className={cn(
                                buttonVariants({ variant: "outline", size: "xl" })
                            )}
                        >
                            Browse the gallery
                        </Link>
                    </div>

                    <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-rule pt-5">
                        {FACTS.map((fact) => (
                            <div key={fact.label}>
                                <dt className="type-label text-ink-soft">
                                    {fact.label}
                                </dt>
                                <dd className="mt-1.5 text-sm font-semibold sm:text-[0.9375rem]">
                                    {fact.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <div className="flex items-center lg:col-span-5">
                    <div className="w-full">
                        <HeroPress />
                    </div>
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
