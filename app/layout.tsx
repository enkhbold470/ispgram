import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { User } from "lucide-react";
import { fontVariables } from "@/lib/fonts";
import { MobileNav } from "@/components/mobile-nav";
import { siteConfig } from "@/config/siteConfig";
import "./globals.css";

// Open Graph image configured:
// - File: /app/opengraph-image.jpeg (Next.js auto-detects this)
// - Explicitly configured in metadata below for OpenGraph and Twitter cards
// - For dynamic images, use opengraph-image.tsx instead

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: '/opengraph-image.jpeg',
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['/opengraph-image.jpeg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const LogoIcon = siteConfig.hero.icon;

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${fontVariables} font-sans antialiased bg-linear-to-br ${siteConfig.theme.bgGradient} min-h-screen`}
        >
          <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg md:block hidden">
            <div className="container mx-auto flex items-center justify-between px-4 py-4">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-theme-primary hover:text-theme-primary-hover">
                <LogoIcon className="h-6 w-6" />
                <span>{siteConfig.name}</span>
              </Link>

              <div className="flex items-center gap-6">
                {siteConfig.navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-theme-primary"
                  >
                    {item.label}
                  </Link>
                ))}

                <SignedIn>
                  <div className="flex items-center gap-4">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-theme-primary"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    {/* <UserButton afterSignOutUrl="/" /> */}
                  </div>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="rounded-full bg-theme-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-theme-primary-hover">
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
              <Link href="/" className="flex items-center gap-2 text-lg font-bold text-theme-primary">
                <LogoIcon className="h-5 w-5" />
                <span>{siteConfig.name}</span>
              </Link>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
            {children}
          </main>

          <footer className="border-t bg-white/50 py-8 mt-16 mb-16 md:mb-0">
            <div className="container mx-auto px-4 text-center text-sm text-gray-600">
              <p>{siteConfig.footer.text}</p>
            </div>
          </footer>

          {/* Mobile Bottom Navigation */}
          <MobileNav />
        </body>
      </html>
    </ClerkProvider>
  );
}
