"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, ArrowLeft, ImagePlus, X } from "lucide-react";
import {
    CreateBlogDto,
    type Blog,
    useCreateBlog,
    useUpdateBlog,
    BlogsPublicAPI,
} from "@/app/features/blog/api";

interface BlogEditorProps {
    blog?: Blog; // If provided, we're editing
    onSuccess?: () => void;
}

// Form data type (text fields only - validated by zod)
interface BlogFormData {
    title: string;
    content: string;
}

export function BlogEditor({ blog, onSuccess }: BlogEditorProps) {
    const router = useRouter();
    const isEditing = !!blog;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Image state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        blog?.hasImage ? BlogsPublicAPI.getImageUrl(blog.id) : null
    );

    const createBlog = useCreateBlog();
    const updateBlog = useUpdateBlog(blog?.id || "");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<BlogFormData>({
        resolver: zodResolver(CreateBlogDto) as any,
        defaultValues: {
            title: blog?.title || "",
            content: blog?.content || "",
        },
    });

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            if (!allowedTypes.includes(file.type)) {
                alert("Please select a valid image (JPEG, PNG, GIF, or WebP)");
                return;
            }
            // Validate size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                alert("Image must be less than 10MB");
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onSubmit = async (data: BlogFormData) => {
        try {
            if (isEditing) {
                await updateBlog.mutateAsync({
                    ...data,
                    image: imageFile || undefined,
                });
            } else {
                await createBlog.mutateAsync({
                    ...data,
                    image: imageFile || undefined,
                });
            }
            onSuccess?.();
            // Only redirect if no onSuccess handler
            if (!onSuccess) {
                router.push("/blog");
            }
        } catch (error) {
            console.error("Failed to save blog:", error);
        }
    };

    const isPending = createBlog.isPending || updateBlog.isPending || isSubmitting;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {isEditing ? "Update" : "Publish"}
                </button>
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Cover Image <span className="text-slate-400 font-normal">(optional)</span>
                </label>

                {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover"
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-slate-900/50 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors cursor-pointer"
                    >
                        <ImagePlus className="h-8 w-8 text-slate-400" />
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            Click to upload an image
                        </span>
                        <span className="text-xs text-slate-400">
                            JPEG, PNG, GIF, WebP • Max 10MB
                        </span>
                    </button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                />
            </div>

            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Title <span className="text-red-500">*</span>
                </label>
                <input
                    {...register("title")}
                    placeholder="Enter blog title..."
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white text-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                />
                {errors.title && (
                    <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                )}
            </div>

            {/* Content */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Content <span className="text-red-500">*</span>
                </label>
                <textarea
                    {...register("content")}
                    placeholder="Write your blog content here..."
                    rows={12}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors resize-y"
                />
                {errors.content && (
                    <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
                )}
            </div>
        </form>
    );
}
