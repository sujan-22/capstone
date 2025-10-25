"use client";

import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export type StatsPeriod = "90d" | "30d" | "7d";

interface StatsPeriodFilterProps {
    value?: StatsPeriod;
    onChange?: (v: StatsPeriod) => void;
    className?: string;
    defaultValue?: StatsPeriod;
}

export default function StatsPeriodFilter({
    value,
    onChange,
    className,
    defaultValue = "30d",
}: StatsPeriodFilterProps) {
    const [internal, setInternal] = React.useState<StatsPeriod>(defaultValue);

    const current = (value ?? internal) as StatsPeriod;

    const setValue = (v: string) => {
        const next = (v || current) as StatsPeriod;
        if (onChange) onChange(next);
        else setInternal(next);
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <ToggleGroup
                type="single"
                value={current}
                onValueChange={setValue}
                variant="outline"
                className="hidden md:flex"
            >
                <ToggleGroupItem value="90d" className="px-4">
                    Last 3 months
                </ToggleGroupItem>
                <ToggleGroupItem value="30d" className="px-4">
                    Last 30 days
                </ToggleGroupItem>
                <ToggleGroupItem value="7d" className="px-4">
                    Last 7 days
                </ToggleGroupItem>
            </ToggleGroup>

            <Select value={current} onValueChange={setValue}>
                <SelectTrigger
                    className="w-44 md:hidden"
                    aria-label="Select time range"
                >
                    <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                    <SelectItem value="90d" className="rounded-lg">
                        Last 3 months
                    </SelectItem>
                    <SelectItem value="30d" className="rounded-lg">
                        Last 30 days
                    </SelectItem>
                    <SelectItem value="7d" className="rounded-lg">
                        Last 7 days
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
