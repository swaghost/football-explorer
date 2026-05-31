import { Injectable } from '@angular/core';
import {
  ISubscriptionSelection,
  ISubscriptionTier,
  ISubscriptionControls,
  IAddOnPackage,
  ISubscriptionAsset,
  ISubscriptionLimit,
} from '../interfaces/subscription.interfaces';
import { SubscriptionManagerService } from './subscription-manager.service';

/**
 * Mock service for building subscription selections
 * Returns a complete ISubscriptionSelection based on a tier ID and selected add-on IDs
 */
@Injectable({
  providedIn: 'root',
})
export class SubscriptionMockService {
  constructor(private subscriptionManager: SubscriptionManagerService) {}

  /**
   * Get a subscription selection for a given tier and add-ons
   * @param tierID - The subscription tier ID to select
   * @param addOnIDs - Array of add-on tier IDs to apply (empty array for no add-ons)
   * @returns Complete subscription selection with add-ons applied
   */
  public getSubscriptionSelection(
    tierID: string,
    addOnIDs: string[] = []
  ): ISubscriptionSelection | null {
    // Get the base subscription tier
    const baseTier = this.subscriptionManager.getSubscriptionTier(tierID);
    if (!baseTier) {
      console.error(`Subscription tier not found: ${tierID}`);
      return null;
    }

    // Get the selected add-on packages
    const selectedAddOns = this.getSelectedAddOns(addOnIDs);

    // Build the configured subscription with add-ons applied
    const configuredSubscription = this.applyAddOnsToTier(
      baseTier,
      selectedAddOns
    );

    // Build the subscription selection
    const selection: ISubscriptionSelection = {
      TierID: baseTier.TierID,
      TierName: baseTier.TierName,
      TierGroup: baseTier.TierGroup,
      Assets: baseTier.Assets,
      AddOnPackagesAvailable: baseTier.AddOnPackagesAvailable,
      AddOnPackagesSelections: selectedAddOns,
      ConfiguredSubscription: configuredSubscription,
    };

    return selection;
  }

  /**
   * Get add-on packages by their IDs
   * @param addOnIDs - Array of add-on tier IDs
   * @returns Array of add-on packages
   */
  private getSelectedAddOns(addOnIDs: string[]): IAddOnPackage[] {
    if (addOnIDs.length === 0) {
      return [];
    }

    const selectedAddOns: IAddOnPackage[] = [];
    addOnIDs.forEach((addOnID) => {
      const addOn = this.subscriptionManager.getAddOn(addOnID);
      if (addOn) {
        selectedAddOns.push(addOn);
      } else {
        console.warn(`Add-on not found: ${addOnID}`);
      }
    });

    return selectedAddOns;
  }

  /**
   * Apply add-ons to a base tier to create configured subscription
   * Merges enabled/visible values and limits from add-ons onto the base tier
   * @param baseTier - The base subscription tier
   * @param addOns - Array of add-on packages to apply
   * @returns Configured subscription controls with add-ons applied
   */
  private applyAddOnsToTier(
    baseTier: ISubscriptionTier,
    addOns: IAddOnPackage[]
  ): ISubscriptionControls {
    // Start with a deep copy of the base tier assets
    const configured: ISubscriptionControls = {
      toolbars: this.deepCopyAssets(baseTier.Assets.toolbars),
      dialogs: this.deepCopyAssets(baseTier.Assets.dialogs),
      drawers: this.deepCopyAssets(baseTier.Assets.drawers),
      limits: this.deepCopyLimits(baseTier.Assets.limits),
      extensions: [],
    };

    // Apply each add-on sequentially
    addOns.forEach((addOn) => {
      this.mergeAddOnAssets(configured.toolbars, addOn.Assets.toolbars);
      this.mergeAddOnAssets(configured.dialogs, addOn.Assets.dialogs);
      this.mergeAddOnAssets(configured.drawers, addOn.Assets.drawers);
      this.mergeAddOnLimits(configured.limits, addOn.Assets.limits);
    });

    return configured;
  }

  /**
   * Deep copy subscription assets
   * @param assets - Assets to copy
   * @returns Deep copy of assets
   */
  private deepCopyAssets(assets: ISubscriptionAsset[]): ISubscriptionAsset[] {
    return assets.map((asset) => ({ ...asset }));
  }

