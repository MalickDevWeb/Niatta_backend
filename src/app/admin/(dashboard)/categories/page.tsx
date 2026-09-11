import { addCategory, toggleCategoryStatus, updateCategory, deleteCategory } from './actions';
import { Plus, Edit2 } from 'lucide-react';

import { prisma } from '../../../../lib/prisma';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } }
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800">Gestion des Catégories</h2>
      </div>

      {/* Add Category Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Ajouter une catégorie</h3>
        <form action={addCategory} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nom de la catégorie</label>
            <input required type="text" name="name" className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors" placeholder="Ex: Céréales" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Icône (Iconify ou URL)</label>
            <input type="text" name="icon" className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors" placeholder="fluent-emoji-flat:star ou https://..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <input type="text" name="description" className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors" placeholder="Optionnel" />
          </div>
          <button type="submit" className="h-[44px] flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors">
            <Plus size={18} />
            Ajouter
          </button>
        </form>
      </div>
      
      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Nombre de produits</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucune catégorie trouvée.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <>
                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {cat.name}
                        {cat.icon && <span className="ml-2 text-xs text-gray-500">({cat.icon})</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {cat.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-bold">
                        {cat._count.products}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          cat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {cat.status === 'active' ? 'Active' : 'Désactivée'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <form action={toggleCategoryStatus} className="inline-flex">
                            <input type="hidden" name="id" value={cat.id} />
                            <input type="hidden" name="currentStatus" value={cat.status} />
                            <button type="submit" className={`text-xs px-3 py-1.5 font-bold rounded-lg transition-colors ${
                              cat.status === 'active' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}>
                              {cat.status === 'active' ? 'Désactiver' : 'Réactiver'}
                            </button>
                          </form>
                          {cat._count.products === 0 && (
                            <form action={deleteCategory} className="inline-flex">
                              <input type="hidden" name="id" value={cat.id} />
                              <button type="submit" className="text-xs px-2 py-1.5 font-bold rounded-lg bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors ml-1">
                                ✕
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr key={`edit-${cat.id}`} className="bg-amber-50">
                      <td colSpan={5} className="px-6 py-3 border-b border-amber-100">
                        <details className="group">
                          <summary className="text-xs font-bold text-amber-700 cursor-pointer hover:text-amber-900 flex items-center gap-1">
                            <Edit2 size={12} /> Modifier
                          </summary>
                          <form action={updateCategory} className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                            <input type="hidden" name="id" value={cat.id} />
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Nom</label>
                              <input type="text" name="name" defaultValue={cat.name} className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-amber-400" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Icône</label>
                              <input type="text" name="icon" defaultValue={cat.icon || ''} className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-amber-400" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                              <input type="text" name="description" defaultValue={cat.description || ''} className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-amber-400" />
                            </div>
                            <button type="submit" className="h-[38px] flex items-center justify-center gap-1.5 bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-700 transition-colors">
                              ✓ Enregistrer
                            </button>
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
