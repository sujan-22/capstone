/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import Steps from "../steps";

jest.mock("next/navigation", () => ({
    usePathname: jest.fn(),
}));
jest.mock("@/lib/utils", () => ({
    cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));
jest.mock("../../ui/button", () => ({
    Button: ({ children, ...rest }: any) => (
        <button {...rest}>{children}</button>
    ),
}));
jest.mock("../../ui/separator", () => ({
    Separator: (props: any) => <hr data-testid="separator" {...props} />,
}));
jest.mock("lucide-react", () => ({
    Check: (props: any) => <svg data-testid="check" {...props} />,
}));

const { usePathname } = jest.requireMock("next/navigation");

describe("<Steps />", () => {
    it("renders all steps", () => {
        usePathname.mockReturnValue("/configure/upload");
        render(<Steps />);

        expect(screen.getByText("Choose an Image")).toBeInTheDocument();
        expect(screen.getByText("Customize Your Case")).toBeInTheDocument();
        expect(screen.getByText("Review Your Selections")).toBeInTheDocument();
    });

    it("marks the current step as active and previous as completed", () => {
        // Must exactly match href from steps array
        usePathname.mockReturnValue("/configure/customize");
        render(<Steps />);

        const buttons = screen.getAllByRole("button");
        expect(screen.getAllByTestId("check").length).toBe(1);

        // Only one should be active
        const activeButton = buttons.find((btn) =>
            btn.getAttribute("aria-current")
        );
        expect(activeButton).toHaveAttribute("aria-current", "step");
    });

    it("renders separators between steps", () => {
        usePathname.mockReturnValue("/configure/upload");
        render(<Steps />);
        expect(screen.getAllByTestId("separator").length).toBe(2);
    });

    it("marks all steps completed when on last step", () => {
        usePathname.mockReturnValue("/configure/preview");
        render(<Steps />);

        expect(screen.getAllByTestId("check").length).toBe(2);
        const activeButton = screen
            .getAllByRole("button")
            .find((b) => b.getAttribute("aria-current"));
        expect(activeButton).toHaveAttribute("aria-current", "step");
    });
});
