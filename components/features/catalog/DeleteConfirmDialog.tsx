"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  itemName: string;
  itemType: "familia" | "categoría" | "subcategoría";
  onConfirm: () => Promise<void>;
  triggerClassName?: string;
}

export function DeleteConfirmDialog({
  itemName,
  itemType,
  onConfirm,
  triggerClassName,
}: DeleteConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={triggerClassName}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold mb-2">Confirmar eliminación</h2>
        <p className="text-sm text-muted-foreground mb-4">
          ¿Está seguro que desea eliminar la {itemType}{" "}
          <span className="font-semibold">{itemName}</span>?
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
