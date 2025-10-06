import Phone from "@/components/utilities/phone";
import { Check } from "lucide-react";
import RenderFeaturedDesigns from "@/components/case-design/render-featured-designs";
import SmallLogo from "@/components/utilities/small-logo";
import Reviews from "@/components/utilities/reviews";
export default function Home() {
    return (
        <div>
            <section>
                <div className="lg:grid lg:grid-cols-3 sm:pb-32 lg:gap-x-0 xl:gap-x-8 py-28">
                    <div className=" col-span-2 lg:px-0 lg:pt-4">
                        <div className="relative mx-auto text-center lg:text-left flex flex-col items-center lg:items-start">
                            <h1
                                className={`relative w-fit tracking-tight text-balance font-bold !leading-tight text-5xl md:text-6xl lg:text-7xl`}
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
                                phone case. <SmallLogo /> allows you to protect
                                your memories, not just your phone case.
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
                        </div>
                    </div>
                    <div className="col-span-full lg:col-span-1 w-full flex justify-center px-8 sm:px-16 md:px-0 mt-32 lg:mx-0 lg:mt-20 h-fit">
                        <div className="relative md:max-w-xl">
                            {/*  eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/assets/homepage/your-image.png"
                                alt="Your image on a phone case"
                                className="absolute w-40 pointer-events-none lg:w-52 right-20 -top-30 -rotate-12 select-none block"
                            />
                            {/*  eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/assets/homepage/line.png"
                                alt="Line pointing to phone case"
                                className="absolute w-20 pointer-events-none -left-6 -bottom-6 select-none"
                            />
                            <Phone
                                className="w-64"
                                imgSrc="/assets/homepage/anime.png"
                            />
                        </div>
                    </div>
                </div>
            </section>
            {/* featured designs*/}
            <section>
                <RenderFeaturedDesigns />
            </section>

            {/* animated landing page */}
            <div className=" py-16">
                <Reviews />
            </div>
        </div>
    );
}
