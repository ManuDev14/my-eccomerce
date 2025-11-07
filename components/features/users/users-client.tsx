"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateUserForm } from "./create-user-form";
import { UsersTable } from "./users-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UserWithProfile } from "@/types/user";

interface UsersClientProps {
  users: UserWithProfile[];
}

export function UsersClient({ users }: UsersClientProps) {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Usuario
        </Button>
      </div>

      <UsersTable users={users} />

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Completa el formulario para crear un nuevo usuario en el sistema
            </DialogDescription>
          </DialogHeader>
          <CreateUserForm onSuccess={() => setIsCreating(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
