"use client";

import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { PhoneModel } from "@/lib/database/table_types";
import { cn } from "@/lib/utils";

interface Props {
    models: PhoneModel[];
    value: PhoneModel;
    onSelect: (m: PhoneModel) => void;
}

export default function ModelSelector({ models, value, onSelect }: Props) {
    return (
        <div className="relative flex flex-col gap-3 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
            </label>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className=" w-full justify-between"
                    >
                        {value.model_name}
                        <ChevronsUpDown className=" ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {models.map((model) => (
                        <DropdownMenuItem
                            key={model.id}
                            className={cn(
                                "flex text-sm gap-1 items-center cursor-default hover:bg-zinc-100",
                                {
                                    "bg-zinc-100": value.id === model.id,
                                }
                            )}
                            onClick={() => onSelect(model)}
                        >
                            <CheckIcon
                                className={cn(
                                    " mr-2 h-4 w-4",
                                    model.id === value.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                )}
                            />
                            {model.model_name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
