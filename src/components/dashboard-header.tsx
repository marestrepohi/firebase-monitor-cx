import { Bell, User } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-end gap-4 p-4 border-b bg-card h-16">
        <div className="flex items-center gap-4">
            <Image 
                src="https://www.credilemon.com/img/logo/co/banco-de-bogota.webp"
                alt="Banco de Bogota"
                width={130}
                height={40}
                className="object-contain"
            />
            <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
            </Button>
        </div>
    </header>
  );
}
