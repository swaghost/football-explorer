import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IDefaultTeamGroup } from '../../../interfaces/team-group.interfaces';

interface Team {
  TeamID: number;
  TeamName: string;
}

@Component({
  selector: 'app-dialog-add-default-team-groups',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="visible" (click)="onOverlayClick()">
      <div class="team-group-create-dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>Add Default Team Groups</h3>
        </div>
        <div class="dialog-content">
          <div class="info-text">
            <p>
              Select default team groups to add to "{{
                selectedTeam?.TeamName
              }}":
            </p>
          </div>

          <!-- Select All checkbox -->
          <div
            class="select-all-section"
            *ngIf="availableDefaultTeamGroups.length > 0"
          >
            <label class="select-all-checkbox">
              <input
                type="checkbox"
                [checked]="areAllDefaultTeamGroupsSelected"
                (change)="onToggleSelectAllDefaultTeamGroups()"
              />
              <span
                >Select All ({{
                  availableDefaultTeamGroups.length
                }}
                available)</span
              >
            </label>
          </div>

          <!-- Default team groups list -->
          <div
            class="default-team-groups-list"
            *ngIf="availableDefaultTeamGroups.length > 0"
          >
            <div
              *ngFor="
                let group of availableDefaultTeamGroups;
                trackBy: trackByTeamGroupId
              "
              class="default-group-item"
            >
              <label class="group-checkbox">
                <input
                  type="checkbox"
                  [checked]="isDefaultTeamGroupSelected(group.TeamGroupID)"
                  (change)="
                    onToggleDefaultTeamGroupSelection(group.TeamGroupID)
                  "
                />
                <span class="group-name">{{ group.TeamGroupName }}</span>
              </label>
              <div class="group-details">
                <span
                  class="context-badge"
                  [class]="group.OwnershipContext.Context.toLowerCase()"
                >
                  {{
                    group.OwnershipContext.Context === 'TENANT' &&
                    group.OwnershipContext.ContextKey === -1
                      ? 'System'
                      : 'Organization'
                  }}
                </span>
                <span
                  class="position-info"
                  *ngIf="
                    group.MatchingPositions?.length > 0 ||
                    group.MatchingPositionNumbers?.length > 0
                  "
                >
                  <span *ngIf="group.MatchingPositions?.length > 0">
                    Positions: {{ group.MatchingPositions.join(', ') }}
                  </span>
                  <span
                    *ngIf="
                      group.MatchingPositions?.length > 0 &&
                      group.MatchingPositionNumbers?.length > 0
                    "
                  >
                    &nbsp;|&nbsp;
                  </span>
                  <span *ngIf="group.MatchingPositionNumbers?.length > 0">
                    Numbers: {{ group.MatchingPositionNumbers.join(', ') }}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <!-- No available groups message -->
          <div
            class="no-groups-message"
            *ngIf="availableDefaultTeamGroups.length === 0"
          >
            <p>No default team groups are available for this team.</p>
          </div>

          <!-- Selection summary -->
          <div
            class="selected-count"
            *ngIf="selectedDefaultTeamGroupsToAdd.size > 0"
          >
            Selected: {{ selectedDefaultTeamGroupsToAdd.size }} group(s)
          </div>
        </div>
        <div class="dialog-actions">
          <button class="dialog-button cancel-button" (click)="onCancel()">
            Cancel
          </button>
          <button
            class="dialog-button confirm-button"
            (click)="onSave()"
            [disabled]="selectedDefaultTeamGroupsToAdd.size === 0"
          >
            Add Selected Groups
          </button>
        </div>
      </div>
    </div>
  `,

})
export class DialogAddDefaultTeamGroupsComponent {
  @Input() visible = false;
  @Input() selectedTeam: Team | null = null;
  @Input() availableDefaultTeamGroups: IDefaultTeamGroup[] = [];
  @Input() areAllDefaultTeamGroupsSelected = false;
  @Input() selectedDefaultTeamGroupsToAdd = new Set<number>();

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() toggleSelectAllDefaultTeamGroups = new EventEmitter<void>();
  @Output() toggleDefaultTeamGroupSelection = new EventEmitter<number>();

  onOverlayClick(): void {
    this.close.emit();
  }

  onCancel(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit();
  }

  onToggleSelectAllDefaultTeamGroups(): void {
    this.toggleSelectAllDefaultTeamGroups.emit();
  }

  onToggleDefaultTeamGroupSelection(teamGroupId: number): void {
    this.toggleDefaultTeamGroupSelection.emit(teamGroupId);
  }

  isDefaultTeamGroupSelected(teamGroupId: number): boolean {
    return this.selectedDefaultTeamGroupsToAdd.has(teamGroupId);
  }

  trackByTeamGroupId(index: number, group: IDefaultTeamGroup): number {
    return group.TeamGroupID;
  }
}

