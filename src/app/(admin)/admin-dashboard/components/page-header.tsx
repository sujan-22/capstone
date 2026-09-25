import GuideDialog from "./guide-dialog";

interface AdminPageHeaderProps {
    /** Section number and name, e.g. "02 · Orders". */
    eyebrow: string;
    title: string;
    description: string;
    /** Buttons and filters set against the title on wide screens. */
    actions?: React.ReactNode;
    /** Help content shown in a dialog behind a "Guide" button. */
    guide?: React.ReactNode;
}

export default function AdminPageHeader({
    eyebrow,
    title,
    description,
    actions,
    guide,
}: AdminPageHeaderProps) {
    return (
        <header className="flex flex-col gap-6 border-b border-ink pb-7 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
                <p className="type-label text-ink-soft">{eyebrow}</p>
                <h1 className="mt-3 text-[clamp(2.125rem,3.6vw,3rem)] leading-[0.95] font-extrabold tracking-[-0.045em] wdth-expanded">
                    {title}
                </h1>
                <p className="mt-3 max-w-2xl text-ink-soft">{description}</p>
            </div>
            {actions || guide ? (
                <div className="flex flex-wrap items-center gap-2">
                    {actions}
                    {guide ? <GuideDialog title={title}>{guide}</GuideDialog> : null}
                </div>
            ) : null}
        </header>
    );
}
