/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";

import FeaturedDesigns from "../featured-designs";

jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children, ...rest }: any) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

const useQueryMock = jest.fn();
jest.mock("@tanstack/react-query", () => ({
    useQuery: (args: any) => useQueryMock(args),
}));

jest.mock("@/lib/utils", () => {
    const actual = jest.requireActual("@/lib/utils");
    return { ...actual };
});

jest.mock("../../utilities/max-width-wrapper", () => {
    return function MaxWidthWrapper({
        children,
    }: {
        children: React.ReactNode;
    }) {
        return <div data-testid="max-width-wrapper">{children}</div>;
    };
});

jest.mock("../skeletons/case-design-skeleton", () => {
    return function CaseDesignSkeleton(props: { isDark?: boolean }) {
        return (
            <div
                data-testid="case-design-skeleton"
                data-dark={props.isDark ? "true" : "false"}
            />
        );
    };
});

jest.mock("../case-design", () => {
    return function CaseDesignComponentMock(props: any) {
        return (
            <article
                aria-label={`case:${props.caseName ?? props.id}`}
                data-testid="case-design"
            />
        );
    };
});

const userFixture = { id: "user-123" } as any;

describe("<FeaturedDesigns />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders 3 skeletons while loading", () => {
        useQueryMock.mockReturnValueOnce({ isLoading: true, data: undefined });

        render(<FeaturedDesigns user={userFixture} />);

        const skeletons = screen.getAllByTestId("case-design-skeleton");
        expect(skeletons).toHaveLength(3);
        expect(screen.queryByTestId("case-design")).toBeNull();
    });

    it("renders 3 skeletons when no designs are returned", () => {
        useQueryMock.mockReturnValueOnce({
            isLoading: false,
            data: { designs: [] },
        });

        render(<FeaturedDesigns user={userFixture} />);

        const skeletons = screen.getAllByTestId("case-design-skeleton");
        expect(skeletons).toHaveLength(3);
    });

    it("renders the returned featured designs", () => {
        useQueryMock.mockReturnValueOnce({
            isLoading: false,
            data: {
                designs: [
                    { id: "d1", caseName: "Nebula One" },
                    { id: "d2", caseName: "Nebula Two" },
                    { id: "d3", caseName: "Nebula Three" },
                ],
            },
        });

        render(<FeaturedDesigns user={userFixture} />);

        const items = screen.getAllByTestId("case-design");
        expect(items).toHaveLength(3);
        expect(screen.getByLabelText(/case:Nebula Two/i)).toBeInTheDocument();
        expect(screen.queryByTestId("case-design-skeleton")).toBeNull();
    });

    it('links to "/featured-designs" to see every featured design', () => {
        useQueryMock.mockReturnValueOnce({
            isLoading: false,
            data: {
                designs: [
                    { id: "d1", caseName: "Orbit" },
                    { id: "d2", caseName: "Pulse" },
                    { id: "d3", caseName: "Flux" },
                ],
            },
        });

        render(<FeaturedDesigns user={userFixture} />);

        expect(
            screen.getByRole("link", { name: /See all featured designs/i })
        ).toHaveAttribute("href", "/featured-designs");
        expect(
            screen.getByRole("heading", { name: /Off the press/i, level: 2 })
        ).toBeInTheDocument();
    });
});
