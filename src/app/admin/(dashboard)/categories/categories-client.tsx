'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, ChevronUp, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { addCategory, updateCategory, toggleCategoryStatus, deleteCategory } from './actions';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  status: string;
}

interface Props {
  categories: Category[];
}

export default function CategoriesClient({ categories }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800">Gestion des Catégories</h2>
        <span className="text-sm text-gray-500 font-medium">{categories.length} catégorie(s)</span>
      </div>

      {/* Add Category Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-black text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={18} className="text-blue-600" /> Ajouter une catégorie
        </h3>
        <form action={addCategory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Nom *</label>
              <input required type="text" name="name" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" placeholder="Ex: Céréales" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Image (Fichier)</label>
              <input type="file" accept="image/*" name="imageFile" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
              <input type="text" name="description" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" placeholder="Optionnel" />
            </div>
          </div>
          <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Créer
          </button>
        </form>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-5 py-4">Catégorie</th>
                <th className="px-5 py-4">Statut</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-gray-400 text-sm">
                    Aucune catégorie. Ajoutez-en une ci-dessus.
                  </td>
                </tr>
              ) : (
                categories.map(category => (
                  <>
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden">
                            {category.icon ? (
                              <img src={category.icon} alt="Icon" className="w-full h-full object-contain" />
                            ) : (
                              <ImageIcon size={18} className="text-gray-300" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{category.name}</div>
                            {category.description && <div className="text-xs text-gray-400 mt-0.5">{category.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${category.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {category.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingId(editingId === category.id ? null : category.id)}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={15} />
                          </button>
                          <form action={toggleCategoryStatus} className="inline">
                            <input type="hidden" name="id" value={category.id} />
                            <input type="hidden" name="currentStatus" value={category.status} />
                            <button type="submit" className={`p-1.5 rounded-lg transition-colors ${category.status === 'active' ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`} title={category.status === 'active' ? 'Désactiver' : 'Activer'}>
                              {category.status === 'active' ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                            </button>
                          </form>
                          <form action={deleteCategory} className="inline" onSubmit={e => { if (!confirm(`Supprimer la catégorie "${category.name}" ?`)) e.preventDefault(); }}>
                            <input type="hidden" name="id" value={category.id} />
                            <button type="submit" className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="Supprimer">
                              <Trash2 size={15} />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Inline Edit Row */}
                    {editingId === category.id && (
                      <tr key={`edit-${category.id}`} className="bg-blue-50 border-blue-100">
                        <td colSpan={3} className="px-5 py-4">
                          <form action={updateCategory} className="space-y-3">
                            <input type="hidden" name="id" value={category.id} />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Nom *</label>
                                <input required type="text" name="name" defaultValue={category.name} className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Image (Laisser vide pour garder l'actuelle)</label>
                                <input type="file" accept="image/*" name="imageFile" className="w-full px-3 py-1 border border-blue-200 rounded-xl text-xs bg-white" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                                <input type="text" name="description" defaultValue={category.description ?? ''} className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
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
