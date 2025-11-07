"use server";

import { createClient } from "../supabase/server";
import { revalidatePath } from "next/cache";
import {
  familySchema,
  categorySchema,
  subcategorySchema,
  optionSchema,
  featureSchema,
  productCreationSchema,
} from "../validations/catalog";
import type {
  ActionResponse,
  Family,
  Category,
  Subcategory,
  FamilyWithRelations,
  Option,
  Feature,
  OptionWithFeatures,
  Product,
  ProductWithRelations,
} from "../../types/catalog";
import type { ProductCreationInput } from "../validations/catalog";

// ============================================================================
// FAMILIES CRUD
// ============================================================================

export async function getFamiliesWithRelations(): Promise<
  ActionResponse<FamilyWithRelations[]>
> {
  try {
    const supabase = await createClient();

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
    const familiesWithRelations: FamilyWithRelations[] = families.map(
      (family) => ({
        ...family,
        categories: categories
          .filter((cat) => cat.family_id === family.id)
          .map((category) => ({
            ...category,
            subcategories: subcategories.filter(
              (sub) => sub.category_id === category.id
            ),
          })),
      })
    );

    return { success: true, data: familiesWithRelations };
  } catch (error) {
    console.error("Error fetching families:", error);
    return {
      success: false,
      error: "Error al cargar las familias",
    };
  }
}

export async function createFamily(
  name: string
): Promise<ActionResponse<Family>> {
  try {
    const validation = familySchema.safeParse({ name });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("families")
      .insert({ name: validation.data.name })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/dashboard/families");

    return { success: true, data };
  } catch (error) {
    console.error("Error creating family:", error);
    return {
      success: false,
      error: "Error al crear la familia",
    };
  }
}

export async function updateFamily(
  id: number,
  name: string
): Promise<ActionResponse<Family>> {
  try {
    const validation = familySchema.safeParse({ name });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("families")
      .update({ name: validation.data.name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/dashboard/families");

    return { success: true, data };
  } catch (error) {
    console.error("Error updating family:", error);
    return {
      success: false,
      error: "Error al actualizar la familia",
    };
  }
}

export async function deleteFamily(id: number): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // Check if family has categories
    const { data: categories } = await supabase
      .from("categories")
      .select("id")
      .eq("family_id", id)
      .limit(1);

    if (categories && categories.length > 0) {
      return {
        success: false,
        error: "No se puede eliminar una familia con categorías",
      };
    }

    const { error } = await supabase.from("families").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/dashboard/families");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting family:", error);
    return {
      success: false,
      error: "Error al eliminar la familia",
    };
  }
}

// ============================================================================
// CATEGORIES CRUD
// ============================================================================

export async function createCategory(
  name: string,
  familyId: number
): Promise<ActionResponse<Category>> {
  try {
    const validation = categorySchema.safeParse({
      name,
      family_id: familyId,
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: validation.data.name, family_id: validation.data.family_id })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/dashboard/families");

    return { success: true, data };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error: "Error al crear la categoría",
    };
  }
}

