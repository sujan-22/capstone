import { UserCogIcon, BanIcon, Trash2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AdminCustomersInfo() {
    return (
        <div className="grid w-full items-start gap-3">
            {/* Roles */}
            <Alert>
                <UserCogIcon />
                <AlertTitle>User roles</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside text-sm">
                        <li>
                            <strong>user</strong>: standard customer
                            permissions.
                        </li>
                        <li>
                            <strong>admin</strong>: full dashboard access. Grant
                            sparingly.
                        </li>
                        <li>
                            Role changes take effect immediately and are
                            audited.
                        </li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* Ban */}
            <Alert>
                <BanIcon />
                <AlertTitle>Bans & restrictions</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside text-sm">
                        <li>
                            <strong>Ban for 7 days</strong> blocks sign-in and
                            checkout for the selected period.
                        </li>
                        <li>
                            Existing orders remain visible and continue
                            fulfillment.
                        </li>
                        <li>You can lift a ban early from the same menu.</li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* Delete */}
            <Alert variant="destructive">
                <Trash2Icon />
                <AlertTitle>Deleting a user</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside text-sm">
                        <li>
                            Prefer <strong>ban</strong> over delete to preserve
                            history.
                        </li>
                        <li>
                            Delete will retain order records but detaches
                            personal identifiers (email may be anonymized).
                        </li>
                        <li>This action cannot be undone.</li>
                    </ul>
                </AlertDescription>
            </Alert>
        </div>
    );
}
