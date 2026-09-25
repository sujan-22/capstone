"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/components/utilities/error";
import EmptyState from "../../components/empty-state";
import { getReminders } from "../actions/actions";
import Reminder from "./reminder";
import ReminderSkeleton from "./skeleton/reminder-skeleton";
import AccountHeader from "../../components/account-header";

interface RemindersOverviewPageProps {
    userId: string;
}

const RemindersOverviewPage: React.FC<RemindersOverviewPageProps> = ({
    userId,
}) => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["get-reminders", userId],
        queryFn: async () => await getReminders(),
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
                <EmptyState
                    title="No reminders sent yet"
                    description="If you leave a design unfinished, we'll email you a reminder and it will show up here."
                    href="/account/unfinished-designs"
                    cta="See unfinished designs"
                />
            );
        }

        return reminders.map((reminder) => (
            <Reminder reminder={reminder} key={reminder.id} userId={userId} />
        ));
    };

    return (
        <div>
            <AccountHeader
                heading="Reminders"
                description="Reminders we've emailed you about designs you haven't finished yet."
            />
            <section className="flex flex-col">{renderContent()}</section>
        </div>
    );
};

export default RemindersOverviewPage;
