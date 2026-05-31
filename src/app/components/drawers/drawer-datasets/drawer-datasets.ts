import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import { BaseSlidingDrawer } from '../../shared/base-sliding-drawer/base-sliding-drawer';
import { DecisionFlow } from '../../../interfaces/decision-flow.interfaces';
import { OwnershipContext, ITeam, ITeamGroup } from '../../../interfaces';
import { GlobalContextState, SetSelectedContextDataset } from '../../../state';

// Tree node interface for datasets
export interface DatasetTreeNode {
  id: string;
  name: string;
  type: 'root' | 'context' | 'team' | 'teamgroup' | 'dataset';
  dataset?: DecisionFlow;
  children?: DatasetTreeNode[];
  _children?: DatasetTreeNode[];
  x?: number;
  y?: number;
  depth?: number;
}

// D3 hierarchy node type
export interface D3HierarchyNode extends d3.HierarchyNode<DatasetTreeNode> {
  id: string;
  _children?: D3HierarchyNode[];
  x0?: number;
  y0?: number;
}

@Component({
  selector: 'app-drawer-datasets',
  standalone: true,
  imports: [CommonModule, BaseSlidingDrawer],
  templateUrl: './drawer-datasets.html',
  styleUrls: ['./drawer-datasets.scss'],
})
export class DrawerDatasets implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('treeContainer', { read: ElementRef })
  treeContainer?: ElementRef<HTMLDivElement>;

  @Input() isOpen = false;
  @Input() decisionFlows: DecisionFlow[] = [];
  @Input() selectedOrganizationId: number | null = null;
  @Input() selectedTeamId: number | null = null;
  @Input() currentTeamGroupId: number | null = null;
  @Input() teams: ITeam[] = [];
  @Input() teamGroups: ITeamGroup[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() promoteDataset = new EventEmitter<void>();
  @Output() demoteDataset = new EventEmitter<void>();
  @Output() createDataset = new EventEmitter<void>();
  @Output() combineDatasets = new EventEmitter<void>();
  @Output() deleteDataset = new EventEmitter<void>();

  // D3 tree properties
  private svg: any;
  private root: D3HierarchyNode | null = null;
  private duration = 250;
  private nodeHeight = 24;
  private indent = 20;
  private subscription = new Subscription();

  drawerHelp = `
    <strong>Datasets Drawer</strong><br><br>
    Manage and select decision flow datasets.<br><br>
    <strong>Features:</strong><br>
    • View datasets by ownership context<br>
    • System: Built-in datasets<br>
    • Personal: Your private datasets<br>
    • Tenant: Organization-wide datasets<br>
    • Team: Team-specific datasets<br>
    • TeamGroup: Group-specific datasets<br><br>
    <strong>Actions:</strong><br>
    • Select datasets to work with<br>
    • Create new datasets<br>
    • Promote/demote between contexts<br>
    • Combine multiple datasets<br>
    • Delete datasets
  `;

  // Tab state - using ContextName
  public activeTab: 'SYS' | 'PERSONAL' | 'TENANT' | 'TEAM' | 'TEAMGROUP' =
    'SYS';

  constructor(private store: Store) {
    // Subscribe to selectedContextDataset changes to update tree styling
    this.subscription.add(
      this.store
        .select(GlobalContextState.selectedContextDataset)
        .subscribe(() => {
          if (this.svg) {
            // Re-render nodes to update styling (bold for selected)
            this.updateTree();
          }
        })
    );
  }

  ngAfterViewInit(): void {
    if (this.treeContainer) {
      this.initializeSvg();
      this.updateTree();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Simplified debug logging (remove once issue is confirmed fixed)
    const changedKeys = Object.keys(changes);
    if (changedKeys.length > 0) {
      console.log('� drawer-datasets ngOnChanges:', changedKeys.join(', '));

      // Log reference equality for arrays to detect unnecessary updates
      if (changes['teams']) {
        const sameRef =
          changes['teams'].previousValue === changes['teams'].currentValue;
        const sameLength =
          changes['teams'].previousValue?.length ===
          changes['teams'].currentValue?.length;
        console.log(
          `  teams: ${sameRef ? '✅ same ref' : '❌ new ref'}, ${
            sameLength ? '✅ same length' : '❌ diff length'
          }`
        );
      }
      if (changes['teamGroups']) {
        const sameRef =
          changes['teamGroups'].previousValue ===
          changes['teamGroups'].currentValue;
        const sameLength =
          changes['teamGroups'].previousValue?.length ===
          changes['teamGroups'].currentValue?.length;
        console.log(
          `  teamGroups: ${sameRef ? '✅ same ref' : '❌ new ref'}, ${
            sameLength ? '✅ same length' : '❌ diff length'
          }`
        );
      }
    }

    // Rebuild tree when data changes or context changes
    if (
      changes['decisionFlows'] ||
      changes['teams'] ||
      changes['teamGroups'] ||
      changes['selectedOrganizationId']
    ) {
      if (this.svg) {
        console.log('🔄 Rebuilding dataset tree due to data/context change');
        this.updateTree();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Get the currently selected dataset from GlobalContextState
   */
  get selectedContextDataset(): DecisionFlow | null {
    return this.store.selectSnapshot(GlobalContextState.selectedContextDataset);
  }

  /**
   * Filter datasets by current tenant context
   * Returns datasets that match:
   * - System context (TENANT with Context === -1)
   * - User context (USER with Context === logged in user's ID)
   * - Current tenant (Context === selectedOrganizationId)
   * - Teams/TeamGroups within current tenant
   */
  private getFilteredDatasetsByTenant(): DecisionFlow[] {
    const loggedInUser = this.store.selectSnapshot(
      GlobalContextState.loggedInUser
    );

    if (!this.selectedOrganizationId) {
      // No tenant selected - show system and user's personal only
      return this.decisionFlows.filter(
        (flow) =>
          (flow.OwnershipContext.Context === 'TENANT' &&
            flow.OwnershipContext.ContextKey === -1) ||
          (flow.OwnershipContext.Context === 'USER' &&
            loggedInUser &&
            flow.OwnershipContext.ContextKey === loggedInUser.UserId)
      );
    }

    // Get IDs of teams within the selected tenant
    const tenantTeamIds = this.teams
      .filter((team) => team.TenantID === this.selectedOrganizationId)
      .map((team) => team.TeamID);

    // Get IDs of team groups within those teams
    const tenantTeamGroupIds = this.teamGroups
      .filter((tg) =>
        tenantTeamIds.includes(tg.OwnershipContext.ContextKey as number)
      )
      .map((tg) => tg.TeamGroupID);

    return this.decisionFlows.filter((flow) => {
      const context = flow.OwnershipContext.Context;
      const contextKey = flow.OwnershipContext.ContextKey;

      // Always show system datasets (TENANT with -1)
      if (context === 'TENANT' && contextKey === -1) return true;

      // Always show user's personal datasets (USER with user's ID)
      if (
        context === 'USER' &&
        loggedInUser &&
        contextKey === loggedInUser.UserId
      )
        return true;

      // Show tenant-level datasets for current tenant
      if (context === 'TENANT' && contextKey === this.selectedOrganizationId) {
        return true;
      }

      // Show team datasets for teams in current tenant
      if (context === 'TEAM' && tenantTeamIds.includes(contextKey as number)) {
        return true;
      }

      // Show team group datasets for groups in current tenant
      if (
        context === 'TEAMGROUP' &&
        tenantTeamGroupIds.includes(contextKey as number)
      ) {
        return true;
      }

      return false;
    });
  }

  /**
   * Filter flows by ownership context for the active tab
   */
  get filteredFlows(): DecisionFlow[] {
    return this.decisionFlows.filter(
      (flow) => flow.OwnershipContext.Context === this.activeTab
    );
  }

  /**
   * Set the active tab
   */
  public setActiveTab(
    tab: 'SYS' | 'PERSONAL' | 'TENANT' | 'TEAM' | 'TEAMGROUP'
  ): void {
    this.activeTab = tab;
  }

  /**
   * Select a decision flow
   */
  public onSelectFlow(flow: DecisionFlow): void {
    // If FlowID is -1, create a new object reference to force state change detection
    const datasetToDispatch = flow.FlowID === -1 ? { ...flow } : flow;
    this.store.dispatch(new SetSelectedContextDataset(datasetToDispatch));
  }

  /**
   * Check if a flow is selected
   */
  public isFlowSelected(flow: DecisionFlow): boolean {
    return this.selectedContextDataset?.FlowID === flow.FlowID;
  }

  /**
   * Close the drawer
   */
  public onClose(): void {
    this.close.emit();
  }

  /**
   * Promote the selected dataset
   */
  public onPromote(): void {
    this.promoteDataset.emit();
  }

  /**
   * Demote the selected dataset
   */
  public onDemote(): void {
    this.demoteDataset.emit();
  }

  /**
   * Create a new dataset
   */
  public onCreate(): void {
    this.createDataset.emit();
  }

  /**
   * Combine datasets
   */
  public onCombine(): void {
    this.combineDatasets.emit();
  }

  /**
   * Delete the selected dataset
   */
  public onDelete(): void {
    this.deleteDataset.emit();
  }

  /**
   * Get available flows count for a tab
   */
  public getTabCount(
    context: 'SYS' | 'PERSONAL' | 'TENANT' | 'TEAM' | 'TEAMGROUP'
  ): number {
    return this.decisionFlows.filter(
      (flow) => flow.OwnershipContext.Context === context
    ).length;
  }

  /**
   * Check if a tab should be shown based on context availability
   */
  public isTabAvailable(
    context: 'SYS' | 'PERSONAL' | 'TENANT' | 'TEAM' | 'TEAMGROUP'
  ): boolean {
    switch (context) {
      case 'SYS':
      case 'PERSONAL':
        return true; // Always show System and Personal
      case 'TENANT':
        return !!this.selectedOrganizationId;
      case 'TEAM':
        return !!this.selectedTeamId;
      case 'TEAMGROUP':
        return !!this.currentTeamGroupId;
      default:
        return false;
    }
  }

  /**
   * Initialize SVG container
   */
  private initializeSvg(): void {
    if (!this.treeContainer) return;

    this.svg = d3
      .select(this.treeContainer.nativeElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', 500)
      .style('font', '13px sans-serif')
      .style('user-select', 'none');
  }

  /**
   * Build tree data structure from datasets
   * Filters datasets based on current tenant context:
   * - System datasets (Context === -1)
   * - Personal datasets (Context === 0)
   * - Tenant-specific datasets (Context === selectedOrganizationId)
   * - Team/TeamGroup datasets within the tenant
   */
  private buildTreeData(): DatasetTreeNode {
    const root: DatasetTreeNode = {
      id: 'root',
      name: 'Available Datasets',
      type: 'root',
      children: [],
    };

    // Filter datasets by tenant context
    const filteredDatasets = this.getFilteredDatasetsByTenant();

    // System datasets
    const systemDatasets = filteredDatasets.filter(
      (flow) =>
        flow.OwnershipContext.Context === 'TENANT' &&
        flow.OwnershipContext.ContextKey === -1
    );
    if (systemDatasets.length > 0) {
      const systemNode: DatasetTreeNode = {
        id: 'context-system',
        name: `System (${systemDatasets.length})`,
        type: 'context',
        children: systemDatasets.map((dataset) => ({
          id: `dataset-${dataset.FlowID}`,
          name: dataset.FlowName || 'Unnamed Dataset',
          type: 'dataset' as const,
          dataset,
        })),
      };
      root.children!.push(systemNode);
    }

    // User (Personal) datasets - get logged in user ID
    const loggedInUser = this.store.selectSnapshot(
      GlobalContextState.loggedInUser
    );
    const personalDatasets = filteredDatasets.filter(
      (flow) =>
        flow.OwnershipContext.Context === 'USER' &&
        loggedInUser &&
        flow.OwnershipContext.ContextKey === loggedInUser.UserId
    );
    if (personalDatasets.length > 0) {
      const personalNode: DatasetTreeNode = {
        id: 'context-personal',
        name: `Personal (${personalDatasets.length})`,
        type: 'context',
        children: personalDatasets.map((dataset) => ({
          id: `dataset-${dataset.FlowID}`,
          name: dataset.FlowName || 'Unnamed Dataset',
          type: 'dataset' as const,
          dataset,
        })),
      };
      root.children!.push(personalNode);
    }

    // Tenant datasets - grouped by team and team group (exclude system datasets)
    const tenantDatasets = filteredDatasets.filter(
      (flow) =>
        (flow.OwnershipContext.Context === 'TENANT' &&
          flow.OwnershipContext.ContextKey !== -1) ||
        flow.OwnershipContext.Context === 'TEAM' ||
        flow.OwnershipContext.Context === 'TEAMGROUP'
    );

    if (tenantDatasets.length > 0) {
      // Get the selected tenant name
      const selectedTenant = this.store.selectSnapshot(
        GlobalContextState.selectedContextTenant
      );
      const tenantName = selectedTenant?.TenantName || 'Tenant';

      const tenantNode: DatasetTreeNode = {
        id: 'context-tenant',
        name: `${tenantName} (${tenantDatasets.length})`,
        type: 'context',
        children: [],
      };

      // Group by organization-level datasets (no team) - must match selected tenant ID
      const orgDatasets = tenantDatasets.filter(
        (flow) =>
          flow.OwnershipContext.Context === 'TENANT' &&
          flow.OwnershipContext.ContextKey === this.selectedOrganizationId
      );
      orgDatasets.forEach((dataset) => {
        tenantNode.children!.push({
          id: `dataset-${dataset.FlowID}`,
          name: dataset.FlowName || 'Unnamed Dataset',
          type: 'dataset',
          dataset,
        });
      });

      // Group by team
      const teamDatasets = tenantDatasets.filter(
        (flow) =>
          flow.OwnershipContext.Context === 'TEAM' ||
          flow.OwnershipContext.Context === 'TEAMGROUP'
      );

      const teamMap = new Map<string, DatasetTreeNode>();

      teamDatasets.forEach((dataset) => {
        const teamId = dataset.OwnershipContext.Context.toString();

        if (dataset.OwnershipContext.Context === 'TEAM') {
          // Team-level dataset
          if (!teamMap.has(teamId)) {
            const team = this.teams.find(
              (t) => t.TeamID?.toString() === teamId
            );
            teamMap.set(teamId, {
              id: `team-${teamId}`,
              name: team?.TeamName || `Team ${teamId}`,
              type: 'team',
              children: [],
            });
          }
          teamMap.get(teamId)!.children!.push({
            id: `dataset-${dataset.FlowID}`,
            name: dataset.FlowName || 'Unnamed Dataset',
            type: 'dataset',
            dataset,
          });
        } else if (dataset.OwnershipContext.Context === 'TEAMGROUP') {
          // Team group dataset - find the parent team
          const teamGroup = this.teamGroups.find(
            (tg) => tg.TeamGroupID === dataset.OwnershipContext.ContextKey
          );

          if (teamGroup) {
            // Extract team ID from team group's ownership context
            const parentTeamId = teamGroup.OwnershipContext.Context.toString();

            if (!teamMap.has(parentTeamId)) {
              const team = this.teams.find(
                (t) => t.TeamID?.toString() === parentTeamId
              );
              teamMap.set(parentTeamId, {
                id: `team-${parentTeamId}`,
                name: team?.TeamName || `Team ${parentTeamId}`,
                type: 'team',
                children: [],
              });
            }

            // Find or create team group node
            const teamNode = teamMap.get(parentTeamId)!;
            let teamGroupNode = teamNode.children!.find(
              (child) => child.id === `teamgroup-${teamGroup.TeamGroupID}`
            ) as DatasetTreeNode | undefined;

            if (!teamGroupNode) {
              teamGroupNode = {
                id: `teamgroup-${teamGroup.TeamGroupID}`,
                name: teamGroup.TeamGroupName,
                type: 'teamgroup',
                children: [],
              };
              teamNode.children!.push(teamGroupNode);
            }

            teamGroupNode.children!.push({
              id: `dataset-${dataset.FlowID}`,
              name: dataset.FlowName || 'Unnamed Dataset',
              type: 'dataset',
              dataset,
            });
          }
        }
      });

      // Add teams to tenant node
      teamMap.forEach((teamNode) => {
        tenantNode.children!.push(teamNode);
      });

      if (tenantNode.children!.length > 0) {
        root.children!.push(tenantNode);
      }
    }

    return root;
  }

  /**
   * Update the tree visualization
   */
  private updateTree(): void {
    if (!this.svg) return;

    // Build tree data
    const treeData = this.buildTreeData();

    // Convert to d3 hierarchy
    this.root = d3.hierarchy(
      treeData,
      (d: DatasetTreeNode) => d.children
    ) as D3HierarchyNode;
    this.root.x0 = 0;
    this.root.y0 = 0;

    // Start with root expanded
    if (this.root.children) {
      this.root.children.forEach((child) => {
        // Expand first level, collapse rest
        if (child.children) {
          child.children.forEach((grandchild) => this.collapse(grandchild));
        }
      });
    }

    // Clear existing content
    this.svg.selectAll('*').remove();

    this.update(this.root);
  }

  /**
   * Collapse a node and its children
   */
  private collapse(d: D3HierarchyNode): void {
    if (d.children) {
      d._children = d.children;
      d._children.forEach((child) => this.collapse(child));
      d.children = undefined;
    }
  }

  /**
   * Update tree with animations
   */
  private update(source: D3HierarchyNode): void {
    if (!this.root) return;

    // Ensure source has x0 and y0 properties
    if (source.x0 === undefined) source.x0 = 0;
    if (source.y0 === undefined) source.y0 = 0;

    // Get all visible nodes
    const nodes = this.flatten(this.root);
    const height = Math.max(300, nodes.length * this.nodeHeight + 40);

    // Update SVG height
    this.svg.attr('height', height);

    // Assign positions
    let index = -1;
    nodes.forEach((d: any) => {
      d.y0 = d.y;
      d.y = ++index * this.nodeHeight + 20;
      d.x = d.depth * this.indent + 20;
    });

    // Update links and nodes
    this.updateLinks(nodes, source);
    this.updateNodes(nodes, source);

    // Store old positions
    nodes.forEach((d: any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  /**
   * Flatten tree to get visible nodes
   */
  private flatten(root: D3HierarchyNode): D3HierarchyNode[] {
    const nodes: D3HierarchyNode[] = [];

    function recurse(node: D3HierarchyNode) {
      nodes.push(node);
      if (node.children) {
        node.children.forEach(recurse);
      }
    }

    recurse(root);
    return nodes;
  }

  /**
   * Update links between nodes
   */
  private updateLinks(nodes: D3HierarchyNode[], source: D3HierarchyNode): void {
    // Ensure source has valid coordinates
    const sourceX = source.x0 ?? source.x ?? 0;
    const sourceY = source.y0 ?? source.y ?? 0;

    const links = nodes.slice(1);

    const link = this.svg.selectAll('.link').data(links, (d: any) => d.id);

    const linkEnter = link
      .enter()
      .append('g')
      .attr('class', 'link')
      .style('opacity', 0);

    linkEnter
      .append('line')
      .attr('class', 'link-horizontal')
      .attr('x1', (d: any) => d.parent!.x0 ?? sourceX)
      .attr('y1', (d: any) => d.parent!.y0 ?? sourceY)
      .attr('x2', (d: any) => d.parent!.x0 ?? sourceX)
      .attr('y2', (d: any) => d.parent!.y0 ?? sourceY)
      .style('stroke', 'var(--border-color, #ccc)')
      .style('stroke-width', 1);

    linkEnter
      .append('line')
      .attr('class', 'link-vertical')
      .attr('x1', (d: any) => d.parent!.x0 ?? sourceX)
      .attr('y1', (d: any) => d.parent!.y0 ?? sourceY)
      .attr('x2', (d: any) => d.parent!.x0 ?? sourceX)
      .attr('y2', (d: any) => d.parent!.y0 ?? sourceY)
      .style('stroke', 'var(--border-color, #ccc)')
      .style('stroke-width', 1);

    const linkUpdate = linkEnter.merge(link);

    linkUpdate.transition().duration(this.duration).style('opacity', 1);

    linkUpdate
      .select('.link-horizontal')
      .transition()
      .duration(this.duration)
      .attr('x1', (d: any) => d.parent!.x)
      .attr('y1', (d: any) => d.y)
      .attr('x2', (d: any) => d.x)
      .attr('y2', (d: any) => d.y);

    linkUpdate
      .select('.link-vertical')
      .transition()
      .duration(this.duration)
      .attr('x1', (d: any) => d.parent!.x)
      .attr('y1', (d: any) => d.parent!.y)
      .attr('x2', (d: any) => d.parent!.x)
      .attr('y2', (d: any) => d.y);

    const linkExit = link
      .exit()
      .transition()
      .duration(this.duration)
      .style('opacity', 0)
      .remove();

    linkExit
      .selectAll('line')
      .attr('x1', source.x)
      .attr('y1', source.y)
      .attr('x2', source.x)
      .attr('y2', source.y);
  }

  /**
   * Update nodes with animations
   */
  private updateNodes(nodes: D3HierarchyNode[], source: D3HierarchyNode): void {
    // Ensure source has valid coordinates
    const sourceX = source.x0 ?? source.x ?? 0;
    const sourceY = source.y0 ?? source.y ?? 0;

    const node = this.svg
      .selectAll('.node')
      .data(nodes, (d: any) => d.id || (d.id = d.data.id));

    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', (d: any) => `node node-${d.data.type}`)
      .attr('transform', `translate(${sourceX},${sourceY})`)
      .style('opacity', 0)
      .on('click', (event: Event, d: any) => this.handleNodeClick(event, d));

    // Add expand/collapse button
    nodeEnter
      .append('circle')
      .attr('class', 'toggle-button')
      .attr('r', 6)
      .style('fill', 'var(--bg-primary, white)')
      .style('stroke', 'var(--primary-color, #007bff)')
      .style('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0));

    // Add +/- symbol
    nodeEnter
      .append('text')
      .attr('class', 'toggle-symbol')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', 'var(--primary-color, #007bff)')
      .style('cursor', 'pointer')
      .style('user-select', 'none')
      .style('pointer-events', 'none')
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0))
      .text((d: any) => (d._children ? '+' : '−'));

    // Add icon
    nodeEnter
      .append('text')
      .attr('class', 'node-icon')
      .attr('x', 12)
      .attr('dy', '0.35em')
      .style('font-size', '14px')
      .style('cursor', (d: any) =>
        d.data.type === 'dataset' ? 'pointer' : 'default'
      )
      .text((d: any) => this.getNodeIcon(d.data.type));

    // Add label
    nodeEnter
      .append('text')
      .attr('class', 'node-label')
      .attr('dy', '0.35em')
      .attr('x', 28)
      .text((d: any) => d.data.name)
      .style('font-size', '13px')
      .style('fill', 'var(--text-primary, #333)')
      .style('cursor', (d: any) =>
        d.data.type === 'dataset' ? 'pointer' : 'default'
      )
      .style('font-weight', (d: any) => {
        if (d.data.type === 'root') return 'bold';
        if (d.data.type === 'dataset') {
          const selected = this.selectedContextDataset;
          return selected &&
            d.data.dataset &&
            selected.FlowID === d.data.dataset.FlowID
            ? 'bold'
            : 'normal';
        }
        return 'normal';
      });

    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate
      .transition()
      .duration(this.duration)
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      .style('opacity', 1);

    nodeUpdate
      .select('.toggle-button')
      .transition()
      .duration(this.duration)
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0));

    nodeUpdate
      .select('.toggle-symbol')
      .transition()
      .duration(this.duration)
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0))
      .text((d: any) => (d._children ? '+' : '−'));

    nodeUpdate
      .select('.node-label')
      .style('font-weight', (d: any) => {
        if (d.data.type === 'root') return 'bold';
        if (d.data.type === 'dataset') {
          const selected = this.selectedContextDataset;
          return selected &&
            d.data.dataset &&
            selected.FlowID === d.data.dataset.FlowID
            ? 'bold'
            : 'normal';
        }
        return 'normal';
      })
      .style('fill', (d: any) => {
        if (d.data.type === 'dataset') {
          const selected = this.selectedContextDataset;
          return selected &&
            d.data.dataset &&
            selected.FlowID === d.data.dataset.FlowID
            ? 'var(--primary-color, #007bff)'
            : 'var(--text-primary, #333)';
        }
        return 'var(--text-primary, #333)';
      });

    const nodeExit = node
      .exit()
      .transition()
      .duration(this.duration)
      .attr('transform', `translate(${source.x},${source.y})`)
      .style('opacity', 0)
      .remove();
  }

  /**
   * Get icon for node type
   */
  private getNodeIcon(type: string): string {
    switch (type) {
      case 'root':
        return '📊';
      case 'context':
        return '📁';
      case 'team':
        return '🏀';
      case 'teamgroup':
        return '👥';
      case 'dataset':
        return '📄';
      default:
        return '•';
    }
  }

  /**
   * Handle node click
   */
  private handleNodeClick(event: Event, d: any): void {
    if (d.data.type === 'dataset' && d.data.dataset) {
      // Select dataset and dispatch to state
      let dataset = d.data.dataset;
      console.log(
        '📊 Dataset node clicked:',
        dataset.FlowName,
        'FlowID:',
        dataset.FlowID
      );

      // If FlowID is -1, create a new object reference to force state change detection
      // This ensures the subscription fires even when clicking the same SYSTEM dataset multiple times
      if (dataset.FlowID === -1) {
        console.log(
          '🔄 Dataset with FlowID -1 selected - cloning object to force regeneration'
        );
        dataset = { ...dataset };
      }

      // Dispatch action to update global context
      this.store.dispatch(new SetSelectedContextDataset(dataset));

      // Update the tree to reflect the new selection
      this.update(d);
    } else {
      // Toggle expand/collapse for non-dataset nodes
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      this.update(d);
    }
  }
}
