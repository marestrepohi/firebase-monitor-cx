
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader } from 'lucide-react';
import { transcribeAudio } from '@/app/actions';

export function TranscriptionPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleTranscribe = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo de audio.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranscription('');

    try {
        const formData = new FormData();
        formData.append('file', file);

        const result = await transcribeAudio(formData);
        setTranscription(result);

    } catch (err) {
      setError('Ocurrió un error durante la transcripción. Por favor, inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcripción de Audio</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
            <Label htmlFor='audio-file'>Archivo de Audio</Label>
            <Input id='audio-file' type='file' onChange={handleFileChange} accept='audio/*' />
        </div>
        <Button onClick={handleTranscribe} disabled={isLoading || !file}>
          {isLoading ? <Loader className='w-4 h-4 animate-spin mr-2' /> : null}
          {isLoading ? 'Transcribiendo...' : 'Transcribir Audio'}
        </Button>
        {error && <p className='text-red-500 text-sm'>{error}</p>}
        {transcription && (
          <div className='space-y-2'>
            <Label>Resultado de la Transcripción</Label>
            <Textarea value={transcription} readOnly rows={15} className='bg-muted' />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
