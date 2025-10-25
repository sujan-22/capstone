"use client";

import { IoTrendingDownOutline, IoTrendingUpOutline } from "react-icons/io5";
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StatsPeriod } from "./period-filter";

type Trend = "up" | "down";

export interface DashboardStatCardProps {
    title: string;
    value: string | number;
    trend?: Trend | null;
    trendText?: string; // e.g., "—", "12.5%", "-20.0%"
    caption?: string;
    subcaption?: string;
    className?: string;
    period: StatsPeriod;
}

export default function DashboardStatCard({
    title,
    value,
    trend = null,
    trendText,
    caption,
    subcaption,
    className,
}: DashboardStatCardProps) {
    const Icon = trend === "down" ? IoTrendingDownOutline : IoTrendingUpOutline;

    return (
        <Card className={cn(className)}>
            <CardHeader>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
                    {value}
                </CardTitle>

                {typeof trendText !== "undefined" && (
                    <CardAction>
                        <Badge
                            variant="outline"
                            className={cn(
                                "gap-1.5",
                                trend === "down"
                                    ? "border-destructive/40 text-destructive"
                                    : ""
                            )}
                        >
                            {/* If trend is null (no baseline), still show an up icon for neutrality */}
                            <Icon className="size-4" />
                            {trendText}
                        </Badge>
                    </CardAction>
                )}
            </CardHeader>

            {(caption || subcaption) && (
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {caption ? (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            {caption} <Icon className="size-4" />
                        </div>
                    ) : null}
                    {subcaption ? (
                        <div className="text-muted-foreground">
                            {subcaption}
                        </div>
                    ) : null}
                </CardFooter>
            )}
        </Card>
    );
}
