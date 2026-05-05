import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/overview", "/bots", "/conversations", "/settings", "/widgets"];
const AUTH_PREFIXES = ["/login", "/register"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get("auth_session");
    const hasSession = sessionCookie?.value === "true";

    const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
    const isAuthPage = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

    if (isProtected && !hasSession) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthPage && hasSession) {
        const overviewUrl = new URL("/overview", request.url);
        return NextResponse.redirect(overviewUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/overview/:path*",
        "/bots/:path*",
        "/conversations/:path*",
        "/settings/:path*",
        "/widgets/:path*",
        "/login",
        "/register",
    ],
};
