"use client";

import SortControl from "@/components/utilities/sort-control";

const SORT_OPTIONS = [
    { key: "none", label: "Newest" },
    { key: "popularity_desc", label: "Most used" },
    { key: "popularity_asc", label: "Least used" },
];

const SortSidebar = () => <SortControl options={SORT_OPTIONS} />;

export default SortSidebar;
