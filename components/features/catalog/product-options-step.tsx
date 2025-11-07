"use client";

import { useState } from "react";
import type { OptionWithFeatures } from "@/types/catalog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface ProductOptionsStepProps {
  options: OptionWithFeatures[];
  initialSelectedOptions?: number[];
  onDataChange: (selectedOptions: number[]) => void;
}

export function ProductOptionsStep({
  options,
  initialSelectedOptions = [],
  onDataChange,
}: ProductOptionsStepProps) {
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>(
    initialSelectedOptions
  );

  const handleOptionToggle = (optionId: number, checked: boolean) => {
    const updated = checked
      ? [...selectedOptionIds, optionId]
      : selectedOptionIds.filter((id) => id !== optionId);

    setSelectedOptionIds(updated);
    onDataChange(updated);
  };

  const selectedOptions = options.filter((opt) =>
    selectedOptionIds.includes(opt.id)
  );

  // Calculate total possible variants
  const totalVariants = selectedOptions.reduce((total, option) => {
    return total * (option.features.length || 1);
  }, 1);

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Selecciona las opciones que aplican a este producto. Por ejemplo, si el
          producto tiene diferentes colores y tallas, selecciona "Color" y "Talla".
          En el siguiente paso podrás crear las variantes específicas.
        </AlertDescription>
      </Alert>

      {options.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No hay opciones disponibles. Por favor, crea opciones globales primero
              (Color, Talla, Material, etc.).
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option) => (
            <Card
              key={option.id}
              className={
                selectedOptionIds.includes(option.id)
                  ? "border-primary"
                  : ""
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`option-${option.id}`}
                      checked={selectedOptionIds.includes(option.id)}
                      onCheckedChange={(checked) =>
                        handleOptionToggle(option.id, checked as boolean)
                      }
                    />
                    <div>
                      <Label
                        htmlFor={`option-${option.id}`}
                        className="text-base font-semibold cursor-pointer"
                      >
                        {option.name}
                      </Label>
                      <CardDescription>
                        {option.features.length}{" "}
                        {option.features.length === 1
                          ? "característica"
                          : "características"}{" "}
                        disponibles
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {option.features.length > 0 ? (
                    option.features.map((feature) => (
                      <Badge key={feature.id} variant="secondary">
                        {feature.value}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Sin características definidas
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedOptionIds.length > 0 && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Resumen de Selección</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Opciones seleccionadas:</span>
              <span className="font-medium">{selectedOptionIds.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Variantes posibles (combinaciones):
              </span>
              <span className="font-medium">{totalVariants}</span>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                En el siguiente paso podrás crear y configurar cada variante
                individualmente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
