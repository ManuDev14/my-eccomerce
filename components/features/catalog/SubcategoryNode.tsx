"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { InlineForm } from "./InlineForm";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import {
  updateSubcategory,
  deleteSubcategory,
} from "@/lib/actions/catalog";
import type { Subcategory } from "@/types/catalog";
import { useRouter } from "next/navigation";

interface SubcategoryNodeProps {
  subcategory: Subcategory;
}

export function SubcategoryNode({ subcategory }: SubcategoryNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleUpdate = async (name: string) => {
    const result = await updateSubcategory(subcategory.id, name);

    if (result.success) {
      setIsEditing(false);
      router.refresh();
    } else {
      alert(result.error);
      throw new Error(result.error);
    }
  };

  const handleDelete = async () => {
    const result = await deleteSubcategory(subcategory.id);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
      throw new Error(result.error);
    }
  };

  return (
    <div className="flex items-center gap-2 py-1">
      <div className="w-6" /> {/* Spacer for alignment */}

      {isEditing ? (
        <InlineForm
          defaultValue={subcategory.name}
          onSave={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <span className="text-sm flex-1">{subcategory.name}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <DeleteConfirmDialog
              itemName={subcategory.name}
              itemType="subcategoría"
              onConfirm={handleDelete}
            />
          </div>
        </>
      )}
    </div>
  );
}
