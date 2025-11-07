import { ProductsListSkeleton } from "@/components/features/products/ProductsListSkeleton";

export default function HomeLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-10 w-64 bg-muted animate-pulse rounded-md mb-2" />
        <div className="h-5 w-96 bg-muted animate-pulse rounded-md" />
      </div>

      <ProductsListSkeleton />
    </div>
  );
}
