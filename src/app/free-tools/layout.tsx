import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Free WhatsApp Marketing Tools - Check, Verify & More | Wapzen',
    description: 'Explore our collection of free WhatsApp marketing tools. Verify phone numbers, format contacts, and optimize your campaigns with our powerful, free-to-use utilities.',
    keywords: [
        'whatsapp tools',
        'free whatsapp marketing tools',
        'whatsapp number checker',
        'whatsapp link generator',
        'bulk whatsapp tools',
        'whatsapp business tools'
    ],
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://wapzen.com'),
    alternates: {
        canonical: '/free-tools',
    },
    openGraph: {
        title: 'Free WhatsApp Marketing Tools - Check, Verify & More | Wapzen',
        description: 'Explore our collection of free WhatsApp marketing tools. Verify phone numbers, format contacts, and optimize your campaigns.',
        type: 'website',
        url: '/free-tools',
        siteName: 'Wapzen',
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
