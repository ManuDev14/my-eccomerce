import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extrae las iniciales de un nombre completo
 * 
 * @param fullName - El nombre completo del usuario
 * @returns Las iniciales del nombre
 * 
 * @example
 * getInitials("Juan Pérez") // "JP"
 * getInitials("María") // "MA"
 * getInitials("") // "U"
 * 
 * Reglas:
 * - Si hay 2+ palabras: toma la primera letra de las dos primeras palabras
 * - Si hay 1 palabra: toma las dos primeras letras
 * - Si está vacío/null: retorna "U" (User)
 */
export function getInitials(fullName: string | null | undefined): string {
  if (!fullName || fullName.trim() === "") {
    return "U";
  }

  const words = fullName.trim().split(/\s+/);

  if (words.length >= 2) {
    // Dos o más palabras: primera letra de las dos primeras palabras
    return (words[0][0] + words[1][0]).toUpperCase();
  } else {
    // Una sola palabra: dos primeras letras
    const word = words[0];
    return word.length >= 2
      ? (word[0] + word[1]).toUpperCase()
      : word[0].toUpperCase();
  }
}

/**
 * Check if all required Supabase environment variables are set.
 *
 * This prevents errors in middleware and server components when
 * environment variables are not configured.
 *
 * @returns boolean - true if all required env vars are defined
 *
 * @example
 * if (!hasEnvVars) {
 *   console.error("Missing Supabase environment variables");
 *   return NextResponse.next();
 * }
 */
export const hasEnvVars =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== "undefined" &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "undefined";