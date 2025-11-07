/**
 * Generate URL-friendly slug from product name and ID
 * Format: "product-name-123"
 */
export function generateProductSlug(name: string, id: number): string {
  const slugName = name
    .toLowerCase()
    .normalize("NFD") // Normalize to decomposed form
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  return `${slugName}-${id}`;
}

/**
 * Extract product ID from slug
 * Returns null if slug is invalid
 */
export function extractIdFromSlug(slug: string): number | null {
  const parts = slug.split("-");
  const lastPart = parts[parts.length - 1];
  const id = parseInt(lastPart, 10);

  return isNaN(id) ? null : id;
}

/**
 * Validate if a slug has correct format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+-\d+$/.test(slug);
}

