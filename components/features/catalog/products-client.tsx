"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCreationWizard } from "./product-creation-wizard";
import { ProductsTable } from "./products-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createProduct } from "@/lib/actions/catalog";
import { toast } from "sonner";
import type { ProductWithRelations, OptionWithFeatures, FamilyWithRelations } from "@/types/catalog";
import type { ProductCreationInput } from "@/lib/validations/catalog";

interface ProductsClientProps {
  products: ProductWithRelations[];
  options: OptionWithFeatures[];
  families: FamilyWithRelations[];
}

export function ProductsClient({ products, options, families }: ProductsClientProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProduct = async (data: ProductCreationInput) => {
    try {
      const result = await createProduct(data);

      if (result.success) {
        toast.success("Producto creado exitosamente");
        setIsCreating(false);
        router.refresh();
      } else {
        toast.error(result.error || "Error al crear el producto");
      }
    } catch (error) {
      toast.error("Error inesperado al crear el producto");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Producto
        </Button>
      </div>

      <ProductsTable products={products} />

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Producto</DialogTitle>
            <DialogDescription>
              Completa los siguientes pasos para crear un producto con sus variantes
            </DialogDescription>
          </DialogHeader>
          <ProductCreationWizard
            options={options}
            families={families}
            onComplete={handleCreateProduct}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
