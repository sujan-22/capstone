/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import CalltoActionReviewDesign from "../cta-review";
import userEvent from "@testing-library/user-event";

jest.mock("../custom-image", () => {
    return function MockCustomImage(props: any) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                data-testid={`img-${props.alt}`}
                alt={props.alt}
                src={props.src}
            />
        );
    };
});

jest.mock("../phone", () => {
    return function MockPhone(props: any) {
        return <div data-testid="phone" data-src={props.imgSrc} />;
    };
});

describe("<CalltoActionReviewDesign />", () => {
    it("renders heading, description, and visuals", () => {
        render(<CalltoActionReviewDesign />);

        expect(
            screen.getByRole("heading", {
                name: /Turn your favorite photo into a one-of-a-kind phone case/i,
                level: 2,
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                /Upload any image - a memory, a design, or your artwork/i
            )
        ).toBeInTheDocument();

        expect(screen.getByTestId("img-uploaded preview")).toBeInTheDocument();
        expect(
            screen.getByTestId("img-arrow connecting preview")
        ).toBeInTheDocument();
        expect(screen.getByTestId("phone")).toHaveAttribute(
            "data-src",
            "/assets/homepage/gallery_16.jpg"
        );
    });

    it("lists product features", () => {
        render(<CalltoActionReviewDesign />);
        expect(
            screen.getByText(/Premium flexible silicone material/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Scratch-resistant and fingerprint-proof finish/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Wireless charging compatible/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/5-year print durability guarantee/i)
        ).toBeInTheDocument();
    });

    it('links to "/configure/upload" with the CTA', async () => {
        render(<CalltoActionReviewDesign />);
        const link = screen.getByRole("link", {
            name: /Start designing your case/i,
        });
        expect(link).toHaveAttribute("href", "/configure/upload");

        const user = userEvent.setup();
        await user.click(link);
        expect(link).toBeInTheDocument();
    });
});
