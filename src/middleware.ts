import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import type { Session } from "../auth";

const authRoutes = ["/sign-in", "/sign-up"];
const passwordRoutes = [
    "/password-reset",
    "/forgot-password",
    "/email-verification",
];
const protectedRoutes = ["/account", "/order-details"];

export default async function authMiddleware(request: NextRequest) {
    const pathName = request.nextUrl.pathname;

    const isAuthRoute = authRoutes.includes(pathName);
    const isPasswordRoute = passwordRoutes.includes(pathName);
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathName.startsWith(route)
    );

    // Fetch session information
    const { data: session, error } = await betterFetch<Session>(
        "/api/auth/get-session",
        {
            baseURL: process.env.BETTER_AUTH_URL,
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        }
    );

    // If there's an error or no session (user not authenticated)
    if (error || !session) {
        // Allow access to auth and password routes
        if (isAuthRoute || isPasswordRoute) {
            return NextResponse.next();
        }

        // Redirect to sign-in for protected routes
        if (isProtectedRoute) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }

        // Allow access to public routes
        return NextResponse.next();
    }

    // User is authenticated
    // Redirect away from auth routes to home
    if (isAuthRoute || isPasswordRoute) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Allow access to all other routes
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
