import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sparkles, Search, ShoppingCart } from "lucide-react";
import "./globals.css";
import { AIAssistantWidget } from "@/components/ui/ai-assistant-widget";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXORA AI - Autonomous Shopping",
  description: "Your personal autonomous AI shopping agent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      >
        <body className="min-h-full flex flex-col bg-[var(--background)] text-foreground">
          {/* Global Navigation */}
          <nav className="fixed top-0 w-full border-b border-white/5 bg-black/40 backdrop-blur-xl z-40">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-lg tracking-tight text-white">NEXORA</span>
              </div>
              
              {/* Search Bar for Traditional E-commerce */}
              <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Search products, brands, and categories..."
                />
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center justify-center">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="hover:text-white transition-colors text-xs font-medium border border-white/20 rounded-full px-3 py-1.5">Sign In</button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
                  </SignedIn>
                </div>
                
                <a href="#" className="hover:text-white transition-colors flex flex-col items-center gap-1">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-[10px]">Cart</span>
                </a>
              </div>
            </div>
          </nav>

          {children}
          
          {/* Global Floating AI Agent */}
          <AIAssistantWidget />
        </body>
      </html>
    </ClerkProvider>
  );
}
