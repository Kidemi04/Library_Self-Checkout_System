import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchAuditLogs } from '@/app/actions/audit';
import AuditLogViewer from '@/app/ui/dashboard/audit-log-viewer';
import { redirect } from 'next/navigation';

export default async function AuditLogPage() {
  const session = await getDashboardSession();

  // Only admin users can access audit logs
  if (!session.user || session.role !== 'admin') {
    redirect('/dashboard');
  }

  const auditLogs = await fetchAuditLogs();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Audit Log</h1>
      <AuditLogViewer initialEntries={auditLogs} />
    </div>
  );
}