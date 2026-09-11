import Link from 'next/link';
import { Home, Users, Package, AlertTriangle, Settings, MapPin } from 'lucide-react';
import LogoutButton from './logout-button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 text-secondary">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-primary font-black text-xl tracking-tight">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              JP
            </div>
            JustePrix Admin
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-light text-primary font-bold">
            <Home size={20} />
            Dashboard
          </Link>
          <Link href="/admin/observations" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors">
            <AlertTriangle size={20} />
            Signalements
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors">
            <Package size={20} />
            Catégories
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors">
            <Package size={20} />
            Produits
          </Link>
          <Link href="/admin/stores" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors">
            <Home size={20} />
            Boutiques
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors">
            <Users size={20} />
            Utilisateurs
          </Link>
          <Link href="/admin/gatherings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 font-medium transition-colors">
            <MapPin size={20} />
            Rassemblement
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
            <Settings size={18} />
            Paramètres
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-bold text-gray-800">Panneau d&apos;Administration</h1>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}