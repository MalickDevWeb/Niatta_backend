'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, ChevronUp, ChevronDown } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  icon: string | null;
  unit: string;
  description: string | null;
  brand: string | null;
  weight: string | null;
  officialPriceCap: number | null;
  status: string;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  products: Product[];
  categories: Category[];
}

export default function ProductsClient({ products, categories }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800">Gestion des Produits</h2>
        <span className="text-sm text-gray-500 font-medium">{products.length} produit(s)</span>
      </div>

      {/* Add Product Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-black text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={18} className="text-green-600" /> Ajouter un produit
        </h3>
        <form action="/api/admin/products" method="POST" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Nom *</label>
              <input required type="text" name="name" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" placeholder="Ex: Riz brisé parfumé" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Catégorie *</label>
              <select required name="categoryId" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent">
                <option value="">Sélectionner...</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Unité *</label>
              <input required type="text" name="unit" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" placeholder="Ex: kg, litre, sac" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Icône Iconify</label>
              <input type="text" name="icon" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" placeholder="fluent-emoji-flat:bowl-with-spoon" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Marque</label>
              <input type="text" name="brand" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" placeholder="Ex: SDE, Pamelor" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Grammage</label>
              <input type="text" name="weight" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" placeholder="Ex: 25kg, 1L" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Plafond légal (FCFA)</label>
              <input type="number" name="officialPriceCap" step="1" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" placeholder="Ex: 500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
              <input type="text" name="description" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" placeholder="Description optionnelle" />
            </div>
          </div>
          <button type="submit" className="flex items-center gap-2 bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-green-700 transition-colors">
            <Plus size={16} /> Ajouter le produit
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-5 py-4">Produit</th>
                <th className="px-5 py-4">Catégorie</th>
                <th className="px-5 py-4">Unité</th>
                <th className="px-5 py-4">Plafond légal</th>
                <th className="px-5 py-4">Statut</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">
                    Aucun produit. Ajoutez-en un ci-dessus.
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <>
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-xs overflow-hidden" title={product.icon || 'Aucune icône (défaut)'}>
                            {product.icon ? (
                              <span className="text-[10px] text-gray-500 truncate px-1">{product.icon.split(':')[1] || product.icon}</span>
                            ) : (
                              <span className="text-gray-300">📦</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{product.name}</div>
                            {(product.brand || product.weight) && (
                              <div className="text-xs text-gray-400 mt-0.5">{[product.brand, product.weight].filter(Boolean).join(' • ')}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{product.category.name}</td>
                      <td className="px-5 py-4 text-gray-600">{product.unit}</td>
                      <td className="px-5 py-4">
                        {product.officialPriceCap != null ? (
                          <span className="font-black text-blue-700">{product.officialPriceCap.toLocaleString('fr-FR')} FCFA</span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {product.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingId(editingId === product.id ? null : product.id)}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={15} />
                          </button>
                          <form action={`/api/admin/products/${product.id}/toggle`} method="POST" className="inline">
                            <button type="submit" className={`p-1.5 rounded-lg transition-colors ${product.status === 'active' ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`} title={product.status === 'active' ? 'Désactiver' : 'Activer'}>
                              {product.status === 'active' ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                            </button>
                          </form>
                          <form action={`/api/admin/products/${product.id}/delete`} method="POST" className="inline" onSubmit={e => { if (!confirm(`Supprimer "${product.name}" ?`)) e.preventDefault(); }}>
                            <button type="submit" className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="Supprimer">
                              <Trash2 size={15} />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                    {/* Inline Edit Row */}
                    {editingId === product.id && (
                      <tr key={`edit-${product.id}`} className="bg-blue-50 border-blue-100">
                        <td colSpan={6} className="px-5 py-4">
                          <form action={`/api/admin/products/${product.id}`} method="POST" className="space-y-3">
                            <input type="hidden" name="_method" value="PUT" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Nom *</label>
                                <input required type="text" name="name" defaultValue={product.name} className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Catégorie *</label>
                                <select required name="categoryId" defaultValue={product.category.id} className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-400">
                                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Unité *</label>
                                <input required type="text" name="unit" defaultValue={product.unit} className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Plafond légal (FCFA)</label>
                                <input type="number" step="1" name="officialPriceCap" defaultValue={product.officialPriceCap ?? ''} className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Icône Iconify</label>
                                <input type="text" name="icon" defaultValue={product.icon ?? ''} className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Marque</label>
                                <input type="text" name="brand" defaultValue={product.brand ?? ''} className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Grammage</label>
                                <input type="text" name="weight" defaultValue={product.weight ?? ''} className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                                <input type="text" name="description" defaultValue={product.description ?? ''} className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button type="submit" className="flex items-center gap-1.5 bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-blue-700 transition-colors">
                                <Check size={13} /> Enregistrer
                              </button>
                              <button type="button" onClick={() => setEditingId(null)} className="flex items-center gap-1.5 bg-gray-100 text-gray-600 font-bold px-4 py-2 rounded-xl text-xs hover:bg-gray-200 transition-colors">
                                <X size={13} /> Annuler
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
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
