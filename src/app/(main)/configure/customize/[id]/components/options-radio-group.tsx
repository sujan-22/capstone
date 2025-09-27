"use client";

import React from "react";
import { RadioGroup } from "@headlessui/react";
import { Label } from "@/components/ui/label";
import { cn, formatPrice } from "@/lib/utils";

type GenericOption = {
    id: string;
    name: string;
    price: number;
    description?: string | null;
};

interface Props<T extends GenericOption> {
    name: "material" | "finish";
    options: T[];
    value: T;
    onChange: (v: T) => void;
}

export default function OptionRadioGroup<T extends GenericOption>({
    name,
    options,
    value,
    onChange,
}: Props<T>) {
    return (
        <RadioGroup value={value} onChange={onChange}>
            <Label>{name.charAt(0).toUpperCase() + name.slice(1)}</Label>
            <div className="mt-3 space-y-4">
                {options.map((option) => (
                    <RadioGroup.Option
                        key={option.id}
                        value={option}
                        className={({ active, checked }) =>
                            cn(
                                "relative cursor-pointer rounded-lg bg-white px-6 py-4 shadow-sm border-2 border-zinc-200 focus:outline-none ring-0 sm:flex sm:justify-between",
                                {
                                    "border-primary": active || checked,
                                }
                            )
                        }
                    >
                        <span className="flex items-center">
                            <span className="flex flex-col text-sm">
                                <RadioGroup.Label
                                    as="span"
                                    className="font-medium text-gray-900"
                                >
                                    {option.name}
                                </RadioGroup.Label>
                                {option.description && (
                                    <RadioGroup.Description
                                        as="span"
                                        className="text-gray-500"
                                    >
                                        {option.description}
                                    </RadioGroup.Description>
                                )}
                            </span>
                        </span>
                        <RadioGroup.Description
                            as="span"
                            className="mt-2 flex text-sm sm:ml-4 sm:mt-0 sm:flex-col sm:text-right"
                        >
                            <span className="font-medium text-gray-900">
                                {formatPrice(option.price)}
                            </span>
                        </RadioGroup.Description>
                    </RadioGroup.Option>
                ))}
            </div>
        </RadioGroup>
    );
}
