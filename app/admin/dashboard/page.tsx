import { Suspense } from "react";
import type { Metadata } from "next";
import { OverviewStats } from "@/components/features/dashboard/e-commerce/overview-stats";
import { TopProducts } from "@/components/features/dashboard/e-commerce/top-products";
import { CategoryStats } from "@/components/features/dashboard/e-commerce/category-stats";
import { FamilyStats } from "@/components/features/dashboard/e-commerce/family-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "E-commerce analytics dashboard with product catalog overview, inventory stats, and category insights.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">E-commerce Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your product catalog, inventory and sales
        </p>
      </div>

      {/* Overview Statistics */}
      <Suspense fallback={<OverviewStatsSkeleton />}>
        <OverviewStats />
      </Suspense>

      {/* Second Row: Top Products and Family Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<CardSkeleton />}>
            <TopProducts />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <Suspense fallback={<CardSkeleton />}>
            <FamilyStats />
          </Suspense>
        </div>
      </div>

      {/* Third Row: Category Statistics */}
      <div className="grid gap-6">
        <Suspense fallback={<CardSkeleton />}>
          <CategoryStats />
        </Suspense>
      </div>
    </div>
  );
}

// Loading Skeletons
function OverviewStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
