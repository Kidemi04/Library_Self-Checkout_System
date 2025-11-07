'use server';

import { getSupabaseServerClient } from '@/app/lib/supabase/server';

export type AuditLogFilters = {
  entity?: string;
  eventType?: string;
  dateRange?: 'today' | 'week' | 'month' | 'all';
  success?: boolean;
};

export async function fetchAuditLogs(filters: AuditLogFilters = {}) {
  const supabase = getSupabaseServerClient();

  let query = supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.entity) {
    query = query.eq('entity', filters.entity);
  }

  if (filters.eventType) {
    query = query.eq('event_type', filters.eventType);
  }

  if (filters.success !== undefined) {
    query = query.eq('success', filters.success);
  }

  if (filters.dateRange) {
    const now = new Date();
    let startDate: Date;

    switch (filters.dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      default:
        startDate = new Date(0); // Beginning of time
    }

    query = query.gte('created_at', startDate.toISOString());
  }

  const { data, error } = await query.limit(100);

  if (error) {
    console.error('Error fetching audit logs:', error);
    throw new Error('Failed to fetch audit logs');
  }

  return data;
}