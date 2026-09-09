import { PrismaClient } from '@prisma/client';
import { updateObservationStatus } from './actions';

const prisma = new PrismaClient();

export default async function ObservationsPage() {
  const observations = await prisma.priceObservation.findMany({
    include: {
      product: true,
      store: true,
      user: true,
    },
    orderBy: {
      observedAt: 'desc',
    },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800">Signalements récents</h2>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Boutique / Lieu</th>
                <th className="px-6 py-4">Prix Observé</th>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {observations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucun signalement trouvé.
                  </td>
                </tr>
              ) : (
                observations.map((obs) => (
                  <tr key={obs.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {new Date(obs.observedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{obs.product.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{obs.store.name}</div>
                      <div className="text-xs text-gray-500">{obs.city || obs.neighborhood}</div>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900">
                      {obs.price.toString()} FCFA
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{obs.user.name}</div>
                      <div className="text-xs text-gray-500">{obs.user.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        obs.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        obs.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        obs.status === 'under_review' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {obs.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={updateObservationStatus} className="inline-flex gap-2">
                        <input type="hidden" name="id" value={obs.id} />
                        
                        {obs.status !== 'confirmed' && (
                          <button type="submit" name="status" value="confirmed" className="text-xs px-3 py-1.5 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors">
                            Valider
                          </button>
                        )}
                        
                        {obs.status !== 'rejected' && (
                          <button type="submit" name="status" value="rejected" className="text-xs px-3 py-1.5 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 transition-colors">
                            Rejeter
                          </button>
                        )}
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
