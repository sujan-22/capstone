/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { TextEncoder, TextDecoder } from "util";

const isNodeEnv = typeof (globalThis as any).window === "undefined";

if (isNodeEnv) {
    (async () => {
        const undici = await import("undici");
        (globalThis as any).fetch = undici.fetch;
        (globalThis as any).Headers = undici.Headers;
        (globalThis as any).Request = undici.Request;
        (globalThis as any).Response = undici.Response;
    })();

    if (!(globalThis as any).TextEncoder || !(globalThis as any).TextDecoder) {
        (globalThis as any).TextEncoder = TextEncoder;
        (globalThis as any).TextDecoder = TextDecoder;
    }

    if (typeof (globalThis as any).Response.json !== "function") {
        (globalThis as any).Response.json = (
            data: unknown,
            init?: ResponseInit
        ) =>
            new Response(JSON.stringify(data), {
                headers: { "content-type": "application/json" },
                ...init,
            });
    }
}

afterEach(() => cleanup());
