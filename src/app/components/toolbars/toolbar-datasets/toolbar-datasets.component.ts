import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DecisionFlow } from '../../../interfaces';
import {
  isOwnershipContextAllowed,
  isSystemLevelResource,
  isPersonalLevelResource,
  isTenantLevelResource,
  isTeamLevelResource,
  isTeamGroupLevelResource,
} from '../../../utils/ownership-context.utils';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';
import { GlobalContextState } from '../../../state';

@Component({
  selector: 'app-toolbar-datasets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-datasets.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-datasets.component.scss',
  ],
})
export class ToolbarDatasetsComponent
  extends BaseToolbarComponent
  implements OnChanges, OnInit, OnDestroy
{
  private destroy$ = new Subject<void>();
  // Required base component properties
  readonly toolbarId = 'datasets-toolbar';
  readonly toolbarTitle = 'Datasets';
  readonly toolbarIcon = '💡';

  // Help text for this toolbar
  constructor(private store: Store) {
    super();
  }
  // Removed duplicate inputs - now inherited from BaseToolbarComponent
  @Input() decisionFlows: DecisionFlow[] = [];

  // Get selectedContextDataset from global state
  get selectedContextDataset(): DecisionFlow | null {
    return this.store.selectSnapshot(GlobalContextState.selectedContextDataset);
  }

  @Input() selectedOrganizationId: number | null = null;
  @Input() selectedTeamId: number | null = null;
  @Input() selectedTeamName: string | null = null;
  @Input() currentTeamGroupId: number | null = null;
  @Input() selectedNode: string | null = null;
  @Input() selectedNodeHasChildren = false;
  @Input() currentUserRoleId: number | null = null;

  // Additional properties for debug methods
  @Input() currentTenantId: number | null = null;
  @Input() currentTeamId: number | null = null;

  // Tab state: 'system' | 'tenant' | 'team' | 'teamgroup'
  public activeTab: 'system' | 'personal' | 'tenant' | 'team' | 'teamgroup' =
    'system';

  // Tab availability getters
  get hasSystemTab(): boolean {
    return this.decisionFlows.some((f) =>
      isSystemLevelResource(f.OwnershipContext)
    );
  }

  get hasTenantTab(): boolean {
    return this.decisionFlows.some(
      (f) =>
        isTenantLevelResource(f.OwnershipContext) ||
        isPersonalLevelResource(f.OwnershipContext)
    );
  }

  get hasTeamTab(): boolean {
    return this.decisionFlows.some((f) =>
      isTeamLevelResource(f.OwnershipContext)
    );
  }

  get hasTeamGroupTab(): boolean {
    return this.decisionFlows.some((f) =>
      isTeamGroupLevelResource(f.OwnershipContext)
    );
  }

  // Computed dataset arrays for debug methods
  get systemDatasets(): DecisionFlow[] {
    return this.decisionFlows.filter((f) =>
      isSystemLevelResource(f.OwnershipContext)
    );
  }

  get tenantDatasets(): DecisionFlow[] {
    return this.decisionFlows.filter(
      (f) =>
        isTenantLevelResource(f.OwnershipContext) ||
        isPersonalLevelResource(f.OwnershipContext)
    );
  }

  get teamDatasets(): DecisionFlow[] {
    return this.decisionFlows.filter((f) =>
      isTeamLevelResource(f.OwnershipContext)
    );
  }

  get teamGroupDatasets(): DecisionFlow[] {
    return this.decisionFlows.filter((f) =>
      isTeamGroupLevelResource(f.OwnershipContext)
    );
  }

  get allDatasets(): DecisionFlow[] {
    return this.decisionFlows;
  }

  // Tab enabling logic based on user requirements
  readonly isSystemTabEnabled = true; // System tab is always enabled regardless of data availability
  readonly isPersonalTabEnabled = true; // Personal tab is always enabled regardless of data availability

  get isTenantTabEnabled(): boolean {
    // Tenant tab is enabled for PERSONAL (0) and other tenants (>0), but NOT for SYSTEM (-1)
    // Show tenant tab even if no data is available for non-system tenants
    if (this.selectedOrganizationId === -1) {
      return false; // SYSTEM context: tenant tab disabled
    }
    return true; // Enable tenant tab for all non-system tenants, even if no data
  }

  get isTeamTabEnabled(): boolean {
    // Team tab is enabled when a team is selected, even if no team flows are available
    const hasTeamSelected =
      this.selectedTeamId !== null && this.selectedTeamId !== undefined;
    return hasTeamSelected;
  }

  get isTeamGroupTabEnabled(): boolean {
    // Team Group tab is enabled when both team and team group are selected, even if no data available
    const hasTeamSelected =
      this.selectedTeamId !== null && this.selectedTeamId !== undefined;
    const hasTeamGroupSelected =
      this.currentTeamGroupId !== null && this.currentTeamGroupId !== undefined;
    return hasTeamSelected && hasTeamGroupSelected;
  }

  setActiveTab(
    tab: 'system' | 'personal' | 'tenant' | 'team' | 'teamgroup'
  ): void {
    this.activeTab = tab;
    this.onTabChange();
  }

  // Removed duplicate outputs - now inherited from BaseToolbarComponent
  @Output() selectDecisionFlow = new EventEmitter<DecisionFlow>();
  @Output() createNewChart = new EventEmitter<void>();
  @Output() breakoutToNew = new EventEmitter<void>();
  @Output() combineDatasets = new EventEmitter<void>();
  @Output() promoteDataset = new EventEmitter<void>();
  @Output() demoteDataset = new EventEmitter<void>();
  @Output() deleteDataset = new EventEmitter<void>();
  @Output() editDataset = new EventEmitter<DecisionFlow>();

  // Cache for filtered flows to prevent excessive recalculation
  private _filteredFlowsCache: DecisionFlow[] | null = null;
  private _lastFilterHash: string | null = null;

  /**
   * Get current filter state hash for caching
   */
  private getFilterHash(): string {
    return `${this.selectedOrganizationId}-${this.selectedTeamId}-${
      this.decisionFlows?.length || 0
    }-${this.activeTab}`;
  }

  ngOnInit(): void {
    // Subscribe to selectedContextDataset changes to clear cache
    this.store
      .select(GlobalContextState.selectedContextDataset)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Clear cache when selected dataset changes
        this._filteredFlowsCache = null;
        this._lastFilterHash = null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Clear cache when inputs change that affect filtering
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['selectedOrganizationId'] ||
      changes['selectedTeamId'] ||
      changes['currentTeamGroupId'] ||
      changes['decisionFlows'] ||
      changes['selectedNode'] ||
      changes['selectedNodeHasChildren'] ||
      changes['currentUserRoleId']
    ) {
      // Clear cache when filter-affecting inputs change
      this._filteredFlowsCache = null;
      this._lastFilterHash = null;
    }

    // Ensure active tab is valid for current data and enabled; if not, pick first available enabled tab
    const enabledTabs: (
      | 'system'
      | 'personal'
      | 'tenant'
      | 'team'
      | 'teamgroup'
    )[] = [];
    if (this.isSystemTabEnabled) enabledTabs.push('system');
    if (this.isPersonalTabEnabled) enabledTabs.push('personal');
    if (this.isTenantTabEnabled) enabledTabs.push('tenant');
    if (this.isTeamTabEnabled) enabledTabs.push('team');
    if (this.isTeamGroupTabEnabled) enabledTabs.push('teamgroup');

    if (!enabledTabs.includes(this.activeTab)) {
      this.activeTab = enabledTabs[0] || 'system';
    }
  }

  /**
   * Get filtered DecisionFlows based on ownership context and current selections.
   * TENANT CONTROLLED: Only shows ORG/-1, ORG/[selectedOrg], or TEAM/[selectedTeam]
   */
  getFilteredDecisionFlows(): DecisionFlow[] {
    // Check if we can use cached result
    const currentHash = this.getFilterHash();
    if (this._filteredFlowsCache && this._lastFilterHash === currentHash) {
      return this._filteredFlowsCache;
    }

    if (!this.decisionFlows?.length) {
      this._filteredFlowsCache = [];
      this._lastFilterHash = currentHash;
      return this._filteredFlowsCache;
    }

    const filtered = this.decisionFlows.filter((flow) => {
      // Use centralized ownership context logic
      const contextResult = isOwnershipContextAllowed(flow.OwnershipContext, {
        currentTenantId: this.selectedOrganizationId,
        currentTeamId: this.selectedTeamId,
        debugLogging: false,
      });

      if (!contextResult.allowed) {
        return false;
      }

      // Apply tab filter on top of ownership context rules
      return this.matchesActiveTab(flow);
    });

    // Log only when filter state changes
    console.log(
      `📊 [Datasets] Filtered ${filtered.length} flows from ${
        this.decisionFlows.length
      } total flows (Filter: ${this.getFilteringSummary()})`
    );

    // Cache the result
    this._filteredFlowsCache = filtered;
    this._lastFilterHash = currentHash;

    return filtered;
  }

  /**
   * Check if the dataset belongs to the currently active tab
   */
  private matchesActiveTab(flow: DecisionFlow): boolean {
    if (!flow.OwnershipContext) return false;
    switch (this.activeTab) {
      case 'system':
        return isSystemLevelResource(flow.OwnershipContext);
      case 'personal':
        return isPersonalLevelResource(flow.OwnershipContext);
      case 'tenant':
        return isTenantLevelResource(flow.OwnershipContext);
      case 'team':
        return isTeamLevelResource(flow.OwnershipContext);
      case 'teamgroup':
        // Use new TEAMGROUP context detection
        return isTeamGroupLevelResource(flow.OwnershipContext);
      default:
        return true;
    }
  }

  /**
   * Get a summary of current filtering criteria for debugging
   */
  getFilteringSummary(): string {
    switch (this.activeTab) {
      case 'system':
        return 'System';
      case 'personal':
        return 'Personal';
      case 'tenant':
        return 'Tenant';
      case 'team':
        return 'Team';
      case 'teamgroup':
        return 'Team Group';
      default:
        return 'All';
    }
  }

  /**
   * Handle tab changes
   */
  onTabChange(): void {
    // Clear cache to force re-filtering
    this._filteredFlowsCache = null;
    this._lastFilterHash = null;
  }

  /**
   * Get ownership context label for display
   */
  getOwnershipLabel(flow: DecisionFlow): string {
    const context = flow.OwnershipContext;
    const loggedInUser = this.store.selectSnapshot(
      GlobalContextState.loggedInUser
    );

    if (context.Context === 'TENANT' && context.ContextKey === -1) {
      return 'System';
    } else if (
      context.Context === 'USER' &&
      loggedInUser &&
      context.ContextKey === loggedInUser.UserId
    ) {
      return 'Personal';
    } else if (context.Context === 'TENANT') {
      return 'Organization';
    } else if (context.Context === 'TEAM') {
      return 'Team';
    }

    return 'Unknown';
  }

  /**
   * Check if a flow is selected
   */
  isFlowSelected(flow: DecisionFlow): boolean {
    return this.selectedContextDataset?.FlowID === flow.FlowID;
  }

  /**
   * Handle drag start for the toolbar
   */
  onDragStart(event: MouseEvent): void {
    if (!this.locked) {
      this.dragStart.emit(event);
    }
  }

  /**
   * Handle close button click
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Handle lock toggle
   */
  onToggleLock(): void {
    this.toggleLock.emit();
  }

  /**
   * Handle expand/collapse toggle
   */
  onToggleExpanded(): void {
    this.toggleExpanded.emit();
  }

  /**
   * Handle DecisionFlow selection
   */
  onSelectDecisionFlow(flow: DecisionFlow): void {
    this.selectDecisionFlow.emit(flow);
  }

  /**
   * Handle Create New Chart button
   */
  onCreateNewChart(): void {
    this.createNewChart.emit();
  }

  /**
   * Handle Breakout to New button
   */
  onBreakoutToNew(): void {
    this.breakoutToNew.emit();
  }

  /**
   * Handle Promote Dataset button
   */
  onPromoteDataset(): void {
    this.promoteDataset.emit();
  }

  /**
   * Check if promote button should be enabled
   */
  canPromote(): boolean {
    if (!this.selectedContextDataset || !this.currentUserRoleId) {
      return false;
    }

    const context = this.selectedContextDataset.OwnershipContext;

    // TEAM -> TENANT promotion rules
    if (context.Context === 'TEAM') {
      // Enabled for Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11)
      return (
        this.currentUserRoleId === 99 ||
        this.currentUserRoleId === 1 ||
        this.currentUserRoleId === 6 ||
        this.currentUserRoleId === 9 ||
        this.currentUserRoleId === 10 ||
        this.currentUserRoleId === 11
      );
    }

    // TENANT -> SYSTEM promotion rules
    if (context.Context === 'TENANT') {
      // Enabled only for Developer (99) or Administrator (1)
      return this.currentUserRoleId === 99 || this.currentUserRoleId === 1;
    }

    return false;
  }

  /**
   * Get the appropriate title for the promote button
   */
  getPromoteButtonTitle(): string {
    if (!this.selectedContextDataset) {
      return 'Select a dataset to promote';
    }

    const context = this.selectedContextDataset.OwnershipContext;

    if (context.Context === 'TEAM') {
      return 'Promote dataset from TEAM to TENANT level';
    } else if (context.Context === 'TENANT') {
      return 'Promote dataset from TENANT to SYSTEM level';
    }

    return 'Cannot promote this dataset';
  }

  /**
   * Handle Demote Dataset button
   */
  onDemoteDataset(): void {
    this.demoteDataset.emit();
  }

  /**
   * Check if demote button should be enabled
   */
  canDemote(): boolean {
    if (!this.selectedContextDataset || !this.currentUserRoleId) {
      return false;
    }

    const context = this.selectedContextDataset.OwnershipContext;

    // System (TENANT -1) -> TENANT demotion rules
    if (context.Context === 'TENANT' && context.ContextKey === -1) {
      // Enabled only for Developer (99) or Administrator (1)
      return this.currentUserRoleId === 99 || this.currentUserRoleId === 1;
    }

    // TENANT -> TEAM demotion rules
    if (context.Context === 'TENANT' && context.ContextKey !== -1) {
      // Enabled for Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11)
      return (
        this.currentUserRoleId === 99 ||
        this.currentUserRoleId === 1 ||
        this.currentUserRoleId === 6 ||
        this.currentUserRoleId === 9 ||
        this.currentUserRoleId === 10 ||
        this.currentUserRoleId === 11
      );
    }

    // TEAM datasets cannot be demoted further
    return false;
  }

  /**
   * Get the appropriate title for the demote button
   */
  getDemoteButtonTitle(): string {
    if (!this.selectedContextDataset) {
      return 'Select a dataset to demote';
    }

    const context = this.selectedContextDataset.OwnershipContext;

    if (context.Context === 'TENANT' && context.ContextKey === -1) {
      return 'Demote dataset from SYSTEM to TENANT level';
    } else if (context.Context === 'TENANT' && context.ContextKey !== -1) {
      return 'Demote dataset from TENANT to TEAM level';
    } else if (context.Context === 'TEAM') {
      return 'Cannot demote TEAM datasets further';
    }

    return 'Cannot demote this dataset';
  }

  /**
   * Handle Delete Dataset button
   */
  onDeleteDataset(): void {
    this.deleteDataset.emit();
  }

  /**
   * Check if delete button should be enabled based on ownership context and user role
   */
  canDelete(): boolean {
    if (!this.selectedContextDataset || !this.currentUserRoleId) {
      return false;
    }

    const context = this.selectedContextDataset.OwnershipContext;
    const roleId = this.currentUserRoleId;

    // System (TENANT -1) datasets: Only Developer (99) or Administrator (1)
    if (context.Context === 'TENANT' && context.ContextKey === -1) {
      return roleId === 99 || roleId === 1;
    }

    // TENANT datasets: Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11)
    if (context.Context === 'TENANT' && context.ContextKey !== -1) {
      return (
        roleId === 99 ||
        roleId === 1 ||
        roleId === 6 ||
        roleId === 9 ||
        roleId === 10 ||
        roleId === 11
      );
    }

    // TEAM datasets: Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11), Team Manager (7), or Coach (2)
    if (context.Context === 'TEAM') {
      return (
        roleId === 99 ||
        roleId === 1 ||
        roleId === 6 ||
        roleId === 9 ||
        roleId === 10 ||
        roleId === 11 ||
        roleId === 7 ||
        roleId === 2
      );
    }

    return false;
  }

  /**
   * Check if breakout button should be enabled
   * Button is enabled when a node is selected and it has children
   */
  canBreakout(): boolean {
    return this.selectedNode !== null && this.selectedNodeHasChildren;
  }

  /**
   * Handle combine datasets action
   */
  onCombineDatasets(): void {
    this.combineDatasets.emit();
  }

  /**
   * Check if edit button should be enabled based on ownership context and user role
   */
  canEdit(flow: DecisionFlow): boolean {
    if (!flow || !this.currentUserRoleId) {
      return false;
    }

    const context = flow.OwnershipContext;
    const roleId = this.currentUserRoleId;

    // SYSTEM datasets (TENANT/-1): Only Developer (99) or Administrator (1)
    if (context.Context === 'TENANT' && context.ContextKey === -1) {
      return roleId === 99 || roleId === 1;
    }

    // TENANT datasets (TENANT/orgId): Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11)
    if (context.Context === 'TENANT' && context.ContextKey !== -1) {
      return (
        roleId === 99 ||
        roleId === 1 ||
        roleId === 6 ||
        roleId === 9 ||
        roleId === 10 ||
        roleId === 11
      );
    }

    // TEAM datasets: Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11), Team Manager (7), or Coach (2)
    if (context.Context === 'TEAM') {
      return (
        roleId === 99 ||
        roleId === 1 ||
        roleId === 6 ||
        roleId === 9 ||
        roleId === 10 ||
        roleId === 11 ||
        roleId === 7 ||
        roleId === 2
      );
    }

    return false;
  }

  /**
   * Get the appropriate title for the edit button
   */
  getEditButtonTitle(flow: DecisionFlow): string {
    if (!this.canEdit(flow)) {
      return 'You do not have permission to edit this dataset';
    }
    return 'Edit dataset name and description';
  }

  /**
   * Handle edit dataset button click
   */
  onEditDataset(event: MouseEvent, flow: DecisionFlow): void {
    // Prevent the parent click event (selecting the flow)
    event.stopPropagation();

    if (!this.canEdit(flow)) {
      return;
    }

    this.editDataset.emit(flow);
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByFlowId(index: number, flow: DecisionFlow): number | undefined {
    return flow.FlowID;
  }

  /**
   * Debug method to validate tab enabling logic and data structure
   */
  debugDatasets(): void {
    console.log('\n🔍 DATASETS TOOLBAR DEBUG INFORMATION');
    console.log('=====================================');

    // Context Information
    console.log('\n📋 Current Context:');
    console.log('Current Tenant ID:', this.currentTenantId);
    console.log('Current Team ID:', this.currentTeamId);
    console.log('Current Team Group ID:', this.currentTeamGroupId);

    // Tab data availability
    console.log('\n📊 Tab Data Availability:');
    console.log('System datasets count:', this.systemDatasets.length);
    console.log('Tenant datasets count:', this.tenantDatasets.length);
    console.log('Team datasets count:', this.teamDatasets.length);
    console.log('TeamGroup datasets count:', this.teamGroupDatasets.length);
    console.log('Has System Tab:', this.hasSystemTab);
    console.log('Has Tenant Tab:', this.hasTenantTab);
    console.log('Has Team Tab:', this.hasTeamTab);
    console.log('Has TeamGroup Tab:', this.hasTeamGroupTab);

    // Test tab enabling logic
    console.log('\n🔧 Tab Enabling Test Results:');
    console.log('System Tab:', {
      hasData: this.hasSystemTab,
      enabled: this.isSystemTabEnabled,
      shouldBe: 'Always enabled regardless of data availability',
    });
    console.log('Tenant Tab:', {
      hasData: this.hasTenantTab,
      enabled: this.isTenantTabEnabled,
      shouldBe: `${
        this.selectedOrganizationId === -1
          ? 'DISABLED (SYSTEM context -1)'
          : 'ENABLED (non-SYSTEM context)'
      }`,
      currentTenantId: this.selectedOrganizationId,
    });
    console.log('Team Tab:', {
      hasData: this.hasTeamTab,
      enabled: this.isTeamTabEnabled,
      shouldBe: `${
        this.selectedTeamId
          ? 'ENABLED (team selected, regardless of tenant context)'
          : 'DISABLED (no team selected)'
      }`,
      currentTenantId: this.selectedOrganizationId,
      currentTeamId: this.selectedTeamId,
    });
    console.log('TeamGroup Tab:', {
      hasData: this.hasTeamGroupTab,
      enabled: this.isTeamGroupTabEnabled,
      shouldBe: `${
        this.selectedTeamId && this.currentTeamGroupId
          ? 'ENABLED (team & group selected, regardless of tenant context)'
          : 'DISABLED (team/group missing)'
      }`,
      currentTenantId: this.selectedOrganizationId,
      currentTeamId: this.selectedTeamId,
      currentTeamGroupId: this.currentTeamGroupId,
    });

    // Current state
    console.log('\n🎯 Current UI State:');
    console.log('Active Tab:', this.activeTab);
    console.log(
      'Selected Flow:',
      this.selectedContextDataset?.FlowName || 'None'
    );
    console.log('Button Enabled:', !this.selectedContextDataset ? false : true);

    // Sample data verification
    if (this.allDatasets.length > 0) {
      console.log('\n📋 Sample Dataset Contexts:');
      const samples = this.allDatasets.slice(0, 3);
      samples.forEach((dataset, idx) => {
        console.log(`Dataset ${idx + 1}:`, {
          name: dataset.FlowName,
          context: dataset.OwnershipContext,
          contextType: dataset.OwnershipContext?.Context || 'Unknown',
          contextValue: dataset.OwnershipContext?.ContextKey || 'Unknown',
        });
      });
    }

    console.log('\n=====================================\n');
  }
}
