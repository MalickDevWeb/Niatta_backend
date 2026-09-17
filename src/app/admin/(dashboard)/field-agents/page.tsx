'use client';
import React, { useEffect, useState, useRef } from 'react';

export default function FieldAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [agentForm, setAgentForm] = useState({ nom: '', prenom: '', phone: '', password: '', photoUrl: '' });
  const [createdAgent, setCreatedAgent] = useState<{ user: any, password: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/admin/field-agents');
      const data = await res.json();
      if (data.success) {
        setAgents(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAgentForm({ ...agentForm, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Edit mode
        const res = await fetch('/api/admin/field-agents', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...agentForm })
        });
        const data = await res.json();
        if (data.success) {
          fetchAgents();
          setShowModal(false);
        } else {
          alert(data.error);
        }
      } else {
        // Create mode
        const res = await fetch('/api/admin/field-agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(agentForm)
        });
        const data = await res.json();
        if (data.success) {
          setCreatedAgent(data.data);
          fetchAgents();
        } else {
          alert(data.error);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setCreatedAgent(null);
    setAgentForm({ nom: '', prenom: '', phone: '', password: '', photoUrl: '' });
    setShowModal(true);
  };

  const openEdit = (agent: any) => {
    const parts = agent.name.split(' ');
    const prenom = parts.length > 1 ? parts[0] : '';
    const nom = parts.length > 1 ? parts.slice(1).join(' ') : agent.name;
    
    setEditingId(agent.id);
    setCreatedAgent(null);
    setAgentForm({ 
      prenom, 
      nom, 
      phone: agent.phone || '', 
      password: '', // Empty password means don't change
      photoUrl: agent.photoUrl || '' 
    });
    setShowModal(true);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/admin/field-agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) fetchAgents();
    } catch (err) {
      console.error(err);
    }
  };

  const shareWhatsApp = () => {
    if (!createdAgent) return;
    const text = `Bonjour ${createdAgent.user.name}, voici vos accès pour l'application Homme Terrain JustePrix :\nURL : https://justeprix.sn/homme-terrain\nTéléphone : ${createdAgent.user.phone}\nMot de passe : ${createdAgent.password}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Agents Terrain</h2>
          <p className="text-gray-600">Gérez les contrôleurs sur le terrain</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
          + Nouvel Agent
        </button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 font-semibold text-gray-700 w-16">Photo</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Nom</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Téléphone</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Statut</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {agent.photoUrl ? (
                       <img src={agent.photoUrl} alt={agent.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                    ) : (
                       <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                         {agent.name.charAt(0)}
                       </div>
                    )}
                  </td>
                  <td className="py-3 px-4">{agent.name}</td>
                  <td className="py-3 px-4">{agent.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${agent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(agent)} className="text-sm font-medium text-blue-600 hover:underline">
                        Modifier
                      </button>
                      <button onClick={() => toggleStatus(agent.id, agent.status)} className="text-sm font-medium text-primary hover:underline">
                        {agent.status === 'active' ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">Aucun agent terrain trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Modifier un Agent' : 'Créer un Agent Terrain'}</h3>
            
            {createdAgent ? (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                <p className="text-green-800 font-medium mb-2">Agent créé avec succès !</p>
                <div className="text-2xl font-bold tracking-widest text-gray-800 my-4">{createdAgent.password}</div>
                <p className="text-sm text-gray-600 mb-4">Transmettez ce mot de passe à l'agent.</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={shareWhatsApp} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Partager via WhatsApp</button>
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Fermer</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6 flex flex-col items-center">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {agentForm.photoUrl ? (
                      <img src={agentForm.photoUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-sm" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                        </svg>
                        <span className="text-[10px] mt-1 font-medium">Ajouter</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold">Modifier</span>
                    </div>
                  </div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>

                <div className="mb-4 flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input type="text" required value={agentForm.prenom || ''} onChange={(e) => setAgentForm({...agentForm, prenom: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Ex: Jean" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input type="text" required value={agentForm.nom || ''} onChange={(e) => setAgentForm({...agentForm, nom: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Ex: Dupont" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de Téléphone (Sénégalais)</label>
                  <input type="text" required value={agentForm.phone} onChange={(e) => setAgentForm({...agentForm, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Ex: 77 123 45 67" />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe {editingId && <span className="text-xs text-gray-400 font-normal">(Laissez vide pour conserver l'actuel)</span>}</label>
                  <input type="text" required={!editingId} value={agentForm.password || ''} onChange={(e) => setAgentForm({...agentForm, password: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Entrez un mot de passe" />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">{editingId ? 'Enregistrer' : 'Créer'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
