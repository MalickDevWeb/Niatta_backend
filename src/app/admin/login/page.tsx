'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (password.length !== 4) {
      setError('Mot de passe incorrect');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const json = await res.json();
      if (!json.success) {
        // Pour le back-office, on unifie le message d'erreur pour des raisons de sécurité
        setError('Mot de passe incorrect');
        setLoading(false);
        return;
      }
      // Persist token for API calls + cookie for the middleware guard
      localStorage.setItem('token', json.data.token);
      document.cookie = `admin_token=${json.data.token}; path=/; max-age=${30 * 24 * 3600}; SameSite=Lax`;
      router.push('/admin');
    } catch {
      setError('Erreur réseau');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0f172a]">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00a859] rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-[#2f80ed] rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-md z-10 p-4">
        {/* Glassmorphic Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[32px] p-10 relative overflow-hidden group transition-all duration-500 hover:shadow-[0_8px_40px_0_rgba(0,168,89,0.2)]">
          
          {/* Subtle top glare */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00a859] to-[#007f43] shadow-lg shadow-[#00a859]/30 flex items-center justify-center text-white text-3xl font-black mb-6 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              JP
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">JustePrix</h1>
            <p className="text-sm text-gray-300/80 font-medium tracking-wide uppercase">Portail Administrateur</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider ml-1">Téléphone</label>
              <div className="relative group/input">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+221771719013"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-400/50 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a859]/50 focus:border-[#00a859]/50 transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider ml-1">Mot de passe</label>
              <div className="relative group/input">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-400/50 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a859]/50 focus:border-[#00a859]/50 transition-all duration-300"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold px-5 py-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden bg-white text-[#0f172a] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-black py-4 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-[0.98] mt-4"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-[#0f172a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion...
                  </>
                ) : (
                  'Accéder au Dashboard'
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-white/30 font-medium">
              Système sécurisé • Accès restreint
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}