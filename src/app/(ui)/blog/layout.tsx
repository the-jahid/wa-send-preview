import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog - Wapzen",
    description: "Read the latest insights, tutorials, and updates about WhatsApp automation, AI chatbots, and business growth strategies.",
    openGraph: {
        title: "Blog - Wapzen",
        description: "Insights and tutorials about WhatsApp automation and AI chatbots.",
    },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return children;
}
