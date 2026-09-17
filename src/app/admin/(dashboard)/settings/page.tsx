import React from 'react';

export default function SettingsPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Paramètres de l'application</h2>
      <p className="text-gray-600 mb-8">
        Gérez ici les paramètres généraux de votre plateforme JustePrix.
      </p>
      
      <div className="space-y-6">
        <div className="pb-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Profil Administrateur</h3>
          <p className="text-sm text-gray-500 mb-4">Mettez à jour vos informations de contact.</p>
          <button className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
            Modifier le profil
          </button>
        </div>
        
        <div className="pb-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Notifications</h3>
          <p className="text-sm text-gray-500 mb-4">Gérer les alertes et les signalements.</p>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
            <span className="text-gray-700">Recevoir un email pour les nouveaux signalements</span>
          </label>
        </div>
      </div>
    </div>
  );
}
