import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';
import { BaseSlidingDrawer } from '../../shared/base-sliding-drawer/base-sliding-drawer';
import { User, ITenant, ITeam, ITeamGroup } from '../../../interfaces';
import { ILesson } from '../../../interfaces/lesson-builder.interfaces';
import { DecisionFlow } from '../../../interfaces/decision-flow.interfaces';
import { GlobalContextState } from '../../../state/user-context.state';

@Component({
  selector: 'app-drawer-context',
  standalone: true,
  imports: [CommonModule, BaseSlidingDrawer],
  templateUrl: './drawer-context.html',
  styleUrl: './drawer-context.scss',
})
export class DrawerContext implements OnInit, OnDestroy {
  @Input() isOpen = false;

  @Output() close = new EventEmitter<void>();

  // State properties
  loggedInUser: User | null = null;
  contextUser: User | null = null;
  selectedTenant: ITenant | null = null;
  selectedTeam: ITeam | null = null;
  selectedTeamGroup: ITeamGroup | null = null;
  selectedLesson: ILesson | null = null;
  selectedNode: string | null = null;
  selectedDataset: DecisionFlow | null = null;

  private destroy$ = new Subject<void>();

  constructor(private store: Store, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('🔄 Context Drawer: ngOnInit - Setting up subscriptions');

    // Subscribe to logged-in user changes
    this.store
      .select(GlobalContextState.loggedInUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        console.log('👤 Context Drawer: Logged-in user updated:', user);
        this.loggedInUser = user;
        this.cdr.detectChanges();
      });

    // Subscribe to context user changes
    this.store
      .select(GlobalContextState.selectedContextUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        console.log('👥 Context Drawer: Context user updated:', user);
        this.contextUser = user;
        this.cdr.detectChanges();
      });

    // Subscribe to selected tenant changes
    this.store
      .select(GlobalContextState.selectedContextTenant)
      .pipe(takeUntil(this.destroy$))
      .subscribe((tenant) => {
        console.log('🏢 Context Drawer: Selected tenant updated:', tenant);
        this.selectedTenant = tenant;
        this.cdr.detectChanges();
      });

    // Subscribe to selected team changes
    this.store
      .select(GlobalContextState.selectedContextTeam)
      .pipe(takeUntil(this.destroy$))
      .subscribe((team) => {
        console.log('🏀 Context Drawer: Selected team updated:', team);
        this.selectedTeam = team;
        this.cdr.detectChanges();
      });

    // Subscribe to selected team group changes
    this.store
      .select(GlobalContextState.selectedContextTeamGroup)
      .pipe(takeUntil(this.destroy$))
      .subscribe((teamGroup) => {
        console.log(
          '👥 Context Drawer: Selected team group updated:',
          teamGroup
        );
        this.selectedTeamGroup = teamGroup;
        this.cdr.detectChanges();
      });

    // Subscribe to selected lesson runner lesson changes
    this.store
      .select(GlobalContextState.selectedContextLessonRunnerLesson)
      .pipe(takeUntil(this.destroy$))
      .subscribe((lesson) => {
        console.log('📚 Context Drawer: Selected lesson updated:', lesson);
        this.selectedLesson = lesson;
        this.cdr.detectChanges();
      });

    // Subscribe to selected node changes
    this.store
      .select(GlobalContextState.selectedContextNode)
      .pipe(takeUntil(this.destroy$))
      .subscribe((nodeId) => {
        console.log('🎯 Context Drawer: Selected node updated:', nodeId);
        this.selectedNode = nodeId;
        this.cdr.detectChanges();
      });

    // Subscribe to selected dataset changes
    this.store
      .select(GlobalContextState.selectedContextDataset)
      .pipe(takeUntil(this.destroy$))
      .subscribe((dataset) => {
        console.log('📊 Context Drawer: Selected dataset updated:', dataset);
        this.selectedDataset = dataset;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Help text for the drawer
  public readonly drawerHelp = `
    <strong>Context Details</strong><br><br>
    This drawer shows your current operational context including logged-in user, organization, team, and team group selections.<br><br>
    <strong>Logged In User:</strong> Your account information and roles in the current organization.<br><br>
    <strong>Operating As:</strong> If you are viewing/managing data on behalf of another user (such as a parent viewing their child's information), that user's details will be shown here.<br><br>
    <strong>Team & Team Group:</strong> Shows your currently selected team and team group for filtering and management.
  `;

  onClose(): void {
    this.close.emit();
  }

  get isOperatingAsAnotherUser(): boolean {
    return (
      this.loggedInUser !== null &&
      this.contextUser !== null &&
      this.loggedInUser.UserId !== this.contextUser.UserId
    );
  }

  getUserDisplayName(user: User | null): string {
    if (!user) return 'N/A';
    const parts = [user.FirstName, user.MiddleName, user.LastName].filter(
      (part) => part && part.trim() !== ''
    );
    return parts.length > 0 ? parts.join(' ') : `User ${user.UserId}`;
  }

  getRolesForUser(user: User | null): string {
    if (!user || !this.selectedTenant) return 'No roles';

    // Find the tenant in the user's tenants list
    const userTenant = user.Tenants?.find(
      (t) => t.TenantID === this.selectedTenant?.TenantID
    );

    if (!userTenant || !userTenant.Roles || userTenant.Roles.length === 0) {
      return 'No roles';
    }

    return userTenant.Roles.map((role) => role.RoleName).join(', ');
  }

  formatPhoneNumber(phone: string | undefined): string {
    if (!phone || phone.trim() === '') return 'N/A';
    return phone;
  }

  formatEmail(email: string | undefined): string {
    if (!email || email.trim() === '') return 'N/A';
    return email;
  }

  hasTenantRelatives(): boolean {
    if (!this.selectedTenant || !this.selectedTenant.Relatives) {
      return false;
    }
    return this.selectedTenant.Relatives.length > 0;
  }

  getTenantRelatives(): User[] {
    if (!this.selectedTenant || !this.selectedTenant.Relatives) {
      return [];
    }
    return this.selectedTenant.Relatives;
  }

  getRelativeRoles(relative: User): string {
    if (!this.selectedTenant) return 'No roles';

    // Find this tenant in the relative's tenant list
    const relativeTenant = relative.Tenants?.find(
      (t) => t.TenantID === this.selectedTenant?.TenantID
    );

    if (
      !relativeTenant ||
      !relativeTenant.Roles ||
      relativeTenant.Roles.length === 0
    ) {
      return 'No roles';
    }

    return relativeTenant.Roles.map((role) => role.RoleName).join(', ');
  }

  getTenantRoles(): string {
    if (
      !this.selectedTenant ||
      !this.selectedTenant.Roles ||
      this.selectedTenant.Roles.length === 0
    ) {
      return 'No roles';
    }
    return this.selectedTenant.Roles.map((role) => role.RoleName).join(', ');
  }
}
