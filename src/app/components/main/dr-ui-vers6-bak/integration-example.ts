/*
 * Example integration of the EditTeamGroupDialog into D3UIV6
 * This shows how to replace the existing inline dialog with the new component
 *
 * USAGE EXAMPLE:
 *
 * 1. Import the dialog component:
 * import { DialogEditTeamGroupComponent } from './dialogs/dialog-edit-team-group.component';
 *
 * 2. Add to component imports:
 * @Component({
 *   imports: [
 *     CommonModule,
 *     FormsModule,
 *     DialogEditTeamGroupComponent,
 *     // ... other imports
 *   ],
 * })
 *
 * 3. Replace HTML:
 * <app-dialog-edit-team-group
 *   [visible]="showEditTeamGroupDialog"
 *   [editingTeamGroup]="editingTeamGroup"
 *   [selectedTeam]="selectedTeam"
 *   [playerSortBy]="playerSortBy"
 *   [playerSortOptions]="playerSortOptions"
 *   [tempSelectedPlayerIds]="tempSelectedPlayerIds"
 *   (close)="closeEditTeamGroupDialog()"
 *   (save)="saveTeamGroupChanges()"
 *   (playerSortChange)="onPlayerSortChange($event)"
 *   (tempPlayerCheckboxChange)="onTempPlayerCheckboxChange($event)">
 * </app-dialog-edit-team-group>
 *
 * 4. Update event handlers to handle new signature:
 * onTempPlayerCheckboxChange(data: { playerId: number; checked: boolean } | Event): void {
 *   // Handle both old (playerId, checked) and new ({playerId, checked}) signatures
 * }
 */

export {}; // Make this a module
