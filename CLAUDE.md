# Development Rules for Next.js 14 with TypeScript

## Fundamental Principles

### 1. Next.js 14 with App Router

- **ALWAYS** use App Router (`app/` directory), never Pages Router
- Follow Next.js 14 folder structure and conventions
- Utilize modern features: Server Components, Server Actions, Route Handlers

### 2. Strict TypeScript

- All code must be in TypeScript
- Use explicit types, avoid `any`
- Create interfaces and types in separate files when necessary
- Leverage TypeScript type inference when it's clear

### 3. Server Components by Default

- **EVERY component is a Server Component by default**
- Only add `"use client"` when absolutely necessary:
  - React Hooks (useState, useEffect, useReducer, etc.)
  - Event handlers (onClick, onChange, etc.)
  - Browser APIs (localStorage, window, etc.)
  - Client-dependent libraries (animations, some charts)
- **STRATEGY**: Isolate client logic in small, specific components

## Project Structure

```
project/
├── app/
│   ├── (auth)/                    # Route group for authentication
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/               # Route group for dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/                       # Route Handlers
│   │   └── [...route]/
│   │       └── route.ts
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   ├── error.tsx                  # Error boundary
│   ├── loading.tsx                # Loading state
│   └── not-found.tsx              # 404 page
├── components/
│   ├── ui/                        # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── features/                  # Feature-specific components
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── dashboard/
│   │       ├── StatsCard.tsx
│   │       └── RecentActivity.tsx
│   ├── layout/                    # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── shared/                    # Shared/reusable components
│       ├── DataTable.tsx
│       └── SearchBar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Client for Client Components
│   │   ├── server.ts              # Client for Server Components
│   │   ├── middleware.ts          # Client for Middleware
│   │   └── types.ts               # Database types
│   ├── actions/                   # Server Actions
│   │   ├── auth.ts
│   │   └── users.ts
│   ├── hooks/                     # Custom hooks (client)
│   │   ├── useAuth.ts
│   │   └── useDebounce.ts
│   ├── utils/                     # General utilities
│   │   ├── cn.ts                  # className utility
│   │   └── formatters.ts
│   └── validations/               # Validation schemas (Zod)
│       ├── auth.ts
│       └── user.ts
├── types/
│   ├── database.ts                # Supabase generated types
│   ├── entities.ts                # Domain entities
│   └── api.ts                     # API types
├── store/                         # State management (if needed)
│   ├── auth-store.ts
│   └── ui-store.ts
└── config/
    ├── site.ts                    # Site configuration
    └── constants.ts               # Global constants
```

## Logic and UI Separation

### Server Components (Server-side Logic)

```typescript
// app/dashboard/page.tsx
import { getUserData } from "@/lib/actions/users";
import { DashboardClient } from "@/components/features/dashboard/DashboardClient";

export default async function DashboardPage() {
  // Fetching logic on the server
  const userData = await getUserData();

  // Pass data to client
  return <DashboardClient userData={userData} />;
}
```

### Client Components (Isolated Interactive UI)

```typescript
// components/features/dashboard/DashboardClient.tsx
"use client";

import { useState } from "react";
import { StatsCard } from "./StatsCard";

interface Props {
  userData: UserData;
}

export function DashboardClient({ userData }: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div>
      {/* Interactive UI only where needed */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* ... */}
      </Tabs>

      {/* Server Component can be nested */}
      <StatsCard data={userData.stats} />
    </div>
  );
}
```

### Composition: Server + Client

```typescript
// app/products/page.tsx (Server Component)
import { getProducts } from "@/lib/actions/products";
import { ProductList } from "@/components/features/products/ProductList";
import { SearchBar } from "@/components/shared/SearchBar";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <h1>Products</h1>
      {/* Isolated Client Component for interactivity */}
      <SearchBar />
      {/* Server Component for rendering */}
      <ProductList products={products} />
    </div>
  );
}
```

## Supabase: Architecture and Patterns

