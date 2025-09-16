'use client';

import { SidebarTrigger } from './ui/sidebar';
import { Button } from './ui/button';
import { Settings } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  onOpenConfig?: () => void;
  showConfigButton?: boolean;
}

export function DashboardHeader({ title, onOpenConfig, showConfigButton = true }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 px-4 py-3 border-b bg-card h-14">
      <SidebarTrigger />
      <h1 className="text-xl md:text-2xl font-bold text-center flex-1 truncate">
        {title}
      </h1>
      {showConfigButton ? (
        <Button variant="ghost" size="icon" aria-label="Configuración" onClick={onOpenConfig}>
          <Settings className="h-5 w-5" />
        </Button>
      ) : (
        <div className="w-9" />
      )}
    </header>
  );
}
