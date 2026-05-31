import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSlidingDrawer } from '../../shared/base-sliding-drawer/base-sliding-drawer';
import { ITeam, Player } from '../../../interfaces';
import * as d3 from 'd3';

// Simplified team interface for tree display
export interface Team {
  TeamID: number;
  TeamName: string;
  Gender?: string;
  AgeGroup?: string;
  TenantID?: number;
}

interface TreeNode {
  id: string;
  name: string;
  teamData?: ITeam;
  children?: TreeNode[];
  _children?: TreeNode[];
  x?: number;
  y?: number;
  depth?: number;
}

interface D3HierarchyNode extends d3.HierarchyNode<TreeNode> {
  id: string;
  _children?: D3HierarchyNode[];
  x0?: number;
  y0?: number;
}

@Component({
  selector: 'app-drawer-teams',
  standalone: true,
  imports: [CommonModule, BaseSlidingDrawer],
  templateUrl: './drawer-teams.html',
  styleUrls: ['./drawer-teams.scss'],
})
export class DrawerTeams implements AfterViewInit, OnChanges {
  @ViewChild('treeContainer', { read: ElementRef })
  treeContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('staffTreeContainer', { read: ElementRef })
  staffTreeContainer?: ElementRef<HTMLDivElement>;
  @Input() isOpen = false;
  @Input() teams: ITeam[] = [];
  @Input() staffTeams: ITeam[] = [];
  @Input() selectedTeam: ITeam | null = null;
  @Input() tenantLogoUrl: string = '';
  @Input() tenantName: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() selectTeam = new EventEmitter<ITeam | null>();
  @Output() addTeam = new EventEmitter<void>();
  @Output() editTeam = new EventEmitter<void>();
  @Output() deleteTeam = new EventEmitter<void>();
  @Output() editPlayer = new EventEmitter<Player>();
  @Output() addPlayer = new EventEmitter<void>();

  expandedTeams = new Set<number>(); // Track which teams have expanded player rosters

  drawerHelp = `
    <strong>Teams Drawer</strong><br><br>
    Select and manage teams for the current organization.<br><br>
    <strong>Features:</strong><br>
    • View and select accessible teams<br>
    • Add new teams<br>
    • Edit existing teams<br>
    • Delete teams<br><br>
    <strong>Organization:</strong><br>
    • <em>Available Teams</em>: Regular teams (simple list when ≤5 teams, flat tree when >5 teams)<br>
    • <em>Staff Teams</em>: Hierarchical organization by Gender → Age Group → Level → Team
  `;

  // D3 tree properties
  private svg: any;
  private root: D3HierarchyNode | null = null;
  private staffSvg: any;
  private staffRoot: D3HierarchyNode | null = null;
  private duration = 250;
  private nodeHeight = 20;
  private indent = 20;

  get hasSmallTeamList(): boolean {
    return this.teams.length <= 5;
  }

