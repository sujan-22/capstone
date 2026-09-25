"use client";

import SortControl from "@/components/utilities/sort-control";

const SORT_OPTIONS = [
    { key: "none", label: "Most loved" },
    { key: "price_low_to_high", label: "Price: low to high" },
    { key: "price_high_to_low", label: "Price: high to low" },
];

const SortSidebar = () => <SortControl options={SORT_OPTIONS} />;

export default SortSidebar;
