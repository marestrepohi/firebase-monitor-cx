'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getChatResponse } from '@/app/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatPanelProps {
  evaluationContext: string;
  defaultDataset: string;
  recordLimit: number;
  resetSignal?: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const formSchema = z.object({
  prompt: z.string().min(1, 'Por favor, escribe una pregunta.'),
});

type FormValues = z.infer<typeof formSchema>;

export function ChatPanel({ evaluationContext, defaultDataset, recordLimit, resetSignal }: ChatPanelProps) {
  const [datasetName, setDatasetName] = useState<string>(defaultDataset);
  const [limit, setLimit] = useState<number>(recordLimit);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('auditbotMessages');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [{ role: 'assistant', content: 'Hola, soy tu asistente de análisis de llamadas. ¿En qué puedo ayudarte hoy?' }];
  });
  // Persist messages on change
  useEffect(() => {
    try { localStorage.setItem('auditbotMessages', JSON.stringify(messages)); } catch {}
  }, [messages]);

  // Sincronizar dataset y límite cuando cambian las props (diálogo global)
  useEffect(() => {
    setDatasetName(defaultDataset);
  setNeedsReset(true);
  }, [defaultDataset]);
  useEffect(() => {
    setLimit(recordLimit);
  setNeedsReset(true);
  }, [recordLimit]);

  // Reset externo: cuando cambie resetSignal, limpiar conversación dejando el saludo
  useEffect(() => {
    if (resetSignal == null) return;
    setMessages([{ role: 'assistant', content: 'Hola, soy tu asistente de análisis de llamadas. ¿En qué puedo ayudarte hoy?' }]);
    try { localStorage.setItem('auditbotMessages', JSON.stringify([{ role: 'assistant', content: 'Hola, soy tu asistente de análisis de llamadas. ¿En qué puedo ayudarte hoy?' }])); } catch {}
    setNeedsReset(true);
  }, [resetSignal]);

  // Optional: attempt to load evaluation context cache if none provided
  useEffect(() => {
    if (!evaluationContext && typeof window !== 'undefined') {
      const cached = localStorage.getItem('evaluationContextCache');
      if (cached) {
        // Insert a helper assistant note (not pushing to history for now)
      }
    }
  }, [evaluationContext]);

  const summarizeIfLong = async (text: string): Promise<string> => {
    const HARD_LIMIT = 24000;
    if (text.length <= HARD_LIMIT) return text;
    // Lado cliente: pedimos al backend que resuma reutilizando acción existente (por ahora simple corte para no bloquear)
    return text.slice(0, HARD_LIMIT) + '\n[Contexto recortado para ajuste de tokens]';
  };

  const [isLoading, setIsLoading] = useState(false);
  const [needsReset, setNeedsReset] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    const userMessage: Message = { role: 'user', content: data.prompt };
    setMessages((prev) => [...prev, userMessage]);
    reset();

  // Pre-resumen local si el contexto inyectado es muy grande para reducir coste
  const preparedContext = await summarizeIfLong(evaluationContext || '');
  const callWithTimeout = async <T,>(p: Promise<T>, ms: number): Promise<T> => {
    return await Promise.race([
      p,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ]);
  };
  try {
    const response = await callWithTimeout(
      getChatResponse(data.prompt, { datasetName, limit, rawContext: preparedContext || undefined, reset: needsReset }),
      45000
    );
    if (needsReset) setNeedsReset(false);
    const assistantMessage: Message = { role: 'assistant', content: response.answer };
    setMessages((prev) => [...prev, assistantMessage]);
  } catch (err: any) {
    const isTimeout = err && err.message === 'timeout';
    const errorText = isTimeout
      ? '⏳ El modelo está tardando más de lo esperado. Por favor, intenta de nuevo o ajusta el límite de registros/dataset.'
      : '⚠️ Ocurrió un error al procesar tu solicitud. Intenta nuevamente. Si persiste, revisa la conexión o reduce el límite de registros.';
    const assistantMessage: Message = { role: 'assistant', content: errorText };
    setMessages((prev) => [...prev, assistantMessage]);
    console.error('Error en chat:', err);
  } finally {
    setIsLoading(false);
  }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  return (
    <Card className="w-full h-[84vh] md:h-[86vh] flex flex-col">
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden pt-4">
        <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarImage src="https://static.wikia.nocookie.net/logopedia/images/1/1c/BancodeBogot%C3%A12008verticalplane.svg/revision/latest/scale-to-width-down/32?cb=20240518224319&path-prefix=es" alt="Auditbot" />
                    <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'rounded-lg p-3 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none prose-p:my-2 prose-strong:font-semibold prose-table:my-2 prose-th:font-semibold prose-th:px-2 prose-td:px-2 prose-td:py-1 prose-ul:my-2 prose-ol:my-2">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({href, children, ...props}) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline text-primary hover:opacity-80 break-words"
                              {...props}
                            >
                              {children}
                            </a>
                          ),
                          code: (props: any) => {
                            const { inline, className, children, ...rest } = props || {};
                            const content = String(children ?? '');
                            if (inline) {
                              return (
                                <code className="bg-muted-foreground/10 text-foreground rounded px-1 py-0.5" {...rest}>
                                  {content}
                                </code>
                              );
                            }
                            // Block code
                            return (
                              <pre className="bg-zinc-950/90 text-zinc-100 rounded-md p-3 overflow-x-auto">
                                <code className={className} {...rest}>{content}</code>
                              </pre>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
                 {message.role === 'user' && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
               <div className='flex items-start gap-3 justify-start'>
                  <Avatar className="w-8 h-8 border">
                    <AvatarImage src="https://static.wikia.nocookie.net/logopedia/images/1/1c/BancodeBogot%C3%A12008verticalplane.svg/revision/latest/scale-to-width-down/32?cb=20240518224319&path-prefix=es" alt="Auditbot" />
                    <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                  <div className='bg-muted rounded-lg p-3 flex items-center gap-2'>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Pensando la respuesta…</span>
                  </div>
                </div>
            )}
          </div>
        </ScrollArea>
  <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-2 pt-3 border-t">
          <div className="flex-1">
            <Input
              {...register('prompt')}
              placeholder="¿Qué quieres saber de las llamadas?"
              autoComplete="off"
              disabled={isLoading}
            />
            {errors.prompt && <p className="text-xs text-destructive mt-1">{errors.prompt.message}</p>}
          </div>
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
        </form>
      </CardContent>
    </Card>
  );
}
