import React from "react";
import { render, screen } from "@testing-library/react";
import SmallLogo from "../small-logo";

jest.mock("next/font/google", () => ({
    Italiana: () => ({ className: "font-italiana" }),
}));

jest.mock("@/lib/utils", () => ({
    cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

describe("<SmallLogo />", () => {
    it("renders brand text with proper structure", () => {
        render(<SmallLogo />);

        const logo = screen.getByText(/DESIGN/i);

        expect(logo).toBeInTheDocument();
        expect(logo).toHaveTextContent("DESIGNMYCASE");

        const blueSpan = screen.getByText("MY");
        expect(blueSpan).toHaveClass("text-blue-600");
    });

    it("applies Italiana font class and default styles", () => {
        render(<SmallLogo />);
        const logo = screen.getByText(/DESIGN/i);

        expect(logo.className).toMatch(/font-italiana/);
        expect(logo.className).toMatch(/text-primary/);
    });

    it("applies custom className when provided", () => {
        render(<SmallLogo className="extra-style" />);
        const logo = screen.getByText(/DESIGN/i);
        expect(logo.className).toMatch(/extra-style/);
    });
});
