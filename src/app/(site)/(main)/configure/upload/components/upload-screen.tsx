import Link from "next/link";
import { ArrowRight } from "lucide-react";
import UploadComponent from "./upload";

const TIPS = [
    "Use the original file. Screenshots and photos sent through chat apps are compressed and can print soft.",
    "Portrait photos fit a case best. You can scale and crop it on the next step.",
    "Keep faces and text clear of the top-left corner, where the camera cut-out sits.",
];

/** Step one of the configurator: the dropzone and advice for a sharp print. */
export default function UploadScreen({ userId }: { userId: string }) {
    return (
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
                <UploadComponent userId={userId} />
            </div>

            <aside className="flex flex-col lg:col-span-4">
                <p className="type-label text-ink-soft">Step 01</p>
                <h1 className="type-display mt-4 !text-[clamp(2.5rem,4.2vw,3.75rem)]">
                    Start with a photo.
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                    Choose the image you want on your case. You&rsquo;ll
                    position it and pick your model and finish next.
                </p>

                <h2 className="type-label mt-10 border-b border-ink pb-3 text-ink">
                    For a sharp print
                </h2>
                <ol className="text-[0.9375rem] leading-relaxed">
                    {TIPS.map((tip, i) => (
                        <li
                            key={tip}
                            className="grid grid-cols-[2rem_1fr] gap-2 border-b border-rule py-4"
                        >
                            <span className="type-label pt-1 text-ink-soft">
                                0{i + 1}
                            </span>
                            <span>{tip}</span>
                        </li>
                    ))}
                </ol>

                <div className="mt-8 rounded-md bg-ink p-6 text-paper lg:mt-auto">
                    <p className="type-label text-paper/60">
                        No photo to hand?
                    </p>
                    <p className="type-heading mt-3">
                        Start from one of our gallery images instead.
                    </p>
                    <Link
                        href="/gallery-images"
                        className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold underline decoration-paper/30 underline-offset-[6px] hover:decoration-paper"
                    >
                        Browse the gallery
                        <ArrowRight
                            aria-hidden
                            className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                        />
                    </Link>
                </div>
            </aside>
        </div>
    );
}
