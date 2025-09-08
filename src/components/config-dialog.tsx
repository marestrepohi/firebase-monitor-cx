'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { SidebarControls } from './sidebar-controls';

interface ConfigDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    recordLimit: number;
    onRecordLimitChange: (limit: number) => void;
    maxRecords: number;
}

export function ConfigDialog({ isOpen, onOpenChange, recordLimit, onRecordLimitChange, maxRecords }: ConfigDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configuración</DialogTitle>
                    <DialogDescription>
                        Ajusta los parámetros de la aplicación.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <SidebarControls 
                        recordLimit={recordLimit}
                        onRecordLimitChange={onRecordLimitChange}
                        maxRecords={maxRecords}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
