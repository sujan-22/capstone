import { Button } from "@/components/ui/button";
import Phone from "@/components/utilities/phone";
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
        <div
            key={reminder.id}
            className="border rounded-lg p-3 flex flex-col sm:flex-row gap-3 bg-white shadow-sm duration-200"
        >
            <div className="flex-shrink-0 w-24 h-auto relative rounded-md bg-muted overflow-hidden flex items-center justify-center">
                <Phone
                    imgSrc={reminder.croppedImgUrl ?? reminder.imgSrc}
                    altText={reminder.caseName}
                />
            </div>

            <div className="flex-1 flex flex-col gap-2">
                <div className="flex-1 flex flex-col gap-2">
                    <h4 className="text-lg font-semibold truncate">
                        {reminder.caseName}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <p>
                            <span className="font-medium">Model:</span>{" "}
                            {reminder.modelName}
                        </p>
                        <p>
                            <span className="font-medium">Color:</span>{" "}
                            {reminder.color}
                        </p>
                        <p>
                            <span className="font-medium">Material:</span>{" "}
                            {reminder.material}
                        </p>
                        <p>
                            <span className="font-medium">Finish:</span>{" "}
                            {reminder.finish}
                        </p>
                    </div>

                    <p className="text-sm">
                        <span className="font-medium">Reminder sent on:</span>{" "}
                        {reminder.lastSentAt
                            ? formatDate(reminder.lastSentAt)
                            : "N/A"}
                    </p>
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending}
                        isLoading={mutation.isPending}
                    >
                        Dismiss
                    </Button>
                    <Link
                        href={`/configure/customize/${reminder.caseDesignId}`}
                        passHref
                    >
                        <Button size="sm">Continue Customizing</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Reminder;
