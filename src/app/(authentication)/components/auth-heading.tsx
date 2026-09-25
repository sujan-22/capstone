export default function AuthHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: React.ReactNode;
}) {
    return (
        <div className="mb-9">
            <p className="type-label text-ink-soft">{eyebrow}</p>
            <h1 className="mt-4 text-[2.5rem] leading-[0.95] font-extrabold tracking-[-0.045em] [font-variation-settings:'wdth'_115]">
                {title}
            </h1>
            <p className="mt-4 leading-relaxed text-ink-soft">{description}</p>
        </div>
    );
}
