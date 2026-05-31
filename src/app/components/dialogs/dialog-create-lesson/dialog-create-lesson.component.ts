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
import { OwnershipContext } from '../../../interfaces/ownership-context.interface';
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';

export interface CreateLessonData {
  name: string;
  description: string;
  chips: string[];
  ownershipContext: OwnershipContext;
}

@Component({
  selector: 'app-dialog-create-lesson',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDialogComponent],
  templateUrl: './dialog-create-lesson.component.html',
  styleUrls: [
    '../../main/dr-ui-vers6/d3-ui-vers6.scss',
    './dialog-create-lesson.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class DialogCreateLessonComponent implements AfterViewInit, OnChanges {
  @Input() visible = false;
  @Input() newLessonName = '';
  @Input() selectedNodesCount = 0;
  @Input() currentUserRoleId = 99; // Default to Developer
  @Input() selectedTenantId: number | null = null;
  @Input() selectedTeamId: number | null = null;
  @Input() selectedTenantName: string | null = null;
  @Input() selectedTeamName: string | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateLessonData>();
  @Output() newLessonNameChange = new EventEmitter<string>();

  @ViewChild('nameInput', { static: false })
  nameInput?: ElementRef<HTMLInputElement>;

  // Lesson data properties
  newLessonDescription = '';
  lessonChips: string[] = [];
  currentChipInput = '';

  // Ownership context selection
  ownershipContext: 'PERSONAL' | 'SYSTEM' | 'TENANT' | 'TEAM' = 'PERSONAL';

  ngAfterViewInit(): void {
    this.focusInput();
  }

  ngOnChanges(): void {
    if (this.visible) {
      this.resetForm();
      // Use setTimeout to ensure the input is rendered
      setTimeout(() => this.focusInput(), 50);
    }
  }

  /**
   * Reset form fields when dialog opens
   */
  private resetForm(): void {
    this.newLessonDescription = '';
    this.lessonChips = [];
    this.currentChipInput = '';

    // Set default ownership context based on current selection
    this.setDefaultOwnershipContext();
  }

  /**
   * Set the default ownership context based on current selection
   * The default ownership context should be:
   * - Team if a team is chosen
   * - Tenant if no team is chosen but tenant is available
   * - Personal if no tenant/team context
   */
  private setDefaultOwnershipContext(): void {
    if (this.selectedTeamId !== null && this.canCreateTeamLevel()) {
      this.ownershipContext = 'TEAM';
    } else if (this.selectedTenantId !== null && this.canCreateTenantLevel()) {
      this.ownershipContext = 'TENANT';
    } else {
      this.ownershipContext = 'PERSONAL';
    }

    console.log('🎯 Default ownership context set to:', this.ownershipContext, {
      selectedTeamId: this.selectedTeamId,
      selectedTenantId: this.selectedTenantId,
      canCreateTeam: this.canCreateTeamLevel(),
      canCreateTenant: this.canCreateTenantLevel(),
    });
  }

  /**
   * Check if user can create system level lessons
   * Only Developer (99) and Administrator (1) can create system level content
   */
  public canCreateSystemLevel(): boolean {
    return this.currentUserRoleId === 99 || this.currentUserRoleId === 1;
  }

  /**
   * Check if user can create tenant level lessons
   * Roles: Developer, Administrator, Tenant Admin, Tenant Registrar, Sporting Architect, DOC, Club Director
   */
  public canCreateTenantLevel(): boolean {
    const tenantLevelRoles = [99, 1, 6, 8, 9, 10, 11]; // Developer, Administrator, Tenant Admin, Tenant Registrar, Sporting Architect, DOC, Club Director
    return tenantLevelRoles.includes(this.currentUserRoleId);
  }

  /**
   * Check if user can create team level lessons
   * All roles can create team level content when a team is selected
   * Roles: Coach, Team Manager, Developer, Administrator, Tenant Admin, Tenant Registrar, Sporting Architect, DOC, Club Director
   */
  public canCreateTeamLevel(): boolean {
    const teamLevelRoles = [2, 7, 99, 1, 6, 8, 9, 10, 11]; // Coach, Team Manager, Developer, Administrator, Tenant Admin, Tenant Registrar, Sporting Architect, DOC, Club Director
    return teamLevelRoles.includes(this.currentUserRoleId);
  }

  /**
   * Get description for the selected ownership context
   */
  public getContextDescription(): string {
    if (this.ownershipContext === 'PERSONAL') {
      return 'Personal lesson available only to you';
    } else if (this.ownershipContext === 'SYSTEM') {
      return 'System-wide lesson available to all tenants';
    } else if (this.ownershipContext === 'TENANT') {
      return this.selectedTenantName
        ? `Lesson for ${this.selectedTenantName} tenant`
        : 'Tenant-level lesson';
    } else {
      // TEAM level
      if (this.selectedTenantName && this.selectedTeamName) {
        return `Lesson for ${this.selectedTenantName} - ${this.selectedTeamName}`;
      } else if (this.selectedTeamName) {
        return `Lesson for ${this.selectedTeamName} team`;
      } else {
        return 'Team-level lesson';
      }
    }
  }

  /**
   * Handle ownership context change
   */
  public onOwnershipContextChange(): void {
    console.log('🔄 Ownership context changed to:', this.ownershipContext);
    // Additional logic can be added here if needed
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

  /**
   * Select ownership context (for tenancy-style list)
   */
  public selectOwnershipContext(
    context: 'PERSONAL' | 'SYSTEM' | 'TENANT' | 'TEAM'
  ): void {
    this.ownershipContext = context;
    this.onOwnershipContextChange();
  }

  private focusInput(): void {
    if (this.visible && this.nameInput?.nativeElement) {
      this.nameInput.nativeElement.focus();
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
      if (this.newLessonName.trim()) {
        this.onSave();
      }
    }
  }

  onCancel(): void {
    this.close.emit();
  }

  onSave(): void {
    if (this.newLessonName.trim()) {
      console.log(
        '💾 Saving lesson with ownership context:',
        this.ownershipContext,
        {
          selectedTenantId: this.selectedTenantId,
          selectedTeamId: this.selectedTeamId,
          userRoleId: this.currentUserRoleId,
        }
      );

      // Create ownership context based on selection
      let ownershipContext: OwnershipContext;

      if (this.ownershipContext === 'PERSONAL') {
        ownershipContext = {
          Context: 'TENANT',
          ContextKey: 0, // Personal level uses tenant context with ID 0
        };
        console.log('🏠 Creating PERSONAL lesson (TENANT, 0)');
      } else if (this.ownershipContext === 'SYSTEM') {
        ownershipContext = {
          Context: 'TENANT',
          ContextKey: -1, // System level uses tenant context with ID -1
        };
        console.log('🌐 Creating SYSTEM lesson (TENANT, -1)');
      } else if (this.ownershipContext === 'TENANT') {
        ownershipContext = {
          Context: 'TENANT',
          ContextKey: this.selectedTenantId || -1,
        };
        console.log(
          '🏢 Creating TENANT lesson (TENANT,',
          this.selectedTenantId,
          ')'
        );
      } else {
        // TEAM level
        ownershipContext = {
          Context: 'TEAM',
          ContextKey: this.selectedTeamId || -1,
        };
        console.log('👥 Creating TEAM lesson (TEAM,', this.selectedTeamId, ')');
      }

      this.save.emit({
        name: this.newLessonName.trim(),
        description: this.newLessonDescription.trim(),
        chips: [...this.lessonChips],
        ownershipContext: ownershipContext,
      });
    }
  }

  onNameChange(): void {
    this.newLessonNameChange.emit(this.newLessonName);
  }
}
