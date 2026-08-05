import { useState, useEffect, useMemo } from 'react';
import { Lock, Loader2, Users, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { usersApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import ConfirmDialog from '../../components/ConfirmDialog';
import MobileSheet from '../../components/mobile/MobileSheet';
import type { Role } from '../../types';

interface ManagedUser {
id: string; email: string; username: string; firstName?: string; lastName?: string;
role: Role; isActive: boolean; createdAt: string;
}

const ROLES: { value: Role; label: string; badge: string }[] = [
{ value: 'ADMIN', label: 'Administrateur', badge: 'bg-red-100 text-red-700' },
{ value: 'MANAGER', label: 'Gérant', badge: 'bg-purple-100 text-purple-700' },
{ value: 'CASHIER', label: 'Caissier', badge: 'bg-blue-100 text-blue-700' },
{ value: 'KITCHEN', label: 'Cuisine', badge: 'bg-green-100 text-green-700' },
{ value: 'WAITER', label: 'Serveur', badge: 'bg-yellow-100 text-yellow-700' },
];
const roleBadge = (r: Role) => ROLES.find((x) => x.value === r)?.badge || 'bg-gray-100 text-gray-600';
const roleLabel = (r: Role) => ROLES.find((x) => x.value === r)?.label || r;

function UserFormSheet({ user, onClose, onSuccess }: { user: ManagedUser | null; onClose: () => void; onSuccess: () => void }) {
const [firstName, setFirstName] = useState(user?.firstName || '');
const [lastName, setLastName] = useState(user?.lastName || '');
const [email, setEmail] = useState(user?.email || '');
const [username, setUsername] = useState(user?.username || '');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [role, setRole] = useState<Role>(user?.role || 'CASHIER');
const [isActive, setIsActive] = useState(user?.isActive ?? true);
const [isSaving, setIsSaving] = useState(false);

const handleSubmit = async () => {
if (!user && !password) {
toast.warning('Le mot de passe est obligatoire pour un nouvel utilisateur');
return;
}
if (password && password !== confirmPassword) {
toast.warning('Les mots de passe ne correspondent pas');
return;
}
if (!email || !username) {
toast.warning('Veuillez remplir tous les champs obligatoires');
return;
}
try {
setIsSaving(true);
if (user) {
await usersApi.update(user.id, { email, username, firstName, lastName, role, isActive, ...(password ? { password } : {}) });
toast.success('Utilisateur modifié avec succès');
} else {
await usersApi.create({ email, username, password, firstName, lastName, role });
toast.success('Utilisateur créé avec succès');
}
onSuccess();
} catch (error: any) {
toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
} finally {
setIsSaving(false);
}
};

return (
<MobileSheet onClose={onClose}>
<div className="px-4 pb-6">
<h2 className="text-base font-bold text-gray-900 py-2">{user ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}</h2>
<div className="space-y-3">
<div className="grid grid-cols-2 gap-3">
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Prénom</div>
<input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jean" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Nom</div>
<input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dupont" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Email *</div>
<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jean.dupont@example.com" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Nom d'utilisateur *</div>
<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jdupont" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">{user ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe *'}</div>
<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
{(password || !user) && (
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Confirmer le mot de passe</div>
<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
)}
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Rôle *</div>
<select value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
{ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
</select>
</div>
{user && (
<label className="flex items-center gap-2 text-sm text-gray-600">
<input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
Actif
</label>
)}
</div>
<button onClick={handleSubmit} disabled={isSaving} className="w-full mt-5 bg-primary-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50">
{isSaving ? 'Enregistrement...' : user ? 'Modifier' : 'Créer'}
</button>
</div>
</MobileSheet>
);
}

export default function MobileUsersManagementPage() {
const [users, setUsers] = useState<ManagedUser[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [search, setSearch] = useState('');
const [filterRole, setFilterRole] = useState('');
const [editTarget, setEditTarget] = useState<ManagedUser | null>(null);
const [showCreate, setShowCreate] = useState(false);
const [confirmDeactivate, setConfirmDeactivate] = useState<ManagedUser | null>(null);

const currentUser = useAuthStore((state) => state.user);
const isAdminOrManager = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

useEffect(() => {
if (!isAdminOrManager) return;
loadUsers();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isAdminOrManager]);

const loadUsers = async () => {
try {
setIsLoading(true);
const response = await usersApi.getAll({ includeInactive: true });
if (response.success && response.data) setUsers(response.data);
} catch (error) {
console.error(error);
toast.error('Erreur lors du chargement des utilisateurs');
} finally {
setIsLoading(false);
}
};

const confirmDeactivateUser = async () => {
if (!confirmDeactivate || !currentUser) return;
try {
await usersApi.delete(confirmDeactivate.id, currentUser.id);
toast.success('Utilisateur désactivé avec succès');
setConfirmDeactivate(null);
loadUsers();
} catch (error: any) {
toast.error(error.response?.data?.error || 'Erreur lors de la désactivation');
}
};

const filtered = useMemo(() => {
const q = search.trim().toLowerCase();
return users
.filter((u) => !filterRole || u.role === filterRole)
.filter((u) => !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.firstName?.toLowerCase().includes(q) || u.lastName?.toLowerCase().includes(q));
}, [users, search, filterRole]);

if (!isAdminOrManager) {
return (
<div className="h-full flex items-center justify-center">
<div className="text-center px-6">
<Lock size={44} className="text-gray-300 mx-auto mb-3" />
<h2 className="text-base font-bold text-gray-900 mb-1">Accès restreint</h2>
<p className="text-sm text-gray-500">Réservé aux administrateurs et gérants</p>
</div>
</div>
);
}

return (
<div className="h-full flex flex-col">
<div className="px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0 space-y-2">
<div className="flex items-center justify-between">
<div className="relative flex-1 mr-2">
<Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
<input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none" />
</div>
<button onClick={() => setShowCreate(true)} className="flex items-center gap-1 text-xs font-semibold text-primary-600 flex-shrink-0">
<Plus size={14} />
Nouveau
</button>
</div>
<select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs outline-none">
<option value="">Tous les rôles</option>
{ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
</select>
</div>

<div className="flex-1 overflow-y-auto p-3 space-y-2.5">
{isLoading ? (
<div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
) : filtered.length === 0 ? (
<div className="text-center py-12 text-gray-400"><Users size={44} strokeWidth={1.2} className="mx-auto mb-3 text-gray-300" /><p className="text-sm font-medium">Aucun utilisateur trouvé</p></div>
) : (
filtered.map((u) => (
<div key={u.id} className={`bg-white rounded-xl border shadow-sm p-3.5 ${!u.isActive ? 'border-red-200 bg-red-50/40' : 'border-gray-100'}`}>
<div className="flex items-center gap-2.5 mb-2">
<div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
{u.username.charAt(0).toUpperCase()}
</div>
<div className="min-w-0 flex-1">
<div className="text-sm font-bold text-gray-900 truncate">{u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.username}</div>
<div className="text-[11px] text-gray-400 truncate">{u.email}</div>
</div>
<span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${roleBadge(u.role)}`}>{roleLabel(u.role)}</span>
</div>
<div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
<span>{u.isActive ? <span className="text-green-600 font-medium">Actif</span> : <span className="text-red-600 font-medium">Inactif</span>}</span>
<span>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</span>
</div>
<div className="flex items-center gap-2">
<button onClick={() => setEditTarget(u)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 flex items-center justify-center gap-1">
<Pencil size={12} />
Modifier
</button>
{u.isActive && (
<button onClick={() => setConfirmDeactivate(u)} className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-red-50 text-red-600"><Trash2 size={12} /></button>
)}
</div>
</div>
))
)}
</div>

{(editTarget || showCreate) && (
<UserFormSheet
user={editTarget}
onClose={() => { setEditTarget(null); setShowCreate(false); }}
onSuccess={() => { setEditTarget(null); setShowCreate(false); loadUsers(); }}
/>
)}

{confirmDeactivate && (
<ConfirmDialog
title="Désactiver l'utilisateur"
message={`Désactiver "${confirmDeactivate.username}" ? Il ne pourra plus se connecter.`}
confirmLabel="Désactiver"
variant="danger"
onConfirm={confirmDeactivateUser}
onCancel={() => setConfirmDeactivate(null)}
/>
)}
</div>
);
}
