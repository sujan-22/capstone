import React from "react";
import { render, screen } from "@testing-library/react";

let mockPathname = "/admin-dashboard";

jest.mock("next/navigation", () => ({
    usePathname: () => mockPathname,
}));

import AdminSubnav from "../dashboard-tabs";

describe("<AdminSubnav />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPathname = "/admin-dashboard";
    });

    it("renders all admin links with correct hrefs", () => {
        render(<AdminSubnav />);

        expect(screen.getByRole("link", { name: /overview/i })).toHaveAttribute(
            "href",
            "/admin-dashboard/overview"
        );
        expect(
            screen.getByRole("link", { name: /customers/i })
        ).toHaveAttribute("href", "/admin-dashboard/customers");
        expect(screen.getByRole("link", { name: /catalog/i })).toHaveAttribute(
            "href",
            "/admin-dashboard/catalog"
        );
        expect(screen.getByRole("link", { name: /orders/i })).toHaveAttribute(
            "href",
            "/admin-dashboard/orders"
        );
        expect(screen.getByRole("link", { name: /images/i })).toHaveAttribute(
            "href",
            "/admin-dashboard/images"
        );
    });

    it("shows no active link at the base route (/admin-dashboard)", () => {
        mockPathname = "/admin-dashboard";
        render(<AdminSubnav />);

        // None should have aria-current at the base path
        expect(
            screen.getByRole("link", { name: /overview/i })
        ).not.toHaveAttribute("aria-current");
        expect(
            screen.getByRole("link", { name: /customers/i })
        ).not.toHaveAttribute("aria-current");
        expect(
            screen.getByRole("link", { name: /catalog/i })
        ).not.toHaveAttribute("aria-current");
        expect(
            screen.getByRole("link", { name: /orders/i })
        ).not.toHaveAttribute("aria-current");
        expect(
            screen.getByRole("link", { name: /images/i })
        ).not.toHaveAttribute("aria-current");
    });

    it("marks a link active when pathname starts with its href (orders)", () => {
        mockPathname = "/admin-dashboard/orders";
        render(<AdminSubnav />);

        expect(screen.getByRole("link", { name: /orders/i })).toHaveAttribute(
            "aria-current",
            "page"
        );
        expect(
            screen.getByRole("link", { name: /overview/i })
        ).not.toHaveAttribute("aria-current");
    });

    it("marks a link active for nested routes under the same section (customers subpage)", () => {
        mockPathname = "/admin-dashboard/customers/123";
        render(<AdminSubnav />);

        expect(
            screen.getByRole("link", { name: /customers/i })
        ).toHaveAttribute("aria-current", "page");
        expect(
            screen.getByRole("link", { name: /orders/i })
        ).not.toHaveAttribute("aria-current");
    });

    it("shows no active link for unknown segments", () => {
        mockPathname = "/admin-dashboard/unknown-seg";
        render(<AdminSubnav />);

        expect(
            screen.getByRole("link", { name: /overview/i })
        ).not.toHaveAttribute("aria-current");
        expect(
            screen.getByRole("link", { name: /customers/i })
        ).not.toHaveAttribute("aria-current");
        expect(
            screen.getByRole("link", { name: /catalog/i })
        ).not.toHaveAttribute("aria-current");
        expect(
            screen.getByRole("link", { name: /orders/i })
        ).not.toHaveAttribute("aria-current");
        expect(
            screen.getByRole("link", { name: /images/i })
        ).not.toHaveAttribute("aria-current");
    });
});
