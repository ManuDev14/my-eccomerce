import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "./types";

/**
 * Creates a Supabase admin client with elevated privileges (bypasses RLS).
 *
 * ⚠️ WARNING: This client uses the Service Role Key which bypasses Row Level Security (RLS).
 *
 * USE ONLY FOR:
 * - Server Actions for administrative operations
 * - User management (full CRUD)
 * - Operations requiring full database access
 *
 * DO NOT USE FOR:
 * - Regular user operations
 * - Normal authentication (login/logout)
 * - Queries that should respect RLS
 *
 * IMPORTANT: Always create a new client within each function when using it.
 * Do NOT store this client in a global variable.
 *
 * @example
 * ```ts
 * // In a server action for admin operations
 * const supabase = await createAdminClient();
 * const { data } = await supabase.from('profiles').select('*');
 * ```
 *
 * @returns Promise<SupabaseClient> - A new Supabase admin client instance
 */
export async function createAdminClient() {
  const cookieStore = await cookies();

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
              cookieStore.set(name, value, options)
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
}

