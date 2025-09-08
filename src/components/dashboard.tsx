'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users, Phone, BarChart2 } from 'lucide-react';
import { SentimentChart } from './sentiment-chart';
import { CallsDayChart } from './calls-day-chart';
import type { SentimentAnalysisOutput } from '@/ai/flows/sentiment-analysis-aggregation';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, change, changeType, icon }: MetricCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-primary">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
        {change}
      </p>
    </CardContent>
  </Card>
);

interface DashboardProps {
    sentimentData: SentimentAnalysisOutput | null;
    isLoading: boolean;
    recordCount: number;
}

export function Dashboard({ sentimentData, isLoading, recordCount }: DashboardProps) {
  return (
    <div className='space-y-6'>
        <h2 className='text-3xl font-bold'>Resumen General</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Llamadas"
              value={recordCount.toString()}
              change="+12%"
              changeType="positive"
              icon={<Phone className="h-4 w-4" />}
            />
            <MetricCard
              title="Agentes Activos"
              value="3"
              change="+2"
              changeType="positive"
              icon={<Users className="h-4 w-4" />}
            />
            <MetricCard
              title="Leads Generados"
              value="89"
              change="+7%"
              changeType="positive"
              icon={<BarChart2 className="h-4 w-4" />}
            />
            <MetricCard
              title="Duración Promedio"
              value="05:32"
              change="-1%"
              changeType="negative"
              icon={<Phone className="h-4 w-4" />}
            />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-12 lg:col-span-2">
            <CardHeader>
                <CardTitle>Satisfacción NPS</CardTitle>
            </CardHeader>
            <CardContent>
                 <SentimentChart sentimentData={sentimentData} isLoading={isLoading} />
            </CardContent>
        </Card>
        <Card className="col-span-12 lg:col-span-5">
            <CardHeader>
                <CardTitle>Llamadas por Día</CardTitle>
            </CardHeader>
            <CardContent>
                <CallsDayChart />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
