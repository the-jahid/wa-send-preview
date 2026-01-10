"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import { useMyBlogs, useDeleteBlog, type BlogListParams, type Blog } from "@/app/features/blog/api";
import { BlogFilters } from "@/components/blog";

export default function DashboardBlogPage() {
    const [filters, setFilters] = useState<BlogListParams>({ page: 1, limit: 10 });
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: blogsData, isLoading } = useMyBlogs(filters);
    const deleteBlog = useDeleteBlog();

    const handleFilterChange = useCallback((newFilters: BlogListParams) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page ?? 1 }));
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;
        setDeletingId(id);
        try {
            await deleteBlog.mutateAsync(id);
        } catch (error) {
            console.error("Failed to delete blog:", error);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Blogs</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Manage your blog posts
                    </p>
                </div>
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
                >
                    <Plus className="h-5 w-5" />
                    New Blog
                </Link>
            </div>

            {/* Filters */}
            <div className="mb-6">
                <BlogFilters
                    onFilterChange={handleFilterChange}
                    initialFilters={filters}
                />
            </div>

            {/* Blog Table */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            Loading...
                        </div>
                    </div>
                ) : !blogsData?.blogs.length ? (
                    <div className="p-12 text-center">
                        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-4">
                            <Edit2 className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            No blogs yet
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                            Start sharing your knowledge by creating your first blog post.
                        </p>
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Create Blog
                        </Link>
                    </div>
                ) : (
                    <>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Views
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Updated
                                    </th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                                {blogsData.blogs.map((blog) => (
                                    <tr key={blog.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white line-clamp-1">
                                                    {blog.title}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-500">/blog/{blog.id}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                                <Eye className="h-4 w-4" />
                                                {blog.viewCount}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {new Date(blog.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/blog/${blog.id}`}
                                                    target="_blank"
                                                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(blog.id)}
                                                    disabled={deletingId === blog.id}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {deletingId === blog.id ? (
                                                        <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {blogsData.total > blogsData.limit && (
                            <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                                <p className="text-sm text-slate-500 dark:text-slate-500">
                                    Showing {(filters.page! - 1) * blogsData.limit + 1}-{Math.min(filters.page! * blogsData.limit, blogsData.total)} of {blogsData.total}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                                        disabled={(filters.page || 1) <= 1}
                                        className="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                                        disabled={(filters.page || 1) * blogsData.limit >= blogsData.total}
                                        className="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
