import Phone from "@/components/utilities/phone";
import { Check } from "lucide-react";
import RenderFeaturedDesigns from "@/components/case-design/render-featured-designs";

export default function Home() {
    return (
        <div>
            <section>
                <div className="lg:grid lg:grid-cols-3 sm:pb-32 lg:gap-x-0 xl:gap-x-8 lg:pt-24 xl:pt-20 lg:pb-52">
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
            {/* featured designs*/}
            <RenderFeaturedDesigns />=
        </div>
    );
}
