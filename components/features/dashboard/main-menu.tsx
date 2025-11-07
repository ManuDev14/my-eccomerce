"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import MenuItem from "./menu-item";
import MenuTitle from "./menu-title";
import { LightDarkToggle } from "@/components/ui/light-dark-toggle";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export default function MainMenu({ className }: { className?: string }) {
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error("Error al cerrar sesión");
      console.error(error);
    }
  };

  return (
    <nav
      className={cn(`md:bg-muted overflow-auto p-4 flex flex-col`, className)}
    >
      <header className="hidden md:block border-b dark:border-b-black border-b-zinc-300 pb-4">
        <MenuTitle />
      </header>
      <ul className="py-4 grow">
        <MenuItem href="/admin/dashboard">Dashboard</MenuItem>
        <MenuItem href="/admin/dashboard/products">Productos</MenuItem>
        <MenuItem href="/admin/dashboard/families">Familias</MenuItem>
        <MenuItem href="/admin/dashboard/users">Usuarios</MenuItem>
      </ul>
      <footer className="flex gap-2 items-center">
        <Avatar>
          <AvatarFallback className="bg-pink-300 dark:bg-pink-800">
            AD
          </AvatarFallback>
        </Avatar>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="hover:underline px-2"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Salir
        </Button>
        <LightDarkToggle className="ml-auto" />
      </footer>
    </nav>
  );
}
