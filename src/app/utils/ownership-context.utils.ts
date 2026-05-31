import { OwnershipContext } from '../interfaces/ownership-context.interface';

/**
 * Utility functions for ownership context comparison and validation
 */

/**
 * Context match result with detailed information
 */
export interface OwnershipContextMatchResult {
  allowed: boolean;
  reason: string;
  contextType: 'system' | 'personal' | 'tenant' | 'team' | 'legacy' | 'unknown';
}

/**
 * Context comparison parameters
 */
export interface ContextComparisonParams {
  currentTenantId: number | null | undefined;
  currentTeamId: number | null | undefined;
  currentTeamGroupId?: number | null | undefined;
  debugLogging?: boolean;
}

/**
 * Check if a resource with the given ownership context is accessible to the current user
 *
 * New Rules:
 * 1. SYSTEM (Tenant -1): Only see system resources
 * 2. PERSONAL (Tenant 0): Only see SYSTEM and PERSONAL resources
 * 3. Regular Tenant (Tenant > 0): Only see SYSTEM and that specific tenant's resources
 * 4. TEAM resources: Only visible when a team is selected and matches current team
 *
 * @param ownershipContext - The ownership context of the resource
 * @param params - Current user context (tenant, team, etc.)
 * @returns Match result with allowed status and detailed information
 */
export function isOwnershipContextAllowed(
  ownershipContext: OwnershipContext | null | undefined,
  params: ContextComparisonParams
): OwnershipContextMatchResult {
  const { currentTenantId, currentTeamId, debugLogging = false } = params;

  // Default to allowed if no ownership context
  if (!ownershipContext) {
    const result: OwnershipContextMatchResult = {
      allowed: true,
      reason: 'No ownership context specified',
      contextType: 'unknown',
    };
    if (debugLogging) {
      console.log('✅ Ownership check:', result);
    }
    return result;
  }

  let result: OwnershipContextMatchResult;

  switch (ownershipContext.Context) {
    case 'TENANT':
      if (ownershipContext.ContextKey === -1) {
        // System-level resources are visible to everyone
        result = {
          allowed: true,
          reason:
            'System-level resource (Context: -1) - visible to all tenants',
          contextType: 'system',
        };
      } else if (ownershipContext.ContextKey === 0) {
        // Personal resources are only visible when user is in PERSONAL or SYSTEM context
        const allowed = currentTenantId === 0 || currentTenantId === -1;
        result = {
          allowed,
          reason: allowed
            ? `Personal resource visible to current context (tenant: ${currentTenantId})`
            : `Personal resource not visible to tenant context (tenant: ${currentTenantId})`,
          contextType: 'personal',
        };
      } else {
        // Tenant-specific resources - visible to SYSTEM and matching tenant only
        const allowed =
          currentTenantId === -1 ||
          ownershipContext.ContextKey === currentTenantId;
        result = {
          allowed,
          reason: allowed
            ? currentTenantId === -1
              ? `Tenant resource visible to SYSTEM context`
              : `Tenant resource matches current tenant (${currentTenantId})`
            : `Tenant resource (${ownershipContext.Context}) not visible to current tenant (${currentTenantId})`,
          contextType: 'tenant',
        };
      }
      break;

    case 'TEAM':
      // Team resources are only visible when a team is selected and matches
      const teamMatches =
        currentTeamId !== null &&
        currentTeamId !== undefined &&
        ownershipContext.ContextKey === currentTeamId;
      result = {
        allowed: teamMatches,
        reason: teamMatches
          ? `Team resource matches current team (${currentTeamId})`
          : currentTeamId === null || currentTeamId === undefined
          ? 'Team resource not visible - no team selected'
          : `Team resource (${ownershipContext.Context}) does not match current team (${currentTeamId})`,
        contextType: 'team',
      };
      break;

    case 'TEAMGROUP':
      // Team group resources are only visible when both team and team group are selected and match
      const { currentTeamGroupId } = params;
      const teamGroupMatches =
        currentTeamId !== null &&
        currentTeamId !== undefined &&
        currentTeamGroupId !== null &&
        currentTeamGroupId !== undefined &&
        ownershipContext.ContextKey === currentTeamGroupId;
      result = {
        allowed: teamGroupMatches,
        reason: teamGroupMatches
          ? `Team group resource matches current team group (${currentTeamGroupId})`
          : currentTeamId === null || currentTeamId === undefined
          ? 'Team group resource not visible - no team selected'
          : currentTeamGroupId === null || currentTeamGroupId === undefined
          ? 'Team group resource not visible - no team group selected'
          : `Team group resource (${ownershipContext.Context}) does not match current team group (${currentTeamGroupId})`,
        contextType: 'team',
      };
      break;

    case 'USER':
      // User-level resources - always accessible to the user who owns them
      // TODO: Add user ID matching when user context is available in params
      result = {
        allowed: true,
        reason: 'User resource - accessible to owner',
        contextType: 'personal',
      };
      break;

    default:
      // Unknown context - default to allowed for backward compatibility
      result = {
        allowed: true,
        reason: `Unknown context type: ${ownershipContext.Context}`,
        contextType: 'unknown',
      };
  }

  if (debugLogging) {
    console.log('🔍 Ownership context check:', {
      ownershipContext,
      currentTenantId,
      currentTeamId,
      result,
    });
  }

  return result;
}

