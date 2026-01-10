"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import type { BlogListParams } from "@/app/features/blog/api";

interface BlogFiltersProps {
    onFilterChange: (filters: BlogListParams) => void;
    initialFilters?: BlogListParams;
}

export function BlogFilters({
    onFilterChange,
    initialFilters,
}: BlogFiltersProps) {
    const [search, setSearch] = useState(initialFilters?.search || "");

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Trigger filter change
    useEffect(() => {
        const filters: BlogListParams = {
            page: 1, // Reset to page 1 on filter change
        };
        if (debouncedSearch) filters.search = debouncedSearch;

        onFilterChange(filters);
    }, [debouncedSearch, onFilterChange]);

    const clearFilters = () => {
        setSearch("");
    };

    const hasActiveFilters = !!search;

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search blogs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                    <X className="h-4 w-4" />
                    Clear
                </button>
            )}
        </div>
    );
}

