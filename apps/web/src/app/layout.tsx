import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import { Sparkles, Search, ShoppingCart, Heart } from "lucide-react";
import "./globals.css";
import { AIAssistantWidget } from "@/components/ui/ai-assistant-widget";
import { CartIcon } from "@/components/ui/cart-icon";
import { CartDrawer } from "@/components/ui/cart-drawer";
import { CartSync } from "@/components/CartSync";
import { ClerkProvider, SignInButton, UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import Link from "next/link";
import { SearchBar } from "@/components/ui/search-bar";
import { AIAssistant } from "@/components/ui/ai-assistant";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXORA AI - Autonomous Shopping",
  description: "Your personal autonomous AI shopping agent.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${outfit.variable} ${spaceGrotesk.variable} h-full antialiased dark`}
      >
        <body className="min-h-full flex flex-col bg-[var(--background)] text-foreground font-sans transition-colors duration-500">
          {/* Global Navigation */}
          <nav className="fixed top-0 w-full border-b border-white/5 bg-black/40 backdrop-blur-xl z-40">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-lg tracking-tight text-white">NEXORA</span>
              </div>
              
              {/* Search Bar for Traditional E-commerce */}
              <SearchBar />

              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center justify-center gap-4">
                  {!userId ? (
                    <SignInButton mode="modal">
                      <button className="hover:text-white transition-colors text-xs font-medium border border-white/20 rounded-full px-3 py-1.5">Sign In</button>
                    </SignInButton>
                  ) : (
                    <>
                      <Link href="/wishlist" className="hover:text-pink-400 transition-colors text-gray-400 flex items-center justify-center p-1" title="Wishlist">
                        <Heart className="w-5 h-5" />
                      </Link>
                      <Link href="/orders" className="hover:text-white transition-colors text-xs font-medium hidden sm:block">Orders</Link>
                      <Link href="/profile" className="hover:text-white transition-colors text-xs font-medium hidden sm:block">Profile</Link>
                      <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
                    </>
                  )}
                </div>
                
                <CartIcon />
              </div>
            </div>
          </nav>

          {children}
          
          <footer className="mt-auto py-8 border-t border-white/5 bg-black/40 text-center">
            <Link href="/vendor" className="text-gray-500 hover:text-purple-400 text-sm font-medium transition-colors">
              Vendor Portal
            </Link>
          </footer>
          
          {/* Global Floating AI Agent */}
          <AIAssistantWidget />

          <CartDrawer />
          <CartSync />
        </body>
      </html>
    </ClerkProvider>
  );
}
