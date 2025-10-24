import React from "react";
import CustomImage from "./custom-image";
import Phone from "./phone";
import { Check } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { FaArrowRightLong } from "react-icons/fa6";

const CalltoActionReviewDesign = () => {
    return (
        <div className="py-16">
            <div className="flex flex-col items-center gap-16 sm:gap-32">
                {/* Heading */}
                <div className="mb-12 px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl sm:text-center">
                        <h2 className="mt-2 tracking-tight text-center text-balance !leading-tight font-bold text-5xl md:text-6xl text-gray-900">
                            Turn your{" "}
                            <span className="relative px-2 bg-blue-600 text-white">
                                favorite photo
                            </span>
                            into a one-of-a-kind phone case
                        </h2>
                        <p className="mt-6 text-gray-600 text-lg max-w-prose mx-auto">
                            Upload any image - a memory, a design, or your
                            artwork - and we’ll craft a personalized phone case
                            that’s made just for you.
                        </p>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 sm:gap-12 lg:gap-20">
                        {/* Left image (3:4) */}
                        <div className="w-full max-w-[18rem] sm:max-w-[22rem] md:max-w-[24rem]">
                            <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-2xl ring-1 ring-gray-900/10">
                                <CustomImage
                                    src="/assets/homepage/gallery_16.jpg"
                                    alt="uploaded preview"
                                    className="h-full w-full object-cover bg-white"
                                />
                            </div>
                        </div>

                        {/* Arrow (inline, responsive size & rotation) */}
                        <CustomImage
                            src="/assets/homepage/arrow.png"
                            alt="arrow connecting preview"
                            className="w-12 sm:w-16 md:w-20 rotate-90 md:rotate-0 opacity-80"
                        />

                        {/* Phone mockup */}
                        <div className="w-full max-w-[12rem] sm:max-w-[14rem] md:max-w-[16rem] flex justify-center md:justify-start">
                            <Phone
                                className="w-full"
                                imgSrc="/assets/homepage/gallery_16.jpg"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Features */}
            <ul className="mx-auto mt-12 max-w-prose space-y-2 w-fit text-gray-800">
                <li className="w-fit">
                    <Check className="h-5 w-5 text-blue-600 inline mr-1.5" />
                    Premium flexible silicone material
                </li>
                <li className="w-fit">
                    <Check className="h-5 w-5 text-blue-600 inline mr-1.5" />
                    Scratch-resistant and fingerprint-proof finish
                </li>
                <li className="w-fit">
                    <Check className="h-5 w-5 text-blue-600 inline mr-1.5" />
                    Wireless charging compatible
                </li>
                <li className="w-fit">
                    <Check className="h-5 w-5 text-blue-600 inline mr-1.5" />
                    5-year print durability guarantee
                </li>
                <div className="flex justify-center">
                    <Link
                        className={buttonVariants({
                            size: "lg",
                            className: "mx-auto mt-8",
                        })}
                        href="/configure/upload"
                    >
                        Start designing your case{" "}
                        <FaArrowRightLong className="ml-2" />
                    </Link>
                </div>
            </ul>
        </div>
    );
};

export default CalltoActionReviewDesign;
