"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, Clock } from "lucide-react";
import { useBlogById, BlogsPublicAPI } from "@/app/features/blog/api";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { TracingBeam } from "@/components/ui/tracing-beam";

export default function BlogDetailPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [isDark, setIsDark] = useState(true);
    const { data: blog, isLoading, error } = useBlogById(slug);

    useEffect(() => {
        // Set initial theme
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setIsDark(savedTheme === "dark");
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        localStorage.setItem("theme", isDark ? "light" : "dark");
        if (isDark) {
            document.documentElement.classList.remove("dark");
        } else {
            document.documentElement.classList.add("dark");
        }
    };

    const formattedDate = blog?.createdAt
        ? new Date(blog.createdAt).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        : "";

    // Estimate reading time (200 words per minute)
    const readingTime = blog?.content
        ? Math.ceil(blog.content.split(/\s+/).length / 200)
        : 0;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1a] text-slate-900 dark:text-white">
                <Navbar toggleTheme={toggleTheme} isDark={isDark} />
                <main className="pt-24 pb-16">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <div className="animate-pulse space-y-8">
                            <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                            <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl" />
                            <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                            <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                            <div className="space-y-4">
                                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                                <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
                                <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1a] text-slate-900 dark:text-white">
                <Navbar toggleTheme={toggleTheme} isDark={isDark} />
                <main className="pt-24 pb-16">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl font-bold mb-4">Blog not found</h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            The blog post you're looking for doesn't exist or has been removed.
                        </p>
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Blog
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1a] text-slate-900 dark:text-white antialiased transition-colors duration-300">
            <Navbar toggleTheme={toggleTheme} isDark={isDark} />

            <main className="pt-24 pb-16">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-8 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Blog
                    </Link>

                    {/* Tracing Beam Wrapper */}
                    <TracingBeam className="px-6">
                        <article>
                            {/* Cover Image */}
                            {blog.hasImage && (
                                <div className="mb-8 rounded-2xl overflow-hidden">
                                    <img
                                        src={BlogsPublicAPI.getImageUrl(blog.id)}
                                        alt={blog.title}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            )}

                            {/* Header */}
                            <header className="mb-8">
                                {/* Title */}
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                                    {blog.title}
                                </h1>

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formattedDate}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        <span>{readingTime} min read</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="h-4 w-4" />
                                        <span>{blog.viewCount} views</span>
                                    </div>
                                </div>
                            </header>

                            {/* Content */}
                            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800">
                                {/* Render content as paragraphs */}
                                {blog.content.split("\n\n").map((paragraph: string, i: number) => (
                                    <p key={i}>{paragraph}</p>
                                ))}
                            </div>
                        </article>
                    </TracingBeam>
                </div>
            </main>

            <Footer />
        </div>
    );
}
