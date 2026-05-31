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
import { ILesson } from '../../../interfaces/lesson-builder.interfaces';
import { OwnershipContext, ITeam, ITeamGroup, User } from '../../../interfaces';
import {
  GlobalContextState,
  SetSelectedContextLessonBuilderLesson,
} from '../../../state';

// Tree node interface for lessons
export interface LessonTreeNode {
  id: string;
  name: string;
  type: 'root' | 'context' | 'team' | 'teamgroup' | 'lesson';
  lesson?: ILesson;
  children?: LessonTreeNode[];
  _children?: LessonTreeNode[];
  x?: number;
  y?: number;
  depth?: number;
}

// D3 hierarchy node type
export interface D3HierarchyNode extends d3.HierarchyNode<LessonTreeNode> {
  id: string;
  _children?: D3HierarchyNode[];
  x0?: number;
  y0?: number;
}

@Component({
  selector: 'app-drawer-lesson-selector',
  standalone: true,
  imports: [CommonModule, BaseSlidingDrawer],
  templateUrl: './drawer-lesson-selector.html',
  styleUrls: ['./drawer-lesson-selector.scss'],
})
export class DrawerLessonSelector
  implements OnChanges, AfterViewInit, OnDestroy
{
  @ViewChild('treeContainer', { read: ElementRef })
  treeContainer?: ElementRef<HTMLDivElement>;

  @Input() isOpen = false;
  @Input() loggedInUser: User | null = null;
  @Input() selectedTenantId: number | null = null;
  @Input() selectedTeamId: number | null = null;
  @Input() currentTeamGroupId: number | null = null;
  @Input() teams: ITeam[] = [];
  @Input() teamGroups: ITeamGroup[] = [];
  @Input() autopilotRunning = false;
  @Output() close = new EventEmitter<void>();
  @Output() createLesson = new EventEmitter<void>();
  @Output() editLesson = new EventEmitter<void>();
  @Output() runLesson = new EventEmitter<void>();
  @Output() autopilot = new EventEmitter<void>();
  @Output() deleteLesson = new EventEmitter<void>();
  @Output() promoteLesson = new EventEmitter<void>();
  @Output() demoteLesson = new EventEmitter<void>();
  @Output() assignLesson = new EventEmitter<void>();

  // Lessons from state (no longer an input)
  public lessons: ILesson[] = [];

  // D3 tree properties
  private svg: any;
  private root: D3HierarchyNode | null = null;
  private duration = 250;
  private nodeHeight = 24;
  private indent = 20;
  private subscription = new Subscription();

  drawerHelp = `
    <strong>Lesson Selector Drawer</strong><br><br>
    Select lessons to build and edit.<br><br>
    <strong>Features:</strong><br>
    • View lessons by ownership context<br>
    • System: Built-in lessons<br>
    • Personal: Your private lessons<br>
    • Tenant: Organization-wide lessons<br>
    • Team: Team-specific lessons<br>
    • TeamGroup: Group-specific lessons<br><br>
    <strong>Actions:</strong><br>
    • Select lessons to edit in Lesson Builder V2<br>
  `;

  constructor(private store: Store) {
    // Subscribe to selectedContextLessonBuilderLesson changes to update tree styling
    this.subscription.add(
      this.store
        .select(GlobalContextState.selectedContextLessonBuilderLesson)
        .subscribe(() => {
          if (this.svg && this.root) {
            // Just update node styling without rebuilding the tree
            this.updateNodeStyles();
          }
        })
    );

    // Subscribe to LessonsState to get all lessons
    this.subscription.add(
      this.store
        .select((state: any) => state.lessons?.lessons || [])
        .subscribe((lessons: ILesson[]) => {
          this.lessons = lessons;
          console.log('📚 Lessons updated from state:', {
            lessonsCount: this.lessons.length,
          });

          // Rebuild tree with lessons from state
          if (this.svg) {
            this.updateTree();
          }
        })
    );
  }

  ngAfterViewInit(): void {
    console.log('🚀 Lesson Builder Drawer ngAfterViewInit', {
      hasTreeContainer: !!this.treeContainer,
      lessons: this.lessons?.length || 0,
    });
    if (this.treeContainer) {
      this.initializeSvg();
      this.updateTree();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Rebuild tree when context or structure changes
    // Note: Lessons come from state subscription, not from @Input changes
    if (
      changes['teams'] ||
      changes['teamGroups'] ||
      changes['selectedTenantId']
    ) {
      if (this.svg) {
        this.updateTree();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Get the currently selected lesson from GlobalContextState
   */
  get selectedContextLesson(): ILesson | null {
    return this.store.selectSnapshot(
      GlobalContextState.selectedContextLessonBuilderLesson
    );
  }

  /**
   * Filter lessons by current tenant context
   * Returns lessons that match:
   * - System context (TENANT with Context === -1)
   * - User context (USER with Context === logged in user's ID)
   * - Current tenant (Context === selectedTenantId)
   * - Teams/TeamGroups within current tenant
   */
  private getFilteredLessonsByTenant(): ILesson[] {
    if (!this.loggedInUser) {
      return [];
    }

    if (!this.selectedTenantId) {
      // No tenant selected - show system and user's personal only
      return this.lessons.filter(
        (lesson) =>
          (lesson.OwnershipContext?.Context === 'TENANT' &&
            lesson.OwnershipContext.ContextKey === -1) ||
          (lesson.OwnershipContext?.Context === 'USER' &&
            lesson.OwnershipContext.ContextKey === this.loggedInUser!.UserId)
      );
    }

    // Get IDs of teams within the selected tenant
    const tenantTeamIds = this.teams
      .filter((team) => team.TenantID === this.selectedTenantId)
      .map((team) => team.TeamID);

    // Get IDs of team groups within those teams
    const tenantTeamGroupIds = this.teamGroups
      .filter((tg) =>
        tenantTeamIds.includes(tg.OwnershipContext.ContextKey as number)
      )
      .map((tg) => tg.TeamGroupID);

    return this.lessons.filter((lesson) => {
      const contextKey = lesson.OwnershipContext?.ContextKey;
      const context = lesson.OwnershipContext?.Context;

      // Always show system lessons (TENANT with -1)
      if (context === 'TENANT' && contextKey === -1) return true;

      // Always show user's personal lessons (USER with user's ID)
      if (context === 'USER' && contextKey === this.loggedInUser!.UserId)
        return true;

      // Show tenant-level lessons for current tenant
      if (context === 'TENANT' && contextKey === this.selectedTenantId) {
        return true;
      }

      // Show team lessons for teams in current tenant
      if (context === 'TEAM' && tenantTeamIds.includes(contextKey as number)) {
        return true;
      }

      // Show team group lessons for groups in current tenant
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
   * Close the drawer
   */
  public onClose(): void {
    this.close.emit();
  }

  /**
   * Initialize SVG container
   */
  private initializeSvg(): void {
    if (!this.treeContainer) {
      console.warn('⚠️ Cannot initialize SVG - no tree container');
      return;
    }

    console.log('🎨 Initializing SVG for lesson tree');

    this.svg = d3
      .select(this.treeContainer.nativeElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', 500)
      .style('font', '13px sans-serif')
      .style('user-select', 'none');

    console.log('✅ SVG initialized');
  }

  /**
   * Create unique lesson nodes from an array of lessons
   * Prevents duplicate lessons from being added to the tree
   */
  private createUniqueLessonNodes(lessons: ILesson[]): LessonTreeNode[] {
    const seenLessonIds = new Set<number>();
    const uniqueNodes: LessonTreeNode[] = [];
    const duplicates: Array<{ id: number; name: string }> = [];

    lessons.forEach((lesson) => {
      if (lesson.LessonID && !seenLessonIds.has(lesson.LessonID)) {
        seenLessonIds.add(lesson.LessonID);
        uniqueNodes.push({
          id: `lesson-${lesson.LessonID}`,
          name: lesson.LessonName || 'Unnamed Lesson',
          type: 'lesson',
          lesson,
        });
      } else if (lesson.LessonID) {
        duplicates.push({
          id: lesson.LessonID,
          name: lesson.LessonName || 'Unnamed',
        });
      }
    });

    // Only log if there are duplicates, and summarize them
    if (duplicates.length > 0) {
      console.debug(
        `🔍 Filtered ${duplicates.length} duplicate lesson(s) from tree`,
        duplicates
      );
    }

    return uniqueNodes;
  }

  /**
   * Build tree data structure from lessons
   * Filters lessons based on current tenant context:
   * - System lessons (Context === -1)
   * - Personal lessons (Context === logged in user ID)
   * - Tenant-specific lessons (Context === selectedTenantId)
   * - Team/TeamGroup lessons within the tenant
   */
  private buildTreeData(): LessonTreeNode {
    console.log('🌳 Building lesson tree data...', {
      totalLessons: this.lessons?.length || 0,
      loggedInUser: this.loggedInUser?.UserId,
      selectedTenantId: this.selectedTenantId,
      teams: this.teams?.length || 0,
      teamGroups: this.teamGroups?.length || 0,
    });

    const root: LessonTreeNode = {
      id: 'root',
      name: 'Accessible Lessons',
      type: 'root',
      children: [],
    };

    // Filter lessons by tenant context
    const filteredLessons = this.getFilteredLessonsByTenant();
    console.log('🔍 Filtered lessons:', filteredLessons.length);

    // System lessons
    const systemLessons = filteredLessons.filter(
      (lesson) =>
        lesson.OwnershipContext?.Context === 'TENANT' &&
        lesson.OwnershipContext.ContextKey === -1
    );
    console.log('🖥️ System lessons:', systemLessons.length);

    // Always show System folder
    const systemNode: LessonTreeNode = {
      id: 'context-system',
      name: `System (${systemLessons.length})`,
      type: 'context',
      children: this.createUniqueLessonNodes(systemLessons),
    };
    root.children!.push(systemNode);

    // User (Personal) lessons
    const personalLessons = filteredLessons.filter(
      (lesson) =>
        lesson.OwnershipContext?.Context === 'USER' &&
        this.loggedInUser &&
        lesson.OwnershipContext.ContextKey === this.loggedInUser.UserId
    );

    // Always show Personal folder
    const personalNode: LessonTreeNode = {
      id: 'context-personal',
      name: `Personal (${personalLessons.length})`,
      type: 'context',
      children: this.createUniqueLessonNodes(personalLessons),
    };
    root.children!.push(personalNode);

    // Tenant lessons - grouped by team and team group
    const tenantLessons = filteredLessons.filter(
      (lesson) =>
        (lesson.OwnershipContext?.Context === 'TENANT' &&
          lesson.OwnershipContext.ContextKey !== -1) ||
        lesson.OwnershipContext?.Context === 'TEAM' ||
        lesson.OwnershipContext?.Context === 'TEAMGROUP'
    );

    // Get the selected tenant name
    const selectedTenant = this.store.selectSnapshot(
      GlobalContextState.selectedContextTenant
    );
    const tenantName = selectedTenant?.TenantName || 'Tenant';

    // Always show Tenant folder
    const tenantNode: LessonTreeNode = {
      id: 'context-tenant',
      name: `${tenantName} (${tenantLessons.length})`,
      type: 'context',
      children: [],
    };

    // Group by organization-level lessons (no team)
    const orgLessons = tenantLessons.filter(
      (lesson) =>
        lesson.OwnershipContext?.Context === 'TENANT' &&
        lesson.OwnershipContext.ContextKey === this.selectedTenantId
    );
    // Add unique organization-level lessons
    const orgLessonNodes = this.createUniqueLessonNodes(orgLessons);
    tenantNode.children!.push(...orgLessonNodes);

    // Group by team
    const teamLessons = tenantLessons.filter(
      (lesson) =>
        lesson.OwnershipContext?.Context === 'TEAM' ||
        lesson.OwnershipContext?.Context === 'TEAMGROUP'
    );

    const teamMap = new Map<string, LessonTreeNode>();

    // Always show all teams from the teams array
    this.teams.forEach((team) => {
      if (team.TeamID) {
        const teamId = team.TeamID.toString();
        teamMap.set(teamId, {
          id: `team-${teamId}`,
          name: team.TeamName || `Team ${teamId}`,
          type: 'team',
          children: [],
        });
      }
    });

    // Add lessons to appropriate teams
    // First, collect lessons by team and team group
    const teamLessonsMap = new Map<string, ILesson[]>();
    const teamGroupLessonsMap = new Map<string, ILesson[]>();

    teamLessons.forEach((lesson) => {
      const teamId = lesson.OwnershipContext!.Context.toString();

      if (lesson.OwnershipContext?.Context === 'TEAM') {
        // Team-level lesson
        if (!teamMap.has(teamId)) {
          const team = this.teams.find((t) => t.TeamID?.toString() === teamId);
          teamMap.set(teamId, {
            id: `team-${teamId}`,
            name: team?.TeamName || `Team ${teamId}`,
            type: 'team',
            children: [],
          });
        }

        // Collect team lessons
        if (!teamLessonsMap.has(teamId)) {
          teamLessonsMap.set(teamId, []);
        }
        teamLessonsMap.get(teamId)!.push(lesson);
      } else if (lesson.OwnershipContext?.Context === 'TEAMGROUP') {
        // Team group lesson - find the parent team
        const teamGroup = this.teamGroups.find(
          (tg) => tg.TeamGroupID === lesson.OwnershipContext!.ContextKey
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
          ) as LessonTreeNode | undefined;

          if (!teamGroupNode) {
            teamGroupNode = {
              id: `teamgroup-${teamGroup.TeamGroupID}`,
              name: teamGroup.TeamGroupName,
              type: 'teamgroup',
              children: [],
            };
            teamNode.children!.push(teamGroupNode);
          }

          // Collect team group lessons
          const teamGroupId = teamGroup.TeamGroupID.toString();
          if (!teamGroupLessonsMap.has(teamGroupId)) {
            teamGroupLessonsMap.set(teamGroupId, []);
          }
          teamGroupLessonsMap.get(teamGroupId)!.push(lesson);
        }
      }
    });

    // Now add unique lessons to teams
    teamLessonsMap.forEach((lessons, teamId) => {
      const teamNode = teamMap.get(teamId);
      if (teamNode) {
        const uniqueLessons = this.createUniqueLessonNodes(lessons);
        teamNode.children!.push(...uniqueLessons);
      }
    });

    // Add unique lessons to team groups
    teamGroupLessonsMap.forEach((lessons, teamGroupId) => {
      // Find the team group node in the tree
      teamMap.forEach((teamNode) => {
        const teamGroupNode = teamNode.children!.find(
          (child) => child.id === `teamgroup-${teamGroupId}`
        ) as LessonTreeNode | undefined;

        if (teamGroupNode) {
          const uniqueLessons = this.createUniqueLessonNodes(lessons);
          teamGroupNode.children!.push(...uniqueLessons);
        }
      });
    });

    // Add all team group folders to their parent teams (even if empty)
    this.teamGroups.forEach((teamGroup) => {
      const parentTeamId = teamGroup.OwnershipContext.Context.toString();

      if (teamMap.has(parentTeamId)) {
        const teamNode = teamMap.get(parentTeamId)!;

        // Check if this team group already exists
        const existingTeamGroup = teamNode.children!.find(
          (child) => child.id === `teamgroup-${teamGroup.TeamGroupID}`
        );

        if (!existingTeamGroup) {
          teamNode.children!.push({
            id: `teamgroup-${teamGroup.TeamGroupID}`,
            name: teamGroup.TeamGroupName,
            type: 'teamgroup',
            children: [],
          });
        }
      }
    });

    // Add all teams to tenant node (even if they have no lessons)
    teamMap.forEach((teamNode) => {
      tenantNode.children!.push(teamNode);
    });

    // Always add tenant node to root
    root.children!.push(tenantNode);

    return root;
  }

  /**
   * Update the tree visualization
   */
  private updateTree(): void {
    if (!this.svg) {
      console.warn('⚠️ updateTree called but SVG not initialized');
      return;
    }

    console.log('🔄 Updating lesson tree...');

    // Build tree data
    const treeData = this.buildTreeData();
    console.log('📊 Tree data built:', treeData);

    // Convert to d3 hierarchy
    this.root = d3.hierarchy(
      treeData,
      (d: LessonTreeNode) => d.children
    ) as D3HierarchyNode;
    this.root.x0 = 0;
    this.root.y0 = 0;

    // Expand all levels completely - no collapsing
    // All nodes will be visible by default

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
   * Update only the node styles (for selection changes)
   * This preserves the expand/collapse state of the tree
   */
  private updateNodeStyles(): void {
    if (!this.svg || !this.root) return;

    const selectedLesson = this.selectedContextLesson;

    // Update all visible node labels
    this.svg
      .selectAll('.node-label')
      .style('font-weight', function (this: any, d: any) {
        if (d.data.type === 'root') return 'bold';
        if (d.data.type === 'lesson') {
          return selectedLesson &&
            d.data.lesson &&
            selectedLesson.LessonID === d.data.lesson.LessonID
            ? 'bold'
            : 'normal';
        }
        return 'normal';
      })
      .style('fill', function (this: any, d: any) {
        if (d.data.type === 'lesson') {
          return selectedLesson &&
            d.data.lesson &&
            selectedLesson.LessonID === d.data.lesson.LessonID
            ? 'var(--primary-color, #007bff)'
            : 'var(--text-primary, #333)';
        }
        return 'var(--text-primary, #333)';
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
        d.data.type === 'lesson' ? 'pointer' : 'default'
      )
      .text((d: any) => this.getNodeIcon(d.data.type));

    // Add label
    nodeEnter
      .append('text')
      .attr('class', 'node-label')
      .attr('dy', '0.35em')
      .attr('x', 32)
      .text((d: any) => {
        // For lesson nodes, include the lesson ID in parentheses
        if (d.data.type === 'lesson' && d.data.lesson?.LessonID) {
          return `${d.data.name} (${d.data.lesson.LessonID})`;
        }
        return d.data.name;
      })
      .style('font-size', '13px')
      .style('fill', 'var(--text-primary, #333)')
      .style('cursor', (d: any) =>
        d.data.type === 'lesson' ? 'pointer' : 'default'
      )
      .style('font-weight', (d: any) => {
        if (d.data.type === 'root') return 'bold';
        if (d.data.type === 'lesson') {
          const selected = this.selectedContextLesson;
          return selected &&
            d.data.lesson &&
            selected.LessonID === d.data.lesson.LessonID
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
        if (d.data.type === 'lesson') {
          const selected = this.selectedContextLesson;
          return selected &&
            d.data.lesson &&
            selected.LessonID === d.data.lesson.LessonID
            ? 'bold'
            : 'normal';
        }
        return 'normal';
      })
      .style('fill', (d: any) => {
        if (d.data.type === 'lesson') {
          const selected = this.selectedContextLesson;
          return selected &&
            d.data.lesson &&
            selected.LessonID === d.data.lesson.LessonID
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
        return '�';
      case 'context':
        return '📁';
      case 'team':
        return '📁';
      case 'teamgroup':
        return '👥';
      case 'lesson':
        return '📄';
      default:
        return '•';
    }
  }

  /**
   * Handle node click
   */
  private handleNodeClick(event: Event, d: any): void {
    if (d.data.type === 'lesson' && d.data.lesson) {
      // Toggle lesson selection - if clicking the same lesson, deselect it
      const lesson = d.data.lesson;
      const currentSelectedLesson = this.selectedContextLesson;

      console.log(
        '📚 Lesson node clicked:',
        lesson.LessonName,
        'LessonID:',
        lesson.LessonID
      );

      // If clicking the already selected lesson, deselect it (toggle off)
      if (
        currentSelectedLesson &&
        currentSelectedLesson.LessonID === lesson.LessonID
      ) {
        console.log('🔄 Toggling off - deselecting lesson');
        this.store.dispatch(new SetSelectedContextLessonBuilderLesson(null));
      } else {
        // Select the new lesson (toggle on)
        console.log('✅ Selecting lesson');
        this.store.dispatch(new SetSelectedContextLessonBuilderLesson(lesson));
      }

      // Don't call update(d) - just re-render the nodes to update styling
      // The subscription will trigger updateTree() which will refresh the visual state
    } else {
      // Toggle expand/collapse for non-lesson nodes
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

  /**
   * Create a new lesson
   */
  public onCreateLesson(): void {
    this.createLesson.emit();
  }

  /**
   * Edit the selected lesson
   */
  public onEditLesson(): void {
    this.editLesson.emit();
  }

  /**
   * Run the selected lesson
   */
  public onRunLesson(): void {
    this.runLesson.emit();
  }

  /**
   * Run autopilot on the selected lesson
   */
  public onAutopilot(): void {
    this.autopilot.emit();
  }

  /**
   * Delete the selected lesson
   */
  public onDeleteLesson(): void {
    this.deleteLesson.emit();
  }

  /**
   * Promote the selected lesson
   */
  public onPromoteLesson(): void {
    this.promoteLesson.emit();
  }

  /**
   * Demote the selected lesson
   */
  public onDemoteLesson(): void {
    this.demoteLesson.emit();
  }

  /**
   * Assign the selected lesson
   */
  public onAssignLesson(): void {
    this.assignLesson.emit();
  }
}
