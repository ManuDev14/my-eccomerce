"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import type { OptionWithFeatures, VariantWithFeatures } from "@/types/catalog";

interface VariantSelectorProps {
  options: OptionWithFeatures[];
  variants: VariantWithFeatures[];
  basePrice: number;
  onVariantChange?: (variant: VariantWithFeatures | null) => void;
}

export function VariantSelector({
  options,
  variants,
  basePrice,
  onVariantChange,
}: VariantSelectorProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<Record<number, number>>({});
  const [selectedVariant, setSelectedVariant] = useState<VariantWithFeatures | null>(null);

  // Find matching variant based on selected features
  useEffect(() => {
    const selectedFeatureIds = Object.values(selectedFeatures);

    if (selectedFeatureIds.length === 0) {
      setSelectedVariant(null);
      onVariantChange?.(null);
      return;
    }

    // Check if all options have been selected
    if (selectedFeatureIds.length !== options.length) {
      setSelectedVariant(null);
      onVariantChange?.(null);
      return;
    }

    // Find variant that matches all selected features
    const matchingVariant = variants.find((variant) => {
      const variantFeatureIds = variant.features?.map((f) => f.id) || [];

      // Check if variant has all selected features
      return (
        selectedFeatureIds.every((id) => variantFeatureIds.includes(id)) &&
        variantFeatureIds.length === selectedFeatureIds.length
      );
    });

    setSelectedVariant(matchingVariant || null);
    onVariantChange?.(matchingVariant || null);
  }, [selectedFeatures, variants, options.length, onVariantChange]);

  const handleFeatureSelect = (optionId: number, featureId: number) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [optionId]: featureId,
    }));
  };

  // Check if a feature combination is available
  const isFeatureAvailable = (optionId: number, featureId: number): boolean => {
    // Create temporary selection with this feature
    const tempSelection = {
      ...selectedFeatures,
      [optionId]: featureId,
    };

    const tempSelectedIds = Object.values(tempSelection);

    // Check if there's any variant that includes all these features
    return variants.some((variant) => {
      const variantFeatureIds = variant.features?.map((f) => f.id) || [];
      return tempSelectedIds.every((id) => variantFeatureIds.includes(id));
    });
  };

  if (options.length === 0 || variants.length === 0) {
    return null;
  }

  const currentPrice = selectedVariant?.price ?? basePrice;
  const currentStock = selectedVariant?.stock ?? 0;
  const hasStock = currentStock > 0;

  return (
    <div className="space-y-6">
      {/* Options selection */}
      {options.map((option) => (
        <div key={option.id} className="space-y-3">
          <Label className="text-base font-semibold">{option.name}</Label>
          <div className="flex flex-wrap gap-2">
            {option.features.map((feature) => {
              const isSelected = selectedFeatures[option.id] === feature.id;
              const isAvailable = isFeatureAvailable(option.id, feature.id);

              return (
                <Button
                  key={feature.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFeatureSelect(option.id, feature.id)}
                  disabled={!isAvailable}
                  className="min-w-[60px]"
                >
                  {feature.value}
                </Button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Price and stock display */}
      <div className="space-y-4 pt-4 border-t">
        <PriceDisplay price={currentPrice} className="text-3xl" />

        {selectedVariant && (
          <div className="flex items-center gap-2">
            {hasStock ? (
              <>
                <Badge variant="secondary" className="bg-green-500 text-white">
                  En stock
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {currentStock} {currentStock === 1 ? "unidad" : "unidades"} disponibles
                </span>
              </>
            ) : (
              <Badge variant="secondary" className="bg-red-500 text-white">
                Agotado
              </Badge>
            )}
          </div>
        )}

        {!selectedVariant && options.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Selecciona todas las opciones para ver disponibilidad
          </p>
        )}
      </div>
    </div>
  );
}

