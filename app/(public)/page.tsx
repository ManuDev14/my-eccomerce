import { Metadata } from "next";
import { Suspense } from "react";
import { getPublicProducts, getFiltersData } from "@/lib/actions/products";
import { generateProductsTitle, generateProductsDescription } from "@/lib/utils/seo";
import { ProductsClient } from "@/components/features/products/ProductsClient";
import { ProductsListSkeleton } from "@/components/features/products/ProductsListSkeleton";

// Force dynamic rendering for search params
export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: {
    familia?: string;
    categoria?: string;
    subcategoria?: string;
    precioMin?: string;
    precioMax?: string;
  };
}

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  // Parse filters
  const familyId = searchParams.familia ? parseInt(searchParams.familia) : undefined;
  const categoryId = searchParams.categoria ? parseInt(searchParams.categoria) : undefined;
  const subcategoryId = searchParams.subcategoria
    ? parseInt(searchParams.subcategoria)
    : undefined;

  // Get filters data to generate proper titles
  const filtersResult = await getFiltersData();
  const filtersData = filtersResult.success ? filtersResult.data : null;

  let familyName: string | undefined;
  let categoryName: string | undefined;
  let subcategoryName: string | undefined;

  if (filtersData && subcategoryId) {
    // Find subcategory name
    for (const family of filtersData.families) {
      for (const category of family.categories) {
        const subcategory = category.subcategories.find((s) => s.id === subcategoryId);
        if (subcategory) {
          subcategoryName = subcategory.name;
          categoryName = category.name;
          familyName = family.name;
          break;
        }
      }
      if (subcategoryName) break;
    }
  } else if (filtersData && categoryId) {
    // Find category name
    for (const family of filtersData.families) {
      const category = family.categories.find((c) => c.id === categoryId);
      if (category) {
        categoryName = category.name;
        familyName = family.name;
        break;
      }
    }
  } else if (filtersData && familyId) {
    // Find family name
    const family = filtersData.families.find((f) => f.id === familyId);
    if (family) {
      familyName = family.name;
    }
  }

  const title = generateProductsTitle({ familyName, categoryName, subcategoryName });
  const description = generateProductsDescription({
    familyName,
    categoryName,
    subcategoryName,
  });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Parse filters from URL
  const filters = {
    familyId: searchParams.familia ? parseInt(searchParams.familia) : undefined,
    categoryId: searchParams.categoria ? parseInt(searchParams.categoria) : undefined,
    subcategoryId: searchParams.subcategoria ? parseInt(searchParams.subcategoria) : undefined,
    minPrice: searchParams.precioMin ? parseFloat(searchParams.precioMin) : undefined,
    maxPrice: searchParams.precioMax ? parseFloat(searchParams.precioMax) : undefined,
  };

  // Get initial products (first 20)
  const productsResult = await getPublicProducts({
    ...filters,
    offset: 0,
    limit: 20,
  });

  const initialProducts = productsResult.success ? productsResult.data : [];

  // Get filters data
  const filtersResult = await getFiltersData();
  const filtersData = filtersResult.success ? filtersResult.data : null;

  if (!filtersData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error al cargar productos</h1>
          <p className="text-muted-foreground">
            No pudimos cargar el catálogo. Por favor, intenta de nuevo más tarde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Catálogo de Productos</h1>
        <p className="text-muted-foreground">
          Explora nuestra selección de productos de calidad
        </p>
      </div>

      <Suspense fallback={<ProductsListSkeleton />}>
        <ProductsClient
          initialProducts={initialProducts}
          filtersData={filtersData}
          initialFilters={filters}
        />
      </Suspense>
    </div>
  );
}
