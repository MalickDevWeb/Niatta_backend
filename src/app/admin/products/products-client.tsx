'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, ChevronUp, ChevronDown, Image as ImageIcon, Box } from 'lucide-react';
import { addProduct, updateProduct, toggleProductStatus, deleteProduct, addProductFormat, deleteProductFormat } from './actions';

interface Format {
  id: string;
  label: string;
  unit: string;
  weight: string | null;
  officialPriceCap: number | null;
  imageUrl: string | null;
}

interface Product {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  status: string;
  category: { id: string; name: string };
  formats: Format[];
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        <form action={addProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Nom *</label>
              <input required type="text" name="name" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" placeholder="Ex: Huile" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Catégorie *</label>
              <select required name="categoryId" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent">
                <option value="">Sélectionner...</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Image Principale (Fichier)</label>
              <input type="file" accept="image/*" name="imageFile" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
              <input type="text" name="description" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" placeholder="Description optionnelle" />
            </div>
          </div>
          <button type="submit" className="flex items-center gap-2 bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-green-700 transition-colors">
            <Plus size={16} /> Créer le produit
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-5 py-4 w-10"></th>
                <th className="px-5 py-4">Produit</th>
                <th className="px-5 py-4">Catégorie</th>
                <th className="px-5 py-4">Formats</th>
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
                      <td className="px-5 py-4 text-center">
                        <button onClick={() => setExpandedId(expandedId === product.id ? null : product.id)} className="p-1 rounded-md hover:bg-gray-200 text-gray-500">
                          {expandedId === product.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden">
                            {product.icon ? (
                              <img src={product.icon} alt="Icon" className="w-full h-full object-contain" />
                            ) : (
                              <ImageIcon size={18} className="text-gray-300" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{product.name}</div>
                            {product.description && <div className="text-xs text-gray-400 mt-0.5">{product.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{product.category.name}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full text-xs font-semibold text-gray-700">
                          <Box size={12} /> {product.formats.length}
                        </span>
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
                          <form action={toggleProductStatus} className="inline">
                            <input type="hidden" name="id" value={product.id} />
                            <input type="hidden" name="currentStatus" value={product.status} />
                            <button type="submit" className={`p-1.5 rounded-lg transition-colors ${product.status === 'active' ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`} title={product.status === 'active' ? 'Désactiver' : 'Activer'}>
                              {product.status === 'active' ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                            </button>
                          </form>
                          <form action={deleteProduct} className="inline" onSubmit={e => { if (!confirm(`Supprimer "${product.name}" et tous ses formats ?`)) e.preventDefault(); }}>
                            <input type="hidden" name="id" value={product.id} />
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
                          <form action={updateProduct} className="space-y-3">
                            <input type="hidden" name="id" value={product.id} />
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                                <label className="block text-xs font-bold text-gray-600 mb-1">Image Principale (Laisser vide pour ne pas changer)</label>
                                <input type="file" accept="image/*" name="imageFile" className="w-full px-3 py-1 border border-blue-200 rounded-xl text-xs bg-white" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                                <input type="text" name="description" defaultValue={product.description ?? ''} className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2">
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

                    {/* Formats Manager (Accordion) */}
                    {expandedId === product.id && (
                      <tr className="bg-gray-50/50">
                        <td colSpan={6} className="px-8 py-6">
                          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                            <h4 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
                              <Box size={16} className="text-purple-500" /> Formats (Sous-produits)
                            </h4>
                            
                            <div className="grid grid-cols-1 gap-3 mb-6">
                              {product.formats.map(format => (
                                <div key={format.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200 transition-all">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex-shrink-0 bg-white rounded-lg border border-gray-100 flex items-center justify-center p-1">
                                      {format.imageUrl ? (
                                        <img src={format.imageUrl} alt={format.label} className="w-full h-full object-contain" />
                                      ) : (
                                        <ImageIcon size={14} className="text-gray-300" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-bold text-sm text-gray-900">{format.label}</div>
                                      <div className="text-xs text-gray-500 flex gap-2">
                                        <span>Unité: {format.unit}</span>
                                        {format.weight && <span>• Poids: {format.weight}</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <div className="font-black text-sm text-blue-700">{format.officialPriceCap ? format.officialPriceCap.toLocaleString() + ' FCFA' : 'Pas de plafond'}</div>
                                    </div>
                                    <form action={deleteProductFormat} className="inline" onSubmit={e => { if (!confirm(`Supprimer le format "${format.label}" ?`)) e.preventDefault(); }}>
                                      <input type="hidden" name="id" value={format.id} />
                                      <button type="submit" className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                                        <Trash2 size={14} />
                                      </button>
                                    </form>
                                  </div>
                                </div>
                              ))}
                              {product.formats.length === 0 && <p className="text-xs text-gray-400 italic">Aucun format existant pour le moment.</p>}
                            </div>

                            {/* Add Format Form */}
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                              <h5 className="text-xs font-bold text-purple-800 mb-3 uppercase tracking-wider">Ajouter un format</h5>
                              <form action={addProductFormat} className="space-y-3">
                                <input type="hidden" name="productId" value={product.id} />
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Label * (ex: Grand bidon)</label>
                                    <input required type="text" name="label" className="w-full px-2.5 py-1.5 border border-purple-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-400" />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Unité * (ex: litre, kg)</label>
                                    <input required type="text" name="unit" className="w-full px-2.5 py-1.5 border border-purple-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-400" />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Poids (ex: 20 L)</label>
                                    <input type="text" name="weight" className="w-full px-2.5 py-1.5 border border-purple-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-400" />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Prix Officiel (FCFA)</label>
                                    <input type="number" step="1" name="officialPriceCap" className="w-full px-2.5 py-1.5 border border-purple-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-400" />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Image du format</label>
                                    <input type="file" accept="image/*" name="imageFile" className="w-full text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-purple-200 file:text-purple-700" />
                                  </div>
                                </div>
                                <button type="submit" className="flex items-center gap-1.5 bg-purple-600 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-purple-700 transition-colors">
                                  <Plus size={13} /> Ajouter ce format
                                </button>
                              </form>
                            </div>
                          </div>
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
