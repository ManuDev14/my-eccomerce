import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryStats } from "@/lib/actions/dashboard";
import { Grid3x3, Package } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export async function CategoryStats() {
  const categories = await getCategoryStats();

  // Find max values for progress bars
  const maxProducts = Math.max(...categories.map((c) => c.productCount), 1);
  const maxStock = Math.max(...categories.map((c) => c.totalStock), 1);

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3x3 className="h-5 w-5" />
          Category Statistics
        </CardTitle>
        <CardDescription>Products and stock by category</CardDescription>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No categories found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.slice(0, 6).map((category) => (
              <div key={category.categoryName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{category.categoryName}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>{category.productCount} products</span>
                      <span>•</span>
                      <span>{category.totalStock} units</span>
                      <span>•</span>
                      <span>Avg: ${category.averagePrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Products</span>
                      <span>{category.productCount}</span>
                    </div>
                    <Progress
                      value={(category.productCount / maxProducts) * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Stock</span>
                      <span>{category.totalStock}</span>
                    </div>
                    <Progress
                      value={(category.totalStock / maxStock) * 100}
                      className="h-2"
                    />
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
