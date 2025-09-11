
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import type { CallEvaluation } from '@/lib/mock-data';
import type { SentimentAnalysisOutput } from '@/ai/flows/sentiment-analysis-aggregation';
import { getSentimentAnalysis } from '@/app/actions';
import { evaluationsData } from '@/lib/mock-data';
import { Sidebar, SidebarProvider, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ChatPanel } from '@/components/chat-panel';
import { ReportPanel } from '@/components/report-panel';
import { CallInspectorPanel } from '@/components/call-inspector-panel';
import { TranscriptionPanel } from '@/components/transcription-panel';
import { LookerStudioPanel } from '@/components/looker-studio-panel';
import { MessageSquare, BarChart2, Search, Settings, AudioLines, AreaChart } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';
import { ConfigDialog } from '@/components/config-dialog';

export default function Home() {
  const [recordLimit, setRecordLimit] = useState(50);
  const [allData] = useState<CallEvaluation[]>(evaluationsData);
  const [sentimentData, setSentimentData] = useState<SentimentAnalysisOutput | null>(null);
  const [isSentimentLoading, setIsSentimentLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [isConfigOpen, setIsConfigOpen] = useState(false);

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
      if (limitedData.length > 0 && activeTab !== 'transcription' && activeTab !== 'dashboards') {
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
  }, [limitedData, activeTab]);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar" className='bg-sidebar'>
        <SidebarHeader>
            <Image
                src="https://www.credilemon.com/img/logo/co/banco-de-bogota.webp"
                alt="Banco de Bogota"
                width={150}
                height={40}
                className="mx-auto group-data-[collapsible=icon]:hidden"
            />
            <Image
                src="https://static.wikia.nocookie.net/logopedia/images/1/1c/BancodeBogot%C3%A12008verticalplane.svg/revision/latest/scale-to-width-down/250?cb=20240518224319&path-prefix=es"
                alt="Banco de Bogota"
                width={32}
                height={32}
                className="mx-auto hidden group-data-[collapsible=icon]:block"
            />
        </SidebarHeader>
        <div className="flex-1 flex flex-col">
            <SidebarMenu className='flex-1'>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeTab === 'chat'} 
                  onClick={() => setActiveTab('chat')}
                  tooltip="Auditbot"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Auditbot</span>
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
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeTab === 'transcription'}
                  onClick={() => setActiveTab('transcription')}
                  tooltip="Transcripción de Audio"
                >
                  <AudioLines className="w-4 h-4" />
                  <span>Transcripción</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeTab === 'dashboards'}
                  onClick={() => setActiveTab('dashboards')}
                  tooltip="Dashboards"
                >
                  <AreaChart className="w-4 h-4" />
                  <span>Dashboards</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
        </div>
         <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setIsConfigOpen(true)} tooltip="Configuración">
                        <Settings className="w-4 h-4" />
                        <span>Configuración</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
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
            <TabsContent value="transcription" className="mt-0">
              <TranscriptionPanel />
            </TabsContent>
            <TabsContent value="dashboards" className="mt-0">
              <LookerStudioPanel />
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
      <ConfigDialog 
        isOpen={isConfigOpen}
        onOpenChange={setIsConfigOpen}
        recordLimit={recordLimit}
        onRecordLimitChange={setRecordLimit}
        maxRecords={allData.length}
      />
    </SidebarProvider>
  );
}
