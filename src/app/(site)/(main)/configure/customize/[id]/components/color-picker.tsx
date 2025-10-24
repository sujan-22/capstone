"use client";

import React from "react";
import { RadioGroup } from "@headlessui/react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CaseColor } from "@/lib/database/table_types";

interface Props {
    colors: CaseColor[];
    value: CaseColor;
    onChange: (c: CaseColor) => void;
}

export default function ColorPicker({ colors, value, onChange }: Props) {
    return (
        <RadioGroup value={value} onChange={onChange}>
            <Label>Color: {value.name}</Label>
            <div className="mt-3 flex items-center">
                {colors.map((color) => (
                    <RadioGroup.Option
                        key={color.id}
                        value={color}
                        className={({ active, checked }) =>
                            cn(
                                "relative flex cursor-pointer items-center justify-center rounded-full p-0.5 active:ring-0 focus:ring-0 active:outline-none focus:outline-none border-2",
                                {
                                    "border-black": active || checked,
                                    "border-transparent": !active && !checked,
                                }
                            )
                        }
                    >
                        <span
                            className="h-8 w-8 rounded-full border border-black border-opacity-10"
                            style={{ background: color.hex }}
                        />
                    </RadioGroup.Option>
                ))}
            </div>
        </RadioGroup>
    );
}
