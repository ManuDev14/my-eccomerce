import { getProducts, getOptionsWithFeatures, getFamiliesWithRelations } from "@/lib/actions/catalog";
import { ProductsClient } from "@/components/features/catalog/products-client";

export default async function ProductsPage() {
  const [productsResult, optionsResult, familiesResult] = await Promise.all([
    getProducts(),
    getOptionsWithFeatures(),
    getFamiliesWithRelations(),
  ]);

  const products = productsResult.success ? productsResult.data : [];
  const options = optionsResult.success ? optionsResult.data : [];
  const families = familiesResult.success ? familiesResult.data : [];

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Productos</h2>
      </div>
      <ProductsClient products={products} options={options} families={families} />
    </div>
  );
}
