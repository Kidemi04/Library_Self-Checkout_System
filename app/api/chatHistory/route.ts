import { createClient } from '@/app/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('AiChatHistory')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const messages = data.map(row => ({
    id: row.message_id,
    sender: row.sender,
    text: row.text,
    timestamp: row.timestamp,
    recommendations: row.recommendations,
  }));

  return NextResponse.json({ messages });
}