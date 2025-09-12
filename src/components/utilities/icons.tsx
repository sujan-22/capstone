import { LucideProps } from "lucide-react";

export const Icons = {
    // 1) Smooth double wave — clean, subtle shadow/backline
    underlineSmooth: (props: LucideProps) => (
        <svg
            {...props}
            viewBox="0 0 687 155"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g strokeLinecap="round" strokeLinejoin="round">
                <path
                    d="M10 100 C 70 80, 130 80, 190 100 C 250 120, 310 120, 370 100 C 430 80, 490 80, 550 100 C 610 120, 670 120, 680 100"
                    stroke="currentColor"
                    strokeWidth={8}
                    opacity={0.18}
                />
                <path
                    d="M10 118 C 70 98, 130 98, 190 118 C 250 138, 310 138, 370 118 C 430 98, 490 98, 550 118 C 610 138, 670 138, 680 118"
                    stroke="currentColor"
                    strokeWidth={7}
                />
            </g>
        </svg>
    ),

    // 2) Hand-drawn brush style — irregular amplitude + thicker stroke
    underlineHand: (props: LucideProps) => (
        <svg
            {...props}
            viewBox="0 0 700 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g strokeLinecap="round" strokeLinejoin="round">
                <path
                    d="M8 106 C 60 86, 120 104, 180 98 C 240 92, 300 118, 360 106 C 420 94, 480 120, 540 108 C 600 96, 660 124, 692 112"
                    stroke="currentColor"
                    strokeWidth={10}
                    strokeOpacity={0.24}
                    transform="translate(0, -4) rotate(-1 350 75)"
                />
                <path
                    d="M12 120 C 64 98, 124 116, 186 110 C 248 104, 308 130, 370 118 C 432 106, 492 132, 554 120 C 616 108, 676 136, 688 124"
                    stroke="currentColor"
                    strokeWidth={9}
                    strokeLinecap="round"
                />
            </g>
        </svg>
    ),

    // 3) Dashed wavy underline — playful / lightweight accent
    underlineDashed: (props: LucideProps) => (
        <svg
            {...props}
            viewBox="0 0 700 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={6}
            >
                <path
                    d="M10 108 C 72 88, 136 88, 198 108 C 260 128, 324 128, 386 108 C 448 88, 512 88, 576 108 C 640 128, 676 128, 688 108"
                    strokeDasharray="18 12"
                />
            </g>
        </svg>
    ),

    // 4) Layered gradient waves — polished, colorful underline (uses its own colors)
    underlineGradient: (props: LucideProps) => (
        <svg
            {...props}
            viewBox="0 0 700 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient
                    id="underline-grad-top"
                    x1="0"
                    x2="1"
                    y1="0"
                    y2="0"
                >
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient
                    id="underline-grad-bottom"
                    x1="0"
                    x2="1"
                    y1="0"
                    y2="0"
                >
                    <stop offset="0%" stopColor="#BFDBFE" />
                    <stop offset="100%" stopColor="#93C5FD" />
                </linearGradient>
            </defs>

            <g strokeLinecap="round" strokeLinejoin="round">
                <path
                    d="M12 98 C 72 78, 136 78, 198 98 C 260 118, 324 118, 386 98 C 448 78, 512 78, 576 98 C 640 118, 676 118, 688 98"
                    stroke="url(#underline-grad-bottom)"
                    strokeWidth={10}
                    opacity={0.9}
                />
                <path
                    d="M12 118 C 72 98, 136 98, 198 118 C 260 138, 324 138, 386 118 C 448 98, 512 98, 576 118 C 640 138, 676 138, 688 118"
                    stroke="url(#underline-grad-top)"
                    strokeWidth={7}
                />
            </g>
        </svg>
    ),
};
