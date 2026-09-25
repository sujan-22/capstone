"use client";

import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { CheckIcon, ChevronsUpDown, Smartphone } from "lucide-react";
import { PhoneModel } from "@/lib/database/table_types";
import { cn } from "@/lib/utils";

interface Props {
    models: PhoneModel[];
    value: PhoneModel;
    onSelect: (m: PhoneModel) => void;
}

export default function ModelSelector({ models, value, onSelect }: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label={`Phone model: ${value.model_name}`}
                    className="flex h-12 w-full items-center gap-3 rounded-lg border border-input bg-paper-raised px-3.5 text-left text-[0.9375rem] font-medium outline-none transition-colors hover:border-ink/40 focus-visible:border-cobalt focus-visible:ring-4 focus-visible:ring-cobalt/15 data-[state=open]:border-cobalt"
                >
                    <Smartphone aria-hidden className="size-4 text-ink-soft" />
                    <span className="flex-1 truncate">{value.model_name}</span>
                    <ChevronsUpDown aria-hidden className="size-4 text-ink-soft" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
            >
                {models.map((model) => (
                    <DropdownMenuItem
                        key={model.id}
                        className={cn(
                            "justify-between",
                            value.id === model.id && "bg-ink/[0.05] font-semibold"
                        )}
                        onClick={() => onSelect(model)}
                    >
                        {model.model_name}
                        <CheckIcon
                            aria-hidden
                            className={cn(
                                "!text-cobalt",
                                model.id === value.id ? "opacity-100" : "opacity-0"
                            )}
                        />
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
