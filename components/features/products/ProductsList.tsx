import { ProductCard } from "./ProductCard";
import type { PublicProduct } from "@/types/catalog";

interface ProductsListProps {
  products: PublicProduct[];
}

export function ProductsList({ products }: ProductsListProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-muted-foreground mb-2">No se encontraron productos</p>
        <p className="text-sm text-muted-foreground">
          Intenta ajustar los filtros o busca otra categoría
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

