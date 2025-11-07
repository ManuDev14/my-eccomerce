import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFamilyStats } from "@/lib/actions/dashboard";
import { FolderTree, Package } from "lucide-react";

export async function FamilyStats() {
  const families = await getFamilyStats();

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderTree className="h-5 w-5" />
          Family Statistics
        </CardTitle>
        <CardDescription>Product families overview</CardDescription>
      </CardHeader>
      <CardContent>
        {families.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No families found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {families.map((family) => (
              <div
                key={family.familyName}
                className="flex flex-col gap-2 p-3 rounded-lg border bg-card"
              >
                <p className="font-medium">{family.familyName}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">
                      {family.categoryCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Categories</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">
                      {family.productCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">
                      ${(family.totalValue / 1000).toFixed(1)}k
                    </p>
                    <p className="text-xs text-muted-foreground">Value</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
