// Subscription status types
export type ISubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'canceled'
  | 'expired'
  | 'past_due';

// Subscription billing cycles
export type IBillingCycle = 'monthly' | 'quarter' | 'yearly';

// Subscription metadata (optional)
export interface SubscriptionMetadata {
  provider?: 'square' | 'stripe' | 'paypal';
  externalId?: string; // e.g., invoice or subscription ID from provider
  notes?: string;
}

// Subscription extension for purchases/renewals
export interface ISubscriptionExtension {
  PurchaseDate: Date;
  DurationUOM: 'YEARS' | 'MONTHS' | 'DAYS';
  DurationUnits: number;
  EffectiveUTC: Date;
  ExpirationUTC: Date;
}

// Subscription model
export interface ITenantSubscription {
  id: string;
  tenantId: string;
  tierId: string;
  status: ISubscriptionStatus;
  billingCycle: IBillingCycle;
  metadata?: SubscriptionMetadata;
  EffectiveUTC: Date;
  ExpirationUTC?: Date;
  CreatedByUserId?: number;
  CreatedByProperName: string;
  CreatedUTC?: Date;
  SubscriptionSelection?: ISubscriptionSelection; // Manages which UI features are available
}

export interface ISubscriptionAsset {
  key: string; // e.g., 'export_csv', 'advanced_dashboard', 'lessonBuilderV2', 'showCreateTeamDialog'
  description: string; // Description of what this asset provides
  enabled: boolean; // Whether this asset is currently enabled
  visible: boolean; // Whether this asset is visible in the UI
  asAddOn: boolean; // Whether this is an add-on feature (true) or base feature (false)
}

// Resource limit types
export type ILimitType =
  | 'tenantMaxActiveDatasets' // The limit of the number of active tenant (non-system) dataset.
  | 'tenantMaxActiveTeams' // the limit of the number of active teams within the tenant.
  | 'tenantMaxActiveLessons' // the limit of the number of active lessons within the tenant.
  | 'tenantMaxActiveUsers' // the limit of the number of active users within the tenant. (Free is 1, Explorer is 1, Pro is 22, Enterprise is 10000)
  | 'userMaxActiveDatasets'
  | 'userMaxActiveTeams'
  | 'userExplorerLimit'
  | 'userFavoritesLimit'
  | 'userBookmarksLimit'
  | 'teamMaxActiveDatasets'
  | 'teamMaxActiveTeamGroups'
  | 'teamMaxRosterSize';

// Subscription limit for resource constraints
export interface ISubscriptionLimit {
  type: ILimitType;
  description?: string; // e.g., "Maximum number of datasets allowed"
  baseLimit: number; // Base limit normally allowed (use -1 for unlimited)
  tierLimit: number; // Limit allowed by subscription tier (use -1 for unlimited)
  addOnLimit?: number; // Additional limit from add-ons (use 0 for none)
  currentLimit: number; // Current effective limit (use -1 for unlimited)
  warningAt?: number; // Threshold for warnings
  asAddOn?: boolean; // Whether this is an add-on limit (defaults to false)
}

export interface ISubscriptionLimitStatus extends ISubscriptionLimit {
  currentValue: number; // Current usage count (defaults to 0)
  remainingValue: number; // Remaining available count (defaults to currentLimit - currentValue)
  inWarning: boolean; // Whether current usage is in warning range
  inViolation: boolean; // Whether current usage exceeds the limit
}
// Asset Manager interface for managing UI components availability
export interface ISubscriptionControls {
  toolbars: ISubscriptionAsset[]; // Array of toolbar assets
  dialogs: ISubscriptionAsset[]; // Array of dialog assets
  drawers: ISubscriptionAsset[]; // Array of drawer assets
  limits: ISubscriptionLimit[]; // Array of subscription limits
  extensions: ISubscriptionExtension[];
}

// Tier definition (e.g., Free, Pro, Enterprise)
export interface ISubscriptionTier {
  TierID: string; // e.g., 'free','student-of-the-game', 'pro', 'enterprise'
  TierName: string;
  TierGroup: 'MASTER' | 'ADD-ON' | 'PERSONAL' | 'TEAM' | 'ENTERPRISE';
  Assets: ISubscriptionControls; // Base assets and limits for this tier
  AddOnPackagesAvailable?: IAddOnPackage[]; // Optional add-on packages for this tier
}

export interface ISubscriptionSelection extends ISubscriptionTier {
  AddOnPackagesSelections: IAddOnPackage[]; // Optional add-on packages for this tier
  ConfiguredSubscription: ISubscriptionControls; // Base assets and limits for this tier
}
export interface IAddOnPackage extends ISubscriptionTier {
  AppliesToTiers: string[]; // Array of TierIDs this add-on applies to
}
