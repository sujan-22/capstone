import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorMessage from "../error";

jest.mock("../../ui/button", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Button: ({ children, onClick, ...rest }: any) => (
        <button onClick={onClick} {...rest}>
            {children}
        </button>
    ),
}));

describe("<ErrorMessage />", () => {
    it("renders with the default message and no retry button", () => {
        render(<ErrorMessage />);

        expect(screen.getByText("Something went wrong.")).toBeInTheDocument();

        expect(screen.queryByRole("button", { name: /Retry/i })).toBeNull();
    });

    it("renders with a custom message", () => {
        render(<ErrorMessage message="Custom error occurred." />);
        expect(screen.getByText("Custom error occurred.")).toBeInTheDocument();
    });

    it("renders a Retry button when onRetry is provided and calls it when clicked", async () => {
        const handleRetry = jest.fn();
        const user = userEvent.setup();

        render(
            <ErrorMessage message="Failed to load data" onRetry={handleRetry} />
        );

        const retryBtn = screen.getByRole("button", { name: /Retry/i });
        expect(retryBtn).toBeInTheDocument();

        await user.click(retryBtn);
        expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it("applies the provided custom className", () => {
        render(<ErrorMessage className="extra-class" />);
        const container = screen.getByText(
            "Something went wrong."
        ).parentElement;
        expect(container?.className).toMatch(/extra-class/);
    });
});
