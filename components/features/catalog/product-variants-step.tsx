"use client";

import { useState, useMemo } from "react";
import type { OptionWithFeatures, Feature } from "@/types/catalog";
import type { VariantInput } from "@/lib/validations/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Plus, Wand2, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductVariantsStepProps {
  options: OptionWithFeatures[];
  selectedOptionIds: number[];
  basePrice: number;
  initialVariants?: VariantInput[];
  onDataChange: (variants: VariantInput[]) => void;
}

export function ProductVariantsStep({
  options,
  selectedOptionIds,
  basePrice,
  initialVariants = [],
  onDataChange,
}: ProductVariantsStepProps) {
  const [variants, setVariants] = useState<VariantInput[]>(initialVariants);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [newVariant, setNewVariant] = useState<Partial<VariantInput>>({
    featureIds: [],
    price: basePrice,
    stock: 0,
  });

  // Get selected options with their features
  const selectedOptions = useMemo(() => {
    return options.filter((opt) => selectedOptionIds.includes(opt.id));
  }, [options, selectedOptionIds]);

  // Generate all possible combinations
  const generateAllCombinations = () => {
    if (selectedOptions.length === 0) return;

    const combinations: number[][] = [[]];

    selectedOptions.forEach((option) => {
      const newCombinations: number[][] = [];
      combinations.forEach((combination) => {
        option.features.forEach((feature) => {
          newCombinations.push([...combination, feature.id]);
        });
      });
      combinations.length = 0;
      combinations.push(...newCombinations);
    });

    const newVariants: VariantInput[] = combinations.map((featureIds) => ({
      featureIds,
      price: basePrice,
      stock: 0,
    }));

    setVariants(newVariants);
    onDataChange(newVariants);
  };

  const addVariant = () => {
    if (!newVariant.featureIds || newVariant.featureIds.length === 0) return;

    const variant: VariantInput = {
      featureIds: newVariant.featureIds,
      price: newVariant.price || basePrice,
      stock: newVariant.stock || 0,
    };

    const updated = [...variants, variant];
    setVariants(updated);
    onDataChange(updated);
    setIsAddingVariant(false);
    setNewVariant({
      featureIds: [],
      price: basePrice,
      stock: 0,
    });
  };

  const updateVariant = (index: number, field: keyof VariantInput, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
    onDataChange(updated);
  };

  const removeVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
    onDataChange(updated);
  };

  const getFeatureName = (featureId: number): string => {
    for (const option of selectedOptions) {
      const feature = option.features.find((f) => f.id === featureId);
      if (feature) return feature.value;
    }
    return "Unknown";
  };

  const getFeaturesByOption = (featureIds: number[]) => {
    const grouped: { optionName: string; featureValue: string }[] = [];

    selectedOptions.forEach((option) => {
      const feature = option.features.find((f) => featureIds.includes(f.id));
      if (feature) {
        grouped.push({
          optionName: option.name,
          featureValue: feature.value,
        });
      }
    });

    return grouped;
  };

  if (selectedOptions.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Debes seleccionar al menos una opción en el paso anterior para crear
          variantes.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Crea las variantes del producto especificando las características, precio
          y stock de cada una. Puedes generar automáticamente todas las
          combinaciones o agregarlas manualmente.
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={generateAllCombinations}
          variant="outline"
          disabled={variants.length > 0}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Generar Todas las Combinaciones ({selectedOptions.reduce((acc, opt) => acc * opt.features.length, 1)})
        </Button>
        <Button
          onClick={() => setIsAddingVariant(true)}
          variant="outline"
          disabled={isAddingVariant}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Variante Manual
        </Button>
      </div>

      {/* Add New Variant Form */}
      {isAddingVariant && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nueva Variante</CardTitle>
            <CardDescription>
              Selecciona una característica por cada opción
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedOptions.map((option) => (
                <div key={option.id} className="space-y-2">
                  <Label>{option.name}</Label>
                  <Select
                    value={
                      newVariant.featureIds?.find((fid) =>
                        option.features.some((f) => f.id === fid)
                      )?.toString() || ""
                    }
                    onValueChange={(value) => {
                      const featureId = parseInt(value);
                      const filtered = (newVariant.featureIds || []).filter(
                        (fid) => !option.features.some((f) => f.id === fid)
                      );
                      setNewVariant({
                        ...newVariant,
                        featureIds: [...filtered, featureId],
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Seleccionar ${option.name}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {option.features.map((feature) => (
                        <SelectItem
                          key={feature.id}
                          value={feature.id.toString()}
                        >
                          {feature.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Precio</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newVariant.price || basePrice}
                  onChange={(e) =>
                    setNewVariant({
                      ...newVariant,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={newVariant.stock || 0}
                  onChange={(e) =>
                    setNewVariant({
                      ...newVariant,
                      stock: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={addVariant} size="sm">
                Agregar
              </Button>
              <Button
                onClick={() => {
                  setIsAddingVariant(false);
                  setNewVariant({
                    featureIds: [],
                    price: basePrice,
                    stock: 0,
                  });
                }}
                variant="outline"
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variants Table */}
      {variants.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Variantes Creadas ({variants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variante</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant, index) => {
                  const features = getFeaturesByOption(variant.featureIds);
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {features.map((f, i) => (
                            <Badge key={i} variant="outline">
                              {f.optionName}: {f.featureValue}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.price || basePrice}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "price",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={variant.stock || 0}
                          onChange={(e) =>
                            updateVariant(index, "stock", parseInt(e.target.value))
                          }
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No hay variantes creadas. Usa los botones de arriba para generar
              automáticamente o agregar manualmente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
