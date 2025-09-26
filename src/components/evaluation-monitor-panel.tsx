
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { CallEvaluation } from '@/lib/types';
import { DATASET_CONFIG } from '@/lib/constants';
import { normalizeEvaluation, buildEvaluationContext } from '@/lib/evaluations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { CallDetails } from './call-details';
import { Paperclip, Folder, Headset } from 'lucide-react';
import { Label } from './ui/label';

// DATASET_CONFIG ahora proviene de constants para mantener consistencia con Auditbot

interface EvaluationMonitorPanelProps {
  onContextUpdate: (context: string, count: number) => void;
}
export function EvaluationMonitorPanel({ onContextUpdate }: EvaluationMonitorPanelProps) {
  const datasetEntries = useMemo(() => Object.entries(DATASET_CONFIG), []);
  const [selectedDatasetFile, setSelectedDatasetFile] = useState<string | null>(
    () => datasetEntries[0]?.[1] ?? null
  );
  const [allCallData, setAllCallData] = useState<CallEvaluation[] | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDatasetName = useMemo(() => {
    if (!selectedDatasetFile) return null;
    const entry = datasetEntries.find(([, file]) => file === selectedDatasetFile);
    return entry ? entry[0] : null;
  }, [datasetEntries, selectedDatasetFile]);

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

        const parsedData = data.map(call => {
          const rawEvaluation = call.evaluacion_llamada_raw ?? call.evaluacion_llamada;
          const normalized = normalizeEvaluation(rawEvaluation ?? undefined);
          return {
            ...call,
            evaluacion_llamada_parsed: normalized,
          };
        });

        setAllCallData(parsedData);
        if (parsedData.length) {
          setSelectedCallId(parsedData[0].id_llamada_procesada || parsedData[0].id_cliente || null);
        }
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
    const buildContext = async () => {
      if (allCallData) {
          const usable = allCallData.filter(
            c => c.evaluacion_llamada_parsed && c.evaluacion_llamada_parsed.hasData
          );
          if (!usable.length) {
            onContextUpdate('', 0);
            return;
          }
          let context = buildEvaluationContext(
            usable.map(call => ({
              id: call.id_llamada_procesada,
              dataset: selectedDatasetName ?? undefined,
              evaluation: call.evaluacion_llamada_parsed!,
            })),
            { includeTranscription: false }
          );
        const MAX_CHARS = 25000; // umbral antes de resumir
        if (context.length > MAX_CHARS) {
          try {
            const res = await fetch('/api/summarize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ context, maxChars: 8000 }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.summary) {
                context = `**RESUMEN CONTEXTO (${usable.length} registros)**\n${data.summary}`;
              }
            } else {
              console.warn('Fallo API summarize status ' + res.status);
              context = context.slice(0, MAX_CHARS) + '\n[TRUNCADO]';
            }
          } catch (e) {
            console.warn('Fallo al resumir contexto, usando versión completa truncada');
            context = context.slice(0, MAX_CHARS) + '\n[TRUNCADO]';
          }
        }
        // Persistir en localStorage (lado cliente) para reutilizar al cambiar pestañas
        try {
          localStorage.setItem('evaluationContextCache', context);
        } catch {}
        onContextUpdate(context, usable.length);
      } else {
        onContextUpdate('', 0);
      }
    };
    buildContext();
  }, [allCallData, onContextUpdate, selectedDatasetName]);

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
            <Select value={selectedDatasetFile ?? undefined} onValueChange={(value) => setSelectedDatasetFile(value)}>
                            <SelectTrigger id="dataset-select">
                                <SelectValue placeholder="Seleccionar conjunto de datos" />
                            </SelectTrigger>
                            <SelectContent>
                {datasetEntries.map(([name, file]) => (
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
            <p><strong>Dataset:</strong> {selectedDatasetName || 'N/A'}</p>
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
