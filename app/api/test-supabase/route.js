import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase
    .from('books') 
    .select('*')
    .limit(1);

  if (error) {
    return Response.json({ success: false, error: error.message });
  }

  return Response.json({ success: true, data });
}