  /**
   * Deep copy subscription limits
   * @param limits - Limits to copy
   * @returns Deep copy of limits
   */
  private deepCopyLimits(limits: ISubscriptionLimit[]): ISubscriptionLimit[] {
    return limits.map((limit) => ({ ...limit }));
  }

  /**
   * Merge add-on assets onto configured assets
   * If an add-on sets enabled=true or visible=true, it overrides the base value
   * @param configuredAssets - The configured assets to modify
   * @param addOnAssets - Add-on assets to merge in
   */
  private mergeAddOnAssets(
    configuredAssets: ISubscriptionAsset[],
    addOnAssets: ISubscriptionAsset[]
  ): void {
    // Create a map of add-on assets for quick lookup
    const addOnMap = new Map<string, ISubscriptionAsset>();
    addOnAssets.forEach((asset) => {
      addOnMap.set(asset.key, asset);
    });

    // Apply add-on changes to configured assets
    configuredAssets.forEach((asset, index) => {
      const addOnAsset = addOnMap.get(asset.key);
      if (addOnAsset) {
        // Merge add-on properties
        // For enabled and visible: true from add-on takes precedence
        configuredAssets[index] = {
          ...asset,
          enabled: asset.enabled || addOnAsset.enabled,
          visible: asset.visible || addOnAsset.visible,
          // Description and asAddOn come from base unless add-on provides them
          description: addOnAsset.description || asset.description,
          asAddOn:
            addOnAsset.asAddOn !== undefined
              ? addOnAsset.asAddOn
              : asset.asAddOn,
        };
      }
    });
  }

  /**
   * Merge add-on limits onto configured limits
   * Add-on limits are added to base limits to increase available resources
   * @param configuredLimits - The configured limits to modify
   * @param addOnLimits - Add-on limits to merge in
   */
  private mergeAddOnLimits(
    configuredLimits: ISubscriptionLimit[],
    addOnLimits: ISubscriptionLimit[]
  ): void {
    // Create a map of add-on limits for quick lookup
    const addOnMap = new Map<string, ISubscriptionLimit>();
    addOnLimits.forEach((limit) => {
      addOnMap.set(limit.type, limit);
    });

    // Apply add-on limits to configured limits
    configuredLimits.forEach((limit, index) => {
      const addOnLimit = addOnMap.get(limit.type);
      if (addOnLimit) {
        // Add the add-on limit to the existing addOnLimit field
        const currentAddOnLimit = limit.addOnLimit ?? 0;
        const additionalLimit = addOnLimit.addOnLimit ?? 0;
        const newAddOnLimit = currentAddOnLimit + additionalLimit;

        // Calculate new current limit
        // If base limit is -1 (unlimited), keep as -1
        // Otherwise, add the add-on limit
        let newCurrentLimit = limit.currentLimit;
        if (limit.currentLimit !== -1) {
          newCurrentLimit = limit.currentLimit + additionalLimit;
        }

        configuredLimits[index] = {
          ...limit,
          addOnLimit: newAddOnLimit,
          currentLimit: newCurrentLimit,
          asAddOn: addOnLimit.asAddOn || limit.asAddOn,
        };
      }
    });
  }

  /**
   * Get a subscription selection with no add-ons
   * @param tierID - The subscription tier ID
   * @returns Subscription selection with empty add-ons array
   */
  public getBaseSubscriptionSelection(
    tierID: string
  ): ISubscriptionSelection | null {
    return this.getSubscriptionSelection(tierID, []);
  }

  /**
   * Simulate an API call that returns a subscription selection
   * Useful for testing with realistic async behavior
   * @param tierID - The subscription tier ID
   * @param addOnIDs - Array of add-on tier IDs
   * @param delayMs - Simulated network delay in milliseconds
   * @returns Promise resolving to subscription selection
   */
  public async getSubscriptionSelectionAsync(
    tierID: string,
    addOnIDs: string[] = [],
    delayMs: number = 500
  ): Promise<ISubscriptionSelection | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return this.getSubscriptionSelection(tierID, addOnIDs);
  }
}
