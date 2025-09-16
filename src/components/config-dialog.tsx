'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { SidebarControls } from './sidebar-controls';
import { Button } from '@/components/ui/button';

interface ConfigDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    recordLimit: number;
    onRecordLimitChange: (limit: number) => void;
    maxRecords: number;
    datasetName: string;
    onDatasetChange: (name: string) => void;
        onResetConversation?: () => void;
}

export function ConfigDialog({ isOpen, onOpenChange, recordLimit, onRecordLimitChange, maxRecords, datasetName, onDatasetChange, onResetConversation }: ConfigDialogProps) {
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
                                        datasetName={datasetName}
                                        onDatasetChange={onDatasetChange}
                                    />
                                        <div className="pt-3">
                                            <Button variant="outline" onClick={onResetConversation}>
                                                Reiniciar conversación
                                            </Button>
                                        </div>
                                </div>
            </DialogContent>
        </Dialog>
    )
}