### 1. Client Configuration

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}
```

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 2. Server Actions (Preferred for Mutations)

```typescript
// lib/actions/users.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;

  const { data, error } = await supabase
    .from("profiles")
    .update({ name })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { data };
}
```

### 3. Data Fetching in Server Components

```typescript
// lib/actions/posts.ts
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

// cache() for request deduplication
export const getPosts = cache(async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
});
```

## UI Components with Shadcn

### Shadcn Usage Rules

1. **ALWAYS** check Shadcn UI catalog first: https://ui.shadcn.com/docs/components
2. If the component exists in Shadcn, install and use it:
   ```bash
   npx shadcn-ui@latest add button
   ```
3. If it does NOT exist, create a custom component following Shadcn's style
4. Place Shadcn components in `components/ui/`
5. Extend Shadcn components when necessary

### Extension Example

```typescript
// components/ui/data-table.tsx
import { Table } from "@/components/ui/table";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
}

export function DataTable<T>({ data, columns }: DataTableProps<T>) {
  // Extend Shadcn base functionality
  return (
    <div className="rounded-md border">
      <Table>{/* Implementation */}</Table>
    </div>
  );
}
```

## Component Communication Patterns

### 1. Props (Parent → Child) - Preferred

```typescript
// For simple and direct communication
<ChildComponent data={parentData} onAction={handleAction} />
```

### 2. Context API (For 2-3 levels of depth)

```typescript
// contexts/theme-context.tsx
"use client";

import { createContext, useContext, useState } from "react";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
```

### 3. Zustand (For complex global state - 4+ levels)

```typescript
// store/auth-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
    }
  )
);
```

### Decision Criteria

- **Props**: 1-2 levels, simple data
- **Context**: 2-3 levels, limited shared state (theme, language)
- **Zustand/Jotai**: 4+ levels, complex global state (auth, cart, preferences)
- **Server State**: Use Server Components and Server Actions whenever possible

## Next.js 14 Best Practices

### 1. Loading States Management

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}
```

### 2. Error Boundaries

```typescript
// app/dashboard/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### 3. Metadata for SEO

```typescript
// app/blog/[slug]/page.tsx
import { Metadata } from "next";

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.coverImage],
    },
  };
}
```

### 4. Route Groups for Layouts

```typescript
// app/(dashboard)/layout.tsx - Shared layout
// app/(auth)/layout.tsx - Different layout for auth
// Parentheses don't affect the URL
```

### 5. Parallel Routes and Intercepting Routes

```typescript
// app/@modal/(.)photo/[id]/page.tsx
// Intercepts the route to show modal
```

### 6. Image Optimization

```typescript
import Image from "next/image";

<Image
  src="/photo.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // For above-the-fold
  placeholder="blur" // For better UX
/>;
```

### 7. Streaming and Suspense

```typescript
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <Header />
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>
    </div>
  );
}
```

## Validation and Form Handling

### Use Zod for Validation

```typescript
// lib/validations/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Minimum 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### React Hook Form + Server Actions

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations/auth";
import { login } from "@/lib/actions/auth";

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    const result = await login(data);
    // Handle result
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

## Recommended Design Patterns

### 1. Compound Components

```typescript
// For complex components with multiple parts
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### 2. Render Props (when necessary)

```typescript
<DataFetcher
  render={(data, loading) =>
    loading ? <Spinner /> : <DataDisplay data={data} />
  }
/>
```

### 3. Custom Hooks for Reusable Logic

```typescript
// lib/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

## Development Checklist

### Before Creating a Component

- [ ] Is it a Server Component by default?
- [ ] Do I really need 'use client'?
- [ ] Does it already exist in Shadcn UI?
- [ ] Is it reusable? → `components/shared/`
- [ ] Is it feature-specific? → `components/features/[feature]/`
- [ ] Does it have complex logic? → Separate into hooks or utils

### Before Adding State

- [ ] Can I use Server Components instead?
- [ ] Is it local component state? → useState
- [ ] Is it shared between 2-3 components? → Context
- [ ] Is it complex global state? → Zustand
- [ ] Is it server state? → Server Components + Server Actions

### Before Fetching Data

