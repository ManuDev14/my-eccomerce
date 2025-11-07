import { Tables } from "./supabase";

// Base types from database
export type Profile = Tables<"profiles">;

// User with profile
export type UserWithProfile = {
  id: string;
  email: string;
  created_at: string;
  profile?: Profile;
};

// User creation data
export type UserCreationData = {
  email: string;
  password: string;
  full_name?: string;
  avatar_url?: string;
};

// Action response types
export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
