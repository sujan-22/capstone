"use client";

import { MotionConfig } from "framer-motion";

// Honour the OS "reduce motion" setting everywhere from one place, instead of
// branching on useReducedMotion() in render (that resolves differently on the
// server and the client and causes hydration mismatches).
export default function MotionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
