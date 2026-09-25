import { Button, buttonVariants } from "@/components/ui/button";
import DesignRow from "../../components/design-row";
import { IReminder } from "@/lib/types/reminders.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import { dismissReminder } from "../actions/actions";
import { formatDate } from "@/lib/utils";

interface Props {
    reminder: IReminder;
    userId: string;
}

const Reminder = ({ reminder }: Props) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => dismissReminder(reminder.id),
        onSettled: (data) => {
            if (data?.success) {
                queryClient.invalidateQueries({
                    queryKey: ["get-reminders"],
                });
            }
        },
    });
    return (
        <DesignRow
            imgSrc={reminder.croppedImgUrl ?? reminder.imgSrc}
            caseName={reminder.caseName}
            modelName={reminder.modelName}
            color={reminder.color}
            material={reminder.material}
            finish={reminder.finish}
            meta={
                <>
                    Reminder sent on{" "}
                    <span className="font-medium text-ink">
                        {reminder.lastSentAt
                            ? formatDate(reminder.lastSentAt)
                            : "N/A"}
                    </span>
                </>
            }
            actions={
                <>
                    <Link
                        href={`/configure/customize/${reminder.caseDesignId}`}
                        className={buttonVariants({
                            size: "sm",
                            className: "h-9 px-4",
                        })}
                    >
                        Continue customising
                    </Link>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-9 px-4"
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending}
                        isLoading={mutation.isPending}
                    >
                        Dismiss
                    </Button>
                </>
            }
        />
    );
};

export default Reminder;
