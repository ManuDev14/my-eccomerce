"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProductsList } from "./ProductsList";
import { FiltersPanel } from "./FiltersPanel";
import { InfiniteScrollTrigger } from "./InfiniteScrollTrigger";
import { getPublicProducts } from "@/lib/actions/products";
import type { PublicProduct, FiltersData, ProductFilters } from "@/types/catalog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface ProductsClientProps {
  initialProducts: PublicProduct[];
  filtersData: FiltersData;
  initialFilters: ProductFilters;
}

const PRODUCTS_PER_PAGE = 20;

export function ProductsClient({
  initialProducts,
  filtersData,
  initialFilters,
}: ProductsClientProps) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<PublicProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialProducts.length === PRODUCTS_PER_PAGE);
  const [offset, setOffset] = useState(PRODUCTS_PER_PAGE);

  // Parse current filters from URL
  const currentFilters: ProductFilters = {
    familyId: searchParams.get("familia") ? parseInt(searchParams.get("familia")!) : undefined,
    categoryId: searchParams.get("categoria")
      ? parseInt(searchParams.get("categoria")!)
      : undefined,
    subcategoryId: searchParams.get("subcategoria")
      ? parseInt(searchParams.get("subcategoria")!)
      : undefined,
    minPrice: searchParams.get("precioMin")
      ? parseFloat(searchParams.get("precioMin")!)
      : undefined,
    maxPrice: searchParams.get("precioMax")
      ? parseFloat(searchParams.get("precioMax")!)
      : undefined,
  };

  // Reset products when filters change
  useEffect(() => {
    setProducts(initialProducts);
    setOffset(PRODUCTS_PER_PAGE);
    setHasMore(initialProducts.length === PRODUCTS_PER_PAGE);
  }, [searchParams, initialProducts]);

  // Load more products
  const loadMoreProducts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const result = await getPublicProducts({
        ...currentFilters,
        offset,
        limit: PRODUCTS_PER_PAGE,
      });

      if (result.success) {
        const newProducts = result.data;
        setProducts((prev) => [...prev, ...newProducts]);
        setOffset((prev) => prev + PRODUCTS_PER_PAGE);
        setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <div className="py-4">
              <FiltersPanel filtersData={filtersData} currentFilters={currentFilters} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop filters */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-4">
          <FiltersPanel filtersData={filtersData} currentFilters={currentFilters} />
        </div>
      </aside>

      {/* Products list */}
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "producto" : "productos"}{" "}
            {hasMore && "mostrados"}
          </p>
        </div>

        <ProductsList products={products} />

        <InfiniteScrollTrigger
          onLoadMore={loadMoreProducts}
          loading={loading}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
}