export async function updateCategory(
  id: number,
  name: string
): Promise<ActionResponse<Category>> {
  try {
    const supabase = await createClient();

    // Get current category to preserve family_id
    const { data: current } = await supabase
      .from("categories")
      .select("family_id")
      .eq("id", id)
      .single();

    if (!current) {
      return { success: false, error: "Categoría no encontrada" };
    }

    const validation = categorySchema.safeParse({
      name,
      family_id: current.family_id,
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const { data, error } = await supabase
      .from("categories")
      .update({ name: validation.data.name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/dashboard/families");

    return { success: true, data };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: "Error al actualizar la categoría",
    };
  }
}

export async function deleteCategory(id: number): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // Check if category has subcategories
    const { data: subcategories } = await supabase
      .from("subcategories")
      .select("id")
      .eq("category_id", id)
      .limit(1);

    if (subcategories && subcategories.length > 0) {
      return {
        success: false,
        error: "No se puede eliminar una categoría con subcategorías",
      };
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/dashboard/families");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: "Error al eliminar la categoría",
    };
  }
}

// ============================================================================
// SUBCATEGORIES CRUD
// ============================================================================

export async function createSubcategory(
  name: string,
  categoryId: number
): Promise<ActionResponse<Subcategory>> {
  try {
    const validation = subcategorySchema.safeParse({
      name,
      category_id: categoryId,
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("subcategories")
      .insert({
        name: validation.data.name,
        category_id: validation.data.category_id,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/dashboard/families");

    return { success: true, data };
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return {
      success: false,
      error: "Error al crear la subcategoría",
    };
  }
}

export async function updateSubcategory(
  id: number,
  name: string
): Promise<ActionResponse<Subcategory>> {
  try {
    const supabase = await createClient();

    // Get current subcategory to preserve category_id
    const { data: current } = await supabase
      .from("subcategories")
      .select("category_id")
      .eq("id", id)
      .single();

    if (!current) {
      return { success: false, error: "Subcategoría no encontrada" };
    }

    const validation = subcategorySchema.safeParse({
      name,
      category_id: current.category_id,
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const { data, error } = await supabase
      .from("subcategories")
      .update({ name: validation.data.name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/dashboard/families");

    return { success: true, data };
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return {
      success: false,
      error: "Error al actualizar la subcategoría",
    };
  }
}

export async function deleteSubcategory(id: number): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // Check if subcategory has products
    const { data: products } = await supabase
      .from("products")
      .select("id")
      .eq("subcategory_id", id)
      .limit(1);

    if (products && products.length > 0) {
      return {
        success: false,
        error: "No se puede eliminar una subcategoría con productos",
      };
    }

    const { error } = await supabase
      .from("subcategories")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/dashboard/families");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return {
      success: false,
      error: "Error al eliminar la subcategoría",
    };
  }
}

// ============================================================================
// OPTIONS CRUD (Global product options like Color, Size, Material)
// ============================================================================

export async function getOptionsWithFeatures(): Promise<
  ActionResponse<OptionWithFeatures[]>
> {
  try {
    const supabase = await createClient();

    const { data: options, error: optionsError } = await supabase
      .from("options")
      .select("*")
      .order("name");

    if (optionsError) throw optionsError;

    const { data: features, error: featuresError } = await supabase
      .from("features")
      .select("*")
      .order("value");

    if (featuresError) throw featuresError;

    const optionsWithFeatures: OptionWithFeatures[] = options.map((option) => ({
      ...option,
      features: features.filter((f) => f.option_id === option.id),
    }));

    return { success: true, data: optionsWithFeatures };
  } catch (error) {
    console.error("Error fetching options:", error);
    return {
      success: false,
      error: "Error al cargar las opciones",
    };
  }
}

export async function createOption(
  name: string
): Promise<ActionResponse<Option>> {
  try {
    const validation = optionSchema.safeParse({ name });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("options")
      .insert({ name: validation.data.name })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/dashboard/products");

    return { success: true, data };
  } catch (error) {
    console.error("Error creating option:", error);
    return {
      success: false,
      error: "Error al crear la opción",
    };
  }
}

export async function updateOption(
  id: number,
  name: string
): Promise<ActionResponse<Option>> {
  try {
    const validation = optionSchema.safeParse({ name });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("options")
      .update({ name: validation.data.name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/dashboard/products");

    return { success: true, data };
  } catch (error) {
    console.error("Error updating option:", error);
    return {
      success: false,
      error: "Error al actualizar la opción",
    };
  }
}

export async function deleteOption(id: number): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // Check if option has features
    const { data: features } = await supabase
      .from("features")
      .select("id")
      .eq("option_id", id)
      .limit(1);

    if (features && features.length > 0) {
      return {
        success: false,
        error: "No se puede eliminar una opción con características",
      };
    }

    const { error } = await supabase.from("options").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/dashboard/products");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting option:", error);
    return {
      success: false,
      error: "Error al eliminar la opción",
    };
  }
}

// ============================================================================
// FEATURES CRUD (Values for options like Red, Blue, S, M, L)
// ============================================================================

export async function createFeature(
  value: string,
  optionId: number
): Promise<ActionResponse<Feature>> {
  try {
    const validation = featureSchema.safeParse({
      value,
      option_id: optionId,
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("features")
      .insert({ value: validation.data.value, option_id: validation.data.option_id })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/dashboard/products");

    return { success: true, data };
  } catch (error) {
    console.error("Error creating feature:", error);
    return {
      success: false,
      error: "Error al crear la característica",
    };
  }
}

export async function updateFeature(
  id: number,
  value: string
): Promise<ActionResponse<Feature>> {
  try {
    const supabase = await createClient();

    // Get current feature to preserve option_id
    const { data: current } = await supabase
      .from("features")
      .select("option_id")
      .eq("id", id)
      .single();

    if (!current) {
      return { success: false, error: "Característica no encontrada" };
    }

    const validation = featureSchema.safeParse({
      value,
      option_id: current.option_id,
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const { data, error } = await supabase
      .from("features")
      .update({ value: validation.data.value })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/dashboard/products");

    return { success: true, data };
  } catch (error) {
    console.error("Error updating feature:", error);
    return {
      success: false,
      error: "Error al actualizar la característica",
    };
  }
}

export async function deleteFeature(id: number): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // Check if feature is used in variant_features
    const { data: variantFeatures } = await supabase
      .from("variant_features")
      .select("id")
      .eq("feature_id", id)
      .limit(1);

    if (variantFeatures && variantFeatures.length > 0) {
      return {
        success: false,
        error: "No se puede eliminar una característica que está en uso",
      };
    }

    const { error } = await supabase.from("features").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/dashboard/products");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting feature:", error);
    return {
      success: false,
      error: "Error al eliminar la característica",
    };
  }
}

// ============================================================================
// PRODUCTS CRUD
// ============================================================================

export async function getProducts(): Promise<
  ActionResponse<ProductWithRelations[]>
> {
  try {
    const supabase = await createClient();

    const { data: products, error } = await supabase
      .from("products")
      .select(`
        *,
        subcategory:subcategories(*)
      `);
      // .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: products as unknown as ProductWithRelations[] };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error: "Error al cargar los productos",
    };
  }
}

export async function getProductById(
  id: number
): Promise<ActionResponse<ProductWithRelations>> {
  try {
    const supabase = await createClient();

    // Get product basic info
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*, subcategory:subcategories(*)")
      .eq("id", id)
      .single();

    if (productError) throw productError;

    // Get product options
    const { data: optionProducts, error: optionsError } = await supabase
      .from("option_products")
      .select("option_id")
      .eq("product_id", id);

    if (optionsError) throw optionsError;

    const optionIds = optionProducts.map((op) => op.option_id);

    let options: OptionWithFeatures[] = [];
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
      .eq("product_id", id);

    if (variantsError) throw variantsError;

    // Get variant features
    const variantsWithFeatures = await Promise.all(
      variants.map(async (variant) => {
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
          features: featuresData.map((f) => ({
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
    console.error("Error fetching product:", error);
    return {
      success: false,
      error: "Error al cargar el producto",
    };
  }
}

export async function createProduct(
  input: ProductCreationInput
): Promise<ActionResponse<Product>> {
  try {
    const validation = productCreationSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const supabase = await createClient();

    // 1. Create product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name: validation.data.basicInfo.name,
        sku: validation.data.basicInfo.sku,
        price: validation.data.basicInfo.price,
        detail: validation.data.basicInfo.detail || null,
        image_path: validation.data.basicInfo.image_path || null,
        subcategory_id: validation.data.basicInfo.subcategory_id,
      })
      .select()
      .single();

    if (productError) throw productError;

    // 2. Create option_products relationships
    if (validation.data.selectedOptions.length > 0) {
      const optionProductsData = validation.data.selectedOptions.map(
        (optionId) => ({
          product_id: product.id,
          option_id: optionId,
        })
      );

      const { error: optionProductsError } = await supabase
        .from("option_products")
        .insert(optionProductsData);

      if (optionProductsError) throw optionProductsError;
    }

    // 3. Create variants
    for (const variantInput of validation.data.variants) {
      const { data: variant, error: variantError } = await supabase
        .from("variants")
        .insert({
          product_id: product.id,
          price: variantInput.price || validation.data.basicInfo.price,
          stock: variantInput.stock || 0,
        })
        .select()
        .single();

      if (variantError) throw variantError;

      // 4. Create variant_features relationships
      if (variantInput.featureIds.length > 0) {
        const variantFeaturesData = variantInput.featureIds.map(
          (featureId) => ({
            variant_id: variant.id,
            feature_id: featureId,
          })
        );

        const { error: variantFeaturesError } = await supabase
          .from("variant_features")
          .insert(variantFeaturesData);

        if (variantFeaturesError) throw variantFeaturesError;
      }
    }

    revalidatePath("/admin/dashboard/products");

    return { success: true, data: product };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: "Error al crear el producto",
    };
  }
}

export async function deleteProduct(id: number): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // Get all variants for this product
    const { data: variants } = await supabase
      .from("variants")
      .select("id")
      .eq("product_id", id);

    if (variants && variants.length > 0) {
      const variantIds = variants.map((v) => v.id);

      // Delete variant_features
      const { error: vfError } = await supabase
        .from("variant_features")
        .delete()
        .in("variant_id", variantIds);

      if (vfError) throw vfError;

      // Delete variants
      const { error: variantsError } = await supabase
        .from("variants")
        .delete()
        .eq("product_id", id);

      if (variantsError) throw variantsError;
    }

    // Delete option_products
    const { error: opError } = await supabase
      .from("option_products")
      .delete()
      .eq("product_id", id);

    if (opError) throw opError;

    // Delete product
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/dashboard/products");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: "Error al eliminar el producto",
    };
  }
}
