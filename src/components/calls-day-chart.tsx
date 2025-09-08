'use client';

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartData = [
  { day: "Lunes", calls: 90 },
  { day: "Martes", calls: 110 },
  { day: "Miércoles", calls: 80 },
  { day: "Jueves", calls: 120 },
  { day: "Viernes", calls: 100 },
  { day: "Sábado", calls: 60 },
  { day: "Domingo", calls: 40 },
];

const chartConfig = {
  calls: {
    label: 'Llamadas',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function CallsDayChart() {
  return (
    <div className="h-[250px] w-full">
      <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="calls" fill="var(--color-calls)" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
