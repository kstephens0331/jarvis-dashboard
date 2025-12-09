'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/chores', label: 'Chores', icon: '🧹' },
  { href: '/bills', label: 'Bills', icon: '💵' },
  { href: '/medical', label: 'Medical', icon: '🏥' },
  { href: '/meals', label: 'Meals', icon: '🍽️' },
  { href: '/shopping', label: 'Shopping', icon: '🛒' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 md:relative md:border-t-0 md:border-r md:h-screen md:w-64 z-50">
      {/* Mobile Bottom Nav */}
      <div className="flex md:hidden justify-around py-2 px-1">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              pathname === item.href
                ? 'text-blue-400 bg-blue-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col h-full">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            JARVIS
          </h1>
          <p className="text-xs text-slate-400">Living Household OS</p>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'text-blue-400 bg-blue-500/10 border-l-2 border-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Online
          </div>
        </div>
      </div>
    </nav>
  );
}
