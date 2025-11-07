import { Button } from "@/components/ui/button";
import { PersonStandingIcon } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <h1 className="flex gap-2 items-center">
        <PersonStandingIcon size={50} className="text-primary" /> SupportMe
      </h1>
      <p>Panel administrativo para gestión de soporte</p>
      <div className="flex gap-2 items-center">
        <Button asChild>
          <Link href="/admin/login">Iniciar Sesión</Link>
        </Button>
      </div>
    </>
  );
}
