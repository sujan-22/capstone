import { useMemo } from "react";

export type StrengthResult = {
    score: 0 | 1 | 2 | 3 | 4;
    label: "Too weak" | "Weak" | "Fair" | "Good" | "Strong";
    percent: number;
    suggestions: string[];
    checks: {
        length: boolean;
        lower: boolean;
        upper: boolean;
        number: boolean;
        special: boolean;
    };
};

export function usePasswordStrength(password: string): StrengthResult {
    const minLength = 8;

    return useMemo(() => {
        const checks = {
            length: password.length >= minLength,
            lower: /[a-z]/.test(password),
            upper: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password),
        };

        let points = 0;
        if (checks.length) points += 1;
        if (checks.lower) points += 1;
        if (checks.upper) points += 1;
        if (checks.number) points += 1;
        if (checks.special) points += 1;

        const rawScore = points;
        let score: StrengthResult["score"] = 0;
        if (!checks.length) score = 0;
        else if (rawScore <= 2) score = 1;
        else if (rawScore === 3) score = 2;
        else if (rawScore === 4) score = 3;
        else score = 4;

        const labelMap = [
            "Too weak",
            "Weak",
            "Fair",
            "Good",
            "Strong",
        ] as const;
        const percent = Math.round((score / 4) * 100);

        const suggestions: string[] = [];
        if (!checks.length)
            suggestions.push(`Use at least ${minLength} characters.`);
        if (!checks.upper) suggestions.push("Add an uppercase letter.");
        if (!checks.lower) suggestions.push("Add a lowercase letter.");
        if (!checks.number) suggestions.push("Add a number.");
        if (!checks.special)
            suggestions.push("Add a special character (e.g. !@#$%).");

        return {
            score,
            label: labelMap[score],
            percent,
            suggestions,
            checks,
        };
    }, [password]);
}
