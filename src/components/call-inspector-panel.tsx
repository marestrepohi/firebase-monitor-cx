'use client';

import { useState, useMemo } from 'react';
import type { CallEvaluation } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from './ui/separator';

interface CallInspectorPanelProps {
  callData: CallEvaluation[];
}

export function CallInspectorPanel({ callData }: CallInspectorPanelProps) {
  const [selectedCallId, setSelectedCallId] = useState<string | null>(
    callData.length > 0 ? callData[0].id_llamada_procesada : null
  );

  const selectedCall = useMemo(() => {
    if (!selectedCallId) return null;
    return callData.find(call => call.id_llamada_procesada === selectedCallId) || null;
  }, [callData, selectedCallId]);

  const evaluationDetails = useMemo(() => {
    if (!selectedCall) return {};
    const details: { [key: string]: string } = {};
    selectedCall.evaluacion_llamada.split(' | ').forEach(part => {
      const [key, ...value] = part.split(': ');
      if (key && value.length > 0) {
        details[key.trim()] = value.join(': ').trim();
      }
    });
    return details;
  }, [selectedCall]);


  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
                <CardTitle className="font-headline">Inspector de Llamadas</CardTitle>
                <CardDescription>
                Selecciona una llamada para ver sus detalles y evaluación.
                </CardDescription>
            </div>
            <Select
                value={selectedCallId || ''}
                onValueChange={(value) => setSelectedCallId(value)}
            >
                <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue placeholder="Seleccionar una llamada" />
                </SelectTrigger>
                <SelectContent>
                    {callData.map(call => (
                        <SelectItem key={call.id_llamada_procesada} value={call.id_llamada_procesada}>
                            {call.id_llamada_procesada}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg min-h-[60vh] p-4">
          {selectedCall ? (
            <ScrollArea className="h-[calc(60vh-2rem)]">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Detalles de la Llamada</h3>
                  <p className="text-sm text-muted-foreground">{selectedCall.id_llamada_procesada}</p>
                </div>
                <Separator/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-4">
                    {Object.entries(evaluationDetails).map(([key, value]) => (
                        <div key={key}>
                            <p className="font-medium text-muted-foreground">{key}</p>
                            <p>{value}</p>
                        </div>
                    ))}
                </div>
              </div>
            </ScrollArea>
          ) : (
             <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
                <div className="text-3xl mb-4">📞</div>
                <h3 className="text-lg font-semibold">No hay llamada seleccionada</h3>
                <p className="text-muted-foreground max-w-sm">
                    Selecciona una llamada del menú desplegable para ver sus detalles.
                </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
