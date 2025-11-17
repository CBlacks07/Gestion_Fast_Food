# Fast Food Management System - Role & Permission Structure Analysis

## Executive Summary

The Fast Food Management application implements a **5-level role-based access control (RBAC)** system with role definitions at both the database and application level. The system uses soft deletes, activity logging, and role-based view filtering. **Critical limitation**: There is NO server-side authorization middleware - all role validation is client-side only.

---

## 1. ROLE DEFINITIONS

### Database Level (Prisma Schema)
**File**: `/home/user/Gestion_Fast_Food/backend/prisma/schema.prisma` (Lines 17-23)
```
enum Role {
  ADMIN
  MANAGER
  CASHIER
  KITCHEN
  WAITER
}
```

### TypeScript Types
**File**: `/home/user/Gestion_Fast_Food/frontend/src/types/index.ts` (Line 3)
```typescript
export type Role = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN' | 'WAITER';
```

### Database User Model
**File**: `/home/user/Gestion_Fast_Food/backend/prisma/schema.prisma` (Lines 25-44)
```
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  password  String
  firstName String?
  lastName  String?
  role      Role     @default(CASHIER)    # Default role is CASHIER
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations to orders, payments, daily closures, activity logs
}
```

### Default Seed Users
**File**: `/home/user/Gestion_Fast_Food/backend/src/seed.ts` (Lines 8-38)
- `admin@fastfood.com` / `admin123` → Role: **ADMIN**
- `cashier@fastfood.com` / `cashier123` → Role: **CASHIER**

---

## 2. ROLE-BASED ACCESS CONTROL IMPLEMENTATION

### 2.1 Frontend Route Protection

**File**: `/home/user/Gestion_Fast_Food/frontend/src/App.tsx`

Routes are NOT protected at the routing level. All authenticated users can navigate to all routes:
```typescript
<Routes>
  <Route path="/pos" element={<POSPage />} />
  <Route path="/orders" element={<OrdersPage />} />
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/stock" element={<StockPage />} />
  <Route path="/team" element={<TeamPage />} />              // Admin-only in UI
  <Route path="/products-management" element={<ProductsManagementPage />} />  // Admin-only
  <Route path="/categories-management" element={<CategoriesManagementPage />} /> // Admin-only
  <Route path="/users-management" element={<UsersManagementPage />} />  // Admin-only
  <Route path="/closures" element={<ClosuresPage />} />
</Routes>
```

### 2.2 Navigation Menu Filtering (Client-Side Only)

**File**: `/home/user/Gestion_Fast_Food/frontend/src/components/Layout.tsx` (Lines 15-30)

```typescript
const isAdmin = userRole === 'ADMIN';  // Line 15

const menuItems = [
  { path: '/pos', label: 'Point de Vente', icon: '🛒', adminOnly: false },
  { path: '/orders', label: 'Commandes', icon: '📋', adminOnly: false },
  { path: '/dashboard', label: 'Statistiques', icon: '📊', adminOnly: false },
  { path: '/stock', label: 'Stocks', icon: '📦', adminOnly: false },
  { path: '/closures', label: 'Clôtures', icon: '🔒', adminOnly: false },
  { path: '/team', label: 'Équipe', icon: '👥', adminOnly: true },  // Only shown if ADMIN
].filter((item) => !item.adminOnly || isAdmin);  // Line 24

const adminMenuItems = [
  { path: '/products-management', label: 'Produits', icon: '🍔' },
  { path: '/categories-management', label: 'Catégories', icon: '📂' },
  { path: '/users-management', label: 'Utilisateurs', icon: '👤' },
];

// Lines 69-98: Admin menu only rendered if isAdmin is true
{isAdmin && adminMenuItems.length > 0 && (
  <>
    {/* Admin section */}
  </>
)}
```

### 2.3 Page-Level Role Checks (Client-Side Protection)

