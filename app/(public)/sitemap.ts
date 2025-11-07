import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { generateProductSlug } from "@/lib/utils/slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const supabase = await createClient();

    // Get all products
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, subcategory_id")
      .order("id");

    if (error) {
      console.error("Error fetching products for sitemap:", error);
      return [];
    }

    // Generate sitemap entries for each product
    const productEntries: MetadataRoute.Sitemap = (products || []).map((product) => ({
      url: `${baseUrl}/${generateProductSlug(product.name, product.id)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Add main home page
    const mainPage: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
      },
    ];

    return [...mainPage, ...productEntries];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
      },
    ];
  }
}
