import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Player, ITeam, ITeamGroup } from '../../../interfaces';
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';

interface PlayerSortOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-dialog-edit-team-group',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDialogComponent],
  templateUrl: './dialog-edit-team-group.component.html',
  styleUrls: ['./dialog-edit-team-group.component.scss'],
})
export class DialogEditTeamGroupComponent {
  @Input() visible = false;
  @Input() editingTeamGroup: ITeamGroup | null = null;
  @Input() selectedTeam: ITeam | null = null;
  @Input() playerSortBy = '';
  @Input() playerSortOptions: PlayerSortOption[] = [];
  @Input() tempSelectedPlayerIds: number[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() playerSortChange = new EventEmitter<any>();
  @Output() tempPlayerCheckboxChange = new EventEmitter<{
    playerId: number;
    checked: boolean;
  }>();

  onCancel(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit();
  }

  onPlayerSortChange(event: any): void {
    this.playerSortChange.emit(event);
  }

  onTempPlayerCheckboxChange(playerId: number, isChecked: boolean): void {
    this.tempPlayerCheckboxChange.emit({ playerId, checked: isChecked });
  }

  isTempPlayerSelected(playerId: number): boolean {
    return this.tempSelectedPlayerIds.includes(playerId);
  }

  getSelectedTeamPlayers(): Player[] {
    return this.selectedTeam?.Players || [];
  }

  trackByPlayerId(index: number, player: Player): number {
    return player.PlayerID;
  }

  getPlayerFullName(player: Player): string {
    return `${player.FirstName} ${player.LastName}`;
  }
}
