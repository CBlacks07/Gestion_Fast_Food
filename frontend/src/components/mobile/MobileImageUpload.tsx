import { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import api, { API_BASE_URL } from '../../services/api';
import { toast } from '../../store/toastStore';

interface MobileImageUploadProps {
label: string;
imageUrl?: string | null;
onChange: (url: string) => void;
onClear?: () => void;
endpoint?: string; // '/api/upload/image' (défaut) ou '/api/upload/logo'
hint?: string;
}

// Dépôt d'image mutualisé (produits, catégories, logo des paramètres) —
// évite de dupliquer la logique d'upload trois fois comme sur desktop.
export default function MobileImageUpload({
label,
imageUrl,
onChange,
onClear,
endpoint = '/api/upload/image',
hint = 'JPG, PNG, GIF, WEBP · Max 5MB',
}: MobileImageUploadProps) {
const fileInputRef = useRef<HTMLInputElement>(null);
const [isUploading, setIsUploading] = useState(false);

const resolvedUrl = imageUrl
? (imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`)
: null;

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
const file = e.target.files?.[0];
if (!file) return;
try {
setIsUploading(true);
const formData = new FormData();
formData.append('file', file);
const response = await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
if (response.data.success && response.data.data) {
onChange(response.data.data.url);
} else {
toast.error("Erreur lors de l'upload de l'image");
}
} catch (error: any) {
toast.error(error.response?.data?.error || "Erreur lors de l'upload de l'image");
} finally {
setIsUploading(false);
if (fileInputRef.current) fileInputRef.current.value = '';
}
};

return (
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">{label}</div>
<input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
{resolvedUrl ? (
<div className="relative inline-block">
<img src={resolvedUrl} alt="" className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
{onClear && (
<button
onClick={onClear}
className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
>
<X size={13} />
</button>
)}
</div>
) : (
<button
type="button"
onClick={() => fileInputRef.current?.click()}
disabled={isUploading}
className="w-full border-2 border-dashed border-gray-200 rounded-lg py-6 flex flex-col items-center gap-1.5 text-gray-400 disabled:opacity-50"
>
{isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
<span className="text-xs font-medium">{isUploading ? 'Upload en cours...' : 'Choisir une image'}</span>
</button>
)}
<p className="text-[11px] text-gray-400 mt-1">{hint}</p>
</div>
);
}
