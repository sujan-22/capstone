import * as React from "react";

type Props = {
    heading: string;
    description?: string;
    icon?: React.ElementType;
    /** Right-aligned content, e.g. a count or an action. */
    aside?: React.ReactNode;
};

const AccountHeader: React.FC<Props> = ({
    heading,
    description,
    icon: Icon,
    aside,
}) => {
    return (
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-5">
            <div className="min-w-0">
                <h2 className="type-title flex items-center gap-3">
                    {Icon ? (
                        <Icon aria-hidden className="size-6 shrink-0 text-cobalt" />
                    ) : null}
                    {heading}
                </h2>
                {description ? (
                    <p className="mt-3 max-w-2xl text-ink-soft">{description}</p>
                ) : null}
            </div>
            {aside}
        </header>
    );
};

export default AccountHeader;
