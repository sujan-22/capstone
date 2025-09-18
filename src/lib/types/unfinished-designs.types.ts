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
    createdat: string;
    updatedat: string;
    reminder_count: number;
    last_reminder_sent_at: string | null;
    has_dismissed: boolean;
};
