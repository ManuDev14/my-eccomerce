"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Pencil, Plus } from "lucide-react";
import { InlineForm } from "./InlineForm";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { SubcategoryNode } from "./SubcategoryNode";
import {
  updateCategory,
  deleteCategory,
  createSubcategory,
} from "@/lib/actions/catalog";
import type { CategoryWithRelations } from "@/types/catalog";
import { useRouter } from "next/navigation";

interface CategoryNodeProps {
  category: CategoryWithRelations;
}

export function CategoryNode({ category }: CategoryNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState(false);
  const router = useRouter();

  const handleUpdate = async (name: string) => {
    const result = await updateCategory(category.id, name);

    if (result.success) {
      setIsEditing(false);
      router.refresh();
    } else {
      alert(result.error);
      throw new Error(result.error);
    }
  };

  const handleDelete = async () => {
    const result = await deleteCategory(category.id);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
      throw new Error(result.error);
    }
  };

  const handleCreateSubcategory = async (name: string) => {
    const result = await createSubcategory(name, category.id);

    if (result.success) {
      setIsCreatingSubcategory(false);
      setIsExpanded(true);
      router.refresh();
    } else {
      alert(result.error);
      throw new Error(result.error);
    }
  };

  const hasSubcategories = category.subcategories.length > 0;

  return (
    <div className="group">
      <div className="flex items-center gap-2 py-1 hover:bg-muted/50 rounded px-2">
        {/* Expand/Collapse button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!hasSubcategories && !isCreatingSubcategory}
        >
          {hasSubcategories || isCreatingSubcategory ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </Button>

        {isEditing ? (
          <InlineForm
            defaultValue={category.name}
            onSave={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <span className="text-sm font-medium flex-1">{category.name}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreatingSubcategory(true);
                  setIsExpanded(true);
                }}
              >
                <Plus className="h-4 w-4 text-green-600" />
              </Button>
              <DeleteConfirmDialog
                itemName={category.name}
                itemType="categoría"
                onConfirm={handleDelete}
              />
            </div>
          </>
        )}
      </div>

      {/* Subcategories */}
      {isExpanded && (
        <div className="ml-6 border-l-2 border-muted pl-4">
          {category.subcategories.map((subcategory) => (
            <SubcategoryNode key={subcategory.id} subcategory={subcategory} />
          ))}

          {isCreatingSubcategory && (
            <div className="py-1">
              <InlineForm
                placeholder="Nueva subcategoría..."
                onSave={handleCreateSubcategory}
                onCancel={() => setIsCreatingSubcategory(false)}
              />
            </div>
          )}

          {!isCreatingSubcategory && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground mt-1"
              onClick={() => setIsCreatingSubcategory(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Agregar subcategoría
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
