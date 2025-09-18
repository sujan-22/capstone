"use client";

import { Button } from "@/components/ui/button";
import Phone from "@/components/utilities/phone";
import Link from "next/link";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IUnfinishedDesign } from "@/lib/types/unfinished-designs.types";
import {
    dismissUnfinishedDesign,
    deleteUnfinishedDesign,
} from "../actions/actions";

interface Props {
    design: IUnfinishedDesign;
    userId: string;
}

const UnfinishedDesign = ({ design, userId }: Props) => {
    const queryClient = useQueryClient();

    const dismissMutation = useMutation({
        mutationFn: () => dismissUnfinishedDesign(userId, design.id),
        onSettled: () => queryClient.invalidateQueries(),
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteUnfinishedDesign(userId, design.id),
        onSettled: () => queryClient.invalidateQueries(),
    });

    return (
        <div
            key={design.id}
            className="border rounded-lg p-3 flex flex-col sm:flex-row gap-3 bg-white shadow-sm duration-200"
        >
            <div className="flex-shrink-0 w-24 h-auto relative rounded-md bg-muted overflow-hidden flex items-center justify-center">
                <Phone imgSrc={design.imgSrc} altText={design.caseName} />
            </div>

            <div className="flex-1 flex flex-col gap-2">
                <div className="flex-1 flex flex-col gap-2">
                    <h4 className="text-lg font-semibold truncate">
                        {design.caseName}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <p>
                            <span className="font-medium">Model:</span>{" "}
                            {design.modelName}
                        </p>
                        <p>
                            <span className="font-medium">Color:</span>{" "}
                            {design.color}
                        </p>
                        <p>
                            <span className="font-medium">Material:</span>{" "}
                            {design.material}
                        </p>
                        <p>
                            <span className="font-medium">Finish:</span>{" "}
                            {design.finish}
                        </p>
                    </div>

                    <p className="text-sm">
                        <span className="font-medium">Last modified on:</span>{" "}
                        {design.updatedAt
                            ? new Date(design.updatedAt).toLocaleString()
                            : "N/A"}
                    </p>
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dismissMutation.mutate()}
                        disabled={dismissMutation.isPending}
                        isLoading={dismissMutation.isPending}
                    >
                        Dismiss Reminder
                    </Button>

                    <Link href={`/customize/${design.id}`} passHref>
                        <Button size="sm">Continue Customizing</Button>
                    </Link>

                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                        isLoading={deleteMutation.isPending}
                    >
                        Delete Design
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UnfinishedDesign;
