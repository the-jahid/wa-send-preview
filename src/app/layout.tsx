// src/app/layout.tsx (server)
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import "@/app/globals.css";
import { ApiTokenProvider } from "@/lib/api-token-provider"; // adjust path if needed
import ReactQueryProvider from "./react-query-provider";

export default async function RootLayout({ children }: { children: React.ReactNode }) {


 

  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <ApiTokenProvider >
            {/* No dehydration state yet; add later if you do server prefetch */}
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </ApiTokenProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