/**
 * Check if a resource is a system-level resource
 *
 * @param ownershipContext - The ownership context to check
 * @returns True if the resource is system-level (TENANT with Context -1)
 */
export function isSystemLevelResource(
  ownershipContext: OwnershipContext | null | undefined
): boolean {
  if (!ownershipContext) return false;

  return (
    ownershipContext.Context === 'TENANT' && ownershipContext.ContextKey === -1
  );
}

/**
 * Check if a resource is a personal-level resource
 *
 * @param ownershipContext - The ownership context to check
 * @returns True if the resource is personal-level
 */
export function isPersonalLevelResource(
  ownershipContext: OwnershipContext | null | undefined
): boolean {
  if (!ownershipContext) return false;

  return ownershipContext.Context === 'USER';
}

/**
 * Check if a resource is a tenant-level resource (not system or personal)
 *
 * @param ownershipContext - The ownership context to check
 * @returns True if the resource is tenant-level
 */
export function isTenantLevelResource(
  ownershipContext: OwnershipContext | null | undefined
): boolean {
  if (!ownershipContext) return false;

  return (
    ownershipContext.Context === 'TENANT' &&
    ownershipContext.ContextKey !== -1 &&
    ownershipContext.ContextKey !== 0
  );
}

/**
 * Check if a resource is a team-level resource
 *
 * @param ownershipContext - The ownership context to check
 * @returns True if the resource is team-level
 */
export function isTeamLevelResource(
  ownershipContext: OwnershipContext | null | undefined
): boolean {
  if (!ownershipContext) return false;

  return ownershipContext.Context === 'TEAM';
}

/**
 * Check if a resource is a team group-level resource
 *
 * @param ownershipContext - The ownership context to check
 * @returns True if the resource is team group-level
 */
export function isTeamGroupLevelResource(
  ownershipContext: OwnershipContext | null | undefined
): boolean {
  if (!ownershipContext) return false;

  return ownershipContext.Context === 'TEAMGROUP';
}

/**
 * Get a human-readable description of the ownership context
 *
 * @param ownershipContext - The ownership context to describe
 * @param tenantName - Optional tenant name for better descriptions
 * @param teamName - Optional team name for better descriptions
 * @returns Human-readable description
 */
export function getOwnershipContextDescription(
  ownershipContext: OwnershipContext | null | undefined,
  tenantName?: string | null,
  teamName?: string | null
): string {
  if (!ownershipContext) {
    return 'No ownership context';
  }

  switch (ownershipContext.Context) {
    case 'USER':
      return `User resource (ID: ${ownershipContext.Context})`;

    case 'TENANT':
      if (ownershipContext.ContextKey === -1) {
        return 'System-wide resource';
      } else {
        return tenantName
          ? `${tenantName} resource`
          : `Tenant resource (ID: ${ownershipContext.ContextKey})`;
      }

    case 'TEAM':
      return teamName
        ? `${teamName} resource`
        : `Team resource (ID: ${ownershipContext.ContextKey})`;

    case 'TEAMGROUP':
      return `Team group resource (ID: ${ownershipContext.ContextKey})`;

    default:
      return `Unknown context: ${ownershipContext.Context}`;
  }
}

