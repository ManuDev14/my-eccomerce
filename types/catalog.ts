import { Tables } from "./supabase";

// Base types from database
export type Family = Tables<"families">;
export type Category = Tables<"categories">;
export type Subcategory = Tables<"subcategories">;
export type Product = Tables<"products">;
export type Option = Tables<"options">;
export type Feature = Tables<"features">;
export type OptionProduct = Tables<"option_products">;
export type Variant = Tables<"variants">;
export type VariantFeature = Tables<"variant_features">;

// Hierarchical structure types
export type SubcategoryWithRelations = Subcategory;

export type CategoryWithRelations = Category & {
  subcategories: SubcategoryWithRelations[];
};

export type FamilyWithRelations = Family & {
  categories: CategoryWithRelations[];
};

// Product types with relations
export type FeatureWithOption = Feature & {
  option: Option;
};

export type OptionWithFeatures = Option & {
  features: Feature[];
};

export type VariantWithFeatures = Variant & {
  features: FeatureWithOption[];
};

export type ProductWithRelations = Product & {
  subcategory?: Subcategory;
  options?: OptionWithFeatures[];
  variants?: VariantWithFeatures[];
};

// Form data types for product creation
export type ProductFormData = {
  // Step 1: Basic info
  name: string;
  sku: string;
  price: number;
  detail?: string;
  image_path?: string;
  subcategory_id: number;

  // Step 2: Options
  selectedOptions: number[]; // option_ids

  // Step 3: Variants
  variants: {
    featureIds: number[]; // combination of feature_ids
    price?: number;
    stock?: number;
  }[];
};

// Helper type for variant creation
export type VariantCreationData = {
  features: FeatureWithOption[];
  price?: number;
  stock?: number;
};

// Filters for public product search
export type ProductFilters = {
  familyId?: number;
  categoryId?: number;
  subcategoryId?: number;
  minPrice?: number;
  maxPrice?: number;
};

// Public product with extended information for listing
export type PublicProduct = Product & {
  subcategory: Subcategory & {
    category: Category & {
      family: Family;
    };
  };
  variantCount: number;
  minPrice: number;
  maxPrice: number;
  hasStock: boolean;
};

// Filters data for UI
export type FiltersData = {
  families: FamilyWithRelations[];
  priceRange: {
    min: number;
    max: number;
  };
};

// Action response types
export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
