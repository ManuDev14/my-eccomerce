import { z } from "zod";

// Family validation schema
export const familySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
});

export type FamilyInput = z.infer<typeof familySchema>;

// Category validation schema
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  family_id: z.number().positive("Debe seleccionar una familia"),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// Subcategory validation schema
export const subcategorySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  category_id: z.number().positive("Debe seleccionar una categoría"),
});

export type SubcategoryInput = z.infer<typeof subcategorySchema>;

// Option validation schema (global options like "Color", "Size")
export const optionSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
});

export type OptionInput = z.infer<typeof optionSchema>;

// Feature validation schema (values for options like "Red", "Blue" for Color)
export const featureSchema = z.object({
  value: z
    .string()
    .min(1, "El valor es requerido")
    .max(50, "El valor no puede exceder 50 caracteres"),
  option_id: z.number().positive("Debe seleccionar una opción"),
});

export type FeatureInput = z.infer<typeof featureSchema>;

// Product validation schema - Step 1: Basic Information
export const productBasicInfoSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200, "El nombre no puede exceder 200 caracteres"),
  sku: z
    .string()
    .min(1, "El SKU es requerido")
    .max(50, "El SKU no puede exceder 50 caracteres")
    .regex(/^[A-Z0-9-_]+$/, "El SKU solo puede contener letras mayúsculas, números, guiones y guiones bajos"),
  price: z
    .number()
    .positive("El precio debe ser mayor a 0")
    .max(999999.99, "El precio no puede exceder 999,999.99"),
  detail: z.string().max(1000, "Los detalles no pueden exceder 1000 caracteres").optional(),
  image_path: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  subcategory_id: z.number().positive("Debe seleccionar una subcategoría"),
});

export type ProductBasicInfoInput = z.infer<typeof productBasicInfoSchema>;

// Product Options schema - Step 2: Select Options
export const productOptionsSchema = z.object({
  selectedOptions: z
    .array(z.number().positive())
    .min(1, "Debe seleccionar al menos una opción para crear variantes"),
});

export type ProductOptionsInput = z.infer<typeof productOptionsSchema>;

// Variant schema - Step 3: Create Variants
export const variantSchema = z.object({
  featureIds: z
    .array(z.number().positive())
    .min(1, "Debe seleccionar al menos una característica"),
  price: z
    .number()
    .positive("El precio debe ser mayor a 0")
    .max(999999.99, "El precio no puede exceder 999,999.99")
    .optional(),
  stock: z
    .number()
    .int("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo")
    .optional(),
});

export type VariantInput = z.infer<typeof variantSchema>;

// Complete product creation schema
export const productCreationSchema = z.object({
  basicInfo: productBasicInfoSchema,
  selectedOptions: z.array(z.number().positive()),
  variants: z
    .array(variantSchema)
    .min(1, "Debe crear al menos una variante"),
});

export type ProductCreationInput = z.infer<typeof productCreationSchema>;
