/**
 * User Summary - Lightweight user information for display
 */
export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
}

/**
 * Full User Info (for auth context)
 */
export interface UserInfo extends UserSummary {
  roles: string[];
  tenantId: string;
}
