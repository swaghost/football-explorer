import { Injectable } from '@angular/core';
import {
  ISubscriptionTier,
  ISubscriptionControls,
  IAddOnPackage,
  ISubscriptionAsset,
  ISubscriptionLimit,
} from '../interfaces/subscription.interfaces';

// Import master configuration
import masterConfig from '../config/subscriptions/subscription-assets.master.config.json';

// Import subscription tier options
import academyAcademy from '../config/subscriptions/subscription-options/subscription-assets.academy.1.academy.json';
import academyGrassroots from '../config/subscriptions/subscription-options/subscription-assets.academy.1.grassroots.json';
import academyUltimate from '../config/subscriptions/subscription-options/subscription-assets.academy.1.ultimate.json';
import individualExplorer from '../config/subscriptions/subscription-options/subscription-assets.individual.1.explorer.config.json';
import individualFree from '../config/subscriptions/subscription-options/subscription-assets.individual.2.free.config.json';
import teamPlayer from '../config/subscriptions/subscription-options/subscription-assets.team.1.player.config.json';
import teamCoach from '../config/subscriptions/subscription-options/subscription-assets.team.2.coach.config.json';

// Import add-ons
import addOnTest from '../config/subscriptions/add-ons/add-ons.test.json';
import addOnAppliesToAll from '../config/subscriptions/add-ons/add-ons.applies-to-all.json';

/**
 * Service for managing subscription tiers, options, and add-ons
 * Loads and processes subscription configurations from JSON files
 */
@Injectable({
  providedIn: 'root',
})
export class SubscriptionManagerService {
  // Master subscription configuration (template for all tiers)
  private MASTER_OPTIONS!: ISubscriptionTier;

  // All available subscription tiers
  private SUBSCRIPTION_TIERS: ISubscriptionTier[] = [];

  // All available add-on packages
  private ADD_ONS: IAddOnPackage[] = [];

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the service by loading all configurations
   */
  private initialize(): void {
    this.LoadMasterSubscription();
    this.LoadSubscriptionOptions();
    this.LoadAddOns();
    this.processAddOns();
  }

  /**
   * Load the master subscription configuration
   * This serves as the template/base for all subscription tiers
   */
  private LoadMasterSubscription(): void {
    this.MASTER_OPTIONS = masterConfig as ISubscriptionTier;
  }

  /**
   * Load all subscription tier options from config files
   * Each tier is built from the master configuration with overlaid changes
   */
  private LoadSubscriptionOptions(): void {
    const tierConfigs = [
      academyAcademy,
      academyGrassroots,
      academyUltimate,
      individualExplorer,
      individualFree,
      teamPlayer,
      teamCoach,
    ];

    this.SUBSCRIPTION_TIERS = tierConfigs.map((config) =>
      this.BuildSubscriptionFromMaster(config as ISubscriptionTier)
    );
  }

  /**
   * Build a complete subscription tier by overlaying changes onto the master configuration
   * @param tierConfig - The tier-specific configuration to overlay
   * @returns Complete subscription tier with all properties
   */
  private BuildSubscriptionFromMaster(
    tierConfig: ISubscriptionTier
  ): ISubscriptionTier {
    // Deep clone the master options to avoid mutation
    const builtTier: ISubscriptionTier = {
      TierID: tierConfig.TierID,
      TierName: tierConfig.TierName,
      TierGroup: tierConfig.TierGroup,
      Assets: {
        toolbars: this.overlayAssets(
          this.MASTER_OPTIONS.Assets.toolbars,
          tierConfig.Assets.toolbars
        ),
        dialogs: this.overlayAssets(
          this.MASTER_OPTIONS.Assets.dialogs,
          tierConfig.Assets.dialogs
        ),
        drawers: this.overlayAssets(
          this.MASTER_OPTIONS.Assets.drawers,
          tierConfig.Assets.drawers
        ),
        limits: this.overlayLimits(
          this.MASTER_OPTIONS.Assets.limits,
          tierConfig.Assets.limits
        ),
        extensions: [],
      },
      AddOnPackagesAvailable: tierConfig.AddOnPackagesAvailable || [],
    };

    return builtTier;
  }

