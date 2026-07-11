'use client';

import { ShieldCheck, BarChart3, Users, Store, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/vendors', label: 'Vendors', icon: Store },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col md:flex-row gap-8 max-w-7xl mx-auto px-6">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sticky top-28 shadow-2xl shadow-blue-500/10">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Admin</h2>
              <p className="text-xs text-blue-400 font-medium tracking-wider uppercase">God Mode</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {links.map(link => (
              <Link 
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  pathname === link.href 
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <Link 
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
