"use client";

import { useState, useCallback } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { useBlogs, type BlogListParams } from "@/app/features/blog/api";
import { BlogList, BlogFilters, BlogEditor } from "@/components/blog";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function BlogPage() {
    const [isDark, setIsDark] = useState(true);
    const [filters, setFilters] = useState<BlogListParams>({ page: 1, limit: 9 });
    const [showEditor, setShowEditor] = useState(false);

    const { data: blogsData, isLoading: blogsLoading, refetch } = useBlogs(filters);

    const handleFilterChange = useCallback((newFilters: BlogListParams) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page ?? 1 }));
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setFilters((prev) => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        if (isDark) {
            document.documentElement.classList.remove("dark");
        } else {
            document.documentElement.classList.add("dark");
        }
    };

    const handleBlogCreated = () => {
        setShowEditor(false);
        refetch();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1a] text-slate-900 dark:text-white antialiased transition-colors duration-300">
            <Navbar toggleTheme={toggleTheme} isDark={isDark} />

            <main className="pt-24 pb-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                            Our Blog
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6">
                            Insights, tutorials, and updates about WhatsApp automation, AI chatbots, and business growth strategies.
                        </p>

                        {/* Create Blog Button - Only visible when signed in */}
                        <SignedIn>
                            <button
                                onClick={() => setShowEditor(!showEditor)}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                            >
                                <Plus className="h-5 w-5" />
                                {showEditor ? "Cancel" : "Write a Blog"}
                            </button>
                        </SignedIn>

                        {/* Sign in prompt for non-authenticated users */}
                        <SignedOut>
                            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                    Want to write a blog?
                                </span>
                                <SignInButton mode="modal">
                                    <button className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                                        Sign in
                                    </button>
                                </SignInButton>
                            </div>
                        </SignedOut>
                    </div>

                    {/* Blog Editor - Shows when user clicks "Write a Blog" */}
                    {showEditor && (
                        <div className="mb-12 p-6 lg:p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Create New Blog
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                Share your knowledge with the community
                            </p>
                            <BlogEditor onSuccess={handleBlogCreated} />
                        </div>
                    )}

                    {/* Filters */}
                    <div className="mb-10">
                        <BlogFilters
                            onFilterChange={handleFilterChange}
                            initialFilters={filters}
                        />
                    </div>

                    {/* Blog List */}
                    <BlogList
                        data={blogsData}
                        isLoading={blogsLoading}
                        page={filters.page || 1}
                        onPageChange={handlePageChange}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
