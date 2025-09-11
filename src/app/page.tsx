
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import type { SentimentAnalysisOutput } from '@/ai/flows/sentiment-analysis-aggregation';
import { getSentimentAnalysis } from '@/app/actions';
import { Sidebar, SidebarProvider, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ChatPanel } from '@/components/chat-panel';
import { ReportPanel } from '@/components/report-panel';
import { EvaluationMonitorPanel } from '@/components/evaluation-monitor-panel';
import { TranscriptionPanel } from '@/components/transcription-panel';
import { LookerStudioPanel } from '@/components/looker-studio-panel';
import { MessageSquare, BarChart2, Search, Settings, AudioLines, AreaChart } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';
import { ConfigDialog } from '@/components/config-dialog';

export default function Home() {
  const [recordLimit, setRecordLimit] = useState(50);
  const [sentimentData, setSentimentData] = useState<SentimentAnalysisOutput | null>(null);
  const [isSentimentLoading, setIsSentimentLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [evaluationContext, setEvaluationContext] = useState('');
  const [recordCount, setRecordCount] = useState(0);

  // This will be updated by the EvaluationMonitorPanel
  const handleContextUpdate = (context: string, count: number) => {
    setEvaluationContext(context);
    setRecordCount(count);
  };
  
  useEffect(() => {
    const fetchSentiment = async () => {
      // This is a placeholder for sentiment analysis on the loaded data.
      // Currently, it's not directly wired to the dynamically loaded data.
      // To implement this, we would need to pass call details from EvaluationMonitorPanel up to here.
    };
    fetchSentiment();
  }, [evaluationContext, activeTab]);

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
                  tooltip="Monitor de Evaluaciones"
                >
                  <Search className="w-4 h-4" />
                  <span>Monitor de Evaluaciones</span>
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
              <ReportPanel reportContext={evaluationContext} recordCount={recordCount} />
            </TabsContent>
            <TabsContent value="inspector" className="mt-0">
              <EvaluationMonitorPanel onContextUpdate={handleContextUpdate} />
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
        maxRecords={recordCount}
      />
    </SidebarProvider>
  );
}
