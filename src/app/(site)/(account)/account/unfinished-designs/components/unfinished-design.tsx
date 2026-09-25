"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import DesignRow from "../../components/design-row";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IUnfinishedDesign } from "@/lib/types/unfinished-designs.types";
import { deleteUnfinishedDesign } from "../actions/actions";

interface Props {
    design: IUnfinishedDesign;
    userId: string;
}

const UnfinishedDesign = ({ design }: Props) => {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: () => deleteUnfinishedDesign(design.id),
        onSettled: () => queryClient.invalidateQueries(),
    });

    return (
        <DesignRow
            imgSrc={design.croppedImgUrl ?? design.imgSrc}
            caseName={design.caseName}
            modelName={design.modelName}
            color={design.color}
            material={design.material}
            finish={design.finish}
            meta={
                <>
                    Last edited{" "}
                    <span className="font-medium text-ink">
                        {design.updatedAt
                            ? formatDate(design.updatedAt)
                            : "N/A"}
                    </span>
                </>
            }
            actions={
                <>
                    <Link
                        href={`/configure/customize/${design.id}`}
                        className={buttonVariants({
                            size: "sm",
                            className: "h-9 px-4",
                        })}
                    >
                        Continue customising
                    </Link>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 px-4 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                        isLoading={deleteMutation.isPending}
                    >
                        <Trash2 aria-hidden className="size-4" />
                        Delete design
                    </Button>
                </>
            }
        />
    );
};

export default UnfinishedDesign;
