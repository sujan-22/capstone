"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ColorsOverview from "./colors/colors-overview";
import ModelsOverview from "./models/models-overview";
import FinishesOverview from "./finishes/finishes-overview";
import MaterialsOverview from "./materials/materials-overview";
import { Segmented } from "../../components/controls";

const TABS = [
    {
        value: "colors",
        label: "Colours",
        blurb: "Case colours customers pick in the editor. Shown as swatches behind any part of the case the photo doesn't cover.",
        Panel: ColorsOverview,
    },
    {
        value: "models",
        label: "Phone models",
        blurb: "The phones a case can be ordered for. Deactivate a model to stop offering it without affecting existing orders.",
        Panel: ModelsOverview,
    },
    {
        value: "materials",
        label: "Materials",
        blurb: "Case materials and their price, added to the finish price to make the case price.",
        Panel: MaterialsOverview,
    },
    {
        value: "finishes",
        label: "Finishes",
        blurb: "Surface finishes and their price, added to the material price to make the case price.",
        Panel: FinishesOverview,
    },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function CatalogTabs() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const requested = searchParams.get("tab");
    const current: TabValue =
        TABS.find((t) => t.value === requested)?.value ?? "colors";
    const tab = TABS.find((t) => t.value === current)!;

    const select = (value: TabValue) => {
        const sp = new URLSearchParams(searchParams.toString());
        sp.set("tab", value);
        router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    };

    return (
        <div className="space-y-6">
            <Segmented
                label="Catalog section"
                options={TABS.map((t) => ({ value: t.value, label: t.label }))}
                value={current}
                onChange={select}
            />
            <section
                aria-label={tab.label}
                className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10"
            >
                <div>
                    <h2 className="type-title">{tab.label}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                        {tab.blurb}
                    </p>
                </div>
                <div className="min-w-0">
                    <tab.Panel />
                </div>
            </section>
        </div>
    );
}
