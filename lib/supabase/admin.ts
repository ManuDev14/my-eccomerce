import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { Database } from "./types";

/**
 * Cliente de Supabase con permisos de administrador
 * 
 * ⚠️ IMPORTANTE: Este cliente usa la Service Role Key que bypasea Row Level Security (RLS)
 * 
 * SOLO usar en:
 * - Server Actions para operaciones administrativas
 * - Gestión de usuarios (CRUD completo)
 * - Operaciones que requieren acceso total a la base de datos
 * 
 * NO usar para:
 * - Operaciones de usuarios regulares
 * - Autenticación normal (login/logout)
 * - Consultas que deban respetar RLS
 * 
 * @example
 * ```ts
 * // En una server action de administración
 * const supabase = await createAdminClient();
 * const { data } = await supabase.from('profiles').select('*');
 * ```
 */
export const createAdminClient = cache(async () => {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set({ name, value, ...options })
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
});

