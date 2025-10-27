"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, User } from "lucide-react";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/siteConfig";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activePattern: RegExp;
}

// Build navigation items from siteConfig
const navItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    activePattern: /^\/$/,
  },
  ...siteConfig.navigation.map((item) => {
    // Get the icon from the corresponding feature or hero button
    const featureMatch = siteConfig.features.find(f => 
      item.href.includes(f.title.toLowerCase().split(' ')[0].toLowerCase())
    );
    const buttonMatch = siteConfig.hero.ctaButtons.find(b => b.href === item.href);
    
    return {
      href: item.href,
      label: item.label,
      icon: buttonMatch?.icon || featureMatch?.icon || Home,
      activePattern: new RegExp(`^${item.href}`),
    };
  }),
];

export function MobileNav() {
  const pathname = usePathname();
  const { openSignIn } = useClerk();

  const isActive = (pattern: RegExp) => pattern.test(pathname);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      aria-label="Mobile navigation"
    >
      {/* Backdrop blur with gradient border */}
      <div className="relative border-t border-theme-accent-border bg-white/80 backdrop-blur-xl">
        {/* Gradient accent line */}
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-linear-to-r from-theme-accent via-theme-tertiary to-theme-accent" />
        
        {/* Safe area padding for notched devices */}
        <div className="pb-safe">
          <div className="flex items-center justify-around px-2 py-2">
            {/* Main navigation items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.activePattern);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all duration-300 active:scale-95",
                    active
                      ? "text-theme-accent"
                      : "text-gray-600 hover:text-theme-accent-hover"
                  )}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                >
                  {/* Active indicator bubble */}
                  {active && (
                    <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-theme-accent-light to-theme-tertiary-light opacity-100 transition-opacity" />
                  )}

                  {/* Icon with scale animation */}
                  <div className="relative z-10">
                    <Icon
                      className={cn(
                        "h-6 w-6 transition-transform duration-300",
                        active && "scale-110"
                      )}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Label with fade animation */}
                  <span
                    className={cn(
                      "relative z-10 text-[10px] font-semibold transition-all duration-300",
                      active ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Active dot indicator (modern minimal style) */}
                  {active && (
                    <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-theme-accent" />
                  )}
                </Link>
              );
            })}

            {/* Profile / Sign In */}
            <SignedIn>
              <Link
                href="/profile"
                className={cn(
                  "group relative flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all duration-300 active:scale-95",
                  pathname === "/profile"
                    ? "text-theme-accent"
                    : "text-gray-600 hover:text-theme-accent-hover"
                )}
                aria-label="Profile"
                aria-current={pathname === "/profile" ? "page" : undefined}
              >
                {pathname === "/profile" && (
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-theme-accent-light to-theme-tertiary-light opacity-100" />
                )}
                
                <div className="relative z-10">
                  <User
                    className={cn(
                      "h-6 w-6 transition-transform duration-300",
                      pathname === "/profile" && "scale-110"
                    )}
                    aria-hidden="true"
                  />
                </div>
                
                <span
                  className={cn(
                    "relative z-10 text-[10px] font-semibold transition-all duration-300",
                    pathname === "/profile"
                      ? "opacity-100"
                      : "opacity-70 group-hover:opacity-100"
                  )}
                >
                  Profile
                </span>
                
                {pathname === "/profile" && (
                  <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-theme-accent" />
                )}
              </Link>
            </SignedIn>

            <SignedOut>
              <button
                onClick={() => openSignIn()}
                className="group relative flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-gray-600 transition-all duration-300 hover:text-theme-accent-hover active:scale-95"
                aria-label="Sign in"
              >
                <div className="relative z-10">
                  <User
                    className="h-6 w-6 transition-transform duration-300"
                    aria-hidden="true"
                  />
                </div>
                
                <span className="relative z-10 text-[10px] font-semibold opacity-70 transition-all duration-300 group-hover:opacity-100">
                  Sign In
                </span>
              </button>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
}
