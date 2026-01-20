import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Blogs",
    description: "Manage your blog posts",
};

export default function DashboardBlogLayout({ children }: { children: React.ReactNode }) {
    return <div className="p-6 lg:p-8">{children}</div>;
}
