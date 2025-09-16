'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { SidebarControls } from './sidebar-controls';
import { useMemo, useState } from 'react';
import { QUESTIONS_FOR_REPORTS } from '@/lib/constants';

interface ReportConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  recordLimit: number;
  onRecordLimitChange: (limit: number) => void;
  maxRecords: number;
  datasetName: string;
  onDatasetChange: (name: string) => void;
  questions: string[];
  onQuestionsChange: (qs: string[]) => void;
}

export function ReportConfigDialog({
  isOpen,
  onOpenChange,
  recordLimit,
  onRecordLimitChange,
  maxRecords,
  datasetName,
  onDatasetChange,
  questions,
  onQuestionsChange,
}: ReportConfigDialogProps) {
  const [newQuestion, setNewQuestion] = useState('');
  const defaults = useMemo(() => QUESTIONS_FOR_REPORTS, []);

  const toggleQuestion = (q: string) => {
    if (questions.includes(q)) {
      onQuestionsChange(questions.filter(x => x !== q));
    } else {
      onQuestionsChange([...questions, q]);
    }
  };

  const addCustomQuestion = () => {
    const q = newQuestion.trim();
    if (!q) return;
    onQuestionsChange([...questions, q]);
    setNewQuestion('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuración del Informe</DialogTitle>
          <DialogDescription>
            Ajusta la fuente de datos y el límite de registros para el generador de informes.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <SidebarControls
            recordLimit={recordLimit}
            onRecordLimitChange={onRecordLimitChange}
            maxRecords={maxRecords}
            datasetName={datasetName}
            onDatasetChange={onDatasetChange}
          />
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium">Preguntas del informe</h4>
            <div className="max-h-64 overflow-auto border rounded-md p-2 space-y-2">
              {defaults.map((q) => (
                <label key={q} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={questions.includes(q)}
                    onChange={() => toggleQuestion(q)}
                  />
                  <span>{q}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Agregar pregunta personalizada"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="flex-1 h-9 px-2 rounded-md border bg-background text-sm"
              />
              <button
                type="button"
                onClick={addCustomQuestion}
                className="h-9 px-3 rounded-md border text-sm"
              >Añadir</button>
            </div>
            {!!questions.length && (
              <p className="text-xs text-muted-foreground">Seleccionadas: {questions.length}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onQuestionsChange(defaults)}
                className="h-8 px-3 rounded-md border text-xs"
                title="Restaurar la lista de preguntas al conjunto por defecto"
              >Restaurar preguntas por defecto</button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
