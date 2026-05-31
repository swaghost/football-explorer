import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSlidingDrawer } from '../../shared/base-sliding-drawer/base-sliding-drawer';
import { User } from '../../../interfaces';
import { MockUserService } from '../../../services/mock-user.service';

@Component({
  selector: 'app-drawer-login',
  standalone: true,
  imports: [CommonModule, BaseSlidingDrawer],
  templateUrl: './drawer-login.html',
  styleUrl: './drawer-login.scss',
})
export class DrawerLogin implements OnInit {
  @Input() isOpen = false;
  @Input() selectedUserId: number | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() userSelected = new EventEmitter<User>();

  users: User[] = [];

  // Help text for the drawer
  public readonly drawerHelp = `
    <strong>Mock Login Drawer</strong><br><br>
    This drawer allows you to simulate logging in as different users for testing purposes.<br><br>
    <strong>Select User:</strong> Click on any user from the list to "log in" as that user.<br><br>
    <strong>Note:</strong> This is a development/testing feature that allows you to test different user scenarios and access permissions.
  `;

  constructor(private mockUserService: MockUserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.mockUserService.getUsers().subscribe((data) => {
      this.users = data.users;
    });
  }

  get selectedUser(): User | null {
    if (this.selectedUserId === null) return null;
    return (
      this.users.find((user) => user.UserId === this.selectedUserId) || null
    );
  }

  onClose(): void {
    this.close.emit();
  }

  onUserSelect(user: User): void {
    this.userSelected.emit(user);
    // Don't automatically close - let the parent component handle closing
    // after it has processed the user selection and loaded their tenants
    // this.onClose();
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUserId === userId;
  }

  getUserDisplayName(user: User): string {
    const parts = [user.FirstName, user.MiddleName, user.LastName].filter(
      (part) => part && part.trim() !== ''
    );
    return parts.length > 0 ? parts.join(' ') : `User ${user.UserId}`;
  }

  getUserLocation(user: User): string {
    const parts = [user.City, user.State].filter(
      (part) => part && part.trim() !== ''
    );
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  }

  getUserEmail(user: User): string {
    return user.EmailAddress && user.EmailAddress.trim() !== ''
      ? user.EmailAddress
      : 'No email';
  }
}
