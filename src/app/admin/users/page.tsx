import { PrismaClient } from '@prisma/client';
import { toggleUserStatus } from './actions';

const prisma = new PrismaClient();

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: {
      _count: { select: { observations: true } },
      roles: { include: { role: true } }
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800">Gestion des Utilisateurs</h2>
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Rôles</th>
                <th className="px-6 py-4">Signalements</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">
                        Inscrit le {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {user.phone}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? user.roles.map(r => (
                          <span key={r.roleId} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-bold">
                            {r.role.name}
                          </span>
                        )) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-bold">Citoyen</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-bold">
                      {user._count.observations} contributions
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status === 'active' ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={toggleUserStatus} className="inline-flex">
                        <input type="hidden" name="id" value={user.id} />
                        <input type="hidden" name="currentStatus" value={user.status} />
                        <button type="submit" className={`text-xs px-3 py-1.5 font-bold rounded-lg transition-colors ${
                          user.status === 'active' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}>
                          {user.status === 'active' ? 'Suspendre' : 'Réactiver'}
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