#### Admin-Only Pages:
| Page | Role Check | File | Line |
|------|-----------|------|------|
| Users Management | `const isAdmin = user?.role === 'ADMIN';` | UsersManagementPage.tsx | 27 |
| Products Management | `const isAdmin = user?.role === 'ADMIN';` | ProductsManagementPage.tsx | 17 |
| Categories Management | `const isAdmin = user?.role === 'ADMIN';` | CategoriesManagementPage.tsx | TBD |
| Team/Stats | `const isAdmin = user?.role === 'ADMIN';` | TeamPage.tsx | 54 |
| Orders | `const isAdmin = user?.role === 'ADMIN';` | OrdersPage.tsx | TBD |

#### Admin or Manager Pages:
| Page | Role Check | File | Line |
|------|-----------|------|------|
| Stock Management | `const isAdmin = user?.role === 'ADMIN' \|\| user?.role === 'MANAGER';` | StockPage.tsx | 16 |
| Daily Closures | `const isAdmin = user?.role === 'ADMIN' \|\| user?.role === 'MANAGER';` | ClosuresPage.tsx | 38 |

### 2.4 Protection Implementation Pattern

**Example**: UsersManagementPage.tsx (Lines 27-100)
```typescript
const user = useAuthStore((state) => state.user);
const isAdmin = user?.role === 'ADMIN';

useEffect(() => {
  if (!isAdmin) return;  // Early return if not admin
  loadUsers();
}, [isAdmin]);

// ... later in render ...

if (!isAdmin) {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès restreint</h2>
        <p className="text-gray-500">Cette page est réservée aux administrateurs</p>
      </div>
    </div>
  );
}
```

---

## 3. BACKEND ROLE USAGE

### 3.1 No Server-Side Authorization Middleware

**CRITICAL SECURITY GAP**: The backend has NO middleware to enforce role-based access control.

**File**: `/home/user/Gestion_Fast_Food/backend/src/index.ts`

Routes are registered without any authorization hooks:
```typescript
app.register(authRoutes, { prefix: '/api/auth' });
app.register(usersRoutes, { prefix: '/api/users' });  // No authorization check
app.register(productsRoutes, { prefix: '/api/products' });  // No authorization check
app.register(categoriesRoutes, { prefix: '/api/categories' });  // No authorization check
// ... etc
```

### 3.2 User Management Routes (Limited Protection)

**File**: `/home/user/Gestion_Fast_Food/backend/src/routes/users.ts`

**GET /api/users** - Get all users (Lines 6-37)
- No role validation
- Publicly accessible

**POST /api/users** - Create user (Lines 40-97)
- No role validation
- Anyone can create users (SECURITY ISSUE)

**PUT /api/users/:id** - Update user (Lines 100-172)
- No role validation
- Anyone can update user roles (SECURITY ISSUE)

**DELETE /api/users/:id** - Deactivate user (Lines 175-242)
- **ONLY PROTECTION**: Prevents deletion of ADMIN users
- **Code** (Lines 202-207):
```typescript
// Empêcher la suppression d'un admin
if (targetUser.role === 'ADMIN') {
  return reply.status(403).send({
    success: false,
    error: 'Impossible de supprimer un administrateur',
  });
}
```
- Cannot delete self (Lines 194-199)

**GET /api/users/:id/stats** - User statistics (Lines 245-400)
- No role validation

**GET /api/users/stats/all** - All users statistics (Lines 403-490)
- No role validation

### 3.3 Authentication Routes

**File**: `/home/user/Gestion_Fast_Food/backend/src/routes/auth.ts`

**POST /api/auth/login** (Lines 7-62)
- Authenticates users by username or email
- Returns user without password
- Logs USER_LOGIN activity
- No role-specific logic

**GET /api/auth/me** (Lines 65-100)
- Simple user lookup by userId
- No role validation

---

## 4. ACTIVITY LOGGING & AUDIT TRAIL

**File**: `/home/user/Gestion_Fast_Food/backend/prisma/schema.prisma` (Lines 370-411)

All actions are logged with activity types:
```
enum ActivityType {
  USER_LOGIN
  USER_LOGOUT
  USER_CREATED
  USER_UPDATED
  USER_DELETED
  PRODUCT_CREATED
  PRODUCT_UPDATED
  PRODUCT_DELETED
  CATEGORY_CREATED
  CATEGORY_UPDATED
  CATEGORY_DELETED
  ORDER_CREATED
  ORDER_CANCELLED
  PAYMENT_CREATED
  STOCK_ADJUSTED
  DAILY_CLOSURE
  SYSTEM_ERROR
}
```

