'use client';

import { SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarTrigger } from '@/components/ui/sidebar';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface SidebarControlsProps {
  maxRecords: number;
  recordLimit: number;
  onRecordLimitChange: (limit: number) => void;
}

export function SidebarControls({
  maxRecords,
  recordLimit,
  onRecordLimitChange,
}: SidebarControlsProps) {
  return (
    <>
      <SidebarHeader className='p-4 justify-between flex flex-row items-center'>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold font-headline text-primary">Aval IA</h2>
          </div>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
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
      </SidebarContent>
    </>
  );
}
