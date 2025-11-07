"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { createUserSchema, updateProfileSchema } from "@/lib/validations/user";
import type { ActionResponse, UserWithProfile, Profile } from "@/types/user";
import type { CreateUserInput, UpdateProfileInput } from "@/lib/validations/user";

// ============================================================================
// USERS CRUD
// ============================================================================

/**
 * Get all users with their profiles
 * Uses admin client to bypass RLS and fetch all profiles
 */
export async function getUsers(): Promise<ActionResponse<UserWithProfile[]>> {
  try {
    const supabase = await createAdminClient();

    // Get profiles from database
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) throw profilesError;

    // Get users from auth.users to get emails
    // This only works with the admin client (service role key)
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching auth users:", authError);
    }

    // Map profiles to users with email from auth
    const users: UserWithProfile[] = profiles.map((profile) => {
      const authUser = authUsers?.find(u => u.id === profile.id);
      return {
        id: profile.id,
        email: authUser?.email || "",
        created_at: authUser?.created_at || profile.created_at || "",
        profile,
      };
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: "Error al cargar los usuarios",
    };
  }
}

/**
 * Create a new user with profile
 * Uses admin client to create users with admin privileges
 */
export async function createUser(
  input: CreateUserInput
): Promise<ActionResponse<{ userId: string }>> {
  try {
    // Validate input
    const validation = createUserSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const supabase = await createAdminClient();

    // Create user in Supabase Auth using admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validation.data.email,
      password: validation.data.password,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        full_name: validation.data.full_name,
        avatar_url: validation.data.avatar_url || null,
      },
    });

    if (authError) throw authError;

    if (!authData.user) {
      return {
        success: false,
        error: "Error al crear el usuario",
      };
    }

    // Create or update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: authData.user.id,
        full_name: validation.data.full_name,
        avatar_url: validation.data.avatar_url || null,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Don't fail if profile creation fails, user is already created
    }

    revalidatePath("/admin/dashboard/users");

    return {
      success: true,
      data: { userId: authData.user.id },
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle specific Supabase errors
    if (error.message?.includes("already registered")) {
      return {
        success: false,
        error: "Este email ya está registrado",
      };
    }

    return {
      success: false,
      error: error.message || "Error al crear el usuario",
    };
  }
}

/**
 * Update user profile
 * Uses admin client for administrative updates
 */
export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<ActionResponse<Profile>> {
  try {
    const validation = updateProfileSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: validation.data.full_name,
        avatar_url: validation.data.avatar_url || null,
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/dashboard/users");

    return { success: true, data };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: "Error al actualizar el perfil",
    };
  }
}

/**
 * Delete user
 * Uses admin client to delete both auth user and profile
 */
export async function deleteUser(userId: string): Promise<ActionResponse> {
  try {
    const supabase = await createAdminClient();

    // Delete auth user (this will cascade to profile if properly configured)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Error deleting auth user:", authError);
      throw authError;
    }

    // Also delete profile explicitly to ensure cleanup
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Error deleting profile:", profileError);
      // Don't throw here as auth user is already deleted
    }

    revalidatePath("/admin/dashboard/users");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: "Error al eliminar el usuario",
    };
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile(): Promise<ActionResponse<Profile>> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    return { success: true, data: profile };
  } catch (error) {
    console.error("Error fetching current user profile:", error);
    return {
      success: false,
      error: "Error al cargar el perfil",
    };
  }
}
