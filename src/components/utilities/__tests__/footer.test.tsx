import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../footer";

jest.mock("../max-width-wrapper", () => {
    return function MockMaxWidthWrapper({
        children,
    }: {
        children: React.ReactNode;
    }) {
        return <div data-testid="max-width-wrapper">{children}</div>;
    };
});

jest.mock("../small-logo", () => {
    return function MockSmallLogo({ className }: { className?: string }) {
        return (
            <span data-testid="small-logo" className={className}>
                MockLogo
            </span>
        );
    };
});

describe("<Footer />", () => {
    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(new Date("2025-10-09"));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it("renders footer content and shows current year", () => {
        render(<Footer />);

        const footer = screen.getByRole("contentinfo");
        expect(footer).toBeInTheDocument();

        expect(screen.getByText(/2025/)).toBeInTheDocument();

        expect(screen.getByTestId("small-logo")).toBeInTheDocument();

        expect(screen.getByTestId("max-width-wrapper")).toBeInTheDocument();

        expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
    });
});
