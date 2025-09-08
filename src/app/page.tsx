'use client';

import { useState, useEffect, useMemo } from 'react';
import type { CallEvaluation } from '@/lib/mock-data';
import type { SentimentAnalysisOutput } from '@/ai/flows/sentiment-analysis-aggregation';
import { getSentimentAnalysis } from '@/app/actions';
import { evaluationsData } from '@/lib/mock-data';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarControls } from '@/components/sidebar-controls';
import { ChatPanel } from '@/components/chat-panel';
import { ReportPanel } from '@/components/report-panel';
import { MessageSquare, BarChart2 } from 'lucide-react';

export default function Home() {
  const [recordLimit, setRecordLimit] = useState(50);
  const [allData] = useState<CallEvaluation[]>(evaluationsData);
  const [sentimentData, setSentimentData] = useState<SentimentAnalysisOutput | null>(null);
  const [isSentimentLoading, setIsSentimentLoading] = useState(true);

  const limitedData = useMemo(() => {
    return allData.slice(0, recordLimit);
  }, [allData, recordLimit]);

  const evaluationContext = useMemo(() => {
    return limitedData
      .map(
        (eval_item) =>
          `\n---\nID: ${eval_item.id_llamada_procesada}\nDataset: ${eval_item.dataset}\nEvaluación: ${eval_item.evaluacion_llamada}\n---`
      )
      .join('');
  }, [limitedData]);

  useEffect(() => {
    const fetchSentiment = async () => {
      if (limitedData.length > 0) {
        setIsSentimentLoading(true);
        try {
          const callDetails = limitedData.map((d) => ({
            id_llamada_procesada: d.id_llamada_procesada,
            evaluacion_llamada: d.evaluacion_llamada,
          }));
          const data = await getSentimentAnalysis({ callDetails });
          setSentimentData(data);
        } catch (error) {
          console.error("Failed to fetch sentiment analysis:", error);
          setSentimentData(null);
        } finally {
          setIsSentimentLoading(false);
        }
      }
    };
    fetchSentiment();
  }, [limitedData]);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarControls
          maxRecords={allData.length}
          recordLimit={recordLimit}
          onRecordLimitChange={setRecordLimit}
          sentimentData={sentimentData}
          isLoading={isSentimentLoading}
        />
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center gap-4 p-4 border-b bg-card">
          <SidebarTrigger />
          <h1 className="text-xl font-bold font-headline text-foreground">Call Insights Analyzer</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="chat"><MessageSquare className="w-4 h-4 mr-2" />Chat Interactivo</TabsTrigger>
              <TabsTrigger value="report"><BarChart2 className="w-4 h-4 mr-2" />Generador de Informes</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="mt-6">
              <ChatPanel evaluationContext={evaluationContext} />
            </TabsContent>
            <TabsContent value="report" className="mt-6">
              <ReportPanel reportContext={evaluationContext} recordCount={limitedData.length} />
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
