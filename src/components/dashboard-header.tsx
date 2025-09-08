import Image from "next/image";

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
        </div>
    </header>
  );
}
