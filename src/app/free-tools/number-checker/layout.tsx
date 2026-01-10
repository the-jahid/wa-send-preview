import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Free WhatsApp Number Checker - Verify & Format Online | Wapzen',
    description: 'Instantly check if a phone number exists on WhatsApp with our free tool. Verify numbers, validate formats, and check availability globally without saving contacts. Fast, secure, and accurate.',
    keywords: [
        'WhatsApp number checker',
        'verify whatsapp number',
        'check whatsapp status',
        'whatsapp availability checker',
        'validate phone number whatsapp',
        'whatsapp format validator',
        'free whatsapp tools',
        'bulk whatsapp checker'
    ],
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://wapzen.com'),
    alternates: {
        canonical: '/free-tools/number-checker',
    },
    openGraph: {
        title: 'Free WhatsApp Number Checker - Verify & Format Online | Wapzen',
        description: 'Instantly check if a phone number exists on WhatsApp with our free tool. Verify numbers, validate formats, and check availability globally without saving contacts.',
        type: 'website',
        url: '/free-tools/number-checker',
        siteName: 'Wapzen',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
