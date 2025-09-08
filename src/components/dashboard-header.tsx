'use client';

import { SidebarTrigger } from './ui/sidebar';

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between gap-4 p-4 border-b bg-card h-16">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold text-center flex-1">Monitor Assistant Cobranzas</h1>
    </header>
  );
}
