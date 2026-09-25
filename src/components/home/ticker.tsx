const ITEMS = [
    "Printed to order",
    "Free FedEx shipping",
    "Delivered in up to 3 working days",
    "5-year print warranty",
    "Wireless charging compatible",
    "All major phone models",
];

const INKS = [
    "var(--process-c)",
    "var(--process-m)",
    "var(--process-y)",
    "var(--paper)",
];

function Run({ hidden }: { hidden?: boolean }) {
    return (
        <ul aria-hidden={hidden} className="flex shrink-0 items-center">
            {ITEMS.map((item, i) => (
                <li
                    key={item}
                    className="flex items-center gap-7 pr-7 font-mono text-[0.8125rem] font-medium uppercase tracking-[0.12em] whitespace-nowrap"
                >
                    <span>{item}</span>
                    <span
                        aria-hidden
                        className="size-2 rounded-full"
                        style={{ background: INKS[i % INKS.length] }}
                    />
                </li>
            ))}
        </ul>
    );
}

/** A running slug of facts across an ink band. */
export default function Ticker() {
    return (
        <section
            aria-label="Why DesignMyCase"
            className="overflow-hidden bg-ink py-4 text-paper"
        >
            <div className="flex w-max animate-ticker">
                <Run />
                <Run hidden />
                <Run hidden />
                <Run hidden />
            </div>
        </section>
    );
}
