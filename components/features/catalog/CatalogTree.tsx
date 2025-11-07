"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InlineForm } from "./InlineForm";
import { FamilyNode } from "./FamilyNode";
import { createFamily } from "@/lib/actions/catalog";
import type { FamilyWithRelations } from "@/types/catalog";
import { useRouter } from "next/navigation";

interface CatalogTreeProps {
  initialFamilies: FamilyWithRelations[];
}

export function CatalogTree({ initialFamilies }: CatalogTreeProps) {
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);
  const router = useRouter();

  const handleCreateFamily = async (name: string) => {
    const result = await createFamily(name);

    if (result.success) {
      setIsCreatingFamily(false);
      router.refresh();
    } else {
      alert(result.error);
      throw new Error(result.error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catálogo de Productos</h1>
        {!isCreatingFamily && (
          <Button onClick={() => setIsCreatingFamily(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Familia
          </Button>
        )}
      </div>

      {/* New family form */}
      {isCreatingFamily && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <InlineForm
            placeholder="Nombre de la familia..."
            onSave={handleCreateFamily}
            onCancel={() => setIsCreatingFamily(false)}
          />
        </div>
      )}

      {/* Families tree */}
      <div className="space-y-2">
        {initialFamilies.length === 0 && !isCreatingFamily ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">No hay familias creadas</p>
            <Button onClick={() => setIsCreatingFamily(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Crear primera familia
            </Button>
          </div>
        ) : (
          initialFamilies.map((family) => (
            <FamilyNode key={family.id} family={family} />
          ))
        )}
      </div>
    </div>
  );
}
