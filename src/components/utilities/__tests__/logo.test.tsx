import React from "react";
import { render, screen } from "@testing-library/react";
import Logo from "../logo";

import { AnchorHTMLAttributes, ReactNode } from "react";

jest.mock("next/link", () => {
    const MockLink = ({
        href,
        children,
        ...rest
    }: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    );
    MockLink.displayName = "MockLink";
    return MockLink;
});

jest.mock("next/font/google", () => ({
    Italiana: () => ({ className: "font-italiana" }),
}));

describe("<Logo />", () => {
    it("renders brand text and links to home", () => {
        render(<Logo />);

        const link = screen.getByRole("link", { name: /design my case/i });
        expect(link).toHaveAttribute("href", "/");

        expect(link).toHaveTextContent(/DESIGN/i);
        expect(link).toHaveTextContent(/MY/i);
        expect(link).toHaveTextContent(/CASE/i);

        expect(link.className).toMatch(/font-italiana/);
    });
});
