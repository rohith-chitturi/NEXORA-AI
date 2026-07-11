'use client';

import { UserProfile } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";

export default function ProfilePage() {
  return (
    <main className="min-h-screen pt-32 pb-16 px-6 flex flex-col items-center">
      <div className="w-full max-w-4xl mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
          <p className="text-gray-400">Manage your profile, security, and preferences</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <UserProfile 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-none bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl",
              navbar: "hidden md:flex bg-white/5 border-r border-white/10",
              navbarButton: "text-gray-400 hover:text-white hover:bg-white/5",
              navbarButton__active: "text-purple-400 bg-purple-500/10",
              headerTitle: "text-white font-bold",
              headerSubtitle: "text-gray-400",
              profileSectionTitleText: "text-white",
              profileSectionContent: "border-b border-white/5",
              profileSectionPrimaryButton: "text-purple-400 hover:text-purple-300",
              accordionTriggerButton: "text-gray-300 hover:text-white",
              breadcrumbsItem: "text-gray-400 hover:text-white",
              breadcrumbsItemDivider: "text-gray-600",
              scrollBox: "bg-transparent",
              badge: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
              formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white",
              formButtonReset: "text-gray-400 hover:text-white",
              formFieldLabel: "text-gray-300",
              formFieldInput: "bg-black/50 border border-white/10 text-white focus:border-purple-500",
              formFieldSuccessText: "text-green-400",
              formFieldErrorText: "text-red-400",
              dividerLine: "bg-white/10",
              dividerText: "text-gray-500",
              userPreviewMainIdentifier: "text-white",
              userPreviewSecondaryIdentifier: "text-gray-400",
            }
          }}
        />
      </motion.div>
    </main>
  );
}
