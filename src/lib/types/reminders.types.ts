export interface IReminder {
    id: string;
    userId: string;
    caseDesignId: string;
    status: "pending" | "sent" | "dismissed" | "opted_out";
    reminderSentCount: number;
    lastSentAt: string | null;
    dismissedAt: string | null;
    createdAt: string;
    updatedAt: string;

    caseName: string;
    imgSrc: string;
    modelName: string;
    color: string;
    croppedImgUrl: string | null;
    material: string;
    finish: string;
}

export type IReminderRow = {
    reminder_id: string;
    user_id: string;
    case_design_id: string;
    status: "pending" | "sent" | "dismissed" | "opted_out";
    reminder_sent_count: number;
    last_sent_at: string | null;
    dismissed_at: string | null;
    created_at: string;
    updated_at: string;

    case_name: string;
    imgsrc: string;
    modelname: string;
    cropped_image_url: string;
    color: string;
    material: string;
    finish: string;
};
