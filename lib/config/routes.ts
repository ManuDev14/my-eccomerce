/**
 * Route Configuration
 * Centralizes route definitions for authentication and navigation
 */

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

/**
 * Routes that don't require authentication
 * These are accessible to everyone, including logged-out users
 * Note: All product detail pages ([slug]) are public by default
 * unless they match admin routes
 */
export const publicRoutes = [
  "/",
  "/about",
  "/contact",
] as const;

/**
 * Authentication routes (login, signup, forgot password, etc.)
 * If user is already authenticated, redirect to dashboard
 */
export const authRoutes = [
  "/admin/login",
  "/admin/sign-up",
  "/admin/forgot-password",
  "/admin/reset-password",
] as const;

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

/**
 * Routes that require authentication
 * If user is not authenticated, redirect to login
 */
export const protectedRoutes = [
  "/admin/dashboard",
  "/admin/dashboard/*", // All dashboard sub-routes
] as const;

// ============================================================================
// REDIRECT PATHS
// ============================================================================

/**
 * Default redirect after successful login
 */
export const DEFAULT_LOGIN_REDIRECT = "/admin/dashboard";

/**
 * Default redirect when authentication is required
 */
export const DEFAULT_AUTH_REDIRECT = "/admin/login";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a path is a public route
 */
export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route.endsWith("*")) {
      const baseRoute = route.slice(0, -1);
      return pathname.startsWith(baseRoute);
    }
    return pathname === route;
  });
}

/**
 * Check if a path is an auth route (login, signup, etc.)
 */
export function isAuthRoute(pathname: string): boolean {
  return authRoutes.some((route) => {
    if (route.endsWith("*")) {
      const baseRoute = route.slice(0, -1);
      return pathname.startsWith(baseRoute);
    }
    return pathname === route;
  });
}

/**
 * Check if a path is a protected route
 */
export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => {
    if (route.endsWith("*")) {
      const baseRoute = route.slice(0, -1);
      return pathname.startsWith(baseRoute);
    }
    return pathname === route;
  });
}
