'use client';

import { useState, useEffect, useMemo } from 'react';
import type { CallEvaluation } from '@/lib/mock-data';
import type { SentimentAnalysisOutput } from '@/ai/flows/sentiment-analysis-aggregation';
import { getSentimentAnalysis } from '@/app/actions';
import { evaluationsData } from '@/lib/mock-data';
import { Sidebar, SidebarProvider, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarControls } from '@/components/sidebar-controls';
import { ChatPanel } from '@/components/chat-panel';
import { ReportPanel } from '@/components/report-panel';
import { CallInspectorPanel } from '@/components/call-inspector-panel';
import { MessageSquare, BarChart2, Search } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';

export default function Home() {
  const [recordLimit, setRecordLimit] = useState(50);
  const [allData] = useState<CallEvaluation[]>(evaluationsData);
  const [sentimentData, setSentimentData] = useState<SentimentAnalysisOutput | null>(null);
  const [isSentimentLoading, setIsSentimentLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");

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
        <div className="flex flex-col flex-1">
            <SidebarMenu className='flex-1'>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeTab === 'chat'} 
                  onClick={() => setActiveTab('chat')}
                  tooltip="Chat Interactivo"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat Interactivo</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeTab === 'report'}
                  onClick={() => setActiveTab('report')}
                  tooltip="Generador de Informes"
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>Generador de Informes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeTab === 'inspector'}
                  onClick={() => setActiveTab('inspector')}
                  tooltip="Inspector de Llamadas"
                >
                  <Search className="w-4 h-4" />
                  <span>Inspector de Llamadas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
        </div>
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="chat" className="mt-0">
              <ChatPanel evaluationContext={evaluationContext} />
            </TabsContent>
            <TabsContent value="report" className="mt-0">
              <ReportPanel reportContext={evaluationContext} recordCount={limitedData.length} />
            </TabsContent>
            <TabsContent value="inspector" className="mt-0">
              <CallInspectorPanel callData={limitedData} />
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
