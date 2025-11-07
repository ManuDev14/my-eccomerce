"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductBasicInfoStep } from "./product-basic-info-step";
import { ProductOptionsStep } from "./product-options-step";
import { ProductVariantsStep } from "./product-variants-step";
import type {
  ProductCreationInput,
  ProductBasicInfoInput,
} from "@/lib/validations/catalog";
import type { OptionWithFeatures, FamilyWithRelations } from "@/types/catalog";

interface ProductCreationWizardProps {
  options: OptionWithFeatures[];
  families: FamilyWithRelations[];
  onComplete: (data: ProductCreationInput) => Promise<void>;
}

export function ProductCreationWizard({
  options,
  families,
  onComplete,
}: ProductCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<ProductCreationInput>>({
    basicInfo: {
      name: "",
      sku: "",
      price: 0,
      detail: "",
      image_path: "",
      subcategory_id: 0,
    },
    selectedOptions: [],
    variants: [],
  });

  const steps = [
    {
      title: "Información Básica",
      description: "Datos generales del producto",
    },
    {
      title: "Opciones del Producto",
      description: "Seleccionar opciones como Color, Talla, etc.",
    },
    {
      title: "Crear Variantes",
      description: "Definir variantes con precio y stock",
    },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return (
          formData.basicInfo?.name &&
          formData.basicInfo?.sku &&
          formData.basicInfo?.price > 0 &&
          formData.basicInfo?.subcategory_id > 0
        );
      case 1:
        return formData.selectedOptions && formData.selectedOptions.length > 0;
      case 2:
        return formData.variants && formData.variants.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    setIsSubmitting(true);
    try {
      await onComplete(formData as ProductCreationInput);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Stepper Header */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    "text-sm font-medium",
                    index === currentStep
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-4 transition-colors",
                  index < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <ProductBasicInfoStep
              families={families}
              initialData={formData.basicInfo}
              onDataChange={(data: ProductBasicInfoInput) =>
                setFormData({ ...formData, basicInfo: data })
              }
            />
          )}
          {currentStep === 1 && (
            <ProductOptionsStep
              options={options}
              initialSelectedOptions={formData.selectedOptions}
              onDataChange={(selectedOptions: number[]) =>
                setFormData({ ...formData, selectedOptions })
              }
            />
          )}
          {currentStep === 2 && (
            <ProductVariantsStep
              options={options}
              selectedOptionIds={formData.selectedOptions || []}
              basePrice={formData.basicInfo?.price || 0}
              initialVariants={formData.variants}
              onDataChange={(variants) =>
                setFormData({ ...formData, variants })
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0 || isSubmitting}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext} disabled={!canProceed() || isSubmitting}>
            Siguiente
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Crear Producto
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
