"use server";
import { transporter } from "@/lib/config/nodemailer";

export async function sendEmail({
    to,
    subject,
    text,
}: {
    to: string;
    subject: string;
    text: string;
}) {
    try {
        const data = await transporter.sendMail({
            from: `"DesignMyCase" <${process.env.GMAIL_USER}>`,
            to: to.toLowerCase().trim(),
            subject: subject.trim(),
            text: text,
        });

        return { success: true, messageId: data.messageId };
    } catch (err) {
        console.error("Error sending email:", err);
        return {
            success: false,
            message: "Failed to send email. Please try again later.",
        };
    }
}
