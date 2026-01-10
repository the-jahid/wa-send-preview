"use client";

import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import type { Blog, PaginatedBlogs } from "@/app/features/blog/api";
import { BlogCard, BlogCardSkeleton } from "./BlogCard";

interface BlogListProps {
    data?: PaginatedBlogs;
    isLoading?: boolean;
    page: number;
    onPageChange: (page: number) => void;
}

export function BlogList({ data, isLoading, page, onPageChange }: BlogListProps) {
    const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

    if (isLoading) {
        return (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <BlogCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!data || data.blogs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-slate-100 dark:bg-white/10 p-4 mb-4">
                    <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No blogs found
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
                    We couldn't find any blog posts matching your criteria. Try adjusting your filters or check back later.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Blog Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {data.blogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                        className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => {
                                // Show first, last, and pages around current
                                if (p === 1 || p === totalPages) return true;
                                if (Math.abs(p - page) <= 1) return true;
                                return false;
                            })
                            .map((p, idx, arr) => {
                                // Add ellipsis
                                const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                                return (
                                    <div key={p} className="flex items-center gap-1">
                                        {showEllipsis && (
                                            <span className="px-2 text-slate-400">...</span>
                                        )}
                                        <button
                                            onClick={() => onPageChange(p)}
                                            className={`inline-flex items-center justify-center h-10 min-w-[2.5rem] px-3 rounded-lg text-sm font-medium transition-colors ${p === page
                                                    ? "bg-emerald-500 text-white"
                                                    : "border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    </div>
                                );
                            })}
                    </div>

                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Results count */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-500">
                Showing {(page - 1) * data.limit + 1}-{Math.min(page * data.limit, data.total)} of {data.total} posts
            </p>
        </div>
    );
}
