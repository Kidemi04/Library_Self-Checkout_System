export type DashboardRole = 'user' | 'staff' | 'admin';

export interface DashboardUserProfile {
  id: string;
  name: string | null;
  email: string | null;
  role: DashboardRole;
  username?: string | null;
  faculty?: string | null;
  department?: string | null;
}

export interface DashboardSessionResult {
  user: DashboardUserProfile | null;
  isBypassed: boolean;
  profileLoaded?: boolean;
}
