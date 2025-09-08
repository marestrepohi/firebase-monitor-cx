'use client';

import type { SentimentAnalysisOutput } from '@/ai/flows/sentiment-analysis-aggregation';
import { SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SentimentChart } from './sentiment-chart';

interface SidebarControlsProps {
  maxRecords: number;
  recordLimit: number;
  onRecordLimitChange: (limit: number) => void;
  sentimentData: SentimentAnalysisOutput | null;
  isLoading: boolean;
}

export function SidebarControls({
  maxRecords,
  recordLimit,
  onRecordLimitChange,
  sentimentData,
  isLoading,
}: SidebarControlsProps) {
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Image 
                src="https://ccbuenavista.com/wp-content/uploads/2020/12/banco-de-bogota-logo.png"
                alt="Banco de Bogota Logo"
                width={40}
                height={40}
                className="rounded-md"
                data-ai-hint="logo"
            />
          <div className="flex flex-col">
            <h2 className="text-lg font-bold font-headline">Auditbot</h2>
            <p className="text-sm text-muted-foreground">Cobranzas</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Controles</SidebarGroupLabel>
          <div className="space-y-4 p-2">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="record-limit-slider" className="text-sm">Límite de registros</Label>
                <span className="text-sm font-medium text-primary">{recordLimit}</span>
              </div>
              <Slider
                id="record-limit-slider"
                min={1}
                max={maxRecords}
                step={1}
                value={[recordLimit]}
                onValueChange={(value) => onRecordLimitChange(value[0])}
              />
            </div>
          </div>
        </SidebarGroup>
        <SidebarGroup>
            <SidebarGroupLabel>Análisis de Sentimiento</SidebarGroupLabel>
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader>
                  <CardTitle className="text-base">Distribución</CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentChart sentimentData={sentimentData} isLoading={isLoading} />
              </CardContent>
            </Card>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
