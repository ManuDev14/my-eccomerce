"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/utils/seo";
import type { FiltersData, ProductFilters } from "@/types/catalog";

interface FiltersPanelProps {
  filtersData: FiltersData;
  currentFilters: ProductFilters;
}

export function FiltersPanel({ filtersData, currentFilters }: FiltersPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState<[number, number]>([
    currentFilters.minPrice ?? filtersData.priceRange.min,
    currentFilters.maxPrice ?? filtersData.priceRange.max,
  ]);

  // Update URL with new filters
  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const params = new URLSearchParams();

    // Add new filters
    const mergedFilters = { ...currentFilters, ...newFilters };

    if (mergedFilters.familyId) {
      params.set("familia", String(mergedFilters.familyId));
    }
    if (mergedFilters.categoryId) {
      params.set("categoria", String(mergedFilters.categoryId));
    }
    if (mergedFilters.subcategoryId) {
      params.set("subcategoria", String(mergedFilters.subcategoryId));
    }
    if (mergedFilters.minPrice !== undefined && mergedFilters.minPrice !== filtersData.priceRange.min) {
      params.set("precioMin", String(mergedFilters.minPrice));
    }
    if (mergedFilters.maxPrice !== undefined && mergedFilters.maxPrice !== filtersData.priceRange.max) {
      params.set("precioMax", String(mergedFilters.maxPrice));
    }

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/");
  };

  // Clear all filters
  const clearFilters = () => {
    router.push("/");
  };

  // Apply price filter
  const applyPriceFilter = () => {
    updateFilters({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    currentFilters.familyId ||
    currentFilters.categoryId ||
    currentFilters.subcategoryId ||
    currentFilters.minPrice !== undefined ||
    currentFilters.maxPrice !== undefined;

  return (
    <div className="space-y-4">
      {/* Clear filters button */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Filtros activos</span>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
      )}

      <Separator />

      {/* Price range filter */}
      <div className="space-y-4">
        <h3 className="font-semibold">Rango de precio</h3>
        <div className="space-y-4">
          <Slider
            min={filtersData.priceRange.min}
            max={filtersData.priceRange.max}
            step={1}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="py-4"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatPrice(priceRange[0])}
            </span>
            <span className="text-muted-foreground">
              {formatPrice(priceRange[1])}
            </span>
          </div>
          <Button
            onClick={applyPriceFilter}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            Aplicar
          </Button>
        </div>
      </div>

      <Separator />

      {/* Category filters */}
      <div className="space-y-2">
        <h3 className="font-semibold">Categorías</h3>
        <Accordion type="single" collapsible className="w-full">
          {filtersData.families.map((family) => (
            <AccordionItem key={family.id} value={`family-${family.id}`}>
              <AccordionTrigger className="text-sm hover:no-underline">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateFilters({
                      familyId: family.id,
                      categoryId: undefined,
                      subcategoryId: undefined,
                    });
                  }}
                  className={`text-left hover:underline ${
                    currentFilters.familyId === family.id &&
                    !currentFilters.categoryId
                      ? "font-semibold text-primary"
                      : ""
                  }`}
                >
                  {family.name}
                </button>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-4 space-y-1">
                  {family.categories.map((category) => (
                    <div key={category.id}>
                      <button
                        onClick={() =>
                          updateFilters({
                            familyId: family.id,
                            categoryId: category.id,
                            subcategoryId: undefined,
                          })
                        }
                        className={`text-sm py-1 hover:underline ${
                          currentFilters.categoryId === category.id &&
                          !currentFilters.subcategoryId
                            ? "font-semibold text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {category.name}
                      </button>
                      {category.subcategories.length > 0 && (
                        <div className="pl-4 space-y-1">
                          {category.subcategories.map((subcategory) => (
                            <button
                              key={subcategory.id}
                              onClick={() =>
                                updateFilters({
                                  familyId: family.id,
                                  categoryId: category.id,
                                  subcategoryId: subcategory.id,
                                })
                              }
                              className={`text-sm py-1 block hover:underline ${
                                currentFilters.subcategoryId === subcategory.id
                                  ? "font-semibold text-primary"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {subcategory.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

