/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CaseDesignComponent from "../case-design";
import { useBuyNow } from "@/hooks/use-buy-now";
import { useFavorite } from "@/hooks/use-favorite";

const push = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push }),
}));

const toggleFavorite = jest.fn();
const buyNow = jest.fn();
jest.mock("@/hooks/use-favorite", () => ({
    useFavorite: jest.fn(() => ({
        isFavorited: false,
        toggleFavorite,
        loading: false,
    })),
}));
jest.mock("@/hooks/use-buy-now", () => ({
    useBuyNow: jest.fn(() => ({
        buyNow,
        loading: false,
    })),
}));

const invalidateQueries = jest.fn();
jest.mock("@tanstack/react-query", () => ({
    useQueryClient: () => ({ invalidateQueries }),
}));

jest.mock("@/lib/utils", () => {
    const actual = jest.requireActual("@/lib/utils");
    return {
        ...actual,
        formatPrice: (n: number) => `$${n.toFixed(2)}`,
    };
});

jest.mock("@/components/utilities/phone", () => {
    return function MockPhone(props: { altText?: string }) {
        return (
            <div data-testid="phone" aria-label={props.altText ?? "phone"} />
        );
    };
});

const baseProps = {
    id: "design-1",
    imgSrc: "/img.jpg",
    altText: "Cool case",
    caseName: "Aurora Borealis",
    modelName: "iPhone 15 Pro",
    color: "Black",
    material: "Polycarbonate",
    finish: "Matte",
    price: 39.99,
    isFavorited: false,
    croppedImgUrl: "/cropped.jpg",
};

describe("<CaseDesignComponent />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders details and formatted price", () => {
        render(
            <CaseDesignComponent
                {...baseProps}
                user={{ id: "user-123" } as any}
            />
        );

        expect(
            screen.getByRole("heading", { name: /Aurora Borealis/i })
        ).toBeInTheDocument();

        expect(screen.getByText("Model:")).toBeInTheDocument();
        expect(screen.getByText("iPhone 15 Pro")).toBeInTheDocument();
        expect(screen.getByText("Color:")).toBeInTheDocument();
        expect(screen.getByText("Black")).toBeInTheDocument();
        expect(screen.getByText("Material:")).toBeInTheDocument();
        expect(screen.getByText("Polycarbonate")).toBeInTheDocument();
        expect(screen.getByText("Finish:")).toBeInTheDocument();
        expect(screen.getByText("Matte")).toBeInTheDocument();

        expect(screen.getByText("$39.99")).toBeInTheDocument();

        expect(screen.getByTestId("phone")).toHaveAttribute(
            "aria-label",
            "Cool case"
        );
    });

    it("calls buyNow when Buy Now is clicked", async () => {
        const user = userEvent.setup();

        render(
            <CaseDesignComponent
                {...baseProps}
                user={{ id: "user-123" } as any}
            />
        );

        const buyBtn = screen.getByRole("button", {
            name: /Buy Aurora Borealis/i,
        });
        await user.click(buyBtn);

        expect(buyNow).toHaveBeenCalledTimes(1);
        expect((buyNow as jest.Mock).mock.calls[0].length).toBe(0);
    });

    it("redirects to /sign-in if no user and favorite is clicked", async () => {
        const user = userEvent.setup();

        render(<CaseDesignComponent {...baseProps} user={null} />);

        const favBtn = screen.getByRole("button", {
            name: /Favorite Aurora Borealis/i,
        });
        await user.click(favBtn);

        expect(push).toHaveBeenCalledWith("/sign-in");
        expect(toggleFavorite).not.toHaveBeenCalled();
    });

    it("calls toggleFavorite and invalidates queries when user favorites", async () => {
        const userEv = userEvent.setup();

        render(
            <CaseDesignComponent
                {...baseProps}
                user={{ id: "user-123" } as any}
            />
        );

        const favBtn = screen.getByRole("button", {
            name: /Favorite Aurora Borealis/i,
        });
        await userEv.click(favBtn);

        expect(toggleFavorite).toHaveBeenCalledTimes(1);
        expect((toggleFavorite as jest.Mock).mock.calls[0].length).toBe(0);
        expect(invalidateQueries).toHaveBeenCalled();
    });

    it("disables buttons and blocks actions when loading", async () => {
        const user = userEvent.setup();
        const mockedUseBuyNow = useBuyNow as jest.Mock;
        const mockedUseFavorite = useFavorite as jest.Mock;

        const buyNowMock = jest.fn();
        const toggleFavoriteMock = jest.fn();

        mockedUseBuyNow.mockReturnValueOnce({
            buyNow: buyNowMock,
            loading: true,
        });
        mockedUseFavorite.mockReturnValueOnce({
            isFavorited: false,
            toggleFavorite: toggleFavoriteMock,
            loading: true,
        });

        render(
            <CaseDesignComponent
                {...baseProps}
                user={{ id: "user-123" } as any}
            />
        );

        const buyBtn = screen.getByRole("button", {
            name: /Buy Aurora Borealis/i,
        });
        const favBtn = screen.getByRole("button", {
            name: /Favorite Aurora Borealis/i,
        });

        expect(buyBtn).toBeDisabled();
        expect(favBtn).toBeDisabled();

        await user.click(buyBtn);
        await user.click(favBtn);
        expect(buyNowMock).not.toHaveBeenCalled();
        expect(toggleFavoriteMock).not.toHaveBeenCalled();
    });
});
