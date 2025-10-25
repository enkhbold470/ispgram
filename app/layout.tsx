import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Ghost } from "lucide-react";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "ISPGram - De Anza Halloween Costume Contest",
  description: "Submit your Halloween costume and vote for your favorites in the De Anza ISP Halloween Contest!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${fontVariables} font-sans antialiased bg-linear-to-br from-orange-50 via-purple-50 to-black/5 min-h-screen`}
        >
          <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg">
            <div className="container mx-auto flex items-center justify-between px-4 py-4">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-orange-600 hover:text-orange-700">
                <Ghost className="h-6 w-6" />
                <span>ISPGram</span>
              </Link>

              <div className="flex items-center gap-6">
                <Link
                  href="/submit"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-orange-600"
                >
                  Submit
                </Link>
                <Link
                  href="/vote"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-orange-600"
                >
                  Vote
                </Link>
                <Link
                  href="/results"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-orange-600"
                >
                  Results
                </Link>

                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          </nav>

          <main className="container mx-auto px-4 py-8">
            {children}
          </main>

          <footer className="border-t bg-white/50 py-8 mt-16">
            <div className="container mx-auto px-4 text-center text-sm text-gray-600">
              <p>🎃 De Anza ISP Halloween Costume Contest 2025 👻</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
