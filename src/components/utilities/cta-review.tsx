import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Phone from "./phone";
import MaxWidthWrapper from "./max-width-wrapper";
import CropMarks from "../print/crop-marks";
import { buttonVariants } from "../ui/button";

const SOURCE = "/assets/homepage/gallery_16.jpg";

const SPECS = [
    ["Material", "Premium flexible silicone material"],
    ["Surface", "Scratch-resistant and fingerprint-proof finish"],
    ["Charging", "Wireless charging compatible"],
    ["Print", "5-year print durability guarantee"],
    ["Shipping", "Free with FedEx, up to 3 working days"],
];

const CalltoActionReviewDesign = () => {
    return (
        <section className="border-t border-rule py-20 sm:py-28">
            <MaxWidthWrapper className="grid items-center gap-16 lg:grid-cols-12 lg:gap-8">
                <div className="relative order-2 lg:order-1 lg:col-span-6">
                    <div className="relative mx-auto aspect-[10/9] w-full max-w-[560px]">
                        <figure className="absolute left-[2%] top-[4%] w-[56%] -rotate-3 bg-paper-raised p-3 shadow-[0_30px_60px_-30px_rgb(20_20_20/0.5)]">
                            <div className="relative aspect-[3/4]">
                                <Image
                                    src={SOURCE}
                                    alt="The original photo: a jellyfish drifting in blue water"
                                    fill
                                    sizes="(max-width: 1024px) 55vw, 300px"
                                    className="object-cover"
                                />
                                <CropMarks gap={6} length={10} />
                            </div>
                            <figcaption className="mt-3 flex justify-between font-mono text-[0.625rem] uppercase tracking-[0.1em] text-ink-soft">
                                <span>Your photo</span>
                                <span>2520 × 3360</span>
                            </figcaption>
                        </figure>

                        <svg
                            aria-hidden
                            viewBox="0 0 160 90"
                            className="absolute left-[50%] top-[8%] w-[28%] text-cobalt"
                            fill="none"
                        >
                            <path
                                d="M4 70 C 40 6, 110 0, 150 42"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="5 6"
                                strokeLinecap="round"
                            />
                            <path
                                d="M136 40 L151 43 L147 28"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        <div className="absolute bottom-0 right-[4%] w-[34%] rotate-[5deg]">
                            <Phone
                                imgSrc={SOURCE}
                                altText="The same photo printed on a phone case"
                                sizes="(max-width: 1024px) 34vw, 200px"
                                className="drop-shadow-[0_30px_30px_rgb(20_20_20/0.35)]"
                            />
                            <p className="type-label mt-5 text-center text-ink-soft">
                                Printed · 1 of 1
                            </p>
                        </div>
                    </div>
                </div>

                <div className="order-1 lg:order-2 lg:col-span-5 lg:col-start-8">
                    <p className="type-label text-ink-soft">From photo to case</p>
                    <h2 className="type-display mt-5">
                        Turn your favourite photo into a one-of-a-kind case.
                    </h2>
                    <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
                        Upload any image, a memory, a design or your own
                        artwork, and we&rsquo;ll print a personalised case
                        that&rsquo;s made just for you.
                    </p>

                    <dl className="mt-10 border-t border-ink">
                        {SPECS.map(([label, value]) => (
                            <div
                                key={label}
                                className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-rule py-3.5"
                            >
                                <dt className="type-label pt-1 text-ink-soft">
                                    {label}
                                </dt>
                                <dd className="font-medium">{value}</dd>
                            </div>
                        ))}
                    </dl>

                    <Link
                        href="/configure/upload"
                        className={buttonVariants({
                            size: "lg",
                            className: "mt-10",
                        })}
                    >
                        Start designing your case
                        <ArrowRight
                            aria-hidden
                            className="size-4 transition-transform duration-300 ease-out-expo group-hover/button:translate-x-1"
                        />
                    </Link>
                </div>
            </MaxWidthWrapper>
        </section>
    );
};

export default CalltoActionReviewDesign;