- [ ] Can it be a Server Component? → Preferred
- [ ] Do I need revalidation? → revalidatePath/revalidateTag
- [ ] Is it a mutation? → Server Action
- [ ] Is it real-time? → Supabase Realtime on client

## Useful Commands

```bash
# Install base dependencies
npm install @supabase/ssr @supabase/supabase-js
npm install zustand zod react-hook-form @hookform/resolvers

# Shadcn UI
npx shadcn-ui@latest init
npx shadcn-ui@latest add [component-name]

# Generate Supabase types
npx supabase gen types typescript --project-id [PROJECT_ID] > types/database.ts
```

## Final Notes

- **Prioritize simplicity**: Don't over-engineer
- **Server First**: Use Server Components whenever possible
- **Type Safety**: TypeScript in all code
- **Accessibility**: Shadcn includes a11y best practices
- **Performance**: Automatic code splitting with App Router
- **Security**: Row Level Security (RLS) in Supabase

---

**Keep this file updated with project architectural decisions.**

## Current Project Status & Observations

### Project Structure Analysis (Last updated: 2025-11-06)

#### Current Structure (Updated)

```
support-me-course/
├── app/
│   ├── admin/
│   │   ├── (logged-out)/          # Auth pages (login, sign-up)
│   │   └── dashboard/
│   │       ├── employees/
│   │       ├── families/
│   │       ├── teams/
│   │       ├── account/
│   │       ├── settings/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                        # ✅ Shadcn components
│   ├── features/                  # ✅ Feature-specific components
│   │   └── dashboard/
│   │       ├── employees/
│   │       ├── teams/
│   │       ├── main-menu.tsx
│   │       ├── menu-item.tsx
│   │       └── menu-title.tsx
│   ├── layout/                    # ✅ Layout components (ready)
│   └── shared/                    # ✅ Shared components (ready)
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # ✅ Using @supabase/ssr createBrowserClient
│   │   ├── server.ts             # ✅ Using @supabase/ssr createServerClient with cache()
│   │   ├── middleware.ts         # ✅ Middleware client for auth
│   │   └── types.ts              # ✅ Re-exports Database type
│   ├── actions/                   # ✅ Server Actions (ready)
│   ├── hooks/                     # ✅ Custom hooks (ready)
│   ├── validations/               # ✅ Zod schemas (ready)
│   └── utils/
│       └── cn.ts
├── types/
│   ├── supabase.ts               # ✅ Database types (single source of truth)
│   └── panel-menu.ts
└── middleware.ts                  # ✅ Auth session management
```

#### Database Schema (Supabase)

The database implements a **product catalog structure**:

```
families (Product Families)
  └── categories (Categories)
      └── subcategories (Subcategories)
          └── products (Products: name, sku, price, image, detail)
              ├── variants (Product Variants: price, stock)
              └── option_products (Available Options Link)
                  └── options (Option Names: size, color, etc.)
                      └── features (Feature Values: M, L, XL, Red, Blue, etc.)
                          └── variant_features (Features per Variant)
```

**Tables:**
- `families`: Product families
- `categories`: Categories (FK: family_id)
- `subcategories`: Subcategories (FK: category_id)
- `products`: Products (FK: subcategory_id)
- `variants`: Product variants with price and stock (FK: product_id)
- `options`: Option types (e.g., "Size", "Color")
- `features`: Feature values (FK: option_id)
- `option_products`: Link between options and products (FK: option_id, product_id)
- `variant_features`: Link features to variants (FK: variant_id, feature_id)

#### Issues Found

**1. Supabase Client Implementation ✅ RESOLVED**
- **Was:** Using `createClient` from `@supabase/supabase-js`
- **Now:** Using `createServerClient` and `createBrowserClient` from `@supabase/ssr`
- **Fixed:**
  - `lib/supabase/client.ts` - Now uses `createBrowserClient`
  - `lib/supabase/server.ts` - Now uses `createServerClient` with cookies() and `getAll/setAll` pattern
  - `lib/supabase/middleware.ts` - Created with proper cookie handling
  - `middleware.ts` - Created at root for auth session management
  - Added `cache()` for optimal performance

