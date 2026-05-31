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
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';

export interface EditLessonData {
  name: string;
  description: string;
  chips: string[];
}

@Component({
  selector: 'app-dialog-edit-lesson',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDialogComponent],
  templateUrl: './dialog-edit-lesson.component.html',
  styleUrls: [
    '../../main/dr-ui-vers6/d3-ui-vers6.scss',
    './dialog-edit-lesson.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class DialogEditLessonComponent implements AfterViewInit, OnChanges {
  @Input() visible = false;
  @Input() editLessonName = '';
  @Input() editLessonDescription = '';
  @Input() editLessonChips: string[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<EditLessonData>();

  @ViewChild('nameInput', { static: false })
  nameInput?: ElementRef<HTMLInputElement>;

  // Working copies of the lesson data
  lessonDescription = '';
  lessonChips: string[] = [];
  currentChipInput = '';

  ngAfterViewInit(): void {
    this.focusInput();
  }

  ngOnChanges(): void {
    if (this.visible) {
      // Initialize working copies when dialog opens
      this.lessonDescription = this.editLessonDescription;
      this.lessonChips = [...this.editLessonChips];
      this.currentChipInput = '';
      // Use setTimeout to ensure the input is rendered
      setTimeout(() => this.focusInput(), 50);
    }
  }

  private focusInput(): void {
    if (this.visible && this.nameInput?.nativeElement) {
      this.nameInput.nativeElement.focus();
      this.nameInput.nativeElement.select();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.visible) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancel();
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.editLessonName.trim()) {
        this.onSave();
      }
    }
  }

  onCancel(): void {
    this.close.emit();
  }

  onSave(): void {
    if (this.editLessonName.trim()) {
      this.save.emit({
        name: this.editLessonName.trim(),
        description: this.lessonDescription.trim(),
        chips: [...this.lessonChips],
      });
    }
  }

  /**
   * Add a chip to the lesson
   */
  public addChip(): void {
    const chipText = this.currentChipInput.trim();
    if (chipText && !this.lessonChips.includes(chipText)) {
      this.lessonChips.push(chipText);
      this.currentChipInput = '';
    }
  }

  /**
   * Remove a chip from the lesson
   */
  public removeChip(index: number): void {
    if (index >= 0 && index < this.lessonChips.length) {
      this.lessonChips.splice(index, 1);
    }
  }

  /**
   * Handle chip input keydown events
   */
  public onChipInputKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addChip();
    }
  }
}
