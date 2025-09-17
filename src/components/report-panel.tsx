'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getExecutiveReport } from '@/app/actions';
import { ReportConfigDialog } from '@/components/report-config-dialog';
import { QUESTIONS_FOR_REPORTS } from '@/lib/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import ReactMarkdown from 'react-markdown';

interface ReportPanelProps {
  datasetName: string;
  setDatasetName: (name: string) => void;
  recordLimit: number;
  setRecordLimit: (limit: number) => void;
  evaluationContext: string;
  maxRecords: number;
}

export function ReportPanel({
  datasetName,
  setDatasetName,
  recordLimit,
  setRecordLimit,
  evaluationContext,
  maxRecords
}: ReportPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState('');
  const [isConfigOpen, setConfigOpen] = useState(false);
  const [isReportOpen, setReportOpen] = useState(false);
  const [questions, setQuestions] = useState(QUESTIONS_FOR_REPORTS);
  
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setReport('');
    try {
      const result = await getExecutiveReport(evaluationContext, datasetName, questions);
      setReport(result);
      setReportOpen(true);
    } catch (error) {
      console.error("Error generating report:", error);
      setReport('Error al generar el informe. Por favor, revisa la consola para más detalles.');
      setReportOpen(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center bg-background">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-2">Generador de Informes Ejecutivos</h1>
        <p className="text-muted-foreground mb-6">
          Esta herramienta genera un informe ejecutivo en formato Markdown a partir de las evaluaciones de calidad.
          Usa el panel lateral para configurar la fuente de datos y las preguntas.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={handleGenerateReport} disabled={isGenerating || !evaluationContext.length}>
            {isGenerating ? 'Generando...' : 'Generar Informe'}
          </Button>
          <Button variant="outline" onClick={() => setConfigOpen(true)}>Configurar Informe</Button>
        </div>
      </div>
      
      <ReportConfigDialog
        isOpen={isConfigOpen}
        onOpenChange={setConfigOpen}
        recordLimit={recordLimit}
        onRecordLimitChange={setRecordLimit}
        maxRecords={maxRecords}
        datasetName={datasetName}
        onDatasetChange={setDatasetName}
        questions={questions}
        onQuestionsChange={setQuestions}
      />

      <Dialog open={isReportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              <VisuallyHidden>Visor de Informes</VisuallyHidden>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto flex-1 p-2 border rounded-md bg-muted/20 prose prose-slate max-w-none dark:prose-invert">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>
          <Button onClick={() => setReportOpen(false)} className="mt-4 self-end">Cerrar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
