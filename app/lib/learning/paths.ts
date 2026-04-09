import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import type { LearningPath, LearningPathStep, UserLearningProgress } from '@/app/lib/supabase/types';

export async function fetchLearningPaths(targetBachelor?: string): Promise<LearningPath[]> {
  const supabase = getSupabaseServerClient();
  let query = supabase.from('LearningPaths').select('*, steps:LearningPathSteps(*)');

  if (targetBachelor) {
    query = query.eq('target_bachelor', targetBachelor);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  // Map to camelCase types
  return data.map((path: any) => ({
    id: path.id,
    title: path.title,
    description: path.description,
    targetBachelor: path.target_bachelor,
    createdAt: path.created_at,
    createdBy: path.created_by,
    steps: path.steps?.sort((a: any, b: any) => a.step_order - b.step_order).map((step: any) => ({
      id: step.id,
      pathId: step.path_id,
      stepOrder: step.step_order,
      resourceType: step.resource_type,
      resourceId: step.resource_id,
      title: step.title,
      difficulty: step.difficulty,
    })),
  }));
}

export async function fetchLearningPathDetails(pathId: string): Promise<LearningPath | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('LearningPaths')
    .select('*, steps:LearningPathSteps(*)')
    .eq('id', pathId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    targetBachelor: data.target_bachelor,
    createdAt: data.created_at,
    createdBy: data.created_by,
    steps: data.steps?.sort((a: any, b: any) => a.step_order - b.step_order).map((step: any) => ({
      id: step.id,
      pathId: step.path_id,
      stepOrder: step.step_order,
      resourceType: step.resource_type,
      resourceId: step.resource_id,
      title: step.title,
      difficulty: step.difficulty,
    })),
  };
}

export async function fetchUserPathProgress(userId: string): Promise<UserLearningProgress[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('UserLearningProgress')
    .select('*')
    .eq('user_id', userId);

  if (error || !data) return [];

  return data.map((progress: any) => ({
    id: progress.id,
    userId: progress.user_id,
    stepId: progress.step_id,
    completedAt: progress.completed_at,
  }));
}

export async function markPathStepComplete(userId: string, stepId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  await supabase
    .from('UserLearningProgress')
    .upsert({ user_id: userId, step_id: stepId, completed_at: new Date().toISOString() }, { onConflict: 'user_id, step_id' });
}
