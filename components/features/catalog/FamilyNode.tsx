"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Pencil, Plus } from "lucide-react";
import { InlineForm } from "./InlineForm";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { CategoryNode } from "./CategoryNode";
import {
  updateFamily,
  deleteFamily,
  createCategory,
} from "@/lib/actions/catalog";
import type { FamilyWithRelations } from "@/types/catalog";
import { useRouter } from "next/navigation";

interface FamilyNodeProps {
  family: FamilyWithRelations;
}

export function FamilyNode({ family }: FamilyNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const router = useRouter();

  const handleUpdate = async (name: string) => {
    const result = await updateFamily(family.id, name);

    if (result.success) {
      setIsEditing(false);
      router.refresh();
    } else {
      alert(result.error);
      throw new Error(result.error);
    }
  };

  const handleDelete = async () => {
    const result = await deleteFamily(family.id);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
      throw new Error(result.error);
    }
  };

  const handleCreateCategory = async (name: string) => {
    const result = await createCategory(name, family.id);

    if (result.success) {
      setIsCreatingCategory(false);
      setIsExpanded(true);
      router.refresh();
    } else {
      alert(result.error);
      throw new Error(result.error);
    }
  };

  const hasCategories = family.categories.length > 0;

  return (
    <div className="group mb-4">
      <div className="flex items-center gap-2 py-2 hover:bg-muted/50 rounded px-2">
        {/* Expand/Collapse button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!hasCategories && !isCreatingCategory}
        >
          {hasCategories || isCreatingCategory ? (
            isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )
          ) : (
            <div className="h-5 w-5" />
          )}
        </Button>

        {isEditing ? (
          <InlineForm
            defaultValue={family.name}
            onSave={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <span className="text-base font-bold flex-1">{family.name}</span>
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
                  setIsCreatingCategory(true);
                  setIsExpanded(true);
                }}
              >
                <Plus className="h-4 w-4 text-green-600" />
              </Button>
              <DeleteConfirmDialog
                itemName={family.name}
                itemType="familia"
                onConfirm={handleDelete}
              />
            </div>
          </>
        )}
      </div>

      {/* Categories */}
      {isExpanded && (
        <div className="ml-6 border-l-2 border-muted pl-4 mt-2">
          {family.categories.map((category) => (
            <CategoryNode key={category.id} category={category} />
          ))}

          {isCreatingCategory && (
            <div className="py-1">
              <InlineForm
                placeholder="Nueva categoría..."
                onSave={handleCreateCategory}
                onCancel={() => setIsCreatingCategory(false)}
              />
            </div>
          )}

          {!isCreatingCategory && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground mt-1"
              onClick={() => setIsCreatingCategory(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Agregar categoría
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
