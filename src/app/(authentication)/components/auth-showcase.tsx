import Phone from "@/components/utilities/phone";
import ColorBar from "@/components/print/color-bar";
import RegistrationMark from "@/components/print/registration-mark";
import CropMarks from "@/components/print/crop-marks";

const FAN = [
    {
        src: "/assets/testimonials/3.jpg",
        className: "-translate-x-[62%] translate-y-[6%] -rotate-[14deg]",
    },
    {
        src: "/assets/testimonials/5.jpg",
        className: "translate-x-[62%] translate-y-[6%] rotate-[14deg]",
    },
    {
        src: "/assets/homepage/gallery_16.jpg",
        className: "z-10 -translate-y-[2%]",
    },
];

/** The ink panel beside the auth forms: a fanned hand of printed cases. */
export default function AuthShowcase() {
    return (
        <aside
            aria-hidden
            className="relative hidden overflow-hidden bg-ink text-paper lg:block"
        >
            <div className="halftone absolute inset-0 text-paper/[0.045]" />

            <div className="absolute inset-x-10 top-8 flex items-center justify-between">
                <span className="type-label text-paper/60">
                    DMC · Proof sheet
                </span>
                <RegistrationMark size={16} className="text-paper/50" />
            </div>

            <div className="absolute inset-x-0 top-[12%] bottom-[30%] flex items-center justify-center">
                <div className="relative h-full aspect-[896/1831] max-h-[440px]">
                    {FAN.map((card) => (
                        <div
                            key={card.src}
                            className={`absolute inset-0 ${card.className}`}
                        >
                            <Phone
                                imgSrc={card.src}
                                dark
                                sizes="220px"
                                className="drop-shadow-[0_30px_40px_rgb(0_0_0/0.55)]"
                            />
                        </div>
                    ))}
                    <CropMarks
                        gap={14}
                        length={18}
                        className="z-20 text-paper/40"
                    />
                </div>
            </div>

            <div className="absolute inset-x-10 bottom-10">
                <p className="type-display max-w-[11ch]">
                    Printed for one phone: yours.
                </p>
                <div className="mt-8 flex items-center justify-between border-t border-paper/15 pt-5">
                    <ColorBar size={9} />
                    <span className="type-label text-paper/60">
                        Free shipping · 5-year print warranty
                    </span>
                </div>
            </div>
        </aside>
    );
}
