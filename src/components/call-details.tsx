
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { CallEvaluation } from '@/lib/types';
import { getAudioUrl } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { Headset, MicOff, FileJson, Type } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface MetricCardProps {
    title: string;
    value: string | number | boolean;
    isBoolean?: boolean;
}

const MetricCard = ({ title, value }: MetricCardProps) => (
  <Card className="p-4">
    <p className="text-sm font-medium text-muted-foreground">{title}</p>
    <p className="text-lg font-semibold">
        {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
    </p>
  </Card>
);

interface CallDetailsProps {
  selectedCallData: (CallEvaluation & { evaluacion_llamada_parsed?: any }) | null;
}

export function CallDetails({ selectedCallData }: CallDetailsProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudio = async () => {
      if (selectedCallData?.id_original_path) {
        setIsAudioLoading(true);
        setAudioUrl(null);
        setAudioError(null);
        try {
          const url = await getAudioUrl(selectedCallData.id_original_path);
          if (url) {
            setAudioUrl(url);
          } else {
            setAudioError("No se pudo encontrar el archivo de audio.");
          }
        } catch (error) {
          console.error("Failed to fetch audio:", error);
          setAudioError("Error al cargar el audio.");
        } finally {
          setIsAudioLoading(false);
        }
      } else {
        setAudioUrl(null);
        setIsAudioLoading(false);
        setAudioError(null);
      }
    };

    fetchAudio();
  }, [selectedCallData]);

  const metrics = useMemo(() => {
    if (!selectedCallData?.evaluacion_llamada_parsed) return [];
    const { transcripcion, ...rest } = selectedCallData.evaluacion_llamada_parsed;
    return Object.entries(rest);
  }, [selectedCallData]);

  const jsonForViewer = useMemo(() => {
    if (!selectedCallData?.evaluacion_llamada_parsed) return null;
    const { transcripcion, precision_llamada, precision_error_critico_cliente, precision_error_critico_negocio, ...rest } = selectedCallData.evaluacion_llamada_parsed;
    return rest;
  }, [selectedCallData]);

  if (!selectedCallData) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-6 border rounded-lg bg-card">
        <Headset className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Análisis Detallado de la Llamada</h3>
        <p className="text-muted-foreground max-w-sm">
          ⬅️ Selecciona un conjunto de datos y una llamada para ver su análisis detallado.
        </p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">
          ID Llamada: {selectedCallData.id_llamada_procesada}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Audio Player */}
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2"><Headset className="w-5 h-5"/> Audio de la llamada</h3>
          {isAudioLoading && <Skeleton className="h-10 w-full" />}
          {!isAudioLoading && audioUrl && (
            <audio controls src={audioUrl} className="w-full">
                Tu navegador no soporta el elemento de audio.
            </audio>
          )}
          {!isAudioLoading && (audioError || !audioUrl) && (
             <Alert variant="default" className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted rounded-md">
                <MicOff className="w-4 h-4"/>
                <span>{audioError || "No hay audio disponible para esta llamada."}</span>
            </Alert>
          )}
        </div>

        <Separator />
        
        {/* Metrics */}
        <div className="space-y-2">
          <h3 className="font-semibold">Métricas Clave</h3>
          {selectedCallData.evaluacion_llamada_parsed && Object.keys(selectedCallData.evaluacion_llamada_parsed).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedCallData.evaluacion_llamada_parsed.precision_llamada !== undefined && <MetricCard title="Precisión Llamada" value={`${selectedCallData.evaluacion_llamada_parsed.precision_llamada}%`} />}
              {selectedCallData.evaluacion_llamada_parsed.precision_error_critico_cliente !== undefined && <MetricCard title="Error Crítico Cliente" value={selectedCallData.evaluacion_llamada_parsed.precision_error_critico_cliente === 'Sí'} isBoolean />}
              {selectedCallData.evaluacion_llamada_parsed.precision_error_critico_negocio !== undefined && <MetricCard title="Error Crítico Negocio" value={selectedCallData.evaluacion_llamada_parsed.precision_error_critico_negocio === 'Sí'} isBoolean />}
              {selectedCallData.evaluacion_llamada_parsed.sentimiento_general && <MetricCard title="Sentimiento" value={selectedCallData.evaluacion_llamada_parsed.sentimiento_general} />}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay métricas disponibles para esta llamada.</p>
          )}
        </div>

        <Separator />
        
        {/* Transcription */}
        <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2"><Type className="w-5 h-5"/> Transcripción</h3>
      <ScrollArea className="h-48 border rounded-md bg-muted">
        <pre className="p-4 text-sm whitespace-pre-wrap font-sans">
          {selectedCallData.evaluacion_llamada_parsed?.transcripcion || 'No hay transcripción disponible.'}
        </pre>
      </ScrollArea>
        </div>

        <Separator />

        {/* JSON Viewer */}
        <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2"><FileJson className="w-5 h-5"/> Resto de la Evaluación (JSON)</h3>
             <ScrollArea className="h-48 border rounded-md bg-muted">
            <pre className="p-4 text-sm whitespace-pre-wrap font-mono">
              {jsonForViewer ? JSON.stringify(jsonForViewer, null, 2) : 'No hay datos de evaluación.'}
            </pre>
             </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
