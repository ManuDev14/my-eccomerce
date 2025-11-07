"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createUserSchema, updateProfileSchema } from "@/lib/validations/user";
import type { ActionResponse, UserWithProfile, Profile } from "@/types/user";
import type { CreateUserInput, UpdateProfileInput } from "@/lib/validations/user";

// ============================================================================
// USERS CRUD
// ============================================================================

/**
 * Get all users with their profiles
 */
export async function getUsers(): Promise<ActionResponse<UserWithProfile[]>> {
  try {
    const supabase = await createClient();

    // Get users from auth.users (requires service role key or admin API)
    // For now, we'll get profiles and assume they map to users
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");
    

    if (profilesError) throw profilesError;

    // Map profiles to users (we don't have access to auth.users email without service role)
    const users: UserWithProfile[] = profiles.map((profile) => ({
      id: profile.id,
      email: "", // We can't get email without service role key
      created_at: profile.created_at || "",
      profile,
    }));

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
 * This uses Supabase Auth to create the user and automatically creates the profile
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

    const supabase = await createClient();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: {
        data: {
          full_name: validation.data.full_name,
          avatar_url: validation.data.avatar_url || null,
        },
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

    const supabase = await createClient();

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
 * Note: This only deletes the profile. To delete the auth user, you need service role key
 */
export async function deleteUser(userId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // Delete profile (the auth user will remain unless using service role key)
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) throw error;

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
