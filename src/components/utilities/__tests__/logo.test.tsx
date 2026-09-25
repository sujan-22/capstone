import React from "react";
import { render, screen } from "@testing-library/react";
import Logo, { BrandMark } from "../logo";

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

describe("<Logo />", () => {
    it("renders the wordmark and links to home", () => {
        render(<Logo />);

        const link = screen.getByRole("link", { name: /design my case/i });
        expect(link).toHaveAttribute("href", "/");
        expect(link).toHaveTextContent("designmycase");
        expect(link.querySelector("svg")).toBeInTheDocument();
    });

    it("sets 'my' in the accent colour", () => {
        render(<Logo />);
        expect(screen.getByText("my")).toHaveClass("text-cobalt");
    });

    it("accepts a custom className", () => {
        render(<Logo className="extra" />);
        expect(screen.getByRole("link", { name: /design my case/i })).toHaveClass(
            "extra"
        );
    });
});

describe("<BrandMark />", () => {
    it("is decorative and sized by prop", () => {
        const { container } = render(<BrandMark size={40} />);
        const svg = container.querySelector("svg");
        expect(svg).toHaveAttribute("aria-hidden");
        expect(svg).toHaveAttribute("width", "40");
    });
});
