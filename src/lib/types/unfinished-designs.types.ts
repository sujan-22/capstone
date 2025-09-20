export interface IUnfinishedDesign {
    id: string;
    imgSrc: string;
    caseName: string;
    modelName: string;
    color: string;
    material: string;
    finish: string;
    createdAt: string;
    updatedAt: string;
    reminderCount: number;
    lastReminderSentAt: string | null;
    hasDismissed: boolean;
}

export type UnfinishedDesignRow = {
    id: string;
    imgsrc: string;
    case_name: string;
    modelname: string;
    color: string;
    material: string;
    finish: string;
    created_at: string;
    updated_at: string;
    reminder_id: string | null;
    reminder_status: string | null;
    reminder_sent_count: number | null;
    last_sent_at: string | null;
    dismissed_at: string | null;
};
