"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VariantSelector } from "./VariantSelector";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { ShoppingCart, Package } from "lucide-react";
import type { ProductWithRelations, VariantWithFeatures } from "@/types/catalog";

interface ProductDetailClientProps {
  product: ProductWithRelations;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<VariantWithFeatures | null>(null);

  const options = product.options || [];
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  // Calculate total stock
  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  const hasStock = totalStock > 0 || (!hasVariants && true); // Products without variants are always in stock

  // Get subcategory hierarchy for display
  const subcategory = product.subcategory as any;
  const categoryName = subcategory?.category?.name;
  const familyName = subcategory?.category?.family?.name;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* Product image */}
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <div className="relative aspect-square bg-muted">
            {product.image_path ? (
              <Image
                src={product.image_path}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                <Package className="h-24 w-24" />
              </div>
            )}
          </div>
        </Card>

        {/* Additional info card */}
        <Card className="p-4 bg-muted/50">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">SKU:</span>
              <span className="font-medium">{product.sku}</span>
            </div>
            {familyName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Familia:</span>
                <span className="font-medium">{familyName}</span>
              </div>
            )}
            {categoryName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoría:</span>
                <span className="font-medium">{categoryName}</span>
              </div>
            )}
            {subcategory && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subcategoría:</span>
                <span className="font-medium">{subcategory.name}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Product details */}
      <div className="space-y-6">
        {/* Title and price */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{product.name}</h1>
          
          {!hasVariants && (
            <div className="flex items-center gap-4">
              <PriceDisplay price={product.price} className="text-3xl" />
              {hasStock ? (
                <Badge variant="secondary" className="bg-green-500 text-white">
                  En stock
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-500 text-white">
                  Agotado
                </Badge>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Description */}
        {product.detail && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Descripción</h2>
            <p className="text-muted-foreground leading-relaxed">{product.detail}</p>
          </div>
        )}

        {/* Variant selector */}
        {hasVariants && options.length > 0 && (
          <>
            <Separator />
            <VariantSelector
              options={options}
              variants={variants}
              basePrice={product.price}
              onVariantChange={setSelectedVariant}
            />
          </>
        )}

        <Separator />

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full"
            disabled={
              !hasStock ||
              (hasVariants && options.length > 0 && !selectedVariant) ||
              (selectedVariant && (selectedVariant.stock || 0) <= 0)
            }
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Añadir al carrito
          </Button>

          {hasVariants && options.length > 0 && !selectedVariant && (
            <p className="text-sm text-center text-muted-foreground">
              Selecciona todas las opciones para continuar
            </p>
          )}
        </div>

        {/* Stock info for products without variants */}
        {!hasVariants && variants.length > 0 && (
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stock disponible:</span>
              <span className="font-semibold">
                {totalStock} {totalStock === 1 ? "unidad" : "unidades"}
              </span>
            </div>
          </Card>
        )}

        {/* Shipping info */}
        <Card className="p-4 border-2 border-primary/20">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Información de envío
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Envío gratis en pedidos superiores a 50€</li>
              <li>• Entrega en 3-5 días laborables</li>
              <li>• Devoluciones gratuitas en 30 días</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

