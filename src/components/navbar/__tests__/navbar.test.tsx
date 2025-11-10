/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "../navbar";
import Link from "next/link";

const push = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push }),
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
    });

    it("renders Logo and UserDropdown (no user)", () => {
        render(<Navbar user={null} />);

        expect(screen.getByLabelText("logo")).toBeInTheDocument();
        expect(screen.getByTestId("max-width-wrapper")).toBeInTheDocument();
        expect(screen.getByTestId("user-dropdown")).toHaveAttribute(
            "data-user",
            "false"
        );

        expect(
            screen.getByRole("button", { name: /Sign in/i })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /Create Case/i })
        ).toBeNull();
    });

    it('navigates to "/configure/upload" when "Create Case" is clicked', async () => {
        const user = userEvent.setup();
        render(<Navbar user={userFixture} />);

        const createBtn = screen.getByRole("button", { name: /Create Case/i });
        await user.click(createBtn);

        expect(push).toHaveBeenCalledTimes(1);
        expect(push).toHaveBeenCalledWith("/configure/upload");
    });

    it("passes user to UserDropdown when user is provided", () => {
        render(<Navbar user={userFixture} />);
        expect(screen.getByTestId("user-dropdown")).toHaveAttribute(
            "data-user",
            "true"
        );
    });
});
