import { useState } from 'react';
import { ShieldCheck, User, Lock, Eye, EyeOff, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { platformAuthApi } from '../services/platformApi';
import { usePlatformAdminStore } from '../store/platformAdminStore';

export default function PlatformAdminLoginPage() {
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState('');
const [isLoading, setIsLoading] = useState(false);

const login = usePlatformAdminStore((state) => state.login);

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setError('');

if (!username || !password) {
setError('Veuillez remplir tous les champs');
return;
}

try {
setIsLoading(true);
const response = await platformAuthApi.login(username, password);
if (response.success && response.data) {
login(response.data.admin, response.data.token);
} else {
setError(response.error || 'Identifiants incorrects');
}
} catch (err: unknown) {
const e = err as { response?: { data?: { error?: string } } };
setError(e.response?.data?.error || 'Erreur de connexion au serveur');
} finally {
setIsLoading(false);
}
};

return (
<div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
>
<div className="relative w-full max-w-sm">
<div className="h-1 rounded-t-2xl bg-slate-600" />
<div className="bg-white/95 backdrop-blur-sm rounded-b-2xl shadow-2xl px-8 pt-8 pb-8">
<div className="text-center mb-8">
<div className="flex justify-center mb-4">
<div className="w-16 h-16 rounded-full border-4 border-gray-100 flex items-center justify-center shadow-lg bg-slate-800 text-white">
<ShieldCheck size={28} />
</div>
</div>
<h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Administration plateforme</h1>
<p className="text-xs text-gray-400 mt-1.5">Accès réservé aux superadmins</p>
</div>

<form onSubmit={handleSubmit} className="space-y-4">
<div>
<label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
Identifiant
</label>
<div className="relative">
<User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
<input
type="text"
value={username}
onChange={(e) => setUsername(e.target.value)}
disabled={isLoading}
autoComplete="username"
autoFocus
className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent focus:bg-white disabled:opacity-50 transition-all text-sm outline-none"
/>
</div>
</div>

<div>
<label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
Mot de passe
</label>
<div className="relative">
<Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
<input
type={showPassword ? 'text' : 'password'}
value={password}
onChange={(e) => setPassword(e.target.value)}
disabled={isLoading}
autoComplete="current-password"
className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent focus:bg-white disabled:opacity-50 transition-all text-sm outline-none"
/>
<button
type="button"
onClick={() => setShowPassword(!showPassword)}
className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
tabIndex={-1}
>
{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
</button>
</div>
</div>

{error && (
<div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl p-3">
<AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
<p className="text-xs text-red-700 leading-relaxed">{error}</p>
</div>
)}

<button
type="submit"
disabled={isLoading}
className="w-full bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2 hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 shadow-lg"
>
{isLoading ? (
<>
<Loader2 size={18} className="animate-spin" />
<span>Connexion...</span>
</>
) : (
<>
<span>Se connecter</span>
<ArrowRight size={18} />
</>
)}
</button>
</form>
</div>
</div>
</div>
);
}
