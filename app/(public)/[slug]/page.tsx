import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/actions/products";
import {
  generateProductTitle,
  generateProductDescription,
  generateProductJsonLd,
} from "@/lib/utils/seo";
import { generateProductSlug } from "@/lib/utils/slug";
import { ProductDetailClient } from "@/components/features/products/ProductDetailClient";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const result = await getProductBySlug(params.slug);

  if (!result.success) {
    return {
      title: "Producto no encontrado",
      description: "El producto que buscas no está disponible",
    };
  }

  const product = result.data;
  const title = generateProductTitle(product.name, product.price);
  const description = generateProductDescription(product.name, product.detail, product.price);

  // Get base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const productUrl = `${baseUrl}/${params.slug}`;
  const imageUrl = product.image_path
    ? `${baseUrl}${product.image_path}`
    : `${baseUrl}/placeholder-product.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: productUrl,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const result = await getProductBySlug(params.slug);

  if (!result.success) {
    notFound();
  }

  const product = result.data;

  // Build breadcrumb items
  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
  ];

  if (product.subcategory) {
    const subcategory = product.subcategory as any;
    if (subcategory.category?.family) {
      breadcrumbItems.push({
        label: subcategory.category.family.name,
        href: `/?familia=${subcategory.category.family.id}`,
      });
    }
    if (subcategory.category) {
      breadcrumbItems.push({
        label: subcategory.category.name,
        href: `/?categoria=${subcategory.category.id}`,
      });
    }
    breadcrumbItems.push({
      label: subcategory.name,
      href: `/?subcategoria=${subcategory.id}`,
    });
  }

  breadcrumbItems.push({ label: product.name, href: "" });

  // Generate JSON-LD for SEO
  const jsonLd = generateProductJsonLd({
    name: product.name,
    description: product.detail,
    price: product.price,
    sku: product.sku,
    image_path: product.image_path,
    url: `/${generateProductSlug(product.name, product.id)}`,
  });

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mt-6">
          <ProductDetailClient product={product} />
        </div>
      </div>
    </>
  );
}
