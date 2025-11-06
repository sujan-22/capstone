import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

type SwatchGridProps = {
    value: string;
    onChange: (hex: string) => void;
    colors: readonly string[];
    columns?: number;
    disabled?: boolean;
};

function hexToRgb(hex: string) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
    if (!m) return { r: 0, g: 0, b: 0 };
    return {
        r: parseInt(m[1], 16),
        g: parseInt(m[2], 16),
        b: parseInt(m[3], 16),
    };
}

function isDark(hex: string) {
    const { r, g, b } = hexToRgb(hex);
    const [R, G, B] = [r, g, b].map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    return L < 0.5;
}

export function SwatchGrid({
    value,
    onChange,
    colors,
    columns = 6,
    disabled = false,
}: SwatchGridProps) {
    return (
        <div
            className="grid gap-2"
            style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
            role="listbox"
            aria-label="Available colors"
        >
            {colors.map((c) => {
                const selected = value.toLowerCase() === c.toLowerCase();
                const dark = isDark(c);
                const ringContrast = dark ? "ring-white" : "ring-black";

                return (
                    <Button
                        key={c}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        disabled={disabled}
                        onClick={() => onChange(c)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onChange(c);
                            }
                        }}
                        className={[
                            "relative h-9 w-auto rounded-md border p-0 transition",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            selected
                                ? [
                                      "ring-2",
                                      ringContrast,
                                      "ring-offset-2",
                                      "ring-offset-background",
                                      "border-transparent",
                                  ].join(" ")
                                : "hover:scale-[1.03] border-black/10 dark:border-white/10",
                        ].join(" ")}
                        style={{ backgroundColor: c }}
                        title={c}
                    >
                        {selected && (
                            <Check className="w-4 h-4 mix-blend-difference" />
                        )}
                        <span className="sr-only">{c}</span>
                    </Button>
                );
            })}
        </div>
    );
}
