export default async function AdminDashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // We keep the layout thin. 
  // Authorization and Title Bar are now handled at the page level 
  // to allow for more specific page-based UI control.
  return (
    <div className="space-y-8">
      {children}
    </div>
  );
}