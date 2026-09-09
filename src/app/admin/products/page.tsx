import { PrismaClient } from '@prisma/client';
import { addProduct } from './actions';
import { Plus } from 'lucide-react';

const prisma = new PrismaClient();

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800">Gestion des Produits</h2>
      </div>

      {/* Add Product Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Ajouter un nouveau produit</h3>
        <form action={addProduct} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nom</label>
            <input required type="text" name="name" className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors" placeholder="Ex: Riz brisé parfumé" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Icône (Iconify)</label>
            <input type="text" name="icon" className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors" placeholder="fluent-emoji-flat:bowl-with-spoon" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Catégorie</label>
            <select required name="categoryId" className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors bg-white">
              <option value="">Sélectionner...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Unité</label>
            <input required type="text" name="unit" className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors" placeholder="Ex: kg, litre, sac" />
          </div>
          <button type="submit" className="h-[44px] flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors">
            <Plus size={18} />
            Ajouter
          </button>
        </form>
      </div>
      
      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">Unité</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.category.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {product.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
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
