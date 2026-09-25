"use client";

import React from "react";
import { RadioGroup } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { CaseColor } from "@/lib/database/table_types";

interface Props {
    colors: CaseColor[];
    value: CaseColor;
    onChange: (c: CaseColor) => void;
}

export default function ColorPicker({ colors, value, onChange }: Props) {
    return (
        <RadioGroup
            value={value}
            onChange={onChange}
            by="id"
            aria-label="Case colour"
            className="flex flex-wrap gap-2.5"
        >
            {colors.map((color) => (
                <RadioGroup.Option
                    key={color.id}
                    value={color}
                    aria-label={color.name}
                    title={color.name}
                    className={({ checked }) =>
                        cn(
                            "relative flex size-11 cursor-pointer items-center justify-center rounded-full outline-none ring-offset-2 ring-offset-paper-raised transition-shadow focus-visible:ring-2 focus-visible:ring-cobalt",
                            checked ? "ring-2 ring-ink" : "hover:ring-1 hover:ring-ink/30"
                        )
                    }
                >
                    <span
                        className="size-9 rounded-full shadow-[inset_0_0_0_1px_rgb(20_20_20/0.12)]"
                        style={{ background: color.hex }}
                    />
                </RadioGroup.Option>
            ))}
        </RadioGroup>
    );
}
