"use client";

import React from "react";
import { RadioGroup } from "@headlessui/react";
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
        <RadioGroup
            value={value}
            onChange={onChange}
            by="id"
            aria-label={name.charAt(0).toUpperCase() + name.slice(1)}
            className="space-y-2"
        >
            {options.map((option) => (
                <RadioGroup.Option
                    key={option.id}
                    value={option}
                    className={({ checked }) =>
                        cn(
                            "group relative flex cursor-pointer items-start gap-3.5 rounded-lg border px-4 py-3.5 outline-none transition-colors focus-visible:ring-4 focus-visible:ring-cobalt/15",
                            checked
                                ? "border-cobalt bg-cobalt-tint/60"
                                : "border-rule bg-paper-raised hover:border-ink/35"
                        )
                    }
                >
                    {({ checked }) => (
                        <>
                            <span
                                aria-hidden
                                className={cn(
                                    "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                    checked ? "border-cobalt" : "border-ink/25"
                                )}
                            >
                                <span
                                    className={cn(
                                        "size-2 rounded-full bg-cobalt transition-transform duration-300 ease-out-expo",
                                        checked ? "scale-100" : "scale-0"
                                    )}
                                />
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col text-sm">
                                <RadioGroup.Label
                                    as="span"
                                    className="font-semibold text-ink"
                                >
                                    {option.name}
                                </RadioGroup.Label>
                                {option.description && (
                                    <RadioGroup.Description
                                        as="span"
                                        className="mt-0.5 leading-snug text-ink-soft"
                                    >
                                        {option.description}
                                    </RadioGroup.Description>
                                )}
                            </span>
                            <RadioGroup.Description
                                as="span"
                                className="shrink-0 font-mono text-sm font-medium text-ink"
                            >
                                {formatPrice(option.price)}
                            </RadioGroup.Description>
                        </>
                    )}
                </RadioGroup.Option>
            ))}
        </RadioGroup>
    );
}
