"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type LoginResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Login user with email and password
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);

      // Handle specific error messages
      if (error.message.includes("Invalid login credentials")) {
        return {
          success: false,
          error: "Email o contraseña incorrectos",
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Unexpected login error:", error);
    return {
      success: false,
      error: "Error inesperado al iniciar sesión",
    };
  }
}

/**
 * Logout current user
 */
export async function logout() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      throw error;
    }

    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Unexpected logout error:", error);
    throw error;
  }

  redirect("/login");
}

/**
 * Get current session
 */
export async function getSession() {
  const supabase = await createClient();

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Error getting session:", error);
    return null;
  }

  return session;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting user:", error);
    return null;
  }

  return user;
}
