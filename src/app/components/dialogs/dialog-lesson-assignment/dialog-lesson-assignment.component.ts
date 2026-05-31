import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';
import { Store } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';
import { ILesson } from '../../../interfaces/lesson-builder.interfaces';
import { LessonAssignment } from '../../../interfaces/lesson-assignment.interfaces';
import { OwnershipContext } from '../../../interfaces/ownership-context.interface';
import { ITeam, Player } from '../../../interfaces';
import { SketchState } from '../../../state/sketch.state';
import { GlobalContextState } from '../../../state';

// Assignment tree node interface
export interface AssignmentTreeNode {
  id: string;
  name: string;
  type: 'root' | 'me' | 'tenant' | 'team' | 'teamgroup' | 'players' | 'player';
  hasCheckbox: boolean;
  isEnabled: boolean;
  isChecked: boolean;
  referenceId?: number; // Team ID, TeamGroup ID, or Player ID (UserID)
  children?: AssignmentTreeNode[];
  _children?: AssignmentTreeNode[]; // Hidden children when collapsed
  x?: number;
  y?: number;
  depth?: number;
}

// D3 hierarchy node type
export interface D3AssignmentNode extends d3.HierarchyNode<AssignmentTreeNode> {
  id: string;
  _children?: D3AssignmentNode[];
  x0?: number;
  y0?: number;
}

