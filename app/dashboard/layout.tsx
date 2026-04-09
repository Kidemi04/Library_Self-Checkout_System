import { redirect } from 'next/navigation';
import DashboardShell from '@/app/ui/dashboard/dashboardShell';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import InterestSetupModal from '@/app/ui/dashboard/interestSetupModal';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isBypassed } = await getDashboardSession();
  
  if (!user) redirect('/login');

  const supabase = getSupabaseServerClient();
  
  const { data: profile } = await supabase
    .from('UserProfile')
    .select('interest')
    .eq('user_id', user.id)
    .maybeSingle();

  const showInterestModal = !isBypassed && !profile?.interest;

  return (
    <DashboardShell user={user} isBypassed={isBypassed}>
      {showInterestModal && <InterestSetupModal />}
      
      {children}
    </DashboardShell>
  );
}