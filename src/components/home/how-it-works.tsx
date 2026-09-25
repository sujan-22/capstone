import Image from "next/image";
import { MousePointer2 } from "lucide-react";
import MaxWidthWrapper from "@/components/utilities/max-width-wrapper";
import Phone from "@/components/utilities/phone";
import CropMarks from "@/components/print/crop-marks";

const SAMPLE = "/assets/homepage/gallery_16.jpg";

function UploadVisual() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex h-[68%] w-[62%] flex-col items-center justify-center gap-3 rounded-md border border-dashed border-ink/30 bg-paper-raised/60">
                <CropMarks gap={5} length={9} className="text-ink/50" />
                <div className="relative h-[46%] aspect-[3/4] -rotate-6 overflow-hidden rounded-[3px] shadow-[0_12px_24px_-12px_rgb(20_20_20/0.5)] ring-4 ring-white">
                    <Image
                        src={SAMPLE}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                    />
                </div>
                <div className="w-[72%]">
                    <div className="flex justify-between font-mono text-[0.625rem] text-ink-soft">
                        <span>IMG_0416.JPG</span>
                        <span>72%</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ink/10">
                        <div className="h-full w-[72%] bg-cobalt" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function PlaceVisual() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[27%]">
                <Phone imgSrc={SAMPLE} sizes="120px" />
                <div className="absolute -inset-x-[22%] -inset-y-[9%] border border-dashed border-cobalt">
                    {[
                        "-left-1 -top-1",
                        "-right-1 -top-1",
                        "-bottom-1 -left-1",
                        "-bottom-1 -right-1",
                    ].map((pos) => (
                        <span
                            key={pos}
                            className={`absolute size-2 border border-cobalt bg-white ${pos}`}
                        />
                    ))}
                    <MousePointer2
                        aria-hidden
                        className="absolute -bottom-5 -right-4 size-5 fill-ink text-white"
                    />
                </div>
            </div>
            <span className="absolute left-4 top-4 rounded-full bg-paper-raised px-2.5 py-1 font-mono text-[0.625rem] text-ink shadow-sm">
                Model · iPhone 15 Pro
            </span>
        </div>
    );
}

function ProofVisual() {
    const rows = [
        ["Matte material", "$14.99"],
        ["Textured finish", "$9.99"],
        ["Shipping", "Free"],
        ["Tax (13%)", "$3.25"],
    ];
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="perforated relative w-[64%] bg-paper-raised px-5 py-6 font-mono text-[0.625rem] text-ink shadow-[0_16px_32px_-16px_rgb(20_20_20/0.35)]">
                <p className="text-center tracking-[0.16em] text-ink-soft">
                    PROOF · 1 OF 1
                </p>
                <div className="mt-3 space-y-1.5 border-y border-dashed border-ink/25 py-3">
                    {rows.map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                            <span className="text-ink-soft">{k}</span>
                            <span>{v}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-2.5 flex justify-between text-[0.75rem] font-semibold">
                    <span>Total</span>
                    <span>CA$28.23</span>
                </div>
                <span className="absolute -right-3 top-1/2 -translate-y-1/2 rotate-[-14deg] rounded-[3px] border-2 border-cobalt px-2 py-1 text-[0.6875rem] font-bold tracking-[0.18em] text-cobalt">
                    APPROVED
                </span>
            </div>
        </div>
    );
}

const STEPS = [
    {
        n: "01",
        title: "Upload",
        body: "Drop in a PNG or JPG up to 10 MB, or start from an image in our gallery.",
        Visual: UploadVisual,
    },
    {
        n: "02",
        title: "Place",
        body: "Drag and scale it on a live case, then pick your model, colour, material and finish. The price updates as you go.",
        Visual: PlaceVisual,
    },
    {
        n: "03",
        title: "Proof & pay",
        body: "Check your proof and pay securely with Stripe. We print it and ship it to you free with FedEx.",
        Visual: ProofVisual,
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-20 sm:py-28">
            <MaxWidthWrapper>
                <div className="grid items-end gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <p className="type-label text-ink-soft">How it works</p>
                        <h2 className="type-display mt-5 max-w-[14ch]">
                            Camera roll to case in three steps.
                        </h2>
                    </div>
                    <p className="max-w-md text-lg leading-relaxed text-ink-soft lg:col-span-4 lg:col-start-9">
                        No design software and no templates to wrestle with. If
                        you can crop a photo, you can make a case.
                    </p>
                </div>

                <ol className="mt-14 grid border-t border-ink md:grid-cols-3">
                    {STEPS.map(({ n, title, body, Visual }) => (
                        <li
                            key={n}
                            className="border-b border-rule py-8 md:border-b-0 md:border-l md:px-7 md:first:border-l-0 md:first:pl-0 md:last:pr-0 lg:px-9"
                        >
                            <p className="type-label flex items-center justify-between text-ink-soft">
                                <span>Step {n}</span>
                                <span aria-hidden className="text-ink">
                                    {n}/03
                                </span>
                            </p>
                            <div
                                aria-hidden
                                className="cutting-mat relative mt-6 aspect-[4/3] overflow-hidden rounded-md"
                            >
                                <Visual />
                            </div>
                            <h3 className="type-title mt-8">{title}</h3>
                            <p className="mt-3 max-w-sm leading-relaxed text-ink-soft">
                                {body}
                            </p>
                        </li>
                    ))}
                </ol>
            </MaxWidthWrapper>
        </section>
    );
}
