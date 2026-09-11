import { addStore, updateStore, toggleStoreStatus, deleteStore } from './actions';
import { Plus, MapPin, Star } from 'lucide-react';

import { prisma } from '../../../../lib/prisma';

export default async function StoresPage() {
  const stores = await prisma.store.findMany({
    include: { _count: { select: { observations: true } } },
    orderBy: { createdAt: 'desc' },
  }) as any[];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800">Gestion des Boutiques</h2>
        <span className="text-sm text-gray-500 font-medium">{stores.length} boutique(s)</span>
      </div>

      {/* Add Store Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-black text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={18} className="text-green-600" /> Ajouter une boutique
        </h3>
        <form action={addStore} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Nom de la boutique</label>
              <input type="text" name="name" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" placeholder="Ex: Épicerie Chez Modou" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Ville *</label>
              <input required type="text" name="city" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" placeholder="Ex: Dakar" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Quartier *</label>
              <input required type="text" name="neighborhood" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" placeholder="Ex: Médina" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-600 mb-1">Adresse complète</label>
              <input type="text" name="address" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" placeholder="Ex: Rue 10, Face à la mosquée" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Latitude GPS *</label>
              <input required type="number" step="0.0000001" name="latitude" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" placeholder="14.6928" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Longitude GPS *</label>
              <input required type="number" step="0.0000001" name="longitude" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" placeholder="-17.4467" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Note (0 - 5)</label>
              <input type="number" step="0.1" min="0" max="5" name="rating" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" placeholder="Ex: 4.5" />
            </div>
          </div>
          <p className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
            💡 Sur Google Maps : clic droit sur un lieu → les coordonnées GPS apparaissent
          </p>
          <button type="submit" className="flex items-center gap-2 bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-green-700 transition-colors">
            <Plus size={16} /> Ajouter la boutique
          </button>
        </form>
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-5 py-4">Boutique</th>
                <th className="px-5 py-4">Emplacement</th>
                <th className="px-5 py-4">Coordonnées GPS</th>
                <th className="px-5 py-4">Note</th>
                <th className="px-5 py-4">Source</th>
                <th className="px-5 py-4">Obs.</th>
                <th className="px-5 py-4">Statut</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-400 text-sm">
                    Aucune boutique. Ajoutez-en une ci-dessus.
                  </td>
                </tr>
              ) : (
                stores.map((store: any) => (
                  <>
                    <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-bold text-gray-900">
                        <div>{store.name}</div>
                        {store.address && <div className="text-xs text-gray-400 mt-0.5">{store.address}</div>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-gray-900 font-medium">{store.city}</div>
                        <div className="text-xs text-gray-500">{store.neighborhood}</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-gray-500">
                        <div>{Number(store.latitude).toFixed(4)}</div>
                        <div>{Number(store.longitude).toFixed(4)}</div>
                      </td>
                      <td className="px-5 py-4">
                        {store.rating ? (
                          <span className="flex items-center gap-1 text-amber-600 font-bold">
                            <Star size={13} fill="currentColor" /> {Number(store.rating).toFixed(1)}
                          </span>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${store.source === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {store.source === 'admin' ? 'Admin' : 'Citoyen'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 font-bold">{store._count.observations}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${store.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {store.status === 'active' ? 'Active' : 'Fermée'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle Status */}
                          <form action={toggleStoreStatus} className="inline-flex">
                            <input type="hidden" name="id" value={store.id} />
                            <input type="hidden" name="currentStatus" value={store.status} />
                            <button type="submit" className={`text-xs px-3 py-1.5 font-bold rounded-lg transition-colors ${store.status === 'active' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                              {store.status === 'active' ? 'Fermer' : 'Rouvrir'}
                            </button>
                          </form>
                          {/* Delete */}
                          <form action={deleteStore} className="inline-flex">
                            <input type="hidden" name="id" value={store.id} />
                            <button type="submit" className="text-xs px-2 py-1.5 font-bold rounded-lg bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors ml-1">
                              ✕
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>

                    {/* Edit Row — inline form */}
                    <tr key={`edit-${store.id}`} className="bg-amber-50">
                      <td colSpan={8} className="px-5 py-3">
                        <details className="group">
                          <summary className="text-xs font-bold text-amber-700 cursor-pointer hover:text-amber-900 flex items-center gap-1">
                            <MapPin size={12} /> Modifier cette boutique
                          </summary>
                          <form action={updateStore} className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                            <input type="hidden" name="id" value={store.id} />
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Nom</label>
                              <input type="text" name="name" defaultValue={store.name} className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-amber-400" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Ville</label>
                              <input type="text" name="city" defaultValue={store.city || ''} className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-amber-400" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Quartier</label>
                              <input type="text" name="neighborhood" defaultValue={store.neighborhood || ''} className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-amber-400" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Adresse</label>
                              <input type="text" name="address" defaultValue={store.address || ''} className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-amber-400" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Latitude GPS</label>
                              <input type="number" step="0.0000001" name="latitude" defaultValue={Number(store.latitude)} className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm font-mono bg-white outline-none focus:ring-2 focus:ring-amber-400" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Longitude GPS</label>
                              <input type="number" step="0.0000001" name="longitude" defaultValue={Number(store.longitude)} className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm font-mono bg-white outline-none focus:ring-2 focus:ring-amber-400" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Note (0-5)</label>
                              <input type="number" step="0.1" min="0" max="5" name="rating" defaultValue={store.rating ? Number(store.rating) : ''} className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-amber-400" />
                            </div>
                            <div className="flex items-end">
                              <button type="submit" className="w-full flex items-center justify-center gap-1.5 bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-700 transition-colors">
                                ✓ Enregistrer
                              </button>
                            </div>
                          </form>
                        </details>
                      </td>
                    </tr>
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
