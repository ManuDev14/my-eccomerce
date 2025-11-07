"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productBasicInfoSchema, type ProductBasicInfoInput } from "@/lib/validations/catalog";
import type { FamilyWithRelations } from "@/types/catalog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface ProductBasicInfoStepProps {
  families: FamilyWithRelations[];
  initialData?: ProductBasicInfoInput;
  onDataChange: (data: ProductBasicInfoInput) => void;
}

export function ProductBasicInfoStep({
  families,
  initialData,
  onDataChange,
}: ProductBasicInfoStepProps) {
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(
    initialData?.subcategory_id ? getInitialFamilyId() : null
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    initialData?.subcategory_id ? getInitialCategoryId() : null
  );

  function getInitialFamilyId(): number | null {
    if (!initialData?.subcategory_id) return null;
    for (const family of families) {
      for (const category of family.categories) {
        if (category.subcategories.some((sub) => sub.id === initialData.subcategory_id)) {
          return family.id;
        }
      }
    }
    return null;
  }

  function getInitialCategoryId(): number | null {
    if (!initialData?.subcategory_id) return null;
    for (const family of families) {
      for (const category of family.categories) {
        if (category.subcategories.some((sub) => sub.id === initialData.subcategory_id)) {
          return category.id;
        }
      }
    }
    return null;
  }

  const form = useForm<ProductBasicInfoInput>({
    resolver: zodResolver(productBasicInfoSchema),
    defaultValues: initialData || {
      name: "",
      sku: "",
      price: 0,
      detail: "",
      image_path: "",
      subcategory_id: 0,
    },
  });

  const selectedFamily = families.find((f) => f.id === selectedFamilyId);
  const selectedCategory = selectedFamily?.categories.find(
    (c) => c.id === selectedCategoryId
  );

  // Watch form values and update parent on change
  const watchedValues = form.watch();

  // Update parent component when form values change
  form.watch((values) => {
    if (values as ProductBasicInfoInput) {
      onDataChange(values as ProductBasicInfoInput);
    }
  });

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Producto</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Camiseta Deportiva" {...field} />
                </FormControl>
                <FormDescription>
                  Nombre descriptivo del producto
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SKU */}
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: TSHIRT-001"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormDescription>
                  Código único del producto (mayúsculas, números, guiones)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Base</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Precio de referencia (puede variar por variante)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image Path */}
          <FormField
            control={form.control}
            name="image_path"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de Imagen (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    {...field}
                  />
                </FormControl>
                <FormDescription>URL de la imagen del producto</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Detail */}
        <FormField
          control={form.control}
          name="detail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción detallada del producto..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Información adicional sobre el producto
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Categorización</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Family */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Familia</label>
              <Select
                value={selectedFamilyId?.toString() || ""}
                onValueChange={(value) => {
                  setSelectedFamilyId(parseInt(value));
                  setSelectedCategoryId(null);
                  form.setValue("subcategory_id", 0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar familia" />
                </SelectTrigger>
                <SelectContent>
                  {families.map((family) => (
                    <SelectItem key={family.id} value={family.id.toString()}>
                      {family.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <Select
                value={selectedCategoryId?.toString() || ""}
                onValueChange={(value) => {
                  setSelectedCategoryId(parseInt(value));
                  form.setValue("subcategory_id", 0);
                }}
                disabled={!selectedFamilyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {selectedFamily?.categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            <FormField
              control={form.control}
              name="subcategory_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategoría</FormLabel>
                  <Select
                    value={field.value?.toString() || ""}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    disabled={!selectedCategoryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar subcategoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory?.subcategories.map((subcategory) => (
                        <SelectItem
                          key={subcategory.id}
                          value={subcategory.id.toString()}
                        >
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
