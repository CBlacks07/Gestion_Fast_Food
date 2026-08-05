import { useEffect, useState } from 'react';
import {
ShieldCheck,
LogOut,
Plus,
Users,
Trash2,
Power,
KeyRound,
X,
Loader2,
Copy,
Check,
} from 'lucide-react';
import {
platformRestaurantsApi,
platformUsersApi,
type Restaurant,
type PlatformUser,
} from '../services/platformApi';
import { usePlatformAdminStore } from '../store/platformAdminStore';
import { toast } from '../store/toastStore';
import ConfirmDialog from '../components/ConfirmDialog';

// Modal générique pour afficher un mot de passe généré une seule fois
// (création de restaurant, réinitialisation de mot de passe).
function CredentialsModal({
title,
lines,
onClose,
}: {
title: string;
lines: Array<{ label: string; value: string }>;
onClose: () => void;
}) {
const [copied, setCopied] = useState<string | null>(null);

const copy = (value: string) => {
navigator.clipboard.writeText(value);
setCopied(value);
setTimeout(() => setCopied(null), 1500);
};

return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
<div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
<h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
<p className="text-xs text-amber-600 mb-4">
Ces identifiants ne seront plus affichés — note-les avant de fermer.
</p>
<div className="space-y-2 mb-5">
{lines.map((line) => (
<div key={line.label} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
<div className="min-w-0">
<div className="text-[10px] uppercase font-semibold text-gray-400">{line.label}</div>
<div className="text-sm font-mono text-gray-800 truncate">{line.value}</div>
</div>
<button
onClick={() => copy(line.value)}
className="ml-2 text-gray-400 hover:text-gray-700 flex-shrink-0"
title="Copier"
>
{copied === line.value ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
</button>
</div>
))}
</div>
<button
onClick={onClose}
className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 rounded-lg transition-colors"
>
Fermer
</button>
</div>
</div>
);
}

function CreateRestaurantModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
const [code, setCode] = useState('');
const [name, setName] = useState('');
const [adminUsername, setAdminUsername] = useState('');
const [adminEmail, setAdminEmail] = useState('');
const [withDefaultCategories, setWithDefaultCategories] = useState(true);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');
const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setError('');
if (!code || !name || !adminUsername || !adminEmail) {
setError('Tous les champs sont requis');
return;
}
try {
setIsLoading(true);
const response = await platformRestaurantsApi.create({
code,
name,
adminUsername,
adminEmail,
withDefaultCategories,
});
if (response.success) {
setCredentials({ username: adminUsername, password: response.data.adminPassword });
onCreated();
} else {
setError(response.error || 'Erreur lors de la création');
}
} catch (err: unknown) {
const e = err as { response?: { data?: { error?: string } } };
setError(e.response?.data?.error || 'Erreur lors de la création');
} finally {
setIsLoading(false);
}
};

if (credentials) {
return (
<CredentialsModal
title={`Restaurant "${name}" créé`}
lines={[
{ label: 'Code établissement', value: code.toUpperCase() },
{ label: "Nom d'utilisateur admin", value: credentials.username },
{ label: 'Mot de passe', value: credentials.password },
]}
onClose={onClose}
/>
);
}

return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
<div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
<div className="flex items-center justify-between mb-5">
<h3 className="text-lg font-semibold text-gray-900">Nouveau restaurant</h3>
<button onClick={onClose} className="text-gray-400 hover:text-gray-600">
<X size={20} />
</button>
</div>
<form onSubmit={handleSubmit} className="space-y-3">
<div>
<label className="block text-xs font-semibold text-gray-500 mb-1">Code établissement</label>
<input
type="text"
value={code}
onChange={(e) => setCode(e.target.value.toUpperCase())}
placeholder="CHEZFATOU"
className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-400 uppercase"
/>
</div>
<div>
<label className="block text-xs font-semibold text-gray-500 mb-1">Nom du restaurant</label>
<input
type="text"
value={name}
onChange={(e) => setName(e.target.value)}
placeholder="Chez Fatou"
className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-400"
/>
</div>
<div>
<label className="block text-xs font-semibold text-gray-500 mb-1">Nom d'utilisateur admin</label>
<input
type="text"
value={adminUsername}
onChange={(e) => setAdminUsername(e.target.value)}
placeholder="fatou"
className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-400"
/>
</div>
<div>
<label className="block text-xs font-semibold text-gray-500 mb-1">Email admin</label>
<input
type="email"
value={adminEmail}
onChange={(e) => setAdminEmail(e.target.value)}
placeholder="fatou@exemple.com"
className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-400"
/>
</div>
<label className="flex items-center gap-2 text-sm text-gray-600">
<input
type="checkbox"
checked={withDefaultCategories}
onChange={(e) => setWithDefaultCategories(e.target.checked)}
/>
Créer les catégories fast-food de départ
</label>

