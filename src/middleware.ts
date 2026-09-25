import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import type { Session } from "../auth";

const authRoutes = ["/sign-in", "/sign-up"];
const passwordRoutes = [
    "/password-reset",
    "/forgot-password",
    "/email-verification",
];
const protectedRoutes = ["/account", "/order-details", "/configure"];
const adminRoutes = ["/admin-dashboard"];

function pathStartsWithAny(pathname: string, bases: string[]) {
    return bases.some((base) => pathname.startsWith(base));
}

export default async function authMiddleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    const isAuthRoute = authRoutes.includes(pathname);
    const isPasswordRoute = passwordRoutes.includes(pathname);
    const isProtectedRoute = pathStartsWithAny(pathname, protectedRoutes);
    const isAdminRoute = pathStartsWithAny(pathname, adminRoutes);

    const { data: session, error } = await betterFetch<Session>(
        "/api/auth/get-session",
        {
            baseURL: process.env.BETTER_AUTH_URL,
            headers: { cookie: request.headers.get("cookie") || "" },
        }
    );

    const isLoggedIn = !!session && !error;
    const isAdmin = !!session && session.user?.role === "admin";

    if (!isLoggedIn) {
        if (isAuthRoute || isPasswordRoute) return NextResponse.next();

        if (isAdminRoute) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }

        if (isProtectedRoute) {
            const signIn = new URL("/sign-in", request.url);
            signIn.searchParams.set(
                "redirectTo",
                `${pathname}${request.nextUrl.search}`
            );
            return NextResponse.redirect(signIn);
        }

        return NextResponse.next();
    }

    if (isAuthRoute || isPasswordRoute) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (isAdminRoute && !isAdmin) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
