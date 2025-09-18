export type ReminderRow = {
    id: string;
    user_id: string;
    case_name: string;
    imgsrc: string;
    modelname: string;
    color: string;
    material: string;
    finish: string;
    last_reminder_sent_at: Date | null;
    reminder_count: number;
    createdat: Date;
    next_reminder_at: Date | null;
    has_dismissed: boolean;
};

export interface IReminder {
    id: string;
    userId: string;
    caseName: string;
    imgSrc: string;
    modelName: string;
    color: string;
    material: string;
    finish: string;
    lastReminderSentAt: string | null;
    reminderCount: number;
    createdAt: string;
    hasDismissed: boolean;
    nextReminderAt: string | null;
}
