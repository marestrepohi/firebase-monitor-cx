'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { DATASET_CONFIG } from '@/lib/constants';

interface SidebarControlsProps {
  maxRecords: number;
  recordLimit: number;
  onRecordLimitChange: (limit: number) => void;
  datasetName: string;
  onDatasetChange: (name: string) => void;
}

export function SidebarControls({
  maxRecords,
  recordLimit,
  onRecordLimitChange,
  datasetName,
  onDatasetChange,
}: SidebarControlsProps) {
  return (
    <div className="space-y-4 p-2">
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="dataset-select" className="text-sm">Fuente de datos</Label>
        </div>
        <select
          id="dataset-select"
          className="w-full border rounded-md h-9 px-2 text-sm bg-background"
          value={datasetName}
          onChange={(e) => onDatasetChange(e.target.value)}
        >
          {Object.keys(DATASET_CONFIG).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="record-limit-slider" className="text-sm">Límite de registros</Label>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{Math.min(Math.max(1, recordLimit), Math.max(1, maxRecords || 1))} / {Math.max(1, maxRecords || 1)}</span>
            <span className="hidden sm:inline">• Registros totales</span>
          </div>
        </div>
        <Slider
          id="record-limit-slider"
          min={1}
          max={Math.max(1, maxRecords || 1)}
          step={1}
          value={[Math.min(Math.max(1, recordLimit), Math.max(1, maxRecords || 1))]}
          onValueChange={(value) => onRecordLimitChange(value[0])}
        />
      </div>
    </div>
  );
}
