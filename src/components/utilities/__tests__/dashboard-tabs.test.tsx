/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardTabs from "../dashboard-tabs";

const push = jest.fn();
let mockPathname = "/admin-dashboard";

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push }),
    usePathname: () => mockPathname,
}));

const TabsContext = React.createContext<{
    value: string;
    onValueChange: (v: string) => void;
}>({ value: "", onValueChange: () => {} });

function MockTabs(props: any) {
    const { value, onValueChange, children } = props;
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div data-testid="tabs">{children}</div>
        </TabsContext.Provider>
    );
}

function MockTabsList(props: any) {
    return <div data-testid="tabs-list">{props.children}</div>;
}

function MockTabsTrigger(props: any) {
    const ctx = React.useContext(TabsContext);
    const selected = ctx.value === props.value;
    return (
        <button
            role="tab"
            aria-selected={selected ? "true" : "false"}
            onClick={() => ctx.onValueChange(props.value)}
        >
            {props.children}
        </button>
    );
}

jest.mock("../../ui/tabs", () => ({
    Tabs: (props: any) => <MockTabs {...props} />,
    TabsList: (props: any) => <MockTabsList {...props} />,
    TabsTrigger: (props: any) => <MockTabsTrigger {...props} />,
}));

describe("<DashboardTabs />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPathname = "/admin-dashboard";
    });

    it('defaults active tab to "overview" when at base route', () => {
        render(<DashboardTabs />);

        expect(screen.getByRole("tab", { name: /overview/i })).toHaveAttribute(
            "aria-selected",
            "true"
        );
        expect(screen.getByRole("tab", { name: /customers/i })).toHaveAttribute(
            "aria-selected",
            "false"
        );
    });

    it("computes active tab from pathname segment", () => {
        mockPathname = "/admin-dashboard/orders";
        render(<DashboardTabs />);

        expect(screen.getByRole("tab", { name: /orders/i })).toHaveAttribute(
            "aria-selected",
            "true"
        );
        expect(screen.getByRole("tab", { name: /overview/i })).toHaveAttribute(
            "aria-selected",
            "false"
        );
    });

    it("falls back to overview when segment is unknown", () => {
        mockPathname = "/admin-dashboard/unknown-seg";
        render(<DashboardTabs />);

        expect(screen.getByRole("tab", { name: /overview/i })).toHaveAttribute(
            "aria-selected",
            "true"
        );
    });

    it("navigates to selected tab on click", async () => {
        const user = userEvent.setup();
        render(<DashboardTabs />);

        await user.click(screen.getByRole("tab", { name: /customers/i }));
        expect(push).toHaveBeenCalledWith("/admin-dashboard/customers");

        await user.click(screen.getByRole("tab", { name: /images/i }));
        expect(push).toHaveBeenCalledWith("/admin-dashboard/images");
    });
});
