import React from "react";
import { render, screen } from "@testing-library/react";
import SmallLogo from "../small-logo";

jest.mock("@/lib/utils", () => ({
    cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

describe("<SmallLogo />", () => {
    it("renders the brand name with 'My' in the accent colour", () => {
        render(<SmallLogo />);

        const logo = screen.getByText(/Design/);
        expect(logo).toHaveTextContent("DesignMyCase");
        expect(screen.getByText("My")).toHaveClass("text-cobalt");
    });

    it("applies default styles", () => {
        render(<SmallLogo />);
        expect(screen.getByText(/Design/).className).toMatch(/font-bold/);
    });

    it("applies custom className when provided", () => {
        render(<SmallLogo className="extra-style" />);
        expect(screen.getByText(/Design/).className).toMatch(/extra-style/);
    });
});
