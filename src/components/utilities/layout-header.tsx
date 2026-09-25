import React from "react";
import MaxWidthWrapper from "./max-width-wrapper";
import RegistrationMark from "../print/registration-mark";

const LayoutHeader = ({
    children,
    heading,
    description,
    eyebrow,
    aside,
}: {
    children: React.ReactNode;
    heading: string;
    description: string;
    /** Small mono label above the heading. */
    eyebrow?: string;
    /** Content set against the heading on wide screens, e.g. a count. */
    aside?: React.ReactNode;
}) => {
    return (
        <MaxWidthWrapper className="pb-20 pt-10 sm:pt-14">
            <header className="grid gap-6 border-b border-ink pb-8 lg:grid-cols-12 lg:items-end lg:pb-10">
                <div className="min-w-0 lg:col-span-8">
                    {eyebrow ? (
                        <p className="type-label flex items-center gap-2.5 text-ink-soft">
                            <RegistrationMark size={13} />
                            {eyebrow}
                        </p>
                    ) : null}
                    <h1 className="type-display mt-5">{heading}</h1>
                    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
                        {description}
                    </p>
                </div>
                {aside ? (
                    <div className="min-w-0 lg:col-span-4 lg:justify-self-end">
                        {aside}
                    </div>
                ) : null}
            </header>

            <div className="mt-10">{children}</div>
        </MaxWidthWrapper>
    );
};

export default LayoutHeader;