**2. Component Organization ✅ RESOLVED**
- **Was:** Components in `app/admin/dashboard/components/`
- **Now:** Components in `components/features/dashboard/`
- **Fixed:**
  - Moved `employees/*` to `components/features/dashboard/employees/`
  - Moved `teams/*` to `components/features/dashboard/teams/`
  - Moved `main-menu.tsx`, `menu-item.tsx`, `menu-title.tsx` to `components/features/dashboard/`
  - Updated all imports in `app/admin/dashboard/layout.tsx` and `page.tsx`
  - Removed old `app/admin/dashboard/components/` directory

**3. Duplicate Type Files ✅ RESOLVED**
- **Was:** Both `database.types.ts` (root, empty) and `types/supabase.ts` (complete) existed
- **Now:** Single source of truth at `types/supabase.ts`
- **Fixed:**
  - Deleted `database.types.ts` (was empty)
  - Created `lib/supabase/types.ts` that re-exports from `types/supabase.ts`

**4. Missing Structure Elements ✅ RESOLVED**
- **Created:**
  - `lib/actions/` - Server Actions directory (ready for use)
  - `lib/hooks/` - Custom hooks directory (ready for use)
  - `lib/validations/` - Validation schemas directory (ready for use)
  - `lib/supabase/middleware.ts` - Middleware client ✓
  - `components/features/` - Features directory with dashboard subdirectory ✓
  - `components/layout/` - Layout components directory (ready for use)
  - `components/shared/` - Shared components directory (ready for use)

**5. Current Integration Status**
- ✅ Shadcn UI components installed and working
- ✅ Database types generated from Supabase
- ✅ Basic routing structure with App Router
- ✅ TypeScript configured
- ✅ Tailwind CSS configured
- ✅ Supabase integration complete with SSR package (@supabase/ssr)
- ✅ Middleware for auth session management
- ✅ Project structure follows CLAUDE.md conventions
- ⚠️ No Server Actions implemented yet (structure ready)
- ⚠️ No form validation setup yet (structure ready)
- ⚠️ No custom hooks created yet (structure ready)

#### Recommended Action Plan

**Priority 1 - Critical (Affects functionality): ✅ COMPLETED**
1. ✅ Update Supabase clients to use `@supabase/ssr`
2. ✅ Add missing `@supabase/ssr` to package.json
3. ✅ Create middleware client for auth

**Priority 2 - Structure (Affects maintainability): ✅ COMPLETED**
4. ✅ Move dashboard components from `app/admin/dashboard/components/` to `components/features/dashboard/`
5. ✅ Clean up duplicate type files
6. ✅ Create missing directory structure (`lib/actions/`, `lib/hooks/`, `lib/validations/`)

**Priority 3 - Enhancement (Adds functionality): 🔄 READY FOR IMPLEMENTATION**
7. Add form validation with Zod (validation schemas directory ready at `lib/validations/`)
8. Implement Server Actions for data mutations (actions directory ready at `lib/actions/`)
9. Add loading and error states (loading.tsx, error.tsx patterns)
10. Create custom hooks as needed (hooks directory ready at `lib/hooks/`)

**Next Steps Recommended:**
- Implement Server Actions for CRUD operations on families, categories, products
- Create validation schemas with Zod for forms
- Add loading.tsx and error.tsx files to routes
- Move reusable custom hooks to `lib/hooks/`

#### Dependencies Installed

From `package.json`:
- Next.js 14.0.4 ✅
- React 18 ✅
- TypeScript ✅
- Tailwind CSS ✅
- Shadcn UI components (Radix UI) ✅
- @supabase/supabase-js ✅
- @supabase/ssr ✅ (Installed)
- React Hook Form + Zod ✅
- @tanstack/react-table ✅
- Recharts (for charts) ✅

**Optional (Install when needed):**
- `zustand` - For complex global state management (4+ component levels)
- `jotai` - Alternative lightweight state management
- Additional Shadcn components as needed

---

**Note:** This section should be updated as the project evolves and issues are resolved.
