"use client";
import React from "react";
import { DesignRowSkeleton } from "../../../components/design-row";

// Kept for the favourites list, which reuses this skeleton; every saved-design
// row now has two actions.
const UnfinishedDesignSkeleton = ({}: { shouldHideThirdButton?: boolean }) => (
    <DesignRowSkeleton actions={2} />
);

export default UnfinishedDesignSkeleton;
