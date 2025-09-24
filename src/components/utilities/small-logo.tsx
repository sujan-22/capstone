import { Italiana } from "next/font/google";

const italiana = Italiana({
    subsets: ["latin"],
    weight: "400",
});

const SmallLogo = () => {
    return (
        <span
            className={`${italiana.className} text-base tracking-wide font-bold text-primary`}
        >
            DESIGN<span className="text-blue-600">MY</span>CASE
        </span>
    );
};

export default SmallLogo;
