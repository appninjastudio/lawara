'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Calculator, 
  Link2, 
  Settings,
  Scale,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

const navItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview'
  },
  {
    name: 'Dosya Takibi',
    href: '/cases',
    icon: FolderKanban,
    description: 'Case Management'
  },
  {
    name: 'Finans',
    href: '/finance',
    icon: Calculator,
    description: 'Finance & Interest'
  },
  {
    name: 'Entegrasyon',
    href: '/integrations',
    icon: Link2,
    description: 'UYAP & SMS'
  },
  {
    name: 'İcra Caller',
    href: '/caller',
    icon: PhoneCall,
    description: 'PBX & Arama'
  },
  {
    name: 'Ayarlar',
    href: '/settings',
    icon: Settings,
    description: 'Settings'
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(json => {
        if (json.user) {
          setUserName(json.user.name);
          const parts = json.user.name.split(' ');
          setUserInitials(parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2));
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <aside 
      className={clsx(
        'h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Scale className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight">Lawara</span>
              <span className="text-xs text-slate-400">Hybrid</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <item.icon className={clsx('w-5 h-5 flex-shrink-0', isActive && 'text-white')} />
                  {!collapsed && (
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{item.name}</span>
                      <span className={clsx(
                        'text-xs',
                        isActive ? 'text-blue-100' : 'text-slate-500'
                      )}>
                        {item.description}
                      </span>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className={clsx(
          'flex items-center gap-3',
          collapsed && 'justify-center'
        )}>
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
            {userInitials || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium block truncate">{userName || 'Kullanıcı'}</span>
              <span className="text-xs text-slate-400">Administrator</span>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={handleLogout}
            className="w-full mt-2 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors flex justify-center"
            title="Çıkış Yap"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
