/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const push = jest.fn();
let mockPathname = "/";

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push }),
    usePathname: () => mockPathname,
}));

jest.mock("next/link", () => ({
    __esModule: true,
    default: (props: any) => <a {...props} />,
}));

jest.mock("@/components/ui/dropdown", () => ({
    DropdownMenu: ({ children, onOpenChange }: any) => (
        <div data-testid="dropdown" data-openchange={!!onOpenChange}>
            {children}
        </div>
    ),
    DropdownMenuTrigger: ({ children }: any) => (
        <div data-testid="dropdown-trigger">{children}</div>
    ),
    DropdownMenuContent: ({ children }: any) => (
        <div role="menu" data-testid="dropdown-content">
            {children}
        </div>
    ),
    DropdownMenuGroup: ({ children }: any) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick, asChild, ...rest }: any) =>
        asChild ? (
            React.cloneElement(React.Children.only(children), { ...rest })
        ) : (
            <button role="menuitem" onClick={onClick} {...rest}>
                {children}
            </button>
        ),
    DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
}));

jest.mock("next/image", () => ({
    __esModule: true,
    // eslint-disable-next-line @next/next/no-img-element
    default: (props: any) => <img {...props} alt={props.alt ?? ""} />,
}));

const signOutMock = jest.fn();
jest.mock("@/hooks/use-sign-out", () => ({
    useSignOut: () => ({ signOut: signOutMock }),
}));

import { UserDropdown } from "../user-dropdown";

const user = {
    id: "u1",
    email: "u@example.com",
    name: "User One",
    username: "user1",
    role: "user",
} as any;

const admin = { ...user, role: "admin" } as any;

describe("<UserDropdown />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPathname = "/";
    });

    it("renders account/explore items and Sign out for logged-in user", () => {
        render(<UserDropdown user={user} />);

        expect(screen.getByRole("link", { name: /Account/i })).toHaveAttribute(
            "href",
            "/account"
        );
        expect(screen.getByRole("link", { name: /Profile/i })).toHaveAttribute(
            "href",
            "/account/profile"
        );
        expect(screen.getByRole("link", { name: /Orders/i })).toHaveAttribute(
            "href",
            "/account/orders"
        );

        expect(
            screen.getByRole("link", { name: /Image Gallery/i })
        ).toHaveAttribute("href", "/gallery-images");
        expect(
            screen.getByRole("link", { name: /Featured Designs/i })
        ).toHaveAttribute("href", "/featured-designs");

        expect(
            screen.getByRole("menuitem", { name: /Create Case/i })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("menuitem", { name: /Sign out/i })
        ).toBeInTheDocument();
    });

    it("routes Create Case via router.push, and signs out for logged-in user", async () => {
        const u = userEvent.setup();
        render(<UserDropdown user={user} />);

        await u.click(screen.getByRole("menuitem", { name: /Create Case/i }));
        expect(push).toHaveBeenCalledWith("/configure/upload");

        await u.click(screen.getByRole("menuitem", { name: /Sign out/i }));
        expect(signOutMock).toHaveBeenCalledTimes(1);
    });

    it("Admin section appears only for admin, with correct href", () => {
        render(<UserDropdown user={admin} />);

        const menu = screen.getByTestId("dropdown-content");
        expect(within(menu).getByText(/^Admin$/i)).toBeInTheDocument();

        const adminLink = screen.getByRole("link", {
            name: /Admin Dashboard/i,
        });
        expect(adminLink).toHaveAttribute("href", "/admin-dashboard/overview");
    });

    it("does not render Admin section for non-admin", () => {
        render(<UserDropdown user={user} />);
        expect(
            screen.queryByRole("link", { name: /Admin Dashboard/i })
        ).toBeNull();
    });

    it("renders Sign in and routes to /sign-in for anonymous user", async () => {
        const u = userEvent.setup();
        render(<UserDropdown user={null} />);

        const signInItem = screen.getByRole("menuitem", { name: /Sign in/i });
        await u.click(signInItem);
        expect(push).toHaveBeenCalledWith("/sign-in");
    });

    it("marks the correct link active using aria-current when pathname matches", () => {
        mockPathname = "/account/orders";
        render(<UserDropdown user={user} />);

        expect(screen.getByRole("link", { name: /Orders/i })).toHaveAttribute(
            "aria-current",
            "page"
        );
        expect(
            screen.getByRole("link", { name: /Account/i })
        ).not.toHaveAttribute("aria-current");
        expect(
            screen.getByRole("link", { name: /Profile/i })
        ).not.toHaveAttribute("aria-current");
    });

    it("marks explore link active when pathname matches", () => {
        mockPathname = "/featured-designs";
        render(<UserDropdown user={user} />);

        expect(
            screen.getByRole("link", { name: /Featured Designs/i })
        ).toHaveAttribute("aria-current", "page");
        expect(
            screen.getByRole("link", { name: /Image Gallery/i })
        ).not.toHaveAttribute("aria-current");
    });

    it("marks admin link active for admin when pathname matches", () => {
        mockPathname = "/admin-dashboard/overview";
        render(<UserDropdown user={admin} />);

        const adminLink = screen.getByRole("link", {
            name: /Admin Dashboard/i,
        });
        expect(adminLink).toHaveAttribute("aria-current", "page");
    });
});