/**
 * Get appropriate filter defaults based on current tenant context
 *
 * @param currentTenantId - Current tenant ID
 * @returns Object with recommended filter states
 */
export function getRecommendedFilterStates(
  currentTenantId: number | null | undefined
) {
  if (currentTenantId === -1) {
    // SYSTEM context: Only show system resources
    return {
      showSystem: true,
      showPersonal: false,
      showTenant: false,
      showTeam: false,
      reason: 'System context - only system resources visible',
    };
  } else if (currentTenantId === 0) {
    // PERSONAL context: Show system and personal resources
    return {
      showSystem: true,
      showPersonal: true,
      showTenant: false,
      showTeam: false,
      reason: 'Personal context - system and personal resources visible',
    };
  } else if (currentTenantId && currentTenantId > 0) {
    // Regular tenant context: Show system and tenant resources
    return {
      showSystem: true,
      showPersonal: false,
      showTenant: true,
      showTeam: false,
      reason: `Tenant context - system and tenant resources visible`,
    };
  } else {
    // No tenant selected: Default to system only
    return {
      showSystem: true,
      showPersonal: false,
      showTenant: false,
      showTeam: false,
      reason: 'No tenant context - defaulting to system only',
    };
  }
}

/**
 * Get a detailed explanation of what resources should be visible for a given tenant context
 *
 * @param currentTenantId - Current tenant ID
 * @param currentTeamId - Current team ID (optional)
 * @returns Detailed explanation string
 */
export function explainVisibilityRules(
  currentTenantId: number | null | undefined,
  currentTeamId?: number | null | undefined
): string {
  let explanation = '';

  if (currentTenantId === -1) {
    explanation =
      'SYSTEM CONTEXT: You can see all system-level resources only. No personal, tenant, or team resources are visible.';
  } else if (currentTenantId === 0) {
    explanation =
      'PERSONAL CONTEXT: You can see system-level and your personal resources only. No tenant-specific or team resources are visible, and this resource will not be available to others.';
  } else if (currentTenantId && currentTenantId > 0) {
    explanation = `TENANT CONTEXT (ID: ${currentTenantId}): You can see system-level and this tenant's resources only. Personal and other tenant resources are not visible.`;
  } else {
    explanation =
      'NO CONTEXT: No tenant selected. Only system resources are visible by default.';
  }

  if (currentTeamId !== null && currentTeamId !== undefined) {
    explanation += ` Additionally, team resources for team ${currentTeamId} are visible.`;
  } else {
    explanation += ' No team is selected, so team resources are not visible.';
  }

  return explanation;
}

/**
 * Create an ownership context object
 *
 * @param type - The type of context to create
 * @param contextId - The context ID (tenant ID, team ID, etc.)
 * @returns OwnershipContext object
 */
export function createOwnershipContext(
  type: 'SYSTEM' | 'USER' | 'TENANT' | 'TEAM' | 'TEAMGROUP',
  contextId?: number
): OwnershipContext {
  switch (type) {
    case 'SYSTEM':
      return { Context: 'TENANT', ContextKey: -1 };

    case 'USER':
      // Personal resources are now USER with the logged-in user's ID
      if (!contextId) {
        throw new Error('contextId (userId) is required for personal context');
      }
      return { Context: 'USER', ContextKey: contextId };

    case 'TENANT':
      return { Context: 'TENANT', ContextKey: contextId || -1 };

    case 'TEAM':
      return { Context: 'TEAM', ContextKey: contextId || -1 };

    case 'TEAMGROUP':
      return { Context: 'TEAMGROUP', ContextKey: contextId || -1 };

    default:
      throw new Error(`Invalid context type: ${type}`);
  }
}
