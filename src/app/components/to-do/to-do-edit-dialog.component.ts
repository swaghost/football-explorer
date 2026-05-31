import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  IToDoEntry,
  TargetType,
  SpecificTargetType,
  ToDoStatus,
  ToDoPriority,
  ALL_STATUSES,
  ALL_PRIORITIES,
  TARGET_TYPES_BY_CATEGORY,
} from '../../interfaces/to-do/to-do.interface';
import { SketchState } from '../../state';

@Component({
  selector: 'app-to-do-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-container" [class.dark-mode]="isDarkMode">
      <div class="dialog-header">
        <h2>{{ isNew ? 'New To-Do' : 'Edit To-Do' }}</h2>
        <button class="btn-close" (click)="onCancel()" title="Close">×</button>
      </div>

      <div class="dialog-content">
        <!-- Title -->
        <div class="form-group">
          <label>Title *</label>
          <input
            type="text"
            [(ngModel)]="entry.title"
            placeholder="Enter title"
            class="form-input"
            autofocus
          />
        </div>

        <!-- Description -->
        <div class="form-group">
          <label>Description</label>
          <textarea
            [(ngModel)]="entry.description"
            placeholder="Enter description"
            class="form-input form-textarea"
            rows="3"
          ></textarea>
        </div>

        <!-- Status -->
        <div class="form-row">
          <div class="form-group">
            <label>Status *</label>
            <select [(ngModel)]="entry.status" class="form-input">
              <option *ngFor="let status of allStatuses" [value]="status">
                {{ status }}
              </option>
            </select>
          </div>

          <!-- Priority -->
          <div class="form-group">
            <label>Priority *</label>
            <select [(ngModel)]="entry.priority" class="form-input">
              <option *ngFor="let priority of allPriorities" [value]="priority">
                {{ priority }}
              </option>
            </select>
          </div>
        </div>

        <!-- Target Type -->
        <div class="form-group">
          <label>Target Type *</label>
          <select
            [(ngModel)]="entry.targetType"
            (change)="onTargetTypeChange()"
            class="form-input"
          >
            <option value="Development">Development</option>
            <option value="Architecting">Architecting</option>
            <option value="Teaching">Teaching</option>
          </select>
        </div>

        <!-- Specific Target Type -->
        <div class="form-group">
          <label>Target Category *</label>
          <select
            [(ngModel)]="entry.specificTargetType"
            (change)="onSpecificTargetTypeChange()"
            class="form-input"
          >
            <option *ngFor="let type of specificTargetTypes" [value]="type">
              {{ formatTargetType(type) }}
            </option>
          </select>
        </div>

        <!-- Team Selection (for Team-related target types) -->
        <div class="form-group" *ngIf="shouldShowTeamSelector()">
          <label>Team</label>
          <select
            [(ngModel)]="selectedTeamForTarget"
            (change)="onTeamSelectionChange()"
            class="form-input"
            [disabled]="teams.length === 0"
          >
            <option [value]="null">-- Select Team --</option>
            <option *ngFor="let team of teams" [value]="team">
              {{ team.TeamName || team.Name || 'Unknown Team' }}
            </option>
          </select>
          <small *ngIf="teams.length === 0" class="form-hint">
            No teams available
          </small>
        </div>

        <!-- Dynamic Target Field -->
        <div class="form-group">
          <label>{{ targetFieldLabel }}</label>

          <!-- Player Note: Dropdown - enabled only when team is selected and teams exist -->
          <select
            *ngIf="entry.specificTargetType === 'Player Note'"
            [(ngModel)]="entry.target"
            class="form-input"
            [disabled]="!isPlayerFieldEnabled()"
          >
            <option value="">-- Select Player --</option>
            <option *ngFor="let player of selectedTeamPlayers" [value]="player">
              {{ player }}
            </option>
          </select>
          <small
            *ngIf="
              entry.specificTargetType === 'Player Note' &&
              !isPlayerFieldEnabled()
            "
            class="form-hint"
          >
            {{
              teams.length === 0
                ? 'No teams available'
                : 'Please select a team first'
            }}
          </small>

          <!-- Team Note: Auto-filled with selected team -->
          <input
            *ngIf="entry.specificTargetType === 'Team Note'"
            type="text"
            [(ngModel)]="entry.target"
            readonly
            class="form-input"
            [placeholder]="
              selectedTeamForTarget
                ? selectedTeamForTarget.TeamName || selectedTeamForTarget.Name
                : 'Select a team above'
            "
          />

          <!-- Team Group Note: Dropdown - disabled when no groups -->
          <select
            *ngIf="entry.specificTargetType === 'Team Group Note'"
            [(ngModel)]="entry.target"
            class="form-input"
            [disabled]="teamGroups.length === 0"
          >
            <option value="">-- Select Team Group --</option>
            <option *ngFor="let group of teamGroups" [value]="group">
              {{ group }}
            </option>
          </select>
          <small
            *ngIf="
              entry.specificTargetType === 'Team Group Note' &&
              teamGroups.length === 0
            "
            class="form-hint"
          >
            No team groups available
          </small>

          <!-- Session Note: Date picker -->
          <input
            *ngIf="entry.specificTargetType === 'Session Note'"
            type="date"
            [(ngModel)]="entry.target"
            class="form-input"
          />

          <!-- Training Note: Free text -->
          <input
            *ngIf="entry.specificTargetType === 'Training Note'"
            type="text"
            [(ngModel)]="entry.target"
            placeholder="Enter details"
            class="form-input"
          />

          <!-- Feature Request: Free text -->
          <input
            *ngIf="entry.specificTargetType === 'Feature Request'"
            type="text"
            [(ngModel)]="entry.target"
            placeholder="Enter feature details"
            class="form-input"
          />

          <!-- Bug Fix: Free text -->
          <input
            *ngIf="entry.specificTargetType === 'Bug Fix'"
            type="text"
            [(ngModel)]="entry.target"
            placeholder="Enter bug details"
            class="form-input"
          />

          <!-- Improvement: Free text -->
          <input
            *ngIf="entry.specificTargetType === 'Improvement'"
            type="text"
            [(ngModel)]="entry.target"
            placeholder="Enter improvement details"
            class="form-input"
          />

          <!-- Next Iteration: Free text -->
          <input
            *ngIf="entry.specificTargetType === 'Next Iteration'"
            type="text"
            [(ngModel)]="entry.target"
            placeholder="Enter iteration details"
            class="form-input"
          />

          <!-- Concept Exploration: Free text -->
          <input
            *ngIf="entry.specificTargetType === 'Concept Exploration'"
            type="text"
            [(ngModel)]="entry.target"
            placeholder="Enter concept details"
            class="form-input"
          />

          <!-- Diagram: Free text -->
          <input
            *ngIf="entry.specificTargetType === 'Diagram'"
            type="text"
            [(ngModel)]="entry.target"
            placeholder="Enter diagram name"
            class="form-input"
          />

          <!-- Node Entry: Free text -->
          <input
            *ngIf="entry.specificTargetType === 'Node Entry'"
            type="text"
            [(ngModel)]="entry.target"
            placeholder="Enter node details"
            class="form-input"
          />

          <!-- Technique Card Note: Free text -->
          <input
            *ngIf="entry.specificTargetType === 'Technique Card Note'"
            type="text"
            [(ngModel)]="entry.target"
            placeholder="Enter technique details"
            class="form-input"
          />
        </div>
      </div>

      <div class="dialog-footer">
        <button class="btn btn-cancel" (click)="onCancel()">Cancel</button>
        <button class="btn btn-save" (click)="onSave()" [disabled]="!isValid()">
          {{ isNew ? 'Create' : 'Save' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        background: var(--color-bg-primary, #fff);
        border-radius: 8px;
        padding: 20px;
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 2px solid var(--color-border, #ddd);
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--color-text-primary, #000);
      }

      .btn-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--color-text-secondary, #666);
        padding: 0;
        width: 24px;
        height: 24px;
      }

      .btn-close:hover {
        color: var(--color-text-primary, #000);
      }

      .dialog-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 20px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .form-group label {
        font-weight: 600;
        font-size: 13px;
        color: var(--color-text-secondary, #333);
      }

      .form-input {
        padding: 8px 10px;
        border: 1px solid var(--color-border, #ddd);
        border-radius: 4px;
        background: var(--color-bg-primary, #fff);
        color: var(--color-text-primary, #000);
        font-size: 13px;
        font-family: inherit;
        transition: border-color 0.2s;
      }

      .form-input:focus {
        outline: none;
        border-color: var(--color-accent, #6366f1);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .form-input:disabled {
        background: var(--color-bg-disabled, #f0f0f0);
        color: var(--color-text-disabled, #999);
        cursor: not-allowed;
      }

      .form-hint {
        font-size: 11px;
        color: var(--color-text-secondary, #666);
        margin-top: 4px;
        display: block;
      }

      .form-textarea {
        resize: vertical;
        min-height: 80px;
      }

      .dialog-footer {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        padding-top: 12px;
        border-top: 1px solid var(--color-border, #ddd);
      }

      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-cancel {
        background: var(--color-bg-secondary, #f5f5f5);
        color: var(--color-text-primary, #000);
        border: 1px solid var(--color-border, #ddd);
      }

      .btn-cancel:hover {
        background: var(--color-border, #ddd);
      }

      .btn-save {
        background: var(--color-accent, #6366f1);
        color: white;
      }

      .btn-save:hover:not(:disabled) {
        background: #4f46e5;
      }

      .btn-save:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Dark Mode Support */
      .dialog-container.dark-mode {
        background: var(--color-bg-primary, #2a2a2a);
        color: var(--color-text-primary, #e0e0e0);
      }

      .dialog-container.dark-mode .dialog-header {
        border-bottom-color: var(--color-border, #444);
      }

      .dialog-container.dark-mode .dialog-header h2 {
        color: var(--color-text-primary, #e0e0e0);
      }

      .dialog-container.dark-mode .btn-close {
        color: var(--color-text-secondary, #999);
      }

      .dialog-container.dark-mode .btn-close:hover {
        color: var(--color-text-primary, #e0e0e0);
      }

      .dialog-container.dark-mode .form-group label {
        color: var(--color-text-secondary, #bbb);
      }

      .dialog-container.dark-mode .form-input {
        background: var(--color-bg-secondary, #1e1e1e);
        color: var(--color-text-primary, #e0e0e0);
        border-color: var(--color-border, #444);
      }

      .dialog-container.dark-mode .form-input:focus {
        border-color: var(--color-accent, #6fa3ff);
        box-shadow: 0 0 0 3px rgba(111, 163, 255, 0.1);
      }

      .dialog-container.dark-mode .form-input:disabled {
        background: var(--color-bg-disabled, #1a1a1a);
        color: var(--color-text-disabled, #666);
      }

      .dialog-container.dark-mode .form-hint {
        color: var(--color-text-secondary, #888);
      }

      .dialog-container.dark-mode .dialog-footer {
        border-top-color: var(--color-border, #444);
      }

      .dialog-container.dark-mode .btn-cancel {
        background: var(--color-bg-secondary, #1e1e1e);
        color: var(--color-text-primary, #e0e0e0);
        border-color: var(--color-border, #444);
      }

      .dialog-container.dark-mode .btn-cancel:hover {
        background: var(--color-border, #444);
      }

      .dialog-container.dark-mode .btn-save {
        background: var(--color-accent, #4a5fd9);
      }

      .dialog-container.dark-mode .btn-save:hover:not(:disabled) {
        background: var(--color-accent, #6fa3ff);
      }
    `,
  ],
})
export class ToDoEditDialogComponent implements OnInit {
  @Input() entry!: IToDoEntry;
  @Input() teams: any[] = []; // Available teams from context
  @Input() selectedTeam: any = null; // Currently selected team
  @Input() teamPlayers: string[] = [];
  @Input() teamGroups: string[] = [];
  @Output() save = new EventEmitter<IToDoEntry>();
  @Output() cancel = new EventEmitter<void>();

  isNew = false;
  isDarkMode = false;
  allStatuses = ALL_STATUSES;
  allPriorities = ALL_PRIORITIES;
  specificTargetTypes: SpecificTargetType[] = [];
  selectedTeamForTarget: any = null; // Track selected team in the form
  selectedTeamPlayers: string[] = []; // Players for the selected team

  constructor(private store: Store) {
    // Subscribe to dark mode state
    this.store.select(SketchState.getIsDarkMode).subscribe((isDarkMode) => {
      this.isDarkMode = isDarkMode;
    });
  }

  ngOnInit(): void {
    if (!this.entry.toDoID) {
      this.isNew = true;
      const now = Date.now();
      const nowUTC = new Date(now).toISOString();
      this.entry = {
        toDoID: '',
        userId: '',
        title: '',
        description: '',
        status: 'Open',
        priority: 'medium',
        targetType: 'Development',
        specificTargetType: 'Feature Request',
        target: '',
        createdAt: now,
        updatedAt: now,
        createdUTC: nowUTC,
        lastUpdatedUTC: nowUTC,
        pinned: false,
        ownershipContext: {
          contextType: 'USER',
          contextId: 0,
        },
      };
    }
    this.updateSpecificTargetTypes();
  }

  onTargetTypeChange(): void {
    this.updateSpecificTargetTypes();
    this.entry.specificTargetType = this.specificTargetTypes[0];
    this.entry.target = '';
  }

  onSpecificTargetTypeChange(): void {
    this.entry.target = '';
    // Reset team selection when target type changes
    this.selectedTeamForTarget = null;
    this.selectedTeamPlayers = [];
  }

  onTeamSelectionChange(): void {
    // Update the team name if team note is selected
    if (
      this.entry.specificTargetType === 'Team Note' &&
      this.selectedTeamForTarget
    ) {
      this.entry.target =
        this.selectedTeamForTarget.TeamName ||
        this.selectedTeamForTarget.Name ||
        '';
    }

    // Update available players if team is selected
    this.updatePlayersForSelectedTeam();
  }

  shouldShowTeamSelector(): boolean {
    const teamRelatedTypes: SpecificTargetType[] = ['Player Note', 'Team Note'];
    return teamRelatedTypes.includes(this.entry.specificTargetType);
  }

  isPlayerFieldEnabled(): boolean {
    // Player field is enabled only when:
    // 1. Teams are populated
    // 2. A team is selected
    // 3. We're editing a Player Note
    return (
      this.teams.length > 0 &&
      this.selectedTeamForTarget !== null &&
      this.entry.specificTargetType === 'Player Note'
    );
  }

  private updatePlayersForSelectedTeam(): void {
    // Extract players from the selected team
    if (this.selectedTeamForTarget && this.selectedTeamForTarget.Players) {
      this.selectedTeamPlayers = this.selectedTeamForTarget.Players.map(
        (p: any) => `#${p.JerseyNumber || ''} ${p.FirstName} ${p.LastName}`
      );
    } else {
      this.selectedTeamPlayers = [];
    }
  }

  private updateSpecificTargetTypes(): void {
    const types = TARGET_TYPES_BY_CATEGORY[this.entry.targetType];
    this.specificTargetTypes = types as SpecificTargetType[];
  }

  get targetFieldLabel(): string {
    const labels: Record<SpecificTargetType, string> = {
      'Player Note': 'Player',
      'Team Note': 'Team',
      'Team Group Note': 'Team Group',
      'Session Note': 'Date',
      'Training Note': 'Training Details',
      'Feature Request': 'Feature Details',
      'Bug Fix': 'Bug Details',
      Improvement: 'Improvement Details',
      'Next Iteration': 'Iteration Details',
      'Concept Exploration': 'Concept Details',
      Diagram: 'Diagram Name',
      'Node Entry': 'Node Details',
      'Technique Card Note': 'Technique Details',
      'Demystify/Research': 'Research Details',
      Learn: 'Learning Details',
      'Conduct Impact Assessment': 'Assessment Details',
      Plan: 'Planning Details',
    };
    return labels[this.entry.specificTargetType] || 'Target';
  }

  formatTargetType(type: SpecificTargetType): string {
    return type;
  }

  isValid(): boolean {
    return this.entry.title.trim().length > 0;
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSave(): void {
    if (this.isValid()) {
      this.save.emit(this.entry);
    }
  }
}
