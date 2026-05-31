import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ITenant, Role } from '../../../interfaces';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';

@Component({
  selector: 'app-toolbar-tenancy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-tenancy.component.html',
  styleUrls: ['./toolbar-tenancy.component.scss'],
})
export class ToolbarTenancyComponent extends BaseToolbarComponent {
  // Toolbar configuration
  override toolbarId = 'tenancy-toolbar';
  override toolbarTitle = 'Tenancy';
  override toolbarIcon = '🏢';

  // Component-specific inputs
  @Input() organizations: ITenant[] = [];
  @Input() selectedTenantId: number | null = null;
  @Input() roles: Role[] = [];

  // Component-specific outputs
  @Output() organizationSelected = new EventEmitter<number>();

  get selectedOrganization(): ITenant | null {
    if (this.selectedTenantId === null) return null;
    return (
      this.organizations.find(
        (org) => org.TenantID === this.selectedTenantId
      ) || null
    );
  }

  onOrganizationSelect(orgId: number): void {
    this.organizationSelected.emit(orgId);
  }

  isOrganizationSelected(orgId: number): boolean {
    return this.selectedTenantId === orgId;
  }
}
