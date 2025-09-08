'use client';

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import type { SentimentAnalysisOutput } from '@/ai/flows/sentiment-analysis-aggregation';

interface SentimentChartProps {
  sentimentData: SentimentAnalysisOutput | null;
  isLoading: boolean;
}

const chartConfig = {
  positive: {
    label: 'Positivo',
    color: 'hsl(var(--chart-2))',
  },
  negative: {
    label: 'Negativo',
    color: 'hsl(var(--chart-1))',
  },
  neutral: {
    label: 'Neutral',
    color: 'hsl(var(--muted-foreground))',
  },
} satisfies ChartConfig;

export function SentimentChart({ sentimentData, isLoading }: SentimentChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  if (!sentimentData) {
    return <div className="text-center text-muted-foreground">No hay datos para mostrar.</div>;
  }
  
  const chartData = [
    {
      label: 'Sentimiento',
      positive: sentimentData.positiveSentimentCount,
      negative: sentimentData.negativeSentimentCount,
      neutral: sentimentData.neutralSentimentCount,
    },
  ];

  return (
    <div className="h-[200px] w-full">
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              hide
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Bar dataKey="positive" stackId="a" fill="var(--color-positive)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="negative" stackId="a" fill="var(--color-negative)" />
            <Bar dataKey="neutral" stackId="a" fill="var(--color-neutral)" radius={[4, 0, 0, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
      <p className="text-xs text-muted-foreground mt-2 text-center">{sentimentData.overallSentimentTrend}</p>
    </div>
  );
}
