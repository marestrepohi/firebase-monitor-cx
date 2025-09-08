'use client';

import { useState, useEffect, useMemo } from 'react';
import type { CallEvaluation } from '@/lib/mock-data';
import type { SentimentAnalysisOutput } from '@/ai/flows/sentiment-analysis-aggregation';
import { getSentimentAnalysis } from '@/app/actions';
import { evaluationsData } from '@/lib/mock-data';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarControls } from '@/components/sidebar-controls';
import { ChatPanel } from '@/components/chat-panel';
import { ReportPanel } from '@/components/report-panel';
import { CallInspectorPanel } from '@/components/call-inspector-panel';
import { MessageSquare, BarChart2, Search, LayoutGrid, Phone, Users, Bot, Briefcase, Info } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Dashboard } from '@/components/dashboard';


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
      <Sidebar collapsible="icon" variant="sidebar" className='bg-sidebar'>
         <SidebarControls
          maxRecords={allData.length}
          recordLimit={recordLimit}
          onRecordLimitChange={setRecordLimit}
        />
        <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>
                <LayoutGrid />
                Resumen General
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Phone />
                Centro de Llamadas
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton>
                <Bot />
                Asistentes de Texto
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton>
                <Briefcase />
                Campañas
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton>
                <Users />
                Información de Clientes
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton>
                <Info />
                Casos de Uso
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6">
          <Dashboard
              sentimentData={sentimentData}
              isLoading={isSentimentLoading}
              recordCount={limitedData.length}
            />
          <Tabs defaultValue="chat" className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-3 max-w-lg">
              <TabsTrigger value="chat"><MessageSquare className="w-4 h-4 mr-2" />Chat Interactivo</TabsTrigger>
              <TabsTrigger value="report"><BarChart2 className="w-4 h-4 mr-2" />Generador de Informes</TabsTrigger>
              <TabsTrigger value="inspector"><Search className="w-4 h-4 mr-2" />Inspector de Llamadas</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="mt-6">
              <ChatPanel evaluationContext={evaluationContext} />
            </TabsContent>
            <TabsContent value="report" className="mt-6">
              <ReportPanel reportContext={evaluationContext} recordCount={limitedData.length} />
            </TabsContent>
            <TabsContent value="inspector" className="mt-6">
                <CallInspectorPanel callData={limitedData} />
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
