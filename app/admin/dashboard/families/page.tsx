import { getFamiliesWithRelations } from "@/lib/actions/catalog";
import { CatalogTree } from "@/components/features/catalog/CatalogTree";

export default async function FamiliesPage() {
  const result = await getFamiliesWithRelations();

  if (!result.success) {
    return (
      <div className="p-4">
        <div className="text-red-500">Error: {result.error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <CatalogTree initialFamilies={result.data} />
    </div>
  );
}
