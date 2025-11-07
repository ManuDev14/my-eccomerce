import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { generateProductSlug } from "@/lib/utils/slug";
import type { PublicProduct } from "@/types/catalog";

interface ProductCardProps {
  product: PublicProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const slug = generateProductSlug(product.name, product.id);
  const hasMultipleVariants = product.variantCount > 1;
  const showPriceRange =
    hasMultipleVariants && product.minPrice !== product.maxPrice;

  return (
    <Link href={`/${slug}`}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg group">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image_path ? (
            <Image
              src={product.image_path}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
              <span className="text-sm">Sin imagen</span>
            </div>
          )}

          {/* Stock badge */}
          <div className="absolute top-2 right-2">
            {product.hasStock ? (
              <Badge variant="secondary" className="bg-green-500 text-white">
                En stock
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-500 text-white">
                Agotado
              </Badge>
            )}
          </div>

          {/* Variants badge */}
          {hasMultipleVariants && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary">
                {product.variantCount} variantes
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {product.subcategory.name}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          {showPriceRange ? (
            <PriceDisplay
              price={product.price}
              minPrice={product.minPrice}
              maxPrice={product.maxPrice}
              showRange={true}
            />
          ) : (
            <PriceDisplay price={product.price} />
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
