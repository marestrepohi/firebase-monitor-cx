'use client';

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
  );
}
