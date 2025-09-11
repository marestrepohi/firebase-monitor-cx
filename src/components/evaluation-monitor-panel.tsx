
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { CallEvaluation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { CallDetails } from './call-details';
import { Paperclip, Folder, Headset } from 'lucide-react';
import { Label } from './ui/label';

const DATASET_CONFIG = {
  "Cobranzas Call": "resultados_evaluaciones_cobranzas.json",
  "Cobranzas Abogados": "resultados_evaluaciones_cobranzas_abogados.json",
  "Cobranzas Casa Mayor": "resultados_evaluaciones_cobranzas_casa_mayor.json",
};

interface EvaluationMonitorPanelProps {
  onContextUpdate: (context: string, count: number) => void;
}

export function EvaluationMonitorPanel({ onContextUpdate }: EvaluationMonitorPanelProps) {
  const [selectedDatasetFile, setSelectedDatasetFile] = useState<string | null>(null);
  const [allCallData, setAllCallData] = useState<CallEvaluation[] | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDatasetFile) return;

    const loadData = async () => {
      setIsLoading(true);
      setAllCallData(null);
      setSelectedCallId(null);
      setError(null);
      
      const url = `/${selectedDatasetFile}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: CallEvaluation[] = await response.json();
        
        // Parse the nested JSON string
        const parsedData = data.map(call => ({
            ...call,
            evaluacion_llamada_parsed: JSON.parse(call.evaluacion_llamada_raw)
        }));

        setAllCallData(parsedData);
      } catch (e) {
        console.error("Failed to load or parse evaluation data:", e);
        setError(`Error al cargar los datos. Verifique que el archivo '${selectedDatasetFile}' exista en la carpeta 'public' y tenga el formato correcto.`);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedDatasetFile]);

  useEffect(() => {
    if (allCallData) {
      const context = allCallData
        .map(call => `ID: ${call.id_llamada_procesada}\nEvaluacion: ${JSON.stringify(call.evaluacion_llamada_parsed)}\n---\n`)
        .join('');
      onContextUpdate(context, allCallData.length);
    } else {
      onContextUpdate('', 0);
    }
  }, [allCallData, onContextUpdate]);

  const selectedCallData = useMemo(() => {
    if (!allCallData || !selectedCallId) return null;
    return allCallData.find(call => call.id_llamada_procesada === selectedCallId) || null;
  }, [allCallData, selectedCallId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* --- Sidebar Controls --- */}
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Folder className="w-5 h-5"/> Controles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <Label htmlFor="dataset-select">📂 Seleccione tipo de evaluación</Label>
                        <Select onValueChange={(value) => setSelectedDatasetFile(value)}>
                            <SelectTrigger id="dataset-select">
                                <SelectValue placeholder="Seleccionar conjunto de datos" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(DATASET_CONFIG).map(([name, file]) => (
                                    <SelectItem key={file} value={file}>{name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                     </div>
                     <div>
                        <Label htmlFor="call-select">🎧 Seleccione una llamada</Label>
                        <Select
                            value={selectedCallId || ''}
                            onValueChange={(value) => setSelectedCallId(value)}
                            disabled={!allCallData}
                        >
                            <SelectTrigger id="call-select">
                                <SelectValue placeholder="Seleccionar una llamada" />
                            </SelectTrigger>
                            <SelectContent>
                                {allCallData?.map(call => (
                                    <SelectItem key={call.id_llamada_procesada} value={call.id_llamada_procesada}>
                                        {call.id_llamada_procesada}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                     </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Paperclip className="w-5 h-5" /> Estadísticas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm space-y-2">
                        <p><strong>Dataset:</strong> {Object.keys(DATASET_CONFIG).find(key => DATASET_CONFIG[key as keyof typeof DATASET_CONFIG] === selectedDatasetFile) || 'N/A'}</p>
                        <p><strong>Total de Llamadas:</strong> {allCallData?.length ?? 0}</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* --- Main Content Area --- */}
        <div className="lg:col-span-3">
            {isLoading && (
                 <div className="flex items-center justify-center h-full min-h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {!isLoading && !error && (
                <CallDetails selectedCallData={selectedCallData} />
            )}
        </div>
    </div>
  );
}
