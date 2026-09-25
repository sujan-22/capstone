/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import Navbar from "../navbar";
import Link from "next/link";

let mockPathname = "/";
jest.mock("next/navigation", () => ({
    usePathname: () => mockPathname,
}));

jest.mock("../../utilities/max-width-wrapper", () => {
    return function MaxWidthWrapper({
        children,
    }: {
        children: React.ReactNode;
    }) {
        return <div data-testid="max-width-wrapper">{children}</div>;
    };
});

jest.mock("../../utilities/logo", () => {
    return function LogoMock() {
        return (
            <Link href="/" aria-label="logo">
                DESIGNMYCASE
            </Link>
        );
    };
});

jest.mock("../user-dropdown", () => ({
    UserDropdown: ({ user }: { user: any }) => (
        <div data-testid="user-dropdown" data-user={user ? "true" : "false"} />
    ),
}));

jest.mock("@/lib/utils", () => {
    const actual = jest.requireActual("@/lib/utils");
    return { ...actual };
});

const userFixture = { id: "user-123", email: "u@example.com" } as any;

describe("<Navbar />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPathname = "/";
    });

    it("renders Logo, main links and UserDropdown (no user)", () => {
        render(<Navbar user={null} />);

        expect(screen.getByLabelText("logo")).toBeInTheDocument();
        expect(screen.getByTestId("max-width-wrapper")).toBeInTheDocument();
        expect(screen.getByTestId("user-dropdown")).toHaveAttribute(
            "data-user",
            "false"
        );

        expect(screen.getByRole("link", { name: /^Gallery$/i })).toHaveAttribute(
            "href",
            "/gallery-images"
        );
        expect(
            screen.getByRole("link", { name: /Featured designs/i })
        ).toHaveAttribute("href", "/featured-designs");
    });

    it("sends signed-out visitors to sign in, then on to the editor", () => {
        render(<Navbar user={null} />);

        expect(screen.getByRole("link", { name: /^Sign in$/i })).toHaveAttribute(
            "href",
            "/sign-in"
        );
        expect(
            screen.getByRole("link", { name: /Create a case/i })
        ).toHaveAttribute("href", "/sign-in?redirectTo=%2Fconfigure%2Fupload");
    });

    it('links signed-in users straight to "/configure/upload"', () => {
        render(<Navbar user={userFixture} />);

        expect(
            screen.getByRole("link", { name: /Create a case/i })
        ).toHaveAttribute("href", "/configure/upload");
        expect(screen.queryByRole("link", { name: /^Sign in$/i })).toBeNull();
    });

    it("shows no create link for admins", () => {
        render(<Navbar user={{ ...userFixture, role: "admin" }} />);

        expect(screen.queryByRole("link", { name: /Create a case/i })).toBeNull();
    });

    it("marks the current section with aria-current", () => {
        mockPathname = "/gallery-images";
        render(<Navbar user={userFixture} />);

        expect(screen.getByRole("link", { name: /^Gallery$/i })).toHaveAttribute(
            "aria-current",
            "page"
        );
        expect(
            screen.getByRole("link", { name: /Featured designs/i })
        ).not.toHaveAttribute("aria-current");
    });

    it("passes user to UserDropdown when user is provided", () => {
        render(<Navbar user={userFixture} />);
        expect(screen.getByTestId("user-dropdown")).toHaveAttribute(
            "data-user",
            "true"
        );
    });
});
