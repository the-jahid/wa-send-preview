import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0a0f1a] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/WapZen Logo-06.png"
                alt="WapZen Logo"
                width={160}
                height={45}
                className="object-contain h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Turn WhatsApp into your 24/7 sales machine. Unlimited messages, AI
              conversations, automatic appointments.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Product
            </h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <Link
                  href="/#features"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/#use-cases"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Use Cases
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Integrations
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Free tools
            </h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <Link
                  href="/free-tools/number-checker"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors relative inline-flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  WhatsApp Number Checker
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Resources
            </h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <a
                  href="#"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Company
            </h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <a
                  href="#"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Terms
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200 dark:border-white/5">
          <div className="text-sm text-slate-500 dark:text-slate-600">
            © {new Date().getFullYear()} WapZen. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/company/wapzen-io/"
              className="text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>

            {/* X (formerly Twitter) */}
            <a
              href="https://x.com/wapzen_io"
              className="text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.244 2H21.5L14.39 10.13L22.75 22H16.1L10.9 14.71L4.51 22H1.25L8.85 13.31L0.75 2H7.55L12.24 8.62L18.244 2ZM17.1 20.02H18.9L6.6 3.88H4.67L17.1 20.02Z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=61586351997717"
              className="text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span className="sr-only">Facebook</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35C.594 0 0 .593 0 1.326v21.348C0 23.407.594 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.324-.593 1.324-1.326V1.326C24 .593 23.406 0 22.675 0z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
