/**
 * Valid context types for identifying entity contexts
 */
export type ContextName =
  | 'USER'
  | 'COACH'
  | 'PLAYER'
  | 'TENANT'
  | 'TEAM'
  | 'TEAMGROUP';

/**
 * Represents a context with a type and key identifier.
 * Used for identifying entities like users, teams, team groups, players, etc.
 */
export interface IContext {
  Context: ContextName; // Context type
  ContextKey: number; // ID of the context entity
}
