import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSlidingDrawer } from '../../shared/base-sliding-drawer/base-sliding-drawer';
import { User } from '../../../interfaces';

@Component({
  selector: 'app-drawer-context-user-selection',
  standalone: true,
  imports: [CommonModule, BaseSlidingDrawer],
  templateUrl: './drawer-context-user-selection.html',
  styleUrl: './drawer-context-user-selection.scss',
})
export class DrawerContextUserSelection {
  @Input() isOpen = false;
  @Input() loggedInUser: User | null = null;
  @Input() availableUsers: User[] = []; // Includes logged-in user (if eligible) and relatives
  @Input() selectedUserId: number | null = null;
  @Input() canSelectSelf = false; // True if user can select themselves (staff/admin/player)

  @Output() close = new EventEmitter<void>();
  @Output() userSelected = new EventEmitter<User>();

  // Help text for the drawer
  public readonly drawerHelp = `
    <strong>Context User Selection</strong><br><br>
    Select who you are acting on behalf of in this organization.<br><br>
    <strong>Me:</strong> Select yourself if you are a player, coach, or administrator in this organization.<br><br>
    <strong>Related Players:</strong> If you are a parent or guardian, select the player you are managing.<br><br>
    <strong>Note:</strong> Your available options depend on your role in the organization and your relationships.
  `;

  get selectedUser(): User | null {
    if (this.selectedUserId === null) return null;
    return (
      this.availableUsers.find((user) => user.UserId === this.selectedUserId) ||
      null
    );
  }

  onClose(): void {
    this.close.emit();
  }

  onUserSelect(user: User): void {
    // Only allow selection if user is assumable
    if (!this.isUserAssumable(user)) {
      return;
    }
    this.userSelected.emit(user);
    this.onClose();
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUserId === userId;
  }

  isUserAssumable(user: User): boolean {
    // Check if the user has IsAssumable flag set (default to true if not specified for backwards compatibility)
    return user.IsAssumable !== false;
  }

  getUserDisplayName(user: User): string {
    if (this.loggedInUser && user.UserId === this.loggedInUser.UserId) {
      return 'Me';
    }
    const parts = [user.FirstName, user.MiddleName, user.LastName].filter(
      (part) => part && part.trim() !== ''
    );
    return parts.length > 0 ? parts.join(' ') : `User ${user.UserId}`;
  }

  getUserRelationship(user: User): string {
    if (this.loggedInUser && user.UserId === this.loggedInUser.UserId) {
      return `${this.loggedInUser.FirstName} ${this.loggedInUser.LastName}`;
    }
    // Could be enhanced to show actual relationship (child, sibling, etc.)
    return 'Related Player';
  }

  getUserEmail(user: User): string {
    return user.EmailAddress && user.EmailAddress.trim() !== ''
      ? user.EmailAddress
      : 'No email';
  }
}
