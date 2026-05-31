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
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';

interface AddChildData {
  name: string;
  description: string;
}

@Component({
  selector: 'app-dialog-add-child',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDialogComponent],
  templateUrl: './dialog-add-child.component.html',

})
export class DialogAddChildComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() isDarkMode = false;
  @Input() parentNodeId: string | null = null;
  @Input() title = 'Add Child Node';
  @Input() confirmButtonText = 'Add Child';
  @Input() initialName = '';
  @Input() initialDescription = '';

  @Output() confirm = new EventEmitter<AddChildData>();
  @Output() cancel = new EventEmitter<void>();

  public childName = '';
  public childDescription = '';

  ngOnInit(): void {
    // Set initial values when the component initializes
    this.childName = this.initialName;
    this.childDescription = this.initialDescription;
  }

  ngOnChanges(): void {
    // Update form values when inputs change (for edit mode)
    if (this.visible) {
      this.childName = this.initialName;
      this.childDescription = this.initialDescription;
    }
  }

  get isFormValid(): boolean {
    return this.childName.trim().length > 0;
  }

  onConfirm(): void {
    if (this.isFormValid) {
      this.confirm.emit({
        name: this.childName.trim(),
        description: this.childDescription.trim(),
      });
      this.resetForm();
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.childName = '';
    this.childDescription = '';
  }
}

