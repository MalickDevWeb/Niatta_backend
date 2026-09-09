import { PrismaClient } from '@prisma/client';
import { addCategory, toggleCategoryStatus } from './actions';
import { Plus } from 'lucide-react';

const prisma = new PrismaClient();

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
            <label className="block text-sm font-bold text-gray-700 mb-1">Icône (Iconify)</label>
            <input type="text" name="icon" className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors" placeholder="fluent-emoji-flat:star" />
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
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {cat.name}
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
                      <form action={toggleCategoryStatus} className="inline-flex">
                        <input type="hidden" name="id" value={cat.id} />
                        <input type="hidden" name="currentStatus" value={cat.status} />
                        <button type="submit" className={`text-xs px-3 py-1.5 font-bold rounded-lg transition-colors ${
                          cat.status === 'active' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}>
                          {cat.status === 'active' ? 'Désactiver' : 'Réactiver'}
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