{error && <p className="text-xs text-red-600">{error}</p>}

<button
type="submit"
disabled={isLoading}
className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
>
{isLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
Créer
</button>
</form>
</div>
</div>
);
}

function UsersModal({ restaurant, onClose }: { restaurant: Restaurant; onClose: () => void }) {
const [users, setUsers] = useState<PlatformUser[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [resetCredentials, setResetCredentials] = useState<{ username: string; password: string } | null>(null);

const load = async () => {
setIsLoading(true);
try {
const response = await platformRestaurantsApi.getUsers(restaurant.id);
if (response.success) setUsers(response.data);
} finally {
setIsLoading(false);
}
};

useEffect(() => {
load();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [restaurant.id]);

const handleReset = async (user: PlatformUser) => {
try {
const response = await platformUsersApi.resetPassword(user.id);
if (response.success) {
setResetCredentials({ username: response.data.username, password: response.data.newPassword });
} else {
toast.error('Erreur lors de la réinitialisation');
}
} catch {
toast.error('Erreur lors de la réinitialisation');
}
};

if (resetCredentials) {
return (
<CredentialsModal
title="Mot de passe réinitialisé"
lines={[
{ label: "Nom d'utilisateur", value: resetCredentials.username },
{ label: 'Nouveau mot de passe', value: resetCredentials.password },
]}
onClose={() => setResetCredentials(null)}
/>
);
}

return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
<div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
<div className="flex items-center justify-between mb-5">
<h3 className="text-lg font-semibold text-gray-900">Utilisateurs — {restaurant.name}</h3>
<button onClick={onClose} className="text-gray-400 hover:text-gray-600">
<X size={20} />
</button>
</div>

{isLoading ? (
<div className="flex justify-center py-8">
<Loader2 size={24} className="animate-spin text-gray-400" />
</div>
) : users.length === 0 ? (
<p className="text-sm text-gray-500 text-center py-8">Aucun utilisateur</p>
) : (
<div className="space-y-2">
{users.map((u) => (
<div key={u.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2.5">
<div className="min-w-0">
<div className="text-sm font-medium text-gray-800 truncate">
{u.firstName} {u.lastName} <span className="text-gray-400">({u.username})</span>
</div>
<div className="text-xs text-gray-400 truncate">{u.email} · {u.role}{!u.isActive && ' · désactivé'}</div>
</div>
<button
onClick={() => handleReset(u)}
className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-gray-200 hover:border-gray-300 rounded-lg px-2.5 py-1.5 flex-shrink-0 ml-2"
title="Réinitialiser le mot de passe"
>
<KeyRound size={13} />
Réinitialiser
</button>
</div>
))}
</div>
)}
</div>
</div>
);
}

export default function PlatformAdminDashboard() {
const { admin, logout } = usePlatformAdminStore();
const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [showCreate, setShowCreate] = useState(false);
const [usersModalFor, setUsersModalFor] = useState<Restaurant | null>(null);
const [deleteTarget, setDeleteTarget] = useState<Restaurant | null>(null);

const load = async () => {
setIsLoading(true);
try {
const response = await platformRestaurantsApi.getAll();
if (response.success) setRestaurants(response.data);
} catch {
toast.error('Erreur lors du chargement des restaurants');
} finally {
setIsLoading(false);
}
};

useEffect(() => {
load();
}, []);

const toggleActive = async (restaurant: Restaurant) => {
try {
await platformRestaurantsApi.setActive(restaurant.id, !restaurant.isActive);
toast.success(restaurant.isActive ? 'Restaurant suspendu' : 'Restaurant réactivé');
load();
} catch {
toast.error('Erreur lors de la mise à jour');
}
};

const confirmDelete = async () => {
if (!deleteTarget) return;
try {
await platformRestaurantsApi.remove(deleteTarget.id);
toast.success(`Restaurant "${deleteTarget.name}" supprimé`);
setDeleteTarget(null);
load();
} catch {
toast.error('Erreur lors de la suppression');
}
};

return (
<div className="min-h-screen bg-gray-50">
<header className="bg-slate-900 text-white">
<div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
<div className="flex items-center gap-2.5">
<ShieldCheck size={22} />
<div>
<div className="font-bold leading-tight">Administration plateforme</div>
<div className="text-xs text-slate-400 leading-tight">{admin?.username}</div>
</div>
</div>
<button
onClick={logout}
className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"
>
<LogOut size={16} />
Déconnexion
</button>
</div>
</header>

<main className="max-w-5xl mx-auto px-4 py-8">
<div className="flex items-center justify-between mb-5">
<h2 className="text-lg font-semibold text-gray-800">
Restaurants ({restaurants.length})
</h2>
<button
onClick={() => setShowCreate(true)}
className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
>
<Plus size={16} />
Nouveau restaurant
</button>
</div>

{isLoading ? (
<div className="flex justify-center py-16">
<Loader2 size={28} className="animate-spin text-gray-400" />
</div>
) : restaurants.length === 0 ? (
<div className="text-center py-16 text-gray-400 text-sm">Aucun restaurant pour l'instant</div>
) : (
<div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
<table className="w-full text-sm">
<thead className="bg-gray-50 text-left text-xs uppercase text-gray-400">
<tr>
<th className="px-4 py-3 font-semibold">Restaurant</th>
<th className="px-4 py-3 font-semibold">Code</th>
<th className="px-4 py-3 font-semibold">Utilisateurs</th>
<th className="px-4 py-3 font-semibold">Commandes</th>
<th className="px-4 py-3 font-semibold">Statut</th>
<th className="px-4 py-3 font-semibold text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-gray-100">
{restaurants.map((r) => (
<tr key={r.id}>
<td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
<td className="px-4 py-3 font-mono text-xs text-gray-500">{r.code}</td>
<td className="px-4 py-3 text-gray-600">{r._count.users}</td>
<td className="px-4 py-3 text-gray-600">{r._count.orders}</td>
<td className="px-4 py-3">
<span
className={`text-xs font-medium px-2 py-1 rounded-full ${
r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
}`}
>
{r.isActive ? 'Actif' : 'Suspendu'}
</span>
</td>
<td className="px-4 py-3">
<div className="flex items-center justify-end gap-1.5">
<button
onClick={() => setUsersModalFor(r)}
className="p-1.5 text-gray-400 hover:text-slate-700 hover:bg-gray-100 rounded-lg"
title="Voir les utilisateurs"
>
<Users size={16} />
</button>
<button
onClick={() => toggleActive(r)}
className={`p-1.5 rounded-lg hover:bg-gray-100 ${r.isActive ? 'text-gray-400 hover:text-amber-600' : 'text-gray-400 hover:text-green-600'}`}
title={r.isActive ? 'Suspendre' : 'Réactiver'}
>
<Power size={16} />
</button>
<button
onClick={() => setDeleteTarget(r)}
className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg"
title="Supprimer"
>
<Trash2 size={16} />
</button>
</div>
</td>
</tr>
))}
</tbody>
</table>
</div>
)}
</main>

{showCreate && (
<CreateRestaurantModal onClose={() => setShowCreate(false)} onCreated={load} />
)}
{usersModalFor && (
<UsersModal restaurant={usersModalFor} onClose={() => setUsersModalFor(null)} />
)}
{deleteTarget && (
<ConfirmDialog
title="Supprimer ce restaurant ?"
message={`Toutes les données de "${deleteTarget.name}" (utilisateurs, commandes, produits...) seront définitivement supprimées. Cette action est irréversible.`}
confirmLabel="Supprimer"
variant="danger"
onConfirm={confirmDelete}
onCancel={() => setDeleteTarget(null)}
/>
)}
</div>
);
}
