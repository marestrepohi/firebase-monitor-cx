
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getExecutiveReport } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Loader2, Settings2, Wand2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DATASET_CONFIG, QUESTIONS_FOR_REPORTS } from '@/lib/constants';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ReportConfigDialog } from './report-config-dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function ReportPanel() {
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [datasetName, setDatasetName] = useState<string>('Cobranzas Call');
  const [recordLimit, setRecordLimit] = useState<number>(50);
  const [usableCount, setUsableCount] = useState<number>(0);
  const [questions, setQuestions] = useState<string[]>(QUESTIONS_FOR_REPORTS);
  const reportRef = useRef<HTMLDivElement>(null);
  const loadingEmojis = ['🔎', '📊'];
  const [emojiIndex, setEmojiIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(() => {
      setEmojiIndex((i) => (i + 1) % loadingEmojis.length);
    }, 500);
    return () => clearInterval(id);
  }, [isLoading]);

  // Cargar conteo de registros utilizables para el dataset del informe
  useEffect(() => {
    const loadUsable = async () => {
      try {
        const file = DATASET_CONFIG[datasetName];
        if (!file) { setUsableCount(0); return; }
        const res = await fetch(`/${file}`);
        if (!res.ok) { setUsableCount(0); return; }
        const data = await res.json();
        const total = Array.isArray(data) ? data.length : 0;
        setUsableCount(total);
        setRecordLimit((prev) => {
          if (!total) return 1;
          return Math.max(1, Math.min(prev, total));
        });
      } catch {
        setUsableCount(0);
      }
    };
    loadUsable();
  }, [datasetName]);

  const buildReportContext = useCallback(async (): Promise<string> => {
    const fileName = DATASET_CONFIG[datasetName];
    if (!fileName) return '';
    try {
      const res = await fetch(`/${fileName}`);
      if (!res.ok) return '';
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      const limited = arr.slice(0, Math.min(recordLimit, arr.length));
      const blocks: string[] = [];
      for (const call of limited) {
        let parsed: any = {};
        const raw = call.evaluacion_llamada;
        if (typeof raw === 'string') { 
          try { 
            if (raw.trim().length > 0) parsed = JSON.parse(raw);
          } catch {} 
        } else if (raw && typeof raw === 'object') { 
          parsed = raw; 
        }
        const otros = parsed && parsed.otros_campos ? parsed.otros_campos : {};
        blocks.push(`ID: ${call.id_llamada_procesada}\notros_campos: ${JSON.stringify(otros)}`);
      }
      return `DATASET: ${datasetName} REGISTROS: ${limited.length}\n` + blocks.join('\n---\n');
    } catch {
      return '';
    }
  }, [datasetName, recordLimit]);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setReport('');
    const context = await buildReportContext();
    const generatedReport = await getExecutiveReport(context, datasetName, questions);
    setReport(generatedReport);
    setIsLoading(false);
  };

  const exportPdf = async () => {
    if (!reportRef.current) return;
    const el = reportRef.current;
    
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    
    const canvasWidth = pdfWidth - 20; // pdf width with margin
    const canvasHeight = canvasWidth / ratio;

    let heightLeft = canvasHeight;
    let position = 10; // top margin

    pdf.addImage(imgData, 'PNG', 10, position, canvasWidth, canvasHeight);
    heightLeft -= (pdfHeight - 20);

    while (heightLeft > 0) {
      position = heightLeft - canvasHeight + 10; // next page top margin
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, canvasWidth, canvasHeight);
      heightLeft -= (pdfHeight - 20);
    }
    
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    pdf.save(`informe-${datasetName}-${ts}.pdf`);
  };

  return (
    <Card className="w-full h-[84vh] md:h-[86vh] flex flex-col">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-end sm:items-start gap-4">
          <div className="flex flex-wrap gap-2 w-full justify-end">
            <Button variant="outline" onClick={() => setIsConfigOpen(true)}>
              <Settings2 className="mr-2 h-4 w-4" /> Configurar
            </Button>
            <Button onClick={handleGenerateReport} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generar Informe
            </Button>
            <Button variant="secondary" onClick={exportPdf} disabled={!report}>
              <Download className="mr-2 h-4 w-4" /> Exportar PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="border rounded-lg flex-1 flex flex-col">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-2">
              <div className="text-5xl mb-2 flex items-center gap-3">
                <span className="inline-block animate-spin">⚙️</span>
                <span>{loadingEmojis[emojiIndex]}</span>
              </div>
              <h3 className="text-lg font-semibold">Generando informe…</h3>
              <p className="text-muted-foreground max-w-md">
                Analizando {Math.min(recordLimit, Math.max(0, usableCount))} registros de {datasetName}. Esto puede tardar unos segundos.
              </p>
            </div>
          )}

          {!isLoading && !report && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold">Tu informe aparecerá aquí</h3>
              <p className="text-muted-foreground max-w-sm">
                Configura la fuente y registros, luego haz clic en "Generar Informe" para ver los insights estratégicos.
              </p>
            </div>
          )}

          {report && (
            <ScrollArea className="flex-1">
              <div ref={reportRef} className="prose prose-sm dark:prose-invert p-6 max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
      <ReportConfigDialog
        isOpen={isConfigOpen}
        onOpenChange={setIsConfigOpen}
        recordLimit={recordLimit}
        onRecordLimitChange={setRecordLimit}
        maxRecords={usableCount}
        datasetName={datasetName}
        onDatasetChange={setDatasetName}
        questions={questions}
        onQuestionsChange={setQuestions}
      />
    </Card>
  );
}
