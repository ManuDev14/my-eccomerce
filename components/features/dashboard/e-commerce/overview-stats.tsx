import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/actions/dashboard";
import {
  Package,
  Layers,
  TrendingUp,
  DollarSign,
  FolderTree,
  Grid3x3,
  AlertTriangle,
  XCircle,
} from "lucide-react";

export async function OverviewStats() {
  const stats = await getDashboardStats();

  const cards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      description: "Products in catalog",
      trend: null,
    },
    {
      title: "Total Variants",
      value: stats.totalVariants,
      icon: Layers,
      description: "Product variations",
      trend: null,
    },
    {
      title: "Total Stock",
      value: stats.totalStock.toLocaleString(),
      icon: TrendingUp,
      description: "Units available",
      trend: null,
    },
    {
      title: "Inventory Value",
      value: `$${stats.totalInventoryValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      description: "Total inventory worth",
      trend: null,
    },
    {
      title: "Product Families",
      value: stats.totalFamilies,
      icon: FolderTree,
      description: "Main categories",
      trend: null,
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      icon: Grid3x3,
      description: "Product categories",
      trend: null,
    },
    {
      title: "Low Stock Alert",
      value: stats.lowStockCount,
      icon: AlertTriangle,
      description: "Products < 10 units",
      trend: "warning",
    },
    {
      title: "Out of Stock",
      value: stats.outOfStockCount,
      icon: XCircle,
      description: "Products unavailable",
      trend: "danger",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon
                className={`h-4 w-4 ${
                  card.trend === "warning"
                    ? "text-yellow-600"
                    : card.trend === "danger"
                    ? "text-red-600"
                    : "text-muted-foreground"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  card.trend === "warning"
                    ? "text-yellow-600"
                    : card.trend === "danger"
                    ? "text-red-600"
                    : ""
                }`}
              >
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
