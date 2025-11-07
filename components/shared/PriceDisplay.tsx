import { formatPrice, formatPriceRange } from "@/lib/utils/seo";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  className?: string;
  showRange?: boolean;
}

export function PriceDisplay({
  price,
  originalPrice,
  minPrice,
  maxPrice,
  className,
  showRange = false,
}: PriceDisplayProps) {
  // Show price range if min and max are provided and different
  if (showRange && minPrice !== undefined && maxPrice !== undefined && minPrice !== maxPrice) {
    return (
      <div className={cn("flex items-baseline gap-2", className)}>
        <span className="text-2xl font-bold">{formatPriceRange(minPrice, maxPrice)}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="text-2xl font-bold">{formatPrice(price)}</span>
      {originalPrice && originalPrice > price && (
        <span className="text-lg text-muted-foreground line-through">
          {formatPrice(originalPrice)}
        </span>
      )}
    </div>
  );
}

