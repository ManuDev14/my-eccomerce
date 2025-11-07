"use server";

import { createClient } from "@/lib/supabase/server";
import { extractIdFromSlug } from "@/lib/utils/slug";
import type {
  ActionResponse,
  ProductWithRelations,
  PublicProduct,
  FiltersData,
  FamilyWithRelations,
} from "@/types/catalog";

// ============================================================================
// PUBLIC PRODUCT CATALOG
// ============================================================================

/**
 * Get products for public catalog with filters and pagination
 */
export async function getPublicProducts(params: {
  familyId?: number;
  categoryId?: number;
  subcategoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  offset?: number;
  limit?: number;
}): Promise<ActionResponse<PublicProduct[]>> {
  try {
    const supabase = await createClient();
    const { offset = 0, limit = 20 } = params;

    // Build query
    let query = supabase
      .from("products")
      .select(
        `
        *,
        subcategory:subcategories!inner(
          id,
          name,
          category:categories!inner(
            id,
            name,
            family:families!inner(
              id,
              name
            )
          )
        ),
        variants(
          id,
          price,
          stock
        )
      `
      )
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (params.subcategoryId) {
      query = query.eq("subcategory_id", params.subcategoryId);
    } else if (params.categoryId) {
      query = query.eq("subcategory.category_id", params.categoryId);
    } else if (params.familyId) {
      query = query.eq("subcategory.category.family_id", params.familyId);
    }

    if (params.minPrice !== undefined) {
      query = query.gte("price", params.minPrice);
    }

    if (params.maxPrice !== undefined) {
      query = query.lte("price", params.maxPrice);
    }

    const { data: products, error } = await query;

    if (error) throw error;

    // Transform to PublicProduct format
    const publicProducts: PublicProduct[] = (products || []).map((product: any) => {
      const variants = product.variants || [];
      const variantCount = variants.length;

      // Calculate min and max prices
      const prices = [
        product.price,
        ...variants.map((v: any) => v.price).filter((p: any) => p !== null),
      ];
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      // Check if has stock
      const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
      const hasStock = totalStock > 0;

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        detail: product.detail,
        image_path: product.image_path,
        subcategory_id: product.subcategory_id,
        subcategory: product.subcategory,
        variantCount,
        minPrice,
        maxPrice,
        hasStock,
      };
    });

    return { success: true, data: publicProducts };
  } catch (error) {
    console.error("Error fetching public products:", error);
    return {
      success: false,
      error: "Error al cargar los productos",
    };
  }
}

/**
 * Get product by slug for detail page
 */
export async function getProductBySlug(
  slug: string
): Promise<ActionResponse<ProductWithRelations>> {
  try {
    const productId = extractIdFromSlug(slug);

    if (!productId) {
      return {
        success: false,
        error: "Slug de producto inválido",
      };
    }

    const supabase = await createClient();

    // Get product basic info with subcategory hierarchy
    const { data: product, error: productError } = await supabase
      .from("products")
      .select(
        `
        *,
        subcategory:subcategories(
          id,
          name,
          category:categories(
            id,
            name,
            family:families(
              id,
              name
            )
          )
        )
      `
      )
      .eq("id", productId)
      .single();

    if (productError) throw productError;

    // Get product options
    const { data: optionProducts, error: optionsError } = await supabase
      .from("option_products")
      .select("option_id")
      .eq("product_id", productId);

    if (optionsError) throw optionsError;

    const optionIds = optionProducts.map((op) => op.option_id);

    let options: any[] = [];
    if (optionIds.length > 0) {
      const { data: optionsData, error: optionsDataError } = await supabase
        .from("options")
        .select("*")
        .in("id", optionIds);

      if (optionsDataError) throw optionsDataError;

      const { data: features, error: featuresError } = await supabase
        .from("features")
        .select("*")
        .in("option_id", optionIds);

      if (featuresError) throw featuresError;

      options = optionsData.map((option) => ({
        ...option,
        features: features.filter((f) => f.option_id === option.id),
      }));
    }

    // Get product variants with features
    const { data: variants, error: variantsError } = await supabase
      .from("variants")
      .select("*")
      .eq("product_id", productId);

    if (variantsError) throw variantsError;

    // Get variant features
    const variantsWithFeatures = await Promise.all(
      (variants || []).map(async (variant) => {
        const { data: variantFeatures, error: vfError } = await supabase
          .from("variant_features")
          .select("feature_id")
          .eq("variant_id", variant.id);

        if (vfError) throw vfError;

        const featureIds = variantFeatures.map((vf) => vf.feature_id);

        if (featureIds.length === 0) {
          return { ...variant, features: [] };
        }

        const { data: featuresData, error: featuresError } = await supabase
          .from("features")
          .select("*, option:options(*)")
          .in("id", featureIds);

        if (featuresError) throw featuresError;

        return {
          ...variant,
          features: featuresData.map((f: any) => ({
            ...f,
            option: f.option,
          })),
        };
      })
    );

    const productWithRelations: ProductWithRelations = {
      ...product,
      options,
      variants: variantsWithFeatures,
    };

    return { success: true, data: productWithRelations };
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return {
      success: false,
      error: "Error al cargar el producto",
    };
  }
}

/**
 * Get filters data for product catalog
 */
export async function getFiltersData(): Promise<ActionResponse<FiltersData>> {
  try {
    const supabase = await createClient();

    // Get families with categories and subcategories
    const { data: families, error: familiesError } = await supabase
      .from("families")
      .select("*")
      .order("name");

    if (familiesError) throw familiesError;

    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (categoriesError) throw categoriesError;

    const { data: subcategories, error: subcategoriesError } = await supabase
      .from("subcategories")
      .select("*")
      .order("name");

    if (subcategoriesError) throw subcategoriesError;

    // Build hierarchical structure
    const familiesWithRelations: FamilyWithRelations[] = families.map((family) => ({
      ...family,
      categories: categories
        .filter((cat) => cat.family_id === family.id)
        .map((category) => ({
          ...category,
          subcategories: subcategories.filter((sub) => sub.category_id === category.id),
        })),
    }));

    // Get price range
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("price");

    if (productsError) throw productsError;

    let minPrice = 0;
    let maxPrice = 1000;

    if (products && products.length > 0) {
      const prices = products.map((p) => p.price);
      minPrice = Math.min(...prices);
      maxPrice = Math.max(...prices);
    }

    return {
      success: true,
      data: {
        families: familiesWithRelations,
        priceRange: { min: minPrice, max: maxPrice },
      },
    };
  } catch (error) {
    console.error("Error fetching filters data:", error);
    return {
      success: false,
      error: "Error al cargar los filtros",
    };
  }
}

/**
 * Get product count for a given filter
 */
export async function getProductCount(filters: {
  familyId?: number;
  categoryId?: number;
  subcategoryId?: number;
  minPrice?: number;
  maxPrice?: number;
}): Promise<number> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("products")
      .select("id", { count: "exact", head: true });

    if (filters.subcategoryId) {
      query = query.eq("subcategory_id", filters.subcategoryId);
    }

    if (filters.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    const { count } = await query;

    return count || 0;
  } catch (error) {
    console.error("Error getting product count:", error);
    return 0;
  }
}

