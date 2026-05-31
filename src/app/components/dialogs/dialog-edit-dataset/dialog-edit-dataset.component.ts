import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { DecisionFlow } from '../../../interfaces';
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';
import { GlobalContextState } from '../../../state';

export interface EditDatasetResult {
  dataset: DecisionFlow;
  newName: string;
  newDescription: string;
}

@Component({
  selector: 'app-dialog-edit-dataset',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDialogComponent],
  templateUrl: './dialog-edit-dataset.component.html',
  styleUrls: ['./dialog-edit-dataset.component.scss'],
})
export class DialogEditDatasetComponent implements AfterViewInit, OnChanges {
  @Input() visible = false;
  @Input() dataset: DecisionFlow | null = null;

  @Output() save = new EventEmitter<EditDatasetResult>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('nameInput') nameInput?: ElementRef<HTMLInputElement>;

  datasetName = '';
  datasetDescription = '';

  // Validation state
  private originalName = '';
  private originalDescription = '';

  constructor(private store: Store) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataset'] && this.dataset) {
      this.initializeForm();
    }

    if (changes['visible'] && this.visible) {
      this.focusNameInput();
    }
  }

  ngAfterViewInit(): void {
    if (this.visible) {
      this.focusNameInput();
    }
  }

  /**
   * Initialize form with dataset values
   */
  private initializeForm(): void {
    if (this.dataset) {
      this.datasetName = this.dataset.FlowName || '';
      this.datasetDescription = this.dataset.FlowDesc || '';
      this.originalName = this.datasetName;
      this.originalDescription = this.datasetDescription;
    }
  }

  /**
   * Focus the name input field
   */
  private focusNameInput(): void {
    setTimeout(() => {
      this.nameInput?.nativeElement?.focus();
    }, 0);
  }

  /**
   * Handle name input changes
   */
  onNameChange(): void {
    // Trim whitespace and update
    this.datasetName = this.datasetName?.trim() || '';
  }

  /**
   * Handle description input changes
   */
  onDescriptionChange(): void {
    // Description can have whitespace, so don't trim
  }

  /**
   * Check if name has validation errors
   */
  hasNameError(): boolean {
    return !this.datasetName || this.datasetName.length < 2;
  }

  /**
   * Get name validation error message
   */
  getNameErrorMessage(): string {
    if (!this.datasetName) {
      return 'Dataset name is required';
    }
    if (this.datasetName.length < 2) {
      return 'Dataset name must be at least 2 characters';
    }
    return '';
  }

  /**
   * Check if form is valid
   */
  isValid(): boolean {
    return !this.hasNameError() && this.hasChanges();
  }

  /**
   * Check if there are any changes from original values
   */
  hasChanges(): boolean {
    return (
      this.datasetName !== this.originalName ||
      this.datasetDescription !== this.originalDescription
    );
  }

  /**
   * Get ownership context label for display
   */
  getOwnershipLabel(): string {
    if (!this.dataset) return 'Unknown';

    const context = this.dataset.OwnershipContext;
    const loggedInUser = this.store.selectSnapshot(
      GlobalContextState.loggedInUser
    );

    if (context.Context === 'TENANT' && context.ContextKey === -1) {
      return 'System';
    } else if (
      context.Context === 'USER' &&
      loggedInUser &&
      context.ContextKey === loggedInUser.UserId
    ) {
      return 'Personal';
    } else if (context.Context === 'TENANT') {
      return 'Organization';
    } else if (context.Context === 'TEAM') {
      return 'Team';
    }

    return 'Unknown';
  }

  /**
   * Handle cancel action
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Handle save action
   */
  onSave(): void {
    if (!this.isValid() || !this.dataset) {
      return;
    }

    const result: EditDatasetResult = {
      dataset: this.dataset,
      newName: this.datasetName.trim(),
      newDescription: this.datasetDescription?.trim() || '',
    };

    this.save.emit(result);
  }
}
