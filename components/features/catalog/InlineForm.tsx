"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";

interface InlineFormProps {
  defaultValue?: string;
  placeholder?: string;
  onSave: (value: string) => Promise<void>;
  onCancel: () => void;
  autoFocus?: boolean;
}

export function InlineForm({
  defaultValue = "",
  placeholder = "Nombre...",
  onSave,
  onCancel,
  autoFocus = true,
}: InlineFormProps) {
  const [value, setValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setError("El nombre es requerido");
      return;
    }

    if (trimmedValue.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(trimmedValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <div className="flex-1">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={error ? "border-red-500" : ""}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
      <div className="flex gap-1">
        <Button
          type="submit"
          size="sm"
          disabled={isLoading}
          className="h-9 w-9 p-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="h-9 w-9 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
