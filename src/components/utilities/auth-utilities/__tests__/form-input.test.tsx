/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormInput from "../form-input";

jest.mock("@/components/ui/button", () => ({
    Button: ({ children, onClick, ...rest }: any) => (
        <button onClick={onClick} {...rest}>
            {children}
        </button>
    ),
}));
jest.mock("@/components/ui/input", () => ({
    Input: (props: any) => <input {...props} />,
}));
jest.mock("@/components/ui/form", () => ({
    FormField: ({ render }: any) =>
        render({ field: { name: "mock", onChange: jest.fn() } }),
    FormLabel: (props: any) => <label {...props} />,
    FormControl: (props: any) => <div {...props} />,
    FormMessage: () => <p data-testid="form-message" />,
}));
jest.mock("react-icons/fa", () => ({
    FaRegEye: () => <svg data-testid="eye" />,
    FaRegEyeSlash: () => <svg data-testid="eye-slash" />,
}));

describe("<FormInput />", () => {
    it("renders label and input correctly", () => {
        render(
            <FormInput
                name="email"
                label="Email"
                placeHolder="Enter email"
                type="text"
            />
        );

        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        const input = screen.getByPlaceholderText("Enter email");
        expect(input).toHaveAttribute("type", "text");
    });

    it("renders password toggle button for password fields", () => {
        render(
            <FormInput
                name="password"
                label="Password"
                placeHolder="Enter password"
                type="password"
            />
        );

        expect(screen.getByTestId("eye")).toBeInTheDocument();
        const toggleBtn = screen.getByRole("button");
        expect(toggleBtn).toBeInTheDocument();
    });

    it("toggles password visibility when eye button is clicked", async () => {
        const u = userEvent.setup();
        render(
            <FormInput
                name="password"
                label="Password"
                placeHolder="Enter password"
                type="password"
            />
        );

        const input = screen.getByPlaceholderText("Enter password");
        expect(input).toHaveAttribute("type", "password");

        const toggleBtn = screen.getByRole("button");
        await u.click(toggleBtn);

        expect(input).toHaveAttribute("type", "text");
        expect(screen.getByTestId("eye-slash")).toBeInTheDocument();
    });
});
