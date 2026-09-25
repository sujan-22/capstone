/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import CalltoActionReviewDesign from "../cta-review";

jest.mock("next/image", () => ({
    __esModule: true,
    // eslint-disable-next-line @next/next/no-img-element
    default: (props: any) => <img src={props.src} alt={props.alt} />,
}));

jest.mock("../phone", () => {
    return function MockPhone(props: any) {
        return (
            <div
                data-testid="phone"
                data-src={props.imgSrc}
                aria-label={props.altText}
            />
        );
    };
});

describe("<CalltoActionReviewDesign />", () => {
    it("renders heading, description, and the photo-to-case visual", () => {
        render(<CalltoActionReviewDesign />);

        expect(
            screen.getByRole("heading", {
                name: /Turn your favourite photo into a one-of-a-kind case/i,
                level: 2,
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Upload any image, a memory, a design or your own artwork/i)
        ).toBeInTheDocument();

        expect(
            screen.getByRole("img", { name: /The original photo/i })
        ).toHaveAttribute("src", "/assets/homepage/gallery_16.jpg");
        expect(screen.getByTestId("phone")).toHaveAttribute(
            "data-src",
            "/assets/homepage/gallery_16.jpg"
        );
    });

    it("lists product specs", () => {
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
        expect(
            screen.getByText(/Free with FedEx, up to 3 working days/i)
        ).toBeInTheDocument();
    });

    it('links to "/configure/upload" with the CTA', () => {
        render(<CalltoActionReviewDesign />);
        expect(
            screen.getByRole("link", { name: /Start designing your case/i })
        ).toHaveAttribute("href", "/configure/upload");
    });
});
