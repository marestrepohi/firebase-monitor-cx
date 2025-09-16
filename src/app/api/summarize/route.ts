import { NextRequest, NextResponse } from 'next/server';
import { summarizeContextFlow } from '@/ai/flows/summarize-context';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { context, maxChars = 4000 } = await req.json();
    if (typeof context !== 'string' || context.length === 0) {
      return NextResponse.json({ error: 'context requerido' }, { status: 400 });
    }
    const { summary } = await summarizeContextFlow({ context, maxChars });
    return NextResponse.json({ summary });
  } catch (e: any) {
    console.error('Summarize API error', e);
    return NextResponse.json({ error: 'Fallo al resumir' }, { status: 500 });
  }
}
