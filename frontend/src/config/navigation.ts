import {
ShoppingCart, ClipboardList, BarChart2, Package, Lock,
Users, Tag, Layers, Settings, UserCog,
} from 'lucide-react';

// Source unique de vérité pour les règles de visibilité par rôle, partagée
// entre Layout.tsx (desktop) et MobileShell/MobileMorePage (mobile) — évite
// que les deux mises en page divergent sur qui voit quoi.

export type LucideIcon = typeof ShoppingCart;

export interface MenuItem {
path: string;
label: string;
Icon: LucideIcon;
roles: string[];
}

// Navigation principale : POS/Commandes toujours visibles, le reste filtré
// par rôle (identique aux règles historiques de Layout.tsx).
export const MENU_ITEMS: MenuItem[] = [
{ path: '/pos',       label: 'Point de Vente', Icon: ShoppingCart,  roles: ['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN', 'WAITER'] },
{ path: '/orders',    label: 'Commandes',      Icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN', 'WAITER'] },
{ path: '/dashboard', label: 'Statistiques',   Icon: BarChart2,     roles: ['MANAGER', 'CASHIER'] },
{ path: '/stock',     label: 'Stocks',         Icon: Package,       roles: ['MANAGER'] },
{ path: '/closures',  label: 'Clôtures',       Icon: Lock,          roles: ['MANAGER', 'CASHIER'] },
{ path: '/team',      label: 'Équipe',         Icon: Users,         roles: ['MANAGER'] },
];

// Navigation "Administration/Gestion" : produits, catégories, paramètres, utilisateurs.
export const MANAGEMENT_MENU_ITEMS: MenuItem[] = [
{ path: '/products-management',   label: 'Produits',        Icon: Tag,      roles: ['MANAGER'] },
{ path: '/categories-management', label: 'Catégories',      Icon: Layers,   roles: ['MANAGER'] },
{ path: '/app-settings',          label: 'Paramètres App',  Icon: Settings, roles: ['ADMIN'] },
{ path: '/users-management',      label: 'Utilisateurs',    Icon: UserCog,  roles: ['ADMIN'] },
];

export const ROLE_LABELS: Record<string, string> = {
ADMIN: 'Administrateur',
MANAGER: 'Gérant',
CASHIER: 'Caissier',
KITCHEN: 'Cuisine',
WAITER: 'Serveur',
};

export function menuItemsForRole(role: string): MenuItem[] {
return MENU_ITEMS.filter((item) => item.roles.includes(role));
}

export function managementMenuItemsForRole(role: string): MenuItem[] {
return MANAGEMENT_MENU_ITEMS.filter((item) => item.roles.includes(role));
}

// La barre d'onglets mobile n'a que 4 emplacements (contrainte de la
// maquette) : POS/Commandes/Stats/Clôtures y vont directement, Stock et
// Équipe (pourtant dans MENU_ITEMS comme sur desktop) rejoignent le menu
// "Plus" avec les pages de gestion. Les règles de rôle restent celles de
// menuItemsForRole/managementMenuItemsForRole — seul le placement diffère.
export const MOBILE_TAB_PATHS = ['/pos', '/orders', '/dashboard', '/closures'];

export function mobileTabItemsForRole(role: string): MenuItem[] {
return menuItemsForRole(role).filter((item) => MOBILE_TAB_PATHS.includes(item.path));
}

export function mobileMoreItemsForRole(role: string): MenuItem[] {
return [
...menuItemsForRole(role).filter((item) => !MOBILE_TAB_PATHS.includes(item.path)),
...managementMenuItemsForRole(role),
];
}

export function titleForPath(path: string): string {
const item = [...MENU_ITEMS, ...MANAGEMENT_MENU_ITEMS].find((i) => i.path === path);
return item?.label || 'Gestion Fast-Food';
}
