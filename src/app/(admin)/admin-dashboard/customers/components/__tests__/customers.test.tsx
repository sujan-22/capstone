/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

// Flatten the dropdown so its items are plain buttons in the DOM.
jest.mock("@/components/ui/dropdown", () => ({
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div role="menu">{children}</div>,
    DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
    DropdownMenuItem: ({ children, onClick, disabled }: any) => (
        <button role="menuitem" onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));

const banUser = jest.fn();
jest.mock("@/hooks/use-ban-user", () => ({
    useUserBanMutations: () => ({ banUser, unbanUser: jest.fn(), isPending: false }),
}));

const adminSafeDeleteUser = jest.fn().mockResolvedValue({ ok: true });
jest.mock("../../actions/actions", () => ({
    adminCustomersKeys: { all: ["admin-customers"] },
    adminSafeDeleteUser: (...args: any[]) => adminSafeDeleteUser(...args),
}));

import { CustomersTable } from "../customers";

const rows: any[] = [
    {
        id: "u1",
        name: "Ada Lovelace",
        username: "ada",
        email: "ada@example.com",
        createdAt: "2025-09-01T00:00:00.000Z",
        ordersCount: 3,
        revenue: 84.69,
        lastOrderAt: "2025-09-20T00:00:00.000Z",
        role: "user",
        banned: false,
        banReason: null,
        banExpires: null,
    },
];

function renderTable() {
    const qc = new QueryClient();
    return render(
        <QueryClientProvider client={qc}>
            <CustomersTable
                rows={rows}
                onToggleAdmin={jest.fn()}
                currentUserId="admin-1"
            />
        </QueryClientProvider>
    );
}

describe("<CustomersTable />", () => {
    beforeEach(() => jest.clearAllMocks());

    it("shows revenue in Canadian dollars", () => {
        renderTable();
        expect(screen.getByText("CA$84.69")).toBeInTheDocument();
    });

    it("asks for confirmation before deleting, and deletes only on confirm", async () => {
        const user = userEvent.setup();
        renderTable();

        await user.click(screen.getByRole("menuitem", { name: /Delete user/ }));
        expect(adminSafeDeleteUser).not.toHaveBeenCalled();

        const dialog = await screen.findByRole("alertdialog");
        expect(within(dialog).getByText(/Delete Ada Lovelace\?/)).toBeInTheDocument();

        await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
        expect(adminSafeDeleteUser).not.toHaveBeenCalled();

        await user.click(screen.getByRole("menuitem", { name: /Delete user/ }));
        await user.click(
            within(await screen.findByRole("alertdialog")).getByRole("button", {
                name: "Delete user",
            })
        );
        expect(adminSafeDeleteUser).toHaveBeenCalledWith({ userId: "u1" });
    });

    it("asks for confirmation before banning", async () => {
        const user = userEvent.setup();
        renderTable();

        await user.click(screen.getByRole("menuitem", { name: /Ban for 7 days/ }));
        expect(banUser).not.toHaveBeenCalled();

        await user.click(
            within(await screen.findByRole("alertdialog")).getByRole("button", {
                name: "Ban user",
            })
        );
        expect(banUser).toHaveBeenCalledWith(
            expect.objectContaining({ userId: "u1", banExpiresIn: 604800 })
        );
    });

    it("never offers to delete or ban yourself", () => {
        const qc = new QueryClient();
        render(
            <QueryClientProvider client={qc}>
                <CustomersTable rows={rows} onToggleAdmin={jest.fn()} currentUserId="u1" />
            </QueryClientProvider>
        );
        expect(screen.queryByRole("menuitem", { name: /Delete user/ })).toBeNull();
        expect(screen.queryByRole("menuitem", { name: /Ban/ })).toBeNull();
    });
});
