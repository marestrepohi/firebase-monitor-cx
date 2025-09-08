'use client';

import { useState } from 'react';
import { getExecutiveReport } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Wand2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportPanelProps {
  reportContext: string;
  recordCount: number;
}

export function ReportPanel({ reportContext, recordCount }: ReportPanelProps) {
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setReport('');
    const generatedReport = await getExecutiveReport(reportContext);
    setReport(generatedReport);
    setIsLoading(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
                <CardTitle className="font-headline">Generador de Informes</CardTitle>
                <CardDescription>
                Genera un informe ejecutivo basado en {recordCount} registros seleccionados.
                </CardDescription>
            </div>
            <Button onClick={handleGenerateReport} disabled={isLoading}>
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generar Informe
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg min-h-[60vh]">
          {isLoading && (
            <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <br/>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
            </div>
          )}

          {!isLoading && !report && (
             <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-lg font-semibold">Tu informe aparecerá aquí</h3>
                <p className="text-muted-foreground max-w-sm">
                    Haz clic en el botón "Generar Informe" para comenzar el análisis y ver los insights estratégicos.
                </p>
            </div>
          )}

          {report && (
            <ScrollArea className="h-[60vh]">
                <div className="prose prose-sm dark:prose-invert p-6" style={{whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', fontSize: '0.875rem'}}>
                    {report.split('\n').map((line, index) => {
                        if (line.startsWith('##')) {
                            return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.replace('##', '').trim()}</h2>
                        }
                        if (line.startsWith('#')) {
                            return <h1 key={index} className="text-2xl font-bold mt-6 mb-3">{line.replace('#', '').trim()}</h1>
                        }
                        if (line.trim().startsWith('|')) {
                           return <pre key={index} className="bg-muted p-2 rounded-md font-code text-xs">{line}</pre>
                        }
                         if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                            return <p key={index} className="ml-4">{`• ${line.trim().substring(2)}`}</p>
                        }
                        return <p key={index}>{line}&nbsp;</p>
                    })}
                </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
