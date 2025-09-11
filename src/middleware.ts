import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import type { Session } from "../auth";

const authRoutes = ["/sign-in", "/sign-up"];
const passwordRoutes = [
    "/password-reset",
    "/forgot-password",
    "/email-verification",
];

export default async function authMiddleware(request: NextRequest) {
    const pathName = request.nextUrl.pathname;

    const isAuthRoute = authRoutes.includes(pathName);
    const isPasswordRoute = passwordRoutes.includes(pathName);

    const { data: session, error } = await betterFetch<Session>(
        "/api/auth/get-session",
        {
            baseURL: process.env.BETTER_AUTH_URL,
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        }
    );
    if (error || !session) {
        if (isAuthRoute || isPasswordRoute) {
            return NextResponse.next();
        }

        return NextResponse.next();
    }

    if (isAuthRoute || isPasswordRoute) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