Example: User login logging (auth.ts, Lines 44-49)
```typescript
await logActivity({
  type: 'USER_LOGIN',
  userId: user.id,
  description: `Connexion réussie: ${user.username}`,
  ipAddress: request.ip,
});
```

---

## 5. DATA ACCESS PATTERNS BY ROLE

### All Users (No Role Restriction Enforced)
- POS (Point of Sale)
- Orders
- Dashboard/Statistics
- Stock (view)
- Daily Closures (own only in UI, all via API)

### Admin-Only (UI Filtering Only)
- Team/Staff Management
- User Management (Create, Read, Update, Delete)
- Product Management
- Category Management
- All closures (vs own closures for others)
- Activity Logs (implied, not in current analysis)

### Manager (UI Filtering)
- Stock Management (edit/create)
- All Closures (view and analyze)

### Cashier/Kitchen/Waiter
- POS
- Orders
- Dashboard
- Stock (view only in UI)
- Own Closures

---

## 6. AUTHENTICATION FLOW

**File**: `/home/user/Gestion_Fast_Food/frontend/src/store/authStore.ts`

Uses Zustand with localStorage persistence:
```typescript
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => {
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',  // Persisted in localStorage
    }
  )
);
```

---

## 7. SUMMARY OF FILES & KEY LOCATIONS

| Component | File | Key Lines |
|-----------|------|-----------|
| Role Enum | `/backend/prisma/schema.prisma` | 17-23 |
| User Model | `/backend/prisma/schema.prisma` | 25-44 |
| Role Type | `/frontend/src/types/index.ts` | 3 |
| Auth Store | `/frontend/src/store/authStore.ts` | 1-39 |
| Login Routes | `/backend/src/routes/auth.ts` | 7-62 |
| User Routes | `/backend/src/routes/users.ts` | All |
| App Routes | `/frontend/src/App.tsx` | 15-40 |
| Layout Menu | `/frontend/src/components/Layout.tsx` | 15-98 |
| Users Page | `/frontend/src/pages/UsersManagementPage.tsx` | 27, 91-100 |
| Stock Page | `/frontend/src/pages/StockPage.tsx` | 16 |
| Closures Page | `/frontend/src/pages/ClosuresPage.tsx` | 38, 53 |
| Team Page | `/frontend/src/pages/TeamPage.tsx` | 54-60 |
| Seed Users | `/backend/src/seed.ts` | 8-38 |

---

## 8. CURRENT SECURITY ASSESSMENT

### Strengths:
1. ✅ Roles defined at schema level
2. ✅ Activity logging implemented
3. ✅ Admin user protection (cannot be deleted)
4. ✅ User cannot delete self
5. ✅ Soft deletes for users

### Critical Vulnerabilities:
1. ❌ **NO SERVER-SIDE AUTHORIZATION** - All backend routes are publicly accessible
2. ❌ **CLIENT-SIDE ONLY PROTECTION** - Anyone with direct API access can bypass role checks
3. ❌ **NO MIDDLEWARE** - Missing role validation hooks on protected routes
4. ❌ **NO JWT/SESSION VALIDATION** - No token mechanism to verify user identity
5. ❌ **ANYONE CAN CREATE/UPDATE USERS** - No admin role requirement for user management API

### Recommendations:
1. Implement server-side authorization middleware
2. Add role-based request validation on each route
3. Implement JWT or session-based authentication
4. Validate user role on every protected API call
5. Move all access control logic to backend
6. Add rate limiting and audit logging for sensitive operations

---

## 9. ROLE RESPONSIBILITIES (AS INTENDED)

| Role | Access | Description |
|------|--------|-------------|
| **ADMIN** | All | Full system access, user management, product/category management, all reports |
| **MANAGER** | Most | Can manage stock, view all closures, manage reports, but cannot manage users |
| **CASHIER** | Core | POS, orders, own dashboard, view stock, own closures (default role) |
| **KITCHEN** | Limited | Orders, own dashboard, kitchen operations |
| **WAITER** | Limited | Orders, service functions, own closures |

