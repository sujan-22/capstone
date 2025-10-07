"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const SortSidebar = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "none";

    const sortItems = [
        { key: "none", label: "None" },
        { key: "popularity_asc", label: "Popularity: Low → High" },
        { key: "popularity_desc", label: "Popularity: High → Low" },
    ];

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(
            searchParams as unknown as URLSearchParams
        );

        if (value === "none") {
            params.delete("sort");
        } else {
            params.set("sort", value);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="w-full">
            <div className="block [@media(min-width:620px)]:hidden">
                <Select
                    value={currentSort !== "none" ? currentSort : undefined}
                    onValueChange={handleSortChange}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Sort by</SelectLabel>
                            {sortItems.map((item) => (
                                <SelectItem key={item.key} value={item.key}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="hidden [@media(min-width:620px)]:block text-sm text-right">
                <p className="font-bold mb-4">Sort by</p>
                <ul className="space-y-2 text-muted-foreground">
                    {sortItems.map((item) => (
                        <li
                            key={item.key}
                            className={cn(
                                "cursor-pointer hover:text-primary",
                                currentSort === item.key &&
                                    "text-primary font-bold"
                            )}
                            onClick={() => handleSortChange(item.key)}
                        >
                            {item.label}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SortSidebar;
