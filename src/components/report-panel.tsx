
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
        // Tomar exclusivamente evaluacion_llamada (como en Auditbot, y sin validar el contenido interno de otros_campos)
        const raw = call.evaluacion_llamada;
        if (typeof raw === 'string') { try { parsed = JSON.parse(raw); } catch {} }
        else if (raw && typeof raw === 'object') { parsed = raw; }
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
    // Lazy import to avoid SSR issues
    const [html2canvas, jsPDF] = await Promise.all([
      import('html2canvas').then(m => m.default),
      import('jspdf').then(m => (m as any).jsPDF || (m as any).default.jsPDF || (m as any).default)
    ]);
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;
    let remainingHeight = imgHeight;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, Math.min(imgHeight, pageHeight));
    remainingHeight -= pageHeight;
    while (remainingHeight > 0) {
      position = 0;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position - (imgHeight - remainingHeight), imgWidth, imgHeight);
      remainingHeight -= pageHeight;
    }
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    pdf.save(`informe-${datasetName}-${ts}.pdf`);
  };

  return (
    <Card className="w-full">
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
      <CardContent>
        <div className="border rounded-lg min-h-[60vh]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 gap-2">
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
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold">Tu informe aparecerá aquí</h3>
              <p className="text-muted-foreground max-w-sm">
                Configura la fuente y registros, luego haz clic en "Generar Informe" para ver los insights estratégicos.
              </p>
            </div>
          )}

          {report && (
            <ScrollArea className="h-[60vh]">
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
