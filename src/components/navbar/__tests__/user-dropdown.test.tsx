/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserDropdown } from "../user-dropdown";

const push = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push }),
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
    DropdownMenuItem: ({ children, onClick }: any) => (
        <button role="menuitem" onClick={onClick}>
            {children}
        </button>
    ),
    DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
}));

jest.mock("@/lib/utils", () => {
    const actual = jest.requireActual("@/lib/utils");
    return { ...actual };
});

jest.mock("next/image", () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} alt={props.alt} />;
    },
}));

const signOutMock = jest.fn();
jest.mock("@/hooks/use-sign-out", () => ({
    useSignOut: () => ({ signOut: signOutMock }),
}));

const user = {
    id: "u1",
    email: "u@example.com",
    name: "User One",
    username: "user1",
    role: "user",
} as any;

const admin = {
    ...user,
    role: "admin",
} as any;

describe("<UserDropdown />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders account and explore items and shows Sign out for logged-in user", () => {
        render(<UserDropdown user={user} />);

        expect(screen.getByText(/My Account/i)).toBeInTheDocument();
        expect(
            screen.getByRole("menuitem", { name: /Account/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("menuitem", { name: /Profile/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("menuitem", { name: /Orders/i })
        ).toBeInTheDocument();

        expect(screen.getByText(/Explore/i)).toBeInTheDocument();
        expect(
            screen.getByRole("menuitem", { name: /Image Gallery/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("menuitem", { name: /Featured Designs/i })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("menuitem", { name: /Create Case/i })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("menuitem", { name: /Sign out/i })
        ).toBeInTheDocument();
    });

    it("navigates to correct routes when items are clicked", async () => {
        const u = userEvent.setup();
        render(<UserDropdown user={user} />);

        await u.click(screen.getByRole("menuitem", { name: /Account/i }));
        expect(push).toHaveBeenCalledWith("/account");

        await u.click(screen.getByRole("menuitem", { name: /Profile/i }));
        expect(push).toHaveBeenCalledWith("/account/profile");

        await u.click(screen.getByRole("menuitem", { name: /Orders/i }));
        expect(push).toHaveBeenCalledWith("/account/orders");

        await u.click(screen.getByRole("menuitem", { name: /Image Gallery/i }));
        expect(push).toHaveBeenCalledWith("/gallery-images");

        await u.click(
            screen.getByRole("menuitem", { name: /Featured Designs/i })
        );
        expect(push).toHaveBeenCalledWith("/featured-designs");

        await u.click(screen.getByRole("menuitem", { name: /Create Case/i }));
        expect(push).toHaveBeenCalledWith("/configure/upload");
    });

    it("shows Admin section only for admin and navigates correctly", async () => {
        const u = userEvent.setup();
        render(<UserDropdown user={admin} />);

        expect(screen.getByText(/^Admin$/i)).toBeInTheDocument();
        const adminItem = screen.getByRole("menuitem", {
            name: /Admin Dashboard/i,
        });
        expect(adminItem).toBeInTheDocument();

        await u.click(adminItem);
        expect(push).toHaveBeenCalledWith("/admin-dashboard/overview");
    });

    it("does not render Admin section for non-admin", () => {
        render(<UserDropdown user={user} />);
        expect(
            screen.queryByRole("menuitem", { name: /Admin Dashboard/i })
        ).toBeNull();
    });

    it("calls signOut when 'Sign out' clicked for logged-in user", async () => {
        const u = userEvent.setup();
        render(<UserDropdown user={user} />);

        await u.click(screen.getByRole("menuitem", { name: /Sign out/i }));
        expect(signOutMock).toHaveBeenCalledTimes(1);
    });

    it("navigates to sign-in when 'Sign in' clicked for anonymous user", async () => {
        const u = userEvent.setup();
        render(<UserDropdown user={null} />);

        const signInItem = screen.getByRole("menuitem", { name: /Sign in/i });
        await u.click(signInItem);
        expect(push).toHaveBeenCalledWith("/sign-in");
    });
});
