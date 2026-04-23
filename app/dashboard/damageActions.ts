'use server';

import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

export type DamagePhotoUploadResult =
  | { status: 'success'; urls: string[] }
  | { status: 'error'; message: string };

const MAX_PHOTOS = 3;
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function uploadDamagePhotos(formData: FormData): Promise<DamagePhotoUploadResult> {
  const { user } = await getDashboardSession();
  if (!user) return { status: 'error', message: 'You must be signed in.' };
  if (user.role !== 'staff' && user.role !== 'admin') {
    return { status: 'error', message: 'Only staff can report damage.' };
  }

  const loanId = formData.get('loanId');
  if (typeof loanId !== 'string' || loanId.length === 0) {
    return { status: 'error', message: 'Missing loan reference.' };
  }

  const rawFiles = formData.getAll('photos').filter((f): f is File => f instanceof File);
  if (rawFiles.length === 0) return { status: 'success', urls: [] };
  if (rawFiles.length > MAX_PHOTOS) {
    return { status: 'error', message: `Please attach at most ${MAX_PHOTOS} photos.` };
  }

  for (const file of rawFiles) {
    if (file.size > MAX_BYTES) {
      return { status: 'error', message: 'Each photo must be under 2 MB.' };
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return { status: 'error', message: 'Photos must be JPEG, PNG, or WEBP.' };
    }
  }

  const supabase = getSupabaseServerClient();
  const urls: string[] = [];
  const uploadedPaths: string[] = [];

  for (let i = 0; i < rawFiles.length; i++) {
    const file = rawFiles[i];
    if (!file) continue;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${loanId}/${Date.now()}-${i}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('damage-reports')
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (uploadError) {
      // rollback any uploads done so far
      if (uploadedPaths.length > 0) {
        await supabase.storage.from('damage-reports').remove(uploadedPaths);
      }
      console.error('Damage photo upload failed', uploadError);
      return { status: 'error', message: 'Upload failed. Please try again.' };
    }
    uploadedPaths.push(path);
    urls.push(path);
  }

  return { status: 'success', urls };
}
