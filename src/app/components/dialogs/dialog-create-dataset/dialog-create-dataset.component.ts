import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ITenant } from '../../../interfaces/tenant.interfaces';
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';

@Component({
  selector: 'app-dialog-create-dataset',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDialogComponent],
  templateUrl: './dialog-create-dataset.component.html',

})
export class DialogCreateDatasetComponent implements AfterViewInit, OnChanges {
  @Input() visible = false;
  @Input() organizations: ITenant[] = [];
  @Input() selectedTenantId: number | null = null;
  @Input() selectedTeamId: number | null = null;
  @Input() selectedTeamName: string | null = null;
  @Input() selectedTenantName: string | null = null;
  @Input() currentUserRoleId = 12; // Default to Player role

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<{
    name: string;
    description: string;
    ownershipContext: 'PERSONAL' | 'SYSTEM' | 'TENANT' | 'TEAM';
  }>();

  @ViewChild('nameInput', { static: false }) nameInput!: ElementRef;

  public newDatasetName = '';
  public newDatasetDescription = '';
  public ownershipContext: 'PERSONAL' | 'SYSTEM' | 'TENANT' | 'TEAM' =
    'PERSONAL';

  ngAfterViewInit(): void {
    if (this.visible && this.nameInput) {
      setTimeout(() => this.nameInput.nativeElement.focus(), 100);
    }
  }

  ngOnChanges(): void {
    if (this.visible && this.nameInput) {
      setTimeout(() => this.nameInput.nativeElement.focus(), 100);
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.visible) return;

    if (event.key === 'Escape') {
      this.onCancel();
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onCreate();
    }
  }

  public onNameChange(): void {
    // Validation logic can be added here
  }

  public onDescriptionChange(): void {
    // Validation logic can be added here
  }

  public onOwnershipContextChange(): void {
    // Update context when radio button changes
  }

  public canCreateDataset(): boolean {
    const hasName = this.newDatasetName.trim().length > 0;
    const hasValidContext =
      this.ownershipContext === 'PERSONAL' ||
      (this.ownershipContext === 'SYSTEM' && this.canCreateSystemLevel()) ||
      (this.ownershipContext === 'TENANT' &&
        this.selectedTenantId !== null &&
        this.canCreateTenantLevel()) ||
      (this.ownershipContext === 'TEAM' &&
        this.selectedTeamId !== null &&
        this.canCreateTeamLevel());

    return hasName && hasValidContext;
  }

  /**
   * Check if user can create system level datasets
   * Only Developer (99) and Administrator (1) can create system level content
   */
  public canCreateSystemLevel(): boolean {
    return this.currentUserRoleId === 99 || this.currentUserRoleId === 1;
  }

  /**
   * Check if user can create tenant level datasets
   * Roles: Developer, Administrator, Tenant Admin, Tenant Registrar, Sporting Architect, DOC, Club Director
   */
  public canCreateTenantLevel(): boolean {
    const tenantLevelRoles = [99, 1, 6, 8, 9, 10, 11]; // Developer, Administrator, Tenant Admin, Tenant Registrar, Sporting Architect, DOC, Club Director
    return tenantLevelRoles.includes(this.currentUserRoleId);
  }

  /**
   * Check if user can create team level datasets
   * All roles can create team level content when they have access to a team
   */
  public canCreateTeamLevel(): boolean {
    const teamLevelRoles = [99, 1, 6, 7, 8, 9, 10, 11, 12]; // All roles
    return teamLevelRoles.includes(this.currentUserRoleId);
  }

  public getContextDescription(): string {
    if (this.ownershipContext === 'PERSONAL') {
      return 'Personal Dataset - available only to you';
    } else if (this.ownershipContext === 'SYSTEM') {
      return 'System Dataset - available to all users across all tenants and teams';
    } else if (this.ownershipContext === 'TENANT') {
      return this.selectedTenantName
        ? `${this.selectedTenantName} Dataset - available to all teams within this tenant`
        : 'Tenant Dataset - available to all teams within this tenant';
    } else {
      // TEAM level
      if (this.selectedTenantName && this.selectedTeamName) {
        return `${this.selectedTeamName} Dataset - available only to members of this specific team`;
      } else if (this.selectedTeamName) {
        return `${this.selectedTeamName} Dataset - available only to members of this specific team`;
      } else {
        return 'Team Dataset - available only to members of this specific team';
      }
    }
  }

  public onCreate(): void {
    if (!this.canCreateDataset()) {
      return;
    }

    this.create.emit({
      name: this.newDatasetName.trim(),
      description: this.newDatasetDescription.trim(),
      ownershipContext: this.ownershipContext,
    });

    this.resetForm();
  }

  public onCancel(): void {
    this.resetForm();
    this.close.emit();
  }

  private resetForm(): void {
    this.newDatasetName = '';
    this.newDatasetDescription = '';
    this.ownershipContext = 'PERSONAL';
  }
}