  ngAfterViewInit(): void {
    console.log('[DRAWER-TEAMS] ngAfterViewInit', {
      teams: this.teams.length,
      staffTeams: this.staffTeams.length,
      hasSmallTeamList: this.hasSmallTeamList,
      treeContainer: !!this.treeContainer,
      staffTreeContainer: !!this.staffTreeContainer,
    });
    if (!this.hasSmallTeamList && this.treeContainer) {
      this.initializeTree();
    }
    if (this.staffTeams.length > 0 && this.staffTreeContainer) {
      this.initializeStaffTree();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('[DRAWER-TEAMS] ngOnChanges', {
      teams: changes['teams'] ? 'changed' : 'unchanged',
      staffTeams: changes['staffTeams'] ? 'changed' : 'unchanged',
      staffTeamsLength: this.staffTeams.length,
      staffTeamsData: this.staffTeams,
    });
    if (changes['teams'] && !changes['teams'].firstChange) {
      if (!this.hasSmallTeamList && this.treeContainer) {
        this.updateTree();
      }
    }

    if (changes['staffTeams']) {
      // Handle both first change and subsequent changes
      console.log(
        '[DRAWER-TEAMS] staffTeams changed, scheduling initialization check'
      );
      setTimeout(() => {
        console.log('[DRAWER-TEAMS] setTimeout callback executing', {
          staffTeamsLength: this.staffTeams.length,
          hasContainer: !!this.staffTreeContainer,
          hasSvg: !!this.staffSvg,
        });
        if (this.staffTeams.length > 0 && this.staffTreeContainer) {
          if (!this.staffSvg) {
            console.log('[DRAWER-TEAMS] Calling initializeStaffTree');
            this.initializeStaffTree();
          } else {
            console.log('[DRAWER-TEAMS] Calling updateStaffTree');
            this.updateStaffTree();
          }
        } else {
          console.log('[DRAWER-TEAMS] Cannot initialize staff tree:', {
            reason:
              this.staffTeams.length === 0 ? 'no staff teams' : 'no container',
          });
        }
      }, 0);
    }

    if (changes['selectedTeam']) {
      console.log('🔄 selectedTeam input changed:', {
        previous: changes['selectedTeam'].previousValue?.TeamName,
        current: changes['selectedTeam'].currentValue?.TeamName,
        previousID: changes['selectedTeam'].previousValue?.TeamID,
        currentID: changes['selectedTeam'].currentValue?.TeamID,
      });
    }

    if (
      changes['isOpen'] &&
      changes['isOpen'].currentValue &&
      !this.hasSmallTeamList
    ) {
      // Redraw tree when drawer opens
      setTimeout(() => {
        if (this.treeContainer) {
          this.updateTree();
        }
      }, 100);
    }
  }

  private initializeTree(): void {
    if (!this.treeContainer) return;

    // Clear existing SVG if any
    d3.select(this.treeContainer.nativeElement).selectAll('svg').remove();

    // Create SVG
    this.svg = d3
      .select(this.treeContainer.nativeElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('font', '12px sans-serif')
      .style('user-select', 'none');

    this.drawTree();
  }

  private updateTree(): void {
    if (!this.svg) {
      this.initializeTree();
    } else {
      this.drawTree();
    }
  }

  private buildTreeData(): TreeNode {
    const root: TreeNode = {
      id: 'root',
      name: 'Teams',
      children: [],
    };

    // Add teams directly (flat list, no hierarchy)
    this.teams.forEach((team) => {
      root.children!.push({
        id: `team-${team.TeamID}`,
        name: team.TeamName,
        teamData: team,
      });
    });

    return root;
  }

  private drawTree(): void {
    if (!this.svg) return;

    const treeData = this.buildTreeData();

    // Convert to d3 hierarchy
    this.root = d3.hierarchy(
      treeData,
      (d: TreeNode) => d.children
    ) as D3HierarchyNode;
    this.root.x0 = 0;
    this.root.y0 = 0;

    // Keep tree fully expanded - do NOT collapse children
    // Comment out the collapse to keep all nodes expanded
    // if (this.root.children) {
    //   this.root.children.forEach((child) => this.collapse(child));
    // }

    this.update(this.root);
  }

  private collapse(d: D3HierarchyNode): void {
    if (d.children) {
      d._children = d.children;
      d._children.forEach((child) => this.collapse(child));
      d.children = undefined;
    }
  }

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

  private update(source: D3HierarchyNode): void {
    if (!this.root || !this.svg) return;

    const nodes = this.flatten(this.root);
    const height = Math.max(300, nodes.length * this.nodeHeight + 40);

    this.svg.attr('height', height);

    let index = -1;
    nodes.forEach((d: any) => {
      d.y0 = d.y;
      d.y = ++index * this.nodeHeight + 20;
      d.x = d.depth * this.indent + 20;
    });

    this.updateLinks(nodes, source);
    this.updateNodes(nodes, source);

    nodes.forEach((d: any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  private updateLinks(nodes: D3HierarchyNode[], source: D3HierarchyNode): void {
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
      .attr('x1', (d: any) => d.parent!.x0 || source.x0)
      .attr('y1', (d: any) => d.parent!.y0 || source.y0)
      .attr('x2', (d: any) => d.parent!.x0 || source.x0)
      .attr('y2', (d: any) => d.parent!.y0 || source.y0)
      .style('stroke', '#ccc')
      .style('stroke-width', 1);

    linkEnter
      .append('line')
      .attr('class', 'link-vertical')
      .attr('x1', (d: any) => d.parent!.x0 || source.x0)
      .attr('y1', (d: any) => d.parent!.y0 || source.y0)
      .attr('x2', (d: any) => d.parent!.x0 || source.x0)
      .attr('y2', (d: any) => d.parent!.y0 || source.y0)
      .style('stroke', '#ccc')
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

  private updateNodes(nodes: D3HierarchyNode[], source: D3HierarchyNode): void {
    const node = this.svg
      .selectAll('.node')
      .data(nodes, (d: any) => d.id || (d.id = d.data.id));

    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', `translate(${source.x0},${source.y0})`)
      .style('opacity', 0)
      .on('click', (event: Event, d: any) => this.onNodeClick(d));

    // Toggle buttons are hidden since tree is always fully expanded
    // Keeping code structure for potential future use
    nodeEnter
      .append('rect')
      .attr('class', 'toggle-button')
      .attr('x', -8)
      .attr('y', -8)
      .attr('width', 16)
      .attr('height', 16)
      .attr('rx', 2)
      .style('fill', 'white')
      .style('stroke', '#666')
      .style('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('opacity', 0); // Always hidden - tree is always expanded

    nodeEnter
      .append('text')
      .attr('class', 'toggle-symbol')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-family', 'monospace')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#666')
      .style('cursor', 'pointer')
      .style('user-select', 'none')
      .style('opacity', 0) // Always hidden - tree is always expanded
      .text((d: any) => (d._children ? '+' : '−'));

    nodeEnter
      .append('text')
      .attr('class', 'node-label')
      .attr('dy', '0.35em')
      .attr('x', 4) // Consistent positioning since no toggle buttons are shown
      .text((d: any) => d.data.name)
      .style('font-size', '13px')
      .style('fill', (d: any) => (d.data.teamData ? '#111827' : '#4b5563'))
      .style('font-weight', (d: any) => (d.data.teamData ? '500' : '600'))
      .style('cursor', (d: any) => (d.data.teamData ? 'pointer' : 'default'));

    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate
      .transition()
      .duration(this.duration)
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      .style('opacity', 1);

    // Highlight selected team
    nodeUpdate
      .select('.node-label')
      .style('fill', (d: any) => {
        if (
          d.data.teamData &&
          this.selectedTeam?.TeamID === d.data.teamData.TeamID
        ) {
          return '#2563eb';
        }
        return d.data.teamData ? '#111827' : '#4b5563';
      })
      .style('font-weight', (d: any) => {
        if (
          d.data.teamData &&
          this.selectedTeam?.TeamID === d.data.teamData.TeamID
        ) {
          return 'bold';
        }
        return d.data.teamData ? '500' : '600';
      });

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
      .transition()
      .duration(this.duration)
      .attr('x', (d: any) => (d.children || d._children ? 12 : 4));

    const nodeExit = node
      .exit()
      .transition()
      .duration(this.duration)
      .attr('transform', `translate(${source.x},${source.y})`)
      .style('opacity', 0)
      .remove();

    nodeExit.selectAll('.toggle-button').style('opacity', 0);
    nodeExit.selectAll('.toggle-symbol').style('opacity', 0);
    nodeExit.selectAll('.node-label').style('fill-opacity', 0);
  }

  private onNodeClick(d: any): void {
    // If it's a team node, select it
    if (d.data.teamData) {
      this.onSelectTeam(d.data.teamData);
      this.update(d); // Refresh to show selection
    }
    // Tree is always fully expanded - do not allow collapse/expand on parent nodes
    // The toggle functionality has been disabled to keep the tree always expanded
  }

  // ===== STAFF TREE METHODS =====

  private buildStaffTreeData(): TreeNode {
    const root: TreeNode = {
      id: 'staff-root',
      name: this.tenantName || 'Staff Teams',
      children: [],
    };

    // Group by gender
    const genderGroups = new Map<string, ITeam[]>();
    this.staffTeams.forEach((team) => {
      const gender = team.GenderName || 'Other';
      if (!genderGroups.has(gender)) {
        genderGroups.set(gender, []);
      }
      genderGroups.get(gender)!.push(team);
    });

    // Build tree structure: Gender -> AgeGroup -> Level -> Team
    genderGroups.forEach((teams, gender) => {
      const genderNode: TreeNode = {
        id: `staff-gender-${gender}`,
        name: gender,
        children: [],
      };

      // Group by age within gender
      const ageGroups = new Map<string, ITeam[]>();
      teams.forEach((team) => {
        const age = team.AgeGroupName || 'Unspecified';
        if (!ageGroups.has(age)) {
          ageGroups.set(age, []);
        }
        ageGroups.get(age)!.push(team);
      });

      // Add age groups
      ageGroups.forEach((ageTeams, age) => {
        const ageNode: TreeNode = {
          id: `staff-age-${gender}-${age}`,
          name: age,
          children: [],
        };

        // Group by level within age group
        const levelGroups = new Map<number, ITeam[]>();
        ageTeams.forEach((team) => {
          const level = team.Level ?? 0;
          if (!levelGroups.has(level)) {
            levelGroups.set(level, []);
          }
          levelGroups.get(level)!.push(team);
        });

        // Sort levels numerically
        const sortedLevels = Array.from(levelGroups.keys()).sort(
          (a, b) => a - b
        );

        // Add level nodes
        sortedLevels.forEach((level) => {
          const levelTeams = levelGroups.get(level)!;
          const levelNode: TreeNode = {
            id: `staff-level-${gender}-${age}-${level}`,
            name: `Level ${level}`,
            children: [],
          };

          // Add teams to level
          levelTeams.forEach((team) => {
            levelNode.children!.push({
              id: `staff-team-${team.TeamID}`,
              name: team.TeamName,
              teamData: team,
            });
          });

          ageNode.children!.push(levelNode);
        });

        genderNode.children!.push(ageNode);
      });

      root.children!.push(genderNode);
    });

    return root;
  }

  private initializeStaffTree(): void {
    console.log('[STAFF TREE] Initializing staff tree', {
      hasContainer: !!this.staffTreeContainer,
      staffTeamsCount: this.staffTeams.length,
    });
    if (!this.staffTreeContainer) return;

    // Clear existing SVG if any
    d3.select(this.staffTreeContainer.nativeElement).selectAll('svg').remove();

    // Create SVG
    this.staffSvg = d3
      .select(this.staffTreeContainer.nativeElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('font', '12px sans-serif')
      .style('user-select', 'none');

    this.drawStaffTree();
  }

  private updateStaffTree(): void {
    console.log('[STAFF TREE] Updating staff tree', {
      hasSvg: !!this.staffSvg,
      staffTeamsCount: this.staffTeams.length,
    });
    if (!this.staffSvg) {
      this.initializeStaffTree();
      return;
    }
    this.drawStaffTree();
  }

  private drawStaffTree(): void {
    console.log('[STAFF TREE] Drawing staff tree', {
      hasSvg: !!this.staffSvg,
      staffTeamsCount: this.staffTeams.length,
    });
    if (!this.staffSvg) return;

    const treeData = this.buildStaffTreeData();
    console.log('[STAFF TREE] Tree data built:', treeData);

    // Convert to d3 hierarchy
    this.staffRoot = d3.hierarchy(
      treeData,
      (d: TreeNode) => d.children
    ) as D3HierarchyNode;
    this.staffRoot.x0 = 0;
    this.staffRoot.y0 = 0;

    // Collapse all children initially
    if (this.staffRoot.children) {
      this.staffRoot.children.forEach((child) => this.collapse(child));
    }

    this.updateStaff(this.staffRoot);
  }

  private updateStaff(source: D3HierarchyNode): void {
    if (!this.staffRoot || !this.staffSvg) return;

    const nodes = this.flatten(this.staffRoot);
    const height = Math.max(300, nodes.length * this.nodeHeight + 40);

    this.staffSvg.attr('height', height);

    let index = -1;
    nodes.forEach((d: any) => {
      d.y0 = d.y;
      d.y = ++index * this.nodeHeight + 20;
      d.x = d.depth * this.indent + 20;
    });

    this.updateStaffLinks(nodes, source);
    this.updateStaffNodes(nodes, source);

    nodes.forEach((d: any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  private updateStaffLinks(
    nodes: D3HierarchyNode[],
    source: D3HierarchyNode
  ): void {
    const links = nodes.slice(1);
    const link = this.staffSvg
      .selectAll('.staff-link')
      .data(links, (d: any) => d.id);

    const linkEnter = link
      .enter()
      .append('g')
      .attr('class', 'staff-link')
      .style('opacity', 0);

    linkEnter
      .append('line')
      .attr('class', 'staff-link-horizontal')
      .attr('x1', (d: any) => d.parent!.x0 || source.x0)
      .attr('y1', (d: any) => d.parent!.y0 || source.y0)
      .attr('x2', (d: any) => d.parent!.x0 || source.x0)
      .attr('y2', (d: any) => d.parent!.y0 || source.y0)
      .style('stroke', '#ccc')
      .style('stroke-width', 1);

    linkEnter
      .append('line')
      .attr('class', 'staff-link-vertical')
      .attr('x1', (d: any) => d.parent!.x0 || source.x0)
      .attr('y1', (d: any) => d.parent!.y0 || source.y0)
      .attr('x2', (d: any) => d.parent!.x0 || source.x0)
      .attr('y2', (d: any) => d.parent!.y0 || source.y0)
      .style('stroke', '#ccc')
      .style('stroke-width', 1);

    const linkUpdate = linkEnter.merge(link);
    linkUpdate.transition().duration(this.duration).style('opacity', 1);

    linkUpdate
      .select('.staff-link-horizontal')
      .transition()
      .duration(this.duration)
      .attr('x1', (d: any) => d.parent!.x)
      .attr('y1', (d: any) => d.y)
      .attr('x2', (d: any) => d.x)
      .attr('y2', (d: any) => d.y);

    linkUpdate
      .select('.staff-link-vertical')
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

  private updateStaffNodes(
    nodes: D3HierarchyNode[],
    source: D3HierarchyNode
  ): void {
    const node = this.staffSvg
      .selectAll('.staff-node')
      .data(nodes, (d: any) => d.id || (d.id = d.data.id));

    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'staff-node')
      .attr('transform', `translate(${source.x0},${source.y0})`)
      .style('opacity', 0)
      .on('click', (event: Event, d: any) => this.onStaffNodeClick(d));

    nodeEnter
      .append('rect')
      .attr('class', 'staff-toggle-button')
      .attr('x', -8)
      .attr('y', -8)
      .attr('width', 16)
      .attr('height', 16)
      .attr('rx', 2)
      .style('fill', 'white')
      .style('stroke', '#666')
      .style('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0));

    nodeEnter
      .append('text')
      .attr('class', 'staff-toggle-symbol')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-family', 'monospace')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#666')
      .style('cursor', 'pointer')
      .style('user-select', 'none')
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0))
      .text((d: any) => (d._children ? '+' : '−'));

    // Add team icon for team nodes
    nodeEnter
      .append('image')
      .attr('class', 'staff-team-icon')
      .attr('x', -12)
      .attr('y', -10)
      .attr('width', 20)
      .attr('height', 20)
      .attr('xlink:href', this.tenantLogoUrl)
      .style('opacity', (d: any) => (d.data.teamData ? 1 : 0))
      .style('pointer-events', 'none');

    nodeEnter
      .append('text')
      .attr('class', 'staff-node-label')
      .attr('dy', '0.35em')
      .attr('x', (d: any) => {
        if (d.data.teamData) return 14; // Team with icon
        if (d.children || d._children) return 12; // Parent node with toggle
        return 4; // Leaf node without toggle
      })
      .text((d: any) => d.data.name)
      .style('font-size', '13px')
      .style('fill', (d: any) => (d.data.teamData ? '#111827' : '#4b5563'))
      .style('font-weight', (d: any) => (d.data.teamData ? '500' : '600'))
      .style('cursor', (d: any) => (d.data.teamData ? 'pointer' : 'default'));

    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate
      .transition()
      .duration(this.duration)
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      .style('opacity', 1);

    // Highlight selected team
    nodeUpdate
      .select('.staff-node-label')
      .style('fill', (d: any) => {
        if (
          d.data.teamData &&
          this.selectedTeam?.TeamID === d.data.teamData.TeamID
        ) {
          return '#2563eb';
        }
        return d.data.teamData ? '#111827' : '#4b5563';
      })
      .style('font-weight', (d: any) => {
        if (
          d.data.teamData &&
          this.selectedTeam?.TeamID === d.data.teamData.TeamID
        ) {
          return 'bold';
        }
        return d.data.teamData ? '500' : '600';
      });

    nodeUpdate
      .select('.staff-toggle-button')
      .transition()
      .duration(this.duration)
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0));

    nodeUpdate
      .select('.staff-toggle-symbol')
      .transition()
      .duration(this.duration)
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0))
      .text((d: any) => (d._children ? '+' : '−'));

    nodeUpdate
      .select('.staff-node-label')
      .transition()
      .duration(this.duration)
      .attr('x', (d: any) => {
        if (d.data.teamData) return 14; // Team with icon
        if (d.children || d._children) return 12; // Parent node with toggle
        return 4; // Leaf node without toggle
      });

    const nodeExit = node
      .exit()
      .transition()
      .duration(this.duration)
      .attr('transform', `translate(${source.x},${source.y})`)
      .style('opacity', 0)
      .remove();

    nodeExit.selectAll('.staff-toggle-button').style('opacity', 0);
    nodeExit.selectAll('.staff-toggle-symbol').style('opacity', 0);
    nodeExit.selectAll('.staff-node-label').style('fill-opacity', 0);
  }

  private onStaffNodeClick(d: any): void {
    // If it's a team node, select it
    if (d.data.teamData) {
      this.onSelectTeam(d.data.teamData);
      this.updateStaff(d); // Refresh to show selection
    } else {
      // If it's a parent node (gender/age/level), toggle collapse/expand
      if (d.children) {
        d._children = d.children;
        d.children = undefined;
      } else if (d._children) {
        d.children = d._children;
        d._children = undefined;
      }
      this.updateStaff(d);
    }
  }

  // ===== END STAFF TREE METHODS =====

  onClose(): void {
    this.close.emit();
  }

  onSelectTeam(team: ITeam | null): void {
    console.log('🖱️ Team clicked:', {
      clickedTeam: team?.TeamName,
      clickedTeamID: team?.TeamID,
      currentlySelectedTeam: this.selectedTeam?.TeamName,
      currentlySelectedTeamID: this.selectedTeam?.TeamID,
      areEqual: this.selectedTeam?.TeamID === team?.TeamID,
    });

    // If clicking the same team that's already selected, deselect it
    if (this.selectedTeam?.TeamID === team?.TeamID) {
      console.log('🔄 Deselecting team (clicked same team)');
      this.selectTeam.emit(null);
    } else {
      // Clicking a different team - select it immediately
      console.log('✅ Selecting new team');
      this.selectTeam.emit(team);
    }
  }

  isSelected(team: ITeam): boolean {
    return this.selectedTeam?.TeamID === team.TeamID;
  }

  /**
   * Toggle expanded state for a team
   */
  toggleExpanded(teamId: number, event: Event): void {
    event.stopPropagation(); // Prevent team selection
    if (this.expandedTeams.has(teamId)) {
      this.expandedTeams.delete(teamId);
    } else {
      this.expandedTeams.add(teamId);
    }
  }

  /**
   * Check if a team is expanded
   */
  isExpanded(teamId: number): boolean {
    return this.expandedTeams.has(teamId);
  }

  onAddTeam(): void {
    this.addTeam.emit();
  }

  onEditTeam(): void {
    this.editTeam.emit();
  }

  onDeleteTeam(): void {
    this.deleteTeam.emit();
  }

  onPlayerEdit(player: Player): void {
    this.editPlayer.emit(player);
  }

  onAddPlayer(): void {
    this.addPlayer.emit();
  }

  get canEdit(): boolean {
    return this.selectedTeam !== null;
  }

  get canDelete(): boolean {
    return this.selectedTeam !== null;
  }
}
