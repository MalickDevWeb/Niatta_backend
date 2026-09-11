'use client';

import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Lax';
      window.location.href = '/admin/login';
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
    >
      <LogOut size={18} />
      Déconnexion
    </button>
  );
}