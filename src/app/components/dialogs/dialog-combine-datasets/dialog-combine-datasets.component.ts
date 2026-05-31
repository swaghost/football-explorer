import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DecisionFlow, OwnershipContext } from '../../../interfaces';
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';

export interface CombineDatasetsResult {
  name: string;
  description: string;
  ownershipContext: OwnershipContext;
  selectedDatasets: DecisionFlow[];
}

@Component({
  selector: 'app-dialog-combine-datasets',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDialogComponent],
  templateUrl: './dialog-combine-datasets.component.html',
  styleUrls: ['./dialog-combine-datasets.component.scss'],
})
export class DialogCombineDatasetsComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() isDarkMode = false;
  @Input() availableDatasets: DecisionFlow[] = [];
  @Input() currentUserRoleId: number | null = null;
  @Input() selectedTenantId: number | null = null;
  @Input() selectedTeamId: number | null = null;

  @Output() confirm = new EventEmitter<CombineDatasetsResult>();
  @Output() cancel = new EventEmitter<void>();

  // Form properties
  name = '';
  description = '';
  selectedOwnershipContext: 'SYS' | 'TENANT' | 'TEAM' = 'TENANT';
  selectedDatasetIds: number[] = [];

  // Ownership context options based on user role
  availableContexts: {
    value: 'SYS' | 'TENANT' | 'TEAM';
    label: string;
    disabled: boolean;
  }[] = [];

  ngOnInit(): void {
    this.updateAvailableContexts();
    this.resetForm();
  }

  ngOnChanges(): void {
    if (this.visible) {
      this.updateAvailableContexts();
      this.resetForm();
    }
  }

  /**
   * Update available ownership contexts based on user role
   */
  private updateAvailableContexts(): void {
    this.availableContexts = [
      {
        value: 'SYS',
        label: 'System Level',
        disabled: !this.canCreateSystemLevel(),
      },
      {
        value: 'TENANT',
        label: 'Organization Level',
        disabled: !this.canCreateTenantLevel(),
      },
      {
        value: 'TEAM',
        label: 'Team Level',
        disabled: !this.canCreateTeamLevel(),
      },
    ];

    // Set default context to highest available level
    if (this.canCreateSystemLevel()) {
      this.selectedOwnershipContext = 'SYS';
    } else if (this.canCreateTenantLevel()) {
      this.selectedOwnershipContext = 'TENANT';
    } else {
      this.selectedOwnershipContext = 'TEAM';
    }
  }

  /**
   * Check if user can create system level datasets
   */
  private canCreateSystemLevel(): boolean {
    // Developer (99) and Administrator (1) can create system level
    return this.currentUserRoleId === 99 || this.currentUserRoleId === 1;
  }

  /**
   * Check if user can create tenant level datasets
   */
  private canCreateTenantLevel(): boolean {
    // Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11) can create tenant level
    return (
      this.currentUserRoleId === 99 ||
      this.currentUserRoleId === 1 ||
      this.currentUserRoleId === 6 ||
      this.currentUserRoleId === 9 ||
      this.currentUserRoleId === 10 ||
      this.currentUserRoleId === 11
    );
  }

  /**
   * Check if user can create team level datasets
   */
  private canCreateTeamLevel(): boolean {
    // All roles can create team level if a team is selected
    return this.selectedTeamId !== null;
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    this.name = '';
    this.description = '';
    this.selectedDatasetIds = [];
  }

  /**
   * Check if dataset is selected
   */
  isDatasetSelected(datasetId: number): boolean {
    return this.selectedDatasetIds.includes(datasetId);
  }

  /**
   * Toggle dataset selection
   */
  toggleDatasetSelection(datasetId: number): void {
    const index = this.selectedDatasetIds.indexOf(datasetId);
    if (index > -1) {
      this.selectedDatasetIds.splice(index, 1);
    } else {
      this.selectedDatasetIds.push(datasetId);
    }
  }

  /**
   * Get selected datasets
   */
  getSelectedDatasets(): DecisionFlow[] {
    return this.availableDatasets.filter((dataset) =>
      this.selectedDatasetIds.includes(dataset.FlowID!)
    );
  }

  /**
   * Check if form is valid
   */
  isFormValid(): boolean {
    return this.name.trim().length > 0 && this.selectedDatasetIds.length >= 2; // Need at least 2 datasets to combine
  }

  /**
   * Handle form submission
   */
  onConfirm(): void {
    if (!this.isFormValid()) {
      return;
    }

    // Create ownership context based on selection
    let ownershipContext: OwnershipContext;

    switch (this.selectedOwnershipContext) {
      case 'SYS':
        // System level is now TENANT with Context -1
        ownershipContext = {
          Context: 'TENANT',
          ContextKey: -1,
        };
        break;
      case 'TENANT':
        ownershipContext = {
          Context: 'TENANT',
          ContextKey: this.selectedTenantId || -1,
        };
        break;
      case 'TEAM':
        ownershipContext = {
          Context: 'TEAM',
          ContextKey: this.selectedTeamId || -1,
        };
        break;
    }

    const result: CombineDatasetsResult = {
      name: this.name.trim(),
      description: this.description.trim(),
      ownershipContext,
      selectedDatasets: this.getSelectedDatasets(),
    };

    this.confirm.emit(result);
  }

  /**
   * Handle cancel action
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Get ownership context label for display
   */
  getOwnershipLabel(flow: DecisionFlow): string {
    const context = flow.OwnershipContext;

    switch (context.Context) {
      case 'USER':
        return 'User';
      case 'TENANT':
        return context.ContextKey === -1 ? 'System' : 'Organization';
      case 'TEAM':
        return 'Team';
      case 'TEAMGROUP':
        return 'Team Group';
      default:
        return 'Unknown';
    }
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByFlowId(index: number, flow: DecisionFlow): number | undefined {
    return flow.FlowID;
  }
}
