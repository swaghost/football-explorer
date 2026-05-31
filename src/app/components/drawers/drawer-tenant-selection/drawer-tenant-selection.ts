import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSlidingDrawer } from '../../shared/base-sliding-drawer/base-sliding-drawer';
import { ITenant, Role } from '../../../interfaces';

@Component({
  selector: 'app-drawer-tenant-selection',
  standalone: true,
  imports: [CommonModule, BaseSlidingDrawer],
  templateUrl: './drawer-tenant-selection.html',
  styleUrl: './drawer-tenant-selection.scss',
})
export class DrawerTenantSelection {
  @Input() isOpen = false;
  @Input() organizations: ITenant[] = [];
  @Input() selectedTenantId: number | null = null;
  @Input() roles: Role[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() organizationSelected = new EventEmitter<number>();

  // Help text for the drawer
  public readonly drawerHelp = `
    <strong>Tenant Selection Drawer</strong><br><br>
    This drawer allows you to switch between different organizations (tenants) you have access to.<br><br>
    <strong>Current Organization:</strong> Shows your currently selected organization, including your name and role within it.<br><br>
    <strong>Available Organizations:</strong> Click on any organization from the list to switch to it. Your current selection is indicated with a checkmark.<br><br>
    <strong>Note:</strong> When you switch organizations, the application will reload to show data specific to that organization.
  `;

  get selectedOrganization(): ITenant | null {
    if (this.selectedTenantId === null) return null;
    return (
      this.organizations.find(
        (org) => org.TenantID === this.selectedTenantId
      ) || null
    );
  }

  getRoleNames(tenant: ITenant): string {
    if (!tenant.Roles || tenant.Roles.length === 0) return 'No roles';
    return tenant.Roles.map((role) => role.RoleName).join(', ');
  }

  getRelativesInfo(tenant: ITenant): string {
    if (!tenant.Relatives || tenant.Relatives.length === 0) {
      return 'No relatives';
    }

    const relativesList = tenant.Relatives.map((relative) => {
      // Get the roles for this relative in this tenant
      const relativeTenant = relative.Tenants?.find(
        (t) => t.TenantID === tenant.TenantID
      );
      const roleNames =
        relativeTenant?.Roles?.map((r) => r.RoleName).join(', ') || 'No role';

      return `${relative.FirstName} ${relative.LastName} (${roleNames})`;
    }).join(', ');

    return relativesList;
  }

  onClose(): void {
    this.close.emit();
  }

  onOrganizationSelect(orgId: number): void {
    this.organizationSelected.emit(orgId);
    // Optionally close the drawer after selection
    this.onClose();
  }

  isOrganizationSelected(orgId: number): boolean {
    return this.selectedTenantId === orgId;
  }
}
