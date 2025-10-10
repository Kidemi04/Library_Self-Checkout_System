export type DashboardRole = 'student' | 'staff';

export interface DashboardUserProfile {
  id: string;
  name: string | null;
  email: string | null;
  role: DashboardRole;
}

export interface DashboardSessionResult {
  user: DashboardUserProfile | null;
  isBypassed: boolean;
}
