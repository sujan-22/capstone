"use client";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/components/utilities/error";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getReminders } from "../actions/actions";
import Reminder from "./reminder";
import ReminderSkeleton from "./skeleton/reminder-skeleton";

interface RemindersOverviewPageProps {
    userId: string;
}

const RemindersOverviewPage: React.FC<RemindersOverviewPageProps> = ({
    userId,
}) => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["get-reminders", userId],
        queryFn: async () => await getReminders(userId),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
        enabled: !!userId,
    });

    const reminders = data?.reminders ?? [];

    const renderContent = () => {
        if (isLoading) {
            return Array.from({ length: 2 }).map((_, i) => (
                <ReminderSkeleton key={i} />
            ));
        }

        if (isError) {
            return (
                <ErrorMessage
                    message="Failed to load your past reminders."
                    onRetry={() => refetch()}
                />
            );
        }

        if (!data?.success) {
            return (
                <ErrorMessage
                    message={
                        data?.error ?? "Failed to load your past reminders."
                    }
                    onRetry={() => refetch()}
                />
            );
        }

        if (!reminders.length) {
            return (
                <div className="w-full flex flex-col items-center gap-4 col-span-full text-center">
                    <h2 className="text-2xl font-semibold">
                        No reminders sent yet
                    </h2>
                    <p className="text-base text-muted-foreground max-w-md">
                        You currently have no reminders that have been sent.
                        Once a design triggers a reminder, it will appear here.
                    </p>
                    <Link href="/" passHref>
                        <Button className="mt-2">Explore Designs</Button>
                    </Link>
                </div>
            );
        }

        return reminders.map((reminder) => (
            <Reminder reminder={reminder} key={reminder.id} userId={userId} />
        ));
    };

    return (
        <div className="space-y-6">
            <div className="text-center sm:text-left">
                <h3 className="text-2xl font-semibold">Sent Reminders</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                    Here is a history of reminders that have already been sent
                    to your email for unfinished case designs.
                </p>
            </div>

            <Separator />

            <section className="flex flex-col gap-4">{renderContent()}</section>
        </div>
    );
};

export default RemindersOverviewPage;
