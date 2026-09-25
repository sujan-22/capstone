import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt =
    "DesignMyCase: custom phone cases printed from your own photos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f2efe8";
const INK = "#141414";
const COBALT = "#2a36f0";
const PROCESS = ["#00a3e0", "#e6007e", "#ffe500", "#141414", "#2e3192", "#e4202a", "#00a651"];

function Mark({ x, y, color = INK }: { x: number; y: number; color?: string }) {
    return (
        <div style={{ position: "absolute", left: x, top: y, width: 22, height: 22, display: "flex" }}>
            <div style={{ position: "absolute", left: 10.5, top: 0, width: 1, height: 22, background: color }} />
            <div style={{ position: "absolute", left: 0, top: 10.5, width: 22, height: 1, background: color }} />
            <div style={{ position: "absolute", left: 4, top: 4, width: 14, height: 14, borderRadius: 7, border: `1px solid ${color}` }} />
        </div>
    );
}

export default async function Image() {
    const dir = path.join(process.cwd(), "src/assets/og");
    const [display, mono, caseImage] = await Promise.all([
        readFile(path.join(dir, "archivo-expanded-800.woff")),
        readFile(path.join(dir, "geist-mono-500.woff")),
        readFile(path.join(dir, "case.jpg")),
    ]);
    const caseSrc = `data:image/jpeg;base64,${caseImage.toString("base64")}`;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    background: PAPER,
                    color: INK,
                    position: "relative",
                    fontFamily: "Archivo",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "64px 0 60px 72px",
                        width: 700,
                    }}
                >
                    <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 18, letterSpacing: 2.4, color: "#5e5b53" }}>
                        CUSTOM PHONE CASES · PRINTED TO ORDER
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", fontSize: 156, lineHeight: 0.84, letterSpacing: -8 }}>
                        <span>One</span>
                        <span style={{ display: "flex" }}>
                            of one<span style={{ color: COBALT }}>.</span>
                        </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                        <span style={{ fontSize: 38, letterSpacing: -2 }}>
                            design<span style={{ color: COBALT }}>my</span>case
                        </span>
                        <div style={{ display: "flex" }}>
                            {PROCESS.map((c) => (
                                <div key={c} style={{ width: 14, height: 14, background: c }} />
                            ))}
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        top: 70,
                        bottom: 70,
                        width: 420,
                        background: COBALT,
                        display: "flex",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        right: 120,
                        top: 34,
                        width: 360,
                        height: 562,
                        background: "#fbfaf7",
                        transform: "rotate(-3deg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 30px 60px rgba(20,20,20,0.35)",
                    }}
                >
                    <div style={{ position: "absolute", left: 20, top: 16, display: "flex", fontFamily: "Geist Mono", fontSize: 13, letterSpacing: 1.6, color: "#5e5b53" }}>
                        PROOF 01 · 1 OF 1
                    </div>
                    <Mark x={12} y={270} />
                    <Mark x={326} y={270} />
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <img src={caseSrc} width={220} height={450} style={{ borderRadius: 30 }} />
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [
                { name: "Archivo", data: display, weight: 800, style: "normal" },
                { name: "Geist Mono", data: mono, weight: 500, style: "normal" },
            ],
        }
    );
}
