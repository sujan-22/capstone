import { ALLOW_HOSTS } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const target = url.searchParams.get("url");
    if (!target)
        return NextResponse.json({ error: "Missing url" }, { status: 400 });

    let u: URL;
    try {
        u = new URL(target);
    } catch {
        return NextResponse.json({ error: "Bad url" }, { status: 400 });
    }

    if (!ALLOW_HOSTS.has(u.hostname)) {
        return NextResponse.json(
            { error: "Host not allowed" },
            { status: 403 }
        );
    }

    const resp = await fetch(u.toString(), { cache: "no-store" });
    if (!resp.ok)
        return NextResponse.json({ error: "Upstream error" }, { status: 502 });

    const headers = new Headers(resp.headers);
    headers.set("Cache-Control", "private, no-store");
    headers.set("Cross-Origin-Resource-Policy", "cross-origin");

    return new NextResponse(resp.body, { status: 200, headers });
}
