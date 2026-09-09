'use client';

import { useState, useEffect } from 'react';
import { MapPin, Save, Trash2, CheckCircle, AlertCircle, Navigation } from 'lucide-react';

interface GatheringPoint {
  id: string;
  label: string;
  description?: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  updatedAt: string;
}

export default function GatheringsAdminPage() {
  const [current, setCurrent] = useState<GatheringPoint | null>(null);
  const [label, setLabel] = useState('Lieu du Rassemblement');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCurrent = async () => {
    try {
      const res = await fetch('/api/gatherings');
      const json = await res.json();
      if (json.data) {
        setCurrent(json.data);
        setLabel(json.data.label);
        setDescription(json.data.description || '');
        setLatitude(String(json.data.latitude));
        setLongitude(String(json.data.longitude));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCurrent(); }, []);

  const getToken = () => {
    // Récupère le token JWT depuis le localStorage (selon le système d'auth existant)
    return localStorage.getItem('token') || '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latitude || !longitude) {
      showToast('error', 'Latitude et longitude sont requis.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/gatherings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          label,
          description,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Point de rassemblement enregistré avec succès !');
        fetchCurrent();
      } else {
        showToast('error', json.error || 'Erreur lors de la sauvegarde.');
      }
    } catch {
      showToast('error', 'Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Désactiver le point de rassemblement actuel ?')) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/gatherings', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Point désactivé.');
        setCurrent(null);
        setLatitude('');
        setLongitude('');
        setLabel('Lieu du Rassemblement');
        setDescription('');
      } else {
        showToast('error', json.error || 'Erreur.');
      }
    } catch {
      showToast('error', 'Erreur réseau.');
    } finally {
      setDeleting(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      showToast('error', 'Géolocalisation non supportée par votre navigateur.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude.toFixed(7)));
        setLongitude(String(pos.coords.longitude.toFixed(7)));
        showToast('success', 'Position actuelle récupérée !');
      },
      () => showToast('error', 'Impossible de récupérer la position.')
    );
  };

  const openPreview = () => {
    if (!latitude || !longitude) return;
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-bold transition-all ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
            <MapPin size={22} />
          </div>
          Point de Rassemblement
        </h2>
        <p className="text-gray-500 text-sm mt-1 ml-[52px]">
          Définissez ici le lieu de rassemblement que les citoyens verront directement sur leur carte.
        </p>
      </div>

      {/* Current Active Point */}
      {!loading && current && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
            <CheckCircle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-green-800 text-sm">Point actif actuellement</p>
            <p className="font-bold text-green-700 mt-0.5">{current.label}</p>
            {current.description && (
              <p className="text-green-600 text-xs mt-1">{current.description}</p>
            )}
            <p className="text-green-600 text-xs mt-1 font-mono">
              {Number(current.latitude).toFixed(6)}, {Number(current.longitude).toFixed(6)}
            </p>
            <p className="text-green-500 text-xs mt-1">
              Mis à jour le {new Date(current.updatedAt).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={handleDeactivate}
            disabled={deleting}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 text-xs font-bold transition-colors border border-red-200 shrink-0"
          >
            <Trash2 size={14} />
            {deleting ? 'Désactivation...' : 'Désactiver'}
          </button>
        </div>
      )}

      {!loading && !current && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
          <AlertCircle size={20} className="text-amber-500 shrink-0" />
          <p className="text-amber-700 text-sm font-bold">
            Aucun point de rassemblement actif. Définissez-en un ci-dessous.
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h3 className="font-black text-gray-800 text-base">
          {current ? 'Modifier le point de rassemblement' : 'Définir un nouveau point'}
        </h3>

        {/* Label */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            Nom du lieu <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: Place de l'Obélisque, Dakar"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            Description (optionnel)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Face à la mairie, entrée principale"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
          />
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Latitude <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.0000001"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="14.6928"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Longitude <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.0000001"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="-17.4467"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              required
            />
          </div>
        </div>

        {/* Helper buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={useMyLocation}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 text-sm font-bold transition-colors"
          >
            <Navigation size={15} />
            Ma position actuelle
          </button>
          {latitude && longitude && (
            <button
              type="button"
              onClick={openPreview}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-600 bg-gray-50 hover:bg-gray-100 text-sm font-bold transition-colors"
            >
              <MapPin size={15} />
              Vérifier sur Google Maps
            </button>
          )}
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-400 bg-gray-50 px-4 py-3 rounded-xl">
          💡 <strong>Astuce :</strong> Sur Google Maps, faites un clic droit sur un lieu → les coordonnées apparaissent. Copiez-les ici.
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[#00a859] hover:bg-[#007f43] disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-colors text-sm"
        >
          <Save size={16} />
          {saving ? 'Enregistrement...' : (current ? 'Mettre à jour le point' : 'Définir le point de rassemblement')}
        </button>
      </form>
    </div>
  );
}
