"use client";

import Link from "next/link";
import { Calendar, Eye } from "lucide-react";
import { type Blog, BlogsPublicAPI } from "@/app/features/blog/api";

interface BlogCardProps {
    blog: Blog;
}

export function BlogCard({ blog }: BlogCardProps) {
    const formattedDate = new Date(blog.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    // Generate excerpt from content (first 150 chars)
    const excerpt = blog.content.length > 150
        ? blog.content.slice(0, 150) + "..."
        : blog.content;

    return (
        <Link href={`/blog/${blog.id}`} className="group block">
            <article className="h-full overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/50 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
                {/* Cover Image */}
                {blog.hasImage && (
                    <div className="aspect-video overflow-hidden">
                        <img
                            src={BlogsPublicAPI.getImageUrl(blog.id)}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {blog.title}
                    </h3>

                    {/* Auto-generated Excerpt */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                        {excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500 pt-4 border-t border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            <span>{blog.viewCount} views</span>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}

export function BlogCardSkeleton() {
    return (
        <div className="h-full overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/50">
            {/* Image Skeleton */}
            <div className="aspect-video bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="p-6">
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-1" />
                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-4" />
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5">
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
}
