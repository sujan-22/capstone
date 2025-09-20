interface IDesign {
    id: string;
    name: string;
    image: string | null;
    created_at: string;
    last_reminder_sent_at: string | null;
}

export function generateReminderEmailHTML(designs: IDesign[], baseUrl: string) {
    const remindersPage = `${baseUrl}/account/reminders`;
    const accountSettingsPage = `${baseUrl}/account/profile`;

    const designListItems = designs
        .map(
            (d) => `
        <li style="margin-bottom: 4px;">
            <a href="${remindersPage}" 
               style="color: #6600ff; text-decoration: none; font-weight: bold;">
               ${d.name}
            </a>
        </li>`
        )
        .join("\n");

    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: 2rem auto; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h2>Hi there,</h2>
        <p style="margin-top: 1rem; margin-bottom: 5px;">
            We noticed you haven't finished these custom phone case designs:
        </p>
        <ul>
            ${designListItems}
        </ul>
        <p style="margin-top: 1rem;">
            You can continue customizing your designs or review all your unfinished design reminders on the 
            <a href="${remindersPage}" style="color: #6600ff; font-weight: bold;">Reminders page</a>.
        </p>
        <p>
            If you'd prefer not to receive these reminders, you can manage your preferences in your 
            <a href="${accountSettingsPage}" style="color: #6600ff; font-weight: bold;">account settings</a>.
        </p>
        <div style="margin-top: 2rem;">
            Thanks,<br/>
            <span style="font-size: 20px; font-weight: 400; margin-bottom: 1rem; display: inline-block;">
                DESIGN<span style="color: #005DE0;">MY</span>CASE
            </span> 
            <strong>Team</strong>
        </div>
    </div>
    `;
}
