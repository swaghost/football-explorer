import { IContext } from './context.interface';

/**
 * Ownership context interface
 * Defines the ownership level and context ID for resources in the system
 *
 * The Context property determines ownership:
 * - 'USER': User-level resource (personal to a specific user)
 * - 'TENANT': Tenant/Organization-level resource (or System if ContextKey is -1)
 * - 'TEAM': Team-level resource
 * - 'TEAMGROUP': Team group-level resource
 *
 * The ContextKey determines the specific owner:
 * - -1: System-wide resource (when Context is 'TENANT')
 * - UserID: For user-level resources (when Context is 'USER')
 * - TenantID: For tenant-level resources (when Context is 'TENANT')
 * - TeamID: For team-level resources (when Context is 'TEAM')
 * - TeamGroupID: For team group-level resources (when Context is 'TEAMGROUP')
 */
export interface OwnershipContext extends IContext {}
