import { ILimitType } from '../interfaces/subscription.interfaces';

export interface LimitDisplayInfo {
  group: string;
  name: string;
  description: string;
}

/**
 * Map of limit types to their display information
 */
export const LIMIT_DISPLAY_MAP: Record<ILimitType, LimitDisplayInfo> = {
  // Tenant Limits
  tenantMaxActiveDatasets: {
    group: 'Tenant Limits',
    name: 'Max Active Datasets',
    description: 'Maximum number of active tenant (non-system) datasets',
  },
  tenantMaxActiveTeams: {
    group: 'Tenant Limits',
    name: 'Max Active Teams',
    description: 'Maximum number of active teams within the tenant',
  },
  tenantMaxActiveLessons: {
    group: 'Tenant Limits',
    name: 'Max Active Lessons',
    description: 'Maximum number of active lessons within the tenant',
  },
  tenantMaxActiveUsers: {
    group: 'Tenant Limits',
    name: 'Max Active Users',
    description: 'Maximum number of active users within the tenant',
  },

  // User Limits
  userMaxActiveDatasets: {
    group: 'User Limits',
    name: 'Max Active Datasets',
    description: 'Maximum number of active datasets per user',
  },
  userMaxActiveTeams: {
    group: 'User Limits',
    name: 'Max Active Teams',
    description: 'Maximum number of active teams per user',
  },
  userExplorerLimit: {
    group: 'User Limits',
    name: 'Explorer Limit',
    description: 'Maximum number of explorer items per user',
  },
  userFavoritesLimit: {
    group: 'User Limits',
    name: 'Favorites Limit',
    description: 'Maximum number of favorites per user',
  },
  userBookmarksLimit: {
    group: 'User Limits',
    name: 'Bookmarks Limit',
    description: 'Maximum number of bookmarks per user',
  },

  // Team Limits
  teamMaxActiveDatasets: {
    group: 'Team Limits',
    name: 'Max Active Datasets',
    description: 'Maximum number of active datasets per team',
  },
  teamMaxActiveTeamGroups: {
    group: 'Team Limits',
    name: 'Max Active Team Groups',
    description: 'Maximum number of active team groups per team',
  },
  teamMaxRosterSize: {
    group: 'Team Limits',
    name: 'Max Roster Size',
    description: 'Maximum roster size per team',
  },
};

/**
 * Get display information for a limit type
 */
export function getLimitDisplayInfo(limitType: ILimitType): LimitDisplayInfo {
  return LIMIT_DISPLAY_MAP[limitType];
}

/**
 * Get all unique limit groups
 */
export function getLimitGroups(): string[] {
  const groups = new Set<string>();
  Object.values(LIMIT_DISPLAY_MAP).forEach((info) => groups.add(info.group));
  return Array.from(groups).sort();
}

/**
 * Format a limit value for display (-1 means unlimited)
 */
export function formatLimitValue(value: number): string {
  return value === -1 ? 'Unlimited' : value.toString();
}
