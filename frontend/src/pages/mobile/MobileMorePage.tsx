import { useNavigate } from 'react-router-dom';
import { mobileMoreItemsForRole } from '../../config/navigation';
import { useAuthStore } from '../../store/authStore';

export default function MobileMorePage() {
const navigate = useNavigate();
const user = useAuthStore((state) => state.user);
const items = user ? mobileMoreItemsForRole(user.role) : [];

return (
<div className="h-full overflow-y-auto p-4">
<div className="grid grid-cols-2 gap-3">
{items.map(({ path, label, Icon }) => (
<button
key={path}
onClick={() => navigate(path)}
className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-2.5"
>
<div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'rgba(var(--color-primary-rgb), 0.1)' }}>
<Icon size={20} style={{ color: 'var(--color-primary)' }} />
</div>
<span className="text-sm font-semibold text-gray-800">{label}</span>
</button>
))}
</div>
{items.length === 0 && (
<div className="text-center py-16 text-gray-400 text-sm">Aucune page supplémentaire</div>
)}
</div>
);
}
