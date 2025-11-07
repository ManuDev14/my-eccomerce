"use server";

import { createClient } from "../supabase/server";

// ============================================================================
// DASHBOARD METRICS
// ============================================================================

/**
 * Dashboard overview statistics for e-commerce
 */
export interface DashboardStats {
  totalProducts: number;
  totalVariants: number;
  totalStock: number;
  totalInventoryValue: number;
  totalFamilies: number;
  totalCategories: number;
  lowStockCount: number;
  outOfStockCount: number;
}

/**
 * Top product by stock or price
 */
export interface TopProduct {
  id: number;
  name: string;
  sku: string;
  price: number;
  totalStock: number;
  variantCount: number;
}

/**
 * Category statistics
 */
export interface CategoryStats {
  categoryName: string;
  productCount: number;
  totalStock: number;
  averagePrice: number;
}

/**
 * Family statistics
 */
export interface FamilyStats {
  familyName: string;
  categoryCount: number;
  productCount: number;
  totalValue: number;
}

/**
 * Get overview statistics for the dashboard
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  try {
    // Get total products
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // Get total variants and sum of stock
    const { data: variantsData } = await supabase
      .from("variants")
      .select("stock, price");

    const totalVariants = variantsData?.length || 0;
    const totalStock = variantsData?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
    const totalInventoryValue = variantsData?.reduce(
      (sum, v) => sum + (v.price || 0) * (v.stock || 0),
      0
    ) || 0;

    // Get low stock count (stock < 10)
    const { count: lowStockCount } = await supabase
      .from("variants")
      .select("*", { count: "exact", head: true })
      .lt("stock", 10)
      .gt("stock", 0);

    // Get out of stock count
    const { count: outOfStockCount } = await supabase
      .from("variants")
      .select("*", { count: "exact", head: true })
      .eq("stock", 0);

    // Get total families
    const { count: totalFamilies } = await supabase
      .from("families")
      .select("*", { count: "exact", head: true });

    // Get total categories
    const { count: totalCategories } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true });

    return {
      totalProducts: totalProducts || 0,
      totalVariants,
      totalStock,
      totalInventoryValue,
      totalFamilies: totalFamilies || 0,
      totalCategories: totalCategories || 0,
      lowStockCount: lowStockCount || 0,
      outOfStockCount: outOfStockCount || 0,
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return {
      totalProducts: 0,
      totalVariants: 0,
      totalStock: 0,
      totalInventoryValue: 0,
      totalFamilies: 0,
      totalCategories: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    };
  }
}

/**
 * Get top products by stock
 */
export async function getTopProductsByStock(limit: number = 5): Promise<TopProduct[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        sku,
        price,
        variants (stock, price)
      `)
      .limit(limit);

    if (error) throw error;

    const productsWithStats = data?.map((product) => {
      const variants = product.variants as Array<{ stock: number | null; price: number | null }>;
      const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      const variantCount = variants.length;

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        totalStock,
        variantCount,
      };
    }) || [];

    // Sort by total stock descending
    return productsWithStats.sort((a, b) => b.totalStock - a.totalStock).slice(0, limit);
  } catch (error) {
    console.error("Error getting top products:", error);
    return [];
  }
}

/**
 * Get category statistics
 */
export async function getCategoryStats(): Promise<CategoryStats[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("categories")
      .select(`
        name,
        subcategories (
          products (
            price,
            variants (stock, price)
          )
        )
      `);

    if (error) throw error;

    const stats: CategoryStats[] = data?.map((category) => {
      const subcategories = category.subcategories as Array<{
        products: Array<{
          price: number;
          variants: Array<{ stock: number | null; price: number | null }>;
        }>;
      }>;

      const products = subcategories.flatMap((sub) => sub.products);
      const productCount = products.length;

      const totalStock = products.reduce((sum, prod) => {
        const prodStock = (prod.variants as Array<{ stock: number | null }>).reduce(
          (s, v) => s + (v.stock || 0),
          0
        );
        return sum + prodStock;
      }, 0);

      const averagePrice =
        productCount > 0
          ? products.reduce((sum, prod) => sum + prod.price, 0) / productCount
          : 0;

      return {
        categoryName: category.name,
        productCount,
        totalStock,
        averagePrice,
      };
    }) || [];

    return stats.sort((a, b) => b.productCount - a.productCount);
  } catch (error) {
    console.error("Error getting category stats:", error);
    return [];
  }
}

/**
 * Get family statistics
 */
export async function getFamilyStats(): Promise<FamilyStats[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("families")
      .select(`
        name,
        categories (
          id,
          subcategories (
            products (
              price,
              variants (stock, price)
            )
          )
        )
      `);

    if (error) throw error;

    const stats: FamilyStats[] = data?.map((family) => {
      const categories = family.categories as Array<{
        id: number;
        subcategories: Array<{
          products: Array<{
            price: number;
            variants: Array<{ stock: number | null; price: number | null }>;
          }>;
        }>;
      }>;

      const categoryCount = categories.length;

      const products = categories.flatMap((cat) =>
        cat.subcategories.flatMap((sub) => sub.products)
      );

      const productCount = products.length;

      const totalValue = products.reduce((sum, prod) => {
        const prodValue = (prod.variants as Array<{ stock: number | null; price: number | null }>).reduce(
          (s, v) => s + (v.price || prod.price) * (v.stock || 0),
          0
        );
        return sum + prodValue;
      }, 0);

      return {
        familyName: family.name,
        categoryCount,
        productCount,
        totalValue,
      };
    }) || [];

    return stats.sort((a, b) => b.totalValue - a.totalValue);
  } catch (error) {
    console.error("Error getting family stats:", error);
    return [];
  }
}
