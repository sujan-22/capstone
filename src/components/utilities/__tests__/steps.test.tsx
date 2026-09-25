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

jest.mock("lucide-react", () => ({
    Check: (props: any) => <svg data-testid="icon-check" {...props} />,
}));

const { usePathname } = jest.requireMock("next/navigation");

const stepFor = (label: string) => screen.getByText(label).closest("li")!;

describe("<Steps />", () => {
    it("renders all three steps in a labelled list", () => {
        usePathname.mockReturnValue("/configure/upload");
        render(<Steps />);

        expect(
            screen.getByRole("navigation", { name: /Design progress/i })
        ).toBeInTheDocument();
        expect(screen.getAllByRole("listitem")).toHaveLength(3);
        expect(screen.getByText("Upload your photo")).toBeInTheDocument();
        expect(screen.getByText("Place & customise")).toBeInTheDocument();
        expect(screen.getByText("Review your proof")).toBeInTheDocument();
    });

    it("marks the current step and nothing as done on the first step", () => {
        usePathname.mockReturnValue("/configure/upload");
        render(<Steps />);

        expect(stepFor("Upload your photo")).toHaveAttribute(
            "aria-current",
            "step"
        );
        expect(screen.queryAllByTestId("icon-check")).toHaveLength(0);
    });

    it("marks earlier steps as done when customising", () => {
        usePathname.mockReturnValue("/configure/customize/abc");
        render(<Steps />);

        expect(stepFor("Place & customise")).toHaveAttribute(
            "aria-current",
            "step"
        );
        expect(stepFor("Upload your photo")).not.toHaveAttribute("aria-current");
        expect(stepFor("Upload your photo")).toHaveTextContent("(done)");
        expect(stepFor("Review your proof")).not.toHaveTextContent("(done)");
        expect(screen.getAllByTestId("icon-check")).toHaveLength(1);
    });

    it("marks both earlier steps done on the proof", () => {
        usePathname.mockReturnValue("/configure/preview/abc");
        render(<Steps />);

        expect(stepFor("Review your proof")).toHaveAttribute(
            "aria-current",
            "step"
        );
        expect(screen.getAllByTestId("icon-check")).toHaveLength(2);
    });
});
