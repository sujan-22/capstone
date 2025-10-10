export function makeReq(headers?: Record<string, string>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { headers: new Headers(headers ?? {}) } as any;
}
