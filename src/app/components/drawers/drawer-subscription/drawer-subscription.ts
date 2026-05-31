import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSlidingDrawer } from '../../shared/base-sliding-drawer/base-sliding-drawer';
import {
  ISubscriptionSelection,
  ISubscriptionAsset,
  ISubscriptionLimit,
} from '../../../interfaces/subscription.interfaces';
import {
  getLimitDisplayInfo,
  formatLimitValue,
} from '../../../utils/subscription-limit.utils';

interface AssetDisplay {
  key: string;
  description?: string;
  enabled: boolean;
  visible: boolean;
}

interface LimitGroup {
  group: string;
  limits: ISubscriptionLimit[];
}

@Component({
  selector: 'app-drawer-subscription',
  standalone: true,
  imports: [CommonModule, BaseSlidingDrawer],
  templateUrl: './drawer-subscription.html',
  styleUrl: './drawer-subscription.scss',
})
export class DrawerSubscription {
  @Input() isOpen = false;
  @Input() subscription?: ISubscriptionSelection;

  @Output() close = new EventEmitter<void>();

  // Expansion state for sections
  public toolbarsExpanded = false;
  public dialogsExpanded = false;
  public drawersExpanded = false;
  public limitsExpanded = false;

  // Expansion state for limit groups
  public limitGroupExpansion = new Map<string, boolean>();

  // Help text for the drawer
  public readonly drawerHelp = `
    <strong>Subscription Drawer</strong><br><br>
    View your subscription details, including tier, features, and available assets.<br><br>
    <strong>Assets:</strong> Shows which toolbars, dialogs, and drawers are enabled and visible in your subscription.
  `;

  get toolbars(): AssetDisplay[] {
    return this.subscription?.ConfiguredSubscription?.toolbars || [];
  }

  get dialogs(): AssetDisplay[] {
    return this.subscription?.ConfiguredSubscription?.dialogs || [];
  }

  get drawers(): AssetDisplay[] {
    return this.subscription?.ConfiguredSubscription?.drawers || [];
  }

  get limits(): ISubscriptionLimit[] {
    return this.subscription?.ConfiguredSubscription?.limits || [];
  }

  get limitGroups(): LimitGroup[] {
    const limits = this.limits;
    const groups = new Map<string, ISubscriptionLimit[]>();

    // Group limits by their display group
    limits.forEach((limit) => {
      const displayInfo = getLimitDisplayInfo(limit.type);
      const groupName = displayInfo.group;

      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(limit);
    });

    // Convert to array and sort groups
    return Array.from(groups.entries())
      .map(([group, limits]) => ({ group, limits }))
      .sort((a, b) => a.group.localeCompare(b.group));
  }

  get hasSubscription(): boolean {
    return !!this.subscription;
  }

  toggleToolbars(): void {
    this.toolbarsExpanded = !this.toolbarsExpanded;
  }

  toggleDialogs(): void {
    this.dialogsExpanded = !this.dialogsExpanded;
  }

  toggleDrawers(): void {
    this.drawersExpanded = !this.drawersExpanded;
  }

  toggleLimits(): void {
    this.limitsExpanded = !this.limitsExpanded;
  }

  toggleLimitGroup(group: string): void {
    const current = this.limitGroupExpansion.get(group) || false;
    this.limitGroupExpansion.set(group, !current);
  }

  isLimitGroupExpanded(group: string): boolean {
    return this.limitGroupExpansion.get(group) || false;
  }

  getLimitDisplayName(limit: ISubscriptionLimit): string {
    return getLimitDisplayInfo(limit.type).name;
  }

  formatLimit(value: number): string {
    return formatLimitValue(value);
  }

  onClose(): void {
    this.close.emit();
  }
}
