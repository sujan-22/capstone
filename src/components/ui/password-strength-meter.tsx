import React from "react";
import { Check } from "lucide-react";
import { usePasswordStrength } from "@/hooks/use-password-strength";
import { cn } from "@/lib/utils";

type Props = {
    password: string;
};

const TONES = [
    "bg-destructive",
    "bg-destructive",
    "bg-[#d4a900]",
    "bg-cobalt",
    "bg-success",
];

export default function PasswordStrengthMeter({ password }: Props) {
    const { score, label, suggestions, checks } =
        usePasswordStrength(password);

    if (!password) {
        return null;
    }

    const rules = [
        { ok: checks.length, text: "Minimum 8 characters" },
        { ok: checks.upper, text: "Uppercase letter" },
        { ok: checks.lower, text: "Lowercase letter" },
        { ok: checks.number, text: "Number" },
        { ok: checks.special, text: "Special character" },
    ];

    return (
        <div className="mt-3">
            <div className="flex items-center gap-3">
                <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden>
                    {[1, 2, 3, 4].map((step) => (
                        <span
                            key={step}
                            className={cn(
                                "h-1.5 rounded-full transition-colors duration-300",
                                score >= step ? TONES[score] : "bg-ink/10"
                            )}
                        />
                    ))}
                </div>
                <span className="type-label w-16 text-right text-ink">
                    {label}
                </span>
            </div>

            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                {rules.map((rule) => (
                    <li
                        key={rule.text}
                        className={cn(
                            "flex items-center gap-1.5",
                            rule.ok ? "text-success" : "text-ink-soft"
                        )}
                    >
                        <span
                            aria-hidden
                            className={cn(
                                "flex size-3.5 items-center justify-center rounded-full",
                                rule.ok ? "bg-success text-white" : "border border-ink/25"
                            )}
                        >
                            {rule.ok ? <Check className="size-2.5" strokeWidth={3} /> : null}
                        </span>
                        {rule.text}
                        <span className="sr-only">
                            {rule.ok ? " (done)" : " (missing)"}
                        </span>
                    </li>
                ))}
            </ul>

            {suggestions.length > 0 && (
                <p className="mt-2 text-xs text-ink-soft" aria-live="polite">
                    {suggestions[0]}
                </p>
            )}
        </div>
    );
}
