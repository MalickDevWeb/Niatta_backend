import { Package, AlertTriangle, Users, MapPin } from 'lucide-react';

import { prisma } from '../../../lib/prisma';

export default async function AdminDashboard() {
  // Fetch basic stats
  const [productsCount, observationsCount, usersCount, storesCount] = await Promise.all([
    prisma.product.count(),
    prisma.priceObservation.count(),
    prisma.user.count(),
    prisma.store.count(),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-gray-800">Vue d&apos;ensemble</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Signalements</p>
            <h3 className="text-2xl font-black text-gray-900">{observationsCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Produits Actifs</p>
            <h3 className="text-2xl font-black text-gray-900">{productsCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Citoyens</p>
            <h3 className="text-2xl font-black text-gray-900">{usersCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Boutiques</p>
            <h3 className="text-2xl font-black text-gray-900">{storesCount}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Activité récente</h3>
        <p className="text-gray-500">Le tableau de bord est prêt. Vous pouvez naviguer via le menu pour gérer les données.</p>
      </div>
    </div>
  );
}
