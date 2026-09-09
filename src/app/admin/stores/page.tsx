import { PrismaClient } from '@prisma/client';
import { addStore, toggleStoreStatus } from './actions';
import { Plus } from 'lucide-react';

const prisma = new PrismaClient();

export default async function StoresPage() {
  const stores = await prisma.store.findMany({
    include: {
      _count: { select: { observations: true } }
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800">Gestion des Boutiques</h2>
      </div>

      {/* Add Store Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Ajouter une boutique manuellement</h3>
        <form action={addStore} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nom (Optionnel)</label>
            <input type="text" name="name" className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors" placeholder="Nom de la boutique" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Ville</label>
            <input required type="text" name="city" className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors" placeholder="Ex: Dakar" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Quartier</label>
            <input required type="text" name="neighborhood" className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors" placeholder="Ex: Plateau" />
          </div>
          <button type="submit" className="h-[44px] flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors">
            <Plus size={18} />
            Ajouter
          </button>
        </form>
      </div>
      
      {/* Stores Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Nom de la boutique</th>
                <th className="px-6 py-4">Emplacement</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Observations</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucune boutique trouvée.
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {store.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{store.city}</div>
                      <div className="text-xs text-gray-500">{store.neighborhood}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        store.source === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {store.source === 'admin' ? 'Administration' : 'Signalement Citoyen'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-bold">
                      {store._count.observations} signalements
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        store.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {store.status === 'active' ? 'Active' : 'Fermée'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={toggleStoreStatus} className="inline-flex">
                        <input type="hidden" name="id" value={store.id} />
                        <input type="hidden" name="currentStatus" value={store.status} />
                        <button type="submit" className={`text-xs px-3 py-1.5 font-bold rounded-lg transition-colors ${
                          store.status === 'active' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}>
                          {store.status === 'active' ? 'Fermer' : 'Rouvrir'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
