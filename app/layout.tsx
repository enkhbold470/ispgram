import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { fontVariables } from "@/lib/fonts";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "ISPGram - De Anza ISP Education Week Activity",
  description: "Education Week activity by the De Anza ISP Office for the International Student Program—share your photos, enjoy the friendly gamified celebration, and have fun together!",
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
          className={`${fontVariables} font-sans antialiased bg-linear-to-br from-sky-50 via-indigo-50 to-slate-50 min-h-screen`}
        >
          <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg md:block hidden">
            <div className="container mx-auto flex items-center justify-between px-4 py-4">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-sky-600 hover:text-sky-700">
                <GraduationCap className="h-6 w-6" />
                <span>ISPGram</span>
              </Link>

              <div className="flex items-center gap-6">
                <Link
                  href="/submit"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-sky-600"
                >
                  Submit
                </Link>
                <Link
                  href="/vote"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-sky-600"
                >
                  Vote
                </Link>
                <Link
                  href="/results"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-sky-600"
                >
                  Results
                </Link>

                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          </nav>

          {/* Mobile-only header with logo */}
          <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg md:hidden">
            <div className="container mx-auto flex items-center justify-center px-4 py-3">
              <Link href="/" className="flex items-center gap-2 text-lg font-bold text-sky-600">
                <GraduationCap className="h-5 w-5" />
                <span>ISPGram</span>
              </Link>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
            {children}
          </main>

          <footer className="border-t bg-white/50 py-8 mt-16 mb-16 md:mb-0">
            <div className="container mx-auto px-4 text-center text-sm text-gray-600">
              <p>Presented by the De Anza ISP Office for International Student Program Education Week activities—have fun, guys! 💙</p>
            </div>
          </footer>

          {/* Mobile Bottom Navigation */}
          <MobileNav />
        </body>
      </html>
    </ClerkProvider>
  );
}
