/**
 * SEO utilities for product catalog
 */

/**
 * Generate SEO-optimized title for product listing page
 */
export function generateProductsTitle(filters: {
  familyName?: string;
  categoryName?: string;
  subcategoryName?: string;
}): string {
  const parts: string[] = [];

  if (filters.subcategoryName) {
    parts.push(filters.subcategoryName);
  } else if (filters.categoryName) {
    parts.push(filters.categoryName);
  } else if (filters.familyName) {
    parts.push(filters.familyName);
  }

  if (parts.length > 0) {
    return `${parts.join(" - ")} | Productos`;
  }

  return "Catálogo de Productos";
}

/**
 * Generate SEO-optimized description for product listing page
 */
export function generateProductsDescription(filters: {
  familyName?: string;
  categoryName?: string;
  subcategoryName?: string;
  productCount?: number;
}): string {
  const parts: string[] = ["Explora nuestro catálogo de"];

  if (filters.subcategoryName) {
    parts.push(filters.subcategoryName.toLowerCase());
  } else if (filters.categoryName) {
    parts.push(filters.categoryName.toLowerCase());
  } else if (filters.familyName) {
    parts.push(filters.familyName.toLowerCase());
  } else {
    parts.push("productos");
  }

  if (filters.productCount !== undefined && filters.productCount > 0) {
    parts.push(`con ${filters.productCount} opciones disponibles.`);
  } else {
    parts.push("con las mejores opciones para ti.");
  }

  parts.push("Compra online con envío rápido y seguro.");

  return parts.join(" ");
}

/**
 * Generate SEO-optimized title for product detail page
 */
export function generateProductTitle(productName: string, price: number): string {
  return `${productName} - ${formatPrice(price)}`;
}

/**
 * Generate SEO-optimized description for product detail page
 */
export function generateProductDescription(
  productName: string,
  detail: string | null,
  price: number
): string {
  const baseDescription = `${productName} por ${formatPrice(price)}.`;

  if (detail && detail.length > 0) {
    // Limit description to ~160 characters for SEO
    const cleanDetail = detail.replace(/\s+/g, " ").trim();
    const maxLength = 155 - baseDescription.length;

    if (cleanDetail.length <= maxLength) {
      return `${baseDescription} ${cleanDetail}`;
    }

    return `${baseDescription} ${cleanDetail.substring(0, maxLength - 3)}...`;
  }

  return `${baseDescription} Compra online con envío rápido y seguro.`;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

/**
 * Format price range for display
 */
export function formatPriceRange(minPrice: number, maxPrice: number): string {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice);
  }

  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
}

/**
 * Generate JSON-LD structured data for product
 */
export function generateProductJsonLd(product: {
  name: string;
  description: string | null;
  price: number;
  sku: string;
  image_path: string | null;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} - Producto de calidad`,
    sku: product.sku,
    image: product.image_path || "/placeholder-product.jpg",
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: product.url,
    },
  };
}

/**
 * Truncate text for SEO
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - 3) + "...";
}

