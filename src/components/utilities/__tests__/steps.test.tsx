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
    Upload: (props: any) => <svg data-testid="icon-upload" {...props} />,
    Settings: (props: any) => <svg data-testid="icon-settings" {...props} />,
    Inspect: (props: any) => <svg data-testid="icon-inspect" {...props} />,
}));

const { usePathname } = jest.requireMock("next/navigation");

describe("<Steps />", () => {
    it("renders all steps", () => {
        usePathname.mockReturnValue("/configure/upload");
        render(<Steps />);

        expect(screen.getByText("Choose an Image")).toBeInTheDocument();
        expect(screen.getByText("Customize Your Case")).toBeInTheDocument();
        expect(screen.getByText("Review Your Selections")).toBeInTheDocument();
        expect(screen.getAllByTestId("separator").length).toBe(2);
    });

    it("marks the current step as active and previous as completed", () => {
        usePathname.mockReturnValue("/configure/customize");
        render(<Steps />);

        const activeButton = screen
            .getAllByRole("button")
            .find((b) => b.getAttribute("aria-current") === "step");
        expect(activeButton).toBeTruthy();

        const prevLabel = screen.getByText("Choose an Image");
        expect(prevLabel.className).toContain("text-blue-600");

        const activeLabel = screen.getByText("Customize Your Case");
        expect(activeLabel.className).toContain("text-primary");

        const nextLabel = screen.getByText("Review Your Selections");
        expect(nextLabel.className).toContain("text-muted-foreground");
    });

    it("renders separators between steps", () => {
        usePathname.mockReturnValue("/configure/upload");
        render(<Steps />);
        expect(screen.getAllByTestId("separator").length).toBe(2);
    });

    it("marks all previous steps completed and last active when on last step", () => {
        usePathname.mockReturnValue("/configure/preview");
        render(<Steps />);

        expect(screen.getByText("Choose an Image").className).toContain(
            "text-blue-600"
        );
        expect(screen.getByText("Customize Your Case").className).toContain(
            "text-blue-600"
        );

        const lastLabel = screen.getByText("Review Your Selections");
        expect(lastLabel.className).toContain("text-primary");

        const activeButton = screen
            .getAllByRole("button")
            .find((b) => b.getAttribute("aria-current") === "step");
        expect(activeButton).toBeTruthy();
    });
});
