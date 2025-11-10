"use client";

import * as React from "react";
import {
    motion,
    AnimatePresence,
    useReducedMotion,
    type Transition,
} from "framer-motion";
import { usePathname } from "next/navigation";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

function FrozenRouter({ children }: { children: React.ReactNode }) {
    const context = React.useContext(LayoutRouterContext);
    const frozen = React.useRef(context).current;
    if (!frozen) return <>{children}</>;
    return (
        <LayoutRouterContext.Provider value={frozen}>
            {children}
        </LayoutRouterContext.Provider>
    );
}

const STYLE: "fadeScale" | "directional" | "elevate" = "directional";

export default function PageTransitionEffect({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname() ?? "/";
    const reduceMotion = useReducedMotion();

    const depth = pathname.split("/").filter(Boolean).length;
    const prevDepthRef = React.useRef(depth);
    const direction = depth >= prevDepthRef.current ? 1 : -1;
    React.useEffect(() => {
        prevDepthRef.current = depth;
    }, [depth]);

    if (
        pathname === "/admin-dashboard" ||
        pathname.startsWith("/admin-dashboard/")
    ) {
        return <>{children}</>;
    }

    const spring: Transition = {
        type: "spring",
        stiffness: 420,
        damping: 36,
        mass: 0.9,
    };
    const timing: Transition = { ease: "easeInOut", duration: 0.5 };

    const fadeScale = {
        hidden: { opacity: 0, scale: reduceMotion ? 1 : 0.985 },
        enter: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: reduceMotion ? 1 : 0.995 },
        transition: reduceMotion ? timing : spring,
    };

    const directional = {
        hidden: {
            opacity: 0,
            x: reduceMotion ? 0 : 24 * direction,
            y: 0,
            filter: "blur(2px)",
        },
        enter: { opacity: 1, x: 0, y: 0, filter: "blur(0px)" },
        exit: {
            opacity: 0,
            x: reduceMotion ? 0 : -16 * direction,
            y: 0,
            filter: "blur(2px)",
        },
        transition: reduceMotion ? timing : spring,
    };

    const elevate = {
        hidden: {
            opacity: 0,
            y: reduceMotion ? 0 : 10,
            boxShadow: "0 0 0 rgba(0,0,0,0)",
            filter: "blur(3px)",
        },
        enter: {
            opacity: 1,
            y: 0,
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            filter: "blur(0px)",
        },
        exit: {
            opacity: 0,
            y: reduceMotion ? 0 : -8,
            boxShadow: "0 0 0 rgba(0,0,0,0)",
            filter: "blur(3px)",
        },
        transition: reduceMotion ? timing : spring,
    };

    const v =
        STYLE === "fadeScale"
            ? fadeScale
            : STYLE === "elevate"
            ? elevate
            : directional;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial="hidden"
                animate="enter"
                exit="exit"
                variants={{
                    hidden: v.hidden,
                    enter: v.enter,
                    exit: v.exit,
                }}
                transition={v.transition}
                className="will-change-transform"
            >
                <FrozenRouter>{children}</FrozenRouter>
            </motion.div>
        </AnimatePresence>
    );
}