@Component({
  selector: 'app-dialog-lesson-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-lesson-assignment.component.html',
  styleUrls: ['./dialog-lesson-assignment.component.scss'],
})
export class DialogLessonAssignmentComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('treeContainer', { static: true })
  treeContainer!: ElementRef<HTMLDivElement>;

  @Input() lesson: ILesson | null = null;
  @Input() currentUserId: number = 7; // Default user ID
  @Input() existingAssignments: LessonAssignment[] = [];
  @Input() existingDueDate: string | null = null; // ISO date string
  @Input() isDarkMode = false;
  @Input() assignmentContext: 'COACH' | 'TEAM' = 'COACH'; // Context under which assignment is made
  @Input() assignmentContextKey: number = 0; // ID of the context (coach ID or team ID)

  @Output() assign = new EventEmitter<{
    assignments: LessonAssignment[];
    dueDate: string | null;
  }>();
  @Output() cancel = new EventEmitter<void>();

  // Due date
  public dueDate: string | null = null;

  // D3 elements
  private svg: any;
  private root: D3AssignmentNode | null = null;

  // Tree data
  public treeData: AssignmentTreeNode | null = null;

  // Current teams data
  private currentTeams: ITeam[] = [];

  // Animation duration
  private duration = 250;

  // Layout settings
  private nodeHeight = 30;
  private indent = 25;
  private checkboxSize = 16;

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.dueDate = this.existingDueDate;

    // Subscribe to tenant changes to rebuild the tree
    this.store
      .select(GlobalContextState.contextTenantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('📋 Tenant changed - rebuilding lesson assignment tree');
        this.generateTreeData();
        if (this.svg) {
          this.drawTree();
        }
      });

    this.generateTreeData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.initializeSvg();
    this.drawTree();
  }

  // Generate assignment tree based on lesson ownership context
  private generateTreeData(): void {
    const ownershipContext = this.lesson?.OwnershipContext;
    // For now, use mock teams data - will be replaced with actual data from state
    const mockTeams = this.getMockTeams();
    const selectedTenantId = 1;
    const selectedTeamId =
      ownershipContext?.Context === 'TEAM' ? ownershipContext.ContextKey : null;

    const root: AssignmentTreeNode = {
      id: 'root',
      name: 'Assignment Options',
      type: 'root',
      hasCheckbox: false,
      isEnabled: false,
      isChecked: false,
      children: [],
    };

    // Add "ME" node - only enabled for User ownership
    const meNode: AssignmentTreeNode = {
      id: 'me',
      name: 'ME',
      type: 'me',
      hasCheckbox: true,
      isEnabled: ownershipContext?.Context === 'USER',
      isChecked: this.isAssignmentChecked('USER', this.currentUserId),
      referenceId: this.currentUserId,
    };
    root.children!.push(meNode);

    // Add "TENANT" node with teams and teamgroups
    const tenantNode: AssignmentTreeNode = {
      id: 'tenant',
      name: `Tenant ${selectedTenantId}`,
      type: 'tenant',
      hasCheckbox: false,
      isEnabled: false,
      isChecked: false,
      children: [],
    };

    // Determine which teams are visible based on ownership context
    let visibleTeams = mockTeams;

    if (ownershipContext?.Context === 'TEAMGROUP' && selectedTeamId) {
      // For TEAMGROUP: Only show the specific team (for the team group)
      visibleTeams = mockTeams.filter((t) => t.TeamID === selectedTeamId);
    }

    // Build team nodes
    visibleTeams.forEach((team) => {
      // Team checkbox enabled only for system (TENANT -1), TENANT, or when it's the specific TEAM
      const isTeamEnabled =
        (ownershipContext?.Context === 'TENANT' &&
          ownershipContext.ContextKey === -1) ||
        (ownershipContext?.Context === 'TENANT' &&
          ownershipContext.ContextKey !== -1) ||
        (ownershipContext?.Context === 'TEAM' &&
          ownershipContext.ContextKey === team.TeamID);

      const isTeamChecked = this.isAssignmentChecked('TEAM', team.TeamID);

      // Check if any team groups are checked
      let hasCheckedTeamGroups = false;
      if (team.TeamGroups) {
        hasCheckedTeamGroups = team.TeamGroups.some((group) =>
          this.isAssignmentChecked('TEAMGROUP', group.TeamGroupID)
        );
      }

      // Disable team if any team groups are checked
      let finalTeamEnabled = isTeamEnabled;
      if (hasCheckedTeamGroups) {
        finalTeamEnabled = false;
      }

      const teamNode: AssignmentTreeNode = {
        id: `team-${team.TeamID}`,
        name: team.TeamName || `Team ${team.TeamID}`,
        type: 'team',
        hasCheckbox: true,
        isEnabled: finalTeamEnabled,
        isChecked: hasCheckedTeamGroups ? false : isTeamChecked,
        referenceId: team.TeamID,
        children: [],
      };

      // Build team group nodes
      if (team.TeamGroups) {
        team.TeamGroups.forEach((group) => {
          // Team groups enabled for system (TENANT -1), TENANT, or when it's the specific TEAM, or the specific TEAMGROUP
          // BUT disabled if the parent team is checked
          let isGroupEnabled =
            (ownershipContext?.Context === 'TENANT' &&
              ownershipContext.ContextKey === -1) ||
            (ownershipContext?.Context === 'TENANT' &&
              ownershipContext.ContextKey !== -1) ||
            (ownershipContext?.Context === 'TEAM' &&
              ownershipContext.ContextKey === team.TeamID) ||
            (ownershipContext?.Context === 'TEAMGROUP' &&
              ownershipContext.ContextKey === group.TeamGroupID);

          // Disable team groups if team is checked
          if (isTeamChecked) {
            isGroupEnabled = false;
          }

          const groupNode: AssignmentTreeNode = {
            id: `teamgroup-${group.TeamGroupID}`,
            name: group.TeamGroupName || `Group ${group.TeamGroupID}`,
            type: 'teamgroup',
            hasCheckbox: true,
            isEnabled: isGroupEnabled,
            isChecked: isTeamChecked
              ? false
              : this.isAssignmentChecked('TEAMGROUP', group.TeamGroupID),
            referenceId: group.TeamGroupID,
          };

          teamNode.children!.push(groupNode);
        });
      }

      // Add "Players" node under the team
      if (team.Players && team.Players.length > 0) {
        const playersNode: AssignmentTreeNode = {
          id: `players-${team.TeamID}`,
          name: 'Players',
          type: 'players',
          hasCheckbox: false, // Not selectable
          isEnabled: false,
          isChecked: false,
          children: [],
        };

        // Add individual player nodes
        team.Players.forEach((player) => {
          // Players are enabled if:
          // - System tenant (TENANT -1), OR
          // - Regular TENANT context, OR
          // - TEAM context matching this team, OR
          // - TEAMGROUP context (since we're showing team)
          // BUT disabled if the parent team is checked
          let isPlayerEnabled =
            (ownershipContext?.Context === 'TENANT' &&
              ownershipContext.ContextKey === -1) ||
            (ownershipContext?.Context === 'TENANT' &&
              ownershipContext.ContextKey !== -1) ||
            (ownershipContext?.Context === 'TEAM' &&
              ownershipContext.ContextKey === team.TeamID) ||
            ownershipContext?.Context === 'TEAMGROUP';

          // Disable players if team is checked or any team group is checked
          if (isTeamChecked || hasCheckedTeamGroups) {
            isPlayerEnabled = false;
          }

          // Build player display name with position if available
          let playerDisplayName = `${player.FirstName} ${player.LastName}`;
          if (player.PositionAbbrev && player.PositionAbbrev.trim()) {
            playerDisplayName += ` (${player.PositionAbbrev})`;
          }

          const playerNode: AssignmentTreeNode = {
            id: `player-${player.UserId}`,
            name: playerDisplayName,
            type: 'player',
            hasCheckbox: true,
            isEnabled: isPlayerEnabled,
            isChecked:
              isTeamChecked || hasCheckedTeamGroups
                ? false
                : this.isAssignmentChecked('PLAYER', player.UserId),
            referenceId: player.UserId, // Use UserID for player assignments
          };

          playersNode.children!.push(playerNode);
        });

        teamNode.children!.push(playersNode);
      }

      tenantNode.children!.push(teamNode);
    });

    root.children!.push(tenantNode);
    this.treeData = root;
    this.currentTeams = visibleTeams;
  }

  // Mock teams data - will be replaced with actual data from state
  private getMockTeams(): ITeam[] {
    return [
      {
        TeamID: 1,
        TeamName: 'Team Alpha',
        TenantID: 1,
        SignupCode: 'ALPHA01',
        AllowSignup: true,
        RosterLimit: 18,
        GenderID: 1,
        GenderName: 'Male',
        GenderAbbrev: 'M',
        AgeGroupID: 1,
        AgeGroupName: 'U12',
        Level: 1,
        Players: [
          {
            PlayerID: 1,
            UserId: 101,
            FirstName: 'John',
            LastName: 'Smith',
            TeamID: 1,
            PositionName: 'Forward',
            PositionAbbrev: 'FW',
            JerseyNumber: 9,
            GenderID: 1,
            GenderName: 'Male',
            GenderAbbrev: 'M',
            AgeGroupID: 1,
            AgeGroupName: 'U12',
            MiddleName: '',
            Address1: '',
            Address2: '',
            City: '',
            State: '',
            ZipCode: '',
            NationCode: '',
            EmailAddress: '',
            PhoneNumber: '',
            BirthDate: undefined,
          },
          {
            PlayerID: 2,
            UserId: 102,
            FirstName: 'Mike',
            LastName: 'Johnson',
            TeamID: 1,
            PositionName: 'Midfielder',
            PositionAbbrev: 'MF',
            JerseyNumber: 7,
            GenderID: 1,
            GenderName: 'Male',
            GenderAbbrev: 'M',
            AgeGroupID: 1,
            AgeGroupName: 'U12',
            MiddleName: '',
            Address1: '',
            Address2: '',
            City: '',
            State: '',
            ZipCode: '',
            NationCode: '',
            EmailAddress: '',
            PhoneNumber: '',
            BirthDate: undefined,
          },
          {
            PlayerID: 3,
            UserId: 103,
            FirstName: 'Sarah',
            LastName: 'Williams',
            TeamID: 1,
            PositionName: 'Defender',
            PositionAbbrev: 'DF',
            JerseyNumber: 4,
            GenderID: 1,
            GenderName: 'Male',
            GenderAbbrev: 'M',
            AgeGroupID: 1,
            AgeGroupName: 'U12',
            MiddleName: '',
            Address1: '',
            Address2: '',
            City: '',
            State: '',
            ZipCode: '',
            NationCode: '',
            EmailAddress: '',
            PhoneNumber: '',
            BirthDate: undefined,
          },
        ],
        TeamGroups: [
          {
            TeamGroupID: 1,
            TeamGroupName: 'Starting XI',
            OwnershipContext: { Context: 'TEAM', ContextKey: 1 },
            Players: [],
            MatchingPositions: [],
            MatchingPositionNumbers: [],
          },
          {
            TeamGroupID: 2,
            TeamGroupName: 'Bench',
            OwnershipContext: { Context: 'TEAM', ContextKey: 1 },
            Players: [],
            MatchingPositions: [],
            MatchingPositionNumbers: [],
          },
        ],
      },
      {
        TeamID: 2,
        TeamName: 'Team Beta',
        TenantID: 1,
        SignupCode: 'BETA01',
        AllowSignup: true,
        RosterLimit: 18,
        GenderID: 1,
        GenderName: 'Male',
        GenderAbbrev: 'M',
        AgeGroupID: 2,
        AgeGroupName: 'U14',
        Level: 2,
        Players: [
          {
            PlayerID: 4,
            UserId: 104,
            FirstName: 'Alex',
            LastName: 'Brown',
            TeamID: 2,
            PositionName: 'Goalkeeper',
            PositionAbbrev: 'GK',
            JerseyNumber: 1,
            GenderID: 1,
            GenderName: 'Male',
            GenderAbbrev: 'M',
            AgeGroupID: 2,
            AgeGroupName: 'U14',
            MiddleName: '',
            Address1: '',
            Address2: '',
            City: '',
            State: '',
            ZipCode: '',
            NationCode: '',
            EmailAddress: '',
            PhoneNumber: '',
            BirthDate: undefined,
          },
          {
            PlayerID: 5,
            UserId: 105,
            FirstName: 'Emily',
            LastName: 'Davis',
            TeamID: 2,
            PositionName: 'Forward',
            PositionAbbrev: 'FW',
            JerseyNumber: 10,
            GenderID: 1,
            GenderName: 'Male',
            GenderAbbrev: 'M',
            AgeGroupID: 2,
            AgeGroupName: 'U14',
            MiddleName: '',
            Address1: '',
            Address2: '',
            City: '',
            State: '',
            ZipCode: '',
            NationCode: '',
            EmailAddress: '',
            PhoneNumber: '',
            BirthDate: undefined,
          },
        ],
        TeamGroups: [
          {
            TeamGroupID: 3,
            TeamGroupName: 'Offense',
            OwnershipContext: { Context: 'TEAM', ContextKey: 2 },
            Players: [],
            MatchingPositions: [],
            MatchingPositionNumbers: [],
          },
          {
            TeamGroupID: 4,
            TeamGroupName: 'Defense',
            OwnershipContext: { Context: 'TEAM', ContextKey: 2 },
            Players: [],
            MatchingPositions: [],
            MatchingPositionNumbers: [],
          },
        ],
      },
    ];
  }

  // Check if an assignment exists in the existing assignments
  private isAssignmentChecked(targetType: string, targetId: number): boolean {
    return this.existingAssignments.some(
      (a) =>
        a.TargetContext.Context === targetType &&
        a.TargetContext.ContextKey === targetId
    );
  }

  // Initialize SVG
  private initializeSvg(): void {
    const element = this.treeContainer.nativeElement;
    const width = element.clientWidth || 600;
    const height = 600;

    this.svg = d3
      .select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(10, 10)');
  }

  // Draw tree
  private drawTree(): void {
    if (!this.treeData) return;

    // Convert data to d3 hierarchy
    this.root = d3.hierarchy(
      this.treeData,
      (d: AssignmentTreeNode) => d.children
    ) as D3AssignmentNode;
    this.root.x0 = 0;
    this.root.y0 = 0;

    const ownershipContext = this.lesson?.OwnershipContext;

    // Handle expansion based on ownership context
    if (this.root.children && this.root.children.length > 1) {
      const tenantNode = this.root.children[1]; // Tenant node

      if (ownershipContext?.Context === 'TEAMGROUP') {
        // For team group ownership: expand everything to show the specific team group
        this.expandAll(tenantNode);
      } else if (ownershipContext?.Context === 'TEAM') {
        // For team ownership: expand to the specific team and its team groups
        const selectedTeamId = ownershipContext.ContextKey;
        if (tenantNode.children) {
          tenantNode.children.forEach((teamNode: any) => {
            const teamData = teamNode.data as AssignmentTreeNode;
            if (teamData.referenceId === selectedTeamId) {
              // Expand this team and its team groups
              this.expandAll(teamNode);
            } else {
              // Collapse all other teams
              this.collapse(teamNode);
            }
          });
        }
      } else {
        // For other ownership contexts: expand to team level (collapse team groups)
        if (tenantNode.children) {
          tenantNode.children.forEach((teamNode: any) => {
            // Collapse team groups within each team
            if (teamNode.children) {
              teamNode.children.forEach((groupNode: any) => {
                this.collapse(groupNode);
              });
            }
          });
        }
      }
    }

    this.update(this.root);
  }

  // Expand all nodes
  private expandAll(d: D3AssignmentNode): void {
    if (d._children) {
      d.children = d._children;
      d._children = undefined;
    }
    if (d.children) {
      d.children.forEach((child) => this.expandAll(child));
    }
  }

  // Collapse a node and its children
  private collapse(d: D3AssignmentNode): void {
    if (d.children) {
      d._children = d.children;
      d._children.forEach((child) => this.collapse(child));
      d.children = undefined;
    }
  }

  // Update tree with indented layout and animations
  private update(source: D3AssignmentNode): void {
    if (!this.root) return;

    // Get all visible nodes (flattened list)
    const nodes = this.flatten(this.root);
    const height = Math.max(500, nodes.length * this.nodeHeight + 40);

    // Update SVG height
    d3.select(this.treeContainer.nativeElement)
      .select('svg')
      .attr('height', height);

    // Assign positions
    let index = -1;
    nodes.forEach((d: any) => {
      d.y0 = d.y;
      d.y = ++index * this.nodeHeight + 20;
      d.x = d.depth * this.indent + 20;
    });

    // Update links
    this.updateLinks(nodes, source);

    // Update nodes
    this.updateNodes(nodes, source);

    // Store old positions
    nodes.forEach((d: any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Flatten tree to get visible nodes
  private flatten(root: D3AssignmentNode): D3AssignmentNode[] {
    const nodes: D3AssignmentNode[] = [];

    function recurse(node: D3AssignmentNode) {
      nodes.push(node);
      if (node.children) {
        node.children.forEach(recurse);
      }
    }

    recurse(root);
    return nodes;
  }

  // Update links
  private updateLinks(
    nodes: D3AssignmentNode[],
    source: D3AssignmentNode
  ): void {
    const links = nodes.slice(1);

    const link = this.svg.selectAll('.link').data(links, (d: any) => d.id);

    // EXIT
    link
      .exit()
      .transition()
      .duration(this.duration)
      .style('opacity', 0)
      .remove();

    // ENTER
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
      .style('stroke', this.isDarkMode ? '#555' : '#ccc')
      .style('stroke-width', 1);

    linkEnter
      .append('line')
      .attr('class', 'link-vertical')
      .attr('x1', (d: any) => d.parent!.x0 || source.x0)
      .attr('y1', (d: any) => d.parent!.y0 || source.y0)
      .attr('x2', (d: any) => d.parent!.x0 || source.x0)
      .attr('y2', (d: any) => d.parent!.y0 || source.y0)
      .style('stroke', this.isDarkMode ? '#555' : '#ccc')
      .style('stroke-width', 1);

    // UPDATE + ENTER
    const linkUpdate = linkEnter.merge(link);

    linkUpdate.transition().duration(this.duration).style('opacity', 1);

    linkUpdate
      .select('.link-horizontal')
      .transition()
      .duration(this.duration)
      .attr('x1', (d: any) => d.parent!.x)
      .attr('y1', (d: any) => d.parent!.y)
      .attr('x2', (d: any) => d.x)
      .attr('y2', (d: any) => d.parent!.y);

    linkUpdate
      .select('.link-vertical')
      .transition()
      .duration(this.duration)
      .attr('x1', (d: any) => d.x)
      .attr('y1', (d: any) => d.parent!.y)
      .attr('x2', (d: any) => d.x)
      .attr('y2', (d: any) => d.y);
  }

  // Update nodes
  private updateNodes(
    nodes: D3AssignmentNode[],
    source: D3AssignmentNode
  ): void {
    const node = this.svg.selectAll('.node').data(nodes, (d: any) => d.id);

    // EXIT
    node
      .exit()
      .transition()
      .duration(this.duration)
      .attr('transform', () => `translate(${source.x},${source.y})`)
      .style('opacity', 0)
      .remove();

    // ENTER
    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', () => `translate(${source.x0},${source.y0})`)
      .style('opacity', 0)
      .style('cursor', (d: any) =>
        d.children || d._children ? 'pointer' : 'default'
      );

    // Add collapse/expand circle for parent nodes (now on the left)
    nodeEnter
      .filter((d: any) => d.children || d._children)
      .append('circle')
      .attr('class', 'expand-circle')
      .attr('cx', -10)
      .attr('cy', 0)
      .attr('r', 6)
      .style('fill', this.isDarkMode ? '#404040' : 'white')
      .style('stroke', this.isDarkMode ? '#666' : '#999')
      .style('stroke-width', 1.5)
      .on('click', (event: any, d: any) => this.onToggleNode(event, d));

    // Add +/- symbol
    nodeEnter
      .filter((d: any) => d.children || d._children)
      .append('text')
      .attr('class', 'expand-symbol')
      .attr('x', -10)
      .attr('y', 4)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', this.isDarkMode ? '#ccc' : '#666')
      .style('pointer-events', 'none')
      .text((d: any) => (d.children ? '−' : '+'));

    // Add checkbox for nodes that have checkboxes (now after expander)
    nodeEnter
      .filter((d: any) => d.data.hasCheckbox)
      .append('rect')
      .attr('class', 'checkbox')
      .attr('x', (d: any) => (d.children || d._children ? 2 : -10))
      .attr('y', -8)
      .attr('width', this.checkboxSize)
      .attr('height', this.checkboxSize)
      .attr('rx', 2)
      .style('fill', 'white')
      .style('stroke', (d: any) => (d.data.isEnabled ? '#2196F3' : '#ccc'))
      .style('stroke-width', 2)
      .on('click', (event: any, d: any) => this.onCheckboxClick(event, d));

    // Add checkmark for checked items (larger and more visible)
    nodeEnter
      .filter((d: any) => d.data.hasCheckbox && d.data.isChecked)
      .append('text')
      .attr('class', 'checkmark')
      .attr('x', (d: any) => (d.children || d._children ? 10 : -2))
      .attr('y', 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', (d: any) => (d.data.isEnabled ? '#2196F3' : '#ccc'))
      .style('pointer-events', 'none')
      .text('✓');

    // Add text label
    nodeEnter
      .append('text')
      .attr('class', 'node-label')
      .attr('x', (d: any) => {
        if (d.children || d._children) {
          return d.data.hasCheckbox ? 22 : 5;
        }
        return d.data.hasCheckbox ? 10 : 0;
      })
      .attr('y', 4)
      .style('font-size', '14px')
      .style('fill', (d: any) => {
        if (!d.data.isEnabled && d.data.hasCheckbox) {
          return this.isDarkMode ? '#666' : '#ccc';
        }
        return this.isDarkMode ? '#ffffff' : '#333';
      })
      .style('font-weight', (d: any) => (d.depth === 0 ? 'bold' : 'normal'))
      .text((d: any) => d.data.name);

    // UPDATE + ENTER
    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate
      .transition()
      .duration(this.duration)
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      .style('opacity', 1);

    // Update expand symbol
    nodeUpdate
      .select('.expand-symbol')
      .text((d: any) => (d.children ? '−' : '+'));

    // Update checkboxes
    nodeUpdate
      .select('.checkbox')
      .style('stroke', (d: any) => (d.data.isEnabled ? '#2196F3' : '#ccc'));

    // Update checkmarks
    nodeUpdate.selectAll('.checkmark').remove();
    nodeUpdate
      .filter((d: any) => d.data.hasCheckbox && d.data.isChecked)
      .append('text')
      .attr('class', 'checkmark')
      .attr('x', (d: any) => (d.children || d._children ? 10 : -2))
      .attr('y', 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', (d: any) => (d.data.isEnabled ? '#2196F3' : '#ccc'))
      .style('pointer-events', 'none')
      .text('✓');
  }

  // Toggle node expand/collapse
  private onToggleNode(event: MouseEvent, d: D3AssignmentNode): void {
    event.stopPropagation();

    if (d.children) {
      d._children = d.children;
      d.children = undefined;
    } else if (d._children) {
      d.children = d._children;
      d._children = undefined;
    }

    this.update(d);
  }

  // Handle checkbox click
  private onCheckboxClick(event: MouseEvent, d: D3AssignmentNode): void {
    event.stopPropagation();

    if (!d.data.isEnabled) return;

    d.data.isChecked = !d.data.isChecked;

    // Handle team checkbox interaction with team groups
    if (d.data.type === 'team') {
      if (d.data.isChecked) {
        // Team is now checked - uncheck and disable all team groups
        this.disableTeamGroups(d);
      } else {
        // Team is now unchecked - re-enable team groups
        this.enableTeamGroups(d);
      }
    }

    // Handle team group checkbox interaction with parent team
    if (d.data.type === 'teamgroup') {
      const parentTeam = this.findParentTeam(d);
      if (parentTeam) {
        if (d.data.isChecked) {
          // Team group is now checked - uncheck and disable parent team
          this.disableParentTeam(parentTeam);
        } else {
          // Team group is now unchecked - check if any siblings are checked
          const hasCheckedSiblings = this.hasCheckedTeamGroups(parentTeam);
          if (!hasCheckedSiblings) {
            // No other team groups checked - re-enable parent team
            this.enableParentTeam(parentTeam);
          }
        }
      }
    }

    this.update(d);
  }

  // Disable team groups when team is checked
  private disableTeamGroups(teamNode: D3AssignmentNode): void {
    const updateChildren = (node: D3AssignmentNode) => {
      if (node.children) {
        node.children.forEach((child) => {
          if (child.data.type === 'teamgroup') {
            child.data.isChecked = false;
            child.data.isEnabled = false;
          }
          updateChildren(child);
        });
      }
      if (node._children) {
        node._children.forEach((child) => {
          if (child.data.type === 'teamgroup') {
            child.data.isChecked = false;
            child.data.isEnabled = false;
          }
          updateChildren(child);
        });
      }
    };
    updateChildren(teamNode);
  }

  // Re-enable team groups when team is unchecked
  private enableTeamGroups(teamNode: D3AssignmentNode): void {
    const ownershipContext = this.lesson?.OwnershipContext;
    const teamId = teamNode.data.referenceId;

    const updateChildren = (node: D3AssignmentNode) => {
      if (node.children) {
        node.children.forEach((child) => {
          if (child.data.type === 'teamgroup') {
            // Re-enable based on ownership context
            const isGroupEnabled =
              (ownershipContext?.Context === 'TENANT' &&
                ownershipContext.ContextKey === -1) ||
              (ownershipContext?.Context === 'TENANT' &&
                ownershipContext.ContextKey !== -1) ||
              (ownershipContext?.Context === 'TEAM' &&
                ownershipContext.ContextKey === teamId) ||
              (ownershipContext?.Context === 'TEAMGROUP' &&
                ownershipContext.ContextKey === child.data.referenceId);
            child.data.isEnabled = isGroupEnabled;
          }
          updateChildren(child);
        });
      }
      if (node._children) {
        node._children.forEach((child) => {
          if (child.data.type === 'teamgroup') {
            // Re-enable based on ownership context
            const isGroupEnabled =
              (ownershipContext?.Context === 'TENANT' &&
                ownershipContext.ContextKey === -1) ||
              (ownershipContext?.Context === 'TENANT' &&
                ownershipContext.ContextKey !== -1) ||
              (ownershipContext?.Context === 'TEAM' &&
                ownershipContext.ContextKey === teamId) ||
              (ownershipContext?.Context === 'TEAMGROUP' &&
                ownershipContext.ContextKey === child.data.referenceId);
            child.data.isEnabled = isGroupEnabled;
          }
          updateChildren(child);
        });
      }
    };
    updateChildren(teamNode);
  }

  // Find parent team node for a team group
  private findParentTeam(
    teamGroupNode: D3AssignmentNode
  ): D3AssignmentNode | null {
    // Traverse the tree to find the parent team
    const findParent = (
      node: D3AssignmentNode,
      target: D3AssignmentNode
    ): D3AssignmentNode | null => {
      if (node.children) {
        for (const child of node.children) {
          if (child === target) {
            return node.data.type === 'team' ? node : null;
          }
          const result = findParent(child, target);
          if (result) return result;
        }
      }
      if (node._children) {
        for (const child of node._children) {
          if (child === target) {
            return node.data.type === 'team' ? node : null;
          }
          const result = findParent(child, target);
          if (result) return result;
        }
      }
      return null;
    };

    if (this.root) {
      return findParent(this.root, teamGroupNode);
    }
    return null;
  }

  // Check if team has any checked team groups
  private hasCheckedTeamGroups(teamNode: D3AssignmentNode): boolean {
    const checkChildren = (node: D3AssignmentNode): boolean => {
      if (node.children) {
        for (const child of node.children) {
          if (child.data.type === 'teamgroup' && child.data.isChecked) {
            return true;
          }
          if (checkChildren(child)) return true;
        }
      }
      if (node._children) {
        for (const child of node._children) {
          if (child.data.type === 'teamgroup' && child.data.isChecked) {
            return true;
          }
          if (checkChildren(child)) return true;
        }
      }
      return false;
    };
    return checkChildren(teamNode);
  }

  // Disable parent team when team group is checked
  private disableParentTeam(teamNode: D3AssignmentNode): void {
    teamNode.data.isChecked = false;
    teamNode.data.isEnabled = false;
  }

  // Re-enable parent team when no team groups are checked
  private enableParentTeam(teamNode: D3AssignmentNode): void {
    const ownershipContext = this.lesson?.OwnershipContext;

    // Re-enable based on ownership context
    const isTeamEnabled =
      (ownershipContext?.Context === 'TENANT' &&
        ownershipContext.ContextKey === -1) ||
      (ownershipContext?.Context === 'TENANT' &&
        ownershipContext.ContextKey !== -1) ||
      (ownershipContext?.Context === 'TEAM' &&
        ownershipContext.ContextKey === teamNode.data.referenceId);
    teamNode.data.isEnabled = isTeamEnabled;
  }

  // Get selected assignments
  private getSelectedAssignments(): LessonAssignment[] {
    const assignments: LessonAssignment[] = [];
    const assignedUTC = new Date().toISOString();

    // Ensure we have a lesson with an ID
    if (!this.lesson?.LessonID) {
      console.error('Cannot create assignments: Lesson or LessonID is missing');
      return assignments;
    }

    const lessonId = this.lesson.LessonID;

    const collectChecked = (node: AssignmentTreeNode) => {
      if (node.hasCheckbox && node.isChecked && node.isEnabled) {
        if (node.type === 'me') {
          assignments.push({
            LessonID: lessonId,
            AssignedUTC: assignedUTC,
            Status: 'NOT_STARTED',
            TargetContext: {
              Context: 'USER',
              ContextKey: node.referenceId!,
            },
            AssignmentContext: {
              Context: this.assignmentContext,
              ContextKey: this.assignmentContextKey,
            },
          });
        } else if (node.type === 'team') {
          assignments.push({
            LessonID: lessonId,
            AssignedUTC: assignedUTC,
            Status: 'NOT_STARTED',
            TargetContext: {
              Context: 'TEAM',
              ContextKey: node.referenceId!,
            },
            AssignmentContext: {
              Context: this.assignmentContext,
              ContextKey: this.assignmentContextKey,
            },
          });
        } else if (node.type === 'teamgroup') {
          assignments.push({
            LessonID: lessonId,
            AssignedUTC: assignedUTC,
            Status: 'NOT_STARTED',
            TargetContext: {
              Context: 'TEAMGROUP',
              ContextKey: node.referenceId!,
            },
            AssignmentContext: {
              Context: this.assignmentContext,
              ContextKey: this.assignmentContextKey,
            },
          });
        } else if (node.type === 'player') {
          assignments.push({
            LessonID: lessonId,
            AssignedUTC: assignedUTC,
            Status: 'NOT_STARTED',
            TargetContext: {
              Context: 'PLAYER',
              ContextKey: node.referenceId!,
            },
            AssignmentContext: {
              Context: this.assignmentContext,
              ContextKey: this.assignmentContextKey,
            },
          });
        }
      }

      if (node.children) {
        node.children.forEach(collectChecked);
      }
    };

    if (this.treeData) {
      collectChecked(this.treeData);
    }

    return assignments;
  }

  // Event handlers
  onOk(): void {
    const assignments = this.getSelectedAssignments();
    this.assign.emit({
      assignments,
      dueDate: this.dueDate,
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
