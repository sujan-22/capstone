import { buttonVariants } from "@/components/ui/button";
import CustomImage from "@/components/utilities/custom-image";
import Phone from "@/components/utilities/phone";
import Link from "next/link";
import { ArrowRight, Check, Star } from "lucide-react";
import { Icons } from "@/components/utilities/icons";
import { FaUserAlt } from "react-icons/fa";

export default function Home() {
    return (
        <div>
            <section>
                <div className="lg:grid lg:grid-cols-3 sm:pb-32 lg:gap-x-0 xl:gap-x-8 lg:pt-24 xl:pt-20 lg:pb-52">
                    <div className=" col-span-2 lg:px-0 lg:pt-4">
                        <div className="relative mx-auto text-center lg:text-left flex flex-col items-center lg:items-start">
                            <h1
                                className={`relative w-fit tracking-tight text-balance font-bold !leading-tight text-gray-900 text-5xl md:text-6xl lg:text-7xl`}
                            >
                                Your Image on a{" "}
                                <span className="bg-blue-600 px-2 text-white">
                                    Custom
                                </span>{" "}
                                Phone Case
                            </h1>
                            <p className=" mt-8 text-lg lg:pr-10 max-w-prose text-center lg:text-left text-balance md:text-wrap">
                                Capture your favourite memories with your own,{" "}
                                <span className=" font-semibold">
                                    one-of-one
                                </span>{" "}
                                phone case. CaseRobo allows you to protect your
                                memories, not just your phone case.
                            </p>
                            <ul className="mt-8 space-y-2 text-left font-medium flex flex-col items-center sm:items-start">
                                <div className="space-y-2">
                                    <li className="flex gap-1.5 items-center text-left">
                                        <Check className="h-5 w-5 shrink-0 text-blue-600" />
                                        High-quality, durable material
                                    </li>
                                    <li className="flex gap-1.5 items-center text-left">
                                        <Check className="h-5 w-5 shrink-0 text-blue-600" />
                                        Support for all major phone models
                                    </li>
                                    <li className="flex gap-1.5 items-center text-left">
                                        <Check className="h-5 w-5 shrink-0 text-blue-600" />
                                        Easy image upload and customization
                                    </li>
                                </div>
                            </ul>
                            <div className=" mt-12 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                                <div className="flex -space-x-4"></div>
                                <div className="flex flex-col justify-between items-center sm:items-start ">
                                    {/* <div className="flex gap-0.5">
                                        <Star className=" h-4 w-4 text-blue-600 fill-blue-600" />
                                        <Star className=" h-4 w-4 text-blue-600 fill-blue-600" />
                                        <Star className=" h-4 w-4 text-blue-600 fill-blue-600" />
                                        <Star className=" h-4 w-4 text-blue-600 fill-blue-600" />
                                        <Star className=" h-4 w-4 text-blue-600 fill-blue-600" />
                                    </div> */}
                                    {/* <p>
                                        <span className="font-semibold">
                                            2.234
                                        </span>{" "}
                                        happy customers
                                    </p> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-full lg:col-span-1 w-full flex justify-center px-8 sm:px-16 md:px-0 mt-32 lg:mx-0 lg:mt-20 h-fit">
                        <div className="relative md:max-w-xl">
                            {/*  eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/assets/homepage/your-image.png"
                                alt="Your image on a phone case"
                                className="absolute w-40 lg:w-52 right-20 -top-30 -rotate-12 select-none block"
                            />
                            {/*  eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/assets/homepage/line.png"
                                alt="Line pointing to phone case"
                                className="absolute w-20 -left-6 -bottom-6 select-none"
                            />
                            <Phone
                                className="w-64"
                                imgSrc="/assets/homepage/anime.png"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* user reviews section */}
            <section className=" bg-slate-100 py-16">
                <div className="flex flex-col items-center gap-16 sm:gap-32">
                    <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6">
                        <h2 className="order-1 tracking-tight text-center text-balance !leading-tight font-bold text-5xl md:text-6xl text-gray-900">
                            Explore our{" "}
                            <span className="relative px-2">
                                featured{" "}
                                <Icons.underlineDashed className="hidden sm:block pointer-events-none absolute inset-x-0 -bottom-6 text-blue-600" />
                            </span>{" "}
                            designs
                        </h2>
                    </div>
                    <div className="mx-auto grid max-w-2xl grid-cols-1 px-4 lg:mx-0 lg:max-w-none lg:grid-cols-3 gap-y-16">
                        <Phone
                            className="w-64"
                            imgSrc="/assets/homepage/feat1.jpg"
                        />
                        <Phone
                            className="w-64"
                            imgSrc="/assets/homepage/feat2.jpg"
                        />
                        <Phone
                            className="w-64"
                            imgSrc="/assets/homepage/feat3.jpg"
                        />
                    </div>
                </div>
            </section>

            <div className=" py-24">
                <div className=" mb-12 px-6 lg:px-8">
                    <div className=" mx-auto max-w-2xl sm:text-center">
                        <h2 className="order-1 mt-2 tracking-tight text-center text-balance !leading-tight font-bold text-5xl md:text-6xl text-gray-900">
                            Upload your picture and get{" "}
                            <span className="relative px-2 bg-blue-600 text-white">
                                your own phone case
                            </span>{" "}
                            now
                        </h2>
                    </div>
                </div>

                <div className="mx-auto max-w-6xl px-6 lg:px-8">
                    <div className="relative flex flex-col items-center md:grid grid-cols-2 gap-40">
                        <CustomImage
                            src="/arrow.png"
                            alt=""
                            className="absolute top-[25rem] md:top-1/2 -translate-y-1/2 z-10 left-1/2 -translate-x-1/2 rotate-90 md:rotate-0"
                        />
                        <div className="relative h-80 md:h-full w-full md:justify-self-end max-w-sm rounded-xl bg-gray-900/5 ring-inset ring-gray-900/10 lg:rounded-2xl">
                            <CustomImage
                                src="/horse.jpg"
                                alt=""
                                className="rounded-md object-cover bg-white shadow-2xl ring-1 ring-gray-900/10 h-full w-full"
                            />
                        </div>
                        <Phone
                            className=" w-60"
                            imgSrc="/assets/homepage/demo-case-1.png"
                        />
                    </div>
                </div>
                <ul className=" mx-auto mt-12 max-w-prose sm:text-lg space-y-2 w-fit">
                    <li className=" w-fit">
                        <Check className=" h-5 w-5 text-blue-600 inline mr-1.5 " />
                        High-quality silicone material
                    </li>
                    <li className=" w-fit">
                        <Check className=" h-5 w-5 text-blue-600 inline mr-1.5 " />
                        Scratch and fingerprint resistant coating
                    </li>
                    <li className=" w-fit">
                        <Check className=" h-5 w-5 text-blue-600 inline mr-1.5 " />
                        Wireless charging compatible
                    </li>
                    <li className=" w-fit">
                        <Check className=" h-5 w-5 text-blue-600 inline mr-1.5 " />
                        5 year print warranty
                    </li>
                    <div className=" flex justify-center">
                        <Link
                            className={buttonVariants({
                                size: "lg",
                                className: "mx-auto mt-8",
                            })}
                            href="/configure/upload"
                        >
                            Create your case now{" "}
                            <ArrowRight className=" h-4 w-4 ml-1.5" />
                        </Link>
                    </div>
                </ul>
            </div>
        </div>
    );
}
