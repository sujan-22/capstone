import React from "react";
import { usePasswordStrength } from "@/hooks/use-password-strength";
import { FaCircleCheck } from "react-icons/fa6";
import { GoDotFill } from "react-icons/go";

type Props = {
    password: string;
};

export default function PasswordStrengthMeter({ password }: Props) {
    const { score, label, percent, suggestions, checks } =
        usePasswordStrength(password);

    const color =
        score <= 1
            ? "bg-red-500"
            : score === 2
            ? "bg-yellow-500"
            : score === 3
            ? "bg-amber-600"
            : "bg-green-500";

    if (!password) {
        return;
    }

    return (
        <div className="mt-2">
            <div className="w-full h-2 bg-slate-200 rounded overflow-hidden">
                <div
                    className={`h-full ${color}`}
                    style={{
                        width: `${percent}%`,
                        transition: "width 200ms ease",
                    }}
                    aria-hidden
                />
            </div>

            <div className="flex items-center justify-between mt-2 text-xs">
                <div className="font-medium">{label}</div>
                <div className="text-muted-foreground">{percent}%</div>
            </div>

            <ul className="mt-2 text-xs space-y-1">
                <li
                    className={`flex items-center ${
                        checks.length ? "text-green-600" : "text-red-600"
                    }`}
                >
                    <span className="mr-2 text-sm">
                        {checks.length ? (
                            <FaCircleCheck className=" w-4 h-4" />
                        ) : (
                            <GoDotFill className=" w-4 h-4" />
                        )}
                    </span>
                    Minimum {8} characters
                </li>
                <li
                    className={`flex items-center ${
                        checks.upper ? "text-green-600" : "text-red-600"
                    }`}
                >
                    <span className="mr-2 text-sm">
                        {checks.upper ? (
                            <FaCircleCheck className=" w-4 h-4" />
                        ) : (
                            <GoDotFill className=" w-4 h-4" />
                        )}
                    </span>
                    Uppercase letter
                </li>
                <li
                    className={`flex items-center ${
                        checks.lower ? "text-green-600" : "text-red-600"
                    }`}
                >
                    <span className="mr-2 text-sm">
                        {checks.lower ? (
                            <FaCircleCheck className=" w-4 h-4" />
                        ) : (
                            <GoDotFill className=" w-4 h-4" />
                        )}
                    </span>
                    Lowercase letter
                </li>
                <li
                    className={`flex items-center ${
                        checks.number ? "text-green-600" : "text-red-600"
                    }`}
                >
                    <span className="mr-2 text-sm">
                        {checks.number ? (
                            <FaCircleCheck className=" w-4 h-4" />
                        ) : (
                            <GoDotFill className=" w-4 h-4" />
                        )}
                    </span>
                    Number
                </li>
                <li
                    className={`flex items-center ${
                        checks.special ? "text-green-600" : "text-red-600"
                    }`}
                >
                    <span className="mr-2 text-sm">
                        {checks.special ? (
                            <FaCircleCheck className=" w-4 h-4" />
                        ) : (
                            <GoDotFill className=" w-4 h-4" />
                        )}
                    </span>
                    Special character
                </li>
            </ul>

            {suggestions.length > 0 && (
                <div
                    className="mt-2 text-xs text-muted-foreground"
                    aria-live="polite"
                >
                    {suggestions[0]}
                </div>
            )}
        </div>
    );
}
