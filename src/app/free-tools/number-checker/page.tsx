"use client"

import { useState, useEffect } from "react"
import { useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Phone, Search, CheckCircle, XCircle, Loader2, Globe, Shield, Zap, Check } from "lucide-react"
import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"
import { countries } from "./countries"
import { ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import Script from "next/script"

// Create a client
const queryClient = new QueryClient()

export default function NumberCheckerPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <NumberCheckerContent />
        </QueryClientProvider>
    )
}

function NumberCheckerContent() {
    const [agentId, setAgentId] = useState(process.env.NEXT_PUBLIC_AGENT_ID || "")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [open, setOpen] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.code === "US") || countries[0])
    const [countryCode, setCountryCode] = useState(selectedCountry.dial_code)
    const [isDark, setIsDark] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setCountryCode(selectedCountry.dial_code)
    }, [selectedCountry])

    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem("theme")
        if (savedTheme) {
            setIsDark(savedTheme === "dark")
        } else {
            setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
        }
    }, [])

    useEffect(() => {
        if (!mounted) return
        localStorage.setItem("theme", isDark ? "dark" : "light")
        if (isDark) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }, [isDark, mounted])

    const mutation = useMutation({
        mutationFn: async (data: { agentId: string; phoneNumber: string }) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3000'}/free-tools/number-checker`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error("Failed to check number")
            }

            return response.json()
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!agentId || !phoneNumber) return

        let finalNumber = phoneNumber.trim()
        if (!finalNumber.startsWith('+')) {
            finalNumber = `${countryCode}${finalNumber.replace(/^0+/, '')}`
        }

        mutation.mutate({ agentId, phoneNumber: finalNumber })
    }

    const toggleTheme = () => setIsDark(!isDark)

    // JSON-LD Structured Data
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "name": "WhatsApp Number Checker",
                "applicationCategory": "UtilitiesApplication",
                "operatingSystem": "Web",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                },
                "description": "Free tool to check if a phone number is on WhatsApp. Verify numbers and get formatting details instantly.",
                "featureList": "WhatsApp Verification, Number Formatting, Country Code Lookup, Bulk Check Support"
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Is this WhatsApp Number Checker free?",
                        "acceptedAnswer": { "@type": "Answer", "text": "Yes, our WhatsApp Number Checker is 100% free to use for checking individual numbers." }
                    },
                    {
                        "@type": "Question",
                        "name": "Do you need to login to check numbers?",
                        "acceptedAnswer": { "@type": "Answer", "text": "No login is required. You can use the tool instantly as a guest." }
                    },
                    {
                        "@type": "Question",
                        "name": "Is the data accurate?",
                        "acceptedAnswer": { "@type": "Answer", "text": "Yes, we perform real-time lookups to ensure the WhatsApp availability status is accurate." }
                    },
                    {
                        "@type": "Question",
                        "name": "Do you verify international numbers?",
                        "acceptedAnswer": { "@type": "Answer", "text": "Yes, we support verifying WhatsApp numbers from all countries globally." }
                    }
                ]
            }
        ]
    }

    if (!mounted) return null

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-[#0a0f1a] text-slate-900 dark:text-white ${isDark ? 'dark' : ''}`}>
            <Script
                id="json-ld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar toggleTheme={toggleTheme} isDark={isDark} />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                {/* Tool Section */}
                <div className="max-w-4xl mx-auto mb-20">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                            WhatsApp Number Checker
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Instantly verify if a phone number exists on WhatsApp. Validates formatting and checks availability in real-time.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        {/* Form */}
                        <div className="bg-white dark:bg-[#0d1424] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {!process.env.NEXT_PUBLIC_AGENT_ID && (
                                    <div>
                                        <label htmlFor="agentId" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                            Agent ID
                                        </label>
                                        <input
                                            type="text"
                                            id="agentId"
                                            value={agentId}
                                            onChange={(e) => setAgentId(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                            placeholder="Enter your Agent ID"
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                        Phone Number
                                    </label>
                                    <div className="flex gap-3">
                                        <div className="w-[140px] flex-shrink-0">
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        aria-expanded={open}
                                                        type="button"
                                                        className="h-[50px] w-full flex items-center justify-between rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                                    >
                                                        <span className="flex items-center gap-2 truncate">
                                                            <span className="text-lg">{selectedCountry.flag}</span>
                                                            <span className="font-medium text-slate-700 dark:text-slate-200">{selectedCountry.code} {selectedCountry.dial_code}</span>
                                                        </span>
                                                        <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[300px] p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Search country..." />
                                                        <CommandList>
                                                            <CommandEmpty>No country found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {countries.map((country) => (
                                                                    <CommandItem
                                                                        key={country.code}
                                                                        value={country.name}
                                                                        onSelect={() => {
                                                                            setSelectedCountry(country)
                                                                            setOpen(false)
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                selectedCountry.code === country.code
                                                                                    ? "opacity-100"
                                                                                    : "opacity-0"
                                                                            )}
                                                                        />
                                                                        <span className="text-lg mr-2">{country.flag}</span>
                                                                        <span className="flex-1">{country.name}</span>
                                                                        <span className="text-muted-foreground ml-2 text-xs">{country.dial_code}</span>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="relative flex-1">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <input
                                                type="text"
                                                id="phone"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 h-[50px] rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                                placeholder="1234567890"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {mutation.isPending ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Checking...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-5 w-5" />
                                            Check Number
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Results */}
                        <div className={`rounded-2xl border ${mutation.isSuccess ? 'border-emerald-500/20 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424]'} p-6 h-full min-h-[300px] flex flex-col shadow-sm transition-all`}>
                            {mutation.data ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-3">
                                        {mutation.data.isValid ? (
                                            <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                                <CheckCircle className="h-6 w-6" />
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                                                <XCircle className="h-6 w-6" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                                                {mutation.data.isValid ? "Valid Number" : "Invalid Number"}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {mutation.data.isOnWhatsApp ? "Active on WhatsApp" : "Not on WhatsApp"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <ResultRow label="Formatted" value={mutation.data.formattedNumber} />
                                        <ResultRow label="Country Code" value={mutation.data.countryCode} />
                                        <ResultRow label="Country" value={mutation.data.countryName} />
                                        <ResultRow label="National Number" value={mutation.data.nationalNumber} />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
                                    <Search className="h-12 w-12 mb-4 opacity-20" />
                                    <p>Enter a phone number to inspect details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="max-w-4xl mx-auto space-y-24">
                    {/* Features */}
                    <section>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                            Why Use Our Checker?
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <FeatureCard
                                icon={<Zap className="h-6 w-6 text-emerald-500" />}
                                title="Instant & Fast"
                                description="Get real-time validation results in milliseconds. No waiting, no queues."
                            />
                            <FeatureCard
                                icon={<Globe className="h-6 w-6 text-cyan-500" />}
                                title="Global Coverage"
                                description="Supports phone numbers from over 200+ countries worldwide."
                            />
                            <FeatureCard
                                icon={<Shield className="h-6 w-6 text-purple-500" />}
                                title="Secure & Private"
                                description="We don't save the numbers you check. Your data remains 100% private."
                            />
                        </div>
                    </section>

                    {/* How It Works */}
                    <section className="bg-slate-50 dark:bg-white/5 rounded-3xl p-8 lg:p-12 border border-slate-200 dark:border-white/10">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-slate-900 dark:text-white">
                            How to Check a Number
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <StepCard
                                number="1"
                                title="Select Country"
                                description="Choose the country code from the dropdown list."
                            />
                            <StepCard
                                number="2"
                                title="Enter Number"
                                description="Type the phone number you want to verify."
                            />
                            <StepCard
                                number="3"
                                title="View Result"
                                description="Instantly see if the number is active on WhatsApp."
                            />
                        </div>
                    </section>

                    {/* FAQ */}
                    <section>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-slate-900 dark:text-white">
                            Frequently Asked Questions
                        </h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Is checking WhatsApp numbers free?</AccordionTrigger>
                                <AccordionContent>
                                    Yes, checking individual numbers using this tool is completely free. There are no hidden charges.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Do you save the checked numbers?</AccordionTrigger>
                                <AccordionContent>
                                    No, we prioritize your privacy. We do not store or save any phone numbers you check on this page.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Can I check numbers from any country?</AccordionTrigger>
                                <AccordionContent>
                                    Yes, our tool supports checking WhatsApp availability for phone numbers from almost every country in the world.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger>Is the result accurate?</AccordionTrigger>
                                <AccordionContent>
                                    Yes, we perform a real-time lookup to ensure high accuracy. However, availability may depend on WhatsApp's current server status.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}

function ResultRow({ label, value }: { label: string, value: string | boolean }) {
    if (value === undefined || value === null) return null
    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-200/50 dark:border-white/5 last:border-0">
            <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white font-mono">{String(value)}</span>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-white dark:bg-[#0d1424] p-6 rounded-xl border border-slate-200 dark:border-white/10 text-center hover:border-emerald-500/50 transition-colors">
            <div className="inline-flex p-3 rounded-lg bg-slate-50 dark:bg-white/5 mb-4">
                {icon}
            </div>
            <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>
    )
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
    return (
        <div className="text-center">
            <div className="w-10 h-10 mx-auto bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold mb-4 shadow-lg shadow-emerald-500/20">
                {number}
            </div>
            <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{description}</p>
        </div>
    )
}
