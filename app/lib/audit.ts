import { getSupabaseServerClient } from '@/app/lib/supabase/server';

type AuditParams = {
  action: string;
  entity: string;
  entityId?: string | number | null;
  actorId?: string | null;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
};

const buildChangePayload = ({
  before,
  after,
  metadata,
}: Pick<AuditParams, 'before' | 'after' | 'metadata'>) => {
  const payload: Record<string, unknown> = {};
  if (typeof before !== 'undefined') {
    payload.before = before;
  }
  if (typeof after !== 'undefined') {
    payload.after = after;
  }
  if (metadata && Object.keys(metadata).length > 0) {
    payload.metadata = metadata;
  }
  return Object.keys(payload).length > 0 ? payload : null;
};

export const audit = async ({
  action,
  entity,
  entityId,
  actorId,
  before,
  after,
  metadata,
}: AuditParams) => {
  try {
    const supabase = getSupabaseServerClient();
    const changedData = buildChangePayload({ before, after, metadata });

    await supabase.from('audit_log').insert({
      table_name: entity,
      record_id: entityId ?? null,
      action,
      changed_data: changedData,
      performed_by: actorId ?? null,
    });
  } catch (error) {
    console.error('Failed to insert audit log entry', error);
  }
};

export type { AuditParams };
