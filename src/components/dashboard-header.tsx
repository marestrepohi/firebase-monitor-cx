'use client';

import Image from 'next/image';

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between gap-4 p-4 border-b bg-card h-16">
        <div className="w-[150px]"></div>
        <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold">AuditSuite</h1>
        </div>
        <div className="w-[150px] flex justify-end">
            <Image
                src="https://www.credilemon.com/img/logo/co/banco-de-bogota.webp"
                alt="Banco de Bogota"
                width={150}
                height={40}
                />
        </div>
    </header>
  );
}