  /**
   * Overlay tier-specific asset changes onto master assets
   * @param masterAssets - Base assets from master config
   * @param tierAssets - Tier-specific asset overrides
   * @returns Merged asset array
   */
  private overlayAssets(
    masterAssets: ISubscriptionAsset[],
    tierAssets: ISubscriptionAsset[]
  ): ISubscriptionAsset[] {
    // Create a map of tier assets for quick lookup
    const tierAssetMap = new Map<string, ISubscriptionAsset>();
    tierAssets.forEach((asset) => {
      tierAssetMap.set(asset.key, asset);
    });

    // Overlay tier changes onto master assets
    return masterAssets.map((masterAsset) => {
      const tierAsset = tierAssetMap.get(masterAsset.key);
      if (tierAsset) {
        // Merge tier asset onto master asset
        return { ...masterAsset, ...tierAsset };
      }
      return { ...masterAsset };
    });
  }

  /**
   * Overlay tier-specific limit changes onto master limits
   * @param masterLimits - Base limits from master config
   * @param tierLimits - Tier-specific limit overrides
   * @returns Merged limit array
   */
  private overlayLimits(
    masterLimits: ISubscriptionLimit[],
    tierLimits: ISubscriptionLimit[]
  ): ISubscriptionLimit[] {
    // Create a map of tier limits for quick lookup
    const tierLimitMap = new Map<string, ISubscriptionLimit>();
    tierLimits.forEach((limit) => {
      tierLimitMap.set(limit.type, limit);
    });

    // Overlay tier changes onto master limits
    return masterLimits.map((masterLimit) => {
      const tierLimit = tierLimitMap.get(masterLimit.type);
      if (tierLimit) {
        // Merge tier limit onto master limit
        return { ...masterLimit, ...tierLimit };
      }
      return { ...masterLimit };
    });
  }

  /**
   * Load all add-on packages from config files
   */
  private LoadAddOns(): void {
    const addOnConfigs = [addOnTest, addOnAppliesToAll];

    this.ADD_ONS = addOnConfigs.map((config) => config as IAddOnPackage);
  }

  /**
   * Process add-ons and assign them to applicable subscription tiers
   * Matches add-on AppliesToTiers with tier TierIDs
   */
  private processAddOns(): void {
    this.ADD_ONS.forEach((addOn) => {
      // Check if add-on applies to all tiers
      const appliesToAll = addOn.AppliesToTiers.includes('*');

      // If empty array, applies to none - skip
      if (addOn.AppliesToTiers.length === 0) {
        return;
      }

      this.SUBSCRIPTION_TIERS.forEach((tier) => {
        // Check if this tier should receive this add-on
        const shouldApply =
          appliesToAll || addOn.AppliesToTiers.includes(tier.TierID);

        if (shouldApply) {
          // Initialize AddOnPackagesAvailable if not exists
          if (!tier.AddOnPackagesAvailable) {
            tier.AddOnPackagesAvailable = [];
          }

          // Add the add-on if not already present
          const alreadyAdded = tier.AddOnPackagesAvailable.some(
            (existing) => existing.TierID === addOn.TierID
          );

          if (!alreadyAdded) {
            tier.AddOnPackagesAvailable.push(addOn);
          }
        }
      });
    });
  }

  /**
   * Get all available subscription tiers
   */
  public getSubscriptionTiers(): ISubscriptionTier[] {
    return [...this.SUBSCRIPTION_TIERS];
  }

  /**
   * Get a specific subscription tier by ID
   * @param tierId - The tier ID to retrieve
   */
  public getSubscriptionTier(tierId: string): ISubscriptionTier | undefined {
    return this.SUBSCRIPTION_TIERS.find((tier) => tier.TierID === tierId);
  }

  /**
   * Get all available add-on packages
   */
  public getAddOns(): IAddOnPackage[] {
    return [...this.ADD_ONS];
  }

  /**
   * Get a specific add-on package by ID
   * @param addOnId - The add-on ID to retrieve
   */
  public getAddOn(addOnId: string): IAddOnPackage | undefined {
    return this.ADD_ONS.find((addOn) => addOn.TierID === addOnId);
  }

  /**
   * Get add-ons available for a specific tier
   * @param tierId - The tier ID to get add-ons for
   */
  public getAddOnsForTier(tierId: string): IAddOnPackage[] {
    const tier = this.getSubscriptionTier(tierId);
    return tier?.AddOnPackagesAvailable || [];
  }

  /**
   * Get the master subscription configuration
   */
  public getMasterOptions(): ISubscriptionTier {
    return { ...this.MASTER_OPTIONS };
  }
}
