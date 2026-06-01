import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  AfterViewChecked,
  ViewChild,
  ElementRef,
  HostListener,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map, take } from 'rxjs/operators';
import * as d3 from 'd3';
import {
  ILesson,
  ILessonElement,
} from '../../../interfaces/lesson-builder.interfaces';
import {
  LessonsState,
  AddLesson,
  SelectLesson,
  UpdateLesson,
  RemoveLesson,
  MigrateLessonsFlowID,
  RefreshLessonsByContext,
} from '../../../state/lessons.state';
import { CreateLessonData } from '../../dialogs/dialog-create-lesson/dialog-create-lesson.component';
import {
  SetSelectedTenant,
  SetSelectedTenantOnly,
  SetSelectedTeam,
  SetSelectedTeamGroup,
  RefreshTeamsByContext,
  UpdateAssignedLessonStatus,
} from '../../../state/user-context.actions';
import {
  SketchState,
  UpdateToolbarPosition,
  SetToolbarPositions,
  ToggleToolbarVisibility,
  SetToolbarVisibility,
  SetAllToolbarVisibility,
  ToggleToolbarLock,
  SetToolbarLock,
  ToggleTheme,
  ToggleSnapToolbarsOnResize,
  ToolbarPositions,
  ToolbarVisibility,
  ToolbarLocks,
} from '../../../state';
import * as SketchActions from '../../../state/sketch.actions';
import * as TourActions from '../../../state/tour.state';
import {
  GlobalContextState,
  SetLoggedInUser,
  SetSelectedContextTenant,
  SetSelectedContextUser,
  SetSelectedContextTeam,
  SetSelectedContextTeamGroup,
  SetSelectedContextLessonRunnerLesson,
  SetSelectedContextLessonBuilderLesson,
  SetSelectedContextNode,
  SetSelectedContextLessonBuilderNode,
  SetSelectedContextLessonRunnerNode,
  SetSelectedContextLessonNode,
  SetSelectedContextDataset,
  InitializeGlobalContext,
  SaveLastSelectedContext,
} from '../../../state';
import {
  UpdateColorTarget,
  UpdateColorBrightness,
  UpdateColorGradientBrightnessEnd,
  UpdateNodeFillColor,
  UpdateNodeStrokeColor,
  UpdateTextFillColor,
  UpdateTextStrokeColor,
} from '../../../state/colorizer.state';
import {
  ITenant,
  Role,
  ITeam,
  ITeamGroup,
  IDefaultTeamGroup,
  OwnershipContext,
  Player,
  Gender,
  AgeGroup,
  TreeNode,
  D3TreeNode,
  DecisionFlow,
  DrawingStroke,
  ToolbarPosition,
  User,
  IBackgroundDefinition,
} from '../../../interfaces';
import { MockDataService } from '../../../services/mock-data.service';
import { MockUserService } from '../../../services/mock-user.service';
import { MockGenderService } from '../../../services/mock-gender.service';
import { MockAgeGroupService } from '../../../services/mock-age-group.service';
import { RoleManagementService } from '../../../services/role-management.service';
import { determineContextSelectionRequired } from '../../../utils/tenant.utils';
import { DefaultTeamGroupsService } from '../../../services/default-team-groups.service';
import { ColorsService } from '../../../services/colors.service';
import { PanToNodeService } from '../../../services/pan-to-node.service';
import { ToolbarSnapService } from '../../../services/toolbar-snap.service';
import { OperationModeService } from '../../../services/operation-mode.service';
import { DrawerManagerService } from '../../../services/drawer-manager.service';
import { MockPositionsService } from '../../../services/mock-positions.service';
import { TreeVisualizationService } from '../../../services/tree-visualization.service';
import { VisualizationInteractionService } from '../../../services/visualization-interaction.service';
import { VisualizationRendererService } from '../../../services/visualization-renderer.service';
import { ColorizationApplicationService } from '../../../services/colorization-application.service';
import { getColorizationStrategy } from '../../../config/colorization-strategies.config';
import { ToDoService } from '../../../services/to-do/to-do.service';
import { FilterNonParentRelativesDirective } from '../../../directives';

import { DialogAddPlayerComponent } from '../../dialogs/dialog-add-player/dialog-add-player.component';
import { DialogCreateTeamComponent } from '../../dialogs/dialog-create-team/dialog-create-team.component';
import { DialogEditTeamComponent } from '../../dialogs/dialog-edit-team/dialog-edit-team.component';
import { DialogAddChildComponent } from '../../dialogs/dialog-add-child/dialog-add-child.component';
import { DialogReparentNodeComponent } from '../../dialogs/dialog-reparent-node/dialog-reparent-node.component';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

import { DialogCreateTeamGroupComponent } from '../../dialogs/dialog-create-team-group/dialog-create-team-group.component';

import { ToolbarSelectionToolsComponent } from '../../toolbars/toolbar-selection-tools/toolbar-selection-tools.component';
import { ToolbarAnnotationComponent } from '../../toolbars/toolbar-annotation/toolbar-annotation.component';
import { ToolbarScreenshotsComponent } from '../../toolbars/toolbar-screenshots/toolbar-screenshots.component';
import { ToolbarNodePainterComponent } from '../../toolbars/toolbar-node-painter/toolbar-node-painter.component';

import { ToolbarNodesListComponent } from '../../toolbars/toolbar-nodes-list/toolbar-nodes-list.component';
import { ToolbarViewEffectsComponent } from '../../toolbars/toolbar-view-effects/toolbar-view-effects.component';
import { ToolbarTeamsComponent } from '../../toolbars/toolbar-teams/toolbar-teams.component';
import { ToolbarTenancyComponent } from '../../toolbars/toolbar-tenancy/toolbar-tenancy.component';
import { ToolbarRotationControlComponent } from '../../toolbars/toolbar-rotation-control/toolbar-rotation-control.component';
import { ToolbarVisualizationOptionsComponent } from '../../toolbars/toolbar-visualization-options/toolbar-visualization-options.component';
import { ToolbarColorizationOptionsComponent } from '../../toolbars/toolbar-colorization-options/toolbar-colorization-options.component';
import { ToolbarTextStylingComponent } from '../../toolbars/toolbar-text-styling/toolbar-text-styling';
import { ToolbarTeamRosterComponent } from '../../toolbars/toolbar-team-roster/toolbar-team-roster.component';
import { ToolbarTeamGroupMembersComponent } from '../../toolbars/toolbar-team-group-members/toolbar-team-group-members.component';
import { ToolbarDefaultTeamGroupsComponent } from '../../toolbars/toolbar-default-team-groups/toolbar-default-team-groups.component';
import { ToolbarLessonRunnerV2Component } from '../../toolbars/toolbar-lesson-runner-v2/toolbar-lesson-runner-v2.component';
import { ToolbarLessonBuilderV2Component } from '../../toolbars/toolbar-lesson-builder-v2/toolbar-lesson-builder-v2.component';
import { ToolbarTechniqueExplorerComponent } from '../../toolbars/toolbar-technique-explorer/toolbar-technique-explorer.component';
import { ToolbarSelectedNodeStateComponent } from '../../toolbars/toolbar-selected-node-state/toolbar-selected-node-state.component';
import { ToolbarViewportInfoComponent } from '../../toolbars/toolbar-viewport-info/toolbar-viewport-info.component';
import { ToolbarSkillsRadarComponent } from '../../toolbars/toolbar-skills-radar/toolbar-skills-radar.component';
import { ToolbarQuickNavComponent } from '../../toolbars/toolbar-quick-nav/toolbar-quick-nav.component';
import { ToolbarSearchComponent } from '../../toolbars/toolbar-search/toolbar-search.component';
import { ToolbarImportExportComponent } from '../../toolbars/toolbar-import-export/toolbar-import-export.component';
import { ToolbarFavoritesComponent } from '../../toolbars/toolbar-favorites/toolbar-favorites.component';
import { ToolbarBookmarksComponent } from '../../toolbars/toolbar-bookmarks/toolbar-bookmarks.component';
import { ToolbarOverlaysComponent } from '../../toolbars/toolbar-overlays/toolbar-overlays.component';
import { DrawerLogin } from '../../drawers/drawer-login/drawer-login';
import { DrawerTenantSelection } from '../../drawers/drawer-tenant-selection/drawer-tenant-selection';
import { DrawerContextUserSelection } from '../../drawers/drawer-context-user-selection/drawer-context-user-selection';
import { DrawerContext } from '../../drawers/drawer-context/drawer-context';
import { DrawerSubscription } from '../../drawers/drawer-subscription/drawer-subscription';
import { DrawerAssignedLessons } from '../../drawers/drawer-assigned-lessons/drawer-assigned-lessons';
import { DrawerTeams } from '../../drawers/drawer-teams/drawer-teams';
import { DrawerTeamGroups } from '../../drawers/drawer-team-groups/drawer-team-groups';
import { DrawerDatasets } from '../../drawers/drawer-datasets/drawer-datasets';
import { DrawerLessonSelector } from '../../drawers/drawer-lesson-selector/drawer-lesson-selector';
import { DrawerToDo } from '../../drawers/drawer-to-do/drawer-to-do';
import {
  DialogEditTeamGroupComponent,
  DialogEditPlayerComponent,
  DialogDeleteTeamComponent,
  DialogDeleteTeamGroupComponent,
  DialogAddDefaultTeamGroupsComponent,
  DialogEditLessonComponent,
  DialogCreateLessonComponent,
  DialogCreateDatasetComponent,
  DialogCombineDatasetsComponent,
} from '../../dialogs';
import { CombineDatasetsResult } from '../../dialogs/dialog-combine-datasets/dialog-combine-datasets.component';
import { EditLessonData } from '../../dialogs/dialog-edit-lesson/dialog-edit-lesson.component';
import {
  DialogEditDatasetComponent,
  EditDatasetResult,
} from '../../dialogs/dialog-edit-dataset/dialog-edit-dataset.component';
import { DialogMessageComponent } from '../../dialogs/dialog-message/dialog-message.component';

@Component({
  selector: 'app-visualization-tester',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogEditTeamGroupComponent,
    DialogEditPlayerComponent,
    DialogAddPlayerComponent,
    DialogCreateTeamComponent,
    DialogEditTeamComponent,
    DialogDeleteTeamComponent,
    DialogDeleteTeamGroupComponent,
    DialogCreateTeamGroupComponent,
    DialogAddDefaultTeamGroupsComponent,
    DialogEditLessonComponent,
    DialogCreateLessonComponent,
    DialogCreateDatasetComponent,
    DialogCombineDatasetsComponent,
    DialogEditDatasetComponent,
    DialogAddChildComponent,
    DialogReparentNodeComponent,
    ConfirmationDialogComponent,
    DialogMessageComponent,
    ToolbarSelectionToolsComponent,
    ToolbarAnnotationComponent,
    ToolbarScreenshotsComponent,
    ToolbarNodePainterComponent,
    ToolbarLessonRunnerV2Component,
    ToolbarLessonBuilderV2Component,
    ToolbarTechniqueExplorerComponent,
    ToolbarNodesListComponent,
    ToolbarViewEffectsComponent,
    // ToolbarTeamsComponent, // Removed - replaced by Teams Drawer
    ToolbarTenancyComponent,
    ToolbarRotationControlComponent,
    ToolbarVisualizationOptionsComponent,
    ToolbarColorizationOptionsComponent,
    ToolbarTextStylingComponent,
    ToolbarTeamRosterComponent,
    ToolbarDefaultTeamGroupsComponent,
    // ToolbarDatasetsComponent, // Removed - replaced by Datasets Drawer
    ToolbarSelectedNodeStateComponent,
    ToolbarViewportInfoComponent,
    ToolbarSkillsRadarComponent,
    ToolbarQuickNavComponent,
    ToolbarSearchComponent,
    ToolbarImportExportComponent,
    ToolbarFavoritesComponent,
    ToolbarBookmarksComponent,
    ToolbarOverlaysComponent,
    DrawerLogin,
    DrawerTenantSelection,
    DrawerContextUserSelection,
    DrawerContext,
    DrawerSubscription,
    DrawerAssignedLessons,
    DrawerTeams,
    DrawerTeamGroups,
    DrawerDatasets,
    DrawerLessonSelector,
    DrawerToDo,
  ],
  templateUrl: './visualization-tester.html',
  styleUrls: ['./visualization-tester.scss'],
})
export class VisualizationTester
  implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked
{
  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGSVGElement>;
  @ViewChild('breadcrumbContent', { static: false })
  breadcrumbContentRef?: ElementRef<HTMLDivElement>;
  @ViewChild('rotationWheel', { static: false })
  rotationWheelRef?: ElementRef<HTMLDivElement>;
  @ViewChild('playerForm', { static: false }) playerForm?: NgForm;
  @ViewChild(ToolbarLessonRunnerV2Component, { static: false })
  lessonRunnerV2Ref?: ToolbarLessonRunnerV2Component;
  @ViewChild(ToolbarAnnotationComponent, { static: false })
  annotationToolbarRef?: ToolbarAnnotationComponent;

  // Inject Store and services
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);
  private mockDataService = inject(MockDataService);
  private mockUserService = inject(MockUserService);
  private mockGenderService = inject(MockGenderService);
  private mockAgeGroupService = inject(MockAgeGroupService);
  private roleManagementService = inject(RoleManagementService);
  private panToNodeService = inject(PanToNodeService);
  private toolbarSnapService = inject(ToolbarSnapService);
  private drawerManager = inject(DrawerManagerService);
  private toDoService = inject(ToDoService);
  private treeVisualizationService = inject(TreeVisualizationService);
  private visualizationInteractionService = inject(
    VisualizationInteractionService,
  );
  private visualizationRendererService = inject(VisualizationRendererService);
  private colorizationApplicationService = inject(
    ColorizationApplicationService,
  );
  private destroy$ = new Subject<void>();

  public width = window.innerWidth;
  public height = window.innerHeight;
  private previousWidth = window.innerWidth;
  private previousHeight = window.innerHeight;

  // Visualization size/shape properties
  public visualizationRadius = 400;
  public visualizationWidth = 800;
  public visualizationHeight = 600;
  public redDotCenterEnabled = false;
  public redDotCenterSize = 10;
  public blueDotScreenCenterEnabled = false;
  public blueDotScreenCenterSize = 10;
  public nodeSize: 'xsmall' | 'small' | 'medium' | 'large' = 'medium';
  public textPosition = 'below';
  public textFontFamily = 'Arial'; // Text font family
  public lineType: 'line' | 'step' | 'curve' = 'curve'; // Link line type
  public linkThickness: number = 1; // Link thickness (stroke width in pixels)
  public linkColorOverride: string | null = null; // Link color override (null = use contrast-based color)
  public linkConnection: 'full' | 'short' = 'full'; // Link connection style (full or stop short)
  public showDimensionLabels = true; // Show dimension labels on diagram

  // Max slider values (calculated based on ideal dimensions)
  public visualizationRadiusMax = 1000;
  public visualizationWidthMax = 2000;
  public visualizationHeightMax = 2000;

  // Ideal dimension values (for display)
  public visualizationRadiusIdeal = 400;
  public visualizationWidthIdeal = 800;
  public visualizationHeightIdeal = 600;

  // Local state properties
  private _selectedNode: string | null = null;

  public get selectedNode(): string | null {
    return this._selectedNode;
  }

  public set selectedNode(value: string | null) {
    console.log('🔵 selectedNode setter called with:', value);
    console.log('🔵 Current selectedNodes:', this.selectedNodes);
    console.log('🔵 Current selectedLesson:', this.selectedLesson?.LessonName);

    this._selectedNode = value;

    // Dispatch NGXS actions when a node is selected
    if (value) {
      this.store.dispatch(new SetSelectedContextNode(value));
      this.store.dispatch(new SketchActions.TrackNodeVisit(value));
    } else {
      this.store.dispatch(new SetSelectedContextNode(null));
    }

    this.updateBreadcrumbPath();
    this.updateComputedProperties(); // Update cached computed properties

    // Update selectedLessonNode based on lesson state and node selection
    if (value && this.selectedNodes.includes(value)) {
      // The selected node is in the lesson/selected nodes list
      if (this.selectedLesson) {
        // Lesson is selected - update lesson runner
        console.log('🎓 Updating lesson runner with node:', value);
        this.store.dispatch(new SetSelectedContextLessonNode(value));
      } else {
        // No lesson selected - only technique explorer updates (selectedNode is already set above)
        console.log(
          '🔍 No lesson selected - only updating technique explorer with node:',
          value,
        );
      }
    } else if (value) {
      // Selected node is NOT in selectedNodes list - only technique explorer updates
      console.log(
        '🔍 Node outside selectedNodes - only updating technique explorer with node:',
        value,
      );
    }

    // Pan to node if scroll to node is enabled and a node is selected
    // Skip auto-pan if suppressAutoPanToNode flag is set (e.g., during manual pan interactions)
    if (this.scrollToNodeEnabled && value && !this.suppressAutoPanToNode) {
      this.panToNodeById(value);
    }

    // Update selected node text position information for toolbar
    this.updateSelectedNodeTextInfo();
  }

  // Helper method to handle selectedNode changes from NGXS state without infinite loops
  private handleSelectedNodeChange(value: string | null): void {
    console.log('🔵 handleSelectedNodeChange called with:', value);
    console.log('🔵 Current selectedNodes:', this.selectedNodes);
    console.log('🔵 Current selectedLesson:', this.selectedLesson?.LessonName);

    this.updateBreadcrumbPath();
    this.updateComputedProperties(); // Update cached computed properties

    // Update selectedLessonNode based on lesson state and node selection
    if (value && this.selectedNodes.includes(value)) {
      // The selected node is in the lesson/selected nodes list
      if (this.selectedLesson) {
        // Lesson is selected - update lesson runner
        console.log('🎓 Updating lesson runner with node:', value);
        this.store.dispatch(new SetSelectedContextLessonNode(value));
      } else {
        // No lesson selected - only technique explorer updates (selectedNode is already set above)
        console.log(
          '🔍 No lesson selected - only updating technique explorer with node:',
          value,
        );
      }
    } else if (value) {
      // Selected node is NOT in selectedNodes list - only technique explorer updates
      console.log(
        '🔍 Node outside selectedNodes - only updating technique explorer with node:',
        value,
      );
    }

    // Pan to node if scroll to node is enabled and a node is selected
    // Skip auto-pan if suppressAutoPanToNode flag is set (e.g., during manual pan interactions)
    if (this.scrollToNodeEnabled && value && !this.suppressAutoPanToNode) {
      this.panToNodeById(value);
    }

    // Trigger change detection
    this.safeDetectChanges();
  }

  // Get the currently selected node data
  public get selectedNodeData(): TreeNode | null {
    if (!this.selectedNode || !this.treeData) {
      return null;
    }
    return this.findNodeInTree(this.treeData, this.selectedNode);
  }

  // Note: selectedLessonNodeData is now a reactive property updated in subscriptions

  // Check if the selected node has children
  public get selectedNodeHasChildren(): boolean {
    if (!this.selectedNode) {
      return false;
    }
    const nodeData = this.findNodeById(this.selectedNode);
    return (nodeData?.children && nodeData.children.length > 0) || false;
  }

  public zoomLevel = 1;
  public panX = 0;
  public panY = 0;
  public nodeCount = 25;
  public rotationAngle = 0;

  // Selected node text position information
  public selectedNodeTextX: number | null = null;
  public selectedNodeTextY: number | null = null;
  public selectedNodeTextRotation: number | null = null;
  public selectedNodeTextAnchor: string | null = null;
  public selectedNodeText180Added: boolean = false;

  // Current transform state for selected node display
  public selectedNodeCurrentZoom: number = 1;
  public selectedNodeCurrentPanX: number = 0;
  public selectedNodeCurrentPanY: number = 0;
  public selectedNodeCurrentRotation: number = 0;

  public drawingMode:
    | 'pencil'
    | 'eraser'
    | 'pan'
    | 'select'
    | 'lasso'
    | 'relatedNodes'
    | 'rectangle'
    | 'circle'
    | 'arrow'
    | 'text'
    | 'zoomDrag' = 'pan';

  // Related Node Selection properties
  public relatedNodeDirection: 'descendants' | 'ancestors' = 'descendants';
  public relatedNodeMode: 'selection' | 'highlight' = 'selection';
  public highlightedNodes: string[] = []; // For highlight mode
  public brushSize = 3;
  public eraserSize = 10;
  public eraserMode: 'normal' | 'magic' = 'magic';
  public isDarkMode = false;
  public snapToolbarsOnResize = true; // Default to checked
  public treeVisible = true; // Default tree is visible
  public logoFadeVisible = false; // Default logo fade is off
  public blackBackgroundVisible = false; // Default black background is off
  public autoFadeActive = false; // Default auto-fade is off
  public autoFadeOutActive = false; // Default auto-fade out is off
  public autoFadeDiagramActive = false; // Default auto-fade diagram is off
  public autoFadeOptionsActive = false; // Default auto-fade options is off
  public scrollToNodeEnabled = true; // Default scroll to node is on
  public quickNavFollowEnabled = true; // Default Quick-Nav follow is on
  public nodeListFollowEnabled = true; // Default Node-List follow is on
  public lessonContentQualitySurveyEnabled = true; // Default Lesson Content Quality Survey is on
  public exploratoryContentQualitySurveyEnabled = true; // Default Exploratory Content Quality Survey is on
  public explorerAutoShowEnabled = true; // Default Explorer auto-show is on
  public screenshotFormat: 'png' | 'jpg' = 'png'; // Default screenshot format
  public screenshotTarget: 'clipboard' | 'download' = 'download'; // Default screenshot target
  public snagitMode = false; // Default Snag-it mode is off

  // Flag to suppress automatic pan-to-node when selection is made during manual pan interactions
  private suppressAutoPanToNode = false;
  public dontShowLessonSurveyAgain = false; // User preference for lesson surveys
  public dontShowExploratorySurveyAgain = false; // User preference for exploratory surveys
  public autopilotRunning = false; // Track autopilot state

  // Track if skills radar was manually closed by user to prevent auto-opening
  private skillsRadarManuallyClosed = false;

  // Track if we're currently restoring state to prevent auto-opening
  private isRestoringState = false;

  // Track if state rehydration has completed
  private isStateRehydrated = false;

  // Track if nodes were added through user interaction (not restoration)
  private nodesAddedByUser = false;

  // Key state tracking for drag operations
  public keyStates = {
    ctrl: false,
    alt: false,
    shift: false,
  };

  // Rotation drag state
  private isRotationDragging = false;
  private rotationDragStartAngle = 0;
  private rotationDragStartX = 0;
  private rotationDragStartY = 0;

  // Autopilot state tracking
  private autopilotTimeouts: number[] = [];

  public strokes: DrawingStroke[] = [];
  // Node selection state
  private _selectedNodes: string[] = []; // List of selected node IDs

  public get selectedNodes(): string[] {
    return this._selectedNodes;
  }

  public set selectedNodes(value: string[]) {
    const previousNodes = this._selectedNodes;
    this._selectedNodes = value;
    this.updateSelectedNodesPanelVisibility();
    this.updateSkillsRadarVisibility();
    this.updateSelectionMatchesLesson();
    this.updateUnsavedChangesState();
    this.updateComputedProperties(); // Update cached computed properties

    // If a new node was added to selectedNodes (via shift-click), update lesson runner
    if (value.length > previousNodes.length) {
      const newNodes = value.filter(
        (nodeId) => !previousNodes.includes(nodeId),
      );
      if (newNodes.length > 0) {
        // Set the most recently added node as the lesson runner's selected node
        const newestNode = newNodes[newNodes.length - 1];
        this.store.dispatch(new SetSelectedContextLessonNode(newestNode));
      }
    }
  }

  // Unsaved changes tracking
  private _hasUnsavedChanges = false;
  private _lastSavedSelection: string[] = [];

  public get hasUnsavedChanges(): boolean {
    return this._hasUnsavedChanges;
  }

  // Cached computed properties to avoid ExpressionChangedAfterItHasBeenCheckedError
  private _canApplyChanges = false;
  private _isClearSelectionsDisabled = true;
  private _isClearDrawingsDisabled = true;

  public get canApplyChanges(): boolean {
    return this._canApplyChanges;
  }

  public get isClearSelectionsDisabled(): boolean {
    return this._isClearSelectionsDisabled;
  }

  public get isClearDrawingsDisabled(): boolean {
    return this._isClearDrawingsDisabled;
  }

  private updateComputedProperties(): void {
    // Update cached computed properties asynchronously to avoid expression changed errors
    setTimeout(() => {
      this._canApplyChanges =
        this.selectedNodes.length > 0 && this.hasUnsavedChanges;
      this._isClearSelectionsDisabled =
        this.selectedNodes.length === 0 && this.selectedNode === null;
      this._isClearDrawingsDisabled = this.strokes.length === 0;
      this.cdr.detectChanges();
    }, 0);
  }

  // Virtual scrolling properties for nodes list
  public virtualScrollTop = 0;
  public virtualItemHeight = 52; // Height of each node item in pixels
  public virtualContainerHeight = 280; // Max height of scroll container
  public virtualBuffer = 3; // Number of extra items to render outside visible area

  // Lasso selection properties
  public lassoPath: { x: number; y: number }[] = [];
  public isLassoActive = false;
  public lassoMode: 'select' | 'deselect' = 'select';

  // Zoom drag properties
  public zoomDragStart: { x: number; y: number } | null = null;
  public zoomDragEnd: { x: number; y: number } | null = null;

  // Default Team Groups properties
  public selectedDefaultTeamGroup: IDefaultTeamGroup | null = null;
  public defaultTeamGroupsEditing = false;
  public defaultTeamGroupsExpanded = true;

  // Datasets properties
  public get selectedContextDataset(): DecisionFlow | null {
    return this.store.selectSnapshot(GlobalContextState.selectedContextDataset);
  }

  public get currentDatasetOwnership(): string | null {
    const dataset = this.selectedContextDataset;
    if (!dataset || !dataset.OwnershipContext) return null;

    const context = dataset.OwnershipContext;

    // Check for system-level (TENANT with ContextKey -1)
    if (context.Context === 'TENANT' && context.ContextKey === -1) {
      return 'SYS';
    }

    // Check for personal-level (USER context)
    if (context.Context === 'USER') {
      return 'PERSONAL';
    }

    // Return the context type for other cases
    return context.Context; // 'TENANT', 'TEAM', 'TEAMGROUP'
  }

  // Toolbar expanded/collapsed states
  public teamsExpanded = true;
  public tenancyExpanded = true;
  public isLoginDrawerOpen = false;
  public isTenantDrawerOpen = false;
  public isPlayerSelectionDrawerOpen = false;
  public isContextDrawerOpen = false;
  public isTeamsDrawerOpen = false;
  public isTeamGroupsDrawerOpen = false;
  public isDatasetsDrawerOpen = false;
  public showMessageDialog = false;
  public messageDialogTitle = '';
  public messageDialogMessage = '';
  public messageDialogIcon = 'ℹ️';
  public isLessonBuilderDrawerOpen = false;
  public isSubscriptionDrawerOpen = false;
  public isAssignedLessonsDrawerOpen = false;
  public isToDoDrawerOpen = false;
  public nonClosedToDoCount = 0;
  public selectedUserId: number | null = null;
  public availableContextUsers: User[] = []; // Users available for context selection
  public canSelectSelfAsContext = false; // Whether logged-in user can select themselves
  public pendingTenantForPlayerSelection: ITenant | null = null; // Store tenant while selecting player
  public teamRosterExpanded = true;
  public teamGroupMembersExpanded = true;
  public selectionsExpanded = true;
  public lessonsExpanded = true;
  public selectionToolsExpanded = true;
  public drawingModifiersExpanded = true;
  public zoomControlsExpanded = true;
  public rotationControlExpanded = true;
  public statusPanelExpanded = true;
  public viewportInfoExpanded = true;
  public visualizationOptionsExpanded = true;
  public quickNavExpanded = true;
  public searchExpanded = true;
  public importExportExpanded = true;

  // Getter for default team groups from service
  public get defaultTeamGroups(): IDefaultTeamGroup[] {
    return this.defaultTeamGroupsService.getDefaultTeamGroups();
  }

  // Check if we're viewing a system default (read-only)
  public get isViewingSystemDefault(): boolean {
    return this.selectedDefaultTeamGroup?.IsSystemDefault || false;
  }

  // NGXS State Observables for toolbar management
  public toolbarPositions$ = this.store.select(SketchState.getToolbarPositions);
  public toolbarVisibility$ = this.store.select(
    SketchState.getToolbarVisibility,
  );
  public toolbarLocks$ = this.store.select(SketchState.getToolbarLocks);
  public isDarkMode$ = this.store.select(SketchState.getIsDarkMode);
  public snapToolbarsOnResize$ = this.store.select(
    SketchState.getSnapToolbarsOnResize,
  );
  public bottomToolbarVisible$ = this.store.select(
    SketchState.getBottomToolbarVisible,
  );

  // DEBUG: Selected lesson observables for the debug panel
  public selectedContextLessonBuilderLesson$ = this.store.select(
    GlobalContextState.selectedContextLessonBuilderLesson,
  );
  public selectedContextLessonRunnerLesson$ = this.store.select(
    GlobalContextState.selectedContextLessonRunnerLesson,
  );
  public selectedNodeFromState$ = this.store.select(
    GlobalContextState.selectedContextNode,
  );

  // DecisionFlows state observable
  public decisionFlows$ = this.store.select(SketchState.getDecisionFlows);

  // Current values for synchronous access (populated from state subscriptions)
  public bottomToolbarVisible = true;

  // Breadcrumb properties
  public breadcrumbPath: TreeNode[] = [];
  public showFullBreadcrumb = false; // false = show start, true = show end
  public hasBreadcrumbOverflow = false;

  public toolbarPositions: any = {
    selectionTools: { x: 20, y: 60 },
    // lessons: { x: 20, y: 440 }, // OLD - Removed in favor of lessonBuilderV2
    selectedNodes: { x: 20, y: 640 },
    lessonViewer: { x: 400, y: 200 }, // Center of screen - will be calculated dynamically
    // lessonRunner: { x: 420, y: 220 }, // OLD - Replaced by lessonRunnerV2
    lessonBuilderV2: { x: 440, y: 240 }, // Lesson Builder V2 position
    lessonRunnerV2: { x: 460, y: 260 }, // Lesson Runner V2 position
    techniqueExplorer: { x: 500, y: 300 }, // Offset from lesson viewer
    skillsRadar: { x: 500, y: 100 },
    quickNav: { x: 350, y: 60 },
    search: { x: 500, y: 300 }, // Center of window for new toolbar
    teams: { x: 1000, y: 290 },
    tenancy: { x: 400, y: 300 }, // Center of screen for first use
    teamRoster: { x: 1150, y: 290 }, // Moved slightly left to accommodate wider panel
    teamGroupMembers: { x: 1320, y: 200 }, // Position higher to avoid bottom navigation (was y: 290)
    defaultTeamGroups: { x: 1000, y: 490 },
    zoomControls: { x: 1000, y: 60 },
    rotationControl: { x: 1020, y: 160 },
    statusPanel: { x: 640, y: 680 },
    viewportInfo: { x: 400, y: 340 },
    visualizationOptions: { x: 700, y: 60 },
    nodesList: { x: 750, y: 400 },
    favorites: { x: 300, y: 60 }, // Favorites position
    bookmarks: { x: 300, y: 200 }, // Bookmarks position
    screenshots: { x: 250, y: 60 }, // Screenshots toolbar position
    overlays: { x: 300, y: 400 }, // Overlays toolbar position
  };
  public toolbarVisibility: any = {
    selectionTools: true,
    // lessons: true, // OLD - Removed in favor of lessonBuilderV2
    selectedNodes: true,
    lessonViewer: false, // Start hidden by default
    // lessonRunner: false, // OLD - Replaced by lessonRunnerV2
    lessonBuilderV2: false, // Start hidden by default
    lessonRunnerV2: false, // Start hidden by default
    techniqueExplorer: false, // Start hidden by default
    skillsRadar: false,
    quickNav: false,
    search: false, // Start hidden by default
    teams: true,
    tenancy: false, // Start hidden by default
    teamRoster: true,
    teamGroupMembers: true,
    defaultTeamGroups: false,
    zoomControls: true,
    rotationControl: true,
    statusPanel: true,
    viewportInfo: true,
    visualizationOptions: true,
    nodesList: false, // Start hidden by default
    favorites: false, // Start hidden by default
    bookmarks: false, // Start hidden by default
    screenshots: false, // Start hidden by default
    overlays: false, // Start hidden by default
  };
  public toolbarLocks: any = {
    selectionTools: false,
    // lessons: false, // OLD - Removed in favor of lessonBuilderV2
    selectedNodes: false,
    lessonViewer: false,
    // lessonRunner: false, // OLD - Replaced by lessonRunnerV2
    lessonBuilderV2: false,
    lessonRunnerV2: false,
    techniqueExplorer: false,
    skillsRadar: false,
    quickNav: false,
    search: false,
    teams: false,
    tenancy: false,
    teamRoster: false,
    teamGroupMembers: false,
    defaultTeamGroups: false,
    zoomControls: false,
    rotationControl: false,
    statusPanel: false,
    viewportInfo: false,
    visualizationOptions: false,
    nodesList: false,
    favorites: false,
    bookmarks: false,
    screenshots: false,
    overlays: false,
  };

  // NGXS State Observables
  public currentLessons$: Observable<ILesson[]> = new Observable<ILesson[]>(); // Will be set dynamically based on FlowID
  public allLessons$: Observable<ILesson[]> = this.store.select(
    LessonsState.getLessons,
  ); // All lessons for dropdown
  public selectedLesson$: Observable<ILesson | null> = this.store.select(
    LessonsState.getSelectedLesson,
  );
  public selectedLessonNode$: Observable<string | null> = this.store.select(
    GlobalContextState.selectedContextLessonBuilderNode,
  );
  public selectedLessonRunnerNode$: Observable<string | null> =
    this.store.select(GlobalContextState.selectedContextLessonRunnerNode);
  public hasLessons$: Observable<boolean> = new Observable<boolean>(); // Will be set dynamically based on FlowID

  // Current values for template (updated via subscriptions)
  public currentLessons: ILesson[] = [];
  public allLessons: ILesson[] = [];
  public selectedLesson: ILesson | null = null;
  // selectedLessonNode now used via Observable with async pipe in template
  public selectedLessonNodeData: TreeNode | null = null; // Reactive property for Builder
  public selectedLessonRunnerNodeData: TreeNode | null = null; // Reactive property for Runner

  public tooltip: { visible: boolean; x: number; y: number; text: string } = {
    visible: false,
    x: 0,
    y: 0,
    text: '',
  };

  // Computed property for selected nodes panel visibility
  public shouldShowSelectedNodesPanel = false;

  // New confirmation dialog system
  public showClearChildrenDialog = false;
  public showPromoteChildrenDialog = false;
  public showDeleteNodeDialog = false;
  public showInsertNodeDialog = false;
  public showEditNodeDialog = false;
  public showClearDrawingsDialog = false;
  public showClearSelectionsDialog = false;
  public showSystemDefaultWarningDialog = false;
  public pendingClearNode: string | null = null;
  public pendingPromoteNode: string | null = null;
  public pendingDeleteNode: string | null = null;
  public pendingInsertNode: string | null = null;
  public pendingEditNode: string | null = null;
  public insertNodeData = { name: '', description: '' };
  public editNodeFormData = { name: '', description: '' };

  // Computed property for delete confirmation message
  public get deleteConfirmationMessage(): string {
    if (!this.pendingDeleteNode) return '';
    const node = this.findNodeById(this.pendingDeleteNode);
    const nodeName = node?.name || this.pendingDeleteNode;
    return `Are you sure you want to delete node ${this.pendingDeleteNode} - "${nodeName}" and all of its children?`;
  }

  // Computed properties for new dialog messages
  public get clearDrawingsMessage(): string {
    return `Are you sure you want to clear all ${this.strokes.length} drawing stroke(s)? This action cannot be undone.`;
  }

  public get clearSelectionsMessage(): string {
    const totalSelections =
      this.selectedNodes.length + (this.selectedNode ? 1 : 0);
    return `Are you sure you want to clear all node selections? This will clear ${
      this.selectedNodes.length
    } multi-selected nodes${
      this.selectedNode ? ' and 1 single-selected node' : ''
    }.`;
  }

  // Local component properties
  public isDrawing = false;

  // Shape/text drawing settings controlled by the Selection Tools toolbar
  public shapeStrokeWidth = 2;
  public shapeStrokeColor = '#000000';
  public shapeFillColor = '#ffff00'; // Yellow - visible on white background
  public shapeFillMode: 'outline' | 'filled' | 'filled-outline' =
    'filled-outline';
  public rectangleConstrained = false;
  public circleConstrained = false;

  public arrowSize = 40;
  public arrowStrokeColor = '#000000';
  public arrowFillColor = '#000000';

  public textFontSize = 16;
  public textColor = '#000000';
  public textBold = false;
  public textItalic = false;
  public textStrikethrough = false;
  public backgroundStyle:
    | 'aqua-circle'
    | 'follow-mode'
    | 'pure-black'
    | 'digital-blue'
    | 'digital-green'
    | 'hex-navy-orange'
    | 'hex-navy-yellow'
    | 'tenant-definition' = 'aqua-circle';
  public colorTarget: 'nodes' | 'text' | 'both' = 'text';
  public nodeFillColor: string = '#FF0000'; // Node fill color
  public nodeStrokeColor: string = '#000000'; // Node stroke color
  public textFillColor: string = '#000000'; // Text fill color
  public textStrokeColor: string = '#FFFFFF'; // Text stroke color
  public showBackgroundCircle: boolean = false; // Show aqua background circle (colorization option)
  public colorizationCategory: string = 'by-phase-branch';
  public colorStrategy: string = 'branch'; // Changed from 'custom-status' to valid strategy
  public colorUniformity: 'Solid' | 'Gradient' = 'Solid'; // Color uniformity mode for colorization
  public colorGradientDirectionality: 'sunset' | 'sunrise' = 'sunset'; // Gradient directionality for colorization
  public colorBrightness: number = 100; // Brightness percentage (0-100) for color
  public colorGradientBrightnessEnd: number = 0; // Brightness percentage at gradient end (0-100)
  public selectedBranchIndex: number = 0; // Selected branch for branch-selection strategy
  public qualifiedColor: string = '#FF0000'; // Color for qualified nodes (branch-selection strategy)
  public unqualifiedColor: string = '#CCCCCC'; // Color for unqualified nodes (branch-selection strategy)
  public includeColorKey: boolean = false; // Include color key in visualization
  public keyPosition:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right' = 'bottom-left'; // Color key position
  public keyFont: string = 'Arial'; // Key font selection
  public keyFontSize: number = 12; // Key font size in pixels
  public keyColorShape:
    | 'circle'
    | 'square'
    | 'rectangle'
    | 'triangle'
    | 'diamond'
    | 'pentagon'
    | 'hexagon'
    | 'octagon' = 'circle'; // Key color shape
  public keyColorUniformity: 'solid' | 'gradient' = 'solid'; // Key color uniformity mode
  public keyColorSize: number = 20; // Key color size in pixels
  public keyTitle: string = 'Color Key'; // Key title text
  public keyTitleFont: string = 'Arial'; // Key title font family
  public keyTitleFontSize: number = 14; // Key title font size in pixels
  public keyTitleBold: boolean = true; // Key title bold style
  public keyTitleUnderline: boolean = false; // Key title underline style
  public keyTitleItalic: boolean = false; // Key title italic style
  public keyBorder: 'none' | 'solid' | 'shadow' = 'shadow'; // Key border style
  public keyBorderColor: string = '#333'; // Key border color (for solid border)
  public keyBackgroundColor: string = 'rgba(255, 255, 255, 0.95)'; // Key background color
  public keyTextColor: string = '#333'; // Key text color
  public keyTitleTextColor: string = '#333'; // Key title text color

  // Title properties
  public enableTitle: boolean = false; // Enable/disable title display
  public titlePosition:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'middle-left'
    | 'center'
    | 'middle-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right' = 'top-center'; // Title position
  public titleLine1: string = 'Title Line 1'; // First title line text
  public titleLine1Font: string = 'Arial'; // First title line font
  public titleLine1Size: number = 24; // First title line size in pixels
  public titleLine1Color: string = '#000000'; // First title line color
  public titleLine1Bold: boolean = false; // First title line bold
  public titleLine1Italic: boolean = false; // First title line italic
  public titleLine1Uppercase: boolean = false; // First title line uppercase
  public titleLine1Underline: boolean = false; // First title line underline
  public titleLine2: string = 'Title Line 2'; // Second title line text
  public titleLine2Font: string = 'Arial'; // Second title line font
  public titleLine2Size: number = 16; // Second title line size in pixels
  public titleLine2Color: string = '#666666'; // Second title line color
  public titleLine2Bold: boolean = false; // Second title line bold
  public titleLine2Italic: boolean = false; // Second title line italic
  public titleLine2Uppercase: boolean = false; // Second title line uppercase
  public titleLine2Underline: boolean = false; // Second title line underline
  public titleBorderType: 'none' | 'squared' | 'rounded' | 'shadow' = 'shadow'; // Title border type
  public titleBorderColor: string = '#333333'; // Title border color
  public titleBorderThickness: number = 2; // Title border thickness in pixels
  public titleBackgroundColor: string = 'rgba(255, 255, 255, 0.95)'; // Title background color

  private colorizationResult: any; // Store colorization result for key rendering
  public treeTextFont: string = 'Arial'; // Tree text font selection
  public treeTextStyle: 'normal' | 'bold' | 'underline' = 'normal'; // Tree text style
  public treeTextBold: boolean = false; // Tree text bold override
  public treeTextItalic: boolean = false; // Tree text italic override
  public treeTextUppercase: boolean = false; // Tree text uppercase override
  public treeTextSize: number = 14; // Tree text size in points (default 14pt)
  public nodeOpacity: number = 1; // Node opacity (0-1, affects text + circle + link, default fully opaque)
  public circleOpacity: number = 1; // Circle opacity (0-1, affects only circle, default fully opaque)
  public textOpacity: number = 1; // Text opacity (0-1, affects only text, default fully opaque)
  public linkOpacity: number = 1; // Link opacity (0-1, affects only link, default fully opaque)

  // Root node override settings
  public overrideRootNodeStyle: boolean = false; // Enable/disable root node overrides
  public rootNodeFont: string = 'Arial'; // Root node font override
  public rootNodeSize: number = 14; // Root node size in points (default 14pt)
  public rootNodeStyle: 'normal' | 'bold' | 'italic' = 'normal'; // Root node text style override
  public rootNodeBold: boolean = false; // Root node bold override
  public rootNodeItalic: boolean = false; // Root node italic override
  public rootNodeUppercase: boolean = false; // Root node uppercase override
  public rootNodeStrokeColor: string = '#000000'; // Root node stroke/outline color override
  public rootNodeFillColor: string = '#000000'; // Root node fill/circle color override
  public rootNodeTextColor: string = '#000000'; // Root node text color override

  // Text input overlay state
  public textInputVisible = false;
  public textInputPosition = { x: 0, y: 0 };
  @ViewChild('textInput') textInputElement!: ElementRef<HTMLDivElement>;

  // Text input overlay handlers
  onTextInputBlur() {
    this.commitTextInput();
  }

  onTextInputEnter(event: KeyboardEvent) {
    event.preventDefault();
    this.commitTextInput();
  }

  onTextInputEscape() {
    this.textInputVisible = false;
    this.currentShape = null;
    this.isDrawing = false;
  }

  private commitTextInput() {
    if (!this.textInputElement || !this.currentShape) {
      this.textInputVisible = false;
      return;
    }

    const text = this.textInputElement.nativeElement.textContent?.trim() || '';
    if (text) {
      this.currentShape.text = text;
      // Dispatch to NGXS state
      this.store.dispatch(new SketchActions.AddShape(this.currentShape));
    }

    // Clear and hide overlay
    this.textInputElement.nativeElement.textContent = '';
    this.textInputVisible = false;
    this.currentShape = null;
    this.isDrawing = false;
  }

  // Getters for colors from service
  get colors(): string[] {
    return this.colorsService.getDrawingColors();
  }

  get selectedColor(): string {
    return this.colorsService.getSelectedDrawingColor();
  }

  // Toolbar type definitions for visibility controls
  public toolbarTypes: string[] = [
    // 'datasets', // OLD - Removed in favor of datasets drawer
    'selectionTools',
    'annotation',
    'screenshots',
    'nodePainter',
    // 'lessons', // OLD - Removed in favor of lessonBuilderV2
    'lessonViewer',
    'lessonBuilderV2',
    'lessonRunnerV2', // Lesson Runner V2 toolbar toggle
    'techniqueExplorer',
    'skillsRadar',
    'rotationControl',
    // 'selectedNodes', // Removed - no longer needed
    'quickNav',
    'nodesList',
    'search',
    // 'teams', // Removed - replaced by Teams drawer toggle
    'importExport',
    'tenancy',
    'teamRoster',
    'teamGroupMembers',
    'defaultTeamGroups',
    'statusPanel',
    'favorites',
    'bookmarks',
    'zoomControls',
    'viewportInfo',
    'visualizationOptions',
    'colorizationOptions',
    'style',
    'overlays',
    'bottomToolbar',
  ];

  private svg: any;
  private g: any;
  private foregroundLayer: any; // UI layer for elements that shouldn't pan/zoom/rotate
  private drawingLayer: any;
  private treeLinksGroup: any;
  private treeNodesGroup: any;
  private treeLabelsGroup: any;
  private zoom: any;
  private degreeGroup: any;
  private currentRotation = 0;
  // Shape drawing support
  private shapes: any[] = [];
  private currentShape: any = null;
  private currentStroke: DrawingStroke | null = null;
  private strokeIdCounter = 0;
  private shapeIdCounter = 0;
  private wheelIndicator: any = null;
  private wheelCenterX = 0;
  private wheelCenterY = 0;
  private wheelRadius = 0;

  // Tree layout properties
  private treeLayout: any;
  public treeData: TreeNode = { id: '0', name: 'Node 0', children: [] }; // Initialize with default root
  public treeNodes: D3TreeNode[] = [];
  public treeLinks: any[] = [];

  // Getter for current nodes list
  public get currentNodesList(): D3TreeNode[] {
    return this.treeNodes || [];
  }

  // Virtual scrolling computed properties
  public get visibleItemsCount(): number {
    return Math.ceil(this.virtualContainerHeight / this.virtualItemHeight);
  }

  public get totalItemsHeight(): number {
    return this.currentNodesList.length * this.virtualItemHeight;
  }

  public get visibleStartIndex(): number {
    return Math.max(
      0,
      Math.floor(this.virtualScrollTop / this.virtualItemHeight) -
        this.virtualBuffer,
    );
  }

  public get visibleEndIndex(): number {
    return Math.min(
      this.currentNodesList.length - 1,
      this.visibleStartIndex + this.visibleItemsCount + this.virtualBuffer * 2,
    );
  }

  public get visibleNodes(): D3TreeNode[] {
    return this.currentNodesList.slice(
      this.visibleStartIndex,
      this.visibleEndIndex + 1,
    );
  }

  public get topSpacerHeight(): number {
    return this.visibleStartIndex * this.virtualItemHeight;
  }

  public get bottomSpacerHeight(): number {
    return Math.max(
      0,
      (this.currentNodesList.length - this.visibleEndIndex - 1) *
        this.virtualItemHeight,
    );
  }

  // Visualization options properties
  public selectedVisualization = 'radialTree'; // Default to radial tree
  public visualizationOptions = [
    { value: 'radialTree', label: 'Radial Tree', icon: '🌸' },
    { value: 'radialCluster', label: 'Radial Cluster', icon: '🌻' },
    { value: 'treeHorizontal', label: 'Tree (Horizontal)', icon: '📊' },
    { value: 'treeVertical', label: 'Tree (Vertical)', icon: '🌲' },
    { value: 'clusterHorizontal', label: 'Cluster (Horizontal)', icon: '📈' },
    { value: 'clusterVertical', label: 'Cluster (Vertical)', icon: '📉' },
    { value: 'hexGrid', label: 'Hex Grid', icon: '⬡' },
  ];

  // Split visualization into format and layout style
  public selectedFormat = 'radial'; // radial, horizontal, vertical
  public selectedLayoutStyle = 'tree'; // tree, cluster

  // D3 Layout functions (imported from D3ExampleTransitions)
  private radialTreeLayout: any;
  private radialClusterLayout: any;
  private horizontalTreeLayout: any;
  private verticalTreeLayout: any;
  private horizontalClusterLayout: any;
  private verticalClusterLayout: any;
  private radialLinkGenerator: any;
  private horizontalLinkGenerator: any;
  private verticalLinkGenerator: any;

  // Hex Grid properties
  private hexGridNodeToColorMap: Map<string, string> = new Map();
  private readonly HEX_RADIUS = 80;
  private readonly HEX_PALETTE = [
    '#e74c3c', // Red
    '#e67e22', // Orange
    '#f39c12', // Yellow-Orange
    '#2ecc71', // Green
    '#3498db', // Blue
    '#9b59b6', // Purple
    '#e91e63', // Pink
  ];

  // Parse visualization type into format and layout style
  private parseVisualizationType(type: string): void {
    if (type === 'radialTree') {
      this.selectedFormat = 'radial';
      this.selectedLayoutStyle = 'tree';
    } else if (type === 'radialCluster') {
      this.selectedFormat = 'radial';
      this.selectedLayoutStyle = 'cluster';
    } else if (type === 'treeHorizontal') {
      this.selectedFormat = 'horizontal';
      this.selectedLayoutStyle = 'tree';
    } else if (type === 'treeVertical') {
      this.selectedFormat = 'vertical';
      this.selectedLayoutStyle = 'tree';
    } else if (type === 'clusterHorizontal') {
      this.selectedFormat = 'horizontal';
      this.selectedLayoutStyle = 'cluster';
    } else if (type === 'clusterVertical') {
      this.selectedFormat = 'vertical';
      this.selectedLayoutStyle = 'cluster';
    } else if (type === 'hexGrid') {
      this.selectedFormat = 'hex';
      this.selectedLayoutStyle = 'hex';
    }
  }

  // Combine format and layout style into visualization type
  private getCombinedVisualizationType(): string {
    if (this.selectedFormat === 'hex') {
      return 'hexGrid';
    } else if (this.selectedFormat === 'radial') {
      return this.selectedLayoutStyle === 'tree'
        ? 'radialTree'
        : 'radialCluster';
    } else if (this.selectedFormat === 'horizontal') {
      return this.selectedLayoutStyle === 'tree'
        ? 'treeHorizontal'
        : 'clusterHorizontal';
    } else if (this.selectedFormat === 'vertical') {
      return this.selectedLayoutStyle === 'tree'
        ? 'treeVertical'
        : 'clusterVertical';
    }
    return 'radialTree';
  }

  // Toolbar collision detection constants
  private readonly TOOLBAR_DEFAULT_WIDTH = 320;
  private readonly TOOLBAR_DEFAULT_HEIGHT = 200;
  private readonly TOOLBAR_COLLISION_PADDING = 5; // Pixels of spacing between toolbars

  // Debug mode for collision detection
  public debugCollisions = false; // Temporarily enabled for debugging

  // Team management properties
  selectedTenantId$!: Observable<number | null>;
  selectedTeamId$!: Observable<number | null>;
  selectedTeamGroupId$!: Observable<number | null>;

  // Local state properties for team management
  public selectedPlayerIds: number[] = []; // For checkbox selection
  public showEditTeamGroupDialog = false;
  public editingTeamGroup: ITeamGroup | null = null;
  public tempSelectedPlayerIds: number[] = [];

  // Create Team dialog properties
  public showCreateTeamDialog = false;
  public newTeamName = '';
  public newTeamGenderId: number | null = null;
  public newTeamAgeGroupId: number | null = null;
  public newTeamLevel: number | null = null;
  public selectedTenantIdForNewTeam: number | null = null;
  public selectedDefaultTeamGroupsForNewTeam = new Set<number>(); // IDs of selected default groups
  public isCreatingTeam = false;

  // Edit Team dialog properties
  public showEditTeamDialog = false;
  public editTeamName = '';
  public editTeamTenantId: number | null = null;
  public editTeamGenderId: number | null = null;
  public editTeamAgeGroupId: number | null = null;
  public editTeamLevel: number | null = null;
  public isEditingTeam = false;

  // New team player creation properties
  public newTeamPlayers: Player[] = [];
  public newPlayerFirstName = '';
  public newPlayerLastName = '';
  public newPlayerPosition = '';
  public newPlayerJerseyNumber: number | null = null;

  // Create Team Group dialog properties
  public showCreateTeamGroupDialog = false;
  public newTeamGroupName = '';
  public newTeamGroupPlayerIds: number[] = [];
  public newTeamGroupMatchingPositions: string[] = [];
  public newTeamGroupMatchingNumbers: number[] = [];

  // Delete Team confirmation dialog properties
  public showDeleteTeamDialog = false;
  public teamToDelete: ITeam | null = null;

  // Delete Team Group confirmation dialog properties
  public showDeleteTeamGroupDialog = false;
  public teamGroupToDelete: ITeamGroup | null = null;

  // Auto-Build info dialog properties
  public showAutoBuildInfoDialog = false;
  public autoBuildInfoTitle = '';
  public autoBuildInfoMessage = '';

  // Add Default Team Groups dialog properties
  public showAddDefaultTeamGroupsDialog = false;
  public selectedDefaultTeamGroupsToAdd = new Set<number>();

  // Edit Lesson dialog properties
  public showEditLessonDialog = false;
  public editLessonName = '';
  public editLessonDescription = '';
  public editLessonChips: string[] = [];

  // Create Lesson dialog properties
  public showCreateLessonDialog = false;
  public newLessonName = '';
  public pendingSelectionForNewLesson: string[] = [];

  // Apply selection confirmation dialog (when no lesson is selected)
  public showApplyNoLessonConfirmDialog = false;

  // Create Dataset dialog properties
  public showCreateDatasetDialog = false;
  public breakoutNodeData: TreeNode | null = null; // Stores node data for breakout functionality
  public showAddChildDialog = false;
  public showReparentNodeDialog = false;

  // Dataset management confirmation dialogs
  public showPromoteDatasetDialog = false;
  public showDemoteDatasetDialog = false;
  public showDeleteDatasetDialog = false;
  public showDatasetInfoDialog = false;
  public showCombineDatasetsDialog = false;
  public showEditDatasetDialog = false;
  public editDatasetTarget: DecisionFlow | null = null;
  public datasetConfirmationMessage = '';
  public datasetConfirmationTitle = '';
  public datasetInfoMessage = '';
  public datasetInfoTitle = '';

  // Lesson management confirmation dialogs
  public showDeleteLessonDialog = false;
  public lessonConfirmationMessage = '';
  public lessonConfirmationTitle = '';
  public lessonConfirmationAction: 'delete' | 'promote' | 'demote' = 'delete';

  // Dynamic button text getters for lesson confirmation dialog
  get lessonConfirmButtonText(): string {
    switch (this.lessonConfirmationAction) {
      case 'delete':
        return 'Delete';
      case 'promote':
        return 'Promote';
      case 'demote':
        return 'Demote';
      default:
        return 'OK';
    }
  }

  get lessonCancelButtonText(): string {
    return 'Cancel';
  }

  // Default Team Groups form properties
  public defaultGroupFormName = '';
  public defaultGroupFormOwnership:
    | 'USER'
    | 'COACH'
    | 'PLAYER'
    | 'TENANT'
    | 'TEAM'
    | 'TEAMGROUP' = 'TEAM';
  public defaultGroupFormTenantId: number | null = null;
  public defaultGroupFormMatchingPositions = '';
  public defaultGroupFormMatchingNumbers = '';

  // Player editing properties
  public isPlayerEditPopupOpen = false;
  public editingPlayer: Player | null = null;
  public originalPlayer: Player | null = null; // To track changes

  // Add Player properties
  public isAddPlayerPopupOpen = false;
  public newPlayer: Partial<Player> = {};
  public newPlayerPositions: string[] = []; // Multiple positions a player can play
  public newPlayerPrimaryPosition = ''; // Primary position
  public selectedTeamGroupIds: number[] = []; // Team groups the player will be added to

  // Current values for synchronous access (populated from state subscriptions)
  public currentSelectedTenantId: number | null = null;
  public currentSelectedTeamId: number | null = null;
  public currentSelectedTeamGroupId: number | null = null;

  // Player sorting properties
  public playerSortBy: 'position' | 'lastName' | 'jerseyNumber' =
    'jerseyNumber';
  public playerSortOptions = [
    { value: 'jerseyNumber', label: 'Jersey Number' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'position', label: 'Position' },
  ];

  // Player filtering properties
  public playerFilterBy: 'all' | 'attackers' | 'defenders' = 'all';
  public playerFilterOptions = [
    { value: 'all', label: 'Any/All' },
    { value: 'attackers', label: 'Attackers' },
    { value: 'defenders', label: 'Defenders' },
  ];

  // Position categories for filtering
  private attackerPositions = ['HM', 'WF', 'ST', 'CM', 'AM'];
  private defenderPositions = ['HM', 'CB', 'WB', 'GK'];

  // Cache for array getters to prevent new references on every change detection
  private _cachedTeams: ITeam[] = [];
  private _cachedTeamsSource: ITeam[] | undefined = undefined;
  private _cachedTeamGroups: ITeamGroup[] = [];
  private _cachedTeamGroupsSource: ITeamGroup[] | undefined = undefined;
  private _cachedStaffTeams: ITeam[] = [];
  private _cachedStaffTeamsSource: ITeam[] | undefined = undefined;
  private _cachedStaffTeamsRoleState: string = ''; // Track role state changes

  // Dynamic title for Team Roster toolbar
  public get teamRosterTitle(): string {
    return 'Team Roster';
  }

  // Tenant data with nested structure - generated by service
  public organizations: ITenant[] = [];
  public roles: Role[] = [];
  public decisionFlows: DecisionFlow[] = [];
  public currentUserRoleId = 99; // Default to Developer role for testing

  constructor(
    private defaultTeamGroupsService: DefaultTeamGroupsService,
    private colorsService: ColorsService,
    public operationModeService: OperationModeService,
    private mockPositionsService: MockPositionsService,
  ) {}

  // Getter methods for selected objects
  public get loggedInUser(): User | null {
    return this.store.selectSnapshot(
      (state) => state.globalContext?.loggedInUser || null,
    );
  }

  public get availableTenants(): ITenant[] {
    return this.store.selectSnapshot(
      (state) => state.globalContext?.availableTenants || [],
    );
  }

  public get selectedContextUser(): User | null {
    return this.store.selectSnapshot(
      (state) => state.globalContext?.selectedContextUser || null,
    );
  }

  // Reactive property for selected tenant (updated via subscription)
  public selectedTenant: ITenant | null = this.store.selectSnapshot(
    (state) => state.globalContext?.selectedContextTenant || null,
  );

  // Reactive property for selected team (updated via subscription)
  public selectedTeam: ITeam | null = this.store.selectSnapshot(
    (state) => state.globalContext?.selectedContextTeam || null,
  );

  // Getter for teams from the selected tenant
  public get teams(): ITeam[] {
    const tenant = this.selectedTenant;
    const source = tenant?.Teams;

    // Return cached reference if source hasn't changed (prevents new [] on every CD cycle)
    if (source === this._cachedTeamsSource) {
      return this._cachedTeams;
    }

    // Update cache when source changes
    this._cachedTeamsSource = source;
    this._cachedTeams = source || [];
    return this._cachedTeams;
  }

  // Getter for staff teams - only show if user has staff/admin roles
  public get staffTeams(): ITeam[] {
    const tenant = this.selectedTenant;
    const source = tenant?.StaffTeams;

    // Check if user has only player/related member roles (0, 3, 4, 5)
    const tenantRoles = tenant?.Roles || [];
    const roleIDs = tenantRoles.map((r) => r.RoleID);
    const roleState = roleIDs.sort().join(','); // Create a state string from roles

    // Return cached reference if source and role state haven't changed
    if (
      source === this._cachedStaffTeamsSource &&
      roleState === this._cachedStaffTeamsRoleState
    ) {
      return this._cachedStaffTeams;
    }

    // Update cache when source or role state changes
    this._cachedStaffTeamsSource = source;
    this._cachedStaffTeamsRoleState = roleState;

    // If no tenant or no staff teams, return cached empty array
    if (!tenant || !source) {
      this._cachedStaffTeams = [];
      return this._cachedStaffTeams;
    }

    // If user only has roles 0, 3, 4, 5, don't show staff teams
    const hasOnlyPlayerRoles =
      roleIDs.length > 0 &&
      roleIDs.every((id) => id === 0 || id === 3 || id === 4 || id === 5);

    if (hasOnlyPlayerRoles) {
      this._cachedStaffTeams = [];
      return this._cachedStaffTeams;
    }

    this._cachedStaffTeams = source;
    return this._cachedStaffTeams;
  }

  // Getter for team groups from the selected team
  public get teamGroups(): ITeamGroup[] {
    const team = this.selectedTeam;
    const source = team?.TeamGroups;

    // Return cached reference if source hasn't changed (prevents new [] on every CD cycle)
    if (source === this._cachedTeamGroupsSource) {
      return this._cachedTeamGroups;
    }

    // Update cache when source changes
    this._cachedTeamGroupsSource = source;
    this._cachedTeamGroups = source || [];
    return this._cachedTeamGroups;
  }

  public get selectedTeamGroup(): ITeamGroup | null {
    // Get the selected team group from NGXS state
    return this.store.selectSnapshot(
      (state) => state.globalContext?.selectedContextTeamGroup || null,
    );
  }

  /**
   * Safely trigger change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
   */
  private safeDetectChanges(): void {
    setTimeout(() => {
      this.cdr.markForCheck();
    });
  }

  /**
   * Wait for state rehydration to complete before proceeding
   * Polls the isStateRehydrated flag until it's true
   */
  private async waitForStateRehydration(): Promise<void> {
    console.log('⏳ Waiting for state rehydration to complete...');
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds max wait time

    while (!this.isStateRehydrated && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.error('❌ State rehydration timeout - proceeding anyway');
    } else {
      console.log('✅ State rehydration confirmed');
    }
  }

  /**
   * Perform ordered state rehydration checks to ensure proper initialization
   * This should be called after NGXS state has been rehydrated from localStorage
   */
  /**
   * Register all drawers with the drawer manager service
   * This centralizes drawer state management and auto-close behavior
   */
  private registerDrawers(): void {
    // Register left-side drawers
    this.drawerManager.registerDrawer('login', 'left');
    this.drawerManager.registerDrawer('tenant', 'left');
    this.drawerManager.registerDrawer('playerSelection', 'left');
    this.drawerManager.registerDrawer('teams', 'left');
    this.drawerManager.registerDrawer('teamGroups', 'left');
    this.drawerManager.registerDrawer('datasets', 'left');
    this.drawerManager.registerDrawer('lessonBuilder', 'left');

    // Register right-side drawers
    this.drawerManager.registerDrawer('assignedLessons', 'right');
    this.drawerManager.registerDrawer('context', 'right');
    this.drawerManager.registerDrawer('subscription', 'right');
    this.drawerManager.registerDrawer('toDo', 'right');

    // Subscribe to drawer state changes - LEFT SIDE
    this.drawerManager
      .isOpen('login')
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        this.isLoginDrawerOpen = isOpen;
      });
    this.drawerManager
      .isOpen('tenant')
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        this.isTenantDrawerOpen = isOpen;
      });
    this.drawerManager
      .isOpen('playerSelection')
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        this.isPlayerSelectionDrawerOpen = isOpen;
      });
    this.drawerManager
      .isOpen('teams')
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        this.isTeamsDrawerOpen = isOpen;
      });
    this.drawerManager
      .isOpen('teamGroups')
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        this.isTeamGroupsDrawerOpen = isOpen;
      });
    this.drawerManager
      .isOpen('datasets')
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        this.isDatasetsDrawerOpen = isOpen;
      });
    this.drawerManager
      .isOpen('lessonBuilder')
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        this.isLessonBuilderDrawerOpen = isOpen;
      });

    // Subscribe to drawer state changes - RIGHT SIDE
    this.drawerManager
      .isOpen('assignedLessons')
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        this.isAssignedLessonsDrawerOpen = isOpen;
      });
    this.drawerManager
      .isOpen('context')
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        this.isContextDrawerOpen = isOpen;
      });
    this.drawerManager
      .isOpen('subscription')
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        this.isSubscriptionDrawerOpen = isOpen;
      });
    this.drawerManager
      .isOpen('toDo')
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        this.isToDoDrawerOpen = isOpen;
      });

    // Subscribe to non-closed to-do count
    this.toDoService.entries$
      .pipe(takeUntil(this.destroy$))
      .subscribe((entries) => {
        this.nonClosedToDoCount = entries.filter(
          (e) =>
            e.status !== 'Closed - Complete' &&
            e.status !== 'Closed - Incomplete',
        ).length;
      });
  }

  private async performStateRehydrationChecks(): Promise<void> {
    console.log('=== STATE REHYDRATION CHECKS START ===');

    // Check #0: Wait for state to be rehydrated
    // Small delay to ensure NGXS has loaded state from localStorage
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Get all users for validation
    const allUsers$ = this.mockUserService.getUsers();
    const allUsersData = await allUsers$.toPromise();
    if (!allUsersData) {
      console.error('❌ Failed to load users data');
      return;
    }
    const allUsers = allUsersData.users;

    // Check #1: Validate logged-in user
    let loggedInUser = this.store.selectSnapshot(
      GlobalContextState.loggedInUser,
    );
    console.log('📝 Check #1: LoggedInUser from state:', loggedInUser?.UserId);

    if (!loggedInUser || loggedInUser.UserId === undefined) {
      // No logged-in user found - log in as Free Mode (UserID 0)
      console.log(
        '🆓 No logged-in user found - logging in as Free Mode (UserID 0)',
      );
      const freeUser = allUsers.find((u) => u.UserId === 0);
      if (freeUser) {
        const populatedFreeUser$ = this.mockUserService.getUserWithTenants(0);
        const populatedFreeUser = await populatedFreeUser$.toPromise();

        if (populatedFreeUser && populatedFreeUser.Tenants) {
          // Set Free Mode user as logged-in and context user
          this.store.dispatch(
            new SetLoggedInUser(populatedFreeUser, populatedFreeUser.Tenants),
          );
          this.store.dispatch(new SetSelectedContextUser(populatedFreeUser));

          // Set Free Tenant (TenantID 1)
          const freeTenant = populatedFreeUser.Tenants.find(
            (t) => t.TenantID === 1,
          );
          if (freeTenant) {
            this.store.dispatch(new SetSelectedContextTenant(freeTenant));
            this.organizations = [freeTenant];
          }

          // Clear team, teamgroup, lesson
          this.store.dispatch(new SetSelectedContextTeam(null));
          this.store.dispatch(new SetSelectedContextTeamGroup(null));
          this.store.dispatch(new SetSelectedContextLessonRunnerLesson(null));

          // Set dataset to FlowID -1 (SYSTEM)
          const flows = this.store.selectSnapshot(SketchState.getDecisionFlows);
          const defaultFlow = flows.find((f) => f.FlowID === -1);
          if (defaultFlow) {
            this.store.dispatch(new SetSelectedContextDataset(defaultFlow));
          }

          console.log('✅ Free Mode initialized successfully');
          this.isStateRehydrated = true;
          return; // Skip remaining checks for Free Mode
        }
      }
      console.error('❌ Failed to initialize Free Mode');
      this.isStateRehydrated = true;
      return;
    }

    // Validate that logged-in user exists in user list
    const userExists = allUsers.some((u) => u.UserId === loggedInUser.UserId);
    if (!userExists) {
      console.warn(
        '⚠️ Logged-in user not found in user list - logging in as Free Mode',
      );
      // Follow same Free Mode logic as above
      const freeUser = allUsers.find((u) => u.UserId === 0);
      if (freeUser) {
        const populatedFreeUser$ = this.mockUserService.getUserWithTenants(0);
        const populatedFreeUser = await populatedFreeUser$.toPromise();

        if (populatedFreeUser && populatedFreeUser.Tenants) {
          this.store.dispatch(
            new SetLoggedInUser(populatedFreeUser, populatedFreeUser.Tenants),
          );
          this.store.dispatch(new SetSelectedContextUser(populatedFreeUser));
          const freeTenant = populatedFreeUser.Tenants.find(
            (t) => t.TenantID === 1,
          );
          if (freeTenant) {
            this.store.dispatch(new SetSelectedContextTenant(freeTenant));
            this.organizations = [freeTenant];
          }
          this.store.dispatch(new SetSelectedContextTeam(null));
          this.store.dispatch(new SetSelectedContextTeamGroup(null));
          this.store.dispatch(new SetSelectedContextLessonRunnerLesson(null));
          const flows = this.store.selectSnapshot(SketchState.getDecisionFlows);
          const defaultFlow = flows.find((f) => f.FlowID === -1);
          if (defaultFlow) {
            this.store.dispatch(new SetSelectedContextDataset(defaultFlow));
          }
        }
      }
      this.isStateRehydrated = true;
      return;
    }

    // User is valid and not Free Mode - continue with remaining checks
    console.log('✅ Check #1 passed: Valid user found:', loggedInUser.UserId);

    // Ensure logged-in user has tenants populated
    if (!loggedInUser.Tenants || loggedInUser.Tenants.length === 0) {
      const populatedUser$ = this.mockUserService.getUserWithTenants(
        loggedInUser.UserId,
      );
      const populatedUser = await populatedUser$.toPromise();
      if (populatedUser && populatedUser.Tenants) {
        loggedInUser = populatedUser;
        this.store.dispatch(
          new SetLoggedInUser(populatedUser, populatedUser.Tenants),
        );
        this.organizations = populatedUser.Tenants;
      }
    } else {
      this.organizations = loggedInUser.Tenants;
    }

    // Check #2: Validate selected tenant
    let selectedTenant = this.store.selectSnapshot(
      GlobalContextState.selectedContextTenant,
    );
    console.log(
      '📝 Check #2: SelectedContextTenant from state:',
      selectedTenant?.TenantID,
    );

    if (
      !selectedTenant ||
      !loggedInUser.Tenants ||
      !loggedInUser.Tenants.find((t) => t.TenantID === selectedTenant.TenantID)
    ) {
      // Tenant not found or not part of user's tenants
      console.log(
        '⚠️ Tenant not found or invalid - clearing and opening tenant drawer',
      );
      this.store.dispatch(new SetSelectedContextTenant(null));
      this.store.dispatch(new SetSelectedContextTeam(null));
      this.store.dispatch(new SetSelectedContextTeamGroup(null));

      // Set dataset to FlowID -1
      const flows = this.store.selectSnapshot(SketchState.getDecisionFlows);
      const defaultFlow = flows.find((f) => f.FlowID === -1);
      if (defaultFlow) {
        this.store.dispatch(new SetSelectedContextDataset(defaultFlow));
      }

      // Open tenant drawer
      this.toggleTenantDrawer();

      console.log('✅ Check #2 completed: Tenant cleared, drawer opened');
      this.isStateRehydrated = true;
      return; // Stop here if no tenant
    }

    console.log(
      '✅ Check #2 passed: Valid tenant found:',
      selectedTenant.TenantID,
    );

    // Populate available context users for the drawer
    // This ensures the context-user-selection drawer has the list of assumable users
    const eligibleRelatives =
      FilterNonParentRelativesDirective.filterNonParentRelatives(
        selectedTenant.Relatives || [],
        selectedTenant,
      );
    this.availableContextUsers = eligibleRelatives;

    // Determine if user can select themselves based on their roles
    const userHasNonParentRole = selectedTenant.Roles?.some(
      (role) => role.RoleID !== 4,
    );
    this.canSelectSelfAsContext = userHasNonParentRole || false;

    console.log('📋 Populated availableContextUsers:', {
      count: this.availableContextUsers.length,
      canSelectSelf: this.canSelectSelfAsContext,
    });

    // Check #3: Validate context user (assumability)
    let contextUser = this.store.selectSnapshot(
      GlobalContextState.selectedContextUser,
    );
    console.log(
      '📝 Check #3: SelectedContextUser from state:',
      contextUser?.UserId,
    );

    if (contextUser && contextUser.IsAssumable === false) {
      // Context user is not assumable - clear it
      console.log('⚠️ Context user is not assumable - clearing');
      this.store.dispatch(new SetSelectedContextUser(null));
      contextUser = null;
    }

    // Validate that context user is in the available users list
    if (contextUser) {
      const isUserAvailable =
        this.availableContextUsers.some(
          (u) => u.UserId === contextUser.UserId,
        ) ||
        (this.canSelectSelfAsContext &&
          contextUser.UserId === loggedInUser.UserId);

      if (!isUserAvailable) {
        console.log('⚠️ Context user not in available users list - clearing');
        this.store.dispatch(new SetSelectedContextUser(null));
        contextUser = null;
      }
    }

    // If no context user, default to logged-in user (if self is allowed)
    if (!contextUser) {
      if (this.canSelectSelfAsContext) {
        console.log('ℹ️ No context user - defaulting to logged-in user');
        this.store.dispatch(new SetSelectedContextUser(loggedInUser));
      } else if (this.availableContextUsers.length > 0) {
        // If can't select self, default to first available user
        console.log(
          'ℹ️ No context user and cant select self - defaulting to first available user',
        );
        this.store.dispatch(
          new SetSelectedContextUser(this.availableContextUsers[0]),
        );
      } else {
        console.warn('⚠️ No available context users found');
      }
    }

    console.log('✅ Check #3 completed: Context user validated');

    // Check #4: Validate selected team
    let selectedTeam = this.store.selectSnapshot(
      GlobalContextState.selectedContextTeam,
    );
    console.log(
      '📝 Check #4: SelectedContextTeam from state:',
      selectedTeam?.TeamID,
    );

    if (selectedTeam && selectedTenant.Teams) {
      const teamExists = selectedTenant.Teams.find(
        (t) => t.TeamID === selectedTeam.TeamID,
      );
      if (!teamExists) {
        console.log('⚠️ Team not found in tenant - clearing');
        this.store.dispatch(new SetSelectedContextTeam(null));
        selectedTeam = null;
      } else {
        console.log(
          '✅ Check #4 passed: Valid team found:',
          selectedTeam.TeamID,
        );
      }
    } else if (selectedTeam) {
      console.log('⚠️ Team selected but tenant has no teams - clearing');
      this.store.dispatch(new SetSelectedContextTeam(null));
      selectedTeam = null;
    }

    // Check #5: Validate selected team group
    let selectedTeamGroup = this.store.selectSnapshot(
      GlobalContextState.selectedContextTeamGroup,
    );
    console.log(
      '📝 Check #5: SelectedContextTeamGroup from state:',
      selectedTeamGroup?.TeamGroupID,
    );

    if (selectedTeamGroup && selectedTeam && selectedTeam.TeamGroups) {
      const teamGroupExists = selectedTeam.TeamGroups.find(
        (tg) => tg.TeamGroupID === selectedTeamGroup.TeamGroupID,
      );
      if (!teamGroupExists) {
        console.log('⚠️ TeamGroup not found in team - clearing');
        this.store.dispatch(new SetSelectedContextTeamGroup(null));
        selectedTeamGroup = null;
      } else {
        console.log(
          '✅ Check #5 passed: Valid team group found:',
          selectedTeamGroup.TeamGroupID,
        );
      }
    } else if (selectedTeamGroup) {
      console.log('⚠️ TeamGroup selected but no valid team - clearing');
      this.store.dispatch(new SetSelectedContextTeamGroup(null));
      selectedTeamGroup = null;
    }

    // Check #6: Validate selected dataset
    const selectedDataset = this.store.selectSnapshot(
      GlobalContextState.selectedContextDataset,
    );
    console.log(
      '📝 Check #6: SelectedContextDataset from state:',
      selectedDataset?.FlowID,
    );

    if (selectedDataset) {
      const flows = this.store.selectSnapshot(SketchState.getDecisionFlows);
      const datasetExists = flows.find(
        (f) => f.FlowID === selectedDataset.FlowID,
      );
      if (!datasetExists) {
        console.log('⚠️ Dataset not available in current context - clearing');
        this.store.dispatch(new SetSelectedContextDataset(null));
      } else {
        console.log(
          '✅ Check #6 passed: Valid dataset found:',
          selectedDataset.FlowID,
        );
      }
    }

    console.log('=== STATE REHYDRATION CHECKS COMPLETE ===');
    this.isStateRehydrated = true;
  }

  ngOnInit(): void {
    console.log('=== NGONINIT START ===');
    const initialVisibility = this.store.selectSnapshot(
      SketchState.getToolbarVisibility,
    );
    console.log(
      '🔄 [ngOnInit] Initial toolbar visibility from NGXS:',
      initialVisibility,
    );
    console.log(
      '  lessonBuilderV2:',
      initialVisibility.lessonBuilderV2,
      ', lessonRunnerV2:',
      initialVisibility.lessonRunnerV2,
    );

    // Register all drawers with the drawer manager
    this.registerDrawers();

    // Perform state rehydration checks before setting up subscriptions
    // This ensures proper initialization order
    this.performStateRehydrationChecks().then(() => {
      console.log('✅ State rehydration complete - component ready');
    });

    // Subscribe to NGXS state changes for lessons first
    this.currentLessons$.pipe(takeUntil(this.destroy$)).subscribe((lessons) => {
      this.currentLessons = lessons;
      console.log('Current lessons updated from state:', lessons);

      // Clear selected BUILDER lesson if it doesn't belong to current FlowID
      // Note: Runner lesson is independent (comes from assigned lessons) and should NOT be cleared here
      const flowID = this.selectedContextDataset?.FlowID;
      if (this.selectedLesson && lessons.length > 0 && flowID !== undefined) {
        const selectedLessonExists = lessons.some(
          (l) => l.LessonName === this.selectedLesson?.LessonName,
        );
        if (!selectedLessonExists) {
          console.log(
            `Selected lesson does not belong to current FlowID ${flowID}, clearing Builder selection`,
          );
          this.store.dispatch(new SetSelectedContextLessonBuilderLesson(null));
          // DO NOT clear Runner lesson here - it's independent of FlowID
        }
      }
    });

    // Subscribe to all lessons for dropdown
    this.allLessons$.pipe(takeUntil(this.destroy$)).subscribe((lessons) => {
      this.allLessons = lessons;
      console.log('All lessons updated from state:', lessons);
    });

    // Subscribe to shapes from NGXS state
    this.store
      .select(SketchState.getShapes)
      .pipe(takeUntil(this.destroy$))
      .subscribe((shapes) => {
        console.log('Shapes updated from state:', shapes);
        this.shapes = shapes || [];
        this.redrawShapes();
      });

    // Subscribe to strokes from NGXS state
    this.store
      .select(SketchState.getStrokes)
      .pipe(takeUntil(this.destroy$))
      .subscribe((strokes) => {
        console.log('Strokes updated from state:', strokes);
        this.strokes = strokes || [];
        this.redrawStrokes();
      });

    // Subscribe to NGXS toolbar state
    this.toolbarPositions$
      .pipe(takeUntil(this.destroy$))
      .subscribe((positions) => {
        // console.log('DEBUG: Toolbar positions updated:', positions);
        // console.log(
        //   'DEBUG: teamGroupMembers position:',
        //   positions.teamGroupMembers
        // );
        this.toolbarPositions = positions;
        this.safeDetectChanges();
      });

    this.toolbarVisibility$
      .pipe(takeUntil(this.destroy$))
      .subscribe((visibility) => {
        console.log(
          '📌 [toolbarVisibility$ subscription] New visibility:',
          visibility,
        );
        console.log(
          '  lessonBuilderV2:',
          visibility.lessonBuilderV2,
          ', lessonRunnerV2:',
          visibility.lessonRunnerV2,
        );
        this.toolbarVisibility = visibility;
        this.updateSelectedNodesPanelVisibility();
        this.safeDetectChanges();
      });

    this.toolbarLocks$.pipe(takeUntil(this.destroy$)).subscribe((locks) => {
      this.toolbarLocks = locks;
      this.safeDetectChanges();
    });

    this.isDarkMode$.pipe(takeUntil(this.destroy$)).subscribe((isDarkMode) => {
      console.log('isDarkMode$ subscription received:', isDarkMode);
      this.isDarkMode = isDarkMode;
      this.updateTheme(); // Update visual theme when state changes
      this.safeDetectChanges();
    });

    this.snapToolbarsOnResize$
      .pipe(takeUntil(this.destroy$))
      .subscribe((snapToolbarsOnResize) => {
        this.snapToolbarsOnResize = snapToolbarsOnResize;
        this.safeDetectChanges();
      });

    this.bottomToolbarVisible$
      .pipe(takeUntil(this.destroy$))
      .subscribe((bottomToolbarVisible) => {
        this.bottomToolbarVisible = bottomToolbarVisible;
        this.safeDetectChanges();
      });

    // Subscribe to selectedNode from NGXS state
    this.selectedNodeFromState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedNodeFromState) => {
        console.log('🔵 selectedNode from NGXS state:', selectedNodeFromState);
        if (selectedNodeFromState !== this._selectedNode) {
          this._selectedNode = selectedNodeFromState;
          // Trigger the setter logic without infinite loop
          this.handleSelectedNodeChange(selectedNodeFromState);
        }
      });

    // Subscribe to logged-in user changes to reload filtered datasets
    this.store
      .select(GlobalContextState.loggedInUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loggedInUser) => {
        console.log('👤 Logged-in user changed:', loggedInUser?.UserId);
        // Update selectedUserId to show user as selected in login drawer
        this.selectedUserId = loggedInUser?.UserId || null;
        // Reload filtered datasets whenever user logs in/out
        this.reloadFilteredDecisionFlows();
      });

    // Subscribe to selected team changes for reactive updates
    this.store
      .select(GlobalContextState.selectedContextTeam)
      .pipe(takeUntil(this.destroy$))
      .subscribe((team) => {
        console.log(
          '🏀 Selected team changed from state:',
          team?.TeamName,
          'ID:',
          team?.TeamID,
        );
        this.selectedTeam = team;
        this.cdr.markForCheck();
      });

    // Subscribe to selected tenant changes for reactive updates
    this.store
      .select(GlobalContextState.selectedContextTenant)
      .pipe(takeUntil(this.destroy$))
      .subscribe((tenant) => {
        console.log(
          '🏢 Selected tenant changed from state:',
          tenant?.TenantName,
          'ID:',
          tenant?.TenantID,
        );
        this.selectedTenant = tenant;
        this.cdr.markForCheck();
      });

    // Don't initialize organizations here - they should only be populated after user login
    // based on the user's mockTenantConfig. This ensures proper tenant filtering.
    // However, check if there's already a logged-in user from a previous session
    this.store
      .select((state) => state.globalContext?.loggedInUser)
      .pipe(take(1))
      .subscribe((loggedInUser) => {
        if (loggedInUser && loggedInUser.UserId) {
          console.log('Found existing logged-in user on init:', loggedInUser);
          // Set selectedUserId to show user as selected in login drawer
          this.selectedUserId = loggedInUser.UserId;
          // Load the user's tenants
          this.mockUserService
            .getUserWithTenants(loggedInUser.UserId)
            .subscribe((populatedUser) => {
              if (populatedUser && populatedUser.Tenants) {
                this.organizations = populatedUser.Tenants;
                console.log(
                  `Restored ${this.organizations.length} tenants for logged-in user ${populatedUser.UserId}`,
                );
              }
            });
        }
      });

    // Load DecisionFlows into state using filtered datasets based on user context
    // This will be updated whenever user context changes (login, tenant selection, etc.)
    this.reloadFilteredDecisionFlows();

    // Subscribe to DecisionFlows state changes for debugging
    this.decisionFlows$.pipe(takeUntil(this.destroy$)).subscribe((flows) => {
      console.log('DecisionFlows state updated:', flows);
      this.decisionFlows = flows;
      this.safeDetectChanges();
    });

    // Subscribe to selectedContextDataset changes to load tree data when dataset is selected from drawer
    let previousFlowID: number | undefined = undefined;
    this.store
      .select(GlobalContextState.selectedContextDataset)
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedDataset) => {
        console.log('📦 selectedContextDataset changed:', selectedDataset);

        const currentFlowID = selectedDataset?.FlowID;

        // Always regenerate for FlowID -1 (SYSTEM) or datasets with null tree data
        const shouldAlwaysRegenerate =
          currentFlowID === -1 ||
          selectedDataset?.treeData === null ||
          selectedDataset?.treeData === undefined;

        // Check if this is actually a different dataset, OR if it's a dataset that should always regenerate
        if (currentFlowID !== previousFlowID || shouldAlwaysRegenerate) {
          console.log(
            `🔄 Dataset ${
              shouldAlwaysRegenerate ? 'regeneration triggered' : 'changed'
            } from FlowID ${previousFlowID} to ${currentFlowID}`,
          );
          previousFlowID = currentFlowID;

          // Load tree data for the new dataset
          if (selectedDataset) {
            // Pass skipStateUpdate=true to avoid circular dispatch
            this.selectDecisionFlow(selectedDataset, true);
          }
        }
      });

    // Initialize roles data from the mock data service
    this.roles = this.mockDataService.getRoles();

    // Migrate any lessons without FlowID to default FlowID (0 = system/global)
    this.migrateLessonsFlowID();

    // Initialize lesson filtering (will be updated when Decision Flow is selected)
    this.updateLessonFiltering();

    // Initialize state selectors for team management
    this.selectedTenantId$ = this.store.select(
      GlobalContextState.contextTenantId,
    );
    this.selectedTeamId$ = this.store.select(GlobalContextState.contextTeamId);
    this.selectedTeamGroupId$ = this.store.select(
      GlobalContextState.contextTeamGroupId,
    );

    // Check initial state snapshot immediately
    console.log('Initial state snapshot:', this.store.snapshot());
    console.log(
      'Initial org from snapshot:',
      this.store.selectSnapshot(GlobalContextState.contextTenantId),
    );

    // Set up state subscriptions with enhanced persistence handling
    let orgSubscriptionInitialized = false;

    this.selectedTenantId$.pipe(takeUntil(this.destroy$)).subscribe((id) => {
      console.log('Organization state subscription triggered:', id);
      const previousTenantId = this.currentSelectedTenantId;
      this.currentSelectedTenantId = id;
      console.log(
        '📊 Component property updated - currentSelectedTenantId:',
        this.currentSelectedTenantId,
      );

      // Only check for default organization on the first subscription trigger
      if (!orgSubscriptionInitialized) {
        orgSubscriptionInitialized = true;

        // If no organization is selected after the first subscription (state loaded),
        // then we can set a default
        if (id === null && this.organizations.length > 0) {
          console.log(
            'No persisted organization found after state load, setting default',
          );
          // Use a small delay to ensure the subscription has fully processed
          setTimeout(() => {
            this.store.dispatch(
              new SetSelectedTenant(this.organizations[0].TenantID),
            );
          }, 50);
        } else {
          console.log('Organization loaded from persisted state:', id);
        }
      } else {
        // Tenant changed after initialization - refresh context-dependent data
        if (previousTenantId !== id) {
          console.log('🔄 Tenant context changed - refreshing data');

          // Update GlobalContextState with the full Tenant object (with Teams)
          if (id !== null) {
            const selectedTenantObj = this.organizations.find(
              (org) => org.TenantID === id,
            );
            if (selectedTenantObj) {
              console.log(
                '📦 Updating GlobalContext with full Tenant object:',
                selectedTenantObj.TenantName,
              );
              this.store.dispatch(
                new SetSelectedContextTenant(selectedTenantObj),
              );

              // Populate available context users for the drawer
              const eligibleRelatives =
                FilterNonParentRelativesDirective.filterNonParentRelatives(
                  selectedTenantObj.Relatives || [],
                  selectedTenantObj,
                );
              this.availableContextUsers = eligibleRelatives;

              // Determine if user can select themselves based on their roles
              const userHasNonParentRole = selectedTenantObj.Roles?.some(
                (role) => role.RoleID !== 4,
              );
              this.canSelectSelfAsContext = userHasNonParentRole || false;

              console.log(
                '📋 Updated availableContextUsers on tenant change:',
                {
                  count: this.availableContextUsers.length,
                  canSelectSelf: this.canSelectSelfAsContext,
                },
              );
            } else {
              console.warn('⚠️ Tenant not found in organizations array:', id);
            }
          } else {
            // Clear the selected tenant and available users
            this.store.dispatch(new SetSelectedContextTenant(null));
            this.availableContextUsers = [];
            this.canSelectSelfAsContext = false;
          }

          // Reload filtered DecisionFlows based on new tenant context
          this.reloadFilteredDecisionFlows();

          // Refresh teams, datasets, and lessons for the new tenant context
          this.store.dispatch(new RefreshTeamsByContext(id));
          this.store.dispatch(
            new SketchActions.RefreshDatasetsByContext(
              id,
              this.currentSelectedTeamId,
            ),
          );
          this.store.dispatch(
            new RefreshLessonsByContext(id, this.currentSelectedTeamId),
          );

          // Validate and clear selected dataset if no longer available in new context
          this.validateSelectedDatasetForContext();
        }
      }

      this.cdr.detectChanges();
    });

    // Subscribe to selectedContextUser changes to refresh teams from tenant
    this.store
      .select(GlobalContextState.selectedContextUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe((contextUser) => {
        console.log(
          'Context User state subscription triggered:',
          contextUser?.UserId,
        );

        // Whenever context user changes (either auto-set or user selection),
        // refresh teams from the current tenant to ensure team list is up to date
        if (this.currentSelectedTenantId !== null) {
          console.log('🔄 Context User changed - refreshing teams from tenant');
          this.store.dispatch(
            new RefreshTeamsByContext(this.currentSelectedTenantId),
          );
        }
      });

    this.selectedTeamId$.pipe(takeUntil(this.destroy$)).subscribe((id) => {
      console.log('Team state subscription triggered:', id);
      const previousTeamId = this.currentSelectedTeamId;
      this.currentSelectedTeamId = id;
      console.log(
        '📊 Component property updated - currentSelectedTeamId:',
        this.currentSelectedTeamId,
      );

      // Team changed - refresh context-dependent data (datasets and lessons)
      if (previousTeamId !== id) {
        console.log('🔄 Team context changed - refreshing data');

        // Reload filtered DecisionFlows based on new team context
        this.reloadFilteredDecisionFlows();

        // Refresh datasets and lessons for the new team context
        this.store.dispatch(
          new SketchActions.RefreshDatasetsByContext(
            this.currentSelectedTenantId,
            id,
          ),
        );
        this.store.dispatch(
          new RefreshLessonsByContext(this.currentSelectedTenantId, id),
        );

        // Validate and clear selected dataset if no longer available in new context
        this.validateSelectedDatasetForContext();
      }

      // Handle toolbar visibility when team selection changes
      // this.handleTeamToolbarVisibility(id, previousTeamId);

      // DISABLED: Auto-show toolbars when selecting team/team group
      // User must manually open toolbars via top toolbar buttons
      // Only manage team-related toolbar visibility if no operation mode is active
      /*
      if (!this.operationModeService.isAnyModeActive()) {
        // Manage team-related toolbar visibility
        if (id !== null) {
          // Team selected - show team roster toolbar (only if no operation mode is active)
          if (!this.operationModeService.isAnyModeActive()) {
            this.store.dispatch(
              new SetToolbarVisibility('teamRoster' as any, true)
            );
            // If no team group is selected, hide team group members toolbar
            if (!this.currentSelectedTeamGroupId) {
              this.store.dispatch(
                new SetToolbarVisibility('teamGroupMembers' as any, false)
              );
            }
          } else {
            console.log(
              '⚠️ Blocked automatic team toolbar changes - operation mode is active'
            );
          }
        } else {
          // No team selected - hide team-related toolbars (only if no operation mode is active)
          if (!this.operationModeService.isAnyModeActive()) {
            this.store.dispatch(
              new SetToolbarVisibility('teamRoster' as any, false)
            );
            this.store.dispatch(
              new SetToolbarVisibility('teamGroupMembers' as any, false)
            );
          } else {
            console.log(
              '⚠️ Blocked automatic team toolbar changes - operation mode is active'
            );
          }
        }
      }
      */

      this.cdr.detectChanges();
    });

    this.selectedTeamGroupId$.pipe(takeUntil(this.destroy$)).subscribe((id) => {
      console.log('TeamGroup state subscription triggered:', id);
      const previousTeamGroupId = this.currentSelectedTeamGroupId;
      this.currentSelectedTeamGroupId = id;
      console.log(
        '📊 Component property updated - currentSelectedTeamGroupId:',
        this.currentSelectedTeamGroupId,
      );

      // Team group changed - refresh filtered datasets
      if (previousTeamGroupId !== id) {
        console.log(
          '🔄 TeamGroup context changed - refreshing filtered datasets',
        );
        this.reloadFilteredDecisionFlows();
      }

      // Handle toolbar visibility when team group selection changes
      // this.handleTeamGroupToolbarVisibility(id);

      // DISABLED: Auto-show toolbars when selecting team/team group
      // User must manually open toolbars via top toolbar buttons
      // Only manage team group-related toolbar visibility if no operation mode is active
      /*
      if (!this.operationModeService.isAnyModeActive()) {
        // Manage team group-related toolbar visibility
        if (id !== null) {
          // Team group selected - show team group members toolbar
          this.store.dispatch(
            new SetToolbarVisibility('teamGroupMembers' as any, true)
          );
          // Hide team roster toolbar since we're focusing on team group members
          this.store.dispatch(
            new SetToolbarVisibility('teamRoster' as any, false)
          );
        } else {
          // No team group selected - hide team group members toolbar
          this.store.dispatch(
            new SetToolbarVisibility('teamGroupMembers' as any, false)
          );
          // Show team roster toolbar if a team is selected
          if (this.currentSelectedTeamId) {
            this.store.dispatch(
              new SetToolbarVisibility('teamRoster' as any, true)
            );
          }
        }
      }
      */

      this.cdr.detectChanges();
    });

    // Auto-select default dataset if none is currently selected
    // This runs AFTER all subscriptions are set up to ensure proper state initialization
    setTimeout(() => {
      const currentDataset = this.store.selectSnapshot(
        GlobalContextState.selectedContextDataset,
      );
      console.log(
        '🔍 Checking for auto-selection. Current dataset:',
        currentDataset,
      );

      if (!currentDataset) {
        const flows = this.store.selectSnapshot(SketchState.getDecisionFlows);
        console.log('📋 Available flows:', flows);

        if (flows && flows.length > 0) {
          const defaultFlow = flows.find((flow) => flow.FlowID === -1);
          if (defaultFlow) {
            console.log(
              '✅ Auto-selecting DecisionFlow ID -1 (SYSTEM dataset):',
              defaultFlow,
            );
            this.selectDecisionFlow(defaultFlow);
          } else {
            console.log('⚠️ No default flow (FlowID -1) found');
          }
        } else {
          console.log('⚠️ No flows available for auto-selection');
        }
      } else {
        console.log(
          'ℹ️ Dataset already selected from state, loading tree data:',
          currentDataset.FlowID,
        );
        // Dataset was restored from localStorage, but we need to load its tree data
        this.selectDecisionFlow(currentDataset, true);
      }
    }, 0);

    // Initialize visualization layouts
    this.initializeVisualizationLayouts();

    // Initialize computed properties
    this.updateComputedProperties();
  }

  ngAfterViewInit(): void {
    this.updateDimensions();

    // Ensure all toolbars are within window bounds after loading positions
    this.constrainToolbarsToWindow();

    // Wait for state rehydration before drawing the SVG tree
    this.waitForStateRehydration().then(() => {
      console.log('🎨 Drawing SVG after state rehydration');
      this.drawSvg();
    });

    // Apply initial theme
    setTimeout(() => this.updateTheme(), 100);

    // Initialize visualization layouts
    this.initializeVisualizationLayouts();

    this.selectedLesson$.pipe(takeUntil(this.destroy$)).subscribe((lesson) => {
      console.log('Selected lesson updated from state:', lesson);

      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        // Update selectedLesson when a lesson is selected
        if (lesson && lesson !== this.selectedLesson) {
          console.log('Lesson selected:', lesson.LessonName);
          this.selectedLesson = lesson;
          this.updateSelectionMatchesLesson();

          // Automatically load lesson nodes into selectedNodes if they're not already loaded
          // This ensures the Selected Nodes toolbar populates when the lesson toolbar loads
          if (lesson.LessonNodes && lesson.LessonNodes.length > 0) {
            const lessonNodeIds = lesson.LessonNodes.map((node) => node.NodeID);
            const nodesAlreadySelected = lessonNodeIds.every((nodeId) =>
              this.selectedNodes.includes(nodeId),
            );

            // Only update selectedNodes if lesson nodes aren't already selected
            if (!nodesAlreadySelected) {
              console.log(
                'Loading lesson nodes into selectedNodes:',
                lessonNodeIds,
              );
              this.selectedNodes = [...lessonNodeIds];
              this.updateNodeSelectionVisuals();
              this.updateSelectedNodesPanelVisibility();
            }

            // Set the first lesson node as selected and for lesson runner
            const firstNodeId = lessonNodeIds[0];
            console.log(
              '📚 Lesson selected - setting up first node:',
              firstNodeId,
            );
            console.log(
              '📚 selectedNodes after lesson setup:',
              this.selectedNodes,
            );

            // Set selectedNode - this will trigger the setter which should dispatch SetSelectedLessonNode
            this.selectedNode = firstNodeId;

            // Note: Removed duplicate dispatch since selectedNode setter handles it
            console.log(
              '📚 After setting selectedNode, lesson runner should update',
            );

            // Pan to the first node
            this.panToNodeById(firstNodeId);
          }
        }

        // Update for manual clearing (lesson becomes null through user action)
        if (!lesson && this.selectedLesson) {
          console.log('Lesson manually cleared by user');
          this.selectedLesson = null;
          this._selectedNodes = [];
          this.selectedNode = null;
          this.updateSelectionMatchesLesson();

          // Update visuals for clean state
          this.updateNodeSelectionVisuals();
          this.updateSelectedNodesPanelVisibility();
        }

        // Mark for check to schedule change detection
        this.cdr.markForCheck();
      }, 0);
    });

    // Subscribe to selectedContextLessonBuilderLesson changes (from lesson builder drawer)
    this.store
      .select(GlobalContextState.selectedContextLessonBuilderLesson)
      .pipe(takeUntil(this.destroy$))
      .subscribe((lesson) => {
        if (lesson && lesson !== this.selectedLesson) {
          console.log('📚 Lesson Builder lesson selected:', lesson.LessonName);

          // NOTE: Do NOT auto-open Lesson Builder V2 when a lesson is selected.
          // The toolbar should only be opened when the user explicitly opens it.
          // This prevents the toolbar from reopening after the user has closed it.
          // Users can click on a lesson to select it without the toolbar appearing.

          // Update the selectedLesson property used by the toolbar
          this.selectedLesson = lesson;

          // Load lesson nodes into selectedNodes for the toolbar
          if (lesson.LessonNodes && lesson.LessonNodes.length > 0) {
            const lessonNodeIds = lesson.LessonNodes.map((node) => node.NodeID);
            console.log(
              '📚 Loading lesson nodes into selectedNodes:',
              lessonNodeIds,
            );
            this.selectedNodes = [...lessonNodeIds];

            // Batch visual updates in next frame to avoid blocking
            requestAnimationFrame(() => {
              this.updateNodeSelectionVisuals();
              this.updateSelectedNodesPanelVisibility();
            });

            // Set the first node as selected
            const firstNodeId = lessonNodeIds[0];
            this.selectedNode = firstNodeId;

            // Pan to node in next frame to avoid blocking
            requestAnimationFrame(() => {
              this.panToNodeById(firstNodeId);
            });
          }

          // Also update the LessonsState to keep it in sync
          this.store.dispatch(new SelectLesson(lesson));

          // Use markForCheck instead of detectChanges to schedule update
          this.cdr.markForCheck();
        }
      });

    // Subscribe to selectedContextLessonRunnerLesson changes (from lesson runner drawer/context)
    this.store
      .select(GlobalContextState.selectedContextLessonRunnerLesson)
      .pipe(takeUntil(this.destroy$))
      .subscribe((lesson) => {
        if (lesson) {
          console.log('🏃 Lesson Runner lesson selected:', lesson.LessonName);

          // NOTE: Do NOT auto-open Lesson Runner V2 when a lesson is selected.
          // The toolbar should only be opened when the user explicitly opens it.
          // This prevents the toolbar from reopening after the user has closed it.
          // Users can select and run a lesson from the runner drawer without the toolbar appearing.

          // Navigate to the first lesson node
          if (lesson.LessonNodes && lesson.LessonNodes.length > 0) {
            const firstNodeId = lesson.LessonNodes[0].NodeID;
            console.log('🏃 Navigating to first lesson node:', firstNodeId);

            // Set the first node as selected RUNNER lesson node
            this.store.dispatch(
              new SetSelectedContextLessonRunnerNode(firstNodeId),
            );

            // Pan to the first node in next frame to avoid blocking
            requestAnimationFrame(() => {
              this.panToNodeById(firstNodeId);
            });
          } else {
            console.warn('🏃 Lesson has no nodes');
          }

          // Use markForCheck to schedule update
          this.cdr.markForCheck();
        } else {
          console.log('🏃 Lesson Runner lesson cleared');
        }
      });

    // Subscribe to selectedLessonNode changes
    this.selectedLessonNode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((nodeId) => {
        console.log('🎓 Selected lesson node updated from state:', nodeId);

        // Defer the update to avoid change detection cycle issues
        setTimeout(() => {
          // Update the reactive data property directly (don't update selectedLessonNode since template uses async pipe)
          if (nodeId && this.treeData) {
            const newData = this.findNodeInTree(this.treeData, nodeId);

            // Assign the data directly (avoid spread operator for complex objects)
            this.selectedLessonNodeData = newData;
          } else {
            this.selectedLessonNodeData = null;
          }

          console.log(
            '🎓 Current selectedLesson:',
            this.selectedLesson?.LessonName,
          );
          console.log(
            '🎓 Updated selectedLessonNodeData:',
            this.selectedLessonNodeData,
          );

          // Mark for check to schedule change detection without forcing immediate cycle
          this.cdr.markForCheck();
        }, 0);
      });

    // Subscribe to selectedLessonRunnerNode changes
    this.selectedLessonRunnerNode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((nodeId) => {
        console.log(
          '🏃 Selected lesson runner node updated from state:',
          nodeId,
        );

        // Defer the update to avoid change detection cycle issues
        setTimeout(() => {
          // Update the reactive data property for Runner
          if (nodeId && this.treeData) {
            const newData = this.findNodeInTree(this.treeData, nodeId);
            this.selectedLessonRunnerNodeData = newData;
          } else {
            this.selectedLessonRunnerNodeData = null;
          }

          console.log(
            '🏃 Updated selectedLessonRunnerNodeData:',
            this.selectedLessonRunnerNodeData,
          );

          // Mark for check to schedule change detection
          this.cdr.markForCheck();
        }, 0);
      });

    // Subscribe to tour state changes for guided learning navigation
    this.store
      .select(TourActions.TourState.getCurrentLesson)
      .pipe(takeUntil(this.destroy$))
      .subscribe((currentLesson) => {
        if (currentLesson && this.selectedNodes.length > 0) {
          const nodeIndex = currentLesson.lessonNodeIndex;
          if (nodeIndex >= 0 && nodeIndex < this.selectedNodes.length) {
            const nodeId = this.selectedNodes[nodeIndex];
            console.log(
              `Tour navigation: Moving to node ${nodeId} at index ${nodeIndex} of ${this.selectedNodes.length} total nodes`,
            );

            // Only update if this is a different node than currently selected
            if (this.selectedNode !== nodeId) {
              // Set the selected node
              this.selectedNode = nodeId;
              this.updateSingleNodeSelection();

              // Pan to the node to center it
              this.panToNodeById(nodeId);

              console.log(
                `Tour navigation completed: Selected node is now ${this.selectedNode}`,
              );
            } else {
              console.log(
                `Tour navigation: Node ${nodeId} is already selected, skipping update`,
              );
            }
          } else {
            console.warn(
              `Tour navigation: Invalid node index ${nodeIndex} for ${this.selectedNodes.length} nodes`,
            );
          }
        } else if (currentLesson) {
          console.log(
            `Tour state changed but selectedNodes not ready: lesson=${currentLesson.lessonId}, selectedNodes.length=${this.selectedNodes.length}`,
          );
        }
      });

    // Initialize computed properties
    this.updateSelectedNodesPanelVisibility();
    this.updateSelectionMatchesLesson();

    // Initialize rotation wheel after a delay to ensure DOM is ready
    setTimeout(() => this.initializeRotationWheel(), 200);
  }

  ngAfterViewChecked(): void {
    // Removed breadcrumb overflow checking for now
  }

  ngOnDestroy(): void {
    // Clean up visualization services
    this.visualizationInteractionService.destroy();
    this.visualizationRendererService.destroy();

    // Complete the destroy subject to clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Toolbar positioning methods (now using NGXS state)
  public toggleToolbarLock(toolbarType: string): void {
    this.store.dispatch(new ToggleToolbarLock(toolbarType as any));
  }

  public updateToolbarPosition(
    toolbarType: string,
    position: { x: number; y: number },
  ): void {
    this.store.dispatch(
      new UpdateToolbarPosition(toolbarType as any, position),
    );
  }

  public setToolbarLock(toolbarType: string, locked: boolean): void {
    this.store.dispatch(new SetToolbarLock(toolbarType as any, locked));
  }

  public toggleBottomToolbar(): void {
    this.store.dispatch(new SketchActions.ToggleBottomToolbar());
  }

  // Toolbar collision detection methods
  /**
   * Constraint callback for BaseToolbarComponent to apply collision detection
   * This method is bound and passed to each toolbar component
   */
  public applyToolbarConstraints = (
    x: number,
    y: number,
    toolbarId: string,
  ): { x: number; y: number } => {
    // Convert toolbar component ID to internal state key
    const toolbarKey = this.convertToolbarIdToKey(toolbarId);

    if (this.debugCollisions) {
      console.log(
        `[Collision] applyConstraints called for ${toolbarId} -> ${toolbarKey} at (${x}, ${y})`,
      );
    }

    return this.applyBoundaryConstraints(x, y, toolbarKey);
  };

  /**
   * Helper to convert toolbar IDs to internal keys
   * Maps from toolbar component IDs (e.g., 'selection-tools-toolbar') to
   * internal state keys (e.g., 'selectionTools')
   */
  private convertToolbarIdToKey(toolbarId: string): string {
    // Remove '-toolbar' suffix
    let key = toolbarId.replace('-toolbar', '');

    // Handle special mapping for view-effects -> zoomControls
    if (key === 'view-effects') {
      return 'zoomControls';
    }

    // Handle special mapping for lesson-runner -> lessonViewer
    if (key === 'lesson-runner') {
      return 'lessonViewer';
    }

    // Handle special mapping for selected-node-state -> statusPanel
    if (key === 'selected-node-state') {
      return 'statusPanel';
    }

    // Convert kebab-case to camelCase
    key = key.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());

    return key;
  }

  /**
   * Helper to convert internal keys back to toolbar IDs
   * Maps from internal state keys (e.g., 'selectionTools') to
   * toolbar component IDs (e.g., 'selection-tools-toolbar')
   */
  private convertToolbarKeyToId(toolbarKey: string): string {
    // Handle special reverse mappings
    if (toolbarKey === 'zoomControls') {
      return 'view-effects-toolbar';
    }
    if (toolbarKey === 'lessonViewer') {
      return 'lesson-runner-toolbar';
    }
    if (toolbarKey === 'statusPanel') {
      return 'selected-node-state-toolbar';
    }

    // Convert camelCase to kebab-case
    const kebabCase = toolbarKey.replace(/([A-Z])/g, '-$1').toLowerCase();

    // Add -toolbar suffix
    return `${kebabCase}-toolbar`;
  }

  public toggleCollisionDebug(): void {
    this.debugCollisions = !this.debugCollisions;
    console.log(
      `Collision debugging ${this.debugCollisions ? 'enabled' : 'disabled'}`,
    );
    if (this.debugCollisions) {
      this.debugToolbarState();
    }
  }

  private debugToolbarState(): void {
    console.log('=== TOOLBAR DEBUG STATE ===');
    Object.keys(this.toolbarPositions).forEach((toolbarKey) => {
      const position = this.toolbarPositions[toolbarKey];
      const visibility = this.getToolbarVisibility(toolbarKey);
      const toolbarId = this.convertToolbarKeyToId(toolbarKey);
      const domElement = document.querySelector(
        `[data-toolbar-type="${toolbarId}"]`,
      );
      const dimensions = this.getActualToolbarDimensions(toolbarKey);

      console.log(`${toolbarKey} (${toolbarId}):`, {
        position,
        visible: visibility,
        hasDomElement: !!domElement,
        dimensions,
        domRect: domElement ? domElement.getBoundingClientRect() : null,
      });
    });
    console.log('=== END TOOLBAR DEBUG ===');
  }

  private getActualToolbarDimensions(toolbarType: string): {
    width: number;
    height: number;
  } {
    // Convert internal key to toolbar ID for DOM query
    const toolbarId = this.convertToolbarKeyToId(toolbarType);
    const toolbarElement = document.querySelector(
      `[data-toolbar-type="${toolbarId}"]`,
    ) as HTMLElement;
    if (toolbarElement) {
      const rect = toolbarElement.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }
    // Fallback to default dimensions if element not found
    return {
      width: this.TOOLBAR_DEFAULT_WIDTH,
      height: this.TOOLBAR_DEFAULT_HEIGHT,
    };
  }

  private wouldCollideWithOtherToolbars(
    newX: number,
    newY: number,
    movedToolbarType: string,
  ): boolean {
    const movingDimensions = this.getActualToolbarDimensions(movedToolbarType);

    return Object.keys(this.toolbarPositions).some((otherType) => {
      if (otherType === movedToolbarType) return false;

      // Skip collision detection for invisible/closed toolbars
      const isVisible = this.getToolbarVisibility(otherType);
      if (!isVisible) {
        if (this.debugCollisions) {
          console.log(`⏭️ Skipping invisible toolbar: ${otherType}`);
        }
        return false;
      }

      // Check if DOM element actually exists
      // Convert internal key to toolbar ID for DOM query
      const otherToolbarId = this.convertToolbarKeyToId(otherType);
      const otherElement = document.querySelector(
        `[data-toolbar-type="${otherToolbarId}"]`,
      );
      if (!otherElement) {
        return false;
      }

      const otherToolbar = (this.toolbarPositions as any)[otherType];
      if (!otherToolbar) {
        return false;
      }

      const otherDimensions = this.getActualToolbarDimensions(otherType);

      // Define boundaries using actual dimensions
      const movingLeft = newX;
      const movingRight = newX + movingDimensions.width;
      const movingTop = newY;
      const movingBottom = newY + movingDimensions.height;

      const otherLeft = otherToolbar.x;
      const otherRight = otherToolbar.x + otherDimensions.width;
      const otherTop = otherToolbar.y;
      const otherBottom = otherToolbar.y + otherDimensions.height;

      // Check for collision (any overlap)
      const horizontalCollision = !(
        movingRight <= otherLeft || movingLeft >= otherRight
      );
      const verticalCollision = !(
        movingBottom <= otherTop || movingTop >= otherBottom
      );

      const wouldCollide = horizontalCollision && verticalCollision;
      if (wouldCollide && this.debugCollisions) {
        console.log(
          `Collision detected between ${movedToolbarType} and ${otherType}`,
        );
      }

      return wouldCollide;
    });
  }

  private applyBoundaryConstraints(
    newX: number,
    newY: number,
    movedToolbarType: string,
  ): { x: number; y: number } {
    if (this.debugCollisions) {
      console.log(
        `[applyBoundaryConstraints] Called for ${movedToolbarType} at (${newX}, ${newY})`,
      );
    }

    // Get window dimensions for screen boundary checking
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const movingDimensions = this.getActualToolbarDimensions(movedToolbarType);
    const currentPosition = (this.toolbarPositions as any)[movedToolbarType];

    if (!currentPosition) {
      console.warn(
        `[applyBoundaryConstraints] No current position for ${movedToolbarType}!`,
      );
      return { x: newX, y: newY };
    }

    if (this.debugCollisions) {
      console.log(
        `[applyBoundaryConstraints] Moving toolbar dimensions:`,
        movingDimensions,
      );
      console.log(
        `[applyBoundaryConstraints] Current position:`,
        currentPosition,
      );
    }

    // Apply screen boundaries first (accounting for static toolbars at top and bottom)
    const topMargin = 50; // Account for the static top toolbar
    const bottomMargin = this.bottomToolbarVisible ? 80 : 20; // Dynamic margin based on bottom toolbar visibility
    let constrainedX = Math.max(
      0,
      Math.min(newX, windowWidth - movingDimensions.width),
    );
    let constrainedY = Math.max(
      topMargin,
      Math.min(newY, windowHeight - movingDimensions.height - bottomMargin),
    );

    if (this.debugCollisions) {
      console.log(
        `[applyBoundaryConstraints] After screen bounds: (${constrainedX}, ${constrainedY})`,
      );
      console.log(
        `[applyBoundaryConstraints] Checking collision with other toolbars...`,
      );
    }

    // Check collision with each other toolbar and apply individual constraints
    Object.keys(this.toolbarPositions).forEach((otherType) => {
      if (otherType === movedToolbarType) return;

      // Skip collision detection for invisible/closed toolbars
      if (!this.getToolbarVisibility(otherType)) {
        if (this.debugCollisions) {
          console.log(`  - ${otherType}: SKIPPED (not visible)`);
        }
        return;
      }

      // Check if DOM element actually exists
      // Convert the internal key to the toolbar ID format for DOM query
      const otherToolbarId = this.convertToolbarKeyToId(otherType);
      const otherElement = document.querySelector(
        `[data-toolbar-type="${otherToolbarId}"]`,
      );
      if (!otherElement) {
        if (this.debugCollisions) {
          console.log(
            `  - ${otherType} (${otherToolbarId}): SKIPPED (no DOM element)`,
          );
        }
        return;
      }

      const otherToolbar = (this.toolbarPositions as any)[otherType];
      if (!otherToolbar) {
        if (this.debugCollisions) {
          console.log(`  - ${otherType}: SKIPPED (no position data)`);
        }
        return;
      }

      const otherDimensions = this.getActualToolbarDimensions(otherType);

      // Define boundaries of the other toolbar
      const otherLeft = otherToolbar.x;
      const otherRight = otherToolbar.x + otherDimensions.width;
      const otherTop = otherToolbar.y;
      const otherBottom = otherToolbar.y + otherDimensions.height;

      // Define boundaries of the moving toolbar at the potential new position
      const movingLeft = constrainedX;
      const movingRight = constrainedX + movingDimensions.width;
      const movingTop = constrainedY;
      const movingBottom = constrainedY + movingDimensions.height;

      // Check for horizontal overlap
      const horizontalOverlap = !(
        movingRight <= otherLeft || movingLeft >= otherRight
      );
      // Check for vertical overlap
      const verticalOverlap = !(
        movingBottom <= otherTop || movingTop >= otherBottom
      );

      if (this.debugCollisions) {
        console.log(`  - ${otherType}: checking collision`);
        console.log(
          `    Other bounds: [${otherLeft}, ${otherTop}] to [${otherRight}, ${otherBottom}]`,
        );
        console.log(
          `    Moving bounds: [${movingLeft}, ${movingTop}] to [${movingRight}, ${movingBottom}]`,
        );
        console.log(
          `    H-overlap: ${horizontalOverlap}, V-overlap: ${verticalOverlap}`,
        );
      }

      // If there's both horizontal and vertical overlap, we have a collision
      if (horizontalOverlap && verticalOverlap) {
        if (this.debugCollisions) {
          console.log(`    *** COLLISION DETECTED with ${otherType} ***`);
        }
        // Determine which boundary to respect based on current position and movement direction
        const currentLeft = currentPosition.x;
        const currentRight = currentPosition.x + movingDimensions.width;
        const currentTop = currentPosition.y;
        const currentBottom = currentPosition.y + movingDimensions.height;

        // Check current relationship to other toolbar
        const currentlyToLeft = currentRight <= otherLeft;
        const currentlyToRight = currentLeft >= otherRight;
        const currentlyAbove = currentBottom <= otherTop;
        const currentlyBelow = currentTop >= otherBottom;

        // Apply constraints based on current position relative to other toolbar
        if (currentlyToLeft && movingRight > otherLeft) {
          // Moving from left, hitting left boundary of other toolbar
          constrainedX = otherLeft - movingDimensions.width;
        } else if (currentlyToRight && movingLeft < otherRight) {
          // Moving from right, hitting right boundary of other toolbar
          constrainedX = otherRight;
        }

        if (currentlyAbove && movingBottom > otherTop) {
          // Moving from above, hitting top boundary of other toolbar
          constrainedY = otherTop - movingDimensions.height;
        } else if (currentlyBelow && movingTop < otherBottom) {
          // Moving from below, hitting bottom boundary of other toolbar
          constrainedY = otherBottom;
        }

        // Re-apply screen boundaries after collision adjustments
        constrainedX = Math.max(
          0,
          Math.min(constrainedX, windowWidth - movingDimensions.width),
        );
        constrainedY = Math.max(
          topMargin,
          Math.min(constrainedY, windowHeight - movingDimensions.height),
        );
      }
    });

    return { x: constrainedX, y: constrainedY };
  }

  public onToolbarDragStart(event: MouseEvent, toolbarType: string): void {
    // Check if toolbar is locked
    if (this.toolbarLocks[toolbarType]) {
      return;
    }

    // Debug toolbar state when drag starts
    if (this.debugCollisions) {
      console.log(`Starting drag for ${toolbarType}`);
      this.debugToolbarState();
    }

    // Prevent default behavior and stop propagation
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const startPos = { ...this.toolbarPositions[toolbarType] };

    let isDragging = false;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging) {
        isDragging = true;
      }

      // Update key states during drag
      this.keyStates.ctrl = moveEvent.ctrlKey;
      this.keyStates.alt = moveEvent.altKey;
      this.keyStates.shift = moveEvent.shiftKey;

      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newX = startPos.x + deltaX;
      const newY = startPos.y + deltaY;

      // Apply boundary constraints and collision detection
      const constrainedPosition = this.applyBoundaryConstraints(
        newX,
        newY,
        toolbarType as string,
      );

      // Update local state immediately for smooth dragging
      this.toolbarPositions = {
        ...this.toolbarPositions,
        [toolbarType]: constrainedPosition,
      };

      // Trigger change detection for immediate visual update
      this.safeDetectChanges();
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      // Only save to NGXS if we actually dragged
      if (isDragging) {
        this.store.dispatch(
          new UpdateToolbarPosition(
            toolbarType as any,
            this.toolbarPositions[toolbarType],
          ),
        );
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateDimensions();

    // Only constrain toolbars if snap on resize is enabled
    if (this.snapToolbarsOnResize) {
      this.constrainToolbarsToWindow();
    }

    this.redrawSvg();
  }

  private updateDimensions() {
    this.previousWidth = this.width;
    this.previousHeight = this.height;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  private constrainToolbarsToWindow() {
    // Define approximate toolbar dimensions (width x height)
    const toolbarSizes: Record<string, { width: number; height: number }> = {
      selectionTools: { width: 320, height: 450 }, // Increased height to accommodate modifiers
      lessons: { width: 320, height: 250 },
      selectedNodes: { width: 320, height: 300 },
      skillsRadar: { width: 500, height: 600 },
      zoomControls: { width: 320, height: 200 },
      rotationControl: { width: 380, height: 280 },
      statusPanel: { width: 320, height: 60 },
      visualizationOptions: { width: 320, height: 350 },
      viewportInfo: { width: 320, height: 200 },
      teams: { width: 320, height: 400 },
      teamRoster: { width: 380, height: 450 },
      defaultTeamGroups: { width: 320, height: 450 },
      nodesList: { width: 320, height: 400 }, // Added nodesList toolbar
    };

    console.log(
      'Window resize - constraining toolbars using ToolbarSnapService.',
    );
    console.log('Previous size:', this.previousWidth, 'x', this.previousHeight);
    console.log('Current size:', this.width, 'x', this.height);

    // Filter toolbar positions to only include visible toolbars with DOM elements
    const visibleToolbarPositions: Record<string, { x: number; y: number }> =
      {};
    const visibleToolbarSizes: Record<
      string,
      { width: number; height: number }
    > = {};

    Object.keys(this.toolbarPositions).forEach((toolbarKey) => {
      // Skip positioning for invisible/closed toolbars
      if (!this.getToolbarVisibility(toolbarKey)) {
        return;
      }

      // Check if DOM element actually exists
      const toolbarElement = document.querySelector(
        `[data-toolbar-type="${toolbarKey}"]`,
      );
      if (!toolbarElement) {
        return;
      }

      const size = toolbarSizes[toolbarKey];
      if (!size) {
        return; // Skip if size not defined
      }

      visibleToolbarPositions[toolbarKey] = {
        ...this.toolbarPositions[toolbarKey],
      };
      visibleToolbarSizes[toolbarKey] = size;
    });

    // Use the ToolbarSnapService to constrain toolbars
    const updatedPositions = this.toolbarSnapService.constrainToolbarsToWindow(
      {
        positions: visibleToolbarPositions,
        sizes: visibleToolbarSizes,
        lockedToolbars: this.toolbarLocks,
      },
      {
        margin: 20,
        snapThreshold: 50,
        windowWidth: this.width,
        windowHeight: this.height,
        previousWindowWidth: this.previousWidth,
        previousWindowHeight: this.previousHeight,
      },
    );

    // Update the local toolbar positions object with the updated positions
    Object.keys(updatedPositions).forEach((toolbarKey) => {
      this.toolbarPositions = {
        ...this.toolbarPositions,
        [toolbarKey]: updatedPositions[toolbarKey],
      };
    });

    // Save the adjusted positions using NGXS action
    this.store.dispatch(new SetToolbarPositions(this.toolbarPositions));
  }

  private redrawSvg() {
    console.log(`Redrawing SVG, preserving ${this.strokes.length} strokes`);

    // Safety check: ensure view is initialized
    if (!this.svgRef?.nativeElement) {
      console.log('SVG not ready yet, skipping redraw');
      return;
    }

    // Clear existing SVG content
    d3.select(this.svgRef.nativeElement).selectAll('*').remove();

    // Reset degreeGroup reference since we cleared everything
    this.degreeGroup = null;

    // Redraw everything (this will call redrawStrokes internally)
    this.drawSvg();
  }

  drawSvg() {
    // Add double-click event to the topmost 'g' element to reset pan and zoom
    this.svg = d3
      .select(this.svgRef.nativeElement)
      .attr('width', this.width)
      .attr('height', this.height)
      .style(
        'background',
        this.colorsService.getBackgroundColor(this.isDarkMode),
      );

    // Create a group for pan/zoom (content will be transformed)
    this.g = this.svg.append('g'); // Add an aqua background circle to the 'g' group (content area, inside degree circle)

    // Create separate groups for proper z-order layering (order matters in SVG)
    this.treeLinksGroup = this.g.append('g').attr('class', 'tree-links-layer');
    this.treeNodesGroup = this.g.append('g').attr('class', 'tree-nodes-layer');
    this.treeLabelsGroup = this.g
      .append('g')
      .attr('class', 'tree-labels-layer');

    // Create drawing layer as part of the transformed group so drawings pan/zoom/rotate with content
    this.drawingLayer = this.g
      .append('g')
      .attr('class', 'drawing-layer')
      .style('isolation', 'auto');

    // Create a foreground UI layer on top of everything that is NOT transformed by pan/zoom/rotate
    // This is added directly to this.svg after this.g, so it renders on top and stays in place
    this.foregroundLayer = this.svg
      .append('g')
      .attr('class', 'foreground-ui-layer')
      .style('pointer-events', 'auto');

    const centerX = this.width / 2;
    const centerY = this.height / 2;
    // Adjust content radius based on available space (account for UI elements)
    const availableWidth = this.width;
    const availableHeight = this.height - 120; // Account for control panels (top/bottom)
    const backgroundRadius = Math.min(availableWidth, availableHeight) * 0.35;

    this.g
      .append('circle')
      .attr('class', 'background-circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', backgroundRadius)
      .attr('fill', this.colorsService.getBlueColor(this.isDarkMode))
      .attr('opacity', this.showBackgroundCircle ? 0.25 : 0)
      .attr('pointer-events', this.showBackgroundCircle ? 'all' : 'none')
      .on('dblclick', (event: MouseEvent) => {
        if (this.drawingMode === 'pan') {
          console.log('g dblclick', event);
          const t = d3.transition().duration(2000);
          const center = [this.width / 2, this.height / 2];
          const scale = 1;
          const tx = center[0] - center[0] * scale;
          const ty = center[1] - center[1] * scale;
          this.g
            .transition(t)
            .duration(2000)
            .attr('transform', `translate(${tx},${ty}) scale(${scale})`);
          this.selectedNode = null;
          (this as any).cdRef?.detectChanges?.();
          event.stopPropagation();
        }
      });

    // Add red dot center marker (part of transformed group, adheres to pan/zoom/rotate)
    this.g
      .append('circle')
      .attr('class', 'red-dot-center')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', this.redDotCenterEnabled ? this.redDotCenterSize : 0)
      .attr('fill', 'red')
      .attr('opacity', 0.8)
      .attr('pointer-events', 'none');

    // Add blue dot screen center marker (not part of transformed group, stays fixed)
    this.svg
      .append('circle')
      .attr('class', 'blue-dot-screen-center')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr(
        'r',
        this.blueDotScreenCenterEnabled ? this.blueDotScreenCenterSize : 0,
      )
      .attr('fill', 'blue')
      .attr('opacity', 0.8)
      .attr('pointer-events', 'none');

    // Generate tree data and layout
    this.treeData = this.generateTreeData(this.nodeCount);

    // Update breadcrumb path in case there's a selected node
    this.updateBreadcrumbPath();

    // Use the new visualization system instead of the old layout
    this.updateVisualization();

    // Apply background style
    this.updateBackgroundStyle();

    // D3 zoom behavior (delegated to VisualizationInteractionService)
    this.visualizationInteractionService.setupZoomBehavior(
      this.svgRef.nativeElement,
      {
        scaleExtent: [0.5, 5],
        onZoom: (transform) => {
          // Update local state
          this.panX = transform.panX;
          this.panY = transform.panY;
          this.zoomLevel = transform.zoomLevel;

          // Apply transform
          this.applyTransform();

          // Update selected node text info to reflect any changes
          this.updateSelectedNodeTextInfo();

          // Trigger change detection to update UI sliders
          this.cdr.detectChanges();
        },
        filter: (event) => {
          // Block snag-it mode from zoom/pan behavior
          if (this.snagitActive) {
            return false;
          }

          // Block Alt+drag from zoom/pan behavior (we'll handle it for rotation)
          if (event.type === 'mousedown' && event.altKey) {
            return false;
          }

          // Allow zoom/pan only in pan mode, or wheel events always
          if (this.drawingMode === 'pan') {
            return event.type === 'wheel' || event.type === 'mousedown';
          } else {
            return event.type === 'wheel'; // Only allow scroll wheel zoom when drawing
          }
        },
      },
    );

    // Keep zoom reference for legacy code that calls this.zoom.transform
    this.zoom = d3.zoom<SVGSVGElement, unknown>();

    // Add mouse event handlers to the entire SVG for drawing
    this.svg
      .on('mousedown.drawing', (event: MouseEvent) => {
        const point = this.getDrawingPoint(event);

        console.log('SVG mousedown.drawing, snagitActive:', this.snagitActive);

        // Handle snag-it mode
        if (this.snagitActive) {
          console.log('Calling handleSnagitMouseDown');
          event.preventDefault();
          event.stopPropagation();
          this.handleSnagitMouseDown(point);
          return;
        }

        // Handle Alt+drag for rotation
        if (event.altKey) {
          this.startRotationDrag(event);
          return;
        }

        if (this.drawingMode !== 'pan') {
          console.log('SVG mousedown for drawing mode:', this.drawingMode);
          this.startDrawing(event);
        }
      })
      .on('mousemove.drawing', (event: MouseEvent) => {
        // Update key states during any mouse movement
        this.keyStates.ctrl = event.ctrlKey;
        this.keyStates.alt = event.altKey;
        this.keyStates.shift = event.shiftKey;

        const point = this.getDrawingPoint(event);

        // Handle snag-it mode
        if (this.snagitActive) {
          event.preventDefault();
          event.stopPropagation();
          this.handleSnagitMouseMove(point);
          return;
        }

        if (this.isRotationDragging) {
          this.continueRotationDrag(event);
        } else if (this.isDrawing && this.drawingMode !== 'pan') {
          this.continueDrawing(event);
        }
      })
      .on('mouseup.drawing', (event: MouseEvent) => {
        // Handle snag-it mode
        if (this.snagitActive) {
          event.preventDefault();
          event.stopPropagation();
          this.handleSnagitMouseUp();
          return;
        }

        if (this.isRotationDragging) {
          this.endRotationDrag();
        } else if (this.isDrawing && this.drawingMode !== 'pan') {
          this.endDrawing(event);
        }
      });

    // Redraw existing strokes
    this.redrawStrokes();
    console.log('SVG setup complete, drawing layer ready');

    // Remove double-click event on SVG. Only 'g' group will handle double-click reset.
  }

  // Drawing methods
  private startDrawing(event: MouseEvent) {
    console.log('startDrawing called, mode:', this.drawingMode);

    if (this.drawingMode === 'pan') return;

    this.isDrawing = true;
    const point = this.getDrawingPoint(event);
    console.log('Drawing point:', point);

    if (this.drawingMode === 'pencil') {
      // Start new stroke
      this.currentStroke = {
        id: `stroke-${this.strokeIdCounter++}`,
        points: [point],
        color: this.selectedColor,
        size: this.brushSize,
        width: this.brushSize,
        mode: 'pencil',
      };
      console.log('Started new stroke:', this.currentStroke.id);
    } else if (
      this.drawingMode === 'rectangle' ||
      this.drawingMode === 'circle' ||
      this.drawingMode === 'arrow' ||
      this.drawingMode === 'text'
    ) {
      // Start a new shape
      const shapeStroke =
        this.drawingMode === 'arrow'
          ? this.arrowStrokeColor || '#000000'
          : this.shapeStrokeColor || '#000000';
      const shapeFill =
        this.drawingMode === 'arrow'
          ? this.arrowFillColor || '#000000'
          : this.shapeFillColor || '#ffff00'; // Yellow default instead of white

      console.log(
        'Creating shape with fillMode:',
        this.shapeFillMode,
        'fill:',
        shapeFill,
        'stroke:',
        shapeStroke,
      );

      this.currentShape = {
        id: `shape-${this.shapeIdCounter++}`,
        type: this.drawingMode,
        start: point,
        end: point,
        stroke: shapeStroke,
        fill: shapeFill,
        strokeWidth: this.shapeStrokeWidth || 2,
        fillMode: this.shapeFillMode,
        arrowSize: this.arrowSize || 40,
        text: '',
        fontSize: this.textFontSize || 16,
        textColor: this.textColor || '#000000',
        fontFamily: this.getFontFamilyWithFallback(
          this.textFontFamily || 'Arial',
        ),
        textBold: this.textBold,
        textItalic: this.textItalic,
      };

      // If text, show inline editor overlay
      if (this.drawingMode === 'text') {
        // Position the overlay at the click point
        this.textInputPosition = { x: point.x, y: point.y };
        this.textInputVisible = true;

        // Focus the input after a brief delay to ensure it's rendered
        setTimeout(() => {
          if (this.textInputElement) {
            this.textInputElement.nativeElement.focus();
          }
        }, 10);

        return;
      }
      // Draw initial preview
      this.drawShapePreview();
    } else if (this.drawingMode === 'eraser') {
      // Erase strokes at this point
      console.log('Starting erase at point:', point);
      this.eraseAtPoint(point);
    } else if (this.drawingMode === 'lasso') {
      // Start lasso selection
      this.startLassoSelection(point);
    } else if (this.drawingMode === 'zoomDrag') {
      // Start zoom drag rectangle
      this.startZoomDragSelection(point);
    }

    event.preventDefault();
    event.stopPropagation();
  }

  private continueDrawing(event: MouseEvent) {
    if (!this.isDrawing || this.drawingMode === 'pan') return;

    const point = this.getDrawingPoint(event);

    if (this.drawingMode === 'pencil' && this.currentStroke) {
      // Add point to current stroke
      this.currentStroke.points.push(point);
      this.updateCurrentStrokePath();
    } else if (
      (this.drawingMode === 'rectangle' ||
        this.drawingMode === 'circle' ||
        this.drawingMode === 'arrow') &&
      this.currentShape
    ) {
      // Update preview end
      let endPoint = point;

      // Apply constraints for rectangle (make it a square)
      if (this.drawingMode === 'rectangle' && this.rectangleConstrained) {
        const dx = point.x - this.currentShape.start.x;
        const dy = point.y - this.currentShape.start.y;
        const size = Math.max(Math.abs(dx), Math.abs(dy));
        endPoint = {
          x: this.currentShape.start.x + (dx >= 0 ? size : -size),
          y: this.currentShape.start.y + (dy >= 0 ? size : -size),
        };
      }

      // Apply constraints for circle (make it a perfect circle)
      if (this.drawingMode === 'circle' && this.circleConstrained) {
        const dx = point.x - this.currentShape.start.x;
        const dy = point.y - this.currentShape.start.y;
        const radius = Math.max(Math.abs(dx), Math.abs(dy));
        endPoint = {
          x: this.currentShape.start.x + (dx >= 0 ? radius : -radius),
          y: this.currentShape.start.y + (dy >= 0 ? radius : -radius),
        };
      }

      this.currentShape.end = endPoint;
      this.drawShapePreview();
    } else if (this.drawingMode === 'eraser') {
      // Continue erasing
      this.eraseAtPoint(point);
    } else if (this.drawingMode === 'lasso') {
      // Continue lasso selection
      this.continueLassoSelection(point);
    } else if (this.drawingMode === 'zoomDrag') {
      // Continue zoom drag rectangle
      this.continueZoomDragSelection(point);
    }

    event.preventDefault();
    event.stopPropagation();
  }

  private endDrawing(event?: MouseEvent) {
    if (!this.isDrawing) return;

    this.isDrawing = false;

    if (this.drawingMode === 'pencil' && this.currentStroke) {
      // Dispatch the stroke to NGXS state (which will trigger history save)
      console.log(
        'endDrawing: Dispatching AddStroke with:',
        this.currentStroke,
      );
      this.store.dispatch(new SketchActions.AddStroke(this.currentStroke));
      this.currentStroke = null;
      // strokes array and redraw will be updated via state subscription
      // Update computed properties after adding a stroke
      this.updateComputedProperties();
    } else if (this.drawingMode === 'lasso') {
      // Finalize lasso selection
      this.endLassoSelection();
    } else if (this.drawingMode === 'zoomDrag') {
      // Finalize zoom drag and perform zoom/pan
      this.endZoomDragSelection(event);
    } else if (
      (this.drawingMode === 'rectangle' ||
        this.drawingMode === 'circle' ||
        this.drawingMode === 'arrow') &&
      this.currentShape
    ) {
      // Commit the shape to NGXS state
      console.log('endDrawing: Dispatching AddShape with:', this.currentShape);
      this.store.dispatch(new SketchActions.AddShape(this.currentShape));
      this.currentShape = null;
      // Clear preview (shapes will be redrawn by state subscription)
      if (this.drawingLayer)
        this.drawingLayer.selectAll('.current-shape').remove();
    }
  }

  private drawShapePreview() {
    if (!this.drawingLayer || !this.currentShape) return;

    // Remove existing previews
    this.drawingLayer.selectAll('.current-shape').remove();

    const s = this.currentShape.start;
    const e = this.currentShape.end;
    const x = Math.min(s.x, e.x);
    const y = Math.min(s.y, e.y);
    const w = Math.abs(e.x - s.x);
    const h = Math.abs(e.y - s.y);

    if (this.currentShape.type === 'rectangle') {
      // Determine fill and stroke based on fill mode
      let fill = 'none';
      let stroke = this.currentShape.stroke;
      let strokeWidth = this.currentShape.strokeWidth;
      let strokeDasharray = 'none';

      if (this.shapeFillMode === 'filled') {
        fill = this.currentShape.fill || this.shapeFillColor;
        stroke = 'none';
        strokeWidth = 0;
      } else if (this.shapeFillMode === 'outline') {
        fill = 'none';
        strokeDasharray = '5,5'; // Dashed stroke for outline-only mode during preview
      } else if (this.shapeFillMode === 'filled-outline') {
        fill = this.currentShape.fill || this.shapeFillColor;
      }

      this.drawingLayer
        .append('rect')
        .attr('class', 'current-shape')
        .attr('x', x)
        .attr('y', y)
        .attr('width', w)
        .attr('height', h)
        .attr('fill', fill)
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth)
        .attr('stroke-dasharray', strokeDasharray);
    } else if (this.currentShape.type === 'circle') {
      const cx = (s.x + e.x) / 2;
      const cy = (s.y + e.y) / 2;
      const rx = w / 2;
      const ry = h / 2;

      // Determine fill and stroke based on fill mode
      let fill = 'none';
      let stroke = this.currentShape.stroke;
      let strokeWidth = this.currentShape.strokeWidth;
      let strokeDasharray = 'none';

      if (this.shapeFillMode === 'filled') {
        fill = this.currentShape.fill || this.shapeFillColor;
        stroke = 'none';
        strokeWidth = 0;
      } else if (this.shapeFillMode === 'outline') {
        fill = 'none';
        strokeDasharray = '5,5'; // Dashed stroke for outline-only mode during preview
      } else if (this.shapeFillMode === 'filled-outline') {
        fill = this.currentShape.fill || this.shapeFillColor;
      }

      this.drawingLayer
        .append('ellipse')
        .attr('class', 'current-shape')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('rx', rx)
        .attr('ry', ry)
        .attr('fill', fill)
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth)
        .attr('stroke-dasharray', strokeDasharray);
    } else if (this.currentShape.type === 'arrow') {
      // Draw simple line with arrowhead (triangle)
      const x1 = s.x;
      const y1 = s.y;
      const x2 = e.x;
      const y2 = e.y;
      // Line
      this.drawingLayer
        .append('line')
        .attr('class', 'current-shape')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', this.currentShape.stroke)
        .attr('stroke-width', this.currentShape.strokeWidth)
        .attr('stroke-linecap', 'round');
      // Arrowhead - simple triangle at end
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const size = this.currentShape.arrowSize || 12;
      const p1x = x2;
      const p1y = y2;
      const p2x = x2 - size * Math.cos(angle - Math.PI / 6);
      const p2y = y2 - size * Math.sin(angle - Math.PI / 6);
      const p3x = x2 - size * Math.cos(angle + Math.PI / 6);
      const p3y = y2 - size * Math.sin(angle + Math.PI / 6);

      // Use arrow fill color, fallback to stroke color if not set
      const arrowheadFill =
        this.currentShape.fill ||
        this.arrowFillColor ||
        this.currentShape.stroke ||
        '#000';

      this.drawingLayer
        .append('polygon')
        .attr('class', 'current-shape')
        .attr('points', `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`)
        .attr('fill', arrowheadFill)
        .attr('stroke', 'none');
    }
  }

  private redrawShapes() {
    if (!this.drawingLayer) return;
    console.log('redrawShapes called with', this.shapes.length, 'shapes');
    // Remove existing shapes
    this.drawingLayer.selectAll('.committed-shape').remove();

    this.shapes.forEach((shape) => {
      if (shape.type === 'rectangle') {
        const s = shape.start;
        const e = shape.end;
        const x = Math.min(s.x, e.x);
        const y = Math.min(s.y, e.y);
        const w = Math.abs(e.x - s.x);
        const h = Math.abs(e.y - s.y);

        // Determine fill and stroke based on shape's fill mode
        const fillMode = shape.fillMode || 'filled-outline';
        let fill = 'none';
        let stroke = shape.stroke;
        let strokeWidth = shape.strokeWidth;

        if (fillMode === 'filled') {
          fill = shape.fill;
          stroke = 'none';
          strokeWidth = 0;
        } else if (fillMode === 'outline') {
          fill = 'none';
        } else if (fillMode === 'filled-outline') {
          fill = shape.fill;
        }

        console.log(
          'Rendering rectangle - fillMode:',
          fillMode,
          'fill:',
          fill,
          'stroke:',
          stroke,
          'shape.fill:',
          shape.fill,
          'shape.stroke:',
          shape.stroke,
        );

        this.drawingLayer
          .append('rect')
          .attr('class', 'committed-shape')
          .attr('data-shape-id', shape.id)
          .attr('x', x)
          .attr('y', y)
          .attr('width', w)
          .attr('height', h)
          .attr('fill', fill)
          .attr('fill-opacity', 1)
          .attr('stroke', stroke)
          .attr('stroke-width', strokeWidth)
          .attr('shape-rendering', 'geometricPrecision')
          .style('pointer-events', 'all')
          .style('mix-blend-mode', 'normal');
      } else if (shape.type === 'circle') {
        const s = shape.start;
        const e = shape.end;
        const cx = (s.x + e.x) / 2;
        const cy = (s.y + e.y) / 2;
        const rx = Math.abs(e.x - s.x) / 2;
        const ry = Math.abs(e.y - s.y) / 2;

        // Determine fill and stroke based on shape's fill mode
        const fillMode = shape.fillMode || 'filled-outline';
        let fill = 'none';
        let stroke = shape.stroke;
        let strokeWidth = shape.strokeWidth;

        if (fillMode === 'filled') {
          fill = shape.fill;
          stroke = 'none';
          strokeWidth = 0;
        } else if (fillMode === 'outline') {
          fill = 'none';
        } else if (fillMode === 'filled-outline') {
          fill = shape.fill;
        }

        this.drawingLayer
          .append('ellipse')
          .attr('class', 'committed-shape')
          .attr('data-shape-id', shape.id)
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('rx', rx)
          .attr('ry', ry)
          .attr('fill', fill)
          .attr('fill-opacity', 1)
          .attr('stroke', stroke)
          .attr('stroke-width', strokeWidth)
          .attr('shape-rendering', 'geometricPrecision')
          .style('pointer-events', 'all')
          .style('mix-blend-mode', 'normal');
      } else if (shape.type === 'arrow') {
        const s = shape.start;
        const e = shape.end;
        this.drawingLayer
          .append('line')
          .attr('class', 'committed-shape')
          .attr('data-shape-id', shape.id)
          .attr('x1', s.x)
          .attr('y1', s.y)
          .attr('x2', e.x)
          .attr('y2', e.y)
          .attr('stroke', shape.stroke)
          .attr('stroke-opacity', 1)
          .attr('stroke-width', shape.strokeWidth)
          .attr('stroke-linecap', 'round')
          .attr('shape-rendering', 'geometricPrecision')
          .style('pointer-events', 'all')
          .style('mix-blend-mode', 'normal');
        const angle = Math.atan2(e.y - s.y, e.x - s.x);
        const size = shape.arrowSize || 12;
        const p1x = e.x;
        const p1y = e.y;
        const p2x = e.x - size * Math.cos(angle - Math.PI / 6);
        const p2y = e.y - size * Math.sin(angle - Math.PI / 6);
        const p3x = e.x - size * Math.cos(angle + Math.PI / 6);
        const p3y = e.y - size * Math.sin(angle + Math.PI / 6);
        this.drawingLayer
          .append('polygon')
          .attr('class', 'committed-shape')
          .attr('data-shape-id', shape.id)
          .attr('points', `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`)
          .attr('fill', shape.fill || shape.stroke || '#000')
          .attr('fill-opacity', 1)
          .attr('stroke', 'none')
          .attr('shape-rendering', 'geometricPrecision')
          .style('pointer-events', 'all')
          .style('mix-blend-mode', 'normal');
      } else if (shape.type === 'text') {
        const s = shape.start;
        this.drawingLayer
          .append('text')
          .attr('class', 'committed-shape')
          .attr('data-shape-id', shape.id)
          .attr('x', s.x)
          .attr('y', s.y)
          .attr('fill', shape.textColor || '#000')
          .attr('fill-opacity', 1)
          .attr('font-size', shape.fontSize || 16)
          .attr('font-family', shape.fontFamily || 'Arial')
          .attr('shape-rendering', 'geometricPrecision')
          .style('pointer-events', 'all')
          .style('mix-blend-mode', 'normal')
          .text(shape.text || '');
      }
    });
  }

  // Alt+drag rotation methods
  private startRotationDrag(event: MouseEvent) {
    // Use VisualizationInteractionService for rotation handling
    const dimensions = { width: this.width, height: this.height };

    this.visualizationInteractionService
      .handleRotationDrag(event, this.rotationAngle, dimensions)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newRotation) => {
          this.rotationAngle = Math.round(newRotation);
          this.currentRotation = (this.rotationAngle * Math.PI) / 180;

          // Update the rotation control indicator
          this.updateRotationControlIndicator();

          // Update the wheel indicator if it exists
          if (
            this.wheelIndicator &&
            this.wheelCenterX &&
            this.wheelCenterY &&
            this.wheelRadius
          ) {
            this.updateWheelIndicator(
              this.wheelIndicator,
              this.wheelCenterX,
              this.wheelCenterY,
              this.wheelRadius,
            );
          }

          // Apply the transform
          this.applyTransform();

          // Update selected node text info
          this.updateSelectedNodeTextInfo();
        },
        complete: () => {
          this.isRotationDragging = false;
        },
      });

    this.isRotationDragging = true;
    this.rotationDragStartAngle = this.rotationAngle;
    this.rotationDragStartX = event.clientX;
    this.rotationDragStartY = event.clientY;

    // Prevent default to avoid any unwanted behaviors
    event.preventDefault();
    event.stopPropagation();
  }

  private continueRotationDrag(event: MouseEvent) {
    if (!this.isRotationDragging) return;

    // Calculate horizontal movement and convert to rotation
    const deltaX = event.clientX - this.rotationDragStartX;

    // Scale the movement - adjust this value to control sensitivity
    // Positive deltaX (moving right) = clockwise rotation (positive degrees)
    const rotationSensitivity = 1.0; // degrees per pixel
    const deltaAngle = deltaX * rotationSensitivity;

    // Calculate new rotation angle
    let newAngle = this.rotationDragStartAngle + deltaAngle;

    // Normalize angle to 0-359 range
    newAngle = ((newAngle % 360) + 360) % 360;

    // Update rotation
    this.rotationAngle = Math.round(newAngle);
    this.currentRotation = (this.rotationAngle * Math.PI) / 180;

    // Update the rotation control indicator
    this.updateRotationControlIndicator();

    // Update the wheel indicator if it exists
    if (
      this.wheelIndicator &&
      this.wheelCenterX &&
      this.wheelCenterY &&
      this.wheelRadius
    ) {
      this.updateWheelIndicator(
        this.wheelIndicator,
        this.wheelCenterX,
        this.wheelCenterY,
        this.wheelRadius,
      );
    }

    // Apply rotation to the tree
    this.applyTransform();

    // Update selected node text info
    this.updateSelectedNodeTextInfo();
  }

  private endRotationDrag() {
    this.isRotationDragging = false;
  }

  private getDrawingPoint(event: MouseEvent): { x: number; y: number } {
    // Get the mouse position relative to the SVG element
    const svgElement = this.svgRef.nativeElement;
    const point = svgElement.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    // Transform the point through the inverse of the current transform
    // This accounts for zoom, pan, and rotation
    const ctm = this.g.node()?.getScreenCTM();
    if (ctm) {
      const transformedPoint = point.matrixTransform(ctm.inverse());
      return { x: transformedPoint.x, y: transformedPoint.y };
    }

    // Fallback if CTM is not available
    const rect = svgElement.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private updateCurrentStrokePath() {
    if (!this.currentStroke) return;

    const pathData = this.createPathData(this.currentStroke.points);

    // Remove existing current stroke path
    this.drawingLayer.selectAll('.current-stroke').remove();

    // Draw current stroke
    this.drawingLayer
      .append('path')
      .attr('class', 'current-stroke')
      .attr('d', pathData)
      .attr('fill', 'none')
      .attr('stroke', this.currentStroke.color)
      .attr('stroke-width', this.currentStroke.width)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');
  }

  private createPathData(points: { x: number; y: number }[]): string {
    if (points.length < 2) return '';

    const line = d3
      .line<{ x: number; y: number }>()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(d3.curveCardinal.tension(0.5));

    return line(points) || '';
  }

  private eraseAtPoint(point: { x: number; y: number }) {
    const eraserRadius = this.eraserSize / 2;
    const initialStrokeCount = this.strokes.length;
    const initialShapeCount = this.shapes.length;

    console.log(
      `${this.eraserMode} eraser at point (${point.x.toFixed(
        2,
      )}, ${point.y.toFixed(
        2,
      )}) with radius ${eraserRadius}, checking ${initialStrokeCount} strokes and ${initialShapeCount} shapes`,
    );

    // Check if eraser intersects any shapes
    const shapesToDelete: string[] = [];
    this.shapes.forEach((shape) => {
      if (this.shapeIntersectsCircle(shape, point, eraserRadius)) {
        console.log(
          `Eraser intersects shape ${shape.id} (${shape.type}), marking for deletion`,
        );
        shapesToDelete.push(shape.id);
      }
    });

    // Delete intersecting shapes via NGXS
    shapesToDelete.forEach((shapeId) => {
      this.store.dispatch(new SketchActions.DeleteShape(shapeId));
    });

    if (this.eraserMode === 'magic') {
      // Magic eraser: Remove entire strokes that intersect
      const filteredStrokes = this.strokes.filter((stroke) => {
        const intersects = this.strokeIntersectsCircle(
          stroke,
          point,
          eraserRadius,
        );
        if (intersects) {
          console.log(
            `Magic erasing entire stroke ${stroke.id} with ${stroke.points.length} points`,
          );
        }
        return !intersects;
      });
      // Dispatch updated strokes to state
      this.store.dispatch(new SketchActions.SetStrokes(filteredStrokes));
    } else {
      // Normal eraser: Partially erase strokes, splitting them if needed
      const newStrokes: DrawingStroke[] = [];

      this.strokes.forEach((stroke) => {
        const resultStrokes = this.partiallyEraseStroke(
          stroke,
          point,
          eraserRadius,
        );
        newStrokes.push(...resultStrokes);
      });

      // Dispatch updated strokes to state
      this.store.dispatch(new SketchActions.SetStrokes(newStrokes));
    }

    const finalStrokeCount = this.strokes.length;
    if (finalStrokeCount !== initialStrokeCount || shapesToDelete.length > 0) {
      console.log(
        `Erased operation: strokes ${initialStrokeCount} → ${finalStrokeCount}, shapes deleted: ${shapesToDelete.length}`,
      );
      // Save history after erasing
      this.store.dispatch(new SketchActions.SaveHistory());
    } else {
      console.log(`No strokes or shapes modified`);
    }

    // redrawStrokes will be called via state subscription
  }

  private strokeIntersectsCircle(
    stroke: DrawingStroke,
    center: { x: number; y: number },
    radius: number,
  ): boolean {
    // Check if any point in the stroke is within the eraser circle
    return stroke.points.some((point) => {
      const dx = point.x - center.x;
      const dy = point.y - center.y;
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    });
  }

  private shapeIntersectsCircle(
    shape: any,
    center: { x: number; y: number },
    radius: number,
  ): boolean {
    // Check if the eraser circle intersects with the shape
    if (shape.type === 'rectangle') {
      const x1 = Math.min(shape.start.x, shape.end.x);
      const y1 = Math.min(shape.start.y, shape.end.y);
      const x2 = Math.max(shape.start.x, shape.end.x);
      const y2 = Math.max(shape.start.y, shape.end.y);

      // Find closest point on rectangle to circle center
      const closestX = Math.max(x1, Math.min(center.x, x2));
      const closestY = Math.max(y1, Math.min(center.y, y2));

      const dx = center.x - closestX;
      const dy = center.y - closestY;
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    } else if (shape.type === 'circle') {
      // Check if eraser circle intersects with ellipse
      const cx = (shape.start.x + shape.end.x) / 2;
      const cy = (shape.start.y + shape.end.y) / 2;
      const rx = Math.abs(shape.end.x - shape.start.x) / 2;
      const ry = Math.abs(shape.end.y - shape.start.y) / 2;

      // Approximate: check if eraser center is close to ellipse center
      const dx = center.x - cx;
      const dy = center.y - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check if within ellipse or close to its perimeter
      const normalizedDist = Math.sqrt(
        (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry),
      );
      return normalizedDist <= 1 + radius / Math.max(rx, ry);
    } else if (shape.type === 'arrow') {
      // Check if eraser intersects with arrow line
      const x1 = shape.start.x;
      const y1 = shape.start.y;
      const x2 = shape.end.x;
      const y2 = shape.end.y;

      // Calculate distance from point to line segment
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lengthSquared = dx * dx + dy * dy;

      if (lengthSquared === 0) {
        // Start and end are the same point
        const dist = Math.sqrt((center.x - x1) ** 2 + (center.y - y1) ** 2);
        return dist <= radius;
      }

      const t = Math.max(
        0,
        Math.min(
          1,
          ((center.x - x1) * dx + (center.y - y1) * dy) / lengthSquared,
        ),
      );
      const closestX = x1 + t * dx;
      const closestY = y1 + t * dy;
      const distance = Math.sqrt(
        (center.x - closestX) ** 2 + (center.y - closestY) ** 2,
      );
      return distance <= radius;
    } else if (shape.type === 'text') {
      // Check if eraser intersects with text position
      const textX = shape.start.x;
      const textY = shape.start.y;
      const fontSize = shape.fontSize || 16;

      // Approximate text bounds (rough estimate)
      const textWidth = (shape.text?.length || 0) * fontSize * 0.6;
      const textHeight = fontSize;

      // Check if circle intersects text bounding box
      const closestX = Math.max(textX, Math.min(center.x, textX + textWidth));
      const closestY = Math.max(textY - textHeight, Math.min(center.y, textY));

      const dx = center.x - closestX;
      const dy = center.y - closestY;
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    }

    return false;
  }

  private partiallyEraseStroke(
    stroke: DrawingStroke,
    center: { x: number; y: number },
    radius: number,
  ): DrawingStroke[] {
    // Split stroke into segments, keeping only points outside the eraser circle
    const segments: { x: number; y: number }[][] = [];
    let currentSegment: { x: number; y: number }[] = [];

    stroke.points.forEach((point, index) => {
      const dx = point.x - center.x;
      const dy = point.y - center.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const isInEraser = distance <= radius;

      if (!isInEraser) {
        // Point is outside eraser, add to current segment
        currentSegment.push(point);
      } else {
        // Point is inside eraser
        if (currentSegment.length > 0) {
          // Save current segment if it has points
          segments.push([...currentSegment]);
          currentSegment = [];
        }
      }
    });

    // Add final segment if it exists
    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }

    // Convert segments back to strokes
    const resultStrokes: DrawingStroke[] = [];
    segments.forEach((segment, segmentIndex) => {
      if (segment.length >= 2) {
        // Only create strokes with at least 2 points
        const newStroke: DrawingStroke = {
          id: `${stroke.id}-segment-${segmentIndex}`,
          points: segment,
          color: stroke.color,
          size: stroke.size,
          width: stroke.width,
          mode: stroke.mode,
        };
        resultStrokes.push(newStroke);
        console.log(
          `Created segment ${newStroke.id} with ${segment.length} points`,
        );
      }
    });

    if (resultStrokes.length === 0 && stroke.points.length > 0) {
      console.log(`Stroke ${stroke.id} completely erased`);
    } else if (resultStrokes.length > 1) {
      console.log(
        `Stroke ${stroke.id} split into ${resultStrokes.length} segments`,
      );
    } else if (resultStrokes.length === 1) {
      console.log(
        `Stroke ${stroke.id} partially erased, keeping ${resultStrokes[0].points.length} points`,
      );
    }

    return resultStrokes;
  }

  private redrawStrokes() {
    console.log(`=== REDRAW STROKES START ===`);
    console.log(`Strokes to draw: ${this.strokes.length}`);

    if (!this.svgRef?.nativeElement || !this.drawingLayer) {
      console.log('SVG or drawing layer not yet initialized, skipping redraw');
      return;
    }

    // Clear ALL drawing-related paths (both stroke-path and current-stroke)
    const existingStrokePaths = this.drawingLayer.selectAll('.stroke-path');
    const existingCurrentStrokes =
      this.drawingLayer.selectAll('.current-stroke');
    console.log(`Removing ${existingStrokePaths.size()} existing stroke paths`);
    console.log(
      `Removing ${existingCurrentStrokes.size()} existing current strokes`,
    );

    existingStrokePaths.remove();
    existingCurrentStrokes.remove();

    // Also clear any other paths that might be in the drawing layer
    const allPaths = this.drawingLayer.selectAll('path');
    console.log(
      `Total paths in drawing layer before cleanup: ${allPaths.size()}`,
    );
    allPaths.remove();

    // Draw all strokes
    let drawnCount = 0;
    this.strokes.forEach((stroke, index) => {
      console.log(
        `Processing stroke ${index}: ${stroke.id} with ${stroke.points.length} points`,
      );
      const pathData = this.createPathData(stroke.points);
      if (pathData) {
        const newPath = this.drawingLayer
          .append('path')
          .attr('class', 'stroke-path')
          .attr('d', pathData)
          .attr('fill', 'none')
          .attr('stroke', stroke.color)
          .attr('stroke-width', stroke.width)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round');
        console.log(`Created path for stroke ${stroke.id}`);
        drawnCount++;
      } else {
        console.warn(`No path data generated for stroke ${stroke.id}`);
      }
    });

    // Final verification
    const finalPaths = this.drawingLayer.selectAll('path');
    console.log(`Final path count in drawing layer: ${finalPaths.size()}`);
    console.log(`Successfully drew ${drawnCount} stroke paths`);
    console.log(`=== REDRAW STROKES COMPLETE ===`);
  }

  // Lasso selection methods
  private startLassoSelection(point: { x: number; y: number }) {
    console.log('Starting lasso selection at:', point);
    this.isLassoActive = true;
    this.lassoPath = [point];
    this.drawLassoPath();
  }

  private continueLassoSelection(point: { x: number; y: number }) {
    if (!this.isLassoActive) return;

    this.lassoPath.push(point);
    this.drawLassoPath();
  }

  private endLassoSelection() {
    if (!this.isLassoActive) return;

    console.log('Ending lasso selection with', this.lassoPath.length, 'points');
    this.isLassoActive = false;

    // Close the lasso path
    if (this.lassoPath.length > 2) {
      this.lassoPath.push(this.lassoPath[0]);
    }

    // Select nodes inside the lasso
    this.selectNodesInLasso();

    // Clear the lasso path visual
    this.clearLassoPath();
    this.lassoPath = [];
  }

  private drawLassoPath() {
    if (!this.drawingLayer || this.lassoPath.length < 2) return;

    // Remove existing lasso path
    this.drawingLayer.selectAll('.lasso-path').remove();

    // Create path data
    const pathData = this.createPathData(this.lassoPath);
    if (!pathData) return;

    // Choose color based on lasso mode
    const strokeColor = this.colorsService.getLassoColor(this.lassoMode);
    const strokeDash = this.lassoMode === 'select' ? '5,5' : '10,3';

    // Draw lasso path
    this.drawingLayer
      .append('path')
      .attr('class', 'lasso-path')
      .attr('d', pathData)
      .attr('fill', 'none')
      .attr('stroke', strokeColor)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', strokeDash)
      .attr('opacity', 0.8);
  }

  private clearLassoPath() {
    if (this.drawingLayer) {
      this.drawingLayer.selectAll('.lasso-path').remove();
    }
  }

  private selectNodesInLasso() {
    if (this.lassoPath.length < 3) {
      console.log('Lasso path too short:', this.lassoPath.length);
      return;
    }

    console.log('Starting lasso selection with path:', this.lassoPath);
    const nodesToSelect: string[] = [];

    // Get all tree node groups (new visualization system structure)
    const nodeGroups = this.g.selectAll('.tree-node-group');
    console.log('Found tree node groups:', nodeGroups.size());

    nodeGroups.each((d: any, i: number, nodeArray: any) => {
      const nodeGroup = nodeArray[i];
      const nodeId = d.id;

      // Get node position from transform attribute
      const transform = nodeGroup.getAttribute('transform');
      let x = 0,
        y = 0;

      if (transform) {
        const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        if (match) {
          x = parseFloat(match[1]);
          y = parseFloat(match[2]);
        }
      }

      console.log(`Checking tree node ${nodeId} at position (${x}, ${y})`);

      // Check if node is inside lasso path
      if (this.isPointInPolygon({ x: x, y: y }, this.lassoPath)) {
        console.log(`Tree node ${nodeId} is inside lasso!`);
        nodesToSelect.push(nodeId);
      } else {
        console.log(`Node ${nodeId} is outside lasso`);
      }
    });

    console.log(`Found ${nodesToSelect.length} nodes in lasso:`, nodesToSelect);
    console.log('Current selectedNodes before lasso:', this.selectedNodes);
    console.log(`Lasso mode: ${this.lassoMode}`);

    // Process nodes based on lasso mode
    nodesToSelect.forEach((nodeId, index) => {
      console.log(
        `\n=== Processing node ${index + 1}/${
          nodesToSelect.length
        }: ${nodeId} (${this.lassoMode} mode) ===`,
      );
      console.log('Current selectedNodes array:', this.selectedNodes);

      const isAlreadySelected = this.selectedNodes.includes(nodeId);
      console.log(`Node ${nodeId} already selected?`, isAlreadySelected);

      if (this.lassoMode === 'select') {
        // Select mode: only add nodes that aren't already selected
        if (!isAlreadySelected) {
          console.log(`Adding node ${nodeId} via toggleNodeSelection...`);
          this.toggleNodeSelection(nodeId);
          console.log(
            `After toggleNodeSelection, selectedNodes:`,
            this.selectedNodes,
          );
        } else {
          console.log(`Node ${nodeId} already selected, skipping duplicate`);
        }
      } else if (this.lassoMode === 'deselect') {
        // Deselect mode: only remove nodes that are currently selected
        if (isAlreadySelected) {
          console.log(`Removing node ${nodeId} via toggleNodeSelection...`);
          this.toggleNodeSelection(nodeId);
          console.log(
            `After toggleNodeSelection, selectedNodes:`,
            this.selectedNodes,
          );
        } else {
          console.log(`Node ${nodeId} not selected, nothing to remove`);
        }
      }
    });

    console.log('=== LASSO SELECTION COMPLETE ===');
    console.log('Selected nodes array:', this.selectedNodes);
    console.log('Selected nodes count:', this.selectedNodes.length);
    console.log('Selected nodes string:', this.selectedNodes.join(', '));
    console.log('====================================');

    // Force visual update of node selections
    this.updateNodeSelectionVisuals();
    this.cdr.detectChanges();
  }

  private isPointInPolygon(
    point: { x: number; y: number },
    polygon: { x: number; y: number }[],
  ): boolean {
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (
        polygon[i].y > point.y !== polygon[j].y > point.y &&
        point.x <
          ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) /
            (polygon[j].y - polygon[i].y) +
            polygon[i].x
      ) {
        inside = !inside;
      }
    }

    return inside;
  }

  // Zoom drag methods
  private startZoomDragSelection(point: { x: number; y: number }) {
    console.log('Starting zoom drag at:', point);
    this.zoomDragStart = point;
    this.zoomDragEnd = point;
    this.drawZoomDragRectangle();
  }

  private continueZoomDragSelection(point: { x: number; y: number }) {
    if (!this.zoomDragStart) return;
    this.zoomDragEnd = point;
    this.drawZoomDragRectangle();
  }

  private endZoomDragSelection(event?: MouseEvent) {
    if (!this.zoomDragStart || !this.zoomDragEnd) {
      this.clearZoomDragRectangle();
      this.zoomDragStart = null;
      this.zoomDragEnd = null;
      return;
    }

    // Check if CTRL key is held
    const isCtrlHeld = event?.ctrlKey || false;

    // Calculate the distance between start and end to detect a click vs drag
    const dx = Math.abs(this.zoomDragEnd.x - this.zoomDragStart.x);
    const dy = Math.abs(this.zoomDragEnd.y - this.zoomDragStart.y);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const isClick = distance < 5; // Threshold for considering it a click

    if (isClick) {
      // Simple click - just zoom in/out at current center, don't pan
      console.log(
        `Zoom click detected${isCtrlHeld ? ' (CTRL - zoom out)' : ' (zoom in)'}`,
      );

      // Zoom in by 0.30 or zoom out by 0.30 if CTRL is held
      if (isCtrlHeld) {
        this.zoomLevel -= 0.3;
        // Prevent zoom from going too low
        if (this.zoomLevel < 0.1) {
          this.zoomLevel = 0.1;
        }
      } else {
        this.zoomLevel += 0.3;
      }
    } else {
      // Rectangle drag - pan to center and zoom
      console.log(
        `Zoom drag detected${isCtrlHeld ? ' (CTRL - zoom out)' : ' (zoom in)'}`,
      );

      // Calculate center of the rectangle
      const centerX = (this.zoomDragStart.x + this.zoomDragEnd.x) / 2;
      const centerY = (this.zoomDragStart.y + this.zoomDragEnd.y) / 2;

      // Calculate the pan offset needed to center this point
      // The center of the viewport is (width/2, height/2)
      const viewportCenterX = this.width / 2;
      const viewportCenterY = this.height / 2;

      // Pan to center the rectangle's center
      this.panX = viewportCenterX - centerX;
      this.panY = viewportCenterY - centerY;

      // Zoom in by 0.30 or zoom out by 0.30 if CTRL is held
      if (isCtrlHeld) {
        this.zoomLevel -= 0.3;
        // Prevent zoom from going too low
        if (this.zoomLevel < 0.1) {
          this.zoomLevel = 0.1;
        }
      } else {
        this.zoomLevel += 0.3;
      }
    }

    // Apply the transform
    this.applyTransform();

    // Update D3 zoom transform state
    const transform = d3.zoomIdentity
      .translate(this.panX, this.panY)
      .scale(this.zoomLevel);
    this.svg.call(this.zoom.transform, transform);

    console.log(`Zoom level now: ${this.zoomLevel}`);

    // Clear the zoom drag rectangle
    this.clearZoomDragRectangle();
    this.zoomDragStart = null;
    this.zoomDragEnd = null;
  }

  private drawZoomDragRectangle() {
    if (!this.drawingLayer || !this.zoomDragStart || !this.zoomDragEnd) return;

    // Remove existing zoom drag rectangle
    this.drawingLayer.selectAll('.zoom-drag-rect').remove();

    const x = Math.min(this.zoomDragStart.x, this.zoomDragEnd.x);
    const y = Math.min(this.zoomDragStart.y, this.zoomDragEnd.y);
    const width = Math.abs(this.zoomDragEnd.x - this.zoomDragStart.x);
    const height = Math.abs(this.zoomDragEnd.y - this.zoomDragStart.y);

    // Draw zoom drag rectangle with distinctive styling
    this.drawingLayer
      .append('rect')
      .attr('class', 'zoom-drag-rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'rgba(0, 123, 255, 0.1)')
      .attr('stroke', '#007bff')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.8);
  }

  private clearZoomDragRectangle() {
    if (this.drawingLayer) {
      this.drawingLayer.selectAll('.zoom-drag-rect').remove();
    }
  }

  // Drawing mode and tool methods
  setDrawingMode(
    mode:
      | 'pencil'
      | 'eraser'
      | 'pan'
      | 'select'
      | 'lasso'
      | 'relatedNodes'
      | 'rectangle'
      | 'circle'
      | 'arrow'
      | 'text'
      | 'zoomDrag',
  ) {
    console.log(`Setting drawing mode from ${this.drawingMode} to ${mode}`);

    // Clear single node selection when switching away from pan mode
    if (this.drawingMode === 'pan' && mode !== 'pan' && this.selectedNode) {
      console.log(
        `Clearing single node selection when switching from pan to ${mode}`,
      );
      this.selectedNode = null;
      this.updateNodeSelectionVisuals();
    }

    this.drawingMode = mode;
    this.isDrawing = false;
    this.currentStroke = null;

    // Update cursor style based on mode
    const svgElement = this.svgRef.nativeElement;
    if (mode === 'pencil') {
      svgElement.style.cursor = 'crosshair';
    } else if (mode === 'eraser') {
      // Different cursor for different eraser modes
      svgElement.style.cursor =
        this.eraserMode === 'magic' ? 'cell' : 'pointer';
    } else if (mode === 'select') {
      svgElement.style.cursor = 'pointer';
    } else if (mode === 'relatedNodes') {
      svgElement.style.cursor = 'pointer';
    } else if (mode === 'lasso') {
      svgElement.style.cursor = 'crosshair';
    } else if (mode === 'zoomDrag') {
      svgElement.style.cursor = 'zoom-in';
    } else {
      svgElement.style.cursor = 'grab';
    }

    console.log(`Drawing mode set to ${this.drawingMode}, cursor updated`);
  }

  setLassoMode(mode: 'select' | 'deselect') {
    console.log(`Setting lasso mode from ${this.lassoMode} to ${mode}`);
    this.lassoMode = mode;
  }

  selectColor(color: string) {
    this.colorsService.setSelectedDrawingColor(color);
  }

  // Handlers for selection-tools drawing modifier events
  updateShapeStrokeWidthHandler(event: Event) {
    const target = event.target as HTMLInputElement;
    this.shapeStrokeWidth = Number(target.value) || 1;
  }

  updateShapeStrokeColorHandler(color: string) {
    this.shapeStrokeColor = color;
  }

  updateShapeFillColorHandler(color: string) {
    this.shapeFillColor = color;
  }

  updateShapeFillModeHandler(mode: 'outline' | 'filled' | 'filled-outline') {
    this.shapeFillMode = mode;
  }

  toggleRectangleConstrainedHandler() {
    this.rectangleConstrained = !this.rectangleConstrained;
  }

  toggleCircleConstrainedHandler() {
    this.circleConstrained = !this.circleConstrained;
  }

  updateArrowSizeHandler(event: Event) {
    const target = event.target as HTMLInputElement;
    this.arrowSize = Number(target.value) || 20;
  }

  updateArrowStrokeColorHandler(color: string) {
    this.arrowStrokeColor = color;
  }

  updateArrowFillColorHandler(color: string) {
    this.arrowFillColor = color;
  }

  updateTextFontSizeHandler(event: Event) {
    const target = event.target as HTMLInputElement;
    this.textFontSize = Number(target.value) || 12;
  }

  updateTextColorHandler(color: string) {
    this.textColor = color;
  }

  toggleTextBoldHandler() {
    this.textBold = !this.textBold;
  }

  toggleTextItalicHandler() {
    this.textItalic = !this.textItalic;
  }

  toggleTextStrikethroughHandler() {
    this.textStrikethrough = !this.textStrikethrough;
  }

  updateTextFontFamilyHandler(font: string) {
    this.textFontFamily = font;
  }

  updateScreenshotFormat(format: 'png' | 'jpg') {
    this.screenshotFormat = format;
  }

  updateScreenshotTarget(target: 'clipboard' | 'download') {
    this.screenshotTarget = target;
  }

  clearDrawing() {
    console.log('=== CLEAR DRAWING CALLED ===');
    console.log(`Current strokes count: ${this.strokes.length}`);
    console.log(`Current stroke:`, this.currentStroke);
    console.log(`Is drawing:`, this.isDrawing);
    console.log(`Drawing layer exists:`, !!this.drawingLayer);

    if (this.drawingLayer) {
      const existingPaths = this.drawingLayer.selectAll('.stroke-path');
      console.log(`Existing paths in DOM: ${existingPaths.size()}`);
      const existingCurrentStrokes =
        this.drawingLayer.selectAll('.current-stroke');
      console.log(
        `Existing current strokes in DOM: ${existingCurrentStrokes.size()}`,
      );
    }

    // Clear the data
    this.strokes = [];
    this.currentStroke = null;
    this.isDrawing = false;

    // Update computed properties after clearing strokes
    this.updateComputedProperties();

    // Dispatch actions to clear both strokes and shapes from state store
    this.store.dispatch(new SketchActions.ClearAllStrokes());
    this.store.dispatch(new SketchActions.ClearAllShapes());

    console.log('Data cleared, calling redrawStrokes...');
    this.redrawStrokes();

    // Double-check that DOM is cleared
    if (this.drawingLayer) {
      const remainingPaths = this.drawingLayer.selectAll('.stroke-path');
      const remainingCurrentStrokes =
        this.drawingLayer.selectAll('.current-stroke');
      console.log(`Remaining paths after clear: ${remainingPaths.size()}`);
      console.log(
        `Remaining current strokes after clear: ${remainingCurrentStrokes.size()}`,
      );
    }

    console.log('=== CLEAR DRAWING COMPLETE ===');
  }

  // Node selection methods
  toggleNodeSelection(nodeId: string) {
    console.log(`\n--- toggleNodeSelection called for: ${nodeId} ---`);
    console.log('selectedNodes before toggle:', this.selectedNodes);

    const index = this.selectedNodes.indexOf(nodeId);
    console.log('Node index in selectedNodes:', index);

    if (index > -1) {
      // Remove from selection
      this.selectedNodes = this.selectedNodes.filter((id) => id !== nodeId);
      console.log(`Deselected node: ${nodeId}`);

      // Remove from current lesson if exists
      if (this.selectedLesson) {
        const lessonNodeIndex = this.selectedLesson.LessonNodes.findIndex(
          (ln) => ln.NodeID === nodeId,
        );
        if (lessonNodeIndex > -1) {
          const updatedLesson = {
            ...this.selectedLesson,
            LessonNodes: this.selectedLesson.LessonNodes.filter(
              (ln) => ln.NodeID !== nodeId,
            ),
          };
          this.store.dispatch(new UpdateLesson(updatedLesson));
        }
      }
    } else {
      // Mark that nodes are being added by user interaction
      this.nodesAddedByUser = true;

      // Add to selection
      console.log(`Adding node ${nodeId} to selectedNodes...`);
      this.selectedNodes = [...this.selectedNodes, nodeId];
      console.log(`Selected node: ${nodeId}`);

      // Add to current lesson if exists
      if (this.selectedLesson) {
        const existsInLesson = this.selectedLesson.LessonNodes.some(
          (ln) => ln.NodeID === nodeId,
        );
        if (!existsInLesson) {
          const updatedLesson = {
            ...this.selectedLesson,
            LessonNodes: [
              ...this.selectedLesson.LessonNodes,
              {
                NodeName: nodeId,
                NodeID: nodeId,
                // Initialize with default radar values when adding new nodes
                NodeCurrentValue: 1, // Perceived default
                NodeDesiredValue: 3, // Desired default
                NodeProValue: 4, // Elite default
              },
            ],
          };
          this.store.dispatch(new UpdateLesson(updatedLesson));
        }
      }
    }
    console.log(
      `selectedNodes after toggle: [${this.selectedNodes.join(', ')}]`,
    );
    console.log('--- toggleNodeSelection complete ---\n');
    this.updateNodeSelectionVisuals();
  }

  addNodeToSelection(nodeId: string) {
    console.log(`\n--- addNodeToSelection called for: ${nodeId} ---`);
    console.log('selectedNodes before add:', this.selectedNodes);

    if (!this.selectedNodes.includes(nodeId)) {
      // Mark that nodes are being added by user interaction
      this.nodesAddedByUser = true;

      // Add to selection if not already selected
      console.log(`Adding node ${nodeId} to selectedNodes...`);
      this.selectedNodes = [...this.selectedNodes, nodeId];
      console.log(`Selected node: ${nodeId}`);

      // Add to current lesson if exists
      if (this.selectedLesson) {
        const existsInLesson = this.selectedLesson.LessonNodes.some(
          (ln) => ln.NodeID === nodeId,
        );
        if (!existsInLesson) {
          const updatedLesson = {
            ...this.selectedLesson,
            LessonNodes: [
              ...this.selectedLesson.LessonNodes,
              {
                NodeName: nodeId,
                NodeID: nodeId,
                // Initialize with default radar values when adding new nodes
                NodeCurrentValue: 1, // Perceived default
                NodeDesiredValue: 3, // Desired default
                NodeProValue: 4, // Elite default
              },
            ],
          };
          this.store.dispatch(new UpdateLesson(updatedLesson));
        }
      }
    } else {
      console.log(`Node ${nodeId} is already selected, no change needed`);
    }

    console.log(`selectedNodes after add: [${this.selectedNodes.join(', ')}]`);
    console.log('--- addNodeToSelection complete ---\n');
    this.updateNodeSelectionVisuals();
  }

  clearNodeSelection() {
    console.log('=== CLEAR NODE SELECTION CALLED ===');
    console.log('Before clear - selectedNodes:', [...this.selectedNodes]);
    console.log('Before clear - selectedNode:', this.selectedNode);

    // Clear all selections immediately
    this._selectedNodes = [];
    this.selectedNode = null;

    // Also clear any lesson that might be affecting selection
    this.selectedLesson = null;

    console.log('After immediate clear - selectedNodes:', [
      ...this.selectedNodes,
    ]);
    console.log('After immediate clear - selectedNode:', this.selectedNode);

    // Force UI update
    this.updateNodeSelectionVisuals();
    this.updateSelectedNodesPanelVisibility();

    // Force change detection
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    // Use setTimeout to ensure clearing persists after any async operations
    setTimeout(() => {
      console.log('=== DELAYED CLEAR CHECK ===');
      console.log('After timeout - selectedNodes:', [...this.selectedNodes]);
      console.log('After timeout - selectedNode:', this.selectedNode);

      // Re-clear if something restored it
      if (this.selectedNodes.length > 0 || this.selectedNode !== null) {
        console.log('DETECTED RESTORE - Re-clearing...');
        this._selectedNodes = [];
        this.selectedNode = null;
        this.selectedLesson = null;
        this.updateNodeSelectionVisuals();
        this.updateSelectedNodesPanelVisibility();
        this.cdr.detectChanges();
      }
    }, 100);

    console.log('=== CLEAR NODE SELECTION COMPLETE ===');
  }

  // Pan to node methods
  panToNodeById(nodeId: string): void {
    const node = this.treeNodes.find((n) => n.id === nodeId);
    if (node) {
      this.panToNode(node);
    }
  }

  panToNode(node: D3TreeNode): void {
    if (node && node.x !== undefined && node.y !== undefined) {
      // Use VisualizationInteractionService for pan-to-node animation
      const dimensions = { width: this.width, height: this.height };
      const currentTransform =
        this.visualizationInteractionService.getTransform();

      this.visualizationInteractionService
        .panToNode(node.id, this.treeNodes, currentTransform, dimensions)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (transform) => {
            this.panX = transform.panX;
            this.panY = transform.panY;
            this.applyTransform();
            this.updateSelectedNodeTextInfo();
            this.cdr.detectChanges();
          },
          complete: () => {
            // Animation complete
          },
        });
    }
  }

  // Navigate to node method for toolbar components
  navigateToNode(nodeId: string): void {
    this.panToNodeById(nodeId);
  }

  // Handle node selection from toolbar components

  onNodeSelected(nodeId: string): void {
    console.log('[Bookmarks/Favorites] onNodeSelected', nodeId);
    // Set the selected node (for technique explorer) and track visit
    this.store.dispatch(new SetSelectedContextNode(nodeId));
    this.store.dispatch(new SketchActions.TrackNodeVisit(nodeId));

    // Always pan to the node
    this.panToNodeById(nodeId);

    // NOTE: Do NOT dispatch SetSelectedContextLessonNode here.
    // Lesson node selection should only be managed by the lesson toolbars themselves.
    // Bookmarks/Favorites are general navigation tools, not lesson-specific.
  }

  // Virtual scrolling methods
  onVirtualScroll(event: Event): void {
    const target = event.target as HTMLElement;
    this.virtualScrollTop = target.scrollTop;
  }

  onNodeClickFromList(node: D3TreeNode, event: MouseEvent): void {
    console.log(`Node clicked from list: ${node.id}`);

    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd key - toggle selection
      this.toggleNodeSelection(node.id);
    } else if (event.shiftKey) {
      // Add to selection with Shift key - always add, never remove
      this.addNodeToSelection(node.id);
    } else {
      // Single select - set as the current selected node, clear multi-selection
      this.selectedNode = node.id;
      this.selectedNodes = []; // Clear the multi-selection list
      this.updateNodeSelectionVisuals();
      // Do not auto-open lessonViewer or techniqueExplorer
    }

    // Always pan to the clicked node to center it on screen
    this.panToNode(node);
  }

  onSelectedNodeClick(nodeId: string): void {
    console.log(`Selected node clicked: ${nodeId}`);

    // Set the selected node and pan to it, but don't clear the selections
    this.selectedNode = nodeId;
    this.updateSingleNodeSelection();

    // Update the lesson builder node state
    this.store.dispatch(new SetSelectedContextLessonBuilderNode(nodeId));

    // Pan to the node
    this.panToNodeById(nodeId);

    // Do not auto-open lessonViewer or techniqueExplorer

    // Auto-show Explorer when a node is selected (only if enabled and not already visible)
    if (
      this.explorerAutoShowEnabled &&
      !this.getToolbarVisibility('explorer')
    ) {
      this.toggleToolbarVisibility('explorer');
    }
  }

  trackByNodeId(index: number, node: any): any {
    return node.id;
  }

  clearVisualization() {
    console.log('Clearing tree visualization');

    // Clear node selection
    this.clearNodeSelection();
    this.selectedNode = null;

    // Clear the tree nodes array
    this.treeNodes = [];
    this.treeLinks = [];

    // Trigger change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.cdr.detectChanges();

    // Clear the SVG content (tree nodes and links)
    if (this.svg && this.g) {
      // Remove tree-related elements but keep other elements like drawing layer
      this.g.selectAll('.node').remove();
      this.g.selectAll('.link').remove();
      this.g.selectAll('.node-label').remove();
    }

    console.log('Tree visualization cleared');
  }

  // Related Node Selection Methods
  selectRelatedNodes(nodeId: string) {
    console.log(`\n--- selectRelatedNodes called for: ${nodeId} ---`);
    console.log(
      `Direction: ${this.relatedNodeDirection}, Mode: ${this.relatedNodeMode}`,
    );

    if (this.relatedNodeMode === 'selection') {
      this.handleSelectionMode(nodeId);
    } else {
      this.handleHighlightMode(nodeId);
    }
  }

  private handleSelectionMode(nodeId: string) {
    // Find related nodes based on direction
    const relatedIds = this.getRelatedNodeIds(
      nodeId,
      this.relatedNodeDirection,
    );
    console.log(`Found ${relatedIds.length} related nodes:`, relatedIds);

    // Determine if we should select or deselect based on the target node's current state
    const isNodeSelected = this.selectedNodes.includes(nodeId);
    const shouldSelect = !isNodeSelected;

    console.log(`Node ${nodeId} is currently selected: ${isNodeSelected}`);
    console.log(
      `Will ${shouldSelect ? 'select' : 'deselect'} node and related nodes`,
    );

    if (shouldSelect) {
      // SELECT: Add the clicked node and related nodes
      const nodesToAdd = [nodeId, ...relatedIds].filter(
        (id) => !this.selectedNodes.includes(id),
      );

      if (nodesToAdd.length > 0) {
        this.selectedNodes = [...this.selectedNodes, ...nodesToAdd];
        nodesToAdd.forEach((id) => {
          console.log(`Added node ${id} to selection`);
        });
      }
    } else {
      // DESELECT: Remove the clicked node and related nodes
      const idsToRemove = [nodeId, ...relatedIds];
      this.selectedNodes = this.selectedNodes.filter(
        (id) => !idsToRemove.includes(id),
      );
      idsToRemove.forEach((id) => {
        console.log(`Removed node ${id} from selection`);
      });
    }

    this.updateNodeSelectionVisuals();
  }

  private handleHighlightMode(nodeId: string) {
    // Get related nodes based on direction
    const relatedIds = this.getRelatedNodeIds(
      nodeId,
      this.relatedNodeDirection,
    );
    const allNodes = [nodeId, ...relatedIds];

    // Check if this group is currently highlighted
    const isHighlighted = allNodes.every((id) =>
      this.highlightedNodes.includes(id),
    );

    if (isHighlighted) {
      // Remove highlighting
      allNodes.forEach((id) => {
        const index = this.highlightedNodes.indexOf(id);
        if (index > -1) {
          this.highlightedNodes.splice(index, 1);
        }
      });
      console.log(`Removed highlighting from nodes:`, allNodes);
    } else {
      // Add highlighting (clear previous highlights first)
      this.highlightedNodes = [...allNodes];
      console.log(`Added highlighting to nodes:`, allNodes);
    }

    this.updateNodeHighlightVisuals();
  }

  private getRelatedNodeIds(
    nodeId: string,
    direction: 'descendants' | 'ancestors',
  ): string[] {
    if (direction === 'descendants') {
      return this.getDescendantIds(nodeId);
    } else {
      return this.getAncestorIds(nodeId);
    }
  }

  private getDescendantIds(nodeId: string): string[] {
    const targetNode = this.findNodeInTree(this.treeData, nodeId);
    if (!targetNode) {
      console.log(`Node ${nodeId} not found in tree data`);
      return [];
    }
    return this.collectAllChildrenIds(targetNode);
  }

  private getAncestorIds(nodeId: string): string[] {
    const ancestors: string[] = [];
    this.findAncestors(this.treeData, nodeId, ancestors);
    return ancestors;
  }

  private findAncestors(
    node: TreeNode | null,
    targetId: string,
    ancestors: string[],
  ): boolean {
    if (!node) return false;

    if (node.id === targetId) {
      return true; // Found target, don't include it in ancestors
    }

    if (node.children) {
      for (const child of node.children) {
        if (this.findAncestors(child, targetId, ancestors)) {
          ancestors.unshift(node.id); // Add current node as ancestor
          return true;
        }
      }
    }

    return false;
  }

  private updateNodeHighlightVisuals() {
    if (!this.g) return;

    // Update all node visuals for highlighting
    this.g
      .selectAll('.tree-node-group')
      .select('.tree-node')
      .style('stroke-width', (d: any) => {
        return this.highlightedNodes.includes(d.id) ? '3px' : '2px';
      })
      .style('stroke', (d: any) => {
        if (this.highlightedNodes.includes(d.id)) {
          return this.colorsService.getSelectionColor('highlight');
        } else if (d.id === this.selectedNode) {
          return this.colorsService.getSelectionColor('single');
        } else if (this.isNodeSelected(d.id)) {
          return this.colorsService.getSelectionColor('multi');
        } else {
          return this.colorsService.getBorderColor(this.isDarkMode);
        }
      });

    // Update circle nodes too
    this.g
      .selectAll('.circle-node')
      .style('stroke-width', (d: any) => {
        return this.highlightedNodes.includes(d.id) ? '3px' : '2px';
      })
      .style('stroke', (d: any) => {
        if (this.highlightedNodes.includes(d.id)) {
          return this.colorsService.getSelectionColor('highlight');
        } else if (d.id === this.selectedNode) {
          return this.colorsService.getSelectionColor('single');
        } else if (this.isNodeSelected(d.id)) {
          return this.colorsService.getSelectionColor('multi');
        } else {
          return this.colorsService.getBorderColor(this.isDarkMode);
        }
      });
  }

  // Method toggle functions for UI
  public toggleRelatedNodeDirection(): void {
    this.relatedNodeDirection =
      this.relatedNodeDirection === 'descendants' ? 'ancestors' : 'descendants';
    console.log(
      `Switched related node direction to: ${this.relatedNodeDirection}`,
    );
  }

  public toggleRelatedNodeMode(): void {
    this.relatedNodeMode =
      this.relatedNodeMode === 'selection' ? 'highlight' : 'selection';
    console.log(`Switched related node mode to: ${this.relatedNodeMode}`);

    // Clear highlights when switching away from highlight mode
    if (this.relatedNodeMode === 'selection') {
      this.highlightedNodes = [];
      this.updateNodeHighlightVisuals();
    }
  }

  // Legacy method for backward compatibility (can be removed later)
  selectAllChildren(nodeId: string) {
    // Temporarily set to descendants and selection mode for backward compatibility
    const oldDirection = this.relatedNodeDirection;
    const oldMode = this.relatedNodeMode;

    this.relatedNodeDirection = 'descendants';
    this.relatedNodeMode = 'selection';

    this.selectRelatedNodes(nodeId);

    // Restore previous settings
    this.relatedNodeDirection = oldDirection;
    this.relatedNodeMode = oldMode;
  }

  private findNodeInTree(
    node: TreeNode | null,
    targetId: string,
  ): TreeNode | null {
    if (!node) return null;
    if (node.id === targetId) return node;

    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodeInTree(child, targetId);
        if (found) return found;
      }
    }

    return null;
  }

  private collectAllChildrenIds(node: TreeNode): string[] {
    const childrenIds: string[] = [];

    if (node.children) {
      for (const child of node.children) {
        childrenIds.push(child.id);
        // Recursively collect grandchildren
        const grandchildren = this.collectAllChildrenIds(child);
        childrenIds.push(...grandchildren);
      }
    }

    return childrenIds;
  }

  // Breadcrumb utility methods
  private getPathToNode(targetId: string): TreeNode[] {
    if (!targetId || !this.treeData) return [];

    const path: TreeNode[] = [];
    const findPath = (node: TreeNode, target: string): boolean => {
      path.push(node);

      if (node.id === target) {
        return true;
      }

      if (node.children) {
        for (const child of node.children) {
          if (findPath(child, target)) {
            return true;
          }
        }
      }

      path.pop();
      return false;
    };

    findPath(this.treeData, targetId);
    return path;
  }

  private updateBreadcrumbPath(): void {
    if (this.selectedNode) {
      this.breadcrumbPath = this.getPathToNode(this.selectedNode);
    } else {
      this.breadcrumbPath = [];
    }
  }

  /**
   * Handle breadcrumb item click - navigate to that node
   */
  onBreadcrumbClick(node: TreeNode, event: MouseEvent): void {
    console.log(`Breadcrumb clicked: ${node.id}`);

    // Prevent event bubbling
    event.stopPropagation();

    // Use existing node click logic
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd key - toggle selection
      this.toggleNodeSelection(node.id);
    } else if (event.shiftKey) {
      // Add to selection with Shift key - always add, never remove
      this.addNodeToSelection(node.id);
    } else {
      // Single select - set as the current selected node, clear multi-selection
      this.selectedNode = node.id;
      this.selectedNodes = []; // Clear the multi-selection list
      this.updateNodeSelectionVisuals();
    }

    // Always pan to the clicked node to center it on screen
    this.panToNodeById(node.id);
  }

  removeNodeFromSelection(nodeId: string) {
    const index = this.selectedNodes.indexOf(nodeId);
    if (index > -1) {
      this.selectedNodes = this.selectedNodes.filter((id) => id !== nodeId);
      console.log(`Removed node ${nodeId} from selection`);
      this.updateNodeSelectionVisuals();
    }
  }

  onReorderSelectedNodes(event: { fromIndex: number; toIndex: number }) {
    const { fromIndex, toIndex } = event;

    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= this.selectedNodes.length ||
      toIndex >= this.selectedNodes.length
    ) {
      return;
    }

    // Create a new array with reordered items
    const newSelectedNodes = [...this.selectedNodes];
    const [movedItem] = newSelectedNodes.splice(fromIndex, 1);
    newSelectedNodes.splice(toIndex, 0, movedItem);

    this.selectedNodes = newSelectedNodes;

    console.log(
      `Reordered nodes: moved "${movedItem}" from position ${fromIndex} to ${toIndex}`,
    );
    console.log('New order:', this.selectedNodes);

    // Update visual representation
    this.updateNodeSelectionVisuals();

    // Update lesson if one is selected and auto-apply is enabled
    if (this.selectedLesson && !this.selectionMatchesLesson) {
      console.log('Node order changed - lesson selection no longer matches');
    }
  }

  isNodeSelected(nodeId: string): boolean {
    return this.selectedNodes.includes(nodeId);
  }

  updateNodeSelectionVisuals() {
    if (!this.g) return;

    // Update all tree node circles (using the new visualization structure)
    this.g
      .selectAll('.tree-node-group')
      .select('.tree-node')
      .style('stroke', (d: any) => {
        const nodeId = d.id;
        if (nodeId === this.selectedNode) {
          // Active node: bright magenta for high visibility
          return '#ff00ff';
        } else if (this.isNodeSelected(nodeId)) {
          // Lesson nodes: softer orange/amber
          return '#ffa726';
        } else {
          return this.colorsService.getNodeColor(
            d.depth === 0 ? 'root' : 'child',
          );
        }
      })
      .style('stroke-width', (d: any) => {
        const nodeId = d.id;
        if (nodeId === this.selectedNode) {
          // Active node: thicker stroke for emphasis
          return '5px';
        } else if (this.isNodeSelected(nodeId)) {
          // Lesson nodes: medium stroke
          return '3px';
        } else {
          return '2px';
        }
      })
      .style('fill-opacity', (d: any) => {
        const nodeId = d.id;
        if (nodeId === this.selectedNode || this.isNodeSelected(nodeId)) {
          return 1.0;
        } else {
          return 0.8;
        }
      });

    // Update all tree node labels
    this.g
      .selectAll('.tree-node-group')
      .select('.tree-node-label')
      .style('font-weight', (d: any) => {
        const nodeId = d.id;
        if (nodeId === this.selectedNode || this.isNodeSelected(nodeId)) {
          return 'bold';
        } else {
          return d.depth === 0 ? 'bold' : 'normal';
        }
      })
      .style('fill', (d: any) => {
        const nodeId = d.id;
        if (nodeId === this.selectedNode) {
          // Active node: white text for contrast against magenta stroke
          return '#ffffff';
        } else if (this.isNodeSelected(nodeId)) {
          // Lesson nodes: white text for contrast against orange stroke
          return '#ffffff';
        } else {
          return this.colorsService.getTextColor(this.isDarkMode);
        }
      });
  }

  updateSingleNodeSelection() {
    console.log(
      `Updating visual for single selected node: ${this.selectedNode}`,
    );
    // Use the main visual update method which now handles both single and multiple selections
    this.updateNodeSelectionVisuals();
  }

  // Lesson management methods
  createLesson() {
    this.newLessonName = '';
    this.showCreateLessonDialog = true;
  }

  public closeCreateLessonDialog(): void {
    this.showCreateLessonDialog = false;
    this.newLessonName = '';
  }

  public saveNewLesson(lessonData: CreateLessonData): void {
    console.log('saveNewLesson called with:', lessonData);
    if (!lessonData.name.trim()) {
      console.log('saveNewLesson: No lesson name provided');
      return;
    }

    // Use pending selection if available, otherwise use current selection
    const nodesToUse =
      this.pendingSelectionForNewLesson.length > 0
        ? this.pendingSelectionForNewLesson
        : this.selectedNodes;

    console.log('Nodes to use for lesson:', nodesToUse);

    // Create lesson nodes from selection
    const lessonNodes: ILessonElement[] = nodesToUse.map((nodeId) => ({
      NodeName: nodeId, // Using nodeId as name for now
      NodeID: nodeId,
      // Initialize with default radar values
      NodeCurrentValue: 1, // Perceived default
      NodeDesiredValue: 3, // Desired default
      NodeProValue: 4, // Elite default
    }));

    const newLesson: ILesson = {
      LessonName: lessonData.name.trim(),
      LessonDesc: lessonData.description.trim() || undefined, // Optional description
      LessonChips:
        lessonData.chips.length > 0 ? [...lessonData.chips] : undefined, // Category tags
      LessonNodes: lessonNodes,
      FlowID: this.selectedContextDataset?.FlowID, // Link lesson to current Decision Flow
      OwnershipContext: lessonData.ownershipContext, // Add ownership context
      FlowName: this.selectedContextDataset?.FlowName, // Add flow name for display
      CreatedByUserID: this.loggedInUser?.UserId, // User who created the lesson
      CreatedUTC: new Date().toISOString(), // Timestamp when lesson was created
    };

    // Dispatch action to add lesson to NGXS state
    this.store.dispatch(new AddLesson(newLesson)).subscribe(() => {
      // After lesson is added, select it
      console.log('Lesson added to state, now selecting it');
      this.store.dispatch(new SelectLesson(newLesson)).subscribe(() => {
        console.log('Lesson selection dispatched, triggering change detection');
        // Small delay to ensure state propagation
        setTimeout(() => {
          this.cdr.detectChanges();
          console.log('Change detection triggered after lesson creation');
        }, 100);
      });

      console.log(
        `Created lesson: ${newLesson.LessonName} with ${lessonNodes.length} nodes`,
        newLesson.LessonDesc ? `Description: ${newLesson.LessonDesc}` : '',
        newLesson.LessonChips && newLesson.LessonChips.length > 0
          ? `Chips: ${newLesson.LessonChips.join(', ')}`
          : '',
      );
    });

    // Mark selection as saved and clear pending selection
    this.markSelectionAsSaved();
    this.pendingSelectionForNewLesson = [];

    // Close the dialog
    this.closeCreateLessonDialog();
  }

  selectLesson(lesson: ILesson) {
    console.log('selectLesson called:', lesson.LessonName);

    // Clear current node selection
    this._selectedNodes = [];
    this.selectedNode = null;

    // Dispatch action to set selected lesson in NGXS state
    // The selectedLesson$ subscription will handle setting up nodes and lesson runner
    this.store.dispatch(new SelectLesson(lesson));

    console.log('SelectLesson action dispatched');
  }

  onLessonChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const lessonName = target.value;

    if (lessonName === '') {
      // Clear selected nodes when no lesson is selected
      this.clearNodeSelection();
      this.store.dispatch(new SelectLesson(null));
      return;
    }

    const lesson = this.currentLessons.find((l) => l.LessonName === lessonName);
    if (lesson) {
      this.selectLesson(lesson);
    }
  }

  onLessonSelect(lesson: ILesson | null) {
    console.log(
      '🎯 D3UIV6.onLessonSelect called (Lesson Builder):',
      lesson?.LessonName || 'null',
    );

    if (!lesson) {
      // Clear selection if null lesson is passed
      this.clearNodeSelection();
      this.store.dispatch(new SelectLesson(null));
      // Update Lesson Builder context (NOT Lesson Runner)
      this.store.dispatch(new SetSelectedContextLessonBuilderLesson(null));
      return;
    }

    // Select the lesson using the existing selectLesson method
    this.selectLesson(lesson);
    // Update Lesson Builder context (NOT Lesson Runner)
    this.store.dispatch(new SetSelectedContextLessonBuilderLesson(lesson));
  }

  // Check if current selection matches the selected lesson's nodes
  // Cache the selection match result to avoid recalculation during change detection
  private _selectionMatchesLesson = true;

  get selectionMatchesLesson(): boolean {
    return this._selectionMatchesLesson;
  }

  private updateSelectionMatchesLesson(): void {
    if (!this.selectedLesson || !this.selectedLesson.LessonNodes) {
      this._selectionMatchesLesson = true; // No lesson selected, so no mismatch
      return;
    }

    const lessonNodeIds = this.selectedLesson.LessonNodes.map(
      (node) => node.NodeID,
    ).sort();
    const currentSelection = this.selectedNodes.slice().sort();

    this._selectionMatchesLesson =
      lessonNodeIds.length === currentSelection.length &&
      lessonNodeIds.every(
        (nodeId, index) => nodeId === currentSelection[index],
      );
  }

  private updateUnsavedChangesState(): void {
    const currentSelection = this.selectedNodes.slice().sort();
    const lastSavedSelection = this._lastSavedSelection.slice().sort();

    // Check if current selection differs from last saved state
    this._hasUnsavedChanges =
      currentSelection.length !== lastSavedSelection.length ||
      !currentSelection.every(
        (nodeId, index) => nodeId === lastSavedSelection[index],
      );

    // Update computed properties when unsaved changes state changes
    this.updateComputedProperties();
  }

  private markSelectionAsSaved(): void {
    this._lastSavedSelection = this.selectedNodes.slice();
    this._hasUnsavedChanges = false;
    // Update computed properties when changes are saved
    this.updateComputedProperties();
  }

  // Apply current selection to the selected lesson or create new lesson if none selected
  applySelectionToLesson() {
    if (!this.hasUnsavedChanges || this.selectedNodes.length === 0) {
      return;
    }

    if (!this.selectedLesson) {
      // No lesson selected - show confirmation dialog
      this.showApplyNoLessonConfirmDialog = true;
      return;
    }

    // Create updated lesson nodes from current selection
    const updatedLessonNodes: ILessonElement[] = this.selectedNodes.map(
      (nodeId) => {
        // Check if this node already exists in the lesson to preserve radar values
        const existingNode = this.selectedLesson!.LessonNodes.find(
          (ln) => ln.NodeID === nodeId,
        );

        return {
          NodeName: nodeId,
          NodeID: nodeId,
          // Preserve existing radar values or use defaults
          NodeCurrentValue: existingNode?.NodeCurrentValue ?? 1,
          NodeDesiredValue: existingNode?.NodeDesiredValue ?? 3,
          NodeProValue: existingNode?.NodeProValue ?? 4,
        };
      },
    );

    const updatedLesson: ILesson = {
      ...this.selectedLesson,
      LessonNodes: updatedLessonNodes,
    };

    // Update the lesson in NGXS state
    this.store.dispatch(new UpdateLesson(updatedLesson));

    // Mark selection as saved
    this.markSelectionAsSaved();

    console.log(
      `Applied selection to lesson: ${updatedLesson.LessonName} with ${updatedLessonNodes.length} nodes`,
    );
  }

  // Handle confirmation dialog response for apply without lesson
  onApplyNoLessonConfirmed(confirmed: boolean): void {
    this.showApplyNoLessonConfirmDialog = false;

    if (confirmed) {
      // User confirmed - show create lesson dialog
      this.createLessonWithCurrentSelection();
    }
    // If not confirmed, do nothing
  }

  private createLessonWithCurrentSelection(): void {
    // Store the current selection to be applied after lesson creation
    this.pendingSelectionForNewLesson = this.selectedNodes.slice();
    this.showCreateLessonDialog = true;
  }

  // Edit the currently selected lesson name
  editLesson() {
    if (!this.selectedLesson) {
      return;
    }

    this.editLessonName = this.selectedLesson.LessonName;
    this.editLessonDescription = this.selectedLesson.LessonDesc || '';
    this.editLessonChips = this.selectedLesson.LessonChips
      ? [...this.selectedLesson.LessonChips]
      : [];
    this.showEditLessonDialog = true;
  }

  public closeEditLessonDialog(): void {
    this.showEditLessonDialog = false;
    this.editLessonName = '';
    this.editLessonDescription = '';
    this.editLessonChips = [];
  }

  public saveEditedLesson(lessonData: EditLessonData): void {
    if (!this.selectedLesson || !lessonData.name.trim()) {
      return;
    }

    const currentName = this.selectedLesson.LessonName;
    const newName = lessonData.name.trim();
    const newDescription = lessonData.description.trim();
    const newChips = lessonData.chips;

    // Check if anything actually changed
    const descriptionChanged =
      (this.selectedLesson.LessonDesc || '') !== newDescription;
    const chipsChanged =
      JSON.stringify(this.selectedLesson.LessonChips || []) !==
      JSON.stringify(newChips);
    const nameChanged = currentName !== newName;

    if (!nameChanged && !descriptionChanged && !chipsChanged) {
      this.closeEditLessonDialog();
      return; // No changes
    }

    // If name changed, check if a lesson with this name already exists
    if (nameChanged) {
      const existingLesson = this.currentLessons.find(
        (lesson) => lesson.LessonName === newName,
      );

      if (existingLesson) {
        alert(
          `A lesson named "${newName}" already exists. Please choose a different name.`,
        );
        return;
      }
    }

    // Create updated lesson
    const updatedLesson: ILesson = {
      ...this.selectedLesson,
      LessonName: newName,
      LessonDesc: newDescription || undefined,
      LessonChips: newChips.length > 0 ? [...newChips] : undefined,
    };

    // Remove the old lesson and add the updated one
    this.store.dispatch(new RemoveLesson(currentName));
    this.store.dispatch(new AddLesson(updatedLesson));
    this.store.dispatch(new SelectLesson(updatedLesson));

    console.log(
      `Updated lesson: "${currentName}" -> "${newName}"`,
      newDescription ? `Description: ${newDescription}` : '',
      newChips.length > 0 ? `Chips: ${newChips.join(', ')}` : '',
    );
    this.closeEditLessonDialog();
  }

  // Delete the currently selected lesson
  deleteLesson() {
    if (!this.selectedLesson) {
      return;
    }

    const lessonName = this.selectedLesson.LessonName;
    this.lessonConfirmationTitle = 'Delete Lesson';
    this.lessonConfirmationMessage = `Are you sure you want to delete the lesson "${lessonName}"?`;
    this.lessonConfirmationAction = 'delete';
    this.showDeleteLessonDialog = true;
  }

  // Promote the currently selected lesson to higher ownership level
  public promoteLesson() {
    if (!this.selectedLesson || !this.selectedLesson.OwnershipContext) {
      return;
    }

    const context = this.selectedLesson.OwnershipContext.Context;
    const lessonName = this.selectedLesson.LessonName;

    if (context === 'TEAM') {
      this.lessonConfirmationTitle = 'Promote Lesson';
      this.lessonConfirmationMessage =
        'Are you sure you want to promote this to a TENANT lesson? This is an administrator function.';
      this.lessonConfirmationAction = 'promote';
      this.showDeleteLessonDialog = true;
    } else if (context === 'TENANT') {
      this.lessonConfirmationTitle = 'Promote Lesson';
      this.lessonConfirmationMessage =
        'Are you sure you want to promote this from a TENANT lesson to a SYSTEM lesson? This is an administrator function.';
      this.lessonConfirmationAction = 'promote';
      this.showDeleteLessonDialog = true;
    }
  }

  // Demote the currently selected lesson to lower ownership level
  public demoteLesson() {
    if (!this.selectedLesson || !this.selectedLesson.OwnershipContext) {
      return;
    }

    const ownershipContext = this.selectedLesson.OwnershipContext;
    const lessonName = this.selectedLesson.LessonName;

    if (
      ownershipContext.Context === 'TENANT' &&
      ownershipContext.ContextKey === -1
    ) {
      this.lessonConfirmationTitle = 'Demote Lesson';
      this.lessonConfirmationMessage =
        'Are you sure you want to DEMOTE this from a SYSTEM lesson to a TENANT lesson? This is an administrator function.';
      this.lessonConfirmationAction = 'demote';
      this.showDeleteLessonDialog = true;
    } else if (
      ownershipContext.Context === 'TENANT' &&
      ownershipContext.ContextKey !== -1
    ) {
      if (!this.currentSelectedTeamId) {
        alert(
          'To demote a TENANT lesson to a team, you must have a team selected.',
        );
        return;
      }
      const teamName = this.selectedTeam?.TeamName || 'the selected team';
      this.lessonConfirmationTitle = 'Demote Lesson';
      this.lessonConfirmationMessage = `Are you sure you want to DEMOTE this to a TEAM lesson for ${teamName}? This is an administrator function.`;
      this.lessonConfirmationAction = 'demote';
      this.showDeleteLessonDialog = true;
    }
  }

  // Run the currently selected lesson
  runLesson() {
    // Get the lesson from the runner context, not the builder context
    const lessonToRun = this.store.selectSnapshot(
      GlobalContextState.selectedContextLessonRunnerLesson,
    );

    if (!lessonToRun) {
      console.warn('No lesson selected to run');
      return;
    }

    console.log(`Starting lesson: ${lessonToRun.LessonName}`);

    // Get the lesson nodes for navigation
    const lessonNodes = lessonToRun.LessonNodes.map((node) => node.NodeID);

    if (lessonNodes.length === 0) {
      console.warn('Selected lesson has no nodes');
      return;
    }

    // Set the selected nodes to the lesson nodes
    this.selectedNodes = [...lessonNodes];

    // Select the first node in the lesson
    if (lessonNodes.length > 0) {
      const firstNodeId = lessonNodes[0];
      this.selectedNode = firstNodeId;
      console.log(`📍 Auto-selected first node: ${firstNodeId}`);

      // Pan to the first node
      this.panToNodeById(firstNodeId);

      // Dispatch to global context state
      this.store.dispatch(new SetSelectedContextLessonNode(firstNodeId));
    }

    // Center and show the Node Viewer for lesson execution
    this.openNodeViewerForLesson();

    // Generate a unique lesson ID and start the lesson
    const lessonId = `lesson-${lessonToRun.LessonName}-${Date.now()}`;
    this.store.dispatch(new TourActions.StartLesson(lessonId));

    console.log(
      `Lesson ${lessonToRun.LessonName} started with ${lessonNodes.length} nodes`,
    );
  }

  // Run the currently selected lesson on autopilot
  autopilot() {
    // Get the lesson from the runner context, not the builder context
    const lessonToRun = this.store.selectSnapshot(
      GlobalContextState.selectedContextLessonRunnerLesson,
    );

    if (!lessonToRun) {
      console.warn('No lesson selected for autopilot');
      return;
    }

    // Set autopilot running state
    this.autopilotRunning = true;

    console.log(`Starting autopilot for lesson: ${lessonToRun.LessonName}`);

    // Get the lesson nodes for navigation
    const lessonNodes = lessonToRun.LessonNodes.map((node) => node.NodeID);

    if (lessonNodes.length === 0) {
      console.warn('Selected lesson has no nodes for autopilot');
      return;
    }

    // Set the selected nodes to the lesson nodes
    this.selectedNodes = [...lessonNodes];

    // Show the Lesson Viewer first (don't center yet)
    this.showToolbar('lessonViewer');

    // Generate a unique lesson ID and start the lesson
    const lessonId = `autopilot-${lessonToRun.LessonName}-${Date.now()}`;
    this.store.dispatch(new TourActions.StartLesson(lessonId));

    // Start the autopilot sequence with smooth centering
    this.startAutopilotSequence(lessonNodes.length);

    console.log(
      `Autopilot started for lesson ${lessonToRun.LessonName} with ${lessonNodes.length} nodes`,
    );
  }

  // Stop autopilot and clean up
  stopAutopilot() {
    console.log('Stopping autopilot...');

    // Clear all timeouts
    this.autopilotTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.autopilotTimeouts = [];

    // Set autopilot running state to false
    this.autopilotRunning = false;

    console.log('Autopilot stopped');
  }

  private startAutopilotSequence(totalNodes: number): void {
    console.log(`Autopilot: Starting sequence for ${totalNodes} nodes`);

    // Step 1: Smoothly move Lesson Viewer to center
    this.smoothCenterLessonViewer(() => {
      // Step 2: Wait a moment for the centering to settle, then start node sequence
      const startTimeout = setTimeout(() => {
        if (!this.autopilotRunning) return; // Check if autopilot was stopped
        this.runAutopilotNodeSequence(totalNodes);
      }, 500);
      this.autopilotTimeouts.push(startTimeout);
    });
  }

  private runAutopilotNodeSequence(totalNodes: number): void {
    let currentNodeIndex = 0;

    const processCurrentNode = () => {
      if (currentNodeIndex >= totalNodes) {
        // All nodes completed, now finish the lesson
        console.log('Autopilot: All nodes completed, finishing lesson...');
        const finishTimeout = setTimeout(() => {
          if (!this.autopilotRunning) return; // Check if autopilot was stopped
          this.clickFinishButton();
          this.autopilotRunning = false; // Set to false when finishing
        }, 1000); // Wait 1 second before finish
        this.autopilotTimeouts.push(finishTimeout);
        return;
      }

      // Log current step
      console.log(
        `Autopilot: Processing node ${currentNodeIndex + 1} of ${totalNodes}`,
      );

      if (currentNodeIndex === 0) {
        // First node - already selected by lesson start, just wait and proceed
        console.log('Autopilot: On first node, waiting 1 seconds...');
        const firstNodeTimeout = setTimeout(() => {
          if (!this.autopilotRunning) return; // Check if autopilot was stopped
          currentNodeIndex++;
          if (currentNodeIndex < totalNodes) {
            this.clickNextButton(() => processCurrentNode());
          } else {
            processCurrentNode(); // Go to finish
          }
        }, 1000);
        this.autopilotTimeouts.push(firstNodeTimeout);
      } else {
        // For subsequent nodes, they're already navigated by previous Next click
        console.log(
          `Autopilot: On node ${currentNodeIndex + 1}, waiting 1 seconds...`,
        );
        const nodeTimeout = setTimeout(() => {
          if (!this.autopilotRunning) return; // Check if autopilot was stopped
          currentNodeIndex++;
          if (currentNodeIndex < totalNodes) {
            this.clickNextButton(() => processCurrentNode());
          } else {
            processCurrentNode(); // Go to finish
          }
        }, 1000);
        this.autopilotTimeouts.push(nodeTimeout);
      }
    };

    // Start the node sequence
    processCurrentNode();
  }

  private clickNextButton(callback?: () => void): void {
    if (this.lessonRunnerV2Ref) {
      console.log('Autopilot: Calling lesson runner goToNext()...');
      this.lessonRunnerV2Ref.goToNext();

      // Wait briefly for the navigation to process, then continue
      if (callback) {
        setTimeout(callback, 500); // Increased timeout for state updates
      }
    } else {
      console.warn('Autopilot: Lesson runner component not found');
      if (callback) callback();
    }
  }

  private clickFinishButton(): void {
    if (this.lessonRunnerV2Ref) {
      console.log('Autopilot: Calling lesson runner finish()...');
      this.lessonRunnerV2Ref.finish();

      console.log(
        'Autopilot: Lesson completed! Dialog should now be waiting on finish screen.',
      );
    } else {
      console.warn('Autopilot: Lesson runner component not found for finish');
    }
  }

  private centerNodeViewer(): void {
    // Calculate center position
    const centerX = this.width / 2 - 300; // Assuming node viewer width is ~600px
    const centerY = this.height / 2 - 200; // Assuming node viewer height is ~400px

    // For backwards compatibility, center the lesson viewer
    this.store.dispatch(
      new UpdateToolbarPosition('lessonViewer', { x: centerX, y: centerY }),
    );
  }

  /**
   * Opens the node viewer specifically for lesson execution (runLesson/autopilot).
   * Centers the node viewer only if it's not currently visible.
   */
  private openNodeViewerForLesson(): void {
    const isCurrentlyVisible = this.getToolbarVisibility('nodeViewer');

    if (!isCurrentlyVisible) {
      // Center the node viewer only if it's not currently visible
      this.centerNodeViewer();
    }

    // Show the toolbar (will use existing position if already visible)
    this.showToolbar('lessonViewer');
  }

  /**
   * Smoothly animates the node viewer to the center of the screen for autopilot mode.
   * For backwards compatibility - now uses lesson viewer.
   */
  private smoothCenterNodeViewer(callback?: () => void): void {
    const centerX = this.width / 2 - 300; // Assuming node viewer width is ~600px
    const centerY = this.height / 2 - 200; // Assuming node viewer height is ~400px

    const currentPosition = (this.toolbarPositions as any)['lessonViewer'];
    const startX = currentPosition?.x || centerX;
    const startY = currentPosition?.y || centerY;

    // Use D3 to create smooth animation
    const interpolateX = d3.interpolate(startX, centerX);
    const interpolateY = d3.interpolate(startY, centerY);

    const duration = 1500; // 1.5 second smooth animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Use easing for smooth animation
      const easedT = d3.easeCubicInOut(t);

      const currentX = interpolateX(easedT);
      const currentY = interpolateY(easedT);

      // Update position - use lesson viewer for backwards compatibility
      this.store.dispatch(
        new UpdateToolbarPosition('lessonViewer', { x: currentX, y: currentY }),
      );

      if (t < 1) {
        // Continue animation
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        console.log('Autopilot: Node Viewer centered smoothly');
        if (callback) callback();
      }
    };

    animate();
  }

  /**
   * Centers the lesson viewer on the screen
   */
  private centerLessonViewer(): void {
    const centerX = this.width / 2 - 300; // Assuming lesson viewer width is ~600px
    const centerY = this.height / 2 - 200; // Assuming lesson viewer height is ~400px

    this.store.dispatch(
      new UpdateToolbarPosition('lessonViewer', { x: centerX, y: centerY }),
    );
  }

  /**
   * Smoothly animates the lesson viewer to the center of the screen for autopilot mode.
   */
  private smoothCenterLessonViewer(callback?: () => void): void {
    const centerX = this.width / 2 - 300; // Assuming lesson viewer width is ~600px
    const centerY = this.height / 2 - 200; // Assuming lesson viewer height is ~400px

    const currentPosition = (this.toolbarPositions as any)['lessonViewer'];
    const startX = currentPosition?.x || centerX;
    const startY = currentPosition?.y || centerY;

    // Use D3 to create smooth animation
    const interpolateX = d3.interpolate(startX, centerX);
    const interpolateY = d3.interpolate(startY, centerY);

    const duration = 1500; // 1.5 second smooth animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Use easing for smooth animation
      const easedT = d3.easeCubicInOut(t);

      const currentX = interpolateX(easedT);
      const currentY = interpolateY(easedT);

      // Update position
      this.store.dispatch(
        new UpdateToolbarPosition('lessonViewer', { x: currentX, y: currentY }),
      );

      if (t < 1) {
        // Continue animation
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        console.log('Autopilot: Lesson Viewer centered smoothly');
        if (callback) callback();
      }
    };

    animate();
  }

  updateBrushSize(event: Event) {
    const target = event.target as HTMLInputElement;
    const brushSize = parseFloat(target.value);
    this.brushSize = brushSize;
  }

  updateEraserSize(event: Event) {
    const target = event.target as HTMLInputElement;
    const eraserSize = parseFloat(target.value);
    this.eraserSize = eraserSize;
  }

  setEraserMode(mode: 'normal' | 'magic') {
    console.log(`Setting eraser mode from ${this.eraserMode} to ${mode}`);
    this.eraserMode = mode;

    // Update cursor if we're in eraser mode
    if (this.drawingMode === 'eraser') {
      const svgElement = this.svgRef.nativeElement;
      svgElement.style.cursor =
        this.eraserMode === 'magic' ? 'cell' : 'pointer';
    }
  }

  // Theme methods
  toggleTheme() {
    console.log('toggleTheme called, current isDarkMode:', this.isDarkMode);
    // Dispatch to NGXS to persist the theme change
    this.store.dispatch(new SketchActions.ToggleTheme());
    console.log('Theme toggle dispatched to NGXS');
    // Note: isDarkMode will be updated via the subscription to isDarkMode$
  }

  toggleSnapToolbarsOnResize() {
    this.snapToolbarsOnResize = !this.snapToolbarsOnResize;
    console.log('Snap toolbars on resize toggled:', this.snapToolbarsOnResize);
  }

  // Operation Mode methods
  onOperationModeClick(modeId: string): void {
    console.log('Operation mode clicked:', modeId);
    this.operationModeService.toggleMode(modeId);
  }

  isOperationModeActive(modeId: string): boolean {
    return this.operationModeService.activeMode() === modeId;
  }

  getOperationModeTooltip(modeId: string): string {
    const config = this.operationModeService.getModeConfig(modeId);
    return config?.tooltip || config?.description || config?.name || modeId;
  }

  toggleTreeVisibility() {
    this.treeVisible = !this.treeVisible;
    console.log('Tree visibility toggled:', this.treeVisible);

    // Apply visibility to all tree elements
    this.updateTreeVisibility();
  }

  private updateTreeVisibility() {
    if (!this.svg) return;

    // Toggle visibility of tree links with smooth transition (use link opacity setting when visible)
    this.svg
      .selectAll('.tree-link')
      .transition()
      .duration(2000) // 2 second transition
      .ease(d3.easeCubicInOut) // Smooth easing
      .style('opacity', this.treeVisible ? this.linkOpacity : 0);

    // Toggle visibility of tree nodes and labels with smooth transition (use 1.0 opacity when visible)
    this.svg
      .selectAll('.tree-node, .tree-node-label, .tree-node-group, .tree-label')
      .transition()
      .duration(2000) // 2 second transition
      .ease(d3.easeCubicInOut) // Smooth easing
      .style('opacity', this.treeVisible ? 1 : 0);
  }

  toggleLogoFade() {
    this.logoFadeVisible = !this.logoFadeVisible;
    console.log('Logo fade toggled:', this.logoFadeVisible);

    const logoElement = document.querySelector('.logo-fade') as HTMLElement;
    const logoImage = document.querySelector('.logo-image') as HTMLElement;
    console.log('Logo element found:', logoElement);
    console.log('Logo image found:', logoImage);

    if (this.logoFadeVisible) {
      // Show logo with fade in
      if (logoElement) {
        console.log('Showing logo...');
        // Force styles to ensure visibility
        logoElement.style.opacity = '1'; // Start with visible container
        logoElement.style.display = 'block';
        logoElement.style.zIndex = '99999';
        logoElement.style.position = 'fixed';
        logoElement.style.top = '0';
        logoElement.style.left = '0';
        logoElement.style.right = '0';
        logoElement.style.bottom = '0';
        logoElement.style.background = 'rgba(0, 0, 0, 0.5)'; // Visible background

        if (logoImage) {
          logoImage.style.display = 'block';
          logoImage.style.opacity = '0';
          logoImage.style.position = 'absolute';
          logoImage.style.top = '50%';
          logoImage.style.left = '50%';
          logoImage.style.transform = 'translate(-50%, -50%)';
          logoImage.style.width = '33.33vmin';
          logoImage.style.height = '33.33vmin';
          logoImage.style.objectFit = 'contain';
          logoImage.style.zIndex = '100000';
          // Removed border and border-radius for clean appearance

          // Force a check if image is loaded
          const img = logoImage as HTMLImageElement;
          console.log('Image complete status:', img.complete);
          console.log('Image src:', img.src);
          console.log('Image naturalWidth:', img.naturalWidth);
          console.log('Image naturalHeight:', img.naturalHeight);

          // Fade in the image
          setTimeout(() => {
            logoImage.style.transition = 'opacity 3s ease-in-out';
            logoImage.style.opacity = '1';
            console.log('Logo image fade in started');
          }, 10);
        } else {
          console.error('Logo image element not found!');
        }

        console.log('Logo container displayed');
      } else {
        console.error('Logo element not found!');
      }
    } else {
      // Hide logo with fade out
      if (logoElement && logoImage) {
        console.log('Hiding logo...');
        logoImage.style.transition = 'opacity 3s ease-in-out';
        logoImage.style.opacity = '0';

        // Hide after fade out completes
        setTimeout(() => {
          logoElement.style.display = 'none';
          console.log('Logo hidden');
        }, 3000);
      }
    }
  }

  toggleBlackBackground() {
    this.blackBackgroundVisible = !this.blackBackgroundVisible;
    console.log('Black background toggled:', this.blackBackgroundVisible);

    const blackBgElement = document.querySelector(
      '.logo-black-background',
    ) as HTMLElement;

    if (this.blackBackgroundVisible) {
      if (blackBgElement) {
        blackBgElement.style.opacity = '0';
        blackBgElement.style.display = 'block';

        // Fade in over 3 seconds
        setTimeout(() => {
          blackBgElement.style.transition = 'opacity 3s ease-in-out';
          blackBgElement.style.opacity = '1';
          console.log('Black background fade in started');
        }, 10);
      }
    } else {
      if (blackBgElement) {
        blackBgElement.style.transition = 'opacity 3s ease-in-out';
        blackBgElement.style.opacity = '0';

        // Hide after fade out completes
        setTimeout(() => {
          blackBgElement.style.display = 'none';
          console.log('Black background hidden');
        }, 3000);
      }
    }
  }

  toggleAutoFade() {
    this.autoFadeActive = !this.autoFadeActive;
    console.log('Auto fade toggled:', this.autoFadeActive);

    if (this.autoFadeActive) {
      // Turn on both logo and black background
      console.log('Starting auto fade sequence...');

      // Debug toolbar visibility
      console.log('Current toolbarVisibility object:', this.toolbarVisibility);
      console.log(
        'zoomControls (View toolbar) visibility:',
        this.getToolbarVisibility('zoomControls'),
      );

      // Close the VIEW toolbar (zoomControls) if it's open - this is where our logo fade toggles are
      if (
        this.getToolbarVisibility('zoomControls') &&
        !this.operationModeService.isAnyModeActive()
      ) {
        console.log(
          'Closing VIEW toolbar (zoomControls) for auto-fade sequence',
        );

        // Try direct store dispatch
        this.store.dispatch(
          new SetToolbarVisibility('zoomControls' as any, false),
        );

        // Also try the hideToolbar method
        this.hideToolbar('zoomControls');

        // Verify it was closed
        setTimeout(() => {
          console.log(
            'After hideToolbar - zoomControls visibility:',
            this.getToolbarVisibility('zoomControls'),
          );
        }, 100);
      } else {
        console.log(
          'VIEW toolbar (zoomControls) is already closed or not found',
        );
      }

      // Add a small delay before starting the fade sequence to ensure toolbar is closed
      setTimeout(() => {
        console.log('Starting fade sequence after toolbar close delay');
        this.startAutoFadeSequence();
      }, 200);
    } else {
      // If turned off during sequence, stop everything
      console.log('Auto fade sequence cancelled');
      this.logoFadeVisible = false;
      this.blackBackgroundVisible = false;
    }
  }

  private startAutoFadeSequence() {
    // First, ensure both are off
    this.logoFadeVisible = false;
    this.blackBackgroundVisible = false;

    const logoElement = document.querySelector('.logo-fade') as HTMLElement;
    const logoImage = document.querySelector('.logo-image') as HTMLElement;
    const blackBgElement = document.querySelector(
      '.logo-black-background',
    ) as HTMLElement;

    if (logoElement && logoImage && blackBgElement) {
      // Hide both initially
      logoElement.style.display = 'none';
      blackBgElement.style.display = 'none';

      // Start fade in sequence
      setTimeout(() => {
        // Fade in black background first
        this.blackBackgroundVisible = true;
        blackBgElement.style.opacity = '0';
        blackBgElement.style.display = 'block';
        blackBgElement.style.transition = 'opacity 3s ease-in-out';
        blackBgElement.style.opacity = '1';

        // Then fade in logo (slightly delayed for effect)
        setTimeout(() => {
          this.logoFadeVisible = true;
          logoElement.style.display = 'block';
          logoElement.style.opacity = '1'; // Container visible

          // Set up logo image for fade in
          logoImage.style.display = 'block';
          logoImage.style.position = 'absolute';
          logoImage.style.top = '50%';
          logoImage.style.left = '50%';
          logoImage.style.transform = 'translate(-50%, -50%)';
          logoImage.style.width = '33.33vmin';
          logoImage.style.height = '33.33vmin';
          logoImage.style.objectFit = 'contain';
          logoImage.style.opacity = '0';

          // Fade in the image with a small delay to ensure styles are applied
          setTimeout(() => {
            logoImage.style.transition = 'opacity 3s ease-in-out';
            logoImage.style.opacity = '1';
            console.log('Logo image fade in started (auto-fade)');
          }, 50);

          // Wait 5 seconds then fade both out
          setTimeout(() => {
            console.log('Auto fade: starting fade out after 5 seconds');

            // Fade out logo first (3 second transition)
            logoImage.style.transition = 'opacity 3s ease-in-out';
            logoImage.style.opacity = '0';

            // Then fade out background (slightly delayed, also 3 second transition)
            setTimeout(() => {
              blackBgElement.style.transition = 'opacity 3s ease-in-out';
              blackBgElement.style.opacity = '0';

              // Hide both after fade out completes (3 seconds)
              setTimeout(() => {
                logoElement.style.display = 'none';
                blackBgElement.style.display = 'none';
                this.logoFadeVisible = false;
                this.blackBackgroundVisible = false;
                this.autoFadeActive = false; // Reset the toggle
                console.log('Auto fade sequence completed');
              }, 3000); // Wait 3 seconds for fade out to complete
            }, 500);
          }, 5000); // Wait 5 seconds
        }, 500);
      }, 100);
    }
  }

  toggleAutoFadeOut() {
    this.autoFadeOutActive = !this.autoFadeOutActive;
    console.log('Auto fade out toggled:', this.autoFadeOutActive);

    if (this.autoFadeOutActive) {
      // Turn on both logo and black background first
      console.log('Starting auto fade out sequence...');

      // Close the VIEW toolbar (zoomControls) if it's open
      if (
        this.getToolbarVisibility('zoomControls') &&
        !this.operationModeService.isAnyModeActive()
      ) {
        console.log(
          'Closing VIEW toolbar (zoomControls) for auto-fade out sequence',
        );

        // Try direct store dispatch
        this.store.dispatch(
          new SetToolbarVisibility('zoomControls' as any, false),
        );

        // Also try the hideToolbar method
        this.hideToolbar('zoomControls');

        setTimeout(() => {
          this.startAutoFadeOutSequence();
        }, 150);
      } else {
        this.startAutoFadeOutSequence();
      }
    }
  }

  private startAutoFadeOutSequence() {
    // Step 1: Fade in logo
    setTimeout(() => {
      this.logoFadeVisible = true;
      this.blackBackgroundVisible = false;

      const logoElement = document.querySelector(
        '.checkpoint-logo',
      ) as HTMLElement;
      if (logoElement) {
        logoElement.style.display = 'block';
        logoElement.style.opacity = '0';
        setTimeout(() => {
          logoElement.style.opacity = '1';
        }, 50);

        // Step 2: After 1s, fade in black background
        setTimeout(() => {
          this.blackBackgroundVisible = true;
          const blackBgElement = document.querySelector(
            '.black-background',
          ) as HTMLElement;
          if (blackBgElement) {
            blackBgElement.style.display = 'block';
            blackBgElement.style.opacity = '0';
            setTimeout(() => {
              blackBgElement.style.opacity = '1';
            }, 50);

            // Step 3: After another 1s, fade out logo
            setTimeout(() => {
              logoElement.style.opacity = '0';

              // Step 4: After another 1s, fade out background over remaining time (2s)
              setTimeout(() => {
                blackBgElement.style.opacity = '0';

                // Step 5: Clean up after fade out completes
                setTimeout(() => {
                  logoElement.style.display = 'none';
                  blackBgElement.style.display = 'none';
                  this.logoFadeVisible = false;
                  this.blackBackgroundVisible = false;
                  this.autoFadeOutActive = false; // Reset the toggle
                  console.log('Auto fade out sequence completed');
                }, 2000); // Wait 2 seconds for background fade out
              }, 1000); // 1 second for logo fade out
            }, 1000); // 1 second with logo and background both visible
          }
        }, 1000); // 1 second for logo fade in
      }
    }, 100); // Small delay to ensure DOM is ready
  }

  toggleAutoFadeDiagram() {
    this.autoFadeDiagramActive = !this.autoFadeDiagramActive;
    console.log('Auto fade diagram toggled:', this.autoFadeDiagramActive);

    if (this.autoFadeDiagramActive) {
      console.log('Starting auto fade diagram sequence...');

      // Close the VIEW toolbar (zoomControls) if it's open
      if (
        this.getToolbarVisibility('zoomControls') &&
        !this.operationModeService.isAnyModeActive()
      ) {
        console.log(
          'Closing VIEW toolbar (zoomControls) for auto-fade diagram sequence',
        );

        // Try direct store dispatch
        this.store.dispatch(
          new SetToolbarVisibility('zoomControls' as any, false),
        );

        // Also try the hideToolbar method
        this.hideToolbar('zoomControls');

        setTimeout(() => {
          this.startAutoFadeDiagramSequence();
        }, 150);
      } else {
        this.startAutoFadeDiagramSequence();
      }
    }
  }

  toggleAutoFadeOptions() {
    // When toggling off, just turn it off
    if (this.autoFadeOptionsActive) {
      this.autoFadeOptionsActive = false;
      console.log('Auto fade options turned off');
    } else {
      // When toggling on, the dialog will be shown by the component
      // The actual toggle will happen when the sequence completes
      console.log('Auto fade options toggle - dialog should show');
    }
  }

  onStartCustomAutoFade(options: any) {
    console.log('Starting custom auto fade sequence with options:', options);

    // Set the toggle to active when sequence starts
    this.autoFadeOptionsActive = true;

    // Start the sequence immediately
    this.startCustomAutoFadeSequence(options);
  }

  private startCustomAutoFadeSequence(options: any) {
    console.log('Starting custom auto fade sequence', options);

    // Step 1: Fade the screen to the selected background color
    setTimeout(() => {
      this.blackBackgroundVisible = true;
      const blackBgElement = document.querySelector(
        '.black-background',
      ) as HTMLElement;

      if (blackBgElement) {
        console.log(
          'Step 1: Fading to background color',
          options.backgroundColor,
        );
        console.log('Options received:', JSON.stringify(options, null, 2));

        // Set all properties via setAttribute to ensure they override CSS
        const styleString = `
          display: block !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 99997 !important;
          background: ${options.backgroundColor} !important;
          background-color: ${options.backgroundColor} !important;
          opacity: 0;
          transition: opacity 2s ease-in-out !important;
          pointer-events: none !important;
        `.trim();

        blackBgElement.setAttribute('style', styleString);
        console.log(
          'Applied style attribute:',
          blackBgElement.getAttribute('style'),
        );
        console.log(
          'Computed background before fade:',
          window.getComputedStyle(blackBgElement).backgroundColor,
        );

        setTimeout(() => {
          blackBgElement.style.opacity = '1';
          console.log(
            'Background faded in, computed background:',
            window.getComputedStyle(blackBgElement).backgroundColor,
          );
          console.log('Background element:', blackBgElement);
        }, 50);

        // Step 2: Wait [wait delay] seconds
        setTimeout(() => {
          console.log(
            'Step 2: Wait delay finished, starting logo/text sequence',
          );
          this.executeLogoAndTextSequence(options, blackBgElement);
        }, options.waitDelaySeconds * 1000);
      }
    }, 100);
  }

  private executeLogoAndTextSequence(
    options: any,
    blackBgElement: HTMLElement,
  ) {
    let currentStep = 0;
    const steps: (() => void)[] = [];

    // Build the sequence based on options
    if (options.showLogo) {
      // Logo fade in (2 seconds)
      steps.push(() => {
        console.log('Step: Logo fade in');
        this.logoFadeVisible = true;

        setTimeout(() => {
          const logoElement = document.querySelector(
            '.logo-fade',
          ) as HTMLElement;
          if (logoElement) {
            console.log(
              'Logo element found, applying styles for Auto-Fade Options',
            );
            logoElement.style.display = 'block';
            logoElement.style.opacity = '0';
            logoElement.style.transition = 'opacity 2s ease-in-out';
            logoElement.style.background = 'transparent';
            logoElement.style.zIndex = '100000';
            logoElement.style.position = 'fixed';
            logoElement.style.top = '0';
            logoElement.style.left = '0';
            logoElement.style.width = '100vw';
            logoElement.style.height = '100vh';
            logoElement.style.pointerEvents = 'none';

            // Also control the logo image inside
            const logoImageElement = logoElement.querySelector(
              '.logo-image',
            ) as HTMLElement;
            if (logoImageElement) {
              console.log(
                'Found logo image element in Auto-Fade Options, setting opacity',
              );
              logoImageElement.style.opacity = '0';
              // Slower, more majestic transition - 4 seconds with ease-in-out
              logoImageElement.style.transition =
                'opacity 4s ease-in-out, transform 4s ease-in-out';

              // Add zoom effect if enabled - preserve centering transform
              // Start smaller for more majestic zoom
              if (options.logoZoomEffect) {
                logoImageElement.style.transform =
                  'translate(-50%, -50%) scale(0.85)';
              } else {
                logoImageElement.style.transform =
                  'translate(-50%, -50%) scale(1)';
              }
            }

            // Force reflow before setting opacity
            logoElement.offsetHeight;

            setTimeout(() => {
              console.log('Setting logo opacity to 1 for Auto-Fade Options');
              logoElement.style.opacity = '1';

              // Also fade in the logo image with zoom effect
              if (logoImageElement) {
                console.log(
                  'Setting logo image opacity to 1 for Auto-Fade Options',
                );
                logoImageElement.style.opacity = '1';

                // Zoom in effect if enabled - preserve centering transform
                // Gentler zoom to scale(1.05) for more majestic effect
                if (options.logoZoomEffect) {
                  logoImageElement.style.transform =
                    'translate(-50%, -50%) scale(1.05)';
                } else {
                  logoImageElement.style.transform =
                    'translate(-50%, -50%) scale(1)';
                }
              }

              nextStep();
            }, 100);
          } else {
            console.warn('Logo element not found for Auto-Fade Options');
            nextStep();
          }
        }, 50);
      });

      // Logo display stage
      steps.push(() => {
        console.log(
          `Step: Logo display for ${options.displayStageSeconds} seconds`,
        );
        setTimeout(() => {
          nextStep();
        }, options.displayStageSeconds * 1000);
      });

      // Logo fade out (2 seconds)
      steps.push(() => {
        console.log('Step: Logo fade out');
        const logoElement = document.querySelector('.logo-fade') as HTMLElement;
        if (logoElement) {
          logoElement.style.opacity = '0';

          // Also fade out the logo image
          const logoImageElement = logoElement.querySelector(
            '.logo-image',
          ) as HTMLElement;
          if (logoImageElement) {
            console.log('Fading out logo image for Auto-Fade Options');
            logoImageElement.style.opacity = '0';
          }

          setTimeout(() => {
            logoElement.style.display = 'none';
            this.logoFadeVisible = false;
            nextStep();
          }, 2000);
        } else {
          nextStep();
        }
      });

      // Wait delay after logo
      steps.push(() => {
        console.log(
          `Step: Wait delay after logo for ${options.waitDelaySeconds} seconds`,
        );
        setTimeout(() => {
          nextStep();
        }, options.waitDelaySeconds * 1000);
      });
    }

    if (options.textMessage && options.textMessage.trim()) {
      // Text fade in (2 seconds)
      steps.push(() => {
        console.log('Step: Text fade in', options.textMessage);

        // Remove any existing text elements first
        const oldTextElements = document.querySelectorAll(
          '.custom-auto-fade-text',
        );
        oldTextElements.forEach((el) => el.remove());

        const textElement = this.createTextElement(options);
        if (textElement) {
          console.log('Text element created and appending to body');
          document.body.appendChild(textElement);
          console.log(
            'Text element appended, parent:',
            textElement.parentElement,
          );
          console.log('Text element in DOM:', document.contains(textElement));
          console.log(
            'Text element computed style:',
            window.getComputedStyle(textElement),
          );

          setTimeout(() => {
            console.log('Setting text opacity to 1');

            // Get current style attribute and update opacity
            const currentStyle = textElement.getAttribute('style') || '';
            const finalScale = (textElement as any).textZoomEffect
              ? 'scale(1.05)'
              : 'scale(1)';
            const updatedStyle = currentStyle
              .replace('opacity: 0 !important', 'opacity: 1 !important')
              .replace(
                /transform: translate\(-50%, -50%\) scale\([^)]+\) !important/,
                `transform: translate(-50%, -50%) ${finalScale} !important`,
              );
            textElement.setAttribute('style', updatedStyle);

            console.log('Text element after opacity change:', {
              opacity: textElement.style.opacity,
              computedOpacity: window.getComputedStyle(textElement).opacity,
              computedZIndex: window.getComputedStyle(textElement).zIndex,
              computedColor: window.getComputedStyle(textElement).color,
              computedDisplay: window.getComputedStyle(textElement).display,
              computedVisibility:
                window.getComputedStyle(textElement).visibility,
            });

            // Apply zoom in effect if enabled - gentler zoom for majestic effect
            if ((textElement as any).textZoomEffect) {
              console.log('Applying text zoom effect');
            }

            nextStep();
          }, 100);
        } else {
          nextStep();
        }
      });

      // Text display stage
      steps.push(() => {
        console.log(
          `Step: Text display for ${options.displayStageSeconds} seconds`,
        );
        setTimeout(() => {
          nextStep();
        }, options.displayStageSeconds * 1000);
      });

      // Text fade out (2 seconds)
      steps.push(() => {
        console.log('Step: Text fade out');
        const textElement = document.querySelector(
          '.custom-auto-fade-text',
        ) as HTMLElement;
        if (textElement) {
          textElement.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(textElement);
            nextStep();
          }, 2000);
        } else {
          nextStep();
        }
      });
    }

    // Final step: Fade out background (2 seconds)
    steps.push(() => {
      console.log('Step: Background fade out');
      blackBgElement.style.opacity = '0';
      blackBgElement.style.transition = 'opacity 2s ease-in-out';

      setTimeout(() => {
        blackBgElement.style.display = 'none';
        this.blackBackgroundVisible = false;
        this.autoFadeOptionsActive = false; // Reset the toggle
        console.log('Auto fade options sequence completed');
      }, 2000);
    });

    // Execute steps sequentially
    const nextStep = () => {
      if (currentStep < steps.length) {
        steps[currentStep]();
        currentStep++;
      }
    };

    // Start the sequence
    nextStep();
  }

  private getContrastingShadowColor(backgroundColor: string): string {
    // Convert hex to RGB to determine if background is light or dark
    let r = 0,
      g = 0,
      b = 0;

    if (backgroundColor.startsWith('#')) {
      const hex = backgroundColor.replace('#', '');
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (backgroundColor.startsWith('rgb')) {
      const match = backgroundColor.match(/\d+/g);
      if (match) {
        r = parseInt(match[0]);
        g = parseInt(match[1]);
        b = parseInt(match[2]);
      }
    }

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return dark shadow for light backgrounds, light shadow for dark backgrounds
    return luminance > 0.5 ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)';
  }

  private createTextElement(options: any): HTMLElement {
    console.log('createTextElement called with:', {
      textMessage: options.textMessage,
      foregroundColor: options.foregroundColor,
      textZoomEffect: options.textZoomEffect,
      fontFamily: options.fontFamily,
    });

    const textElement = document.createElement('div');
    textElement.className = 'custom-auto-fade-text';

    // Create contrasting text shadow based on background - subtle for readability
    const shadowColor = this.getContrastingShadowColor(options.backgroundColor);
    const initialScale = options.textZoomEffect ? 'scale(0.85)' : 'scale(1)';
    const fontFamily = options.fontFamily || 'Arial, sans-serif';

    // Set all properties via setAttribute to ensure they override any CSS
    const styleString = `
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) ${initialScale} !important;
      font-size: 6rem !important;
      font-weight: bold !important;
      color: ${options.foregroundColor} !important;
      text-align: center !important;
      z-index: 2147483647 !important;
      transition: opacity 2s ease-in-out, transform 2s ease-in-out !important;
      opacity: 0 !important;
      max-width: 80vw !important;
      word-wrap: break-word !important;
      font-family: ${fontFamily} !important;
      text-shadow: 1px 1px 2px ${shadowColor} !important;
      pointer-events: none !important;
      display: block !important;
      visibility: visible !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
    `.trim();

    textElement.setAttribute('style', styleString);
    textElement.textContent = options.textMessage;

    // Store zoom option for fade in
    (textElement as any).textZoomEffect = options.textZoomEffect;

    console.log('Text element created:', textElement);
    console.log('Text element styles:', {
      position: textElement.style.position,
      zIndex: textElement.style.zIndex,
      color: textElement.style.color,
      foregroundColorRequested: options.foregroundColor,
      fontSize: textElement.style.fontSize,
      top: textElement.style.top,
      left: textElement.style.left,
      opacity: textElement.style.opacity,
      display: textElement.style.display,
      visibility: textElement.style.visibility,
      textContent: textElement.textContent,
      textShadow: textElement.style.textShadow,
    });
    return textElement;
  }

  private startAutoFadeDiagramSequence() {
    console.log('startAutoFadeDiagramSequence called');

    // Step 1: Fade to black background
    setTimeout(() => {
      console.log('Step 1: Setting black background visible');
      this.blackBackgroundVisible = true;

      const blackBgElement = document.querySelector(
        '.black-background',
      ) as HTMLElement;

      if (blackBgElement) {
        console.log('Black background element found, applying styles');
        blackBgElement.style.display = 'block';
        blackBgElement.style.backgroundColor = 'black';
        blackBgElement.style.opacity = '0';
        blackBgElement.style.transition = 'opacity 1s ease-in-out';
        blackBgElement.style.position = 'fixed';
        blackBgElement.style.top = '0';
        blackBgElement.style.left = '0';
        blackBgElement.style.width = '100vw';
        blackBgElement.style.height = '100vh';
        blackBgElement.style.zIndex = '99997';

        setTimeout(() => {
          console.log('Fading in black background');
          blackBgElement.style.opacity = '1';
        }, 50);

        // Step 2: After background is black, fade in the diagram (1 second delay)
        setTimeout(() => {
          console.log('Step 2: Creating and showing diagram');
          this.createAndShowDiagram();

          // Step 3: Wait 4 seconds, then fade out the diagram
          setTimeout(() => {
            console.log('Step 3: Fading out diagram');
            const diagramElement = document.querySelector(
              '.training-diagram',
            ) as HTMLElement;
            if (diagramElement) {
              diagramElement.style.opacity = '0';

              // Step 4: After diagram fades out, fade in logo
              setTimeout(() => {
                console.log('Step 4: Showing logo');
                diagramElement.style.display = 'none';

                // Keep black background at full opacity - logo should appear on top
                console.log(
                  'Step 4: Keeping black background at full opacity, logo should appear on top',
                );
                blackBgElement.style.opacity = '1.0'; // Keep full black background

                this.logoFadeVisible = true;

                // Use setTimeout to ensure Angular has processed the change
                setTimeout(() => {
                  const logoElement = document.querySelector(
                    '.logo-fade',
                  ) as HTMLElement;
                  if (logoElement) {
                    console.log(
                      'Logo element (.logo-fade) found, applying styles',
                    );
                    logoElement.style.display = 'block';
                    logoElement.style.opacity = '0';
                    logoElement.style.transition = 'opacity 1s ease-in-out';
                    logoElement.style.background = 'transparent'; // Remove logo's background
                    logoElement.style.zIndex = '100000'; // Explicitly set higher z-index
                    logoElement.style.position = 'fixed';
                    logoElement.style.top = '0';
                    logoElement.style.left = '0';
                    logoElement.style.width = '100vw';
                    logoElement.style.height = '100vh';
                    logoElement.style.pointerEvents = 'none';

                    console.log(
                      'Logo element z-index set to 100000, should be above everything',
                    );

                    // Also control the logo image inside
                    const logoImageElement = logoElement.querySelector(
                      '.logo-image',
                    ) as HTMLElement;
                    if (logoImageElement) {
                      console.log(
                        'Found logo image element, setting opacity to 0 and transition',
                      );
                      logoImageElement.style.opacity = '0';
                      logoImageElement.style.transition =
                        'opacity 1s ease-in-out';
                    }

                    // Force reflow before setting opacity
                    logoElement.offsetHeight;

                    setTimeout(() => {
                      console.log('Setting logo opacity to 1');
                      logoElement.style.opacity = '1';

                      // Also fade in the logo image
                      if (logoImageElement) {
                        console.log('Setting logo image opacity to 1');
                        logoImageElement.style.opacity = '1';
                      }
                    }, 100);

                    // Step 5: Wait 4 seconds, then fade out logo
                    setTimeout(() => {
                      console.log('Step 5: Fading out logo');
                      logoElement.style.opacity = '0';

                      // Step 6: Wait 3 seconds, then fade out black background
                      setTimeout(() => {
                        console.log('Step 6: Fading out black background');
                        blackBgElement.style.opacity = '0';

                        // Step 7: Clean up after fade out completes
                        setTimeout(() => {
                          console.log('Step 7: Cleaning up');
                          logoElement.style.display = 'none';
                          blackBgElement.style.display = 'none';
                          this.logoFadeVisible = false;
                          this.blackBackgroundVisible = false;
                          this.autoFadeDiagramActive = false; // Reset the toggle
                          console.log('Auto fade diagram sequence completed');
                        }, 1000); // 1 second for background fade out
                      }, 3000); // 3 seconds with black screen
                    }, 4000); // 4 seconds with logo visible
                  } else {
                    console.error('Logo element (.logo-fade) not found');
                  }
                }, 50); // Small delay for Angular to process logoFadeVisible change
              }, 1000); // 1 second for diagram fade out
            } else {
              console.error(
                'Diagram element (.training-diagram) not found for fade out',
              );
            }
          }, 4000); // 4 seconds with diagram visible
        }, 1000); // 1 second for black background fade in
      } else {
        console.error('Black background element (.black-background) not found');
      }
    }, 100); // Small delay to ensure DOM is ready
  }

  private createAndShowDiagram() {
    console.log('createAndShowDiagram called');

    // Create diagram element if it doesn't exist
    let diagramElement = document.querySelector(
      '.training-diagram',
    ) as HTMLElement;

    if (!diagramElement) {
      console.log('Creating new training diagram element');
      diagramElement = document.createElement('div');
      diagramElement.className = 'training-diagram';
      diagramElement.style.position = 'fixed';
      diagramElement.style.top = '0';
      diagramElement.style.left = '0';
      diagramElement.style.width = '100vw';
      diagramElement.style.height = '100vh';
      diagramElement.style.backgroundImage =
        'url(assets/images/TRAINING.SCREENSHOT.png)';
      diagramElement.style.backgroundSize = 'contain';
      diagramElement.style.backgroundRepeat = 'no-repeat';
      diagramElement.style.backgroundPosition = 'center';
      diagramElement.style.backgroundColor = 'black';
      diagramElement.style.zIndex = '9999';
      diagramElement.style.transition = 'opacity 1s ease-in-out';
      diagramElement.style.opacity = '0';
      diagramElement.style.display = 'block';

      document.body.appendChild(diagramElement);
      console.log('Training diagram element created and added to DOM');
    } else {
      console.log('Using existing training diagram element');
      diagramElement.style.display = 'block';
      diagramElement.style.opacity = '0';
    }

    // Fade in the diagram
    setTimeout(() => {
      console.log('Fading in training diagram to opacity 1');
      diagramElement.style.opacity = '1';
    }, 50);
  }
  private updateTheme() {
    console.log('updateTheme called with isDarkMode:', this.isDarkMode);

    // Update SVG background
    if (this.svg) {
      const bgColor = this.colorsService.getBackgroundColor(this.isDarkMode);
      console.log('Updating SVG background to:', bgColor);
      this.svg.style('background', bgColor);
    } else {
      console.log('SVG not found!');
    }

    // Update background circle color and visibility if it exists
    if (this.g) {
      this.g
        .select('circle.background-circle')
        .attr('fill', this.colorsService.getBlueColor(this.isDarkMode))
        .attr('opacity', this.showBackgroundCircle ? 0.25 : 0)
        .attr('pointer-events', this.showBackgroundCircle ? 'all' : 'none');
    }

    // Update rotation control colors
    if (this.degreeGroup) {
      // Update background circle
      this.degreeGroup
        .select('circle:first-child')
        .attr(
          'fill',
          this.isDarkMode
            ? 'rgba(60, 60, 60, 0.9)'
            : 'rgba(255, 255, 255, 0.9)',
        )
        .attr('stroke', this.isDarkMode ? '#555' : '#ccc');

      // Update main control circle
      this.degreeGroup
        .select('circle:nth-child(2)')
        .attr('stroke', this.isDarkMode ? '#aaa' : '#666');

      // Update major ticks
      this.degreeGroup.selectAll('line').attr('stroke', (d: any, i: number) => {
        // First 8 lines are major ticks
        if (i < 8) {
          return this.isDarkMode ? '#ccc' : '#333';
        } else {
          return this.isDarkMode ? '#999' : '#666';
        }
      });

      // Update center dot
      this.degreeGroup
        .select('circle:last-child')
        .attr('fill', this.isDarkMode ? '#aaa' : '#666');
    }
  }

  // Original pan/zoom methods (delegated to VisualizationInteractionService)
  updatePan(event: Event, axis: 'x' | 'y') {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    // Update via interaction service
    this.visualizationInteractionService.updatePan(axis, value);

    if (axis === 'x') {
      this.panX = value;
    } else {
      this.panY = value;
    }

    // Apply the transform
    this.applyTransform();

    // Update selected node text info
    this.updateSelectedNodeTextInfo();
  }

  // Helper methods for dynamic slider ranges
  get panXMin() {
    return -this.width / 2;
  }
  get panXMax() {
    return this.width / 2;
  }
  get panYMin() {
    return -this.height / 2;
  }
  get panYMax() {
    return this.height / 2;
  }

  updateZoom(event: Event) {
    const target = event.target as HTMLInputElement;
    const zoomLevel = parseFloat(target.value);

    // Update local variable
    this.zoomLevel = zoomLevel;

    // Update via interaction service
    this.visualizationInteractionService.updateZoom(zoomLevel);

    // Apply the transform
    this.applyTransform();

    // Update selected node text info
    this.updateSelectedNodeTextInfo();
  }

  private applyTransform() {
    // Safety check: ensure SVG group is initialized
    if (!this.g) {
      console.warn('⚠️ SVG group not initialized yet, skipping transform');
      return;
    }

    // Get current transform state
    const transform = this.visualizationInteractionService.getTransform();
    const dimensions = { width: this.width, height: this.height };

    // Apply combined transform with rotation using VisualizationRendererService
    // For backward compatibility, also apply directly to this.g
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const combinedTransform = `translate(${centerX + transform.panX},${
      centerY + transform.panY
    }) rotate(${transform.rotationAngle}) scale(${
      transform.zoomLevel
    }) translate(${-centerX},${-centerY})`;
    this.g.attr('transform', combinedTransform);
  }

  updateNodeCount(event: Event) {
    const target = event.target as HTMLInputElement;
    const nodeCount = parseInt(target.value);
    this.nodeCount = nodeCount;

    // Regenerate the visualization with new node count
    this.redrawNodes();
    // Recalculate ideal dimensions for new node count
    if (this.treeData) {
      this.calculateAndApplyIdealDimensions(this.treeData);
    }
  }

  regenerateNodes() {
    console.log(
      `Regenerating tree with ${this.nodeCount} nodes using random structure`,
    );

    // Clear current selection since nodes will change
    this.clearNodeSelection();
    this.selectedNode = null;

    // Generate new random tree data with same node count
    this.treeData = this.generateRandomTreeData(this.nodeCount);

    if (this.treeData) {
      // Use new visualization system
      this.updateVisualization();
      console.log(`Generated random tree with ${this.treeNodes.length} nodes`);
    }
  }

  toggleScrollToNode() {
    this.scrollToNodeEnabled = !this.scrollToNodeEnabled;
    console.log('Scroll to node toggled:', this.scrollToNodeEnabled);
  }

  onQuickNavFollowToggle(enabled: boolean) {
    this.quickNavFollowEnabled = enabled;
    console.log('Quick-Nav follow toggled:', this.quickNavFollowEnabled);
  }

  onNodeListFollowToggle(enabled: boolean) {
    this.nodeListFollowEnabled = enabled;
    console.log('Node-List follow toggled:', this.nodeListFollowEnabled);
  }

  onLessonContentQualitySurveyToggle(enabled: boolean) {
    this.lessonContentQualitySurveyEnabled = enabled;
    console.log(
      'Lesson Content Quality Survey toggled:',
      this.lessonContentQualitySurveyEnabled,
    );
  }

  onExploratoryContentQualitySurveyToggle(enabled: boolean) {
    this.exploratoryContentQualitySurveyEnabled = enabled;
    console.log(
      'Exploratory Content Quality Survey toggled:',
      this.exploratoryContentQualitySurveyEnabled,
    );
  }

  onExplorerAutoShowToggle(enabled: boolean) {
    this.explorerAutoShowEnabled = enabled;
    console.log('Explorer auto-show toggled:', this.explorerAutoShowEnabled);
  }

  onLessonSurveyResponse(response: any) {
    console.log('Survey response received:', response);

    // Handle "don't show again" preference
    if (response.dontShowAgain) {
      if ('lessonId' in response) {
        // Disable lesson surveys
        this.dontShowLessonSurveyAgain = true;
        this.lessonContentQualitySurveyEnabled = false;
        console.log('User disabled lesson surveys');
      } else if ('nodeId' in response) {
        // Disable exploratory surveys
        this.dontShowExploratorySurveyAgain = true;
        this.exploratoryContentQualitySurveyEnabled = false;
        console.log('User disabled exploratory surveys');
      }
      // TODO: Persist these preferences to localStorage or user settings
    }

    // Determine survey type based on the response structure
    if ('lessonId' in response) {
      console.log('[MAIN] 📝 Lesson survey response:', response);

      // Mark the lesson as COMPLETED in assigned lessons
      if (response.action === 'finish' && response.save && response.lessonId) {
        // Handle lessonId as either string or number
        const lessonId =
          typeof response.lessonId === 'string'
            ? parseInt(response.lessonId, 10)
            : response.lessonId;

        console.log('[MAIN] 🎯 Dispatching UpdateAssignedLessonStatus:', {
          lessonId,
          status: 'COMPLETED',
          responseAction: response.action,
          responseSave: response.save,
        });

        // Dispatch action to update lesson status in state
        this.store.dispatch(
          new UpdateAssignedLessonStatus(lessonId, 'COMPLETED'),
        );
      } else {
        console.log('[MAIN] ⚠️ Not updating lesson status because:', {
          hasAction: !!response.action,
          actionValue: response.action,
          hasSave: 'save' in response,
          saveValue: response.save,
          hasLessonId: !!response.lessonId,
          lessonIdValue: response.lessonId,
        });
      }

      // Handle lesson survey response
      // TODO: Send lesson survey response to backend API or state management
    } else if ('nodeId' in response) {
      console.log('Node exploration survey response:', response);
      // Handle node exploration survey response
      // TODO: Send node survey response to backend API or state management
    }

    // For now, we'll just log it. In a real implementation, you would:
    // 1. Store it in the state management system
    // 2. Send it to a backend API
    // 3. Update user analytics/progress tracking
  }

  private redrawNodes() {
    // Generate new tree data based on nodeCount
    this.treeData = this.generateTreeData(this.nodeCount);

    // Update breadcrumb path in case there's a selected node
    this.updateBreadcrumbPath();

    // Use new visualization system
    this.updateVisualization();
  }

  private generateTreeData(nodeCount: number): TreeNode {
    // Generate a hierarchical tree structure optimized for radial layout
    const root: TreeNode = {
      id: '0',
      name: 'Node 0',
      description: this.mockDataService.generateNodeDescription('0'),
      videoUrl: this.mockDataService.generateNodeVideoUrl('0'),
      children: [],
    };

    // For a single node, just return the root
    if (nodeCount === 1) {
      return root;
    }

    // Calculate tree structure parameters for better radial distribution
    const maxDepth = Math.max(
      2,
      Math.min(4, Math.floor(Math.log2(nodeCount)) + 1),
    );
    // For radial trees, we want more even distribution across levels
    // Ensure at least 2 branches for the root node
    const branching = Math.max(
      2,
      Math.ceil(Math.pow(nodeCount - 1, 1 / maxDepth)),
    );

    let nodeCounter = 1;

    // Recursive function to build tree with better radial distribution
    const buildTree = (
      node: TreeNode,
      depth: number,
      maxNodes: number,
    ): void => {
      if (depth >= maxDepth || nodeCounter >= nodeCount) return;

      // Calculate children count for this level
      const remainingNodes = nodeCount - nodeCounter;
      const remainingDepth = maxDepth - depth - 1;

      let childrenCount: number;
      if (depth === 0) {
        // Root level: ensure at least 2 children if we have enough nodes
        const minRootChildren = Math.min(2, remainingNodes);
        if (remainingDepth === 0) {
          // Last level - add all remaining nodes (but at least 2 for root)
          childrenCount = Math.max(
            minRootChildren,
            Math.min(branching, remainingNodes),
          );
        } else {
          // Distribute nodes more evenly for radial layout, but ensure minimum 2 for root
          const nodesPerBranch = Math.ceil(remainingNodes / branching);
          childrenCount = Math.max(
            minRootChildren,
            Math.min(
              branching,
              Math.ceil(remainingNodes / Math.pow(branching, remainingDepth)),
            ),
          );
        }
      } else if (remainingDepth === 0) {
        // Last level - add all remaining nodes
        childrenCount = Math.min(branching, remainingNodes);
      } else {
        // Distribute nodes more evenly for radial layout
        const nodesPerBranch = Math.ceil(remainingNodes / branching);
        childrenCount = Math.min(
          branching,
          Math.ceil(remainingNodes / Math.pow(branching, remainingDepth)),
        );
      }

      for (let i = 0; i < childrenCount && nodeCounter < nodeCount; i++) {
        const child: TreeNode = {
          id: nodeCounter.toString(),
          name: `Node ${nodeCounter}`,
          description: this.mockDataService.generateNodeDescription(
            nodeCounter.toString(),
          ),
          videoUrl: this.mockDataService.generateNodeVideoUrl(
            nodeCounter.toString(),
          ),
          children: [],
        };

        node.children!.push(child);
        nodeCounter++;

        // Recursively build subtree
        buildTree(child, depth + 1, nodeCount);
      }
    };

    buildTree(root, 0, nodeCount);

    // Calculate and apply ideal dimensions after tree structure is known
    this.calculateAndApplyIdealDimensions(root);

    return root;
  }

  // Calculate ideal dimensions based on tree structure
  private calculateAndApplyIdealDimensions(treeData: TreeNode): void {
    // Calculate tree depth and max breadth
    let maxDepth = 0;
    let maxBreadth = 0;
    const breadthByLevel: number[] = [];

    const traverse = (node: TreeNode, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);
      breadthByLevel[depth] = (breadthByLevel[depth] || 0) + 1;
      maxBreadth = Math.max(maxBreadth, breadthByLevel[depth]);

      if (node.children) {
        node.children.forEach((child) => traverse(child, depth + 1));
      }
    };

    traverse(treeData, 0);

    // Calculate ideal dimensions based on tree structure with generous spacing
    const nodeSpacing = 100; // Increased spacing between nodes
    const depthSpacing = 150; // Increased spacing per depth level

    if (this.selectedFormat === 'radial') {
      // For radial: radius should accommodate depth with proper spacing
      const idealRadius = Math.max(250, (maxDepth + 1) * depthSpacing);
      this.visualizationRadiusIdeal = Math.ceil(idealRadius);
      this.visualizationRadiusMax = Math.ceil(idealRadius * 2); // 200% of ideal
      this.visualizationRadius = Math.ceil(idealRadius * 0.67); // 2/3 of ideal
    } else if (this.selectedFormat === 'horizontal') {
      // For horizontal: width for depth, height for breadth
      const idealWidth = Math.max(750, (maxDepth + 1) * depthSpacing * 1.5);
      const idealHeight = Math.max(500, maxBreadth * nodeSpacing);
      this.visualizationWidthIdeal = Math.ceil(idealWidth);
      this.visualizationHeightIdeal = Math.ceil(idealHeight);
      this.visualizationWidthMax = Math.ceil(idealWidth * 2);
      this.visualizationHeightMax = Math.ceil(idealHeight * 2);
      this.visualizationWidth = Math.ceil(idealWidth * 0.67);
      this.visualizationHeight = Math.ceil(idealHeight * 0.67);
    } else if (this.selectedFormat === 'vertical') {
      // For vertical: height for depth, width for breadth
      const idealHeight = Math.max(750, (maxDepth + 1) * depthSpacing * 1.5);
      const idealWidth = Math.max(500, maxBreadth * nodeSpacing);
      this.visualizationWidthIdeal = Math.ceil(idealWidth);
      this.visualizationHeightIdeal = Math.ceil(idealHeight);
      this.visualizationWidthMax = Math.ceil(idealWidth * 2);
      this.visualizationHeightMax = Math.ceil(idealHeight * 2);
      this.visualizationWidth = Math.ceil(idealWidth * 0.67);
      this.visualizationHeight = Math.ceil(idealHeight * 0.67);
    }
  }

  private generateRandomTreeData(nodeCount: number): TreeNode {
    // Generate a completely random tree structure for stress testing
    const root: TreeNode = {
      id: '0',
      name: 'Node 0',
      description: this.mockDataService.generateNodeDescription('0_random'),
      videoUrl: this.mockDataService.generateNodeVideoUrl('0'),
      children: [],
    };

    if (nodeCount <= 1) return root;

    let nodeCounter = 1;
    const nodes: TreeNode[] = [root]; // Keep track of all nodes that can have children

    // Randomly distribute remaining nodes
    while (nodeCounter < nodeCount && nodes.length > 0) {
      // Pick a random parent from existing nodes
      const randomParentIndex = Math.floor(Math.random() * nodes.length);
      const parent = nodes[randomParentIndex];

      // Decide how many children this parent should get (1 to min(5, remainingNodes))
      const remainingNodes = nodeCount - nodeCounter;
      const maxChildren = Math.min(5, remainingNodes); // Cap at 5 children per node
      const minChildren = 1;
      const childrenCount =
        Math.floor(Math.random() * (maxChildren - minChildren + 1)) +
        minChildren;

      // Add children to this parent
      for (let i = 0; i < childrenCount && nodeCounter < nodeCount; i++) {
        const child: TreeNode = {
          id: nodeCounter.toString(),
          name: `Node ${nodeCounter}`,
          description: this.mockDataService.generateNodeDescription(
            `${nodeCounter}_random`,
          ),
          videoUrl: this.mockDataService.generateNodeVideoUrl(
            nodeCounter.toString(),
          ),
          children: [],
        };

        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(child);
        nodes.push(child); // This child can also have children later
        nodeCounter++;
      }

      // Randomly decide if this parent should be removed from potential parents
      // This creates more varied tree structures
      if (Math.random() < 0.3) {
        // 30% chance to stop adding children to this parent
        nodes.splice(randomParentIndex, 1);
      }
    }

    console.log(
      `Generated random tree: ${nodeCounter} nodes, max depth estimation: ${this.calculateTreeDepth(
        root,
      )}`,
    );

    // Calculate and apply ideal dimensions after tree structure is known
    this.calculateAndApplyIdealDimensions(root);

    return root;
  }

  private calculateTreeDepth(node: TreeNode): number {
    if (!node.children || node.children.length === 0) {
      return 0;
    }

    let maxChildDepth = 0;
    for (const child of node.children) {
      const childDepth = this.calculateTreeDepth(child);
      maxChildDepth = Math.max(maxChildDepth, childDepth);
    }

    return maxChildDepth + 1;
  }

  private generateTreeLayout(treeData: TreeNode): {
    nodes: D3TreeNode[];
    links: any[];
  } {
    // Calculate the content bounds
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const availableWidth = this.width;
    const availableHeight = this.height - 120; // Account for control panels
    const contentRadius = Math.min(availableWidth, availableHeight) * 0.35;

    // Maximum radius for the radial tree (fit within content area)
    const maxRadius = contentRadius * 0.8;

    // Create D3 hierarchy
    const hierarchy = d3.hierarchy(treeData);

    // Create radial tree layout
    this.treeLayout = d3
      .tree<TreeNode>()
      .size([2 * Math.PI, maxRadius]) // Full circle (2π radians) and max radius
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    // Apply layout to hierarchy
    const treeWithLayout = this.treeLayout(hierarchy);

    // Extract nodes and convert from polar to cartesian coordinates
    const nodes = treeWithLayout.descendants().map((d: any, index: number) => {
      // Convert polar coordinates (angle, radius) to cartesian (x, y)
      const angle = d.x; // d.x is the angle in radians
      const radius = d.y; // d.y is the distance from center

      // Convert to cartesian coordinates centered on screen
      const x = centerX + radius * Math.cos(angle - Math.PI / 2); // -π/2 to start from top
      const y = centerY + radius * Math.sin(angle - Math.PI / 2);

      // STANDARDIZED ID: Use node's data.id, fallback to index
      const nodeId = d.data.id || index.toString();

      if (index < 3) {
        console.log(
          `[LAYOUT] Node ${index}: data.id="${d.data.id}" -> nodeId="${nodeId}", data.name="${d.data.name}"`,
        );
      }

      return {
        ...d,
        id: nodeId, // Standardized ID for drawing (circles and text)
        nodeId: nodeId, // Also store as nodeId for clarity
        videoUrl: d.data.videoUrl, // Copy videoUrl to node level for easier template access
        x: x,
        y: y,
        r: d.depth === 0 ? 16 : 12, // Root node slightly larger
        angle: angle, // Store original angle for potential future use
        radius: radius, // Store original radius for potential future use
      };
    }) as D3TreeNode[];

    // Extract links and convert coordinates
    const links = treeWithLayout.links().map((d: any) => {
      // Convert source coordinates
      const sourceAngle = d.source.x;
      const sourceRadius = d.source.y;
      const sourceX =
        centerX + sourceRadius * Math.cos(sourceAngle - Math.PI / 2);
      const sourceY =
        centerY + sourceRadius * Math.sin(sourceAngle - Math.PI / 2);

      // Convert target coordinates
      const targetAngle = d.target.x;
      const targetRadius = d.target.y;
      const targetX =
        centerX + targetRadius * Math.cos(targetAngle - Math.PI / 2);
      const targetY =
        centerY + targetRadius * Math.sin(targetAngle - Math.PI / 2);

      return {
        source: { x: sourceX, y: sourceY },
        target: { x: targetX, y: targetY },
      };
    });

    return { nodes, links };
  }

  // Initialize all visualization layout functions (delegated to TreeVisualizationService)
  private initializeVisualizationLayouts(): void {
    const dimensions = {
      width: this.visualizationWidth,
      height: this.visualizationHeight,
      radius: this.visualizationRadius,
      margin: { top: 40, right: 40, bottom: 40, left: 40 },
      centerX: this.width / 2, // Actual viewport center X
      centerY: this.height / 2, // Actual viewport center Y
    };

    // Initialize the current visualization type with dimensions
    this.treeVisualizationService.setVisualizationType(
      this.selectedVisualization,
      dimensions,
    );

    // Legacy layout properties kept for compatibility with existing code
    // These are now managed by the TreeVisualizationService
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    // Radial Tree Layout - uses visualizationRadius
    this.radialTreeLayout = d3
      .tree()
      .size([360, this.visualizationRadius - this.visualizationRadius * 0.05])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    // Radial Cluster Layout - uses visualizationRadius
    this.radialClusterLayout = d3
      .cluster()
      .size([2 * Math.PI, this.visualizationRadius])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    // Horizontal Tree Layout - uses visualizationWidth
    this.horizontalTreeLayout = d3
      .tree()
      .size([
        this.height - margin.top - margin.bottom,
        this.visualizationWidth - margin.left - margin.right,
      ]);

    // Vertical Tree Layout - uses visualizationHeight
    this.verticalTreeLayout = d3
      .tree()
      .size([
        this.width - margin.left - margin.right,
        this.visualizationHeight - margin.top - margin.bottom,
      ]);

    // Horizontal Cluster Layout - uses visualizationWidth
    this.horizontalClusterLayout = d3
      .cluster()
      .size([this.height, this.visualizationWidth - 160]);

    // Vertical Cluster Layout - uses visualizationHeight
    this.verticalClusterLayout = d3
      .cluster()
      .size([this.width - 160, this.visualizationHeight]);

    // Link generators
    this.radialLinkGenerator = d3
      .linkRadial()
      .angle((d: any) => (d.x / 180) * Math.PI)
      .radius((d: any) => d.y);

    this.horizontalLinkGenerator = d3
      .linkHorizontal()
      .x((d: any) => d.y)
      .y((d: any) => d.x);

    this.verticalLinkGenerator = d3
      .linkVertical()
      .x((d: any) => d.x)
      .y((d: any) => d.y);
  }

  // Method to change visualization type
  public onVisualizationChange(visualizationType: string): void {
    this.selectedVisualization = visualizationType;
    this.parseVisualizationType(visualizationType);
    // Recalculate ideal dimensions for new visualization type
    if (this.treeData) {
      this.calculateAndApplyIdealDimensions(this.treeData);
    }
    this.updateVisualization();
  }

  public onVisualizationFormatChange(format: string): void {
    this.selectedFormat = format;

    // Reset layout style to default if switching away from hex
    if (format !== 'hex' && this.selectedLayoutStyle === 'hex') {
      this.selectedLayoutStyle = 'tree';
    }

    // Update selectedVisualization based on combined format and layout
    this.selectedVisualization = this.getCombinedVisualizationType();
    console.log(
      `Format changed to ${format}, visualization type updated to: ${this.selectedVisualization}`,
    );

    // Recalculate ideal dimensions for new visualization type
    if (this.treeData) {
      this.calculateAndApplyIdealDimensions(this.treeData);
    }
    this.updateVisualization();
  }

  public onVisualizationLayoutStyleChange(style: string): void {
    this.selectedLayoutStyle = style;

    // Update selectedVisualization based on combined format and layout
    this.selectedVisualization = this.getCombinedVisualizationType();
    console.log(
      `Layout style changed to ${style}, visualization type updated to: ${this.selectedVisualization}`,
    );

    this.updateVisualization();
  }

  public onVisualizationRadiusChange(radius: number): void {
    this.visualizationRadius = radius;
    this.initializeVisualizationLayouts(); // Recreate layouts with new radius
    this.updateVisualization();
  }

  public onVisualizationWidthChange(width: number): void {
    this.visualizationWidth = width;
    this.initializeVisualizationLayouts(); // Recreate layouts with new width
    this.updateVisualization();
  }

  public onVisualizationHeightChange(height: number): void {
    this.visualizationHeight = height;
    this.initializeVisualizationLayouts(); // Recreate layouts with new height
    this.updateVisualization();
  }

  public onRedDotCenterToggle(enabled: boolean): void {
    this.redDotCenterEnabled = enabled;
    this.updateRedDotCenter();
  }

  public onRedDotCenterSizeChange(size: number): void {
    this.redDotCenterSize = size;
    this.updateRedDotCenter();
  }

  public onBlueDotScreenCenterToggle(enabled: boolean): void {
    this.blueDotScreenCenterEnabled = enabled;
    this.updateBlueDotScreenCenter();
  }

  public onBlueDotScreenCenterSizeChange(size: number): void {
    this.blueDotScreenCenterSize = size;
    this.updateBlueDotScreenCenter();
  }

  public onNodeSizeChange(size: string): void {
    this.nodeSize = size as 'xsmall' | 'small' | 'medium' | 'large';
    this.updateVisualization();
  }

  public onTextPositionChange(position: string): void {
    this.textPosition = position;
    this.updateVisualization();
  }

  public onTextFontFamilyChange(fontFamily: string): void {
    this.textFontFamily = fontFamily;
    this.updateVisualization();
  }

  public onLineTypeChange(lineType: string): void {
    this.lineType = lineType as 'line' | 'step' | 'curve';
    this.updateVisualization();
  }

  public onLinkThicknessChange(thickness: number): void {
    this.linkThickness = Math.max(0.5, Math.min(5, thickness)); // Clamp to 0.5-5px
    this.updateVisualization();
    this.applyLinkThickness();
  }

  public onLinkColorOverrideChange(color: string): void {
    this.linkColorOverride = color;
    this.updateVisualization();
    this.applyLinkColorOverride();
  }

  public onClearLinkColorOverride(): void {
    this.linkColorOverride = null;
    this.updateVisualization();
  }

  public onLinkConnectionChange(connection: string): void {
    this.linkConnection = connection as 'full' | 'short';
    this.updateVisualization();
  }

  public onBackgroundStyleChange(style: string): void {
    this.backgroundStyle = style as
      | 'aqua-circle'
      | 'follow-mode'
      | 'pure-black'
      | 'digital-blue'
      | 'digital-green'
      | 'tenant-definition';
    this.updateBackgroundStyle();
  }

  public onColorTargetChange(target: string): void {
    this.colorTarget = target as 'nodes' | 'text' | 'both';
    this.store.dispatch(new UpdateColorTarget(this.colorTarget));
    // Redraw visualization so circles/text get the correct default colors based on colorTarget
    this.updateVisualization();
    // Then re-apply colorization so any colorized colors are applied correctly
    this.autoApplyColorization();
  }

  public onColorizationCategoryChange(category: string): void {
    this.colorizationCategory = category;
    console.log('Colorization category changed to:', this.colorizationCategory);
  }

  public onColorStrategyChange(strategy: string): void {
    this.colorStrategy = strategy;
    console.log('Color strategy changed to:', this.colorStrategy);
    // Optionally trigger visualization update if needed
    // this.updateVisualization();
  }

  public onSelectedBranchIndexChange(branchIndex: number): void {
    this.selectedBranchIndex = branchIndex;
    // Re-apply colorization with new branch selection
    this.autoApplyColorization();
  }

  public onQualifiedColorChange(color: string): void {
    this.qualifiedColor = color;
    // Re-apply colorization with new qualified color
    this.autoApplyColorization();
  }

  public onUnqualifiedColorChange(color: string): void {
    this.unqualifiedColor = color;
    // Re-apply colorization with new unqualified color
    this.autoApplyColorization();
  }

  public onIncludeColorKeyChange(includeKey: boolean): void {
    console.log('🔑 Include Color Key changed to:', includeKey);
    this.includeColorKey = includeKey;
    // Show or hide the color key based on the setting
    if (this.includeColorKey && this.colorizationResult?.key) {
      console.log('📍 Showing color key');
      this.showColorKey(this.colorizationResult);
    } else {
      console.log('📍 Hiding color key');
      this.hideColorKey();
    }
  }

  public onKeyPositionChange(position: string): void {
    this.keyPosition = position as
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right';
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  public onKeyFontChange(font: string): void {
    this.keyFont = font;
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  public onKeyFontSizeChange(size: number): void {
    this.keyFontSize = size;
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  public onKeyColorShapeChange(shape: string): void {
    this.keyColorShape = shape as
      | 'circle'
      | 'square'
      | 'rectangle'
      | 'triangle'
      | 'diamond'
      | 'pentagon'
      | 'hexagon'
      | 'octagon';
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  public onKeyColorUniformityChange(uniformity: string): void {
    this.keyColorUniformity = uniformity as 'solid' | 'gradient';
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  public onKeyColorSizeChange(size: number): void {
    this.keyColorSize = size;
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  public onKeyTitleChange(title: string): void {
    this.keyTitle = title;
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  public onKeyTitleFontChange(font: string): void {
    this.keyTitleFont = font;
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  public onKeyTitleFontSizeChange(size: number): void {
    this.keyTitleFontSize = size;
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  public onKeyBorderChange(border: string): void {
    this.keyBorder = border as 'none' | 'solid' | 'shadow';
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  public onKeyBorderColorChange(color: string): void {
    this.keyBorderColor = color;
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  public onKeyBackgroundColorChange(color: string): void {
    this.keyBackgroundColor = color;
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  public onKeyTextColorChange(color: string): void {
    this.keyTextColor = color;
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  public onKeyTitleTextColorChange(color: string): void {
    this.keyTitleTextColor = color;
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  // Title event handlers
  public onEnableTitleChange(enabled: boolean): void {
    this.enableTitle = enabled;
    this.updateVisualization();
  }

  public onTitlePositionChange(position: string): void {
    this.titlePosition = position as any;
    this.updateVisualization();
  }

  public onTitleLine1Change(text: string): void {
    this.titleLine1 = text;
    this.updateVisualization();
  }

  public onTitleLine1FontChange(font: string): void {
    this.titleLine1Font = font;
    this.updateVisualization();
  }

  public onTitleLine1SizeChange(size: number): void {
    this.titleLine1Size = size;
    this.updateVisualization();
  }

  public onTitleLine1ColorChange(color: string): void {
    this.titleLine1Color = color;
    this.updateVisualization();
  }

  public onTitleLine1BoldChange(bold: boolean): void {
    this.titleLine1Bold = bold;
    this.updateVisualization();
  }

  public onTitleLine1ItalicChange(italic: boolean): void {
    this.titleLine1Italic = italic;
    this.updateVisualization();
  }

  public onTitleLine1UppercaseChange(uppercase: boolean): void {
    this.titleLine1Uppercase = uppercase;
    this.updateVisualization();
  }

  public onTitleLine1UnderlineChange(underline: boolean): void {
    this.titleLine1Underline = underline;
    this.updateVisualization();
  }

  public onTitleLine2Change(text: string): void {
    this.titleLine2 = text;
    this.updateVisualization();
  }

  public onTitleLine2FontChange(font: string): void {
    this.titleLine2Font = font;
    this.updateVisualization();
  }

  public onTitleLine2SizeChange(size: number): void {
    this.titleLine2Size = size;
    this.updateVisualization();
  }

  public onTitleLine2ColorChange(color: string): void {
    this.titleLine2Color = color;
    this.updateVisualization();
  }

  public onTitleLine2BoldChange(bold: boolean): void {
    this.titleLine2Bold = bold;
    this.updateVisualization();
  }

  public onTitleLine2ItalicChange(italic: boolean): void {
    this.titleLine2Italic = italic;
    this.updateVisualization();
  }

  public onTitleLine2UppercaseChange(uppercase: boolean): void {
    this.titleLine2Uppercase = uppercase;
    this.updateVisualization();
  }

  public onTitleLine2UnderlineChange(underline: boolean): void {
    this.titleLine2Underline = underline;
    this.updateVisualization();
  }

  public onTitleBorderTypeChange(borderType: string): void {
    this.titleBorderType = borderType as any;
    this.updateVisualization();
  }

  public onTitleBorderColorChange(color: string): void {
    this.titleBorderColor = color;
    this.updateVisualization();
  }

  public onTitleBorderThicknessChange(thickness: number): void {
    this.titleBorderThickness = thickness;
    this.updateVisualization();
  }

  public onTitleBackgroundColorChange(color: string): void {
    this.titleBackgroundColor = color;
    this.updateVisualization();
  }

  public onOverrideRootNodeStyleChange(enabled: boolean): void {
    this.overrideRootNodeStyle = enabled;
  }

  public onTreeTextStyleChange(style: string): void {
    // Handle checkbox-based styles
    if (style === 'bold') {
      this.treeTextBold = !this.treeTextBold;
    } else if (style === 'italic') {
      this.treeTextItalic = !this.treeTextItalic;
    } else if (style === 'uppercase') {
      this.treeTextUppercase = !this.treeTextUppercase;
    } else {
      // Handle select-based style (legacy)
      this.treeTextStyle = style as 'normal' | 'bold' | 'underline';
    }
    // Update visualization to apply new styles
    this.updateVisualization();
  }

  public onTreeTextSizeChange(size: number): void {
    this.treeTextSize = size;
    this.updateVisualization();
  }

  public onKeyTitleBoldChange(bold: boolean): void {
    this.keyTitleBold = bold;
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  public onKeyTitleUnderlineChange(underline: boolean): void {
    this.keyTitleUnderline = underline;
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  public onKeyTitleItalicChange(italic: boolean): void {
    this.keyTitleItalic = italic;
    // Update the key if it's currently displayed
    if (this.includeColorKey && this.colorizationResult?.key) {
      this.showColorKey(this.colorizationResult);
    }
  }

  public onTreeTextFontChange(font: string): void {
    this.treeTextFont = font;
    // Apply font to tree text labels
    if (this.svg) {
      this.svg.selectAll('.tree-node-label').style('font-family', font);
    }
  }

  public onNodeFillColorChange(color: string): void {
    this.nodeFillColor = color;
    console.log('🎨 Node fill color changed to:', this.nodeFillColor);
    this.store.dispatch(new UpdateNodeFillColor(color));
    // When colorTarget is 'text', update circle fills directly since they show nodeFillColor
    if (this.colorTarget === 'text' && this.svg) {
      this.svg.selectAll('circle.tree-node').style('fill', (d: any) => {
        if (this.overrideRootNodeStyle && d.depth === 0) {
          return this.rootNodeFillColor;
        }
        return this.nodeFillColor;
      });
    } else {
      // Re-apply colorization to reflect new color
      this.autoApplyColorization();
    }
  }

  public onNodeStrokeColorChange(color: string): void {
    this.nodeStrokeColor = color;
    console.log('🎨 Node stroke color changed to:', this.nodeStrokeColor);
    this.store.dispatch(new UpdateNodeStrokeColor(color));
    // When colorTarget is 'text', update circle strokes directly since they show nodeStrokeColor
    if (this.colorTarget === 'text' && this.svg) {
      this.svg
        .selectAll('circle.tree-node')
        .style(
          'stroke',
          this.nodeStrokeColor || (this.isDarkMode ? '#fff' : '#333'),
        );
    } else {
      // Re-apply colorization to reflect new color
      this.autoApplyColorization();
    }
  }

  public onTextFillColorChange(color: string): void {
    this.textFillColor = color;
    console.log('🎨 Text fill color changed to:', this.textFillColor);
    this.store.dispatch(new UpdateTextFillColor(color));
    // When colorTarget is 'nodes' or 'both', update text fills directly since they show textFillColor
    if (
      (this.colorTarget === 'nodes' || this.colorTarget === 'both') &&
      this.svg
    ) {
      console.log('Directly updating text fill to', this.textFillColor);
      this.svg
        .selectAll('text.tree-node-label')
        .style('fill', this.textFillColor);
    } else {
      // For 'text' mode, apply full colorization
      this.autoApplyColorization();
    }
  }

  public onTextStrokeColorChange(color: string): void {
    this.textStrokeColor = color;
    console.log('🎨 Text stroke color changed to:', this.textStrokeColor);
    this.store.dispatch(new UpdateTextStrokeColor(color));
    // When colorTarget is 'nodes' or 'both', update text strokes directly since they show textStrokeColor
    if (
      (this.colorTarget === 'nodes' || this.colorTarget === 'both') &&
      this.svg
    ) {
      console.log('Directly updating text stroke to', this.textStrokeColor);
      this.svg
        .selectAll('text.tree-node-label')
        .style('stroke', this.textStrokeColor || 'none');
    } else {
      // For 'text' mode, apply full colorization
      this.autoApplyColorization();
    }
  }

  public onColorUniformityChange(uniformity: string): void {
    this.colorUniformity = uniformity as 'Solid' | 'Gradient';
    console.log('📊 Color uniformity changed to:', this.colorUniformity);
    // Re-apply colorization with new uniformity setting
    this.autoApplyColorization();
  }

  public onColorGradientDirectionalityChange(directionality: string): void {
    this.colorGradientDirectionality = directionality as 'sunset' | 'sunrise';
    console.log(
      '📊 Gradient directionality changed to:',
      this.colorGradientDirectionality,
    );
    // Re-apply colorization with new directionality setting
    this.autoApplyColorization();
  }

  public onColorBrightnessChange(brightness: number): void {
    this.colorBrightness = Math.max(0, Math.min(100, brightness)); // Clamp to 0-100
    console.log('📊 Color brightness changed to:', this.colorBrightness);
    this.store.dispatch(new UpdateColorBrightness(this.colorBrightness));
    // Re-apply colorization with new brightness setting
    this.autoApplyColorization();
  }

  public onColorGradientBrightnessEndChange(brightnessEnd: number): void {
    this.colorGradientBrightnessEnd = Math.max(0, Math.min(100, brightnessEnd)); // Clamp to 0-100
    console.log(
      '📊 Gradient brightness end changed to:',
      this.colorGradientBrightnessEnd,
    );
    this.store.dispatch(
      new UpdateColorGradientBrightnessEnd(this.colorGradientBrightnessEnd),
    );
    // Re-apply colorization with new brightness end setting
    this.autoApplyColorization();
  }

  public onNodeOpacityChange(opacity: number): void {
    this.nodeOpacity = Math.max(0, Math.min(1, opacity)); // Clamp to 0-1
    // Sync all other opacity sliders to match Node Opacity
    this.circleOpacity = this.nodeOpacity;
    this.textOpacity = this.nodeOpacity;
    this.linkOpacity = this.nodeOpacity;
    console.log(
      '📊 Node opacity changed to:',
      this.nodeOpacity,
      '(synced to all opacities)',
    );
    this.updateNodeOpacity();
  }

  // Update node opacity in visualization (affects text, circle, and link - select all)
  private updateNodeOpacity(): void {
    if (!this.svg || !this.treeNodesGroup) return;

    const t = d3.transition().duration(300).ease(d3.easeCubicInOut);

    // Update opacity of node groups (circles)
    this.treeNodesGroup
      .selectAll('.tree-node-group')
      .transition(t)
      .style('opacity', this.treeVisible ? this.nodeOpacity : 0);

    // Update opacity of text labels
    this.svg
      .selectAll('.tree-node-label')
      .transition(t)
      .style('opacity', this.treeVisible ? this.nodeOpacity : 0);

    // Update opacity of links
    this.svg
      .selectAll('.tree-link')
      .transition(t)
      .style('opacity', this.treeVisible ? this.nodeOpacity : 0);
  }

  public onCircleOpacityChange(opacity: number): void {
    this.circleOpacity = Math.max(0, Math.min(1, opacity)); // Clamp to 0-1
    console.log('⭕ Circle opacity changed to:', this.circleOpacity);
    this.updateCircleOpacity();
  }

  // Update circle opacity in visualization (affects only circles)
  private updateCircleOpacity(): void {
    if (!this.svg) return;

    const t = d3.transition().duration(300).ease(d3.easeCubicInOut);

    // Update opacity of circle elements only
    this.svg
      .selectAll('circle.tree-node')
      .transition(t)
      .style('opacity', this.treeVisible ? this.circleOpacity : 0);
  }

  public onTextOpacityChange(opacity: number): void {
    this.textOpacity = Math.max(0, Math.min(1, opacity)); // Clamp to 0-1
    console.log('📝 Text opacity changed to:', this.textOpacity);
    this.updateTextOpacity();
  }

  // Update text opacity in visualization
  private updateTextOpacity(): void {
    if (!this.svg) return;

    const t = d3.transition().duration(300).ease(d3.easeCubicInOut);

    // Update opacity of all text label elements
    this.svg
      .selectAll('.tree-node-label')
      .transition(t)
      .style('opacity', this.treeVisible ? this.textOpacity : 0);
  }

  public onLinkOpacityChange(opacity: number): void {
    this.linkOpacity = Math.max(0, Math.min(1, opacity)); // Clamp to 0-1
    console.log('🔗 Link opacity changed to:', this.linkOpacity);
    this.updateLinkOpacity();
  }

  // Update link opacity in visualization
  private updateLinkOpacity(): void {
    if (!this.svg) return;

    const t = d3.transition().duration(300).ease(d3.easeCubicInOut);

    // Update opacity of all link elements
    this.svg
      .selectAll('.tree-link')
      .transition(t)
      .style('opacity', this.treeVisible ? this.linkOpacity : 0);
  }

  public onBackgroundCircleChange(show: boolean): void {
    this.showBackgroundCircle = show;
    console.log(
      '🎨 Background circle visibility changed to:',
      this.showBackgroundCircle,
    );
    this.updateBackgroundCircleVisibility();
  }

  public onOverrideRootNodeToggle(enabled: boolean): void {
    this.overrideRootNodeStyle = enabled;
    console.log('🎯 Root node override enabled:', enabled);
    this.updateVisualization(); // Refresh to apply/remove overrides
  }

  public onRootNodeFontChange(font: string): void {
    this.rootNodeFont = font;
    console.log('🎯 Root node font changed to:', font);
    this.updateVisualization();
  }

  public onRootNodeSizeChange(size: number): void {
    this.rootNodeSize = size;
    console.log('🎯 Root node size changed to:', size);
    this.updateVisualization();
  }

  public onRootNodeStyleChange(style: string): void {
    // Handle checkbox-based styles
    if (style === 'bold') {
      this.rootNodeBold = !this.rootNodeBold;
    } else if (style === 'italic') {
      this.rootNodeItalic = !this.rootNodeItalic;
    } else if (style === 'uppercase') {
      this.rootNodeUppercase = !this.rootNodeUppercase;
    } else {
      // Handle select-based style (legacy)
      this.rootNodeStyle = style as 'normal' | 'bold' | 'italic';
    }
    console.log('🎯 Root node style changed to:', style);
    this.updateVisualization();
  }

  public onRootNodeStrokeColorChange(color: string): void {
    this.rootNodeStrokeColor = color;
    console.log('🎯 Root node stroke color changed to:', color);
    this.updateVisualization();
  }

  public onRootNodeFillColorChange(color: string): void {
    this.rootNodeFillColor = color;
    console.log('🎯 Root node fill color changed to:', color);
    this.updateVisualization();
  }

  public onRootNodeTextColorChange(color: string): void {
    this.rootNodeTextColor = color;
    console.log('🎯 Root node text color changed to:', color);
    this.updateVisualization();
  }

  // Update background circle visibility in visualization
  private updateBackgroundCircleVisibility(): void {
    if (!this.g) return;

    const t = d3.transition().duration(300).ease(d3.easeCubicInOut);

    // Update background circle opacity and pointer events
    this.g
      .select('circle.background-circle')
      .transition(t)
      .attr('opacity', this.showBackgroundCircle ? 0.25 : 0)
      .attr('pointer-events', this.showBackgroundCircle ? 'all' : 'none');
  }

  public onApplyColorizationClicked(): void {
    //alert('🎨 Apply button clicked!');
    console.log('🎨 Apply Colorization clicked');

    // Build the colorization arguments based on current selections
    const colorizationArgs = {
      selectedBranchIndex: this.selectedBranchIndex,
      qualifiedColor: this.qualifiedColor,
      unqualifiedColor: this.unqualifiedColor,
    };

    console.log('Colorization args:', colorizationArgs);
    console.log('Current color strategy:', this.colorStrategy);
    console.log('Current treeData:', this.treeData);

    // Get the current strategy
    const strategy = getColorizationStrategy(this.colorStrategy);
    console.log('Strategy ID:', this.colorStrategy);
    console.log('Strategy found:', !!strategy);

    if (!strategy) {
      //alert('❌ Strategy not found: ' + this.colorStrategy);
      console.error('❌ Strategy not found for:', this.colorStrategy);
      return;
    }

    // Call the qualify or classify method based on the strategy
    let colorizationResult = null;

    if (this.colorStrategy === 'branch-selection' && strategy.qualify) {
      // For branch-selection strategy, use qualify
      //alert('Calling qualify method');
      console.log('Calling strategy.qualify() for branch-selection');
      colorizationResult = strategy.qualify(
        { treeData: this.treeData },
        JSON.stringify(colorizationArgs),
      );
    } else if (this.colorStrategy === 'branch' && strategy.classify) {
      // For branch strategy, use classify
      //alert('Calling classify method');
      console.log('Calling strategy.classify() for branch');
      colorizationResult = strategy.classify({ treeData: this.treeData });
    } else {
      alert('❌ No strategy method found');
      console.error('❌ No appropriate strategy method found');
      console.log('Strategy methods available:', {
        qualify: !!strategy.qualify,
        classify: !!strategy.classify,
      });
    }

    console.log(
      'Result: ' +
        JSON.stringify(colorizationResult?.nodeData?.length ?? 0) +
        ' nodes',
    );
    console.log('Colorization result:', colorizationResult);

    // Apply the colorization to the visualization
    if (colorizationResult) {
      console.log('Applying colorization to visualization...');
      // Enrich the result with colorization display options
      colorizationResult.colorUniformity = this.colorUniformity;
      colorizationResult.colorGradientDirectionality =
        this.colorGradientDirectionality;
      colorizationResult.nodeOpacity = this.nodeOpacity;
      console.log('Added colorization options to result:', {
        colorUniformity: colorizationResult.colorUniformity,
        colorGradientDirectionality:
          colorizationResult.colorGradientDirectionality,
        nodeOpacity: colorizationResult.nodeOpacity,
      });
      this.applyColorizationToVisualization(colorizationResult);
    } else {
      console.log('❌ No colorization result');
    }
  }

  private updateBackgroundStyle(): void {
    if (!this.svg) return;

    // Update SVG background
    let svgBackground = '';
    switch (this.backgroundStyle) {
      case 'follow-mode':
        svgBackground = this.colorsService.getBackgroundColor(this.isDarkMode);
        this.removeDigitalGrid();
        this.removeHexPattern();
        break;
      case 'pure-black':
        svgBackground = '#000000';
        this.removeDigitalGrid();
        this.removeHexPattern();
        break;
      case 'digital-blue':
        svgBackground = '#0a0e1a';
        this.createDigitalGrid('#1e3a8a');
        this.removeHexPattern();
        break;
      case 'digital-green':
        svgBackground = '#0a1a0e';
        this.createDigitalGrid('#1e8a3a');
        this.removeHexPattern();
        break;
      case 'hex-navy-orange':
        svgBackground = 'url(#hex-gradient)';
        this.removeDigitalGrid();
        this.createHexPattern();
        break;
      case 'hex-navy-yellow':
        svgBackground = 'url(#hex-gradient-yellow)';
        this.removeDigitalGrid();
        this.createHexPatternYellow();
        break;
      case 'tenant-definition':
        // Disabled option, shouldn't be selectable
        svgBackground = '#1a0a0a';
        this.removeDigitalGrid();
        this.removeHexPattern();
        break;
      case 'aqua-circle':
      default:
        svgBackground = this.colorsService.getBackgroundColor(this.isDarkMode);
        this.removeDigitalGrid();
        this.removeHexPattern();
        break;
    }
    this.svg.style('background', svgBackground);

    // Update aqua circle visibility
    if (this.g) {
      const aquaCircle = this.g.select('circle[fill]').filter(function (
        this: SVGCircleElement,
      ) {
        return d3.select(this).attr('opacity') === '0.25';
      });

      aquaCircle.style(
        'display',
        this.backgroundStyle === 'aqua-circle' ? 'block' : 'none',
      );
    }
  }

  private createDigitalGrid(gridColor: string): void {
    if (!this.svg) return;

    // Remove existing grid pattern
    this.svg.select('defs #digital-grid-pattern').remove();

    // Create defs element if it doesn't exist
    let defs = this.svg.select('defs');
    if (defs.empty()) {
      defs = this.svg.insert('defs', ':first-child');
    }

    // Create grid pattern
    const pattern = defs
      .append('pattern')
      .attr('id', 'digital-grid-pattern')
      .attr('width', 50)
      .attr('height', 50)
      .attr('patternUnits', 'userSpaceOnUse');

    // Add grid lines
    pattern
      .append('path')
      .attr('d', 'M 50 0 L 0 0 0 50')
      .attr('fill', 'none')
      .attr('stroke', gridColor)
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.3);

    // Add grid background rect
    this.svg.select('.grid-background').remove();
    this.svg
      .insert('rect', 'g')
      .attr('class', 'grid-background')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'url(#digital-grid-pattern)')
      .attr('pointer-events', 'none');
  }

  private removeDigitalGrid(): void {
    if (!this.svg) return;

    // Remove grid pattern and background rect
    this.svg.select('defs #digital-grid-pattern').remove();
    this.svg.select('.grid-background').remove();
  }

  private createHexPattern(): void {
    if (!this.svg) return;

    // Remove existing hex pattern and related elements
    this.svg.select('defs #hex-gradient').remove();
    this.svg.select('defs #hex-pattern').remove();
    this.svg.select('.hex-background-rect').remove();
    this.svg.select('.hex-grid-background').remove();

    // Create defs element if it doesn't exist
    let defs = this.svg.select('defs');
    if (defs.empty()) {
      defs = this.svg.insert('defs', ':first-child');
    }

    // Create linear gradient from dark navy to bright orange
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'hex-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#001a4d'); // Dark navy

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#ff6600'); // Bright orange

    // Create simple seamless honeycomb using pointy-top hexagons
    // 3/4 inch = 54 pixels
    const r = 54;

    // Pointy-top hexagon: vertices at 90°, 30°, -30°, -90°, -150°, 150° (top point)
    const angles = [90, 30, -30, -90, -150, 150];

    // Dimensions
    const w = r * Math.sqrt(3); // width
    const h = r * 2; // height

    // Pattern tile dimensions for seamless tiling
    const patternW = w * 2;
    const patternH = h * 1.5;

    const pattern = defs
      .append('pattern')
      .attr('id', 'hex-pattern')
      .attr('width', patternW)
      .attr('height', patternH)
      .attr('patternUnits', 'userSpaceOnUse');

    // Function to generate hexagon points
    const getHexPoints = (cx: number, cy: number): string => {
      return angles
        .map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x = cx + r * Math.cos(rad);
          const y = cy + r * Math.sin(rad);
          return `${x},${y}`;
        })
        .join(' ');
    };

    // Draw 3 hexagons in the pattern tile for seamless tiling
    // Hex 1: top-left
    pattern
      .append('polygon')
      .attr('points', getHexPoints(w / 2, h / 2))
      .attr('fill', 'none')
      .attr('stroke', '#cccccc')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.35)
      .attr('stroke-linejoin', 'miter');

    // Hex 2: top-right
    pattern
      .append('polygon')
      .attr('points', getHexPoints(w * 1.5, h / 2))
      .attr('fill', 'none')
      .attr('stroke', '#cccccc')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.35)
      .attr('stroke-linejoin', 'miter');

    // Hex 3: bottom-center (offset for honeycomb alignment)
    pattern
      .append('polygon')
      .attr('points', getHexPoints(w, h * 1.25))
      .attr('fill', 'none')
      .attr('stroke', '#cccccc')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.35)
      .attr('stroke-linejoin', 'miter');

    // Add background rectangle with gradient
    this.svg
      .insert('rect', 'g')
      .attr('class', 'hex-background-rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'url(#hex-gradient)')
      .attr('pointer-events', 'none');

    // Add grid background with hex pattern overlay
    this.svg
      .insert('rect', 'g')
      .attr('class', 'hex-grid-background')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'url(#hex-pattern)')
      .attr('pointer-events', 'none');
  }

  private removeHexPattern(): void {
    if (!this.svg) return;

    // Remove hex pattern and related elements (both orange and yellow variants)
    this.svg.select('defs #hex-gradient').remove();
    this.svg.select('defs #hex-pattern').remove();
    this.svg.select('.hex-background-rect').remove();
    this.svg.select('.hex-grid-background').remove();
    this.svg.select('defs #hex-gradient-yellow').remove();
    this.svg.select('defs #hex-pattern-yellow').remove();
    this.svg.select('.hex-background-rect-yellow').remove();
    this.svg.select('.hex-grid-background-yellow').remove();
  }

  private createHexPatternYellow(): void {
    if (!this.svg) return;

    // Remove existing hex pattern and related elements
    this.svg.select('defs #hex-gradient-yellow').remove();
    this.svg.select('defs #hex-pattern-yellow').remove();
    this.svg.select('.hex-background-rect-yellow').remove();
    this.svg.select('.hex-grid-background-yellow').remove();

    // Create defs element if it doesn't exist
    let defs = this.svg.select('defs');
    if (defs.empty()) {
      defs = this.svg.insert('defs', ':first-child');
    }

    // Create linear gradient from dark navy to bright yellow
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'hex-gradient-yellow')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#001a4d'); // Dark navy

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#ffff00'); // Bright yellow

    // Create simple seamless honeycomb using pointy-top hexagons
    // 3/4 inch = 54 pixels
    const r = 54;

    // Pointy-top hexagon: vertices at 90°, 30°, -30°, -90°, -150°, 150° (top point)
    const angles = [90, 30, -30, -90, -150, 150];

    // Dimensions
    const w = r * Math.sqrt(3); // width
    const h = r * 2; // height

    // Pattern tile dimensions for seamless tiling
    const patternW = w * 2;
    const patternH = h * 1.5;

    const pattern = defs
      .append('pattern')
      .attr('id', 'hex-pattern-yellow')
      .attr('width', patternW)
      .attr('height', patternH)
      .attr('patternUnits', 'userSpaceOnUse');

    // Function to generate hexagon points
    const getHexPoints = (cx: number, cy: number): string => {
      return angles
        .map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x = cx + r * Math.cos(rad);
          const y = cy + r * Math.sin(rad);
          return `${x},${y}`;
        })
        .join(' ');
    };

    // Draw 3 hexagons in the pattern tile for seamless tiling
    // Hex 1: top-left
    pattern
      .append('polygon')
      .attr('points', getHexPoints(w / 2, h / 2))
      .attr('fill', 'none')
      .attr('stroke', '#cccccc')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.35)
      .attr('stroke-linejoin', 'miter');

    // Hex 2: top-right
    pattern
      .append('polygon')
      .attr('points', getHexPoints(w * 1.5, h / 2))
      .attr('fill', 'none')
      .attr('stroke', '#cccccc')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.35)
      .attr('stroke-linejoin', 'miter');

    // Hex 3: bottom-center (offset for honeycomb alignment)
    pattern
      .append('polygon')
      .attr('points', getHexPoints(w, h * 1.25))
      .attr('fill', 'none')
      .attr('stroke', '#cccccc')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.35)
      .attr('stroke-linejoin', 'miter');

    // Add background rectangle with gradient
    this.svg
      .insert('rect', 'g')
      .attr('class', 'hex-background-rect-yellow')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'url(#hex-gradient-yellow)')
      .attr('pointer-events', 'none');

    // Add grid background with hex pattern overlay
    this.svg
      .insert('rect', 'g')
      .attr('class', 'hex-grid-background-yellow')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'url(#hex-pattern-yellow)')
      .attr('pointer-events', 'none');
  }

  /**
   * Get font family string with proper fallbacks
   */
  private getFontFamilyWithFallback(fontName: string): string {
    // Map of fonts to their fallback chains
    const fontFallbacks: { [key: string]: string } = {
      'Times New Roman': '"Times New Roman", Times, serif',
      'Courier New': '"Courier New", Courier, monospace',
      'Courier New Regular': '"Courier New", Courier, monospace',
      Garamond: '"Garamond", Georgia, serif',
      'Palatino Linotype':
        '"Palatino Linotype", "Book Antiqua", Palatino, serif',
      'Comic Sans MS': '"Comic Sans MS", cursive',
      'Comic Sans': '"Comic Sans MS", cursive',
      Arial: 'Arial, Helvetica, sans-serif',
      Helvetica: 'Helvetica, Arial, sans-serif',
      Georgia: 'Georgia, serif',
      Verdana: 'Verdana, Geneva, sans-serif',
      'Trebuchet MS': '"Trebuchet MS", sans-serif',
    };

    // Return mapped fallback or quoted font name with generic fallback
    if (fontFallbacks[fontName]) {
      return fontFallbacks[fontName];
    }

    // Default: use the font name with a generic serif fallback
    return `"${fontName}", serif`;
  }

  // Helper method to get node radius based on size setting
  private getNodeRadius(depth: number): number {
    const baseRadius = depth === 0 ? 16 : 12;
    switch (this.nodeSize) {
      case 'xsmall':
        return baseRadius * 0.5;
      case 'small':
        return baseRadius * 0.7;
      case 'large':
        return baseRadius * 1.4;
      default: // medium
        return baseRadius;
    }
  }

  // Helper method to calculate text position based on settings
  private getTextPosition(d: any): {
    x: number;
    y: number;
    anchor: string;
    rotation: number;
  } {
    const nodeRadius = this.getNodeRadius(d.depth);

    // Calculate dynamic offset based on root node font size if root node override is enabled
    let dynamicOffset = 10;
    if (this.overrideRootNodeStyle && d.depth === 0) {
      const fontSize = this.rootNodeSize || 14;
      dynamicOffset = fontSize / 2 + 8; // Half font size + base spacing
    }

    // Calculate dynamic offset based on tree text size for all nodes
    const treeTextFontSize = this.treeTextSize || 14;
    const treeTextDynamicOffset = treeTextFontSize / 2 + 8; // Half font size + base spacing

    const radiatingOffset = nodeRadius + dynamicOffset; // Extra space for radiating text
    const belowOffset =
      nodeRadius + Math.max(dynamicOffset, treeTextDynamicOffset) + 2; // Increased space for below text

    // For radial layouts
    if (
      this.selectedVisualization === 'radialTree' ||
      this.selectedVisualization === 'radialCluster'
    ) {
      // Calculate angle from node position relative to diagram center
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      const angleFromCenter = Math.atan2(d.y - centerY, d.x - centerX);

      switch (this.textPosition) {
        case 'radiating-leaf':
          // Only show radiating text for leaf nodes
          if (!d.children && !d._children) {
            const rotationDeg = (angleFromCenter * 180) / Math.PI;
            const isLeftSide =
              angleFromCenter > Math.PI / 2 || angleFromCenter < -Math.PI / 2;
            return {
              x: d.x + radiatingOffset * Math.cos(angleFromCenter),
              y: d.y + radiatingOffset * Math.sin(angleFromCenter),
              anchor: isLeftSide ? 'end' : 'start',
              rotation: isLeftSide ? rotationDeg + 180 : rotationDeg,
            };
          }
          return {
            x: d.x,
            y: d.y + belowOffset,
            anchor: 'middle',
            rotation: 0,
          };

        case 'radiating-all':
          const rotationDeg = (angleFromCenter * 180) / Math.PI;
          const isLeftSide =
            angleFromCenter > Math.PI / 2 || angleFromCenter < -Math.PI / 2;
          return {
            x: d.x + radiatingOffset * Math.cos(angleFromCenter),
            y: d.y + radiatingOffset * Math.sin(angleFromCenter),
            anchor: isLeftSide ? 'end' : 'start',
            rotation: isLeftSide ? rotationDeg + 180 : rotationDeg,
          };

        case 'above':
          return {
            x: d.x,
            y: d.y - belowOffset,
            anchor: 'middle',
            rotation: 0,
          };

        case 'left':
          return {
            x: d.x - belowOffset,
            y: d.y + 4,
            anchor: 'end',
            rotation: 0,
          };

        case 'right':
          return {
            x: d.x + belowOffset,
            y: d.y + 4,
            anchor: 'start',
            rotation: 0,
          };

        case 'below':
        default:
          return {
            x: d.x,
            y: d.y + belowOffset,
            anchor: 'middle',
            rotation: 0,
          };
      }
    }

    // For horizontal layouts
    if (
      this.selectedVisualization === 'treeHorizontal' ||
      this.selectedVisualization === 'clusterHorizontal'
    ) {
      switch (this.textPosition) {
        case 'radiating-horizontal':
          return {
            x: d.x + radiatingOffset,
            y: d.y + 4,
            anchor: 'start',
            rotation: 0,
          };
        case 'below':
        default:
          return {
            x: d.x,
            y: d.y + belowOffset,
            anchor: 'middle',
            rotation: 0,
          };
      }
    }

    // For vertical layouts
    if (
      this.selectedVisualization === 'treeVertical' ||
      this.selectedVisualization === 'clusterVertical'
    ) {
      switch (this.textPosition) {
        case 'radiating-vertical':
          // Text directly underneath the node, tilted 90 degrees
          // Adjust x slightly left to visually center the rotated text
          const verticalPadding = nodeRadius + 28; // More padding south of the node
          const horizontalAdjustment = -5; // Shift further left to compensate for rotation
          return {
            x: d.x + horizontalAdjustment, // Slightly left of node center
            y: d.y + verticalPadding, // Further south with more padding
            anchor: 'middle', // Center the text along its (rotated) baseline
            rotation: 90, // Rotate 90 degrees so text reads vertically
          };
        case 'horizontal-below':
        default:
          return {
            x: d.x,
            y: d.y + belowOffset,
            anchor: 'middle',
            rotation: 0,
          };
      }
    }

    // Default fallback
    return { x: d.x, y: d.y + belowOffset, anchor: 'middle', rotation: 0 };
  }

  // Update selected node text position information for display in toolbar
  private updateSelectedNodeTextInfo(): void {
    if (!this.selectedNode || !this.treeNodes || this.treeNodes.length === 0) {
      // Clear info if no node is selected
      this.selectedNodeTextX = null;
      this.selectedNodeTextY = null;
      this.selectedNodeTextRotation = null;
      this.selectedNodeTextAnchor = null;
      this.selectedNodeText180Added = false;
      
      // Also clear transform state when no node selected
      this.selectedNodeCurrentZoom = 1;
      this.selectedNodeCurrentPanX = 0;
      this.selectedNodeCurrentPanY = 0;
      this.selectedNodeCurrentRotation = 0;
      return;
    }

    // Find the D3 node data for the selected node
    const selectedD3Node = this.treeNodes.find(
      (node: any) =>
        node.id === this.selectedNode || node.data?.id === this.selectedNode,
    );

    if (!selectedD3Node) {
      // Node not found in tree nodes, clear info
      this.selectedNodeTextX = null;
      this.selectedNodeTextY = null;
      this.selectedNodeTextRotation = null;
      this.selectedNodeTextAnchor = null;
      this.selectedNodeText180Added = false;
      
      // Also clear transform state
      this.selectedNodeCurrentZoom = 1;
      this.selectedNodeCurrentPanX = 0;
      this.selectedNodeCurrentPanY = 0;
      this.selectedNodeCurrentRotation = 0;
      return;
    }

    // Calculate text position using the same method as rendering (layout coordinates)
    const textPos = this.getTextPosition(selectedD3Node);

    // Store the values
    this.selectedNodeTextX = Math.round(textPos.x * 100) / 100; // Round to 2 decimals
    this.selectedNodeTextY = Math.round(textPos.y * 100) / 100;
    this.selectedNodeTextRotation = Math.round(textPos.rotation * 100) / 100;
    this.selectedNodeTextAnchor = textPos.anchor;

    // Store current transform state
    this.selectedNodeCurrentZoom = Math.round(this.zoomLevel * 100) / 100;
    this.selectedNodeCurrentPanX = Math.round(this.panX * 100) / 100;
    this.selectedNodeCurrentPanY = Math.round(this.panY * 100) / 100;
    this.selectedNodeCurrentRotation =
      Math.round(this.rotationAngle * 100) / 100;

    // Log for debugging
    console.log('🔍 Selected Node Text Info Updated:', {
      node: this.selectedNode,
      x: this.selectedNodeTextX,
      y: this.selectedNodeTextY,
      rotation: this.selectedNodeTextRotation,
      anchor: this.selectedNodeTextAnchor,
      zoom: this.selectedNodeCurrentZoom,
      panX: this.selectedNodeCurrentPanX,
      panY: this.selectedNodeCurrentPanY,
      rotationAngle: this.selectedNodeCurrentRotation,
    });

    // Check if 180 degrees was added (for radial layouts)
    if (
      this.selectedVisualization === 'radialTree' ||
      this.selectedVisualization === 'radialCluster'
    ) {
      if (
        this.textPosition === 'radiating-leaf' ||
        this.textPosition === 'radiating-all'
      ) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const angleFromCenter = Math.atan2(
          selectedD3Node.y - centerY,
          selectedD3Node.x - centerX,
        );
        const isLeftSide =
          angleFromCenter > Math.PI / 2 || angleFromCenter < -Math.PI / 2;
        this.selectedNodeText180Added = isLeftSide;
      } else {
        this.selectedNodeText180Added = false;
      }
    } else {
      this.selectedNodeText180Added = false;
    }
  }

  // Generate optimized link path function based on line type and format
  // Get link color based on override or default setting
  private getLinkColor(): string {
    const backgroundConfig = this.getBackgroundConfig();

    // Check if override is allowed and if there's an override value
    if (backgroundConfig.AllowOverride && this.linkColorOverride) {
      return this.linkColorOverride;
    }

    // Use default link color from background configuration
    return backgroundConfig.LowContrastLinkColor;
  }

  // Get background configuration
  private getBackgroundConfig(): IBackgroundDefinition {
    const mode = this.isDarkMode ? 'dark' : 'light';

    const configs: Record<
      string,
      { dark: IBackgroundDefinition; light: IBackgroundDefinition }
    > = {
      'aqua-circle': {
        dark: {
          Name: 'Aqua Circle (Dark)',
          HighContrastLinkColor: '#ffffff',
          LowContrastLinkColor: '#555555',
          VeryLowContrastLinkColor: '#2a2a2a',
          AbsentLinkColor: 'transparent',
          AllowOverride: true,
        },
        light: {
          Name: 'Aqua Circle (Light)',
          HighContrastLinkColor: '#000000',
          LowContrastLinkColor: '#cccccc',
          VeryLowContrastLinkColor: '#e8e8e8',
          AbsentLinkColor: 'transparent',
          AllowOverride: true,
        },
      },
      'follow-mode': {
        dark: {
          Name: 'Follow Mode (Dark)',
          HighContrastLinkColor: '#ffffff',
          LowContrastLinkColor: '#555555',
          VeryLowContrastLinkColor: '#2a2a2a',
          AbsentLinkColor: 'transparent',
          AllowOverride: true,
        },
        light: {
          Name: 'Follow Mode (Light)',
          HighContrastLinkColor: '#000000',
          LowContrastLinkColor: '#cccccc',
          VeryLowContrastLinkColor: '#e8e8e8',
          AbsentLinkColor: 'transparent',
          AllowOverride: true,
        },
      },
      'pure-black': {
        dark: {
          Name: 'Pure Black (Dark)',
          HighContrastLinkColor: '#ffffff',
          LowContrastLinkColor: '#777777',
          VeryLowContrastLinkColor: '#2a2a2a',
          AbsentLinkColor: 'transparent',
          AllowOverride: true,
        },
        light: {
          Name: 'Pure Black (Light)',
          HighContrastLinkColor: '#ffffff',
          LowContrastLinkColor: '#777777',
          VeryLowContrastLinkColor: '#e8e8e8',
          AbsentLinkColor: 'transparent',
          AllowOverride: true,
        },
      },
      'digital-blue': {
        dark: {
          Name: 'Digital Blue (Dark)',
          HighContrastLinkColor: '#60a5fa',
          LowContrastLinkColor: '#3b82f6',
          VeryLowContrastLinkColor: '#1e3a8a',
          AbsentLinkColor: 'transparent',
          AllowOverride: true,
        },
        light: {
          Name: 'Digital Blue (Light)',
          HighContrastLinkColor: '#60a5fa',
          LowContrastLinkColor: '#3b82f6',
          VeryLowContrastLinkColor: '#dbeafe',
          AbsentLinkColor: 'transparent',
          AllowOverride: true,
        },
      },
      'digital-green': {
        dark: {
          Name: 'Digital Green (Dark)',
          HighContrastLinkColor: '#00ff00',
          LowContrastLinkColor: '#00cc00',
          VeryLowContrastLinkColor: '#004400',
          AbsentLinkColor: 'transparent',
          AllowOverride: true,
        },
        light: {
          Name: 'Digital Green (Light)',
          HighContrastLinkColor: '#00ff00',
          LowContrastLinkColor: '#00cc00',
          VeryLowContrastLinkColor: '#ddffdd',
          AbsentLinkColor: 'transparent',
          AllowOverride: true,
        },
      },
      'hex-navy-orange': {
        dark: {
          Name: 'Hex/Navy/Orange (Dark)',
          HighContrastLinkColor: '#ffcc00',
          LowContrastLinkColor: '#ff9900',
          VeryLowContrastLinkColor: '#663300',
          AbsentLinkColor: 'transparent',
          AllowOverride: true,
        },
        light: {
          Name: 'Hex/Navy/Orange (Light)',
          HighContrastLinkColor: '#ffcc00',
          LowContrastLinkColor: '#ff9900',
          VeryLowContrastLinkColor: '#ffddaa',
          AbsentLinkColor: 'transparent',
          AllowOverride: true,
        },
      },
      'hex-navy-yellow': {
        dark: {
          Name: 'Hex/Navy/Yellow (Dark)',
          HighContrastLinkColor: '#ffff00',
          LowContrastLinkColor: '#ffdd00',
          VeryLowContrastLinkColor: '#666600',
          AbsentLinkColor: 'transparent',
          AllowOverride: true,
        },
        light: {
          Name: 'Hex/Navy/Yellow (Light)',
          HighContrastLinkColor: '#ffff00',
          LowContrastLinkColor: '#ffdd00',
          VeryLowContrastLinkColor: '#ffffaa',
          AbsentLinkColor: 'transparent',
          AllowOverride: true,
        },
      },
      'tenant-definition': {
        dark: {
          Name: 'Tenant Definition (Dark)',
          HighContrastLinkColor: '#f87171',
          LowContrastLinkColor: '#ef4444',
          VeryLowContrastLinkColor: '#7f1d1d',
          AbsentLinkColor: 'transparent',
          AllowOverride: false,
        },
        light: {
          Name: 'Tenant Definition (Light)',
          HighContrastLinkColor: '#dc2626',
          LowContrastLinkColor: '#b91c1c',
          VeryLowContrastLinkColor: '#fee2e2',
          AbsentLinkColor: 'transparent',
          AllowOverride: false,
        },
      },
    };

    const backgroundConfigs =
      configs[this.backgroundStyle] || configs['aqua-circle'];
    return backgroundConfigs[mode];
  }

  // Adjust link endpoints to stop short of nodes if linkConnection is 'short'
  private adjustLinkEndpoints(link: any): {
    source: { x: number; y: number };
    target: { x: number; y: number };
  } {
    if (this.linkConnection === 'full') {
      return {
        source: { x: link.source.x, y: link.source.y },
        target: { x: link.target.x, y: link.target.y },
      };
    }

    // For 'short' connection, calculate shortened endpoints based on node size
    // Get the actual node radii for source and target
    const sourceRadius = this.getNodeRadius(link.source.depth || 0);
    const targetRadius = this.getNodeRadius(link.target.depth || 0);

    // Add a small gap (3px) beyond the node radius
    const gap = 3;
    const shortenSource = sourceRadius + gap;
    const shortenTarget = targetRadius + gap;

    const dx = link.target.x - link.source.x;
    const dy = link.target.y - link.source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < shortenSource + shortenTarget) {
      // If link is too short, just return original
      return {
        source: { x: link.source.x, y: link.source.y },
        target: { x: link.target.x, y: link.target.y },
      };
    }

    // Calculate unit vector
    const ux = dx / distance;
    const uy = dy / distance;

    // Shorten both ends based on respective node sizes
    return {
      source: {
        x: link.source.x + ux * shortenSource,
        y: link.source.y + uy * shortenSource,
      },
      target: {
        x: link.target.x - ux * shortenTarget,
        y: link.target.y - uy * shortenTarget,
      },
    };
  }

  // Generate optimized link path function based on line type and format
  private getLinkPathGenerator(): (d: any) => string {
    const lineType = this.lineType;
    const format = this.selectedFormat;

    // NOTE: TreeVisualizationService returns coordinates already transformed to screen space
    // Links have source.x, source.y, target.x, target.y ready to use

    // All formats can use the same logic since coordinates are in screen space
    switch (lineType) {
      case 'line':
        // Straight lines: fastest, simple path calculation
        return (d: any) => {
          const adjusted = this.adjustLinkEndpoints(d);
          return `M${adjusted.source.x},${adjusted.source.y}L${adjusted.target.x},${adjusted.target.y}`;
        };

      case 'step':
        // Step connections with mid-point break
        return (d: any) => {
          const adjusted = this.adjustLinkEndpoints(d);

          if (format === 'radial') {
            // For radial, step through a mid-radius
            const centerX = this.width / 2;
            const centerY = this.height / 2;

            // Calculate angles and radii using adjusted endpoints
            const sourceAngle = Math.atan2(
              adjusted.source.y - centerY,
              adjusted.source.x - centerX,
            );
            const targetAngle = Math.atan2(
              adjusted.target.y - centerY,
              adjusted.target.x - centerX,
            );
            const sourceRadius = Math.sqrt(
              Math.pow(adjusted.source.x - centerX, 2) +
                Math.pow(adjusted.source.y - centerY, 2),
            );
            const targetRadius = Math.sqrt(
              Math.pow(adjusted.target.x - centerX, 2) +
                Math.pow(adjusted.target.y - centerY, 2),
            );
            const midRadius = (sourceRadius + targetRadius) / 2;

            const midSourceX = centerX + midRadius * Math.cos(sourceAngle);
            const midSourceY = centerY + midRadius * Math.sin(sourceAngle);
            const midTargetX = centerX + midRadius * Math.cos(targetAngle);
            const midTargetY = centerY + midRadius * Math.sin(targetAngle);

            return `M${adjusted.source.x},${adjusted.source.y}L${midSourceX},${midSourceY}L${midTargetX},${midTargetY}L${adjusted.target.x},${adjusted.target.y}`;
          } else if (format === 'horizontal') {
            // For horizontal, step through mid-x
            const midX = (adjusted.source.x + adjusted.target.x) / 2;
            return `M${adjusted.source.x},${adjusted.source.y}L${midX},${adjusted.source.y}L${midX},${adjusted.target.y}L${adjusted.target.x},${adjusted.target.y}`;
          } else {
            // For vertical, step through mid-y
            const midY = (adjusted.source.y + adjusted.target.y) / 2;
            return `M${adjusted.source.x},${adjusted.source.y}L${adjusted.source.x},${midY}L${adjusted.target.x},${midY}L${adjusted.target.x},${adjusted.target.y}`;
          }
        };

      case 'curve':
      default:
        // Smooth curves using D3 link generators
        // Use screen coordinates directly, same as line and step modes
        if (format === 'radial') {
          const centerX = this.width / 2;
          const centerY = this.height / 2;

          return (d: any) => {
            const adjusted = this.adjustLinkEndpoints(d);

            // Convert screen coordinates to polar (relative to center) using adjusted endpoints
            const sourceAngle =
              Math.atan2(
                adjusted.source.y - centerY,
                adjusted.source.x - centerX,
              ) +
              Math.PI / 2;
            const targetAngle =
              Math.atan2(
                adjusted.target.y - centerY,
                adjusted.target.x - centerX,
              ) +
              Math.PI / 2;
            const sourceRadius = Math.sqrt(
              Math.pow(adjusted.source.x - centerX, 2) +
                Math.pow(adjusted.source.y - centerY, 2),
            );
            const targetRadius = Math.sqrt(
              Math.pow(adjusted.target.x - centerX, 2) +
                Math.pow(adjusted.target.y - centerY, 2),
            );

            // Use D3 linkRadial with polar coordinates and center point
            const linkGen = d3
              .linkRadial<any, any>()
              .angle((n: any) => n.angle)
              .radius((n: any) => n.radius);

            // Generate path at origin, then translate to screen center in the path
            const path =
              linkGen({
                source: { angle: sourceAngle, radius: sourceRadius },
                target: { angle: targetAngle, radius: targetRadius },
              }) || '';

            // Manually translate the path by parsing and offsetting all coordinates
            // D3 linkRadial generates paths like: M0,100C0,50 0,50 50,0
            // We need to offset every coordinate pair by (centerX, centerY)
            return path.replace(
              /([MLCQAZ])?([-\d.e]+),([-\d.e]+)/gi,
              (match, cmd, x, y) => {
                const newX = parseFloat(x) + centerX;
                const newY = parseFloat(y) + centerY;
                return cmd ? `${cmd}${newX},${newY}` : `${newX},${newY}`;
              },
            );
          };
        } else if (format === 'horizontal') {
          // Horizontal curves - use screen coords directly
          return (d: any) => {
            const adjusted = this.adjustLinkEndpoints(d);
            const linkGen = d3
              .linkHorizontal<any, any>()
              .x((n: any) => n.x)
              .y((n: any) => n.y);
            return (
              linkGen({
                source: { x: adjusted.source.x, y: adjusted.source.y },
                target: { x: adjusted.target.x, y: adjusted.target.y },
              }) || ''
            );
          };
        } else {
          // Vertical curves - use screen coords directly
          return (d: any) => {
            const adjusted = this.adjustLinkEndpoints(d);
            const linkGen = d3
              .linkVertical<any, any>()
              .x((n: any) => n.x)
              .y((n: any) => n.y);
            return (
              linkGen({
                source: { x: adjusted.source.x, y: adjusted.source.y },
                target: { x: adjusted.target.x, y: adjusted.target.y },
              }) || ''
            );
          };
        }
    }
  }

  // Update visualization based on selected type (using TreeVisualizationService)
  private updateVisualization(): void {
    // Handle hex grid separately
    if (this.selectedVisualization === 'hexGrid') {
      this.renderHexGridVisualization();
      return;
    }

    // Clear all hex grid elements and recreate tree groups if switching from hex layout
    if (this.g) {
      this.g.selectAll('.hex-cell').remove();
      this.g.selectAll('.hex-node').remove();
      this.g.selectAll('.center-hex').remove();

      // Recreate tree groups if they don't exist (they might have been cleared when rendering hex)
      if (
        !this.treeLinksGroup ||
        this.treeLinksGroup.node().parentNode === null
      ) {
        this.treeLinksGroup = this.g
          .append('g')
          .attr('class', 'tree-links-layer');
      }
      if (
        !this.treeNodesGroup ||
        this.treeNodesGroup.node().parentNode === null
      ) {
        this.treeNodesGroup = this.g
          .append('g')
          .attr('class', 'tree-nodes-layer');
      }
    }

    // Ensure layout functions are initialized before proceeding
    if (!this.radialTreeLayout || !this.radialClusterLayout) {
      console.warn(
        '⚠️ Visualization layouts not initialized yet, initializing now...',
      );
      this.initializeVisualizationLayouts();
    }

    // Use the TreeVisualizationService to compute the layout
    const dimensions = {
      width: this.visualizationWidth,
      height: this.visualizationHeight,
      radius: this.visualizationRadius,
      margin: { top: 40, right: 40, bottom: 40, left: 40 },
      centerX: this.width / 2, // Actual viewport center X
      centerY: this.height / 2, // Actual viewport center Y
    };

    this.treeVisualizationService.setVisualizationType(
      this.selectedVisualization,
      dimensions,
    );

    const layoutResult = this.treeVisualizationService.computeLayout(
      this.treeData,
    );

    if (!layoutResult) {
      console.warn('Failed to compute layout');
      return;
    }

    // Update tree nodes and links
    this.treeNodes = layoutResult.nodes;
    this.treeLinks = layoutResult.links;

    // Update selected node text info immediately with new layout
    this.updateSelectedNodeTextInfo();

    // Center the view (reset pan while preserving zoom)
    this.visualizationInteractionService.centerView();
    this.panX = 0;
    this.panY = 0;

    // Apply the transform to visually center the tree
    this.applyTransform();

    // Trigger change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.cdr.detectChanges();

    // Apply smooth transitions using enter/update/exit pattern
    this.transitionToNewLayout(layoutResult.nodes, layoutResult.links);

    // Auto-apply colorization AFTER transition completes (750ms)
    // Wait for D3 transition to finish before applying colorization to avoid conflicts
    setTimeout(() => {
      this.autoApplyColorization();
    }, 800); // 750ms transition + 50ms buffer
  }

  /**
   * Automatically apply colorization based on current strategy
   */
  private autoApplyColorization(): void {
    if (!this.colorStrategy || this.colorStrategy === 'none') {
      return;
    }

    const strategy = getColorizationStrategy(this.colorStrategy);
    if (!strategy) {
      return;
    }

    let colorizationResult = null;

    if (this.colorStrategy === 'branch-selection' && strategy.qualify) {
      const colorizationArgs = {
        selectedBranchIndex: this.selectedBranchIndex,
        qualifiedColor: this.qualifiedColor,
        unqualifiedColor: this.unqualifiedColor,
      };
      colorizationResult = strategy.qualify(
        { treeData: this.treeData },
        JSON.stringify(colorizationArgs),
      );
    } else if (this.colorStrategy === 'branch' && strategy.classify) {
      colorizationResult = strategy.classify({ treeData: this.treeData });
    }

    // Apply the colorization to the visualization
    if (colorizationResult) {
      colorizationResult.colorUniformity = this.colorUniformity;
      colorizationResult.colorGradientDirectionality =
        this.colorGradientDirectionality;
      colorizationResult.nodeOpacity = this.nodeOpacity;
      // Note: colorTarget is handled in applyColorizationToVisualization
      // which checks the strategy's colorTarget or uses this.colorTarget
      this.applyColorizationToVisualization(colorizationResult);
    }
  }

  /**
   * Apply colorization results to the visualization
   * @param colorizationResult The colorization result from a strategy
   */
  public applyColorizationToVisualization(colorizationResult: any): void {
    console.log('📊 applyColorizationToVisualization called');
    console.log('SVG Ref:', this.svgRef);
    console.log('D3 SVG:', this.svg);

    // Store the colorization result for key rendering
    this.colorizationResult = colorizationResult;

    // Get the native SVG element (this.svg is a D3 selection, so we need the actual element)
    const svgElement = this.svgRef?.nativeElement || this.svg?.node?.();
    console.log('SVG Element:', svgElement);
    console.log('Colorization Result:', colorizationResult);

    if (!svgElement || !colorizationResult) {
      console.error('❌ SVG element not found or colorization result is empty');
      console.error('SVG Element valid:', !!svgElement);
      console.error('Result valid:', !!colorizationResult);
      return;
    }

    console.log('Node data count:', colorizationResult.nodeData?.length);

    // Clear any previous colorization first
    // Determine which colorTarget to use: strategy's override or user's selection
    const strategy = getColorizationStrategy(this.colorStrategy);
    const effectiveColorTarget = strategy?.colorTarget || this.colorTarget;

    // Only clear what will be re-colored
    this.colorizationApplicationService.clearColorization(
      svgElement,
      effectiveColorTarget,
    );

    console.log('Effective color target:', effectiveColorTarget);

    // Apply the colorization using the service
    console.log('Calling applyColorization service with:');
    console.log('  SVG Element:', svgElement.tagName);
    console.log('  Node data count:', colorizationResult.nodeData?.length);
    console.log('  Color target:', effectiveColorTarget);

    this.colorizationApplicationService.applyColorization(
      svgElement,
      colorizationResult,
      effectiveColorTarget,
      this.overrideRootNodeStyle, // Pass the override flag to skip root node coloring
      this.colorBrightness, // Pass brightness
      this.colorGradientBrightnessEnd, // Pass gradient brightness end
    );

    // Show or hide the color key based on includeColorKey flag
    if (this.includeColorKey && colorizationResult.key) {
      this.showColorKey(colorizationResult);
    } else {
      this.hideColorKey();
    }

    console.log('✅ Colorization applied');

    // Show color key if enabled
    if (this.includeColorKey && colorizationResult.key) {
      console.log(
        'Showing color key with',
        colorizationResult.key.length,
        'entries',
      );
      this.showColorKey(colorizationResult);
    } else {
      this.hideColorKey();
    }

    // Show title if enabled
    this.showTitle();
  }

  /**
   * Show the color key legend
   */
  private showColorKey(colorizationResult: any): void {
    // Remove existing color key if present
    this.hideColorKey();

    if (
      !this.foregroundLayer ||
      !colorizationResult.key ||
      colorizationResult.key.length === 0
    ) {
      console.warn(
        '❌ Cannot render color key: missing foreground layer or key data',
        {
          hasForegroundLayer: !!this.foregroundLayer,
          hasKey: !!colorizationResult?.key,
          keyLength: colorizationResult?.key?.length || 0,
        },
      );
      return;
    }

    console.log('🔑 Rendering color key with options:', {
      keyPosition: this.keyPosition,
      keyColorShape: this.keyColorShape,
      keyColorUniformity: this.keyColorUniformity,
      keyColorSize: this.keyColorSize,
      keyFont: this.keyFont,
      keyFontSize: this.keyFontSize,
      entries: colorizationResult.key.length,
    });

    // Create a group for the key in the MAIN layer (will be transformed with pan/zoom/rotate)
    const keyGroup = this.g.append('g').attr('class', 'color-key-group');
    (this as any)._colorKeyGroup = keyGroup;
    console.log(
      '✅ Created color key group in main layer (will transform with diagram)',
    );

    // Calculate actual key dimensions first
    const keyPadding = 20; // Increased padding
    const entryHeight = 28; // Increased for better spacing
    const bottomPadding = 20; // Extra bottom padding for uniform spacing

    // Measure text width to calculate appropriate key width
    // Create temporary text elements to measure the longest entry name
    let maxTextWidth = 0;
    let maxTitleWidth = 0;

    // Measure title width
    const tempTitle = this.g
      .append('text')
      .attr('font-size', this.keyTitleFontSize)
      .attr('font-family', this.keyTitleFont)
      .attr('font-weight', this.keyTitleBold ? 'bold' : 'normal')
      .attr('font-style', this.keyTitleItalic ? 'italic' : 'normal')
      .text(this.keyTitle);
    maxTitleWidth =
      (tempTitle.node() as SVGTextElement)?.getComputedTextLength() || 0;
    tempTitle.remove();

    // Measure each entry text width
    colorizationResult.key.forEach((keyEntry: any) => {
      const tempText = this.g
        .append('text')
        .attr('font-size', this.keyFontSize)
        .attr('font-family', this.keyFont)
        .text(keyEntry.name);
      const textWidth =
        (tempText.node() as SVGTextElement)?.getComputedTextLength() || 0;
      maxTextWidth = Math.max(maxTextWidth, textWidth);
      tempText.remove();
    });

    // Calculate key width based on measured text + color shape size + padding
    const contentWidth =
      this.keyColorSize + // Color shape width
      12 + // Space between shape and text
      maxTextWidth + // Text width
      keyPadding * 2; // Left and right padding
    const keyWidth = Math.max(
      Math.max(contentWidth, maxTitleWidth + keyPadding * 2),
      180,
    ); // Minimum 180px

    const keyHeight =
      keyPadding +
      30 +
      colorizationResult.key.length * entryHeight +
      bottomPadding;

    // Get position coordinates relative to visualization center
    const { x, y } = this.getKeyPositionRelativeToContent(keyWidth, keyHeight);

    // Create key background
    const bgRect = keyGroup
      .append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', keyWidth)
      .attr('height', keyHeight)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', this.keyBackgroundColor);

    // Apply border style based on keyBorder option
    switch (this.keyBorder) {
      case 'solid':
        bgRect
          .attr('stroke', this.keyBorderColor)
          .attr('stroke-width', 2)
          .attr('filter', 'none');
        break;
      case 'shadow':
        bgRect
          .attr('stroke', '#ddd')
          .attr('stroke-width', 1)
          .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');
        break;
      case 'none':
      default:
        bgRect
          .attr('stroke', 'none')
          .attr('stroke-width', 0)
          .attr('filter', 'none');
        break;
    }

    // Add title
    const titleElement = keyGroup
      .append('text')
      .attr('x', x + keyPadding)
      .attr('y', y + keyPadding + 12)
      .attr('font-weight', this.keyTitleBold ? 'bold' : 'normal')
      .attr('font-style', this.keyTitleItalic ? 'italic' : 'normal')
      .attr('text-decoration', this.keyTitleUnderline ? 'underline' : 'none')
      .attr('font-size', this.keyTitleFontSize)
      .attr('font-family', this.keyTitleFont)
      .attr('fill', this.keyTitleTextColor)
      .text(this.keyTitle);

    // Add color entries
    colorizationResult.key.forEach((keyEntry: any, index: number) => {
      const entryY = y + keyPadding + 30 + index * entryHeight;

      // Draw color shape
      const shapeX = x + keyPadding;
      const shapeY = entryY;
      const shapeSize = this.keyColorSize;
      const shapeCenter = entryY + entryHeight / 2; // Vertical center of the entry

      console.log('🎨 Rendering color entry:', {
        index,
        name: keyEntry.name,
        color: keyEntry.color,
        position: { x: shapeX, y: shapeY, size: shapeSize },
      });

      this.drawKeyShape(
        keyGroup,
        shapeX,
        shapeCenter - shapeSize / 2,
        shapeSize,
        keyEntry.color,
      );

      // Add label - vertically centered with the shape
      keyGroup
        .append('text')
        .attr('x', shapeX + shapeSize + 12)
        .attr('y', shapeCenter)
        .attr('font-size', this.keyFontSize)
        .attr('font-family', this.keyFont)
        .attr('fill', this.keyTextColor)
        .attr('dominant-baseline', 'middle')
        .attr('text-anchor', 'start')
        .text(keyEntry.name);
    });

    console.log('✅ Color key rendered successfully at', { x, y });
  }

  /**
   * Draw a color shape in the key based on keyColorShape option
   */
  private drawKeyShape(
    group: any,
    x: number,
    y: number,
    size: number,
    color: string,
  ): void {
    console.log('🔷 Drawing key shape:', {
      shapeType: this.keyColorShape,
      position: { x, y },
      size,
      color,
    });
    switch (this.keyColorShape) {
      case 'circle':
        group
          .append('circle')
          .attr('cx', x + size / 2)
          .attr('cy', y + size / 2)
          .attr('r', size / 2)
          .attr('fill', color)
          .attr('stroke', 'rgba(0,0,0,0.2)')
          .attr('stroke-width', 1);
        break;
      case 'square':
        group
          .append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', size)
          .attr('height', size)
          .attr('fill', color)
          .attr('stroke', 'rgba(0,0,0,0.2)')
          .attr('stroke-width', 1);
        break;
      case 'rectangle':
        group
          .append('rect')
          .attr('x', x)
          .attr('y', y + size / 4)
          .attr('width', size * 1.5)
          .attr('height', size / 2)
          .attr('fill', color)
          .attr('stroke', 'rgba(0,0,0,0.2)')
          .attr('stroke-width', 1);
        break;
      case 'triangle':
        const triangleSize = size;
        group
          .append('polygon')
          .attr(
            'points',
            `${x + triangleSize / 2},${y} ${x + triangleSize},${
              y + triangleSize
            } ${x},${y + triangleSize}`,
          )
          .attr('fill', color)
          .attr('stroke', 'rgba(0,0,0,0.2)')
          .attr('stroke-width', 1);
        break;
      case 'diamond':
        group
          .append('polygon')
          .attr(
            'points',
            `${x + size / 2},${y} ${x + size},${y + size / 2} ${x + size / 2},${
              y + size
            } ${x},${y + size / 2}`,
          )
          .attr('fill', color)
          .attr('stroke', 'rgba(0,0,0,0.2)')
          .attr('stroke-width', 1);
        break;
      case 'pentagon':
        const pentSize = size / 2;
        const pentPoints = [];
        for (let i = 0; i < 5; i++) {
          const angle = (i * 72 * Math.PI) / 180 - Math.PI / 2;
          pentPoints.push(
            x +
              size / 2 +
              pentSize * Math.cos(angle) +
              ',' +
              (y + size / 2 + pentSize * Math.sin(angle)),
          );
        }
        group
          .append('polygon')
          .attr('points', pentPoints.join(' '))
          .attr('fill', color)
          .attr('stroke', 'rgba(0,0,0,0.2)')
          .attr('stroke-width', 1);
        break;
      case 'hexagon':
        const hexSize = size / 2;
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * 60 * Math.PI) / 180;
          hexPoints.push(
            x +
              size / 2 +
              hexSize * Math.cos(angle) +
              ',' +
              (y + size / 2 + hexSize * Math.sin(angle)),
          );
        }
        group
          .append('polygon')
          .attr('points', hexPoints.join(' '))
          .attr('fill', color)
          .attr('stroke', 'rgba(0,0,0,0.2)')
          .attr('stroke-width', 1);
        break;
      case 'octagon':
        const octSize = size / 2;
        const octPoints = [];
        for (let i = 0; i < 8; i++) {
          const angle = (i * 45 * Math.PI) / 180;
          octPoints.push(
            x +
              size / 2 +
              octSize * Math.cos(angle) +
              ',' +
              (y + size / 2 + octSize * Math.sin(angle)),
          );
        }
        group
          .append('polygon')
          .attr('points', octPoints.join(' '))
          .attr('fill', color)
          .attr('stroke', 'rgba(0,0,0,0.2)')
          .attr('stroke-width', 1);
        break;
    }
  }

  /**
   * Calculate the bounding box of all tree nodes including their radius
   * Returns the maximum extent in all directions
   */
  private getTreeBounds(): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    maxRadius: number;
  } {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let maxRadius = 0;

    if (!this.treeNodes || this.treeNodes.length === 0) {
      // Default bounds if no nodes
      return {
        minX: -200,
        maxX: 200,
        minY: -200,
        maxY: 200,
        maxRadius: 16,
      };
    }

    // Calculate bounds including node radii
    this.treeNodes.forEach((node: D3TreeNode) => {
      const radius = this.getNodeRadius(node.depth);
      maxRadius = Math.max(maxRadius, radius);

      const x = node.x || 0;
      const y = node.y || 0;

      minX = Math.min(minX, x - radius);
      maxX = Math.max(maxX, x + radius);
      minY = Math.min(minY, y - radius);
      maxY = Math.max(maxY, y + radius);
    });

    // If bounds are still infinite, use default
    if (
      !isFinite(minX) ||
      !isFinite(maxX) ||
      !isFinite(minY) ||
      !isFinite(maxY)
    ) {
      return {
        minX: -200,
        maxX: 200,
        minY: -200,
        maxY: 200,
        maxRadius: 16,
      };
    }

    return { minX, maxX, minY, maxY, maxRadius };
  }

  /**
   * Get key position coordinates based on keyPosition setting
   */
  private getKeyPositionRelativeToContent(
    keyWidth: number,
    keyHeight: number,
  ): { x: number; y: number } {
    // Position the key relative to the tree content (not screen coordinates)
    const centerX = (this.width || 800) / 2;
    const centerY = (this.height || 600) / 2;

    // Get tree bounds to position overlays outside the nodes
    const treeBounds = this.getTreeBounds();
    const padding = 20; // Extra space beyond the tree
    const gap = 16; // Space between tree boundary and overlay

    // Position based on keyPosition setting
    // Using content-relative coordinates so the key moves with the tree
    let position: { x: number; y: number };
    switch (this.keyPosition) {
      case 'top-left':
        position = {
          x: treeBounds.minX - keyWidth - gap - padding,
          y: treeBounds.minY - keyHeight - gap - padding,
        };
        break;
      case 'top-right':
        position = {
          x: treeBounds.maxX + gap + padding,
          y: treeBounds.minY - keyHeight - gap - padding,
        };
        break;
      case 'bottom-left':
        position = {
          x: treeBounds.minX - keyWidth - gap - padding,
          y: treeBounds.maxY + gap + padding,
        };
        break;
      case 'bottom-right':
        position = {
          x: treeBounds.maxX + gap + padding,
          y: treeBounds.maxY + gap + padding,
        };
        break;
      default:
        position = {
          x: treeBounds.minX - keyWidth - gap - padding,
          y: treeBounds.minY - keyHeight - gap - padding,
        };
    }

    console.log('📍 Key position calculated (relative to tree bounds):', {
      position: this.keyPosition,
      coordinates: position,
      keyDimensions: { width: keyWidth, height: keyHeight },
      treeBounds,
      visualizationCenter: { x: centerX, y: centerY },
    });
    return position;
  }

  private getKeyPosition(): { x: number; y: number } {
    const padding = 20;
    const keyWidth = Math.max(180, this.keyColorSize * 3 + 100);
    const keyHeight = 100; // Approximate height

    const svgWidth = this.width || 800;
    const svgHeight = this.height || 600;

    let position: { x: number; y: number };
    switch (this.keyPosition) {
      case 'top-left':
        position = { x: padding, y: padding };
        break;
      case 'top-right':
        position = { x: svgWidth - keyWidth - padding, y: padding };
        break;
      case 'bottom-left':
        position = { x: padding, y: svgHeight - keyHeight - padding };
        break;
      case 'bottom-right':
        position = {
          x: svgWidth - keyWidth - padding,
          y: svgHeight - keyHeight - padding,
        };
        break;
      default:
        position = { x: padding, y: padding };
    }

    console.log('📍 Key position calculated:', {
      position: this.keyPosition,
      coordinates: position,
      svgDimensions: { width: svgWidth, height: svgHeight },
    });
    return position;
  }

  /**
   * Hide the color key legend
   */
  private hideColorKey(): void {
    const existingGroup = (this as any)._colorKeyGroup;
    if (existingGroup) {
      existingGroup.remove();
      (this as any)._colorKeyGroup = null;
    }
  }

  /**
   * Show title with optional border and background
   */
  private showTitle(): void {
    // Remove existing title if present
    this.hideTitle();

    if (!this.foregroundLayer || !this.enableTitle) {
      return;
    }

    // Check if at least one title line has text
    const hasLine1 = this.titleLine1 && this.titleLine1.trim().length > 0;
    const hasLine2 = this.titleLine2 && this.titleLine2.trim().length > 0;

    if (!hasLine1 && !hasLine2) {
      // No text to display
      return;
    }

    console.log('📝 Rendering title with options:', {
      titlePosition: this.titlePosition,
      titleLine1: this.titleLine1,
      titleLine2: this.titleLine2,
      titleBorderType: this.titleBorderType,
      hasLine1,
      hasLine2,
    });

    // Create a group for the title in the MAIN layer
    const titleGroup = this.g.append('g').attr('class', 'title-group');
    (this as any)._titleGroup = titleGroup;

    // Padding and spacing
    const padding = 20;
    const lineSpacing = 8;
    const borderPadding = this.titleBorderType !== 'none' ? 12 : 0;

    // Helper function to apply font styling
    const applyFontStyle = (
      element: any,
      font: string,
      size: number,
      bold: boolean,
      italic: boolean,
    ) => {
      element
        .attr('font-family', this.getFontFamilyWithFallback(font))
        .attr('font-size', size)
        .attr('font-weight', bold ? 'bold' : 'normal')
        .attr('font-style', italic ? 'italic' : 'normal');
    };

    // Measure dimensions only for non-empty lines
    let text1Width = 0;
    if (hasLine1) {
      const tempText1 = this.g
        .append('text')
        .attr('visibility', 'hidden')
        .text(
          this.titleLine1Uppercase
            ? this.titleLine1.toUpperCase()
            : this.titleLine1,
        );
      applyFontStyle(
        tempText1,
        this.titleLine1Font,
        this.titleLine1Size,
        this.titleLine1Bold,
        this.titleLine1Italic,
      );
      text1Width =
        (tempText1.node() as SVGTextElement)?.getComputedTextLength() || 0;
      tempText1.remove();
    }

    let text2Width = 0;
    if (hasLine2) {
      const tempText2 = this.g
        .append('text')
        .attr('visibility', 'hidden')
        .text(
          this.titleLine2Uppercase
            ? this.titleLine2.toUpperCase()
            : this.titleLine2,
        );
      applyFontStyle(
        tempText2,
        this.titleLine2Font,
        this.titleLine2Size,
        this.titleLine2Bold,
        this.titleLine2Italic,
      );
      text2Width =
        (tempText2.node() as SVGTextElement)?.getComputedTextLength() || 0;
      tempText2.remove();
    }

    // Calculate content dimensions - only count non-empty lines
    const contentWidth = Math.max(text1Width, text2Width);
    let contentHeight = 0;
    if (hasLine1) contentHeight += this.titleLine1Size;
    if (hasLine1 && hasLine2) contentHeight += lineSpacing;
    if (hasLine2) contentHeight += this.titleLine2Size;

    // Add padding for border
    const boxWidth = contentWidth + borderPadding * 2 + padding * 2;
    const boxHeight = contentHeight + borderPadding * 2 + padding * 2;

    // Calculate position based on titlePosition
    const { x, y } = this.getTitlePositionCoordinates(boxWidth, boxHeight);

    // Draw background and border if not 'none'
    if (this.titleBorderType !== 'none') {
      const bgRect = titleGroup
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .attr('fill', this.titleBackgroundColor);

      // Apply border style
      switch (this.titleBorderType) {
        case 'squared':
          bgRect
            .attr('rx', 0)
            .attr('ry', 0)
            .attr('stroke', this.titleBorderColor)
            .attr('stroke-width', this.titleBorderThickness)
            .attr('filter', 'none');
          break;
        case 'rounded':
          bgRect
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('stroke', this.titleBorderColor)
            .attr('stroke-width', this.titleBorderThickness)
            .attr('filter', 'none');
          break;
        case 'shadow':
          bgRect
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('stroke', '#ddd')
            .attr('stroke-width', 1)
            .attr('filter', 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))');
          break;
      }
    }

    // Determine vertical alignment based on position
    // Top row positions should align to top, bottom row to bottom
    const isTopPosition =
      this.titlePosition === 'top-left' ||
      this.titlePosition === 'top-center' ||
      this.titlePosition === 'top-right';
    const isBottomPosition =
      this.titlePosition === 'bottom-left' ||
      this.titlePosition === 'bottom-center' ||
      this.titlePosition === 'bottom-right';

    // Calculate text positions with vertical alignment
    const textX = x + borderPadding + padding;
    let textY: number;

    if (isBottomPosition) {
      // Align to bottom: start from the bottom and work upward
      textY = y + boxHeight - borderPadding - padding;
      if (hasLine2) {
        textY -= this.titleLine2Size;
        const text2Element = titleGroup
          .append('text')
          .attr('x', textX)
          .attr('y', textY)
          .attr('fill', this.titleLine2Color)
          .attr('text-anchor', 'start')
          .attr(
            'text-decoration',
            this.titleLine2Underline ? 'underline' : 'none',
          )
          .text(
            this.titleLine2Uppercase
              ? this.titleLine2.toUpperCase()
              : this.titleLine2,
          );
        applyFontStyle(
          text2Element,
          this.titleLine2Font,
          this.titleLine2Size,
          this.titleLine2Bold,
          this.titleLine2Italic,
        );
      }

      // Line 1 above line 2
      if (hasLine1) {
        if (hasLine2) {
          textY -= lineSpacing + this.titleLine1Size;
        } else {
          textY -= this.titleLine1Size;
        }
        const text1Element = titleGroup
          .append('text')
          .attr('x', textX)
          .attr('y', textY)
          .attr('fill', this.titleLine1Color)
          .attr('text-anchor', 'start')
          .attr(
            'text-decoration',
            this.titleLine1Underline ? 'underline' : 'none',
          )
          .text(
            this.titleLine1Uppercase
              ? this.titleLine1.toUpperCase()
              : this.titleLine1,
          );
        applyFontStyle(
          text1Element,
          this.titleLine1Font,
          this.titleLine1Size,
          this.titleLine1Bold,
          this.titleLine1Italic,
        );
      }
    } else {
      // Align to top (default): start from the top
      textY =
        y + borderPadding + padding + (hasLine1 ? this.titleLine1Size : 0);

      // Render title line 1
      if (hasLine1) {
        const text1Element = titleGroup
          .append('text')
          .attr('x', textX)
          .attr('y', textY)
          .attr('fill', this.titleLine1Color)
          .attr('text-anchor', 'start')
          .attr(
            'text-decoration',
            this.titleLine1Underline ? 'underline' : 'none',
          )
          .text(
            this.titleLine1Uppercase
              ? this.titleLine1.toUpperCase()
              : this.titleLine1,
          );
        applyFontStyle(
          text1Element,
          this.titleLine1Font,
          this.titleLine1Size,
          this.titleLine1Bold,
          this.titleLine1Italic,
        );
      }

      // Render title line 2
      if (hasLine2) {
        textY +=
          (hasLine1 ? this.titleLine1Size + lineSpacing : 0) +
          this.titleLine2Size;
        const text2Element = titleGroup
          .append('text')
          .attr('x', textX)
          .attr('y', textY)
          .attr('fill', this.titleLine2Color)
          .attr('text-anchor', 'start')
          .attr(
            'text-decoration',
            this.titleLine2Underline ? 'underline' : 'none',
          )
          .text(
            this.titleLine2Uppercase
              ? this.titleLine2.toUpperCase()
              : this.titleLine2,
          );
        applyFontStyle(
          text2Element,
          this.titleLine2Font,
          this.titleLine2Size,
          this.titleLine2Bold,
          this.titleLine2Italic,
        );
      }
    }

    console.log('✅ Title rendered successfully at', { x, y });
  }

  /**
   * Hide the title if it exists
   */
  private hideTitle(): void {
    const existingGroup = (this as any)._titleGroup;
    if (existingGroup) {
      existingGroup.remove();
      (this as any)._titleGroup = null;
    }
  }

  /**
   * Calculate title position coordinates based on titlePosition setting
   */
  private getTitlePositionCoordinates(
    boxWidth: number,
    boxHeight: number,
  ): { x: number; y: number } {
    // Position the title relative to the tree content
    const centerX = (this.width || 800) / 2;
    const centerY = (this.height || 600) / 2;

    // Get tree bounds to position overlays outside the nodes
    const treeBounds = this.getTreeBounds();
    const padding = 20; // Extra space beyond the tree
    const gap = 16; // Space between tree boundary and overlay

    let x = centerX;
    let y = centerY;

    // Positioning based on titlePosition setting
    switch (this.titlePosition) {
      case 'top-left':
        x = treeBounds.minX - boxWidth - gap - padding;
        y = treeBounds.minY - boxHeight - gap - padding;
        break;
      case 'top-center':
        x = centerX - boxWidth / 2; // Center horizontally
        y = treeBounds.minY - boxHeight - gap - padding;
        break;
      case 'top-right':
        x = treeBounds.maxX + gap + padding;
        y = treeBounds.minY - boxHeight - gap - padding;
        break;
      case 'middle-left':
        x = treeBounds.minX - boxWidth - gap - padding;
        y = centerY - boxHeight / 2; // Center vertically
        break;
      case 'center':
        x = centerX - boxWidth / 2; // Center both
        y = centerY - boxHeight / 2;
        break;
      case 'middle-right':
        x = treeBounds.maxX + gap + padding;
        y = centerY - boxHeight / 2; // Center vertically
        break;
      case 'bottom-left':
        x = treeBounds.minX - boxWidth - gap - padding;
        y = treeBounds.maxY + gap + padding;
        break;
      case 'bottom-center':
        x = centerX - boxWidth / 2; // Center horizontally
        y = treeBounds.maxY + gap + padding;
        break;
      case 'bottom-right':
        x = treeBounds.maxX + gap + padding;
        y = treeBounds.maxY + gap + padding;
        break;
      default:
        x = centerX - boxWidth / 2;
        y = treeBounds.minY - boxHeight - gap - padding;
    }

    console.log('📍 Title position calculated (relative to tree bounds):', {
      position: this.titlePosition,
      coordinates: { x, y },
      boxDimensions: { width: boxWidth, height: boxHeight },
      treeBounds,
      visualizationCenter: { x: centerX, y: centerY },
    });

    return { x, y };
  }

  /**
   * Clear all colorization from the visualization
   */
  public clearColorizationFromVisualization(): void {
    if (!this.svg) {
      return;
    }

    this.colorizationApplicationService.clearColorization(this.svg);
    this.hideColorKey();
  }

  // Update red dot center visibility and size
  private updateRedDotCenter(): void {
    if (!this.g) return;

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    const redDot = this.g.select('.red-dot-center');
    if (redDot.empty()) {
      // Create red dot if it doesn't exist (part of transformed group)
      this.g
        .append('circle')
        .attr('class', 'red-dot-center')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', this.redDotCenterEnabled ? this.redDotCenterSize : 0)
        .attr('fill', 'red')
        .attr('opacity', 0.8)
        .attr('pointer-events', 'none');
    } else {
      // Update existing red dot
      redDot
        .transition()
        .duration(300)
        .attr('r', this.redDotCenterEnabled ? this.redDotCenterSize : 0);
    }
  }

  // Update blue dot screen center visibility and size
  private updateBlueDotScreenCenter(): void {
    if (!this.svg) return;

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    const blueDot = this.svg.select('.blue-dot-screen-center');
    if (blueDot.empty()) {
      // Create blue dot if it doesn't exist (not part of transformed group)
      this.svg
        .append('circle')
        .attr('class', 'blue-dot-screen-center')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr(
          'r',
          this.blueDotScreenCenterEnabled ? this.blueDotScreenCenterSize : 0,
        )
        .attr('fill', 'blue')
        .attr('opacity', 0.8)
        .attr('pointer-events', 'none');
    } else {
      // Update existing blue dot
      blueDot
        .transition()
        .duration(300)
        .attr(
          'r',
          this.blueDotScreenCenterEnabled ? this.blueDotScreenCenterSize : 0,
        );
    }
  }

  // Apply smooth transitions with enter/update/exit pattern
  private transitionToNewLayout(nodes: any[], links: any[]): void {
    if (!this.g) return;

    const t = d3.transition().duration(750).ease(d3.easeCubicInOut);

    // Compute viewport center offset for proper centering
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Generate link path function based on selected line type and visualization format
    const getLinkPath = this.getLinkPathGenerator();
    const linkColor = this.getLinkColor();

    // Update links with enter/update/exit pattern - using treeLinksGroup for proper layering
    const linkSelection = this.treeLinksGroup
      .selectAll('.tree-link')
      .data(links, (d: any, i: number) => `link-${i}`);

    // EXIT: Remove exiting links
    linkSelection.exit().transition(t).style('opacity', 0).remove();

    // ENTER: Add new links
    const linkEnter = linkSelection
      .enter()
      .append('path')
      .attr('class', 'tree-link')
      .style('fill', 'none')
      .style('stroke', linkColor)
      .style('stroke-width', 1.5)
      .style('opacity', 0);

    // UPDATE: Merge and transition all links (existing + new)
    linkEnter
      .merge(linkSelection)
      .transition(t)
      .style('opacity', this.treeVisible ? this.linkOpacity : 0)
      .style('stroke', linkColor)
      .attr('d', getLinkPath);

    // Update nodes with enter/update/exit pattern - using treeNodesGroup for proper layering
    const nodeSelection = this.treeNodesGroup
      .selectAll('.tree-node-group')
      .data(nodes, (d: any) => d.id);

    // Remove exiting nodes
    nodeSelection.exit().transition(t).style('opacity', 0).remove();

    // Add new nodes
    const nodeEnter = nodeSelection
      .enter()
      .append('g')
      .attr('class', 'tree-node-group')
      .style('opacity', 0)
      .style('cursor', 'pointer');

    // Add circles to new nodes
    nodeEnter
      .append('circle')
      .attr('class', 'tree-node')
      .attr('id', (d: any, i: number) => {
        // Ensure circles ALWAYS have an ID
        const id = d.id || d.nodeId || `node-${i}`;
        return id;
      })
      .attr('data-node-id', (d: any, i: number) => {
        // Backup: also set as data attribute
        const id = d.id || d.nodeId || `node-${i}`;
        return id;
      })
      .attr('r', (d: any) => this.getNodeRadius(d.depth))
      .style('fill', (d: any) => {
        // Apply color override for root node if enabled (check this FIRST)
        if (this.overrideRootNodeStyle && d.depth === 0) {
          return this.rootNodeFillColor; // Use override color for root node circle
        }
        // When colorTarget is 'text', don't colorize circles - use nodeFillColor instead
        // When colorTarget is 'nodes' or 'both', use colorized colors
        if (this.colorTarget === 'text') {
          console.log(
            `🎨 [colorTarget='text'] Circle fill color: ${this.nodeFillColor}, stroke: ${this.nodeStrokeColor}`,
          );
          return this.nodeFillColor;
        }
        return this.getNodeColor(d.id);
      })
      .style(
        'stroke',
        this.nodeStrokeColor || (this.isDarkMode ? '#fff' : '#333'),
      )
      .style('stroke-width', 2);

    // Add labels to new nodes
    nodeEnter
      .append('text')
      .attr('class', 'tree-node-label')
      .attr('id', (d: any, i: number) => {
        // Ensure text elements ALWAYS have an ID
        const id = d.id || d.nodeId || `node-${i}`;
        return `label-${id}`;
      })
      .attr('data-node-id', (d: any, i: number) => {
        // Ensure data-node-id is set for coloring lookup
        const id = d.id || d.nodeId || `node-${i}`;
        return id;
      })
      .attr('x', (d: any) => this.getTextPosition(d).x - d.x)
      .attr('y', (d: any) => this.getTextPosition(d).y - d.y)
      .attr('text-anchor', (d: any) => this.getTextPosition(d).anchor)
      .attr('dominant-baseline', 'middle')
      .attr('transform', (d: any) => {
        const pos = this.getTextPosition(d);
        if (pos.rotation !== 0) {
          const offsetX = pos.x - d.x;
          const offsetY = pos.y - d.y;
          return `rotate(${pos.rotation}, ${offsetX}, ${offsetY})`;
        }
        return '';
      })
      .style('fill', (d: any) => {
        // Use textFillColor if colorTarget is 'nodes' or 'both', otherwise use default color
        if (this.colorTarget === 'nodes' || this.colorTarget === 'both') {
          return this.textFillColor;
        }
        return this.isDarkMode ? '#fff' : '#333';
      })
      .style('stroke', (d: any) => {
        // Use textStrokeColor if colorTarget is 'nodes' or 'both', otherwise none
        if (this.colorTarget === 'nodes' || this.colorTarget === 'both') {
          return this.textStrokeColor || 'none';
        }
        return 'none';
      })
      .style('font-size', '12px')
      .style('font-family', this.getFontFamilyWithFallback(this.textFontFamily))
      .style('pointer-events', 'none')
      .text((d: any) => d.data.name || d.id);

    // Update all nodes (existing + new)
    const nodeUpdate = nodeEnter.merge(nodeSelection);

    nodeUpdate
      .transition(t)
      .style('opacity', this.treeVisible ? this.nodeOpacity : 0) // Respect tree visibility AND node opacity
      .attr('transform', (d: any) => {
        const x = d.x !== undefined ? d.x : 0;
        const y = d.y !== undefined ? d.y : 0;
        return `translate(${x},${y})`;
      });

    // Update circles
    nodeUpdate
      .select('.tree-node')
      .transition(t)
      .attr('r', (d: any) => this.getNodeRadius(d.depth))
      .style('fill', (d: any) => {
        // Apply color override for root node if enabled (check this FIRST)
        if (this.overrideRootNodeStyle && d.depth === 0) {
          return this.rootNodeFillColor; // Use override color for root node circle
        }
        // When colorTarget is 'text', don't colorize circles - use nodeFillColor instead
        // When colorTarget is 'nodes' or 'both', use colorized colors
        if (this.colorTarget === 'text') {
          console.log(
            `🎨 [colorTarget='text'] Updating circle fill color: ${this.nodeFillColor}, stroke: ${this.nodeStrokeColor}`,
          );
          return this.nodeFillColor;
        }
        return this.getNodeColor(d.id);
      })
      .style(
        'stroke',
        this.nodeStrokeColor || (this.isDarkMode ? '#fff' : '#333'),
      );

    // Update labels
    nodeUpdate
      .select('.tree-node-label')
      .transition(t)
      .attr('x', (d: any) => this.getTextPosition(d).x - d.x)
      .attr('y', (d: any) => this.getTextPosition(d).y - d.y)
      .attr('text-anchor', (d: any) => this.getTextPosition(d).anchor)
      .attr('transform', (d: any) => {
        const pos = this.getTextPosition(d);
        if (pos.rotation !== 0) {
          const offsetX = pos.x - d.x;
          const offsetY = pos.y - d.y;
          return `rotate(${pos.rotation}, ${offsetX}, ${offsetY})`;
        }
        return '';
      })
      .style('fill', (d: any) => {
        // Apply color override for root node if enabled
        if (this.overrideRootNodeStyle && d.depth === 0) {
          return this.rootNodeTextColor; // Use text color for labels
        }
        // Use textFillColor if colorTarget is 'nodes' or 'both', otherwise use colorized color
        if (this.colorTarget === 'nodes' || this.colorTarget === 'both') {
          return this.textFillColor;
        }
        return this.isDarkMode ? '#fff' : '#333';
      })
      .style('stroke', (d: any) => {
        // Use textStrokeColor if colorTarget is 'nodes' or 'both', otherwise none
        if (this.colorTarget === 'nodes' || this.colorTarget === 'both') {
          return this.textStrokeColor || 'none';
        }
        return 'none';
      })
      .style('font-size', (d: any) => {
        // Apply font size override for root node text if enabled
        if (this.overrideRootNodeStyle && d.depth === 0) {
          return `${this.rootNodeSize}px`;
        }
        // Apply tree text size
        return `${this.treeTextSize}px`;
      })
      .style('letter-spacing', (d: any) => {
        // Add padding between root node text and surrounding nodes for large sizes
        if (this.overrideRootNodeStyle && d.depth === 0) {
          if (this.rootNodeSize >= 18) {
            return '2px';
          }
        }
        return 'normal';
      })
      .style('font-family', (d: any) => {
        // Apply font override for root node if enabled
        if (this.overrideRootNodeStyle && d.depth === 0) {
          return this.getFontFamilyWithFallback(this.rootNodeFont);
        }
        return this.getFontFamilyWithFallback(this.textFontFamily);
      })
      .style('font-weight', (d: any) => {
        // Apply style override for root node if enabled
        if (this.overrideRootNodeStyle && d.depth === 0) {
          return this.rootNodeBold ? 'bold' : 'normal';
        }
        // Apply tree text bold if enabled
        return this.treeTextBold ? 'bold' : 'normal';
      })
      .style('font-style', (d: any) => {
        // Apply style override for root node if enabled
        if (this.overrideRootNodeStyle && d.depth === 0) {
          return this.rootNodeItalic ? 'italic' : 'normal';
        }
        // Apply tree text italic if enabled
        return this.treeTextItalic ? 'italic' : 'normal';
      })
      .style('text-transform', (d: any) => {
        // Apply uppercase override for root node if enabled
        if (this.overrideRootNodeStyle && d.depth === 0) {
          return this.rootNodeUppercase ? 'uppercase' : 'none';
        }
        // Apply tree text uppercase if enabled
        return this.treeTextUppercase ? 'uppercase' : 'none';
      })
      .style('fill', (d: any) => {
        // Apply color override for root node labels if enabled
        if (this.overrideRootNodeStyle && d.depth === 0) {
          return this.rootNodeTextColor;
        }
        return this.isDarkMode ? '#fff' : '#333';
      })
      .style('opacity', this.treeVisible ? this.textOpacity : 0)
      .text((d: any) => d.data.name || d.id);

    // Add click handlers to new nodes
    nodeEnter.on('click', (event: any, d: any) => {
      if (this.drawingMode === 'pan') {
        // Check if shift key is held down
        if (event.shiftKey) {
          // Shift+click in pan mode: Add node to selection (same as select mode)
          console.log('Pan mode shift+click: adding node to selection', d.id);
          this.toggleNodeSelection(d.id);
        } else {
          // Normal click in pan mode: Set single node selection without auto-panning
          console.log('Node click in pan mode', d.id);

          // Temporarily suppress auto-pan to avoid interfering with subsequent manual panning
          this.suppressAutoPanToNode = true;
          this.selectedNode = d.id;
          this.updateSingleNodeSelection();

          // Auto-show appropriate viewer when a node is selected
          if (
            !this.getToolbarVisibility('lessonViewer') &&
            !this.getToolbarVisibility('techniqueExplorer')
          ) {
            this.autoShowAppropriateViewer();
          }

          // Auto-show Explorer when a node is selected (only if enabled and not already visible)
          if (
            this.explorerAutoShowEnabled &&
            !this.getToolbarVisibility('explorer')
          ) {
            this.toggleToolbarVisibility('explorer');
          }

          // Reset the flag after a short delay to allow for immediate drag attempts
          setTimeout(() => {
            this.suppressAutoPanToNode = false;
          }, 100);
        }
        event.stopPropagation();
      } else if (this.drawingMode === 'select') {
        this.toggleNodeSelection(d.id);
        event.stopPropagation();
      } else if (this.drawingMode === 'relatedNodes') {
        this.selectRelatedNodes(d.id);
        event.stopPropagation();
      }
    });

    // Update selected node text info after transition completes
    setTimeout(() => {
      this.updateSelectedNodeTextInfo();
    }, 750); // Match transition duration
  }

  // Helper method to determine if background is light or dark based on background style
  private isBackgroundLight(): boolean {
    switch (this.backgroundStyle) {
      case 'follow-mode':
        // follow-mode uses isDarkMode, light when isDarkMode=false
        return !this.isDarkMode;
      case 'aqua-circle':
        // aqua-circle uses isDarkMode, light when isDarkMode=false
        return !this.isDarkMode;
      case 'pure-black':
      case 'digital-blue':
      case 'digital-green':
      case 'tenant-definition':
        // These are all dark backgrounds
        return false;
      default:
        return !this.isDarkMode;
    }
  }

  // Helper method to get node color (based on existing pattern)
  private getNodeColor(nodeId: string): string {
    if (this.selectedNode === nodeId) {
      return this.colorsService.getSelectedNodeStyle(this.isDarkMode).nodeColor; // Selected node color
    }
    if (this.selectedNodes.includes(nodeId)) {
      return this.colorsService.getSelectedNodesStyle(this.isDarkMode)
        .nodeColor; // Multi-selected node color
    }
    return this.colorsService.getDefaultNodeStyle(
      this.isDarkMode,
      this.isBackgroundLight(),
    ).nodeColor; // Default node color
  }

  // Helper method to get selected visualization option
  public getSelectedVisualizationOption() {
    return this.visualizationOptions.find(
      (option) => option.value === this.selectedVisualization,
    );
  }

  // Update computed properties to prevent expression change errors
  private updateSelectedNodesPanelVisibility(): void {
    // Show the panel if the toolbar is toggled on, regardless of selected nodes length
    this.toolbarVisibility$.pipe(take(1)).subscribe((state) => {
      this.shouldShowSelectedNodesPanel = state.selectedNodes;
    });
  }

  private updateSkillsRadarVisibility(): void {
    console.log('🎯 updateSkillsRadarVisibility called:', {
      isRestoringState: this.isRestoringState,
      selectedNodesLength: this.selectedNodes.length,
      skillsRadarManuallyClosed: this.skillsRadarManuallyClosed,
      nodesAddedByUser: this.nodesAddedByUser,
    });

    // Don't auto-open during state restoration - respect stored state
    if (this.isRestoringState) {
      console.log('🎯 Skipping auto-open during state restoration');
      return;
    }

    // Only auto-open if nodes were added by user interaction AND user hasn't manually closed it
    if (
      this.selectedNodes.length > 0 &&
      this.nodesAddedByUser &&
      !this.skillsRadarManuallyClosed &&
      !this.operationModeService.isAnyModeActive() // Don't auto-show when operation mode is active
    ) {
      console.log('🎯 Auto-opening skills radar due to user-selected nodes');
      this.store.dispatch(new SetToolbarVisibility('skillsRadar' as any, true));
    } else if (this.selectedNodes.length === 0) {
      // Reset flags when no nodes are selected
      this.skillsRadarManuallyClosed = false;
      this.nodesAddedByUser = false;
      console.log('🎯 Reset flags - no nodes selected');
    }
  }

  private drawTree(nodes: D3TreeNode[], links: any[]) {
    // Draw links first (so they appear behind nodes)
    this.drawTreeLinks(links);

    // Draw nodes
    this.drawTreeNodes(nodes);

    // Draw labels
    this.drawTreeLabels(nodes);

    // Apply current tree visibility setting
    this.updateTreeVisibility();
  }

  private updateTree(nodes: D3TreeNode[], links: any[]) {
    // Clear existing tree elements from dedicated groups (except links which handle their own transitions)
    this.treeNodesGroup.selectAll('.tree-node').remove();
    this.treeLabelsGroup.selectAll('.tree-label').remove();

    // Redraw with new data
    this.drawTree(nodes, links);
  }

  private drawTreeLinks(links: any[]) {
    // Define transition
    const t = d3.transition().duration(750).ease(d3.easeCubicInOut);

    // Use enter/update/exit pattern with proper key function
    const linkSelection = this.treeLinksGroup
      .selectAll('path.tree-link')
      .data(
        links,
        (d: any, i: number) => `link-${d.source.data.id}-${d.target.data.id}`,
      );

    // EXIT: Remove exiting links with fade out
    linkSelection.exit().transition(t).style('opacity', 0).remove();

    // ENTER: Add new links with initial opacity 0
    const linkEnter = linkSelection
      .enter()
      .append('path')
      .attr('class', 'tree-link')
      .attr('d', (d: any) => {
        // For radial trees, create smooth curved paths from parent to child
        // Use a radial line generator for more natural curves
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        // Calculate control points for a smooth curve
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;

        // Create a curved path that follows the radial structure
        // Use the midpoint between source and target as a control point
        const midX = (d.source.x + d.target.x) / 2;
        const midY = (d.source.y + d.target.y) / 2;

        // Adjust control point towards center for more natural radial curves
        const controlX = (midX + centerX) / 2;
        const controlY = (midY + centerY) / 2;

        return `M${d.source.x},${d.source.y} Q${controlX},${controlY} ${d.target.x},${d.target.y}`;
      })
      .attr('fill', 'none')
      .attr('stroke', this.isDarkMode ? '#666' : '#999')
      .attr('stroke-width', 2)
      .style('opacity', 0); // Start with opacity 0

    // UPDATE: Merge enter and update selections, then transition
    linkEnter
      .merge(linkSelection)
      .transition(t)
      .attr('d', (d: any) => {
        // For radial trees, create smooth curved paths from parent to child
        // Use a radial line generator for more natural curves
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        // Calculate control points for a smooth curve
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;

        // Create a curved path that follows the radial structure
        // Use the midpoint between source and target as a control point
        const midX = (d.source.x + d.target.x) / 2;
        const midY = (d.source.y + d.target.y) / 2;

        // Adjust control point towards center for more natural radial curves
        const controlX = (midX + centerX) / 2;
        const controlY = (midY + centerY) / 2;

        return `M${d.source.x},${d.source.y} Q${controlX},${controlY} ${d.target.x},${d.target.y}`;
      })
      .attr('stroke', this.isDarkMode ? '#666' : '#999')
      .attr('stroke-width', 2)
      .style('opacity', this.treeVisible ? this.linkOpacity : 0); // Respect tree visibility with smooth transition
  }

  private drawTreeNodes(nodes: D3TreeNode[]) {
    console.log(`[DRAW] Creating ${nodes.length} circle nodes`);
    console.log(
      `[DRAW] First few nodes (raw):`,
      nodes.slice(0, 5).map((n) => ({
        id: (n as any).id,
        dataId: (n as any).data?.id,
        nodeId: (n as any).nodeId,
        hasId: 'id' in n,
        hasNodeId: 'nodeId' in n,
        keys: Object.keys(n).slice(0, 10),
      })),
    );

    this.treeNodesGroup
      .selectAll('circle.tree-node')
      .data(nodes, (d: any, i: number) => d.id || d.nodeId || `node-${i}`) // Use id as key, fallback to nodeId or index
      .enter()
      .append('circle')
      .attr('class', 'tree-node')
      .attr('id', (d: any, i: number) => {
        // Ensure circles ALWAYS have an ID
        const id = d.id || d.nodeId || `node-${i}`;
        console.log(`[DRAW] Circle ${i}: id="${id}"`);
        return id;
      })
      .attr('data-node-id', (d: any, i: number) => {
        // Backup: also set as data attribute
        const id = d.id || d.nodeId || `node-${i}`;
        return id;
      })
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', (d: any) => this.getNodeRadius(d.depth))
      .attr('fill', (d: any) =>
        d.depth === 0
          ? this.colorsService.getSelectedNodeStyle(this.isDarkMode).nodeColor
          : this.colorsService.getDefaultNodeStyle(
              this.isDarkMode,
              this.isBackgroundLight(),
            ).nodeColor,
      ) // Root node in different color
      .attr('stroke', (d: any) => (d.depth === 0 ? '#d84315' : '#1565c0'))
      .attr('stroke-width', 2)
      .attr('opacity', this.treeVisible ? 1 : 0) // Respect tree visibility
      .attr('cursor', 'pointer')
      .on('mouseover', (event: any, d: any) => {
        this.tooltip = {
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          text: d.data.name || d.data.id,
        };
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mousemove', (event: any, d: any) => {
        this.tooltip.x = event.offsetX;
        this.tooltip.y = event.offsetY;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mouseout', () => {
        this.tooltip.visible = false;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('click', (event: any, d: any) => {
        if (this.drawingMode === 'pan') {
          // Check if shift key is held down
          if (event.shiftKey) {
            // Shift+click in pan mode: Add node to selection (same as select mode)
            console.log(
              'Tree node pan mode shift+click: adding node to selection',
              d.data.id,
              event,
            );
            this.toggleNodeSelection(d.data.id);
          } else {
            // Normal click in pan mode: Set single node selection without auto-panning
            console.log('tree node click in pan mode', d.data.id, event);

            // Temporarily suppress auto-pan to avoid interfering with subsequent manual panning
            this.suppressAutoPanToNode = true;
            this.selectedNode = d.data.id;
            this.updateSingleNodeSelection();

            // Auto-show appropriate viewer when a node is selected
            if (
              !this.getToolbarVisibility('lessonViewer') &&
              !this.getToolbarVisibility('techniqueExplorer')
            ) {
              this.autoShowAppropriateViewer();
            }

            // Auto-show Explorer when a node is selected (only if enabled and not already visible)
            if (
              this.explorerAutoShowEnabled &&
              !this.getToolbarVisibility('explorer')
            ) {
              this.toggleToolbarVisibility('explorer');
            }

            // Reset the flag after a short delay to allow for immediate drag attempts
            setTimeout(() => {
              this.suppressAutoPanToNode = false;
            }, 100);
          }
          event.stopPropagation();
        } else if (this.drawingMode === 'select') {
          console.log('tree node select click', d.data.id, event);
          this.toggleNodeSelection(d.data.id);
          event.stopPropagation();
        } else if (this.drawingMode === 'relatedNodes') {
          console.log('tree node relatedNodes click', d.data.id, event);
          this.selectRelatedNodes(d.data.id);
          event.stopPropagation();
        }
      });
  }

  private drawTreeLabels(nodes: D3TreeNode[]) {
    console.log(`[DRAW] Creating ${nodes.length} text labels`);
    console.log(
      `[DRAW] First few text nodes (raw):`,
      nodes.slice(0, 5).map((n) => ({
        id: (n as any).id,
        dataId: (n as any).data?.id,
        nodeId: (n as any).nodeId,
        hasId: 'id' in n,
        hasNodeId: 'nodeId' in n,
      })),
    );

    this.treeLabelsGroup
      .selectAll('text.tree-label')
      .data(nodes, (d: any, i: number) => d.id || d.nodeId || `node-${i}`) // Use standardized id as key
      .enter()
      .append('text')
      .attr('class', 'tree-label')
      .attr('id', (d: any, i: number) => {
        // Ensure text elements ALWAYS have an ID
        const id = d.id || d.nodeId || `node-${i}`;
        return `label-${id}`;
      })
      .attr('data-node-id', (d: any, i: number) => {
        // Ensure data-node-id is set for coloring lookup
        const id = d.id || d.nodeId || `node-${i}`;
        return id;
      })
      .attr('x', (d: any) => {
        const pos = this.getTextPosition(d);
        return pos.x;
      })
      .attr('y', (d: any) => {
        const pos = this.getTextPosition(d);
        return pos.y;
      })
      .attr('text-anchor', (d: any) => {
        const pos = this.getTextPosition(d);
        return pos.anchor;
      })
      .attr('transform', (d: any) => {
        const pos = this.getTextPosition(d);
        if (pos.rotation !== 0) {
          return `rotate(${pos.rotation}, ${pos.x}, ${pos.y})`;
        }
        return '';
      })
      .attr('font-size', 10)
      .attr('fill', '#fff')
      .attr('opacity', this.treeVisible ? 1 : 0) // Respect tree visibility
      .attr('cursor', 'pointer')
      .attr('font-weight', (d: any) => (d.depth === 0 ? 'bold' : 'normal'))
      .text((d: any) => d.data.id)
      .on('mouseover', (event: any, d: any) => {
        this.tooltip = {
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          text: d.data.name || d.data.id,
        };
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mousemove', (event: any, d: any) => {
        this.tooltip.x = event.offsetX;
        this.tooltip.y = event.offsetY;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mouseout', () => {
        this.tooltip.visible = false;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('click', (event: any, d: any) => {
        if (this.drawingMode === 'pan') {
          // Check if shift key is held down
          if (event.shiftKey) {
            // Shift+click in pan mode: Add node to selection (same as select mode)
            console.log(
              'Tree label pan mode shift+click: adding node to selection',
              d.data.id,
              event,
            );
            this.toggleNodeSelection(d.data.id);
          } else {
            // Normal click in pan mode: Set single node selection without auto-panning
            console.log('tree label click in pan mode', d.data.id, event);

            // Temporarily suppress auto-pan to avoid interfering with subsequent manual panning
            this.suppressAutoPanToNode = true;
            this.selectedNode = d.data.id;
            this.updateSingleNodeSelection();

            // Reset the flag after a short delay to allow for immediate drag attempts
            setTimeout(() => {
              this.suppressAutoPanToNode = false;
            }, 100);
          }
          event.stopPropagation();
        } else if (this.drawingMode === 'select') {
          console.log('tree label select click', d.data.id, event);
          this.toggleNodeSelection(d.data.id);
          event.stopPropagation();
        } else if (this.drawingMode === 'relatedNodes') {
          console.log('tree label relatedNodes click', d.data.id, event);
          this.selectRelatedNodes(d.data.id);
          event.stopPropagation();
        }
      });
  }

  private drawCircles(
    circles: { x: number; y: number; r: number; id: string }[],
  ) {
    this.g
      .selectAll('circle.node-circle')
      .data(circles)
      .enter()
      .append('circle')
      .attr('class', 'node-circle')
      .attr('id', (d: any) => d.id)
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', (d: any) => d.r)
      .attr('fill', '#2196f3')
      .attr('stroke', '#1565c0')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseover', (event: any, d: any) => {
        this.tooltip = {
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          text: d.id,
        };
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mousemove', (event: any, d: any) => {
        this.tooltip.x = event.offsetX;
        this.tooltip.y = event.offsetY;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mouseout', () => {
        this.tooltip.visible = false;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('click', (event: any, d: any) => {
        if (this.drawingMode === 'pan') {
          console.log('circle click', d.id, event);
          // Simply select the node without any zoom/pan
          this.selectedNode = d.id;
          event.stopPropagation();
        } else if (this.drawingMode === 'select') {
          console.log('circle select click', d.id, event);
          // Toggle node selection
          this.toggleNodeSelection(d.id);
          event.stopPropagation();
        } else if (this.drawingMode === 'relatedNodes') {
          console.log('circle relatedNodes click', d.id, event);
          // Select all related nodes
          this.selectRelatedNodes(d.id);
          event.stopPropagation();
        }
      });
  }

  private updateCircles(
    circles: { x: number; y: number; r: number; id: string }[],
  ) {
    // Join new data with existing circles
    const circleSelection = this.g
      .selectAll('circle.node-circle')
      .data(circles, (d: any) => d.id);

    // EXIT: Remove old elements with smooth fade out
    circleSelection
      .exit()
      .transition()
      .duration(500)
      .attr('r', 0)
      .style('opacity', 0)
      .remove();

    // ENTER: Add new elements with smooth fade in
    const enterCircles = circleSelection
      .enter()
      .append('circle')
      .attr('class', 'node-circle')
      .attr('id', (d: any) => d.id)
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', 0) // Start with radius 0
      .attr('fill', '#2196f3')
      .attr('stroke', '#1565c0')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .style('opacity', 0); // Start transparent

    // Add event handlers to new circles
    enterCircles
      .on('mouseover', (event: any, d: any) => {
        this.tooltip = {
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          text: d.id,
        };
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mousemove', (event: any, d: any) => {
        this.tooltip.x = event.offsetX;
        this.tooltip.y = event.offsetY;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mouseout', () => {
        this.tooltip.visible = false;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('click', (event: any, d: any) => {
        if (this.drawingMode === 'pan') {
          console.log('circle click in pan mode', d.id, event);

          // Temporarily suppress auto-pan to avoid interfering with subsequent manual panning
          this.suppressAutoPanToNode = true;
          this.selectedNode = d.id;

          // Reset the flag after a short delay to allow for immediate drag attempts
          setTimeout(() => {
            this.suppressAutoPanToNode = false;
          }, 100);

          event.stopPropagation();
        } else if (this.drawingMode === 'select') {
          console.log('circle select click', d.id, event);
          // Toggle node selection
          this.toggleNodeSelection(d.id);
          event.stopPropagation();
        } else if (this.drawingMode === 'relatedNodes') {
          console.log('circle relatedNodes click', d.id, event);
          // Select all related nodes
          this.selectRelatedNodes(d.id);
          event.stopPropagation();
        }
      });

    // UPDATE: Merge enter and existing selections, then animate to new positions
    enterCircles
      .merge(circleSelection)
      .transition()
      .duration(500)
      .ease(d3.easeBackOut.overshoot(1.2))
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', (d: any) => d.r)
      .style('opacity', 1);
  }

  private drawLabels(
    circles: { x: number; y: number; r: number; id: string }[],
  ) {
    this.g
      .selectAll('text.node-label')
      .data(circles)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', (d: any) => Math.min(12, d.r))
      .attr('fill', '#fff')
      .attr('cursor', 'pointer')
      .text((d: any) => d.id)
      .on('mouseover', (event: any, d: any) => {
        this.tooltip = {
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          text: d.id,
        };
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mousemove', (event: any, d: any) => {
        this.tooltip.x = event.offsetX;
        this.tooltip.y = event.offsetY;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mouseout', () => {
        this.tooltip.visible = false;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('click', (event: any, d: any) => {
        if (this.drawingMode === 'pan') {
          console.log('label click', d.id, event);
          // Simply select the node without any zoom/pan
          this.selectedNode = d.id;
          event.stopPropagation();
        } else if (this.drawingMode === 'select') {
          console.log('label select click', d.id, event);
          // Toggle node selection
          this.toggleNodeSelection(d.id);
          event.stopPropagation();
        }
      });
  }

  private updateLabels(
    circles: { x: number; y: number; r: number; id: string }[],
  ) {
    // Join new data with existing text labels
    const labelSelection = this.g
      .selectAll('text.node-label')
      .data(circles, (d: any) => d.id);

    // EXIT: Remove old labels with smooth fade out
    labelSelection
      .exit()
      .transition()
      .duration(500)
      .style('opacity', 0)
      .attr('font-size', 0)
      .remove();

    // ENTER: Add new labels with smooth fade in
    const enterLabels = labelSelection
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', 0) // Start with font-size 0
      .attr('fill', '#fff')
      .attr('cursor', 'pointer')
      .style('opacity', 0) // Start transparent
      .text((d: any) => d.id);

    // Add event handlers to new labels
    enterLabels
      .on('mouseover', (event: any, d: any) => {
        this.tooltip = {
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          text: d.id,
        };
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mousemove', (event: any, d: any) => {
        this.tooltip.x = event.offsetX;
        this.tooltip.y = event.offsetY;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mouseout', () => {
        this.tooltip.visible = false;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('click', (event: any, d: any) => {
        if (this.drawingMode === 'pan') {
          console.log('label click in pan mode', d.id, event);

          // Temporarily suppress auto-pan to avoid interfering with subsequent manual panning
          this.suppressAutoPanToNode = true;
          this.selectedNode = d.id;

          // Reset the flag after a short delay to allow for immediate drag attempts
          setTimeout(() => {
            this.suppressAutoPanToNode = false;
          }, 100);

          event.stopPropagation();
        } else if (this.drawingMode === 'select') {
          console.log('label select click', d.id, event);
          // Toggle node selection
          this.toggleNodeSelection(d.id);
          event.stopPropagation();
        }
      });

    // UPDATE: Merge enter and existing selections, then animate to new positions
    enterLabels
      .merge(labelSelection)
      .transition()
      .duration(500)
      .ease(d3.easeBackOut.overshoot(1.2))
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y + 5)
      .attr('font-size', (d: any) => Math.min(12, d.r))
      .style('opacity', 1);
  }

  private drawRotationControl() {
    // Position the rotation control in the upper-right corner below other controls
    const controlSize = 240;
    const controlX = this.width - controlSize - 20;
    const controlY = 120; // Below the existing controls
    const radius = controlSize / 2 - 30;

    // Create a group for the rotation control
    const rotationControl = this.svg
      .append('g')
      .attr('class', 'rotation-control');

    // Background circle for the control
    rotationControl
      .append('circle')
      .attr('cx', controlX + controlSize / 2)
      .attr('cy', controlY + controlSize / 2)
      .attr('r', radius + 5)
      .attr(
        'fill',
        this.isDarkMode ? 'rgba(60, 60, 60, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      )
      .attr('stroke', this.isDarkMode ? '#555' : '#ccc')
      .attr('stroke-width', 1);

    // Main control circle
    rotationControl
      .append('circle')
      .attr('cx', controlX + controlSize / 2)
      .attr('cy', controlY + controlSize / 2)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', this.isDarkMode ? '#aaa' : '#666')
      .attr('stroke-width', 1);

    // Major degree ticks (every 45 degrees)
    const majorDegrees = [0, 45, 90, 135, 180, 225, 270, 315];
    majorDegrees.forEach((degree) => {
      const radian = ((degree - 90) * Math.PI) / 180; // -90 to start from top
      const centerX = controlX + controlSize / 2;
      const centerY = controlY + controlSize / 2;
      const x1 = centerX + Math.cos(radian) * (radius - 6);
      const y1 = centerY + Math.sin(radian) * (radius - 6);
      const x2 = centerX + Math.cos(radian) * radius;
      const y2 = centerY + Math.sin(radian) * radius;

      rotationControl
        .append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', this.isDarkMode ? '#ccc' : '#333')
        .attr('stroke-width', 1.5);
    });

    // Minor degree ticks (every 15 degrees, excluding majors)
    const minorDegrees = [
      15, 30, 60, 75, 105, 120, 150, 165, 195, 210, 240, 255, 285, 300, 330,
      345,
    ];
    minorDegrees.forEach((degree) => {
      const radian = ((degree - 90) * Math.PI) / 180;
      const centerX = controlX + controlSize / 2;
      const centerY = controlY + controlSize / 2;
      const x1 = centerX + Math.cos(radian) * (radius - 3);
      const y1 = centerY + Math.sin(radian) * (radius - 3);
      const x2 = centerX + Math.cos(radian) * radius;
      const y2 = centerY + Math.sin(radian) * radius;

      rotationControl
        .append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', this.isDarkMode ? '#999' : '#666')
        .attr('stroke-width', 0.8);
    });

    // Cardinal direction labels
    const cardinalDirections = [
      { degree: 0, label: 'N' },
      { degree: 90, label: 'E' },
      { degree: 180, label: 'S' },
      { degree: 270, label: 'W' },
    ];

    cardinalDirections.forEach(({ degree, label }) => {
      const radian = ((degree - 90) * Math.PI) / 180;
      const centerX = controlX + controlSize / 2;
      const centerY = controlY + controlSize / 2;
      const labelX = centerX + Math.cos(radian) * (radius - 12);
      const labelY = centerY + Math.sin(radian) * (radius - 12);

      rotationControl
        .append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 8)
        .attr('font-weight', 'bold')
        .attr('fill', '#2196f3')
        .text(label);
    });

    // Draggable indicator circle
    const indicatorRadius = 4;
    const currentRadian = ((this.rotationAngle - 90) * Math.PI) / 180;
    const centerX = controlX + controlSize / 2;
    const centerY = controlY + controlSize / 2;
    const indicatorX = centerX + Math.cos(currentRadian) * (radius - 2);
    const indicatorY = centerY + Math.sin(currentRadian) * (radius - 2);

    const indicator = rotationControl
      .append('circle')
      .attr('class', 'rotation-indicator')
      .attr('cx', indicatorX)
      .attr('cy', indicatorY)
      .attr('r', indicatorRadius)
      .attr('fill', this.colorsService.getSelectedNodeStyle().nodeColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('cursor', 'pointer');

    // Center dot
    rotationControl
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 2)
      .attr('fill', this.isDarkMode ? '#aaa' : '#666');

    // Add drag behavior to the indicator
    const drag = d3.drag().on('drag', (event) => {
      const mouseX = event.x;
      const mouseY = event.y;

      // Calculate angle from center to mouse position
      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      // Adjust angle to match our rotation system (0° at top)
      angle = (angle + 90) % 360;
      if (angle < 0) angle += 360;

      const newAngle = Math.round(angle);

      // Update rotation angle locally
      this.rotationAngle = newAngle;
      this.currentRotation = (newAngle * Math.PI) / 180;

      // Update indicator position
      const newRadian = ((newAngle - 90) * Math.PI) / 180;
      const newX = centerX + Math.cos(newRadian) * (radius - 2);
      const newY = centerY + Math.sin(newRadian) * (radius - 2);

      indicator.attr('cx', newX).attr('cy', newY);

      // Also update the wheel indicator position if it exists
      if (
        this.wheelIndicator &&
        this.wheelCenterX &&
        this.wheelCenterY &&
        this.wheelRadius
      ) {
        this.updateWheelIndicator(
          this.wheelIndicator,
          this.wheelCenterX,
          this.wheelCenterY,
          this.wheelRadius,
        );
      }

      // Apply rotation to main content
      this.applyTransform();
    });

    indicator.call(drag);

    // Store reference for updates
    this.degreeGroup = rotationControl;
  }

  updateRotation(event: Event) {
    const target = event.target as HTMLInputElement;
    const rotationAngle = parseInt(target.value);
    this.rotationAngle = rotationAngle;
    this.currentRotation = (rotationAngle * Math.PI) / 180;

    // Update rotation in the visualization interaction service
    this.visualizationInteractionService.updateRotation(rotationAngle);

    // Update the rotation control indicator position
    this.updateRotationControlIndicator();

    // Update the wheel indicator position if it exists
    if (
      this.wheelIndicator &&
      this.wheelCenterX &&
      this.wheelCenterY &&
      this.wheelRadius
    ) {
      this.updateWheelIndicator(
        this.wheelIndicator,
        this.wheelCenterX,
        this.wheelCenterY,
        this.wheelRadius,
      );
    }

    // Apply rotation to main content using consistent transform logic
    this.applyTransform();
  }

  resetRotation() {
    this.rotationAngle = 0;
    this.currentRotation = 0;

    // Update via interaction service
    this.visualizationInteractionService.updateRotation(0);

    this.updateRotationControlIndicator();

    // Update the wheel indicator position if it exists
    if (
      this.wheelIndicator &&
      this.wheelCenterX &&
      this.wheelCenterY &&
      this.wheelRadius
    ) {
      this.updateWheelIndicator(
        this.wheelIndicator,
        this.wheelCenterX,
        this.wheelCenterY,
        this.wheelRadius,
      );
    }

    this.applyTransform();
    console.log('Rotation reset to 0°');
  }

  resetPan() {
    // Reset pan to center (0, 0)
    this.panX = 0;
    this.panY = 0;

    // Update via interaction service
    this.visualizationInteractionService.updatePan('x', 0);
    this.visualizationInteractionService.updatePan('y', 0);

    // Apply the transform
    this.applyTransform();

    console.log('Pan reset to center');
  }

  resetZoom() {
    // Reset zoom to 1x
    this.zoomLevel = 1;

    // Update via interaction service
    this.visualizationInteractionService.updateZoom(1);

    // Apply the transform
    this.applyTransform();

    console.log('Zoom reset to 1x');
  }

  resetAll() {
    // Reset rotation
    this.rotationAngle = 0;
    this.currentRotation = 0;

    // Reset pan to center
    this.panX = 0;
    this.panY = 0;

    // Reset zoom to 1x
    this.zoomLevel = 1;

    // Update via interaction service
    this.visualizationInteractionService.updateRotation(0);
    this.visualizationInteractionService.updatePan('x', 0);
    this.visualizationInteractionService.updatePan('y', 0);
    this.visualizationInteractionService.updateZoom(1);

    // Update rotation wheel indicator
    this.updateRotationControlIndicator();
    if (
      this.wheelIndicator &&
      this.wheelCenterX &&
      this.wheelCenterY &&
      this.wheelRadius
    ) {
      this.updateWheelIndicator(
        this.wheelIndicator,
        this.wheelCenterX,
        this.wheelCenterY,
        this.wheelRadius,
      );
    }

    // Apply the transform
    this.applyTransform();

    console.log('All transforms reset: rotation=0°, pan=(0,0), zoom=1x');
  }

  private initializeRotationWheel() {
    if (!this.rotationWheelRef?.nativeElement) {
      return;
    }

    const wheelElement = this.rotationWheelRef.nativeElement;
    const wheelSize = 200;
    const wheelRadius = wheelSize / 2 - 10;

    // Define exact center coordinates - use these consistently everywhere
    const centerX = wheelSize / 2;
    const centerY = wheelSize / 2;

    // Create SVG for the rotation wheel
    const wheelSvg = d3
      .select(wheelElement)
      .append('svg')
      .attr('width', wheelSize)
      .attr('height', wheelSize);

    // Create background circle using exact center coordinates
    wheelSvg
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', wheelRadius)
      .attr('fill', 'none')
      .attr('stroke', this.isDarkMode ? '#666' : '#ddd')
      .attr('stroke-width', 2);

    // Create minor degree marks (every 15 degrees)
    for (let degree = 0; degree < 360; degree += 15) {
      const radian = ((degree - 90) * Math.PI) / 180;
      const isMajor = degree % 45 === 0;
      const tickLength = isMajor ? 12 : 6;
      const strokeWidth = isMajor ? 2 : 1;

      const x1 = centerX + Math.cos(radian) * (wheelRadius - tickLength);
      const y1 = centerY + Math.sin(radian) * (wheelRadius - tickLength);
      const x2 = centerX + Math.cos(radian) * wheelRadius;
      const y2 = centerY + Math.sin(radian) * wheelRadius;

      wheelSvg
        .append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', this.isDarkMode ? '#888' : '#666')
        .attr('stroke-width', strokeWidth);
    }

    // Create major degree labels and cardinal directions
    const majorLabels = [
      { degree: 0, label: 'N' },
      { degree: 45, label: '45°' },
      { degree: 90, label: 'E' },
      { degree: 135, label: '135°' },
      { degree: 180, label: 'S' },
      { degree: 225, label: '225°' },
      { degree: 270, label: 'W' },
      { degree: 315, label: '315°' },
    ];

    majorLabels.forEach(({ degree, label }) => {
      const radian = ((degree - 90) * Math.PI) / 180;
      const labelRadius = wheelRadius - 20;
      const x = centerX + Math.cos(radian) * labelRadius;
      const y = centerY + Math.sin(radian) * labelRadius;

      wheelSvg
        .append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', this.isDarkMode ? '#ccc' : '#333')
        .text(label);
    });

    // Create ornate 8-pointed compass star in center
    const mainRadius = 22; // Large points for cardinal directions
    const smallRadius = 12; // Smaller points for intermediate directions
    const centerRadius = 8; // Inner connection point

    const starPoints: string[] = [];

    // Create 8 points with ornate design (alternating large/small with inner connections)
    for (let i = 0; i < 16; i++) {
      const angle = (i * 22.5 * Math.PI) / 180; // 22.5 degrees between each point/connection
      let radius: number;

      if (i % 4 === 0) {
        // Cardinal directions (N, E, S, W) - large points at 0°, 90°, 180°, 270°
        radius = mainRadius;
      } else if (i % 4 === 2) {
        // Intermediate directions (NE, SE, SW, NW) - smaller points at 45°, 135°, 225°, 315°
        radius = smallRadius;
      } else {
        // Inner connection points between star points
        radius = centerRadius;
      }

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (i === 0) {
        starPoints.push(`M${x},${y}`);
      } else {
        starPoints.push(`L${x},${y}`);
      }
    }
    starPoints.push('Z'); // Close the path

    const starPath = starPoints.join(' ');

    // Draw the ornate compass star
    wheelSvg
      .append('path')
      .attr('d', starPath)
      .attr('fill', this.isDarkMode ? '#64b5f6' : '#2196f3')
      .attr('stroke', this.isDarkMode ? '#90caf9' : '#1976d2')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.85)
      .attr('stroke-linejoin', 'round');

    // Add a small center circle for extra ornate detail
    wheelSvg
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 3)
      .attr('fill', this.isDarkMode ? '#90caf9' : '#1976d2')
      .attr('stroke', this.isDarkMode ? '#ffffff' : '#ffffff')
      .attr('stroke-width', 1);

    // Create indicator (bigger for better visibility)
    const indicator = wheelSvg
      .append('circle')
      .attr('class', 'rotation-wheel-indicator')
      .attr('r', 6)
      .attr('fill', this.colorsService.getSelectedNodeStyle().nodeColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('cursor', 'pointer');

    // Store wheel indicator and parameters for reset functionality
    this.wheelIndicator = indicator;
    this.wheelCenterX = centerX;
    this.wheelCenterY = centerY;
    this.wheelRadius = wheelRadius;

    // Update indicator position using exact center coordinates
    this.updateWheelIndicator(indicator, centerX, centerY, wheelRadius);

    // Add drag behavior
    const drag = d3.drag<SVGCircleElement, unknown>().on('drag', (event) => {
      const dx = event.x - centerX;
      const dy = event.y - centerY;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      angle = (angle + 90) % 360;
      if (angle < 0) angle += 360;

      this.rotationAngle = Math.round(angle);
      this.currentRotation = (this.rotationAngle * Math.PI) / 180;
      this.updateWheelIndicator(indicator, centerX, centerY, wheelRadius);

      // Also update the SVG rotation control indicator
      this.updateRotationControlIndicator();

      this.applyTransform();
    });

    indicator.call(drag as any);
  }

  private updateWheelIndicator(
    indicator: any,
    centerX: number,
    centerY: number,
    wheelRadius: number,
  ) {
    if (!indicator) return;

    // Position indicator slightly inside the circle outline to account for indicator's own radius
    const indicatorRadius = 4; // This matches the indicator's r="4" attribute
    const indicatorPositionRadius = wheelRadius - indicatorRadius - 1; // 1px buffer for stroke

    const currentRadian = ((this.rotationAngle - 90) * Math.PI) / 180;
    const indicatorX =
      centerX + Math.cos(currentRadian) * indicatorPositionRadius;
    const indicatorY =
      centerY + Math.sin(currentRadian) * indicatorPositionRadius;

    indicator.attr('cx', indicatorX).attr('cy', indicatorY);
  }

  private updateRotationControlIndicator() {
    if (!this.degreeGroup) return;

    const controlSize = 240;
    const controlX = this.width - controlSize - 20;
    const controlY = 120; // Below the existing controls
    const radius = controlSize / 2 - 30;
    const centerX = controlX + controlSize / 2;
    const centerY = controlY + controlSize / 2;

    // Update indicator position
    const currentRadian = ((this.rotationAngle - 90) * Math.PI) / 180;
    const indicatorX = centerX + Math.cos(currentRadian) * (radius - 2);
    const indicatorY = centerY + Math.sin(currentRadian) * (radius - 2);

    this.degreeGroup
      .select('.rotation-indicator')
      .attr('cx', indicatorX)
      .attr('cy', indicatorY);
  }

  // ===== TEAM MANAGEMENT METHODS =====

  // Organization selection methods
  public onOrganizationChangeEvent(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.onOrganizationChange(target.value);
  }

  public onOrganizationChange(orgId: string): void {
    console.log('⚠️ onOrganizationChange called with:', orgId, typeof orgId);
    console.log('⚠️ Current state before change:', {
      org: this.currentSelectedTenantId,
      team: this.currentSelectedTeamId,
      teamGroup: this.currentSelectedTeamGroupId,
    });

    if (orgId !== '' && orgId !== 'null' && orgId !== 'undefined') {
      const orgIdNum = parseInt(orgId);
      console.log('⚠️ Dispatching SetSelectedTenant:', orgIdNum);
      this.store.dispatch(new SetSelectedTenant(orgIdNum));
    } else {
      console.log('⚠️ Dispatching SetSelectedTenant: null');
      this.store.dispatch(new SetSelectedTenant(null));
    }
    // Note: SetSelectedTenant action already clears team and team group selections
    this.selectedPlayerIds = [];
  }

  public onTenancyOrganizationSelected(orgId: number): void {
    console.log('🏢 Tenancy organization selected:', orgId);

    // Get the selected tenant and logged-in user
    const selectedTenant = this.organizations.find(
      (org) => org.TenantID === orgId,
    );
    if (!selectedTenant) {
      console.error('Selected tenant not found');
      return;
    }

    this.store
      .select((state) => state.globalContext?.loggedInUser)
      .pipe(take(1))
      .subscribe((loggedInUser) => {
        if (!loggedInUser) {
          console.error('No logged-in user found');
          return;
        }

        // NEW LOGIC: Determine if player selection drawer should be shown
        // Condition 1: User only has role 4 (Related Member/Parent) for current tenant
        const userHasOnlyParentRole = selectedTenant.Roles?.every(
          (role) => role.RoleID === 4,
        );

        // Condition 2: Multiple relatives with at least one non-parent role (not role 4)
        const eligibleRelatives =
          FilterNonParentRelativesDirective.filterNonParentRelatives(
            selectedTenant.Relatives || [],
            selectedTenant,
          );
        const hasMultipleEligibleRelatives = eligibleRelatives.length > 1;

        console.log('Player Selection Check:', {
          userHasOnlyParentRole,
          eligibleRelativesCount: eligibleRelatives.length,
          hasMultipleEligibleRelatives,
        });

        // Show player selection drawer if either condition is met
        if (userHasOnlyParentRole || hasMultipleEligibleRelatives) {
          console.log('Opening player selection drawer');

          // Determine if user can select themselves
          const userHasNonParentRole = selectedTenant.Roles?.some(
            (role) => role.RoleID !== 4,
          );

          // Store tenant and show player selection drawer
          this.pendingTenantForPlayerSelection = selectedTenant;
          this.availableContextUsers = eligibleRelatives;
          this.canSelectSelfAsContext = userHasNonParentRole;
          this.closeTenantDrawer();
          this.togglePlayerSelectionDrawer();
        } else {
          // No player selection needed, use logged-in user as context
          console.log('No player selection needed, using logged-in user');
          this.finalizeContextSelection(selectedTenant, loggedInUser);
        }
      });
  }

  public onPlayerSelected(user: User): void {
    console.log('👤 Context user selected:', user);

    // Determine which tenant to use:
    // 1. If pendingTenantForPlayerSelection exists, use it (tenant selection flow)
    // 2. Otherwise, use the currently selected tenant (manual drawer open)
    const tenantToUse =
      this.pendingTenantForPlayerSelection || this.selectedTenant;

    if (!tenantToUse) {
      console.error('No tenant available for player selection');
      return;
    }

    this.finalizeContextSelection(tenantToUse, user);
    this.pendingTenantForPlayerSelection = null;
    this.closePlayerSelectionDrawer();
  }

  private finalizeContextSelection(tenant: ITenant, contextUser: User): void {
    // Dispatch actions to set the context
    this.store.dispatch(new SetSelectedContextTenant(tenant));
    this.store.dispatch(new SetSelectedContextUser(contextUser));

    // Save the last selected context
    this.store.dispatch(
      new SaveLastSelectedContext(tenant.TenantID, contextUser.UserId),
    );

    // Clear team and team group selections as they may not be valid for the new organization
    this.selectedPlayerIds = [];

    console.log('Global context initialized:', {
      tenant: tenant.TenantName,
      contextUser: `${contextUser.FirstName} ${contextUser.LastName}`,
    });
  }

  // Get teams for the currently selected organization
  public getTeamsForSelectedOrganization(): ITeam[] {
    if (this.currentSelectedTenantId === null) {
      return [];
    }

    const selectedOrg = this.organizations.find(
      (org) => org.TenantID === this.currentSelectedTenantId,
    );
    if (!selectedOrg) {
      return [];
    }

    return selectedOrg.Teams;
  }

  // Team selection methods
  public onTeamChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const teamIdStr = target.value;
    console.log('Team changed to:', teamIdStr, typeof teamIdStr);

    if (teamIdStr !== '' && teamIdStr !== 'null' && teamIdStr !== 'undefined') {
      const teamId = parseInt(teamIdStr);
      console.log('Dispatching SetSelectedTeam:', teamId);
      this.store.dispatch(new SetSelectedTeam(teamId));
    } else {
      console.log('Dispatching SetSelectedTeam: null');
      this.store.dispatch(new SetSelectedTeam(null));
    }

    // Reset team group selection when team changes
    this.store.dispatch(new SetSelectedTeamGroup(null));
    this.selectedPlayerIds = [];
  }

  public onTeamGroupChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const teamGroupIdStr = target.value;
    console.log('TeamGroup changed to:', teamGroupIdStr, typeof teamGroupIdStr);

    if (
      teamGroupIdStr !== '' &&
      teamGroupIdStr !== 'null' &&
      teamGroupIdStr !== 'undefined'
    ) {
      const teamGroupId = parseInt(teamGroupIdStr);
      console.log('Dispatching SetSelectedTeamGroup:', teamGroupId);
      this.store.dispatch(new SetSelectedTeamGroup(teamGroupId));
    } else {
      console.log('Dispatching SetSelectedTeamGroup: null');
      this.store.dispatch(new SetSelectedTeamGroup(null));
    }

    // Reset player selection when team group changes
    this.selectedPlayerIds = [];
  }

  /**
   * Handle toolbar visibility when team group selection changes
   */
  private handleTeamGroupToolbarVisibility(teamGroupId: number | null): void {
    console.log('🏁 Managing toolbar visibility for team group:', teamGroupId);

    // Only manage toolbar visibility if no operation mode is active
    if (!this.operationModeService.isAnyModeActive()) {
      if (teamGroupId !== null) {
        // Team group selected - show team group related toolbars
        console.log('🏁 Team group selected - showing team group toolbars');

        // Show team group members toolbar
        this.store.dispatch(
          new SetToolbarVisibility('teamGroupMembers' as any, true),
        );

        // Hide team roster toolbar since we're focusing on team group members
        this.store.dispatch(
          new SetToolbarVisibility('teamRoster' as any, false),
        );
      } else {
        // No team group selected - hide team group specific toolbars
        console.log('🏁 No team group selected - hiding team group toolbars');

        // Hide team group members toolbar
        this.store.dispatch(
          new SetToolbarVisibility('teamGroupMembers' as any, false),
        );

        // Show team roster toolbar if a team is selected
        if (this.currentSelectedTeamId) {
          this.store.dispatch(
            new SetToolbarVisibility('teamRoster' as any, true),
          );
        }
      }
    }
  }

  /**
   * Handle toolbar visibility when team selection changes
   */
  private handleTeamToolbarVisibility(
    teamId: number | null,
    previousTeamId: number | null,
  ): void {
    console.log(
      '👨‍👩‍👧‍👦 Managing toolbar visibility for team:',
      teamId,
      'previous:',
      previousTeamId,
    );

    // Only manage toolbar visibility if no operation mode is active
    if (!this.operationModeService.isAnyModeActive()) {
      if (teamId !== null) {
        // Team selected - show team roster toolbar
        console.log('👨‍👩‍👧‍👦 Team selected - showing team roster toolbar');

        // Show team roster toolbar
        this.store.dispatch(
          new SetToolbarVisibility('teamRoster' as any, true),
        );

        // If no team group is currently selected, hide team group members toolbar
        if (!this.currentSelectedTeamGroupId) {
          this.store.dispatch(
            new SetToolbarVisibility('teamGroupMembers' as any, false),
          );
        }
      } else {
        // No team selected - hide team-related toolbars
        console.log('👨‍👩‍👧‍👦 No team selected - hiding team-related toolbars');

        // Hide both team roster and team group members toolbars
        this.store.dispatch(
          new SetToolbarVisibility('teamRoster' as any, false),
        );
        this.store.dispatch(
          new SetToolbarVisibility('teamGroupMembers' as any, false),
        );
      }
    }
  }

  // Get players for display based on selection
  public getSelectedTeamPlayers(): Player[] {
    if (!this.selectedTeam) {
      return [];
    }
    return this.sortPlayers(this.filterPlayers(this.selectedTeam.Players));
  }

  public getSelectedTeamGroupPlayers(): Player[] {
    if (!this.selectedTeamGroup) {
      return [];
    }
    return this.sortPlayers(this.selectedTeamGroup.Players);
  }

  // Sort players based on current sort criteria
  private sortPlayers(players: Player[]): Player[] {
    return [...players].sort((a, b) => {
      switch (this.playerSortBy) {
        case 'jerseyNumber':
          return a.JerseyNumber - b.JerseyNumber;
        case 'lastName':
          return a.LastName.localeCompare(b.LastName);
        case 'position':
          // Custom position order: GK first, then others alphabetically
          if (a.PositionAbbrev === 'GK' && b.PositionAbbrev !== 'GK') return -1;
          if (b.PositionAbbrev === 'GK' && a.PositionAbbrev !== 'GK') return 1;
          return a.PositionAbbrev.localeCompare(b.PositionAbbrev);
        default:
          return 0;
      }
    });
  }

  // Filter players based on current filter criteria
  private filterPlayers(players: Player[]): Player[] {
    if (this.playerFilterBy === 'all') {
      return players;
    }

    return players.filter((player) => {
      switch (this.playerFilterBy) {
        case 'attackers':
          return this.attackerPositions.includes(player.PositionAbbrev);
        case 'defenders':
          return this.defenderPositions.includes(player.PositionAbbrev);
        default:
          return true;
      }
    });
  }

  // Handle sort option change
  public onPlayerSortChange(event: any): void {
    this.playerSortBy = event.target.value as
      | 'position'
      | 'lastName'
      | 'jerseyNumber';
  }

  // Handle filter option change
  public onPlayerFilterChange(event: any): void {
    this.playerFilterBy = event.target.value as
      | 'all'
      | 'attackers'
      | 'defenders';
  }

  // Player selection methods
  public onPlayerCheckboxChange(playerId: number, isChecked: boolean): void {
    if (isChecked) {
      if (!this.selectedPlayerIds.includes(playerId)) {
        this.selectedPlayerIds.push(playerId);
      }
    } else {
      this.selectedPlayerIds = this.selectedPlayerIds.filter(
        (id) => id !== playerId,
      );
    }
  }

  public isPlayerSelected(playerId: number): boolean {
    return this.selectedPlayerIds.includes(playerId);
  }

  // Select all visible (filtered) players
  public selectAllVisiblePlayers(): void {
    const visiblePlayers = this.getSelectedTeamPlayers();
    visiblePlayers.forEach((player) => {
      if (!this.selectedPlayerIds.includes(player.PlayerID)) {
        this.selectedPlayerIds.push(player.PlayerID);
      }
    });
  }

  // Deselect all visible (filtered) players
  public deselectAllVisiblePlayers(): void {
    const visiblePlayerIds = this.getSelectedTeamPlayers().map(
      (p) => p.PlayerID,
    );
    this.selectedPlayerIds = this.selectedPlayerIds.filter(
      (id) => !visiblePlayerIds.includes(id),
    );
  }

  // Check if all visible players are selected
  public get areAllVisiblePlayersSelected(): boolean {
    const visiblePlayers = this.getSelectedTeamPlayers();
    if (visiblePlayers.length === 0) return false;
    return visiblePlayers.every((player) =>
      this.selectedPlayerIds.includes(player.PlayerID),
    );
  }

  // Check if some (but not all) visible players are selected
  public get areSomeVisiblePlayersSelected(): boolean {
    const visiblePlayers = this.getSelectedTeamPlayers();
    if (visiblePlayers.length === 0) return false;
    const selectedVisibleCount = visiblePlayers.filter((player) =>
      this.selectedPlayerIds.includes(player.PlayerID),
    ).length;
    return (
      selectedVisibleCount > 0 && selectedVisibleCount < visiblePlayers.length
    );
  }

  public getPlayerFullName(player: Player): string {
    return `#${player.JerseyNumber} ${player.FirstName} ${player.LastName} (${player.PositionAbbrev})`;
  }

  public getAvailableTeamGroups(): ITeamGroup[] {
    if (!this.selectedTeam) {
      return [];
    }
    return this.selectedTeam.TeamGroups;
  }

  // Utility methods for trackBy
  public trackByTeamId(index: number, team: ITeam): number {
    return team.TeamID;
  }

  public trackByPlayerId(index: number, player: Player): number {
    return player.PlayerID;
  }

  public trackByTeamGroupId(
    index: number,
    group: ITeamGroup | IDefaultTeamGroup,
  ): number {
    return group.TeamGroupID;
  }

  // Team group dialog methods
  public closeEditTeamGroupDialog(): void {
    this.showEditTeamGroupDialog = false;
    this.editingTeamGroup = null;
    this.tempSelectedPlayerIds = [];
  }

  public isTempPlayerSelected(playerId: number): boolean {
    return this.tempSelectedPlayerIds.includes(playerId);
  }

  public onTempPlayerCheckboxChange(
    event: { playerId: number; checked: boolean } | number,
    isChecked?: boolean,
  ): void {
    let playerId: number;
    let checked: boolean;

    // Handle both old and new event signatures for backward compatibility
    if (typeof event === 'object') {
      playerId = event.playerId;
      checked = event.checked;
    } else {
      playerId = event;
      checked = isChecked!;
    }

    if (checked) {
      if (!this.tempSelectedPlayerIds.includes(playerId)) {
        this.tempSelectedPlayerIds.push(playerId);
      }
    } else {
      this.tempSelectedPlayerIds = this.tempSelectedPlayerIds.filter(
        (id) => id !== playerId,
      );
    }
  }

  public saveTeamGroupChanges(): void {
    if (!this.editingTeamGroup || !this.selectedTeam) {
      console.error(
        'Cannot save: no team group being edited or no team selected',
      );
      return;
    }

    console.log('Saving team group changes...');
    console.log(
      'Original players:',
      this.editingTeamGroup.Players.map((p) => p.PlayerID),
    );
    console.log('New player selection:', this.tempSelectedPlayerIds);

    // Get all players from the selected team
    const allTeamPlayers = this.selectedTeam.Players;

    // Filter to get only the selected players
    const selectedPlayers = allTeamPlayers.filter((player) =>
      this.tempSelectedPlayerIds.includes(player.PlayerID),
    );

    console.log(
      'Selected players for team group:',
      selectedPlayers.map(
        (p) => `${p.FirstName} ${p.LastName} (${p.PlayerID})`,
      ),
    );

    // Find the team in organizations array and update it there (not in state directly)
    const tenant = this.organizations.find(
      (org) => org.TenantID === this.selectedTeam!.TenantID,
    );

    if (tenant) {
      const team = tenant.Teams.find(
        (t) => t.TeamID === this.selectedTeam!.TeamID,
      );

      if (team && team.TeamGroups) {
        const teamGroupIndex = team.TeamGroups.findIndex(
          (tg) => tg.TeamGroupID === this.editingTeamGroup!.TeamGroupID,
        );

        if (teamGroupIndex !== -1) {
          // Create a new array with the updated team group
          const updatedTeamGroups = [...team.TeamGroups];
          updatedTeamGroups[teamGroupIndex] = {
            ...this.editingTeamGroup,
            Players: selectedPlayers,
          };

          // Create a completely new team object to avoid mutating read-only properties
          const updatedTeam: ITeam = {
            ...team,
            TeamGroups: updatedTeamGroups,
          };

          // Get the updated team group to restore selection
          const updatedTeamGroup = updatedTeamGroups[teamGroupIndex];

          // Update the state with the modified team
          this.store.dispatch(new SetSelectedContextTeam(updatedTeam));

          // Restore the team group selection (SetSelectedContextTeam clears it)
          this.store.dispatch(
            new SetSelectedContextTeamGroup(updatedTeamGroup),
          );

          console.log('Team group updated successfully in team data');

          // Force change detection to update the UI
          this.cdr.detectChanges();

          console.log(
            'Team group "' +
              this.editingTeamGroup.TeamGroupName +
              '" updated with ' +
              selectedPlayers.length +
              ' players',
          );
        } else {
          console.error('Team group not found in team data');
        }
      }
    }

    // Close the dialog
    this.closeEditTeamGroupDialog();
  }

  // Helper methods to generate new IDs
  private generateNewTeamId(): number {
    const allTeamIds = this.organizations.flatMap((org) =>
      org.Teams.map((team) => team.TeamID),
    );
    return allTeamIds.length > 0 ? Math.max(...allTeamIds) + 1 : 1;
  }

  private generateNewTeamGroupId(): number {
    const allTeamGroupIds = this.organizations.flatMap((org) =>
      org.Teams.flatMap((team) =>
        team.TeamGroups.map((group) => group.TeamGroupID),
      ),
    );
    return allTeamGroupIds.length > 0 ? Math.max(...allTeamGroupIds) + 1 : 1;
  }

  private generateSignupCode(): string {
    // Generate a unique 8-character alphanumeric signup code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Ensure uniqueness by checking against existing signup codes
    const existingCodes = this.organizations.flatMap((org) =>
      org.Teams.map((team) => team.SignupCode),
    );

    if (existingCodes.includes(result)) {
      return this.generateSignupCode(); // Recursively generate if collision
    }

    return result;
  }

  // Create Team functionality
  public onCreateTeam(): void {
    console.log(
      'Opening create team dialog. Selected organization:',
      this.currentSelectedTenantId,
    );

    // Ensure we use the currently selected organization from the teams panel
    let selectedOrgId = this.currentSelectedTenantId;

    // Fallback: get the value directly from the organization dropdown if needed
    if (!selectedOrgId) {
      const orgSelect = document.getElementById(
        'organization-select',
      ) as HTMLSelectElement;
      if (orgSelect && orgSelect.value) {
        selectedOrgId = parseInt(orgSelect.value);
        console.log(
          'Using organization from dropdown fallback:',
          selectedOrgId,
        );
      }
    }

    console.log('Setting selectedTenantIdForNewTeam to:', selectedOrgId);

    this.newTeamName = '';
    this.newTeamGenderId = null;
    this.newTeamAgeGroupId = null;
    this.newTeamLevel = null;
    this.selectedTenantIdForNewTeam = selectedOrgId;
    this.selectedDefaultTeamGroupsForNewTeam.clear();
    this.showCreateTeamDialog = true;

    // Force change detection to ensure the dropdown is updated
    this.cdr.detectChanges();

    // Additional update to ensure binding works after dialog renders
    setTimeout(() => {
      console.log(
        'Type check - selectedOrgId:',
        typeof selectedOrgId,
        'value:',
        selectedOrgId,
      );
      console.log(
        'Type check - selectedTenantIdForNewTeam:',
        typeof this.selectedTenantIdForNewTeam,
        'value:',
        this.selectedTenantIdForNewTeam,
      );

      if (selectedOrgId && this.selectedTenantIdForNewTeam !== selectedOrgId) {
        console.log('Re-setting organization ID after dialog render');
        this.selectedTenantIdForNewTeam = selectedOrgId;
        this.cdr.detectChanges();
      }

      // Additional force update with explicit type conversion
      if (selectedOrgId && typeof selectedOrgId === 'number') {
        console.log('Force setting with explicit number type');
        this.selectedTenantIdForNewTeam = selectedOrgId;
        this.cdr.detectChanges();
      }

      console.log(
        'After dialog open - selectedTenantIdForNewTeam:',
        this.selectedTenantIdForNewTeam,
      );
      console.log(
        'Available organizations:',
        this.organizations.map((org) => ({
          id: org.TenantID,
          name: org.TenantName,
          type: typeof org.TenantID,
        })),
      );
    }, 100);
  }

  public onCreateTeamOrgChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const orgId = target.value;
    console.log('Create team org changed to:', orgId, 'Type:', typeof orgId);
    // Ensure we store it as a number
    this.selectedTenantIdForNewTeam =
      orgId && orgId !== 'null' ? parseInt(orgId) : null;
    console.log(
      'Converted to:',
      this.selectedTenantIdForNewTeam,
      'Type:',
      typeof this.selectedTenantIdForNewTeam,
    );
  }

  public getAvailableDefaultTeamGroups(): IDefaultTeamGroup[] {
    const orgId = this.selectedTenantIdForNewTeam;
    if (!orgId) {
      // Return only system-level groups if no organization selected
      return this.defaultTeamGroups.filter(
        (group) =>
          group.OwnershipContext.Context === 'TENANT' &&
          group.OwnershipContext.ContextKey === -1,
      );
    }

    return this.defaultTeamGroups.filter((group) => {
      // Include system-level groups (available to all) - TENANT with Context -1
      if (
        group.OwnershipContext.Context === 'TENANT' &&
        group.OwnershipContext.ContextKey === -1
      ) {
        return true;
      }
      // Include organization-level groups for the selected org
      if (
        group.OwnershipContext.Context === 'TENANT' &&
        group.OwnershipContext.ContextKey === orgId
      ) {
        return true;
      }
      return false;
    });
  }

  public toggleDefaultTeamGroupSelection(groupId: number): void {
    if (this.selectedDefaultTeamGroupsForNewTeam.has(groupId)) {
      this.selectedDefaultTeamGroupsForNewTeam.delete(groupId);
    } else {
      this.selectedDefaultTeamGroupsForNewTeam.add(groupId);
    }
  }

  public isDefaultTeamGroupSelected(groupId: number): boolean {
    return this.selectedDefaultTeamGroupsForNewTeam.has(groupId);
  }

  public areAllDefaultTeamGroupsSelected(): boolean {
    const availableGroups = this.getAvailableDefaultTeamGroups();
    return (
      availableGroups.length > 0 &&
      availableGroups.every((group) =>
        this.selectedDefaultTeamGroupsForNewTeam.has(group.TeamGroupID),
      )
    );
  }

  public toggleSelectAllDefaultTeamGroups(): void {
    const availableGroups = this.getAvailableDefaultTeamGroups();
    const allSelected = this.areAllDefaultTeamGroupsSelected();

    if (allSelected) {
      // Deselect all
      availableGroups.forEach((group) => {
        this.selectedDefaultTeamGroupsForNewTeam.delete(group.TeamGroupID);
      });
    } else {
      // Select all
      availableGroups.forEach((group) => {
        this.selectedDefaultTeamGroupsForNewTeam.add(group.TeamGroupID);
      });
    }
  }

  public copyDefaultTeamGroupsToTeam(team: ITeam): void {
    const selectedGroups = this.defaultTeamGroups.filter((group) =>
      this.selectedDefaultTeamGroupsForNewTeam.has(group.TeamGroupID),
    );

    for (const defaultGroup of selectedGroups) {
      const newTeamGroup: ITeamGroup = {
        TeamGroupID: this.generateNewTeamGroupId(),
        OwnershipContext: {
          Context: 'TEAM',
          ContextKey: team.TeamID,
        },
        TeamGroupName: defaultGroup.TeamGroupName,
        Players: [], // Will add context user below
        MatchingPositions: [...defaultGroup.MatchingPositions],
        MatchingPositionNumbers: [...defaultGroup.MatchingPositionNumbers],
      };

      // Add the context user to the team group if they exist
      if (this.selectedContextUser) {
        const contextUserPlayer = team.Players.find(
          (p) => p.UserId === this.selectedContextUser!.UserId,
        );
        if (contextUserPlayer) {
          newTeamGroup.Players.push(contextUserPlayer);
        }
      }

      team.TeamGroups.push(newTeamGroup);
    }

    console.log(
      `Copied ${selectedGroups.length} default team groups to team ${team.TeamName}`,
    );
  }

  public closeCreateTeamDialog(): void {
    this.showCreateTeamDialog = false;
    this.newTeamName = '';
    this.newTeamGenderId = null;
    this.newTeamAgeGroupId = null;
    this.newTeamLevel = null;
    this.selectedTenantIdForNewTeam = null;
    this.selectedDefaultTeamGroupsForNewTeam.clear();
    this.newTeamPlayers = [];
    this.clearPlayerForm();
    this.isCreatingTeam = false;
  }

  // Player management methods for new team creation
  public addPlayerToNewTeam(): void {
    if (
      !this.newPlayerFirstName ||
      !this.newPlayerLastName ||
      !this.newPlayerPosition ||
      !this.newPlayerJerseyNumber
    ) {
      return;
    }

    // Check if jersey number is already taken
    const jerseyExists = this.newTeamPlayers.some(
      (player) => player.JerseyNumber === this.newPlayerJerseyNumber,
    );
    if (jerseyExists) {
      alert(
        `Jersey number ${this.newPlayerJerseyNumber} is already taken. Please choose a different number.`,
      );
      return;
    }

    const newPlayer: Player = {
      PlayerID: this.generateNewPlayerId(),
      UserId: 0, // No associated user account by default
      FirstName: this.newPlayerFirstName.trim(),
      LastName: this.newPlayerLastName.trim(),
      TeamID: 0, // Will be set when team is created
      PositionName: this.getPositionName(this.newPlayerPosition),
      PositionAbbrev: this.newPlayerPosition,
      JerseyNumber: this.newPlayerJerseyNumber,
      GenderID: 1, // Default mixed
      GenderName: 'Mixed',
      GenderAbbrev: 'M',
      AgeGroupID: 1, // Default open
      AgeGroupName: 'Open',
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
    };

    this.newTeamPlayers.push(newPlayer);
    this.clearPlayerForm();
  }

  public removePlayerFromNewTeam(index: number): void {
    if (index >= 0 && index < this.newTeamPlayers.length) {
      this.newTeamPlayers.splice(index, 1);
    }
  }

  private clearPlayerForm(): void {
    this.newPlayerFirstName = '';
    this.newPlayerLastName = '';
    this.newPlayerPosition = '';
    this.newPlayerJerseyNumber = null;
  }

  private generateNewPlayerId(): number {
    const allPlayerIds = this.organizations.flatMap((org) =>
      org.Teams.flatMap((team) =>
        team.Players.map((player) => player.PlayerID),
      ),
    );
    const newTeamPlayerIds = this.newTeamPlayers.map(
      (player) => player.PlayerID,
    );
    const allIds = [...allPlayerIds, ...newTeamPlayerIds];
    return allIds.length > 0 ? Math.max(...allIds) + 1 : 1;
  }

  private getPositionName(abbreviation: string): string {
    const positionMap: Record<string, string> = {
      GK: 'Goalkeeper',
      CB: 'Center Back',
      LB: 'Left Back',
      RB: 'Right Back',
      CDM: 'Defensive Midfielder',
      CM: 'Central Midfielder',
      CAM: 'Attacking Midfielder',
      LM: 'Left Midfielder',
      RM: 'Right Midfielder',
      LW: 'Left Winger',
      RW: 'Right Winger',
      CF: 'Center Forward',
      ST: 'Striker',
    };
    return positionMap[abbreviation] || abbreviation;
  }

  public saveNewTeam(): void {
    // Prevent double submission
    if (this.isCreatingTeam) {
      return;
    }

    if (
      !this.newTeamName.trim() ||
      !this.selectedTenantIdForNewTeam ||
      this.newTeamGenderId === null ||
      this.newTeamAgeGroupId === null ||
      this.newTeamLevel === null
    ) {
      console.error('Cannot create team: missing required fields');
      alert(
        'Please enter a team name and select organization, gender, age group, and level.',
      );
      return;
    }

    this.isCreatingTeam = true;

    try {
      // Find the selected organization
      const selectedOrg = this.organizations.find(
        (org) => org.TenantID === this.selectedTenantIdForNewTeam,
      );

      if (!selectedOrg) {
        console.error('Selected organization not found');
        alert('Selected organization not found. Please try again.');
        this.isCreatingTeam = false;
        return;
      }

      // Check if team name already exists in this organization
      const existingTeam = selectedOrg.Teams.find(
        (team) =>
          team.TeamName.toLowerCase() === this.newTeamName.trim().toLowerCase(),
      );

      if (existingTeam) {
        alert(
          `A team named "${this.newTeamName.trim()}" already exists in this organization.`,
        );
        this.isCreatingTeam = false;
        return;
      }

      // Get gender and age group details
      const gender = this.mockGenderService.getGenderById(
        this.newTeamGenderId!,
      );
      const ageGroup = this.mockAgeGroupService.getAgeGroupById(
        this.newTeamAgeGroupId!,
      );

      if (!gender || !ageGroup) {
        alert('Invalid gender or age group selection.');
        this.isCreatingTeam = false;
        return;
      }

      // Create new team
      const newTeam: ITeam = {
        TeamID: this.generateNewTeamId(),
        TenantID: this.selectedTenantIdForNewTeam,
        TeamName: this.newTeamName.trim(),
        SignupCode: this.generateSignupCode(),
        AllowSignup: true,
        RosterLimit: 18,
        GenderID: this.newTeamGenderId!,
        GenderName: gender.GenderName,
        GenderAbbrev: gender.GenderAbbrev,
        AgeGroupID: this.newTeamAgeGroupId!,
        AgeGroupName: ageGroup.AgeGroupName,
        Level: this.newTeamLevel!,
        Players: [], // Will add players below
        TeamGroups: [], // Start with no team groups
      };

      // Add players to the new team
      this.newTeamPlayers.forEach((player) => {
        player.TeamID = newTeam.TeamID;
        newTeam.Players.push({ ...player });
      });

      // Add the context user as a player to the roster if they exist
      if (this.selectedContextUser) {
        const contextUserPlayer: Player = {
          PlayerID: this.generateNewPlayerId(),
          UserId: this.selectedContextUser.UserId,
          FirstName: this.selectedContextUser.FirstName,
          LastName: this.selectedContextUser.LastName,
          TeamID: newTeam.TeamID,
          PositionName: 'Mixed',
          PositionAbbrev: 'M',
          JerseyNumber: 0, // Default jersey number
          GenderID: 1,
          GenderName: 'Mixed',
          GenderAbbrev: 'M',
          AgeGroupID: 1,
          AgeGroupName: 'Open',
          MiddleName: '',
          Address1: '',
          Address2: '',
          City: '',
          State: '',
          ZipCode: '',
          NationCode: '',
          EmailAddress: this.selectedContextUser.EmailAddress || '',
          PhoneNumber: '',
          BirthDate: undefined,
        };
        newTeam.Players.push(contextUserPlayer);
      }

      // Add team to organization
      selectedOrg.Teams.push(newTeam);

      // Copy selected default team groups to the new team
      this.copyDefaultTeamGroupsToTeam(newTeam);

      console.log(
        'Created new team:',
        newTeam.TeamName,
        'with ID:',
        newTeam.TeamID,
        'with',
        newTeam.TeamGroups.length,
        'team groups and',
        newTeam.Players.length,
        'players',
      );

      // Close dialog
      this.closeCreateTeamDialog();

      // Optionally select the new team
      this.store.dispatch(new SetSelectedTeam(newTeam.TeamID));

      // Force change detection
      (this as any).cdRef?.detectChanges?.();
    } catch (error) {
      console.error('Error creating team:', error);
      alert('An error occurred while creating the team. Please try again.');
      this.isCreatingTeam = false;
    }
  }

  // Delete Team functionality
  public onDeleteTeam(): void {
    if (!this.selectedTeam) {
      console.error('No team selected for deletion');
      return;
    }

    // Set the team to delete and show confirmation dialog
    this.teamToDelete = this.selectedTeam;
    this.showDeleteTeamDialog = true;
  }

  public closeDeleteTeamDialog(): void {
    this.showDeleteTeamDialog = false;
    this.teamToDelete = null;
  }

  public confirmDeleteTeam(): void {
    if (!this.teamToDelete) {
      console.error('No team to delete');
      return;
    }

    try {
      // Find the organization containing this team
      const organization = this.organizations.find((org) =>
        org.Teams.some((team) => team.TeamID === this.teamToDelete!.TeamID),
      );

      if (!organization) {
        console.error(
          'Organization not found for team:',
          this.teamToDelete.TeamName,
        );
        alert('Error: Could not find the organization for this team.');
        return;
      }

      // Remove the team from the organization
      const teamIndex = organization.Teams.findIndex(
        (team) => team.TeamID === this.teamToDelete!.TeamID,
      );
      if (teamIndex !== -1) {
        const teamName = this.teamToDelete.TeamName;
        const teamGroupCount = this.teamToDelete.TeamGroups.length;
        const playerCount = this.teamToDelete.Players.length;

        organization.Teams.splice(teamIndex, 1);

        console.log(
          `Deleted team "${teamName}" (ID: ${this.teamToDelete.TeamID}) ` +
            `with ${teamGroupCount} team groups and ${playerCount} players`,
        );

        // Clear the selection since the team no longer exists
        this.store.dispatch(new SetSelectedTeam(null));
        this.store.dispatch(new SetSelectedTeamGroup(null));

        // Close the dialog
        this.closeDeleteTeamDialog();

        // Force change detection
        (this as any).cdRef?.detectChanges?.();

        alert(`Team "${teamName}" has been successfully deleted.`);
      } else {
        console.error('Team not found in organization teams list');
        alert('Error: Team not found in organization.');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('An error occurred while deleting the team. Please try again.');
    }
  }

  // Edit Team functionality
  public onEditTeam(): void {
    if (!this.selectedTeam) {
      console.error('No team selected for editing');
      return;
    }

    console.log('Opening edit team dialog for team:', this.selectedTeam);

    // Initialize the edit form with current team data
    this.editTeamName = this.selectedTeam.TeamName;
    this.editTeamTenantId = this.selectedTeam.TenantID;
    this.editTeamGenderId = this.selectedTeam.GenderID;
    this.editTeamAgeGroupId = this.selectedTeam.AgeGroupID;
    this.editTeamLevel = this.selectedTeam.Level;
    this.isEditingTeam = false; // Reset any editing state

    // Show the edit team dialog
    this.showEditTeamDialog = true;
  }

  public closeEditTeamDialog(): void {
    this.showEditTeamDialog = false;
    this.isEditingTeam = false;
    // Reset form fields
    this.editTeamName = '';
    this.editTeamTenantId = null;
    this.editTeamGenderId = null;
    this.editTeamAgeGroupId = null;
    this.editTeamLevel = null;
  }

  public onEditTeamNameChange(teamName: string): void {
    this.editTeamName = teamName;
  }

  public onEditTeamOrganizationChange(organizationId: number): void {
    this.editTeamTenantId = organizationId;
  }

  public onEditTeamGenderChange(genderId: number): void {
    this.editTeamGenderId = genderId;
  }

  public onEditTeamAgeGroupChange(ageGroupId: number): void {
    this.editTeamAgeGroupId = ageGroupId;
  }

  public onEditTeamLevelChange(level: number): void {
    this.editTeamLevel = level;
  }

  public saveTeamChanges(): void {
    if (!this.selectedTeam) {
      console.error('No team selected for editing');
      return;
    }

    if (
      !this.editTeamName?.trim() ||
      !this.editTeamTenantId ||
      !this.editTeamGenderId ||
      !this.editTeamAgeGroupId ||
      this.editTeamLevel === null
    ) {
      console.error('Please fill in all required fields');
      return;
    }

    console.log('Saving team changes:', {
      teamId: this.selectedTeam.TeamID,
      teamName: this.editTeamName,
      organizationId: this.editTeamTenantId,
      genderId: this.editTeamGenderId,
      ageGroupId: this.editTeamAgeGroupId,
      level: this.editTeamLevel,
    });

    // Update the team properties
    this.selectedTeam.TeamName = this.editTeamName.trim();
    this.selectedTeam.TenantID = this.editTeamTenantId;
    this.selectedTeam.GenderID = this.editTeamGenderId;
    this.selectedTeam.AgeGroupID = this.editTeamAgeGroupId;
    this.selectedTeam.Level = this.editTeamLevel!;

    // Update gender and age group names
    const selectedGender = this.getAvailableGenders().find(
      (g) => g.GenderID === this.editTeamGenderId,
    );
    const selectedAgeGroup = this.getAvailableAgeGroups().find(
      (ag) => ag.AgeGroupID === this.editTeamAgeGroupId,
    );

    if (selectedGender) {
      this.selectedTeam.GenderName = selectedGender.GenderName;
      this.selectedTeam.GenderAbbrev = selectedGender.GenderAbbrev;
    }

    if (selectedAgeGroup) {
      this.selectedTeam.AgeGroupName = selectedAgeGroup.AgeGroupName;
    }

    // Update the team in the organizations array
    const organization = this.organizations.find(
      (org) => org.TenantID === this.editTeamTenantId,
    );
    if (organization) {
      const teamIndex = organization.Teams.findIndex(
        (team) => team.TeamID === this.selectedTeam!.TeamID,
      );
      if (teamIndex !== -1) {
        organization.Teams[teamIndex] = { ...this.selectedTeam };
      }
    }

    // Close the dialog
    this.closeEditTeamDialog();

    console.log('Team changes saved successfully');
  }

  public onCreateTeamGroup(): void {
    if (!this.selectedTeam) {
      console.error('No team selected for creating team group');
      return;
    }

    console.log(
      'Opening create team group dialog for team:',
      this.selectedTeam.TeamName,
    );
    this.newTeamGroupName = '';
    this.newTeamGroupPlayerIds = [...this.selectedPlayerIds]; // Pre-select currently selected players
    this.newTeamGroupMatchingPositions = [];
    this.newTeamGroupMatchingNumbers = [];
    this.showCreateTeamGroupDialog = true;
  }

  public closeCreateTeamGroupDialog(): void {
    this.showCreateTeamGroupDialog = false;
    this.newTeamGroupName = '';
    this.newTeamGroupPlayerIds = [];
    this.newTeamGroupMatchingPositions = [];
    this.newTeamGroupMatchingNumbers = [];
  }

  public isNewTeamGroupPlayerSelected(playerId: number): boolean {
    return this.newTeamGroupPlayerIds.includes(playerId);
  }

  public onNewTeamGroupPlayerCheckboxChange(
    event: { playerId: number; checked: boolean } | number,
    isChecked?: boolean,
  ): void {
    let playerId: number;
    let checked: boolean;

    // Handle both old and new event signatures for backward compatibility
    if (typeof event === 'object') {
      playerId = event.playerId;
      checked = event.checked;
    } else {
      playerId = event;
      checked = isChecked!;
    }

    if (checked) {
      if (!this.newTeamGroupPlayerIds.includes(playerId)) {
        this.newTeamGroupPlayerIds.push(playerId);
      }
    } else {
      this.newTeamGroupPlayerIds = this.newTeamGroupPlayerIds.filter(
        (id) => id !== playerId,
      );
    }
  }

  public onNewTeamGroupMatchingPositionsChange(positions: string[]): void {
    this.newTeamGroupMatchingPositions = positions;
  }

  public onNewTeamGroupMatchingNumbersChange(numbers: number[]): void {
    this.newTeamGroupMatchingNumbers = numbers;
  }

  public saveNewTeamGroup(): void {
    if (!this.newTeamGroupName.trim() || !this.selectedTeam) {
      console.error('Cannot create team group: missing name or team');
      return;
    }

    // Check if team group name already exists in this team
    const existingGroup = this.selectedTeam.TeamGroups.find(
      (group) =>
        group.TeamGroupName.toLowerCase() ===
        this.newTeamGroupName.trim().toLowerCase(),
    );

    if (existingGroup) {
      alert(
        `A team group named "${this.newTeamGroupName.trim()}" already exists in this team.`,
      );
      return;
    }

    // Get selected players
    const selectedPlayers = this.selectedTeam.Players.filter((player) =>
      this.newTeamGroupPlayerIds.includes(player.PlayerID),
    );

    // Create new team group
    const newTeamGroup: ITeamGroup = {
      TeamGroupID: this.generateNewTeamGroupId(),
      OwnershipContext: {
        Context: 'TEAM',
        ContextKey: this.selectedTeam.TeamID,
      },
      TeamGroupName: this.newTeamGroupName.trim(),
      Players: selectedPlayers,
      MatchingPositions: [...this.newTeamGroupMatchingPositions],
      MatchingPositionNumbers: [...this.newTeamGroupMatchingNumbers],
    };

    // Add team group to team
    this.selectedTeam.TeamGroups.push(newTeamGroup);

    console.log(
      'Created new team group:',
      newTeamGroup.TeamGroupName,
      'with',
      selectedPlayers.length,
      'players',
    );

    // Close dialog
    this.closeCreateTeamGroupDialog();

    // Optionally select the new team group
    this.store.dispatch(new SetSelectedTeamGroup(newTeamGroup.TeamGroupID));

    // Clear regular player selection since they're now in a group
    this.selectedPlayerIds = [];

    // Force change detection
    (this as any).cdRef?.detectChanges?.();
  }

  public onEditTeamGroup(): void {
    if (!this.selectedTeamGroup) {
      console.error('No team group selected for editing');
      return;
    }

    console.log(
      'Opening edit dialog for team group:',
      this.selectedTeamGroup.TeamGroupName,
    );

    // Set the team group being edited
    this.editingTeamGroup = { ...this.selectedTeamGroup };

    // Initialize temp selection with current team group players
    this.tempSelectedPlayerIds = this.selectedTeamGroup.Players.map(
      (player) => player.PlayerID,
    );

    // Show the edit dialog
    this.showEditTeamGroupDialog = true;

    console.log(
      'Edit dialog opened with',
      this.tempSelectedPlayerIds.length,
      'players pre-selected',
    );
  }

  // Delete Team Group functionality
  public onDeleteTeamGroup(): void {
    if (!this.selectedTeamGroup) {
      console.error('No team group selected for deletion');
      return;
    }

    // Set the team group to delete and show confirmation dialog
    this.teamGroupToDelete = this.selectedTeamGroup;
    this.showDeleteTeamGroupDialog = true;
  }

  // Auto-Build Team Group functionality
  public onAutoBuildTeamGroup(): void {
    if (!this.selectedTeam || !this.selectedTeamGroup) {
      console.error('No team or team group selected for auto-build');
      return;
    }

    console.log(
      'Auto-building team group:',
      this.selectedTeamGroup.TeamGroupName,
    );

    // Get available players from the team (players not in any team group)
    const availablePlayers = this.selectedTeam.Players.filter((player) => {
      return !this.selectedTeam.TeamGroups.some((group) =>
        group.Players.some((p) => p.PlayerID === player.PlayerID),
      );
    });

    // Find matching players based on positions and position numbers
    const matchingPlayers = availablePlayers.filter((player) => {
      // Check position abbreviation match
      const positionMatch =
        this.selectedTeamGroup.MatchingPositions.length === 0 ||
        this.selectedTeamGroup.MatchingPositions.includes(
          player.PositionAbbrev,
        );

      // Check position number match
      const numberMatch =
        this.selectedTeamGroup.MatchingPositionNumbers.length === 0 ||
        this.selectedTeamGroup.MatchingPositionNumbers.includes(
          player.JerseyNumber,
        );

      return positionMatch || numberMatch;
    });

    if (matchingPlayers.length === 0) {
      console.log('No matching players found for auto-build');
      this.showAutoBuildInfo(
        'Auto-Build - No Players Found',
        "No players found that match the team group's position or number requirements.",
      );
      return;
    }

    // Add matching players to the team group
    this.selectedTeamGroup.Players.push(...matchingPlayers);

    console.log(
      `Auto-build completed: Added ${matchingPlayers.length} players to ${this.selectedTeamGroup.TeamGroupName}`,
    );

    // Show success message
    this.showAutoBuildInfo(
      'Auto-Build Completed',
      `Auto-build completed! Added ${matchingPlayers.length} player(s) to ${this.selectedTeamGroup.TeamGroupName}.`,
    );
  }

  public closeDeleteTeamGroupDialog(): void {
    this.showDeleteTeamGroupDialog = false;
    this.teamGroupToDelete = null;
  }

  // Auto-Build info dialog methods
  public showAutoBuildInfo(title: string, message: string): void {
    this.autoBuildInfoTitle = title;
    this.autoBuildInfoMessage = message;
    this.showAutoBuildInfoDialog = true;
  }

  public closeAutoBuildInfoDialog(): void {
    this.showAutoBuildInfoDialog = false;
    this.autoBuildInfoTitle = '';
    this.autoBuildInfoMessage = '';
  }

  public confirmDeleteTeamGroup(): void {
    if (!this.teamGroupToDelete || !this.selectedTeam) {
      console.error('No team group selected for deletion or no team selected');
      return;
    }

    try {
      // Remove the team group from the team's team groups array
      const teamGroupIndex = this.selectedTeam.TeamGroups.findIndex(
        (tg) => tg.TeamGroupID === this.teamGroupToDelete!.TeamGroupID,
      );

      if (teamGroupIndex !== -1) {
        // Get the players from the team group before deleting
        const playersToReturn = [...this.teamGroupToDelete.Players];

        // Remove the team group
        this.selectedTeam.TeamGroups.splice(teamGroupIndex, 1);

        console.log(
          `Deleted team group "${this.teamGroupToDelete.TeamGroupName}" with ${playersToReturn.length} players. Players remain on the team.`,
        );

        // Clear team group selection
        this.store.dispatch(new SetSelectedTeamGroup(null));

        // Close dialog
        this.closeDeleteTeamGroupDialog();

        // Force change detection
        this.cdr.detectChanges();
      } else {
        console.error('Team group not found in team');
        alert('Error: Team group not found in team.');
      }
    } catch (error) {
      console.error('Error deleting team group:', error);
      alert(
        'An error occurred while deleting the team group. Please try again.',
      );
    }
  }

  // Add Default Team Groups to existing team functionality
  public onAddDefaultTeamGroups(): void {
    if (!this.selectedTeam) {
      console.error('No team selected for adding default team groups');
      return;
    }

    // Clear previous selection
    this.selectedDefaultTeamGroupsToAdd.clear();

    // Show the dialog
    this.showAddDefaultTeamGroupsDialog = true;
  }

  public closeAddDefaultTeamGroupsDialog(): void {
    this.showAddDefaultTeamGroupsDialog = false;
    this.selectedDefaultTeamGroupsToAdd.clear();
  }

  public getAvailableDefaultTeamGroupsForTeam(): IDefaultTeamGroup[] {
    if (!this.selectedTeam) return [];

    const teamOrgId = this.selectedTeam.TenantID;

    return this.defaultTeamGroups.filter((group) => {
      // Include system-level groups (available to all) - TENANT with Context -1
      if (
        group.OwnershipContext.Context === 'TENANT' &&
        group.OwnershipContext.ContextKey === -1
      ) {
        return true;
      }
      // Include organization-level groups for the team's org
      if (
        group.OwnershipContext.Context === 'TENANT' &&
        group.OwnershipContext.ContextKey === teamOrgId
      ) {
        return true;
      }
      return false;
    });
  }

  public toggleDefaultTeamGroupSelectionForAdd(groupId: number): void {
    if (this.selectedDefaultTeamGroupsToAdd.has(groupId)) {
      this.selectedDefaultTeamGroupsToAdd.delete(groupId);
    } else {
      this.selectedDefaultTeamGroupsToAdd.add(groupId);
    }
  }

  public isDefaultTeamGroupSelectedForAdd(groupId: number): boolean {
    return this.selectedDefaultTeamGroupsToAdd.has(groupId);
  }

  public areAllDefaultTeamGroupsSelectedForAdd(): boolean {
    const availableGroups = this.getAvailableDefaultTeamGroupsForTeam();
    return (
      availableGroups.length > 0 &&
      availableGroups.every((group) =>
        this.selectedDefaultTeamGroupsToAdd.has(group.TeamGroupID),
      )
    );
  }

  public toggleSelectAllDefaultTeamGroupsForAdd(): void {
    const availableGroups = this.getAvailableDefaultTeamGroupsForTeam();
    const allSelected = this.areAllDefaultTeamGroupsSelectedForAdd();

    if (allSelected) {
      // Deselect all
      availableGroups.forEach((group) => {
        this.selectedDefaultTeamGroupsToAdd.delete(group.TeamGroupID);
      });
    } else {
      // Select all
      availableGroups.forEach((group) => {
        this.selectedDefaultTeamGroupsToAdd.add(group.TeamGroupID);
      });
    }
  }

  public addSelectedDefaultTeamGroupsToTeam(): void {
    if (!this.selectedTeam || this.selectedDefaultTeamGroupsToAdd.size === 0) {
      console.error('No team selected or no default team groups selected');
      return;
    }

    try {
      const selectedGroups = this.defaultTeamGroups.filter((group) =>
        this.selectedDefaultTeamGroupsToAdd.has(group.TeamGroupID),
      );

      for (const defaultGroup of selectedGroups) {
        // Check if a team group with the same name already exists
        const existingGroup = this.selectedTeam.TeamGroups.find(
          (tg) =>
            tg.TeamGroupName.toLowerCase() ===
            defaultGroup.TeamGroupName.toLowerCase(),
        );

        if (existingGroup) {
          console.warn(
            `Team group "${defaultGroup.TeamGroupName}" already exists in team, skipping`,
          );
          continue;
        }

        const newTeamGroup: ITeamGroup = {
          TeamGroupID: this.generateNewTeamGroupId(),
          OwnershipContext: {
            Context: 'TEAM',
            ContextKey: this.selectedTeam.TeamID,
          },
          TeamGroupName: defaultGroup.TeamGroupName,
          Players: [], // Start with no players
          MatchingPositions: [...defaultGroup.MatchingPositions],
          MatchingPositionNumbers: [...defaultGroup.MatchingPositionNumbers],
        };

        this.selectedTeam.TeamGroups.push(newTeamGroup);
      }

      console.log(
        `Added ${selectedGroups.length} default team groups to team ${this.selectedTeam.TeamName}`,
      );

      // Close dialog
      this.closeAddDefaultTeamGroupsDialog();

      // Force change detection
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error adding default team groups to team:', error);
      alert('An error occurred while adding team groups. Please try again.');
    }
  }

  // Import default team groups with player matching (called from drawer)
  public onImportDefaultTeamGroups(): void {
    if (!this.selectedTeam) {
      console.error('No team selected for importing default team groups');
      alert('Please select a team first.');
      return;
    }

    // Open the dialog
    this.onAddDefaultTeamGroups();
  }

  public addSelectedDefaultTeamGroupsWithPlayers(): void {
    if (!this.selectedTeam || this.selectedDefaultTeamGroupsToAdd.size === 0) {
      console.error('No team selected or no default team groups selected');
      return;
    }

    try {
      // Create a deep copy of the selected team to work with (store objects are immutable)
      const updatedTeam: ITeam = {
        ...this.selectedTeam,
        Players: this.selectedTeam.Players
          ? [...this.selectedTeam.Players]
          : [],
        TeamGroups: this.selectedTeam.TeamGroups
          ? [...this.selectedTeam.TeamGroups]
          : [],
      };

      const selectedGroups = this.defaultTeamGroups.filter((group) =>
        this.selectedDefaultTeamGroupsToAdd.has(group.TeamGroupID),
      );

      console.log(
        `📥 Importing ${selectedGroups.length} default team groups...`,
      );

      const teamPlayers = updatedTeam.Players || [];
      let addedCount = 0;

      for (const defaultGroup of selectedGroups) {
        try {
          console.log(`Processing: ${defaultGroup.TeamGroupName}`);

          // Check if a team group with the same name already exists
          const existingGroup = updatedTeam.TeamGroups.find(
            (tg) =>
              tg.TeamGroupName.toLowerCase() ===
              defaultGroup.TeamGroupName.toLowerCase(),
          );

          if (existingGroup) {
            console.warn(
              `⚠️ Team group "${defaultGroup.TeamGroupName}" already exists in team, skipping`,
            );
            continue;
          }

          // Match players by position abbreviation or jersey number
          const matchedPlayers = teamPlayers.filter((player) => {
            // Check if player's position matches any of the matching positions
            const positionMatch =
              defaultGroup.MatchingPositions?.length > 0 &&
              player.PositionAbbrev &&
              defaultGroup.MatchingPositions.some(
                (pos) =>
                  pos.toLowerCase() === player.PositionAbbrev?.toLowerCase(),
              );

            // Check if player's jersey number matches any of the matching numbers
            const numberMatch =
              defaultGroup.MatchingPositionNumbers?.length > 0 &&
              defaultGroup.MatchingPositionNumbers.includes(
                player.JerseyNumber,
              );

            return positionMatch || numberMatch;
          });

          const newTeamGroup: ITeamGroup = {
            TeamGroupID: this.generateNewTeamGroupId(),
            OwnershipContext: {
              Context: 'TEAM',
              ContextKey: updatedTeam.TeamID,
            },
            TeamGroupName: defaultGroup.TeamGroupName,
            Players: matchedPlayers.map((p) => ({ ...p })), // Copy matched players
            MatchingPositions: defaultGroup.MatchingPositions
              ? [...defaultGroup.MatchingPositions]
              : [],
            MatchingPositionNumbers: defaultGroup.MatchingPositionNumbers
              ? [...defaultGroup.MatchingPositionNumbers]
              : [],
          };

          updatedTeam.TeamGroups.push(newTeamGroup);
          addedCount++;

          console.log(
            `✅ Added team group "${defaultGroup.TeamGroupName}" with ${matchedPlayers.length} matched players`,
          );
        } catch (groupError) {
          console.error(
            `❌ Error processing team group "${defaultGroup.TeamGroupName}":`,
            groupError,
          );
        }
      }

      console.log(
        `✅ Successfully imported ${addedCount} of ${selectedGroups.length} team groups to team "${updatedTeam.TeamName}"`,
      );

      // Update the team in the store with the modified copy
      this.store.dispatch(new SetSelectedContextTeam(updatedTeam));

      // Close dialog
      this.closeAddDefaultTeamGroupsDialog();

      // Force change detection
      this.cdr.detectChanges();
    } catch (error) {
      console.error('❌ Error importing default team groups:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error,
      });
      alert('An error occurred while importing team groups. Please try again.');
    }
  }

  public onPublishToPlayers(): void {
    // Placeholder - implement player publishing logic
    console.log('Publish to players functionality to be implemented');
  }

  // Player editing methods
  public openPlayerEditPopup(player: Player): void {
    this.originalPlayer = { ...player }; // Create a copy to track changes
    this.editingPlayer = { ...player }; // Create an editable copy
    this.isPlayerEditPopupOpen = true;
  }

  public closePlayerEditPopup(): void {
    this.isPlayerEditPopupOpen = false;
    this.editingPlayer = null;
    this.originalPlayer = null;
  }

  public savePlayerChanges(): void {
    if (!this.editingPlayer || !this.originalPlayer) {
      return;
    }

    // Validate required fields
    if (
      !this.editingPlayer.FirstName.trim() ||
      !this.editingPlayer.LastName.trim() ||
      !this.editingPlayer.PositionName ||
      !this.editingPlayer.GenderName ||
      !this.editingPlayer.AgeGroupName ||
      this.editingPlayer.JerseyNumber < 0 ||
      this.editingPlayer.JerseyNumber > 99
    ) {
      alert('Please fill in all required fields with valid values.');
      return;
    }

    // Check for jersey number conflicts (within the same team)
    const teamPlayers = this.getSelectedTeamPlayers();
    const conflictingPlayer = teamPlayers.find(
      (p) =>
        p.PlayerID !== this.editingPlayer!.PlayerID &&
        p.JerseyNumber === this.editingPlayer!.JerseyNumber,
    );

    if (conflictingPlayer) {
      alert(
        `Jersey number ${
          this.editingPlayer.JerseyNumber
        } is already taken by ${this.getPlayerFullName(conflictingPlayer)}`,
      );
      return;
    }

    // Find and update the player in the data structure
    this.updatePlayerInDataStructure(this.editingPlayer);

    // Close the popup
    this.closePlayerEditPopup();

    // Trigger change detection
    this.cdr.detectChanges();
  }

  private updatePlayerInDataStructure(updatedPlayer: Player): void {
    // Find the organization
    const org = this.organizations.find(
      (o) => o.TenantID === this.currentSelectedTenantId,
    );
    if (!org) return;

    // Find the team
    const team = org.Teams.find((t) => t.TeamID === updatedPlayer.TeamID);
    if (!team) return;

    // Update player in team's player list
    const playerIndex = team.Players.findIndex(
      (p) => p.PlayerID === updatedPlayer.PlayerID,
    );
    if (playerIndex !== -1) {
      team.Players[playerIndex] = { ...updatedPlayer };
    }

    // Update player in team groups if exists
    team.TeamGroups.forEach((teamGroup) => {
      const groupPlayerIndex = teamGroup.Players.findIndex(
        (p) => p.PlayerID === updatedPlayer.PlayerID,
      );
      if (groupPlayerIndex !== -1) {
        teamGroup.Players[groupPlayerIndex] = { ...updatedPlayer };
      }
    });
  }

  public onPositionChange(): void {
    if (!this.editingPlayer) return;

    const selectedPosition = this.getAvailablePositions().find(
      (p) => p.name === this.editingPlayer!.PositionName,
    );
    if (selectedPosition) {
      this.editingPlayer.PositionAbbrev = selectedPosition.abbreviation;
    }
  }

  public onGenderChange(): void {
    if (!this.editingPlayer) return;

    const selectedGender = this.getAvailableGenders().find(
      (g) => g.GenderName === this.editingPlayer!.GenderName,
    );
    if (selectedGender) {
      this.editingPlayer.GenderID = selectedGender.GenderID;
      this.editingPlayer.GenderAbbrev = selectedGender.GenderAbbrev;
    }
  }

  public onAgeGroupChange(): void {
    if (!this.editingPlayer) return;

    const selectedAgeGroup = this.getAvailableAgeGroups().find(
      (ag) => ag.AgeGroupName === this.editingPlayer!.AgeGroupName,
    );
    if (selectedAgeGroup) {
      this.editingPlayer.AgeGroupID = selectedAgeGroup.AgeGroupID;
    }
  }

  // Add Player Methods
  public openAddPlayerPopup(): void {
    if (!this.selectedTeam) return;

    // Initialize new player with basic structure
    this.newPlayer = {
      FirstName: '',
      LastName: '',
      TeamID: this.selectedTeam.TeamID,
      JerseyNumber: 0,
      PositionName: '',
      PositionAbbrev: '',
      GenderName: '',
      GenderID: 0,
      GenderAbbrev: '',
      AgeGroupName: '',
      AgeGroupID: 0,
    };

    // Reset arrays
    this.newPlayerPositions = [];
    this.newPlayerPrimaryPosition = '';
    this.selectedTeamGroupIds = [];

    this.isAddPlayerPopupOpen = true;
  }

  public closeAddPlayerPopup(): void {
    this.isAddPlayerPopupOpen = false;
    this.newPlayer = {};
    this.newPlayerPositions = [];
    this.newPlayerPrimaryPosition = '';
    this.selectedTeamGroupIds = [];
  }

  public onPositionCheckboxChange(positionName: string, event: any): void {
    const isChecked = event.target.checked;

    if (isChecked) {
      if (!this.newPlayerPositions.includes(positionName)) {
        this.newPlayerPositions.push(positionName);
      }
    } else {
      const index = this.newPlayerPositions.indexOf(positionName);
      if (index > -1) {
        this.newPlayerPositions.splice(index, 1);

        // If the removed position was the primary position, clear it
        if (this.newPlayerPrimaryPosition === positionName) {
          this.newPlayerPrimaryPosition = '';
        }
      }
    }

    // Auto-select team groups based on positions
    this.preselectTeamGroupsByPositions();
  }

  public onTeamGroupCheckboxChange(teamGroupId: number, event: any): void {
    const isChecked = event.target.checked;

    if (isChecked) {
      if (!this.selectedTeamGroupIds.includes(teamGroupId)) {
        this.selectedTeamGroupIds.push(teamGroupId);
      }
    } else {
      const index = this.selectedTeamGroupIds.indexOf(teamGroupId);
      if (index > -1) {
        this.selectedTeamGroupIds.splice(index, 1);
      }
    }
  }

  public onNewPlayerGenderChange(): void {
    if (!this.newPlayer.GenderName) return;

    const selectedGender = this.getAvailableGenders().find(
      (g) => g.GenderName === this.newPlayer.GenderName,
    );
    if (selectedGender) {
      this.newPlayer.GenderID = selectedGender.GenderID;
      this.newPlayer.GenderAbbrev = selectedGender.GenderAbbrev;
    }
  }

  public onNewPlayerAgeGroupChange(): void {
    if (!this.newPlayer.AgeGroupName) return;

    const selectedAgeGroup = this.getAvailableAgeGroups().find(
      (ag) => ag.AgeGroupName === this.newPlayer.AgeGroupName,
    );
    if (selectedAgeGroup) {
      this.newPlayer.AgeGroupID = selectedAgeGroup.AgeGroupID;
    }
  }

  public preselectTeamGroupsByPositions(): void {
    if (!this.selectedTeam || this.newPlayerPositions.length === 0) return;

    // Get available team groups for the current team
    const availableGroups = this.getAvailableTeamGroups();

    // Clear current selections
    this.selectedTeamGroupIds = [];

    // Check each team group for matching positions
    for (const group of availableGroups) {
      // For now, we'll implement basic matching logic
      // This can be enhanced later with the DefaultTeamGroup matching logic
      const shouldSelect = this.shouldSelectTeamGroup(group);
      if (shouldSelect) {
        this.selectedTeamGroupIds.push(group.TeamGroupID);
      }
    }
  }

  private shouldSelectTeamGroup(teamGroup: ITeamGroup): boolean {
    // Basic logic - this can be enhanced with MatchingPositions and MatchingPositionNumbers
    // For now, we'll do simple name-based matching
    const groupName = teamGroup.TeamGroupName.toLowerCase();

    for (const position of this.newPlayerPositions) {
      const positionLower = position.toLowerCase();

      // Simple matching rules
      if (
        positionLower.includes('goalkeeper') &&
        groupName.includes('goalkeep')
      )
        return true;
      if (positionLower.includes('defender') && groupName.includes('defend'))
        return true;
      if (
        positionLower.includes('midfielder') &&
        groupName.includes('midfield')
      )
        return true;
      if (positionLower.includes('forward') && groupName.includes('attack'))
        return true;
      if (positionLower.includes('striker') && groupName.includes('attack'))
        return true;
      if (positionLower.includes('winger') && groupName.includes('attack'))
        return true;

      // Generic "Starting" group for any position
      if (groupName.includes('starting')) return true;
    }

    return false;
  }

  public isAddPlayerFormValid(): boolean {
    return !!(
      this.newPlayer.FirstName?.trim() &&
      this.newPlayer.LastName?.trim() &&
      this.newPlayer.GenderName &&
      this.newPlayer.AgeGroupName &&
      this.newPlayerPrimaryPosition &&
      this.newPlayer.JerseyNumber !== undefined &&
      this.newPlayer.JerseyNumber >= 0 &&
      this.newPlayer.JerseyNumber <= 99
    );
  }

  public saveNewPlayer(): void {
    if (!this.isAddPlayerFormValid() || !this.selectedTeam) {
      alert('Please fill in all required fields.');
      return;
    }

    // Check for jersey number conflicts
    const conflictingPlayer = this.selectedTeam.Players.find(
      (p) => p.JerseyNumber === this.newPlayer.JerseyNumber,
    );

    if (conflictingPlayer) {
      alert(
        `Jersey number ${
          this.newPlayer.JerseyNumber
        } is already taken by ${this.getPlayerFullName(conflictingPlayer)}`,
      );
      return;
    }

    // Set the primary position data
    const primaryPosition = this.getAvailablePositions().find(
      (p) => p.name === this.newPlayerPrimaryPosition,
    );

    if (primaryPosition) {
      this.newPlayer.PositionName = primaryPosition.name;
      this.newPlayer.PositionAbbrev = primaryPosition.abbreviation;
    }

    // Generate a new PlayerID (simple incrementing for now)
    const existingIds = this.selectedTeam.Players.map((p) => p.PlayerID);
    const newPlayerId =
      existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    this.newPlayer.PlayerID = newPlayerId;

    // Create the complete player object
    const newPlayerComplete: Player = {
      PlayerID: newPlayerId,
      UserId: this.newPlayer.UserId || 0,
      FirstName: this.newPlayer.FirstName!,
      LastName: this.newPlayer.LastName!,
      TeamID: this.selectedTeam.TeamID,
      PositionName: this.newPlayer.PositionName!,
      PositionAbbrev: this.newPlayer.PositionAbbrev!,
      JerseyNumber: this.newPlayer.JerseyNumber!,
      GenderID: this.newPlayer.GenderID!,
      GenderName: this.newPlayer.GenderName!,
      GenderAbbrev: this.newPlayer.GenderAbbrev!,
      AgeGroupID: this.newPlayer.AgeGroupID!,
      AgeGroupName: this.newPlayer.AgeGroupName!,
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
    };

    // Add the player to the team
    this.selectedTeam.Players.push(newPlayerComplete);

    // Add the player to selected team groups
    for (const teamGroupId of this.selectedTeamGroupIds) {
      const teamGroup = this.selectedTeam.TeamGroups.find(
        (tg) => tg.TeamGroupID === teamGroupId,
      );
      if (teamGroup) {
        if (!teamGroup.Players) {
          teamGroup.Players = [];
        }
        teamGroup.Players.push(newPlayerComplete);
      }
    }

    // Update the state store (if needed)
    // This will depend on your state management implementation

    console.log('New player added:', newPlayerComplete);
    console.log('Added to team groups:', this.selectedTeamGroupIds);

    // Close the dialog
    this.closeAddPlayerPopup();

    // Show success message
    alert(
      `Player ${this.getPlayerFullName(
        newPlayerComplete,
      )} has been added successfully!`,
    );
  }

  public getAvailablePositions(): { name: string; abbreviation: string }[] {
    return this.mockPositionsService.getPositions().map((pos) => ({
      name: pos.name,
      abbreviation: pos.abbrev,
    }));
  }

  public getAvailableGenders(): Gender[] {
    return this.mockDataService.getGenders();
  }

  public getAvailableAgeGroups(): AgeGroup[] {
    return this.mockDataService.getAgeGroups();
  }

  // Viewport Info helper methods
  public getCurrentVisualModeLabel(): string {
    return 'Radial Tree'; // D3UIV1 always uses radial tree layout
  }

  public getCurrentTreeSizeModeLabel(): string {
    return 'Full Screen'; // Always full screen
  }

  public hideToolbar(toolbarType: string): void {
    console.log(`🎯 [visualization-tester] hideToolbar called: ${toolbarType}`);
    this.store.dispatch(new SetToolbarVisibility(toolbarType as any, false));

    // Track if skills radar was manually closed
    if (toolbarType === 'skillsRadar') {
      this.skillsRadarManuallyClosed = true;
      console.log(
        '🎯 Skills radar manually closed - will not auto-open until nodes cleared',
      );
    }

    // Note: toolbar visibility is persisted via NGXS state and localStorage
    // hideToolbar just updates the state, which automatically triggers persistence
  }

  public onToolbarVisibilityChange(
    toolbarType: string,
    visible: boolean,
  ): void {
    console.log(
      `🎯 [visualization-tester] onToolbarVisibilityChange: ${toolbarType} = ${visible}`,
    );
    this.store.dispatch(new SetToolbarVisibility(toolbarType as any, visible));
  }

  public showToolbar(toolbarType: string): void {
    console.log(`🎯 [visualization-tester] showToolbar called: ${toolbarType}`);
    this.store.dispatch(new SetToolbarVisibility(toolbarType as any, true));
  }

  // Toolbar visibility control methods
  public getToolbarIcon(type: string): string {
    switch (type) {
      case 'selectionTools':
        return '🛠️';
      case 'annotation':
        return '✏️';
      case 'screenshots':
        return '📷';
      // case 'lessons': // OLD - Removed in favor of lessonBuilderV2
      //   return '📚';
      // case 'selectedNodes': // Removed - no longer needed
      //   return '🎯';
      case 'lessonViewer':
        return '🎓';
      case 'lessonBuilderV2':
        return '🎛️';
      case 'lessonRunnerV2':
        return '▶️'; // Play button for lesson runner
      case 'techniqueExplorer':
        return '🔭';
      case 'nodePainter':
        return '🎨';
      case 'skillsRadar':
        return '🕸️';
      case 'quickNav':
        return '🌲';
      case 'search':
        return '🔍';
      case 'teams':
        return '👨‍👩‍👧‍👦';
      case 'importExport':
        return '📤📥';
      case 'favorites':
        return '⭐';
      case 'bookmarks':
        return '🔖';
      case 'overlays':
        return '🎭';
      case 'tenancy':
        return '🏢';
      case 'teamRoster':
        return '🏃';
      case 'teamGroupMembers':
        return '🏁';
      case 'defaultTeamGroups':
        return '🏷️';
      // case 'datasets': // OLD - Removed in favor of datasets drawer
      //   return '💡';
      case 'zoomControls':
        return '⚙️';
      case 'rotationControl':
        return '🔄';
      case 'statusPanel':
        return '📊';
      case 'viewportInfo':
        return '📐';
      case 'visualizationOptions':
        return '🌸';
      case 'colorizationOptions':
        return '🎨';
      case 'style':
        return '✨';
      case 'bottomToolbar':
        return '⬇️';
      case 'nodesList':
        return '📋';
      default:
        return '🔧';
    }
  }

  public getToolbarVisibility(type: string): boolean {
    if (type === 'bottomToolbar') {
      return this.bottomToolbarVisible;
    }
    const visibility = (this.toolbarVisibility as any)[type] || false;
    // if (type === 'lessonBuilderV2' || type === 'lessonRunnerV2') {
    //   console.log(`🔍 getToolbarVisibility('${type}') = ${visibility}`);
    // }
    return visibility;
  }

  public toggleToolbarVisibility(type: string, event?: MouseEvent): void {
    console.log(`🔄 toggleToolbarVisibility called with type: ${type}`, event);

    if (type === 'bottomToolbar') {
      this.toggleBottomToolbar();
      return;
    }

    // Check if CTRL key was held during click to center toolbar
    const shouldCenter = event?.ctrlKey || false;

    // Check if this is the first time showing this toolbar (currently hidden)
    const currentVisibility = this.getToolbarVisibility(type);
    const isFirstShow = !currentVisibility;

    if (isFirstShow && !shouldCenter) {
      // Set default position for first-time show
      const defaultPosition = this.getDefaultToolbarPosition(type);
      if (defaultPosition) {
        console.log(
          `🎯 First show - setting default position for ${type}:`,
          defaultPosition,
        );
        this.store.dispatch(
          new UpdateToolbarPosition(type as any, defaultPosition),
        );
      }
    }

    if (shouldCenter) {
      console.log(`🎯 CTRL+Click detected - centering toolbar: ${type}`);

      // Calculate screen center position
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const centerX = windowWidth / 2 - 200; // Offset by half toolbar width
      const centerY = windowHeight / 2 - 150; // Offset by half toolbar height

      // Set toolbar to center position before toggling visibility
      this.store.dispatch(
        new UpdateToolbarPosition(type as any, { x: centerX, y: centerY }),
      );

      // Small delay to ensure position update happens before visibility toggle
      setTimeout(() => {
        console.log(`🔄 Dispatching ToggleToolbarVisibility for: ${type}`);
        this.store.dispatch(new ToggleToolbarVisibility(type as any));

        // Apply rescue border effect after toolbar becomes visible
        setTimeout(() => {
          this.applyRescueBorderEffect(type);
        }, 100);
      }, 10);
    } else {
      // Normal toggle behavior - use last position
      console.log(`🔄 Dispatching ToggleToolbarVisibility for: ${type}`);
      this.store.dispatch(new ToggleToolbarVisibility(type as any));
    }
  }

  private applyRescueBorderEffect(toolbarType: string): void {
    console.log(`🎯 Applying rescue border effect to: ${toolbarType}`);

    // Try different selector patterns to find the toolbar
    const selectorPatterns = [
      `app-toolbar-${toolbarType.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
      `app-toolbar-${toolbarType}`,
      `[data-toolbar="${toolbarType}"]`,
      `.toolbar-${toolbarType}`,
    ];

    let toolbarElement: HTMLElement | null = null;

    for (const selector of selectorPatterns) {
      toolbarElement = document.querySelector(selector) as HTMLElement;
      if (toolbarElement) {
        console.log(`🎯 Found toolbar using selector: ${selector}`);
        break;
      }
    }

    // If still not found, try to find by visible toolbar matching the type
    if (!toolbarElement) {
      const allToolbars = document.querySelectorAll('[class*="toolbar"]');
      for (let i = 0; i < allToolbars.length; i++) {
        const element = allToolbars[i] as HTMLElement;
        if (
          element.style.display !== 'none' &&
          element.offsetParent !== null &&
          element.className.includes(toolbarType.toLowerCase())
        ) {
          toolbarElement = element;
          console.log(`🎯 Found toolbar by class search: ${element.className}`);
          break;
        }
      }
    }

    if (toolbarElement) {
      // Add rescue effect class
      toolbarElement.classList.add('toolbar-rescued');

      // Remove the class after 3 seconds to complete the fade effect
      setTimeout(() => {
        toolbarElement!.classList.remove('toolbar-rescued');
      }, 3000);
    } else {
      console.warn(`Could not find toolbar element for: ${toolbarType}`);
      console.log(
        'Available elements:',
        Array.from(document.querySelectorAll('[class*="toolbar"]')).map(
          (el) => el.className,
        ),
      );
    }
  }

  public hideAllToolbars(): void {
    this.store.dispatch(new SetAllToolbarVisibility(false));
  }

  public getToolbarDisplayName(key: string): string {
    const displayNames: Record<string, string> = {
      selectionTools: 'Selection Tools (CTRL+click to center)',
      annotation: 'Annotation Tools (CTRL+click to center)',
      screenshots: 'Screenshots (CTRL+click to center)',
      // lessons: 'Lesson Builder (CTRL+click to center)', // OLD - Removed
      // selectedNodes: 'Selected Nodes (CTRL+click to center)', // Removed - no longer needed
      lessonViewer: 'Lesson Viewer (CTRL+click to center)',
      lessonBuilderV2: 'Builder V2 (CTRL+click to center)',
      lessonRunnerV2: 'Runner V2 (CTRL+click to center)',
      techniqueExplorer: 'Technique Explorer (CTRL+click to center)',
      nodePainter: 'Node Painter (CTRL+click to center)',
      skillsRadar: 'Skills Radar (CTRL+click to center)',
      quickNav: 'Quick-Nav (CTRL+click to center)',
      search: 'Search (CTRL+click to center)',
      teams: 'Teams (CTRL+click to center)',
      tenancy: 'Tenancy / Organization (CTRL+click to center)',
      teamRoster: 'Rosters (CTRL+click to center)',
      teamGroupMembers: 'Team Group Members (CTRL+click to center)',
      defaultTeamGroups: 'Default Team Groups (CTRL+click to center)',
      // datasets: 'Datasets (CTRL+click to center)', // OLD - Removed in favor of datasets drawer
      zoomControls: 'View / Effects (CTRL+click to center)',
      rotationControl: 'Navigation (CTRL+click to center)',
      statusPanel: 'Selected Node (CTRL+click to center)',
      viewportInfo: 'Viewport (CTRL+click to center)',
      visualizationOptions: 'Visualization (CTRL+click to center)',
      colorizationOptions: 'Colorization (CTRL+click to center)',
      style: 'Style (CTRL+click to center)',
      bottomToolbar: 'Tracking (CTRL+click to center)',
      nodesList: 'Nodes List (CTRL+click to center)',
      favorites: 'Favorites (CTRL+click to center)',
      bookmarks: 'Bookmarks (CTRL+click to center)',
      overlays: 'Overlays (CTRL+click to center)',
    };
    return displayNames[key] || key;
  }

  public getToolbarKeys(): string[] {
    return this.toolbarTypes;
  }

  public getLeftToolbarKeys(): string[] {
    const keys = this.toolbarTypes.filter(
      (key) =>
        ![
          'tenancy', // Tenancy has its own hamburger menu
          'zoomControls',
          'viewportInfo',
          'visualizationOptions',
          'colorizationOptions',
          'overlays',
          'bottomToolbar',
        ].includes(key),
    );
    return keys;
  }

  public getRightToolbarKeys(): string[] {
    return this.toolbarTypes.filter((key) =>
      [
        'zoomControls',
        'viewportInfo',
        'visualizationOptions',
        'colorizationOptions',
        'style',
        'overlays',
        'statusPanel',
        'bottomToolbar',
      ].includes(key),
    );
  }

  // Confirmation dialog methods
  public confirmClearAllDrawings(): void {
    console.log('=== CONFIRM CLEAR ALL DRAWINGS CLICKED ===');
    console.log('Current strokes count:', this.strokes.length);

    if (this.strokes.length === 0) {
      console.log('No strokes to clear, returning early');
      return;
    }

    this.showClearDrawingsDialog = true;
    console.log('Clear drawings dialog set to visible');
  }

  public confirmClearAllSelections(): void {
    console.log('=== CONFIRM CLEAR ALL SELECTIONS CLICKED ===');
    console.log('Current selectedNodes:', [...this.selectedNodes]);
    console.log('Current selectedNode:', this.selectedNode);

    const totalSelections =
      this.selectedNodes.length + (this.selectedNode ? 1 : 0);

    console.log('Total selections count:', totalSelections);

    if (totalSelections === 0) {
      console.log('No selections to clear, returning early');
      return;
    }

    this.showClearSelectionsDialog = true;
    console.log('Clear selections dialog set to visible');
  }

  // New confirmation dialog callbacks
  public onClearDrawingsConfirmed(confirmed: boolean): void {
    if (confirmed) {
      console.log('User confirmed clearing drawings');
      this.clearDrawing();
    }
    this.showClearDrawingsDialog = false;
  }

  public onClearSelectionsConfirmed(confirmed: boolean): void {
    if (confirmed) {
      console.log('User confirmed clearing selections');
      this.clearNodeSelection();
      this.selectedNode = null;
      this.updateNodeSelectionVisuals();
    }
    this.showClearSelectionsDialog = false;
  }

  public onSystemDefaultWarningConfirmed(confirmed: boolean): void {
    this.showSystemDefaultWarningDialog = false;
  }

  public showSystemDefaultWarning(): void {
    this.showSystemDefaultWarningDialog = true;
  }

  // Screenshot method
  public takeScreenshot(options: {
    format: 'png' | 'jpg';
    target: 'clipboard' | 'download';
  }): void {
    const { format, target } = options;
    const svgElement = this.svgRef.nativeElement;

    // Get the actual bounding box of all diagram content
    const bbox = svgElement.getBBox();

    // Add padding around the diagram
    const padding = 40;
    const width = bbox.width + padding * 2;
    const height = bbox.height + padding * 2;
    const x = bbox.x - padding;
    const y = bbox.y - padding;

    // Create a canvas element with the full diagram dimensions
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Set background color
    const bgColor = this.colorsService.getBackgroundColor(this.isDarkMode);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    svgClone.setAttribute('width', width.toString());
    svgClone.setAttribute('height', height.toString());
    svgClone.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);

    // Serialize SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);

    // Create a blob from SVG string
    const svgBlob = new Blob([svgString], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);

    // Create an image element
    const img = new Image();
    img.onload = () => {
      // Draw the SVG image onto the canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Could not create blob from canvas');
            URL.revokeObjectURL(url);
            return;
          }

          // Show camera flash effect
          this.showCameraFlash();

          if (target === 'clipboard') {
            // Copy to clipboard
            this.copyImageToClipboard(blob);
          } else {
            // Download file
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date()
              .toISOString()
              .replace(/[:.]/g, '-')
              .slice(0, -5);
            link.download = `screenshot-${timestamp}.${format}`;
            link.href = downloadUrl;
            link.click();

            // Cleanup
            URL.revokeObjectURL(downloadUrl);
          }

          // Cleanup
          URL.revokeObjectURL(url);
        },
        format === 'jpg' ? 'image/jpeg' : 'image/png',
        0.95,
      );
    };

    img.onerror = (error) => {
      console.error('Error loading SVG image:', error);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }

  // Copy image to clipboard
  private async copyImageToClipboard(blob: Blob): Promise<void> {
    try {
      const clipboardItem = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([clipboardItem]);
      console.log('Image copied to clipboard successfully');
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error);
      alert(
        'Failed to copy to clipboard. Your browser may not support this feature.',
      );
    }
  }

  // Camera flash effect
  private showCameraFlash(): void {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100vw';
    flash.style.height = '100vh';
    flash.style.backgroundColor = 'white';
    flash.style.opacity = '0.8';
    flash.style.zIndex = '99999';
    flash.style.pointerEvents = 'none';
    flash.style.transition = 'opacity 0.3s ease-out';

    document.body.appendChild(flash);

    // Fade out and remove
    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(flash);
      }, 300);
    }, 100);
  }

  // Snag-it mode properties
  public snagitActive = false;
  private snagitStartPoint: { x: number; y: number } | null = null;
  private snagitRect: SVGRectElement | null = null;

  // Start snag-it mode
  public startSnagitMode(): void {
    this.snagitActive = true;
    console.log('Snag-it mode activated - drag to select area');
  }

  // Stop snag-it mode
  public stopSnagitMode(): void {
    this.snagitActive = false;
    this.snagitStartPoint = null;

    // Clean up any existing rectangle
    if (this.drawingLayer) {
      this.drawingLayer.selectAll('.snagit-selection').remove();
      this.snagitRect = null;
    }

    console.log('Snag-it mode deactivated');
  }

  // Toggle snag-it mode
  public toggleSnagitMode(): void {
    console.log('toggleSnagitMode called, current state:', this.snagitActive);
    if (this.snagitActive) {
      this.stopSnagitMode();
    } else {
      this.startSnagitMode();
    }
    console.log('toggleSnagitMode complete, new state:', this.snagitActive);
  }

  // Handle snag-it rectangle drawing
  private handleSnagitMouseDown(point: { x: number; y: number }): void {
    console.log(
      'handleSnagitMouseDown called, snagitActive:',
      this.snagitActive,
      'point:',
      point,
    );
    if (!this.snagitActive) return;

    this.snagitStartPoint = point;
    console.log('Creating snagit rectangle at:', point);

    // Create visual rectangle for snag-it selection using D3
    const rect = this.drawingLayer
      .append('rect')
      .attr('class', 'snagit-selection')
      .attr('x', point.x)
      .attr('y', point.y)
      .attr('width', 0)
      .attr('height', 0)
      .attr('fill', 'rgba(59, 130, 246, 0.2)')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('pointer-events', 'none');

    // Store the native element
    this.snagitRect = rect.node();
  }

  private handleSnagitMouseMove(point: { x: number; y: number }): void {
    if (!this.snagitActive || !this.snagitStartPoint || !this.snagitRect)
      return;

    const x = Math.min(this.snagitStartPoint.x, point.x);
    const y = Math.min(this.snagitStartPoint.y, point.y);
    const width = Math.abs(point.x - this.snagitStartPoint.x);
    const height = Math.abs(point.y - this.snagitStartPoint.y);

    this.snagitRect.setAttribute('x', x.toString());
    this.snagitRect.setAttribute('y', y.toString());
    this.snagitRect.setAttribute('width', width.toString());
    this.snagitRect.setAttribute('height', height.toString());
  }

  private handleSnagitMouseUp(): void {
    if (!this.snagitActive || !this.snagitStartPoint || !this.snagitRect)
      return;

    const x = parseFloat(this.snagitRect.getAttribute('x') || '0');
    const y = parseFloat(this.snagitRect.getAttribute('y') || '0');
    const width = parseFloat(this.snagitRect.getAttribute('width') || '0');
    const height = parseFloat(this.snagitRect.getAttribute('height') || '0');

    // Remove the selection rectangle
    if (this.drawingLayer) {
      this.drawingLayer.selectAll('.snagit-selection').remove();
    }

    // Reset the rectangle and start point, but keep snagit mode active for multiple captures
    this.snagitStartPoint = null;
    this.snagitRect = null;

    // Capture the selected area (if valid)
    if (width > 5 && height > 5) {
      this.captureSnagitArea(x, y, width, height);
    }
  }

  private captureSnagitArea(
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const svgElement = this.svgRef.nativeElement;

    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Set background color
    const bgColor = this.colorsService.getBackgroundColor(this.isDarkMode);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Clone the SVG and create a temporary viewport
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    svgClone.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
    svgClone.setAttribute('width', width.toString());
    svgClone.setAttribute('height', height.toString());

    // Serialize SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);

    // Create a blob from SVG string
    const svgBlob = new Blob([svgString], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);

    // Create an image element
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);

      // Get current screenshot settings from annotation toolbar
      const format =
        (document.querySelector('app-toolbar-annotation') as any)
          ?.screenshotFormat || 'png';
      const target =
        (document.querySelector('app-toolbar-annotation') as any)
          ?.screenshotTarget || 'clipboard';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Could not create blob from canvas');
            URL.revokeObjectURL(url);
            return;
          }

          // Show camera flash effect
          this.showCameraFlash();

          // Show capture notification in annotation toolbar
          if (this.annotationToolbarRef) {
            this.annotationToolbarRef.showCaptureNotification('Snag-it');
          }

          if (target === 'clipboard') {
            this.copyImageToClipboard(blob);
          } else {
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date()
              .toISOString()
              .replace(/[:.]/g, '-')
              .slice(0, -5);
            link.download = `snagit-${timestamp}.${format}`;
            link.href = downloadUrl;
            link.click();
            URL.revokeObjectURL(downloadUrl);
          }

          URL.revokeObjectURL(url);
        },
        format === 'jpg' ? 'image/jpeg' : 'image/png',
        0.95,
      );
    };

    img.onerror = (error) => {
      console.error('Error loading SVG image:', error);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }

  // Default Team Groups methods
  public selectDefaultTeamGroup(group: IDefaultTeamGroup): void {
    this.selectedDefaultTeamGroup = group;
  }

  public toggleDefaultTeamGroupsExpanded(): void {
    this.defaultTeamGroupsExpanded = !this.defaultTeamGroupsExpanded;
  }

  // Datasets methods

  /**
   * Reload DecisionFlows with filtering based on current user context
   * This should be called whenever user context changes (login, tenant selection, team selection)
   */
  private reloadFilteredDecisionFlows(): void {
    console.log('🔄 Reloading filtered DecisionFlows...');

    // Get current context from state
    const loggedInUser = this.store.selectSnapshot(
      GlobalContextState.loggedInUser,
    );
    const selectedTenant = this.store.selectSnapshot(
      GlobalContextState.selectedContextTenant,
    );
    const selectedTeam = this.store.selectSnapshot(
      GlobalContextState.selectedContextTeam,
    );
    const selectedTeamGroup = this.store.selectSnapshot(
      GlobalContextState.selectedContextTeamGroup,
    );

    console.log('  - Logged-in user:', loggedInUser?.UserId);
    console.log('  - Selected tenant:', selectedTenant?.TenantID);
    console.log('  - Selected team:', selectedTeam?.TeamID);
    console.log('  - Selected team group:', selectedTeamGroup?.TeamGroupID);

    // Get filtered datasets based on user context
    const filteredFlows = this.mockDataService.getFilteredDecisionFlows(
      loggedInUser,
      selectedTenant,
      selectedTeam,
      selectedTeamGroup,
    );

    console.log(`✅ Loaded ${filteredFlows.length} filtered DecisionFlows`);

    // Dispatch to state
    this.store.dispatch(new SketchActions.LoadDecisionFlows(filteredFlows));
  }

  public selectDecisionFlow(flow: DecisionFlow, skipStateUpdate = false): void {
    console.log('=== SELECTING DECISION FLOW ===');
    console.log('Flow:', flow);
    console.log('Current treeData before change:', this.treeData);

    // Dispatch action to update global context state (unless called from state subscription)
    if (!skipStateUpdate) {
      this.store.dispatch(new SetSelectedContextDataset(flow));
    }

    // Clear any previously selected node since we're switching datasets
    this.selectedNode = null;
    this._selectedNodes = [];

    // Clear existing tree data completely to force redraw
    this.treeData = null as any;
    this.treeNodes = [];
    this.treeLinks = [];

    // Check if we need to generate data based on FlowID
    // FlowID -1: Generate random tree data (SYSTEM dataset)
    // FlowID 0: Generate single root node
    // If treeData is null or undefined: Generate random tree data
    // Everything else: Use the specified tree data
    const shouldGenerateRandomData =
      flow.FlowID === -1 ||
      flow.treeData === null ||
      flow.treeData === undefined;
    const shouldGenerateSingleRoot =
      flow.FlowID === 0 && !shouldGenerateRandomData;

    console.log('🔍 Tree generation check:', {
      FlowID: flow.FlowID,
      treeDataIsNull: flow.treeData === null,
      treeDataIsUndefined: flow.treeData === undefined,
      shouldGenerateRandomData,
      shouldGenerateSingleRoot,
    });

    if (shouldGenerateRandomData) {
      console.log(
        '🎲 Generating NEW random tree data for FlowID:',
        flow.FlowID,
        flow.treeData === null
          ? '(treeData is null)'
          : flow.treeData === undefined
            ? '(treeData is undefined)'
            : '',
      );
      // Generate completely new random tree data using the better randomization method
      this.treeData = this.generateRandomTreeData(this.nodeCount);
      console.log('✅ Generated new tree data:', this.treeData);

      // Update the flow's tree data via state management (skip if FlowID is -1 to allow fresh generation each time)
      if (flow.FlowID !== -1) {
        const updatedTreeData = JSON.parse(JSON.stringify(this.treeData)); // Deep copy
        this.store.dispatch(
          new SketchActions.UpdateDecisionFlow(flow.FlowID, {
            treeData: updatedTreeData,
          }),
        );
        console.log(
          '💾 Dispatched update to save new tree data to DecisionFlow',
        );
      }
    } else if (shouldGenerateSingleRoot) {
      console.log('🌱 Generating single root node for FlowID:', flow.FlowID);
      // Generate a single root node
      this.treeData = {
        id: '0',
        name: 'Node 0',
        description:
          this.mockDataService.generateNodeDescription('0_single_root'),
        children: [],
      };
      console.log('✅ Generated single root node:', this.treeData);

      // Update the flow's tree data via state management
      const updatedTreeData = JSON.parse(JSON.stringify(this.treeData)); // Deep copy
      this.store.dispatch(
        new SketchActions.UpdateDecisionFlow(flow.FlowID, {
          treeData: updatedTreeData,
        }),
      );
      console.log(
        '💾 Dispatched update to save single root node to DecisionFlow',
      );
    } else {
      console.log(
        '📂 Using existing tree data from DecisionFlow:',
        flow.treeData,
      );
      // Use the existing tree data from the DecisionFlow (deep copy for safety)
      this.treeData = JSON.parse(JSON.stringify(flow.treeData));
    }

    console.log('🌳 Final treeData after selection:', this.treeData);

    // Force a complete visualization update with change detection
    this.cdr.detectChanges();

    // Trigger a complete redraw of the visualization
    setTimeout(() => {
      this.updateVisualization();
      console.log('🎨 Visualization updated with new tree data');
    }, 50);

    // Also redraw any existing strokes to ensure they're positioned correctly
    setTimeout(() => {
      this.redrawStrokes();
    }, 100);

    // Update breadcrumb path (should be empty now since selectedNode is null)
    this.updateBreadcrumbPath();

    // Update lesson filtering based on new FlowID
    this.updateLessonFiltering();

    console.log('=== DECISION FLOW SELECTION COMPLETE ===');
  }

  /**
   * Migrate lessons without FlowID to a default FlowID (0 = system/global)
   */
  private migrateLessonsFlowID(): void {
    console.log('🔄 Checking lessons for FlowID migration...');
    const currentLessons = this.store.selectSnapshot(LessonsState.getLessons);

    const lessonsNeedingMigration = currentLessons.filter(
      (lesson) => lesson.FlowID === undefined || lesson.FlowID === null,
    );

    if (lessonsNeedingMigration.length > 0) {
      console.log(
        `📊 Found ${lessonsNeedingMigration.length} lessons without FlowID, migrating to FlowID: 0 (system/global)`,
      );
      // Use FlowID 0 as default (system/global lessons)
      this.store.dispatch(new MigrateLessonsFlowID(0));
    } else {
      console.log('✅ All lessons already have FlowID values');
    }
  }

  /**
   * Update lesson observables based on currently selected Decision Flow
   */
  private updateLessonFiltering(): void {
    const flowID = this.selectedContextDataset?.FlowID;
    console.log('Updating lesson filtering for FlowID:', flowID);

    // Update currentLessons$ observable to use filtered lessons
    this.currentLessons$ = this.store
      .select(LessonsState.getLessonsByFlowID)
      .pipe(map((selector) => selector(flowID)));

    // Update hasLessons$ observable to use filtered lessons
    this.hasLessons$ = this.store
      .select(LessonsState.hasLessonsForFlowID)
      .pipe(map((selector) => selector(flowID)));

    // Note: Do NOT re-subscribe here - the subscription in ngAfterViewInit will handle updates
    // Re-subscribing here causes multiple subscriptions and infinite loops
  }

  /**
   * Helper method to determine if a DecisionFlow needs random tree data generation
   */
  private isTreeDataInvalidOrMissing(
    treeData: TreeNode | null | undefined,
  ): boolean {
    console.log('🔍 Checking if tree data is invalid or missing:', treeData);

    if (!treeData) {
      console.log('❌ Tree data is null/undefined');
      return true;
    }

    if (!treeData.children) {
      console.log('❌ Tree data has no children property');
      return true;
    }

    // Single-node trees (with empty children array) are VALID, not empty
    // Only consider it invalid if it's specifically the default empty root node
    if (treeData.children.length === 0 && treeData.name === 'Decision Root') {
      console.log('❌ Tree data is the default empty root node');
      return true;
    }

    console.log('✅ Tree data is valid (including single-node trees)');
    return false;
  }

  /**
   * Helper method to count all nodes in a tree
   */
  private countTreeNodes(node: TreeNode): number {
    if (!node) return 0;

    let count = 1; // Count this node

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        count += this.countTreeNodes(child);
      }
    }

    return count;
  }

  public onCreateNewChart(): void {
    console.log('Create New Dataset clicked');
    this.showCreateDatasetDialog = true;
  }

  public closeCreateDatasetDialog(): void {
    this.showCreateDatasetDialog = false;
    // Clear breakout data when dialog is closed
    this.breakoutNodeData = null;
  }

  public createNewDataset(event: {
    name: string;
    description: string;
    ownershipContext: 'PERSONAL' | 'TENANT' | 'TEAM';
  }): void {
    console.log('Creating new dataset:', event);

    // Determine the ownership context
    let ownershipContext: OwnershipContext;
    const loggedInUser = this.store.selectSnapshot(
      GlobalContextState.loggedInUser,
    );

    if (event.ownershipContext === 'PERSONAL') {
      ownershipContext = {
        Context: 'USER',
        ContextKey: loggedInUser?.UserId || 0, // Personal datasets use USER context with logged-in user ID
      };
    } else if (event.ownershipContext === 'TENANT') {
      ownershipContext = {
        Context: 'TENANT',
        ContextKey: this.currentSelectedTenantId || -1,
      };
    } else {
      ownershipContext = {
        Context: 'TEAM',
        ContextKey: this.currentSelectedTeamId || -1,
      };
    }

    // Validate that the name is not empty
    const trimmedName = event.name.trim();
    if (!trimmedName) {
      console.error('Cannot create dataset with empty name');
      return;
    }

    // Create root node - either from breakout data or new empty node
    let rootNode: TreeNode;

    if (this.breakoutNodeData) {
      // Use the breakout node data as the root, but update the name
      rootNode = {
        ...this.breakoutNodeData,
        name: trimmedName,
        depth: 0, // Ensure root depth is 0
      };
      console.log('Creating dataset from breakout node:', {
        originalNodeId: this.breakoutNodeData.id,
        newName: trimmedName,
        childrenCount: rootNode.children?.length || 0,
      });
    } else {
      // Create a simple root node for the new dataset
      rootNode = {
        id: 'root',
        name: trimmedName,
        children: [],
        depth: 0, // Initialize depth for root node
      };
    }

    // Generate a new FlowID (ensure it's unique and not conflicting with existing flows)
    const existingIds = this.decisionFlows
      .map((f) => f.FlowID || 0)
      .filter((id) => id > 0);
    const newFlowId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

    // Create the new DecisionFlow
    const newFlow: DecisionFlow = {
      FlowID: newFlowId,
      OwnershipContext: ownershipContext,
      FlowName: trimmedName,
      FlowDesc: event.description?.trim() || null,
      treeData: rootNode,
    };

    // Add the new flow to the state
    this.store.dispatch(new SketchActions.AddDecisionFlow(newFlow));

    console.log('New dataset created with details:', {
      flowId: newFlow.FlowID,
      flowName: newFlow.FlowName,
      ownershipContext: newFlow.OwnershipContext,
      rootNodeName: newFlow.treeData.name,
      rootNodeId: newFlow.treeData.id,
      hasChildren: newFlow.treeData.children?.length || 0,
    });

    // Close the dialog
    this.closeCreateDatasetDialog();

    // Select the newly created flow
    this.selectDecisionFlow(newFlow);
  }

  /**
   * Handle Breakout to New functionality
   * Creates a new dataset using the selected node and its children as the root
   */
  public onBreakoutToNew(): void {
    console.log('Breakout to New clicked');

    // Validate that we have a selected node with children
    if (!this.selectedNode || !this.selectedNodeHasChildren) {
      console.error(
        'Cannot breakout: No selected node or node has no children',
      );
      return;
    }

    // Get the selected node data
    const selectedNodeData = this.findNodeById(this.selectedNode);
    if (!selectedNodeData) {
      console.error('Cannot breakout: Selected node not found in tree data');
      return;
    }

    console.log('Breaking out node:', {
      nodeId: selectedNodeData.id,
      nodeName: selectedNodeData.name,
      hasChildren: selectedNodeData.children?.length || 0,
    });

    // Show the create dataset dialog for naming the new dataset
    this.showCreateDatasetDialog = true;

    // Store the node data for breakout (we'll need it after the dialog)
    this.breakoutNodeData = this.copyNodeWithChildren(selectedNodeData);
  }

  /**
   * Copy a node and all its children recursively
   */
  private copyNodeWithChildren(sourceNode: TreeNode): TreeNode {
    const copiedNode: TreeNode = {
      id: sourceNode.id,
      name: sourceNode.name,
      description: sourceNode.description,
      children:
        sourceNode.children?.map((child) => this.copyNodeWithChildren(child)) ||
        [],
      depth: 0, // Reset depth for the new root
    };

    // Update node IDs to be unique in the new tree
    this.reassignNodeIds(copiedNode);

    return copiedNode;
  }

  /**
   * Reassign node IDs to ensure uniqueness in the new tree
   */
  private reassignNodeIds(node: TreeNode, prefix = 'breakout'): void {
    // Generate a new unique ID based on timestamp and original ID
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    node.id = `${prefix}_${timestamp}_${randomSuffix}_${node.id}`;

    // Recursively update children
    if (node.children) {
      node.children.forEach((child) => this.reassignNodeIds(child, prefix));
    }
  }

  /**
   * Handle Promote Dataset functionality
   * Promotes dataset ownership context based on current context and user permissions
   */
  public onPromoteDataset(): void {
    if (!this.selectedContextDataset) {
      console.error('Cannot promote: No dataset selected');
      return;
    }

    const context = this.selectedContextDataset.OwnershipContext;

    // Determine promotion type and confirmation message
    if (context.Context === 'TEAM') {
      this.datasetConfirmationTitle = 'Promote Dataset';
      this.datasetConfirmationMessage =
        'Are you sure you want to promote this to a TENANT dataset? This is an administrator function.';
    } else if (context.Context === 'TENANT') {
      this.datasetConfirmationTitle = 'Promote Dataset';
      this.datasetConfirmationMessage =
        'Are you sure you want to promote this from a TENANT dataset to a SYSTEM dataset? This is an administrator function.';
    } else {
      console.error('Cannot promote: Dataset is not TEAM or TENANT level');
      return;
    }

    // Show confirmation dialog
    this.showPromoteDatasetDialog = true;
  }

  /**
   * Promote a dataset to a higher ownership context
   */
  private promoteDataset(
    flow: DecisionFlow,
    newContextName: 'TENANT' | 'SYSTEM',
  ): void {
    console.log('Promoting dataset:', {
      flowId: flow.FlowID,
      flowName: flow.FlowName,
      fromContext: flow.OwnershipContext,
      toContext: newContextName,
    });

    // Create updated ownership context
    let newOwnershipContext: OwnershipContext;

    if (newContextName === 'TENANT') {
      newOwnershipContext = {
        Context: 'TENANT',
        ContextKey: this.currentSelectedTenantId || -1,
      };
    } else {
      // SYSTEM
      newOwnershipContext = {
        Context: 'TENANT',
        ContextKey: -1, // System level is TENANT with Context -1
      };
    }

    // Update the flow's ownership context
    const updatedFlow: DecisionFlow = {
      ...flow,
      OwnershipContext: newOwnershipContext,
    };

    // Update in the state (this would be replaced with proper state management)
    const flowIndex = this.decisionFlows.findIndex(
      (f) => f.FlowID === flow.FlowID,
    );
    if (flowIndex >= 0) {
      this.decisionFlows[flowIndex] = updatedFlow;
      // Dispatch action to update global context state
      this.store.dispatch(new SetSelectedContextDataset(updatedFlow));

      console.log('Dataset promoted successfully:', {
        flowId: updatedFlow.FlowID,
        newContext: updatedFlow.OwnershipContext,
      });
    } else {
      console.error('Failed to find flow for promotion');
    }
  }

  /**
   * Handle confirmation for promote dataset dialog
   */
  public onPromoteDatasetConfirmed(confirmed: boolean): void {
    this.showPromoteDatasetDialog = false;

    if (confirmed && this.selectedContextDataset) {
      const context = this.selectedContextDataset.OwnershipContext;
      let newContext: 'TENANT' | 'SYSTEM' = 'TENANT';

      if (context.Context === 'TEAM') {
        newContext = 'TENANT';
      } else if (context.Context === 'TENANT') {
        newContext = 'SYSTEM';
      }

      this.promoteDataset(this.selectedContextDataset, newContext);
    }
  }

  /**
   * Handle Demote Dataset functionality
   * Demotes dataset ownership context based on current context and user permissions
   */
  public onDemoteDataset(): void {
    if (!this.selectedContextDataset) {
      console.error('Cannot demote: No dataset selected');
      return;
    }

    const context = this.selectedContextDataset.OwnershipContext;

    // Determine demotion type and confirmation message
    if (context.Context === 'TENANT' && context.ContextKey === -1) {
      this.datasetConfirmationTitle = 'Demote Dataset';
      this.datasetConfirmationMessage =
        'Are you sure you want to DEMOTE this from a SYSTEM dataset to a TENANT dataset? This is an administrator function.';
    } else if (context.Context === 'TENANT' && context.ContextKey !== -1) {
      // Check if a team is selected for TENANT -> TEAM demotion
      if (!this.currentSelectedTeamId || !this.selectedTeam?.TeamName) {
        this.datasetInfoTitle = 'Team Selection Required';
        this.datasetInfoMessage =
          'To demote a TENANT dataset to a team, you must have a team selected.';
        this.showDatasetInfoDialog = true;
        return;
      }
      this.datasetConfirmationTitle = 'Demote Dataset';
      this.datasetConfirmationMessage = `Are you sure you want to DEMOTE this to a TEAM dataset for ${this.selectedTeam.TeamName}? This is an administrator function.`;
    } else {
      console.error('Cannot demote: Dataset is not SYS or TENANT level');
      return;
    }

    // Show confirmation dialog
    this.showDemoteDatasetDialog = true;
  }

  /**
   * Demote a dataset to a lower ownership context
   */
  private demoteDataset(
    flow: DecisionFlow,
    newContextName: 'TENANT' | 'TEAM',
  ): void {
    console.log('Demoting dataset:', {
      flowId: flow.FlowID,
      flowName: flow.FlowName,
      fromContext: flow.OwnershipContext,
      toContext: newContextName,
    });

    // Create updated ownership context
    let newOwnershipContext: OwnershipContext;

    if (newContextName === 'TENANT') {
      newOwnershipContext = {
        Context: 'TENANT',
        ContextKey: this.currentSelectedTenantId || -1,
      };
    } else {
      // TEAM
      newOwnershipContext = {
        Context: 'TEAM',
        ContextKey: this.currentSelectedTeamId || -1,
      };
    }

    // Update the flow's ownership context
    const updatedFlow: DecisionFlow = {
      ...flow,
      OwnershipContext: newOwnershipContext,
    };

    // Update in the state (this would be replaced with proper state management)
    const flowIndex = this.decisionFlows.findIndex(
      (f) => f.FlowID === flow.FlowID,
    );
    if (flowIndex >= 0) {
      this.decisionFlows[flowIndex] = updatedFlow;
      // Dispatch action to update global context state
      this.store.dispatch(new SetSelectedContextDataset(updatedFlow));

      console.log('Dataset demoted successfully:', {
        flowId: updatedFlow.FlowID,
        newContext: updatedFlow.OwnershipContext,
      });
    } else {
      console.error('Failed to find flow for demotion');
    }
  }

  /**
   * Handle confirmation for demote dataset dialog
   */
  public onDemoteDatasetConfirmed(confirmed: boolean): void {
    this.showDemoteDatasetDialog = false;

    if (confirmed && this.selectedContextDataset) {
      const context = this.selectedContextDataset.OwnershipContext;
      let newContext: 'TENANT' | 'TEAM' = 'TENANT';

      if (context.Context === 'TENANT' && context.ContextKey === -1) {
        newContext = 'TENANT';
      } else if (context.Context === 'TENANT' && context.ContextKey !== -1) {
        newContext = 'TEAM';
      }

      this.demoteDataset(this.selectedContextDataset, newContext);
    }
  }

  /**
   * Handle Delete Dataset functionality
   * Deletes the selected dataset with appropriate role-based permissions
   */
  public onDeleteDataset(): void {
    if (!this.selectedContextDataset) {
      console.error('Cannot delete: No dataset selected');
      return;
    }

    this.datasetConfirmationTitle = 'Delete Dataset';
    this.datasetConfirmationMessage =
      'Deleting a dataset is unrecoverable. Are you sure you want to delete this dataset? This is an administrator function.';

    // Show confirmation dialog
    this.showDeleteDatasetDialog = true;
  }

  /**
   * Delete a dataset from the system
   */
  private deleteDataset(flow: DecisionFlow): void {
    console.log('Deleting dataset:', {
      flowId: flow.FlowID,
      flowName: flow.FlowName,
      context: flow.OwnershipContext,
    });

    // Remove the flow from the decisionFlows array
    const flowIndex = this.decisionFlows.findIndex(
      (f) => f.FlowID === flow.FlowID,
    );
    if (flowIndex >= 0) {
      // Remove the dataset from the array
      this.decisionFlows.splice(flowIndex, 1);

      // Clear the selected dataset if it was the one being deleted
      if (this.selectedContextDataset?.FlowID === flow.FlowID) {
        // Dispatch action to clear global context state
        this.store.dispatch(new SetSelectedContextDataset(null));
      }

      console.log('Dataset deleted successfully:', {
        flowId: flow.FlowID,
        remainingDatasets: this.decisionFlows.length,
      });
    } else {
      console.error('Failed to find flow for deletion');
    }
  }

  /**
   * Handle confirmation for delete dataset dialog
   */
  public onDeleteDatasetConfirmed(confirmed: boolean): void {
    this.showDeleteDatasetDialog = false;

    if (confirmed && this.selectedContextDataset) {
      this.deleteDataset(this.selectedContextDataset);
    }
  }

  /**
   * Validate if the currently selected dataset is still available in the current context
   * Clear it if it's no longer accessible due to tenant/team context changes
   */
  private validateSelectedDatasetForContext(): void {
    if (!this.selectedContextDataset?.OwnershipContext) {
      // Legacy datasets without ownership context are considered system datasets (always available)
      return;
    }

    const context = this.selectedContextDataset.OwnershipContext;
    let isAvailable = false;

    switch (context.Context) {
      case 'USER':
        // User datasets - would need user ID check
        isAvailable = true; // For now, show all user datasets
        break;
      case 'TENANT':
        if (context.ContextKey === -1) {
          isAvailable = true; // System datasets (TENANT -1) are always available
        } else {
          isAvailable = context.ContextKey === this.currentSelectedTenantId;
        }
        break;
      case 'TEAM':
        isAvailable = context.ContextKey === this.currentSelectedTeamId;
        break;
      default:
        isAvailable = false;
    }

    if (!isAvailable) {
      console.log('🔄 Clearing selected dataset due to context change:', {
        dataset: this.selectedContextDataset.FlowName,
        context: context,
        currentTenant: this.currentSelectedTenantId,
        currentTeam: this.currentSelectedTeamId,
      });
      // Dispatch action to clear global context state
      this.store.dispatch(new SetSelectedContextDataset(null));
    }
  }

  /**
   * Handle dataset info dialog close
   */
  public onDatasetInfoDialogClosed(): void {
    this.showDatasetInfoDialog = false;
  }

  /**
   * Handle confirmation for lesson action dialog (delete/promote/demote)
   */
  public onDeleteLessonConfirmed(confirmed: boolean): void {
    this.showDeleteLessonDialog = false;

    if (confirmed && this.selectedLesson) {
      const lessonName = this.selectedLesson.LessonName;

      switch (this.lessonConfirmationAction) {
        case 'delete':
          // Dispatch action to remove lesson from NGXS state
          this.store.dispatch(new RemoveLesson(lessonName));
          console.log(`Deleted lesson: ${lessonName}`);
          break;

        case 'promote':
          this.executeLessonPromotion();
          break;

        case 'demote':
          this.executeLessonDemotion();
          break;
      }
    }
  }

  /**
   * Execute lesson promotion logic
   */
  private executeLessonPromotion(): void {
    if (!this.selectedLesson || !this.selectedLesson.OwnershipContext) {
      return;
    }

    const context = this.selectedLesson.OwnershipContext.Context;
    const updatedLesson = { ...this.selectedLesson };

    if (context === 'TEAM') {
      // Promote from TEAM to TENANT
      updatedLesson.OwnershipContext = {
        Context: 'TENANT',
        ContextKey: this.currentSelectedTenantId || -1,
      };
      console.log(
        `Promoted lesson "${updatedLesson.LessonName}" from TEAM to TENANT`,
      );
    } else if (context === 'TENANT') {
      // Promote from TENANT to SYSTEM (TENANT with Context -1)
      updatedLesson.OwnershipContext = {
        Context: 'TENANT',
        ContextKey: -1,
      };
      console.log(
        `Promoted lesson "${updatedLesson.LessonName}" from TENANT to SYSTEM`,
      );
    }

    // Update lesson in state
    this.store.dispatch(new UpdateLesson(updatedLesson));
  }

  /**
   * Execute lesson demotion logic
   */
  private executeLessonDemotion(): void {
    if (!this.selectedLesson || !this.selectedLesson.OwnershipContext) {
      return;
    }

    const ownershipContext = this.selectedLesson.OwnershipContext;
    const updatedLesson = { ...this.selectedLesson };

    if (
      ownershipContext.Context === 'TENANT' &&
      ownershipContext.ContextKey === -1
    ) {
      // Demote from SYSTEM (TENANT -1) to TENANT
      updatedLesson.OwnershipContext = {
        Context: 'TENANT',
        ContextKey: this.currentSelectedTenantId || -1,
      };
      console.log(
        `Demoted lesson "${updatedLesson.LessonName}" from SYSTEM to TENANT`,
      );
    } else if (
      ownershipContext.Context === 'TENANT' &&
      ownershipContext.ContextKey !== -1
    ) {
      // Demote from TENANT to TEAM
      updatedLesson.OwnershipContext = {
        Context: 'TEAM',
        ContextKey: this.currentSelectedTeamId || -1,
      };
      console.log(
        `Demoted lesson "${updatedLesson.LessonName}" from TENANT to TEAM`,
      );
    }

    // Update lesson in state
    this.store.dispatch(new UpdateLesson(updatedLesson));
  }

  /**
   * Handle combine datasets action
   */
  public onCombineDatasets(): void {
    this.showCombineDatasetsDialog = true;
  }

  /**
   * Handle combine datasets confirmation
   */
  public onCombineDatasetsConfirmed(result: CombineDatasetsResult): void {
    this.showCombineDatasetsDialog = false;

    if (
      result &&
      result.selectedDatasets &&
      result.selectedDatasets.length >= 2
    ) {
      this.combineDatasets(result);
    }
  }

  /**
   * Handle combine datasets dialog cancel
   */
  public onCombineDatasetsCancel(): void {
    this.showCombineDatasetsDialog = false;
  }

  /**
   * Handle edit dataset action
   */
  public onEditDataset(dataset: DecisionFlow): void {
    this.editDatasetTarget = dataset;
    this.showEditDatasetDialog = true;
  }

  /**
   * Handle edit dataset confirmation
   */
  public onEditDatasetConfirmed(result: EditDatasetResult): void {
    this.showEditDatasetDialog = false;
    this.editDatasetTarget = null;

    if (result && result.dataset) {
      this.updateDataset(result);
    }
  }

  /**
   * Handle edit dataset dialog cancel
   */
  public onEditDatasetCancel(): void {
    this.showEditDatasetDialog = false;
    this.editDatasetTarget = null;
  }

  /**
   * Update dataset name and description
   */
  private updateDataset(result: EditDatasetResult): void {
    console.log('Updating dataset:', {
      dataset: result.dataset,
      newName: result.newName,
      newDescription: result.newDescription,
    });

    try {
      // Update the dataset via state management
      this.store.dispatch(
        new SketchActions.UpdateDecisionFlow(result.dataset.FlowID, {
          FlowName: result.newName,
          FlowDesc: result.newDescription,
        }),
      );

      console.log(
        `✅ Successfully updated dataset ${result.dataset.FlowID}: "${result.newName}"`,
      );
    } catch (error) {
      console.error('❌ Error updating dataset:', error);
    }
  }

  /**
   * Combine multiple datasets into a new dataset
   */
  private combineDatasets(result: CombineDatasetsResult): void {
    console.log('Combining datasets:', {
      name: result.name,
      description: result.description,
      ownershipContext: result.ownershipContext,
      selectedDatasets: result.selectedDatasets.map((ds: DecisionFlow) => ({
        id: ds.FlowID,
        name: ds.FlowName,
      })),
    });

    // Get next available FlowID
    const maxFlowId = Math.max(
      ...this.decisionFlows.map((flow) => flow.FlowID || 0),
    );
    const newFlowId = maxFlowId + 1;

    // Create new root node
    const newRootNode: TreeNode = {
      id: '1',
      name: result.name,
      description: result.description || '',
      children: [],
    };

    // Get next available node ID for child nodes
    let nextNodeId = 2;

    // Process each selected dataset
    result.selectedDatasets.forEach((dataset: DecisionFlow, index: number) => {
      if (dataset.treeData) {
        // Create a copy of the dataset's root as a child of the new root
        const childNode: TreeNode = {
          id: nextNodeId.toString(),
          name: dataset.treeData.name,
          description: dataset.treeData.description || '',
          children: this.copyTreeNodeChildren(dataset.treeData, nextNodeId + 1),
        };

        // Update nextNodeId based on how many nodes were processed
        nextNodeId = this.getNextNodeIdAfterTreeCopy(
          dataset.treeData,
          nextNodeId + 1,
        );

        newRootNode.children!.push(childNode);
      } else {
        // If dataset has no tree data, create a simple node
        const childNode: TreeNode = {
          id: nextNodeId.toString(),
          name: dataset.FlowName || `Dataset ${index + 1}`,
          description: dataset.FlowDesc || '',
          children: [],
        };
        nextNodeId++;
        newRootNode.children!.push(childNode);
      }
    });

    // Create the new DecisionFlow
    const newDecisionFlow: DecisionFlow = {
      FlowID: newFlowId,
      FlowName: result.name,
      FlowDesc: result.description,
      OwnershipContext: result.ownershipContext,
      treeData: newRootNode,
    };

    // Add to the decision flows array
    this.decisionFlows.push(newDecisionFlow);

    // Select the new dataset
    // Dispatch action to update global context state
    this.store.dispatch(new SetSelectedContextDataset(newDecisionFlow));

    console.log('Combined dataset created successfully:', {
      flowId: newDecisionFlow.FlowID,
      totalNodes: this.countTreeNodes(newDecisionFlow.treeData),
      combinedFrom: result.selectedDatasets.length,
    });
  }

  /**
   * Recursively copy tree node children with renumbered IDs
   */
  private copyTreeNodeChildren(
    parentNode: TreeNode,
    startingId: number,
  ): TreeNode[] {
    const children: TreeNode[] = [];
    let currentId = startingId;

    if (parentNode.children && parentNode.children.length > 0) {
      parentNode.children.forEach((childNode: TreeNode) => {
        const newChildNode: TreeNode = {
          id: currentId.toString(),
          name: childNode.name,
          description: childNode.description || '',
          children: this.copyTreeNodeChildren(childNode, currentId + 1),
        };

        // Update currentId based on how many descendant nodes were processed
        currentId = this.getNextNodeIdAfterTreeCopy(childNode, currentId + 1);

        children.push(newChildNode);
      });
    }

    return children;
  }

  /**
   * Calculate the next available node ID after copying a tree node and its descendants
   */
  private getNextNodeIdAfterTreeCopy(
    node: TreeNode,
    startingId: number,
  ): number {
    let nextId = startingId;

    if (node.children && node.children.length > 0) {
      node.children.forEach((child: TreeNode) => {
        nextId = this.getNextNodeIdAfterTreeCopy(child, nextId + 1);
      });
    }

    return nextId;
  }

  // Default Team Groups counting methods
  public getSystemGroupsCount(): number {
    return this.defaultTeamGroups.filter(
      (group) =>
        (group.OwnershipContext.Context === 'TENANT' &&
          group.OwnershipContext.ContextKey === -1) ||
        group.IsSystemDefault,
    ).length;
  }

  public getOrganizationalGroupsCount(): number {
    // Use current selected organization or selected team's organization
    const orgId = this.currentSelectedTenantId || this.selectedTeam?.TenantID;

    if (!orgId) {
      // If no organization selected, count all organizational groups
      return this.defaultTeamGroups.filter(
        (group) => group.OwnershipContext.Context === 'TENANT',
      ).length;
    }

    // Count organizational groups for the selected organization
    return this.defaultTeamGroups.filter(
      (group) =>
        group.OwnershipContext.Context === 'TENANT' &&
        group.OwnershipContext.ContextKey === orgId,
    ).length;
  }

  // Toolbar expand/collapse toggle methods
  public toggleTeamsExpanded(): void {
    this.teamsExpanded = !this.teamsExpanded;
  }

  public toggleTenancyExpanded(): void {
    this.tenancyExpanded = !this.tenancyExpanded;
  }

  public debugLogState(): void {
    console.log('====== DEBUG: TOOLBAR VISIBILITY STATE ======');
    console.log(
      'Current NGXS state:',
      this.store.selectSnapshot(SketchState.getToolbarVisibility),
    );
    console.log('Current toolbarVisibility property:', this.toolbarVisibility);
    console.log('localStorage keys:', Object.keys(localStorage));
    const ngsxStorageKey = Object.keys(localStorage).find((k) =>
      k.includes('@@NGXS'),
    );
    if (ngsxStorageKey) {
      const stored = JSON.parse(localStorage.getItem(ngsxStorageKey) || '{}');
      console.log(
        `NGXS Storage (${ngsxStorageKey}):`,
        stored.sketch?.toolbarVisibility,
      );
    }
    console.log('=========================================');
  }

  public toggleLoginDrawer(): void {
    this.drawerManager.toggle('login');
  }

  public closeLoginDrawer(): void {
    this.drawerManager.close('login');
  }

  public onUserSelected(user: User): void {
    // Handle user "login" selection
    if (user) {
      this.selectedUserId = user.UserId;
      console.log('🔐 Mock login as user:', user);

      // Fetch the user with tenants populated based on mockTenantConfig
      this.mockUserService
        .getUserWithTenants(user.UserId)
        .subscribe((populatedUser) => {
          if (!populatedUser) {
            console.error('❌ User not found');
            return;
          }

          console.log('✅ User with populated tenants:', populatedUser);
          console.log('📋 mockTenantConfig:', populatedUser.mockTenantConfig);
          console.log('🏢 Populated Tenants:', populatedUser.Tenants);

          // Update the organizations list to show only this user's tenants
          if (populatedUser.Tenants && populatedUser.Tenants.length > 0) {
            this.organizations = populatedUser.Tenants;
            console.log(
              `✅ Updated organizations list with ${this.organizations.length} tenants for user ${populatedUser.UserId}:`,
            );
            this.organizations.forEach((org, idx) => {
              console.log(
                `  ${idx + 1}. ${org.TenantName} (ID: ${org.TenantID})`,
              );
            });
          } else {
            // User has no tenants, clear the list
            this.organizations = [];
            console.warn(`⚠️ User ${populatedUser.UserId} has no tenants`);
          }

          // Check if user has LastSelectedContextTenant and LastSelectedContextUser
          if (
            populatedUser.LastSelectedContextTenant &&
            populatedUser.LastSelectedContextUser &&
            populatedUser.Tenants
          ) {
            const lastTenant = populatedUser.Tenants.find(
              (t) => t.TenantID === populatedUser.LastSelectedContextTenant,
            );

            if (lastTenant) {
              // Find the context user (could be logged-in user or another related user)
              let contextUser: User | null = null;

              if (
                populatedUser.LastSelectedContextUser === populatedUser.UserId
              ) {
                contextUser = populatedUser;
              } else {
                // Look for the context user in the tenant's related users
                const relatedUser = lastTenant.Relatives?.find(
                  (r) => r.UserId === populatedUser.LastSelectedContextUser,
                );
                if (relatedUser) {
                  // Use the related user directly (it's already a User object)
                  contextUser = relatedUser;
                }
              }

              if (contextUser) {
                // Auto-select the last context with available tenants
                this.store.dispatch(
                  new InitializeGlobalContext(
                    populatedUser,
                    lastTenant,
                    contextUser,
                    undefined,
                    populatedUser.Tenants || [],
                  ),
                );
                console.log('Auto-selected last context:', {
                  tenant: lastTenant.TenantName,
                  contextUser: `${contextUser.FirstName} ${contextUser.LastName}`,
                });
                return;
              }
            }
          }

          // No valid last selected context, set logged in user and available tenants
          console.log('🚀 Dispatching SetLoggedInUser:', {
            user: `${populatedUser.FirstName} ${populatedUser.LastName}`,
            userId: populatedUser.UserId,
            availableTenants: populatedUser.Tenants?.length || 0,
          });
          this.store.dispatch(
            new SetLoggedInUser(populatedUser, populatedUser.Tenants || []),
          );

          // Trigger change detection to ensure organizations list is updated
          this.safeDetectChanges();

          // Close login drawer
          this.closeLoginDrawer();

          // Handle tenant selection based on number of available tenants
          const tenantCount = populatedUser.Tenants?.length || 0;

          if (tenantCount === 0) {
            console.warn('⚠️ User has no available tenants');
            // User has no tenants, no action needed
          } else if (tenantCount === 1) {
            // Only one tenant, automatically select it
            const singleTenant = populatedUser.Tenants![0];
            console.log(
              `✅ Auto-selecting single tenant: ${singleTenant.TenantName}`,
            );

            // Set the selected tenant
            this.store.dispatch(new SetSelectedContextTenant(singleTenant));

            // Check if we need to show player selection for this tenant
            this.onTenancyOrganizationSelected(singleTenant.TenantID);
          } else {
            // Multiple tenants, open tenant selection drawer
            console.log(
              `🚪 Opening tenant drawer to select from ${tenantCount} tenants`,
            );
            this.toggleTenantDrawer();
          }
        });
    }
  }

  public toggleTenantDrawer(): void {
    this.drawerManager.toggle('tenant');
  }

  public closeTenantDrawer(): void {
    this.drawerManager.close('tenant');
  }

  public toggleContextDrawer(): void {
    this.drawerManager.toggle('context');
  }

  public closeContextDrawer(): void {
    this.drawerManager.close('context');
  }

  public togglePlayerSelectionDrawer(): void {
    this.drawerManager.toggle('playerSelection');
  }

  public closePlayerSelectionDrawer(): void {
    this.drawerManager.close('playerSelection');
  }

  public toggleSubscriptionDrawer(): void {
    this.drawerManager.toggle('subscription');
  }

  public closeSubscriptionDrawer(): void {
    this.drawerManager.close('subscription');
  }

  public toggleAssignedLessonsDrawer(): void {
    this.drawerManager.toggle('assignedLessons');
  }

  public closeAssignedLessonsDrawer(): void {
    this.drawerManager.close('assignedLessons');
  }

  public toggleToDoDrawer(): void {
    this.drawerManager.toggle('toDo');
  }

  public closeToDoDrawer(): void {
    this.drawerManager.close('toDo');
  }

  /**
   * Get count of lessons that are due today or overdue (and not completed)
   */
  get overdueLessonsCount(): number {
    const tenant = this.store.selectSnapshot(
      GlobalContextState.selectedContextTenant,
    );
    if (!tenant?.assignedLessons) {
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tenant.assignedLessons.filter((lesson) => {
      if (lesson.status === 'COMPLETED' || !lesson.dueDate) {
        return false;
      }
      const dueDate = new Date(lesson.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate <= today;
    }).length;
  }

  public toggleTeamsDrawer(): void {
    this.drawerManager.toggle('teams');
  }

  public closeTeamsDrawer(): void {
    this.drawerManager.close('teams');
  }

  public toggleTeamGroupsDrawer(): void {
    if (!this.selectedTeam) {
      this.messageDialogTitle = 'No Team Selected';
      this.messageDialogMessage =
        'Please select a team first to manage team groups.';
      this.messageDialogIcon = '⚠️';
      this.showMessageDialog = true;
      return;
    }
    this.drawerManager.toggle('teamGroups');
  }

  public closeTeamGroupsDrawer(): void {
    this.drawerManager.close('teamGroups');
  }

  public closeDatasetsDrawer(): void {
    this.drawerManager.close('datasets');
  }

  public toggleDatasetsDrawer(): void {
    this.drawerManager.toggle('datasets');
  }

  public closeLessonBuilderDrawer(): void {
    this.drawerManager.close('lessonBuilder');
  }

  public toggleLessonBuilderDrawer(): void {
    this.drawerManager.toggle('lessonBuilder');
  }

  public onSelectTeamFromDrawer(team: any): void {
    // Handle team selection/deselection from the teams drawer
    console.log('📥 Parent received team selection event:', {
      team: team,
      teamID: team?.TeamID,
      teamName: team?.TeamName,
      isNull: team === null,
    });

    if (team) {
      // Use NGXS GlobalContext to set the selected team
      console.log(
        '🎯 Dispatching SetSelectedContextTeam with team:',
        team.TeamName,
      );
      this.store.dispatch(new SetSelectedContextTeam(team));
    } else {
      // Deselect team
      console.log('🎯 Dispatching SetSelectedContextTeam with null (deselect)');
      this.store.dispatch(new SetSelectedContextTeam(null));
    }
  }

  public onSelectTeamGroupFromDrawer(teamGroup: ITeamGroup | null): void {
    // Handle team group selection/deselection from the team groups drawer
    if (teamGroup) {
      // Use NGXS GlobalContext to set the selected team group
      this.store.dispatch(new SetSelectedContextTeamGroup(teamGroup));
      console.log('Team group selected from drawer:', teamGroup);
    } else {
      // Deselect team group
      this.store.dispatch(new SetSelectedContextTeamGroup(null));
      console.log('Team group deselected from drawer');
    }
  }

  public onAddTeam(): void {
    console.log('Add team requested from drawer');
    // TODO: Open add team dialog
  }

  public toggleTeamRosterExpanded(): void {
    this.teamRosterExpanded = !this.teamRosterExpanded;
  }

  public toggleTeamGroupMembersExpanded(): void {
    this.teamGroupMembersExpanded = !this.teamGroupMembersExpanded;
  }

  public toggleSelectionsExpanded(): void {
    this.selectionsExpanded = !this.selectionsExpanded;
  }

  public onNodeViewerToggleExpanded(): void {
    // Node Viewer is always expanded for now - could add state later if needed
    console.log('Node Viewer toggle expanded called');
  }

  public onLessonViewerToggleExpanded(): void {
    // Lesson Viewer is always expanded for now - could add state later if needed
    console.log('Lesson Viewer toggle expanded called');
  }

  public onLessonViewerNodeSelected(nodeId: string): void {
    // When lesson runner selects a node, update the main selectedNode and pan to it
    this.selectedNode = nodeId;
    this.updateNodeSelectionVisuals();
    this.panToNodeById(nodeId);
  }

  public onTechniqueExplorerToggleExpanded(): void {
    // Technique Explorer is always expanded for now - could add state later if needed
    console.log('Technique Explorer toggle expanded called');
  }

  public onTechniqueExplorerNodeSelected(event: any): void {
    // Delegate to the original node viewer method for exploratory functionality
    this.onNodeViewerNodeSelected(event);
  }

  public onTechniqueExplorerSurveyResponse(response: any): void {
    // Handle technique explorer survey responses
    console.log('Technique Explorer survey response:', response);
    this.onLessonSurveyResponse(response);
  }

  // Helper methods to determine which viewer toolbar to show/use
  private shouldShowLessonViewer(): boolean {
    return this.selectedLesson !== null;
  }

  private shouldShowTechniqueExplorer(): boolean {
    return this.selectedLesson === null;
  }

  private getDefaultToolbarPosition(
    type: string,
  ): { x: number; y: number } | null {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    switch (type) {
      case 'lessonViewer':
        // Position lesson viewer on the left side
        return { x: 50, y: 200 };
      case 'techniqueExplorer':
        // Position technique explorer on the right side
        return { x: windowWidth - 450, y: 200 };
      default:
        return null;
    }
  }

  private autoShowAppropriateViewer(): void {
    if (this.shouldShowLessonViewer()) {
      if (!this.getToolbarVisibility('lessonViewer')) {
        this.toggleToolbarVisibility('lessonViewer');
      }
    } else if (this.shouldShowTechniqueExplorer()) {
      if (!this.getToolbarVisibility('techniqueExplorer')) {
        this.toggleToolbarVisibility('techniqueExplorer');
      }
    }
  }

  public toggleLessonsExpanded(): void {
    this.lessonsExpanded = !this.lessonsExpanded;
  }

  public toggleQuickNavExpanded(): void {
    this.quickNavExpanded = !this.quickNavExpanded;
  }

  public toggleSearchExpanded(): void {
    this.searchExpanded = !this.searchExpanded;
  }

  public toggleImportExportExpanded(): void {
    this.importExportExpanded = !this.importExportExpanded;
  }

  public onQuickNavNodeSelected(nodeId: string): void {
    // Prevent infinite loops by checking if this is already the selected node
    if (this.selectedNode === nodeId) {
      return;
    }

    console.log(`Quick-Nav selected node: ${nodeId}`);
    // Update the selected node in the main visualization
    this.selectedNode = nodeId;
    this.updateSingleNodeSelection();
  }

  public onSearchNodeSelected(nodeId: string): void {
    // Prevent infinite loops by checking if this is already the selected node
    if (this.selectedNode === nodeId) {
      return;
    }

    console.log(`Search selected node: ${nodeId}`);
    // Update the selected node in the main visualization
    this.selectedNode = nodeId;
    this.updateSingleNodeSelection();

    // Always pan to node when selected from search results
    this.panToNodeById(nodeId);
  }

  public onSearchNodeToggleSelection(nodeId: string): void {
    console.log(`Search toggle selection for node: ${nodeId}`);
    // Toggle multi-selection for shift+click from search results
    this.addNodeToSelection(nodeId);
  }

  public onNodeViewerNodeSelected(nodeId: string): void {
    console.log(`Node Viewer navigation to node: ${nodeId}`);
    // Set the selected node and pan to it
    this.selectedNode = nodeId;
    this.updateSingleNodeSelection();
    this.panToNodeById(nodeId);
  }

  public onQuickNavNodeToggleSelection(nodeId: string): void {
    // Toggle multi-selection for shift+click
    this.toggleNodeSelection(nodeId);
  }

  public trackByGroupId(index: number, group: IDefaultTeamGroup): number {
    return group.TeamGroupID;
  }

  public getOwnershipLabel(ownership: OwnershipContext): string {
    switch (ownership.Context) {
      case 'USER':
        return 'User';
      case 'TENANT':
        if (ownership.ContextKey === -1) {
          return 'System';
        }
        const org = this.organizations.find(
          (o) => o.TenantID === ownership.ContextKey,
        );
        return org ? `Org: ${org.TenantName}` : 'Organization';
      case 'TEAM':
        return 'Team';
      default:
        return 'Unknown';
    }
  }

  public getOrganizationName(orgId: number): string {
    const org = this.organizations.find((o) => o.TenantID === orgId);
    return org ? org.TenantName : 'Unknown Organization';
  }

  public onDefaultGroupOwnershipChange(): void {
    // Clear organization selection when switching away from TENANT level
    if (this.defaultGroupFormOwnership !== 'TENANT') {
      this.defaultGroupFormTenantId = null;
    }
  }

  public createDefaultTeamGroup(): void {
    this.defaultTeamGroupsEditing = true;
    this.defaultGroupFormName = '';
    this.defaultGroupFormOwnership = 'TEAM';
    this.defaultGroupFormTenantId = null;
    this.defaultGroupFormMatchingPositions = '';
    this.defaultGroupFormMatchingNumbers = '';
    this.selectedDefaultTeamGroup = null;
  }

  public editDefaultTeamGroup(group: IDefaultTeamGroup): void {
    this.defaultTeamGroupsEditing = true;
    this.selectedDefaultTeamGroup = group;
    this.defaultGroupFormName = group.TeamGroupName;
    this.defaultGroupFormOwnership = group.OwnershipContext.Context;
    this.defaultGroupFormTenantId =
      group.OwnershipContext.Context === 'TENANT'
        ? group.OwnershipContext.ContextKey
        : null;
    this.defaultGroupFormMatchingPositions = group.MatchingPositions.join(', ');
    this.defaultGroupFormMatchingNumbers =
      group.MatchingPositionNumbers.join(', ');
  }

  public saveDefaultTeamGroup(): void {
    if (!this.defaultGroupFormName?.trim()) return;

    // Validate organization selection for TENANT level
    if (
      this.defaultGroupFormOwnership === 'TENANT' &&
      !this.defaultGroupFormTenantId
    ) {
      alert(
        'Please select an organization for organization-level default team groups.',
      );
      return;
    }

    // Check if we're trying to move a system default group to system level
    // System level is now TENANT with Context -1
    const isSystemLevel =
      this.defaultGroupFormOwnership === 'TENANT' &&
      !this.defaultGroupFormTenantId;
    if (
      this.selectedDefaultTeamGroup &&
      this.selectedDefaultTeamGroup.IsSystemDefault &&
      isSystemLevel
    ) {
      this.showSystemDefaultWarning();
      return;
    }

    const matchingPositions = this.defaultGroupFormMatchingPositions
      .split(',')
      .map((pos) => pos.trim())
      .filter((pos) => pos.length > 0);

    const matchingNumbers = this.defaultGroupFormMatchingNumbers
      .split(',')
      .map((num) => parseInt(num.trim()))
      .filter((num) => !isNaN(num) && num >= 1 && num <= 11);

    let contextValue = -1; // Default to system level (-1)
    if (
      this.defaultGroupFormOwnership === 'TENANT' &&
      this.defaultGroupFormTenantId
    ) {
      contextValue = this.defaultGroupFormTenantId;
    } else if (this.defaultGroupFormOwnership === 'TEAM' && this.selectedTeam) {
      contextValue = this.selectedTeam.TeamID;
    }

    if (this.selectedDefaultTeamGroup) {
      // Edit existing group
      this.selectedDefaultTeamGroup.TeamGroupName =
        this.defaultGroupFormName.trim();
      this.selectedDefaultTeamGroup.OwnershipContext = {
        Context: this.defaultGroupFormOwnership,
        ContextKey: contextValue,
      };
      this.selectedDefaultTeamGroup.MatchingPositions = matchingPositions;
      this.selectedDefaultTeamGroup.MatchingPositionNumbers = matchingNumbers;
    } else {
      // Create new group
      const newGroup: IDefaultTeamGroup = {
        TeamGroupID: this.defaultTeamGroupsService.generateNewTeamGroupId(),
        OwnershipContext: {
          Context: this.defaultGroupFormOwnership,
          ContextKey: contextValue,
        },
        TeamGroupName: this.defaultGroupFormName.trim(),
        Players: [], // Empty template
        MatchingPositions: matchingPositions,
        MatchingPositionNumbers: matchingNumbers,
        IsSystemDefault:
          this.defaultGroupFormOwnership === 'TENANT' && contextValue === -1,
      };
      this.defaultTeamGroupsService.addDefaultTeamGroup(newGroup);
    }

    this.cancelDefaultTeamGroupEdit();
    console.log('Default team group saved:', this.defaultGroupFormName);
  }

  public cancelDefaultTeamGroupEdit(): void {
    this.defaultTeamGroupsEditing = false;
    this.selectedDefaultTeamGroup = null;
    this.defaultGroupFormName = '';
    this.defaultGroupFormOwnership = 'TEAM';
    this.defaultGroupFormMatchingPositions = '';
    this.defaultGroupFormMatchingNumbers = '';
  }

  public copySystemDefaultAsTemplate(): void {
    if (!this.selectedDefaultTeamGroup) return;

    // Create a copy with organization ownership
    this.defaultGroupFormName = `Copy of ${this.selectedDefaultTeamGroup.TeamGroupName}`;
    this.defaultGroupFormOwnership = 'TENANT';
    // Keep the existing positions and numbers
    this.selectedDefaultTeamGroup = null; // Clear selection to indicate we're creating new

    console.log('Created copy template from system default');
  }

  public deleteDefaultTeamGroup(group: IDefaultTeamGroup): void {
    if (group.IsSystemDefault) {
      console.warn('Cannot delete system default group');
      return;
    }

    if (
      this.defaultTeamGroupsService.deleteDefaultTeamGroup(group.TeamGroupID)
    ) {
      if (this.selectedDefaultTeamGroup === group) {
        this.selectedDefaultTeamGroup = null;
      }
      console.log('Deleted default team group:', group.TeamGroupName);
    }
  }

  public applyDefaultGroupToTeam(): void {
    if (!this.selectedDefaultTeamGroup || !this.selectedTeam) return;

    // Create a new team group based on the default template
    const newTeamGroup: ITeamGroup = {
      TeamGroupID: this.generateNewTeamGroupId(),
      OwnershipContext: {
        Context: 'TEAM',
        ContextKey: this.selectedTeam.TeamID,
      },
      TeamGroupName: this.selectedDefaultTeamGroup.TeamGroupName,
      Players: [], // Start empty - user can add players
      MatchingPositions: [...this.selectedDefaultTeamGroup.MatchingPositions],
      MatchingPositionNumbers: [
        ...this.selectedDefaultTeamGroup.MatchingPositionNumbers,
      ],
    };

    // Add to the selected team
    this.selectedTeam.TeamGroups.push(newTeamGroup);

    console.log(
      'Applied default group template to team:',
      this.selectedDefaultTeamGroup.TeamGroupName,
      'for team:',
      this.selectedTeam.TeamName,
    );
  }

  // Debug method to check state persistence
  public debugCurrentState(): void {
    const stateSnapshot = this.store.snapshot();
    console.log('=== CURRENT STATE DEBUG ===');
    console.log('NgXS State:', stateSnapshot);
    console.log('Component State:');
    console.log('- currentSelectedTenantId:', this.currentSelectedTenantId);
    console.log('- currentSelectedTeamId:', this.currentSelectedTeamId);
    console.log(
      '- currentSelectedTeamGroupId:',
      this.currentSelectedTeamGroupId,
    );

    // Check all localStorage keys related to state

    // Check the observable values directly
    console.log('Observable Values:');
    console.log(
      '- selectedOrganizationId$ current:',
      this.store.selectSnapshot(GlobalContextState.contextTenantId),
    );
    console.log(
      '- selectedTeamId$ current:',
      this.store.selectSnapshot(GlobalContextState.contextTeamId),
    );
    console.log(
      '- selectedTeamGroupId$ current:',
      this.store.selectSnapshot(GlobalContextState.contextTeamGroupId),
    );

    console.log('Selected Objects:');
    console.log('Selected Team Object:', this.selectedTeam);
    console.log('Selected TeamGroup Object:', this.selectedTeamGroup);
    console.log(
      'Available Organizations:',
      this.organizations.map((o) => ({ id: o.TenantID, name: o.TenantName })),
    );
    console.log('========================');
  }

  // Test method to manually set organization for testing persistence
  public testSetOrganization(orgId: number): void {
    console.log('TEST: Setting organization to:', orgId);
    this.store.dispatch(new SetSelectedTenant(orgId));

    setTimeout(() => {
      console.log(
        'TEST: After setting, current state:',
        this.currentSelectedTenantId,
      );
      console.log(
        'TEST: LocalStorage now contains:',
        localStorage.getItem('@@STATE:teamSelection'),
      );
      console.log(
        'TEST: Organization 0 check - is it falsy?',
        !this.currentSelectedTenantId,
      );
      console.log(
        'TEST: Organization 0 check - is it === 0?',
        this.currentSelectedTenantId === 0,
      );
      console.log(
        'TEST: Organization 0 check - is it !== null?',
        this.currentSelectedTenantId !== null,
      );
    }, 200);
  }

  // Test method specifically for organization 0
  public testSetOrganization0(): void {
    console.log('TEST: Specifically testing organization 0 (Personal)');
    this.testSetOrganization(0);
  }

  // Check dropdown values vs component state
  public debugDropdownValues(): void {
    console.log('=== DROPDOWN DEBUG ===');
    console.log('Component State:');
    console.log('- currentSelectedTenantId:', this.currentSelectedTenantId);
    console.log('- currentSelectedTeamId:', this.currentSelectedTeamId);
    console.log(
      '- currentSelectedTeamGroupId:',
      this.currentSelectedTeamGroupId,
    );

    // Check actual DOM values
    const orgSelect = document.getElementById(
      'organization-select',
    ) as HTMLSelectElement;
    const teamSelect = document.getElementById(
      'team-select',
    ) as HTMLSelectElement;
    const teamGroupSelect = document.getElementById(
      'team-group-select',
    ) as HTMLSelectElement;

    console.log('DOM Values:');
    console.log('- organization dropdown value:', orgSelect?.value);
    console.log('- team dropdown value:', teamSelect?.value);
    console.log('- teamGroup dropdown value:', teamGroupSelect?.value);

    console.log('Binding Expressions:');
    console.log(
      '- org binding result:',
      this.currentSelectedTenantId !== null ? this.currentSelectedTenantId : '',
    );
    console.log(
      '- team binding result:',
      this.currentSelectedTeamId !== null ? this.currentSelectedTeamId : '',
    );
    console.log(
      '- teamGroup binding result:',
      this.currentSelectedTeamGroupId !== null
        ? this.currentSelectedTeamGroupId
        : '',
    );

    console.log('Available Options:');
    console.log(
      '- organizations:',
      this.organizations.map((o) => ({ id: o.TenantID, name: o.TenantName })),
    );
    console.log(
      '- teams for current org:',
      this.getTeamsForSelectedOrganization().map((t) => ({
        id: t.TeamID,
        name: t.TeamName,
      })),
    );
    console.log('===================');
  }

  // Test workflow for Wauwatosa East (org 3)
  public testWauwatosaWorkflow(): void {
    console.log('TEST: Testing Wauwatosa East workflow');

    // Step 1: Set organization
    console.log('TEST Step 1: Setting Wauwatosa East (org 3)');
    this.store.dispatch(new SetSelectedTenant(3));

    setTimeout(() => {
      console.log(
        'TEST Step 1 Result: Org set to',
        this.currentSelectedTenantId,
      );

      // Step 2: Set a team (first team of Wauwatosa East should be ID 97)
      const teams = this.getTeamsForSelectedOrganization();
      if (teams.length > 0) {
        console.log(
          'TEST Step 2: Setting team',
          teams[0].TeamID,
          teams[0].TeamName,
        );
        this.store.dispatch(new SetSelectedTeam(teams[0].TeamID));

        setTimeout(() => {
          console.log(
            'TEST Step 2 Result: Team set to',
            this.currentSelectedTeamId,
          );
          console.log('TEST Final State:', {
            org: this.currentSelectedTenantId,
            team: this.currentSelectedTeamId,
            teamGroup: this.currentSelectedTeamGroupId,
          });
          console.log(
            'TEST LocalStorage:',
            localStorage.getItem('@@STATE:teamSelection'),
          );
        }, 100);
      } else {
        console.log('TEST Error: No teams found for Wauwatosa East');
      }
    }, 100);
  }

  // Test method to clear all selections
  public testClearSelections(): void {
    console.log('TEST: Clearing all selections');
    this.store.dispatch(new SetSelectedTenant(null));
    this.store.dispatch(new SetSelectedTeam(null));
    this.store.dispatch(new SetSelectedTeamGroup(null));
  }

  // Handle radar values changes and persist them to the lesson
  public onRadarValuesChanged(event: {
    nodeId: string;
    currentValue: number;
    desiredValue: number;
    proValue: number;
  }): void {
    console.log('🎯 Radar values changed:', event);

    if (!this.selectedLesson) {
      console.log('No selected lesson - radar values will not be persisted');
      return;
    }

    // Update the lesson with the new radar values
    const updatedLessonNodes = this.selectedLesson.LessonNodes.map(
      (lessonNode) => {
        if (lessonNode.NodeID === event.nodeId) {
          return {
            ...lessonNode,
            NodeCurrentValue: event.currentValue,
            NodeDesiredValue: event.desiredValue,
            NodeProValue: event.proValue,
          };
        }
        return lessonNode;
      },
    );

    const updatedLesson = {
      ...this.selectedLesson,
      LessonNodes: updatedLessonNodes,
    };

    // Dispatch action to update lesson in NGXS state
    this.store.dispatch(new UpdateLesson(updatedLesson));

    console.log(
      `Updated lesson "${this.selectedLesson.LessonName}" with radar values for node ${event.nodeId}`,
    );
  }

  // Node Painter Toolbar Methods
  public onAddChild(): void {
    console.log('=== ADD CHILD REQUESTED ===');
    console.log('Selected Node:', this.selectedNode);

    if (!this.selectedNode) {
      console.warn('No node selected for adding child');
      return;
    }

    // Show the Add Child dialog
    this.showAddChildDialog = true;
  }

  public onReparentNode(): void {
    console.log('=== REPARENT NODE REQUESTED ===');
    console.log('Selected Node:', this.selectedNode);

    if (!this.selectedNode) {
      console.warn('No node selected for reparenting');
      return;
    }

    // Show the Reparent Node dialog
    this.showReparentNodeDialog = true;
  }

  public onInsertBetween(): void {
    console.log('=== INSERT BETWEEN REQUESTED ===');
    console.log('Selected Node:', this.selectedNode);

    if (!this.selectedNode) {
      console.warn('No node selected for insert between');
      return;
    }

    // Check if the selected node has a parent (can't insert between root and its parent)
    if (this.selectedNode === this.treeData?.id) {
      alert('Cannot insert between root node and its parent.');
      return;
    }

    // Store the node and show the insert dialog to get name and description
    this.pendingInsertNode = this.selectedNode;
    this.insertNodeData = { name: '', description: '' }; // Reset form data
    this.showInsertNodeDialog = true;
    console.log('Insert node dialog shown');
  }

  public onPromoteNode(): void {
    console.log('=== PROMOTE NODE REQUESTED ===');
    console.log('Selected Node:', this.selectedNode);

    if (!this.selectedNode) {
      console.warn('No node selected for promotion');
      return;
    }

    // Check if the selected node has a grandparent (can't promote if parent is root)
    const parentNode = this.findParentNode(this.selectedNode);
    if (!parentNode || parentNode.id === this.treeData?.id) {
      console.warn('Cannot promote node - parent is root node');
      return;
    }

    // Perform the promotion operation
    const success = this.promoteNodeToSibling(this.selectedNode);

    if (success) {
      // Update the visualization
      this.updateVisualization();
      console.log(
        `Successfully promoted node "${this.selectedNode}" to sibling of its parent`,
      );
    } else {
      console.error('Failed to promote node');
    }
  }

  public onDeleteNode(): void {
    console.log('=== DELETE NODE REQUESTED ===');
    console.log('Selected Node:', this.selectedNode);

    if (!this.selectedNode) {
      console.warn('No node selected for deletion');
      return;
    }

    // Check if trying to delete the root node
    if (this.selectedNode === this.treeData?.id) {
      // Just show a simple alert for root node protection
      alert('Cannot delete the root node.');
      return;
    }

    // Store the node to delete and show the proper confirmation dialog
    this.pendingDeleteNode = this.selectedNode;
    this.showDeleteNodeDialog = true;
    console.log('Delete node dialog shown');
  }

  public onEditNode(): void {
    console.log('=== EDIT NODE REQUESTED ===');
    console.log('Selected Node:', this.selectedNode);

    if (!this.selectedNode) {
      console.warn('No node selected for editing');
      return;
    }

    // Get current node data
    const nodeToEdit = this.findNodeById(this.selectedNode);
    if (!nodeToEdit) {
      console.error('Cannot find node to edit');
      return;
    }

    // Store the node to edit and populate the form with current data
    this.pendingEditNode = this.selectedNode;
    this.editNodeFormData = {
      name: nodeToEdit.name || '',
      description: (nodeToEdit as any).description || '',
    };
    this.showEditNodeDialog = true;
    console.log('Edit node dialog shown with data:', this.editNodeFormData);
  }

  public onClearChildren(): void {
    console.log('=== CLEAR CHILDREN REQUESTED ===');
    console.log('Selected Node:', this.selectedNode);
    console.log('Selected Node Has Children:', this.selectedNodeHasChildren);

    if (!this.selectedNode) {
      console.warn('No node selected for clearing children');
      return;
    }

    // Get node info for confirmation dialog
    const nodeToEmpty = this.findNodeById(this.selectedNode);
    const hasChildren =
      nodeToEmpty?.children && nodeToEmpty.children.length > 0;

    console.log('Node to clear:', nodeToEmpty);
    console.log('Has children:', hasChildren);

    if (!hasChildren) {
      // Just show a simple alert for no children case
      alert('This node has no children to clear.');
      return;
    }

    // Store the node to clear and show the proper confirmation dialog
    this.pendingClearNode = this.selectedNode;
    this.showClearChildrenDialog = true;
    console.log('Clear children dialog shown');
  }

  public onPromoteChildren(): void {
    console.log('=== PROMOTE CHILDREN REQUESTED ===');
    console.log('Selected Node:', this.selectedNode);
    console.log('Selected Node Has Children:', this.selectedNodeHasChildren);

    if (!this.selectedNode) {
      console.warn('No node selected for promoting children');
      return;
    }

    // Get node info for confirmation dialog
    const nodeToPromote = this.findNodeById(this.selectedNode);
    const hasChildren =
      nodeToPromote?.children && nodeToPromote.children.length > 0;

    console.log('Node to promote children from:', nodeToPromote);
    console.log('Has children:', hasChildren);

    if (!hasChildren) {
      // Just show a simple alert for no children case
      alert('This node has no children to promote.');
      return;
    }

    // Check if this is the root node (can't promote children of root)
    if (this.selectedNode === this.treeData?.id) {
      alert(
        'Children of the root node cannot be promoted as they have no grandparent to move to.',
      );
      return;
    }

    // Store the node to promote and show the proper confirmation dialog
    this.pendingPromoteNode = this.selectedNode;
    this.showPromoteChildrenDialog = true;
    console.log('Promote children dialog shown');
  }

  // Clear Children Dialog Methods
  public onClearChildrenConfirmed(confirmed: boolean): void {
    console.log('Clear children dialog confirmation received:', confirmed);
    this.showClearChildrenDialog = false;

    if (confirmed && this.pendingClearNode) {
      console.log('Clear children confirmed, calling emptyNodeChildren');
      const success = this.emptyNodeChildren(this.pendingClearNode);

      if (success) {
        // Update the visualization
        this.updateVisualization();
        console.log('Children cleared successfully');
      } else {
        console.error('Failed to clear children');
        alert('Failed to clear children.');
      }
    } else {
      console.log('Clear children cancelled or no pending node');
    }

    this.pendingClearNode = null;
  }

  // Promote Children Dialog Methods
  public onPromoteChildrenConfirmed(confirmed: boolean): void {
    console.log('Promote children dialog confirmation received:', confirmed);
    this.showPromoteChildrenDialog = false;

    if (confirmed && this.pendingPromoteNode) {
      console.log('Promote children confirmed, calling promoteNodeChildren');
      const success = this.promoteNodeChildren(this.pendingPromoteNode);

      if (success) {
        // Update the visualization
        this.updateVisualization();
        console.log('Children promoted successfully');
      } else {
        console.error('Failed to promote children');
        alert('Failed to promote children.');
      }
    } else {
      console.log('Promote children cancelled or no pending node');
    }

    this.pendingPromoteNode = null;
  }

  // Delete Node Dialog Methods
  public onDeleteNodeConfirmed(confirmed: boolean): void {
    console.log('Delete node dialog confirmation received:', confirmed);
    this.showDeleteNodeDialog = false;

    if (confirmed && this.pendingDeleteNode) {
      console.log('Delete node confirmed, calling deleteNodeFromTree');
      const success = this.deleteNodeFromTree(this.pendingDeleteNode);

      if (success) {
        // Clear the selected node since it's been deleted
        this.selectedNode = null;
        // Update the visualization
        this.updateVisualization();
        console.log('Node deleted successfully');
      } else {
        console.error('Failed to delete node');
        alert('Failed to delete node.');
      }
    } else {
      console.log('Delete node cancelled or no pending node');
    }

    this.pendingDeleteNode = null;
  }

  // Insert Node Dialog Methods
  public closeInsertNodeDialog(): void {
    this.showInsertNodeDialog = false;
    this.pendingInsertNode = null;
  }

  public onInsertNodeConfirm(event: {
    name: string;
    description: string;
  }): void {
    console.log('=== INSERT NODE CONFIRMED ===');
    console.log('Insert data:', event);
    console.log('Selected node:', this.pendingInsertNode);

    if (!this.pendingInsertNode) {
      console.warn('No node selected for insert between');
      this.closeInsertNodeDialog();
      return;
    }

    // Perform the insert between operation with the provided data
    const success = this.insertNodeBetweenWithData(
      this.pendingInsertNode,
      event.name,
      event.description,
    );

    if (success) {
      // Update the visualization
      this.updateVisualization();
      console.log(
        `Successfully inserted node "${event.name}" between "${this.pendingInsertNode}" and its parent`,
      );
    } else {
      console.error('Failed to insert node between');
      alert('Failed to insert node.');
    }

    this.closeInsertNodeDialog();
  }

  // Edit Node Dialog Methods
  public closeEditNodeDialog(): void {
    this.showEditNodeDialog = false;
    this.pendingEditNode = null;
  }

  public onEditNodeConfirm(event: { name: string; description: string }): void {
    console.log('=== EDIT NODE CONFIRMED ===');
    console.log('Edit data:', event);
    console.log('Selected node:', this.pendingEditNode);

    if (!this.pendingEditNode) {
      console.warn('No node selected for editing');
      this.closeEditNodeDialog();
      return;
    }

    // Perform the edit operation
    const success = this.editNodeData(
      this.pendingEditNode,
      event.name,
      event.description,
    );

    if (success) {
      // Update the visualization
      this.updateVisualization();
      console.log(`Successfully edited node "${event.name}"`);
    } else {
      console.error('Failed to edit node');
      alert('Failed to edit node.');
    }

    this.closeEditNodeDialog();
  }

  // Add Child Dialog Methods
  public closeAddChildDialog(): void {
    this.showAddChildDialog = false;
  }

  public onAddChildConfirm(event: { name: string; description: string }): void {
    console.log('=== ADD CHILD CONFIRMED ===');
    console.log('Child data:', event);
    console.log('Parent node:', this.selectedNode);

    if (!this.selectedNode) {
      console.warn('No parent node selected');
      this.closeAddChildDialog();
      return;
    }

    // Generate a unique ID for the new child
    const newChildId = `${this.selectedNode}_child_${Date.now()}`;

    // Add the child to the tree
    this.addChildToNode(this.selectedNode, newChildId, event.name);

    // Update the visualization
    this.updateVisualization();

    // Close the dialog
    this.closeAddChildDialog();

    console.log(
      `Successfully added child "${event.name}" with ID "${newChildId}"`,
    );
  }

  // Reparent Node Dialog Methods
  public closeReparentNodeDialog(): void {
    this.showReparentNodeDialog = false;
  }

  public onReparentNodeConfirm(event: { newParentId: string }): void {
    console.log('=== REPARENT NODE CONFIRMED ===');
    console.log('Reparent data:', event);
    console.log('Selected node:', this.selectedNode);

    if (!this.selectedNode) {
      console.warn('No node selected for reparenting');
      this.closeReparentNodeDialog();
      return;
    }

    // Perform the reparenting operation
    const success = this.reparentNode(this.selectedNode, event.newParentId);

    if (success) {
      // Update the visualization
      this.updateVisualization();
      console.log(
        `Successfully reparented node "${this.selectedNode}" to parent "${event.newParentId}"`,
      );
    } else {
      console.error('Failed to reparent node');
    }

    // Close the dialog
    this.closeReparentNodeDialog();
  }

  /**
   * Helper method to add a child to a specific node in the tree
   */
  private addChildToNode(
    parentId: string,
    childId: string,
    childName: string,
  ): void {
    const addChild = (node: TreeNode): boolean => {
      if (node.id === parentId) {
        if (!node.children) {
          node.children = [];
        }
        node.children.push({
          id: childId,
          name: childName,
          children: [],
        });
        return true;
      }

      if (node.children) {
        for (const child of node.children) {
          if (addChild(child)) {
            return true;
          }
        }
      }

      return false;
    };

    if (this.treeData) {
      const success = addChild(this.treeData);
      if (success) {
        console.log(
          `Successfully added child "${childName}" to node "${parentId}"`,
        );
      } else {
        console.warn(`Failed to find parent node "${parentId}" in tree data`);
      }
    }
  }

  /**
   * Helper method to reparent a node (move it to a different parent)
   */
  private reparentNode(nodeId: string, newParentId: string): boolean {
    if (!this.treeData) return false;

    // First, find and remove the node from its current parent
    let nodeToMove: TreeNode | null = null;

    const removeNode = (node: TreeNode): boolean => {
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i].id === nodeId) {
            nodeToMove = node.children[i];
            node.children.splice(i, 1);
            return true;
          }
          if (removeNode(node.children[i])) {
            return true;
          }
        }
      }
      return false;
    };

    // Special case: if trying to move the root node
    if (this.treeData.id === nodeId) {
      console.error('Cannot reparent the root node');
      return false;
    }

    // Remove the node from its current location
    const removed = removeNode(this.treeData);

    if (!removed || !nodeToMove) {
      console.error(`Failed to find node "${nodeId}" to reparent`);
      return false;
    }

    // Now find the new parent and add the node there
    const addToNewParent = (node: TreeNode): boolean => {
      if (node.id === newParentId) {
        if (!node.children) {
          node.children = [];
        }
        node.children.push(nodeToMove!);
        return true;
      }

      if (node.children) {
        for (const child of node.children) {
          if (addToNewParent(child)) {
            return true;
          }
        }
      }

      return false;
    };

    const added = addToNewParent(this.treeData);

    if (!added) {
      console.error(`Failed to find new parent "${newParentId}"`);
      // Try to restore the node to its original location if possible
      return false;
    }

    return true;
  }

  /**
   * Helper method to find a node by its ID
   */
  public findNodeById(nodeId: string): TreeNode | null {
    if (!this.treeData) return null;

    const findNode = (node: TreeNode): TreeNode | null => {
      if (node.id === nodeId) return node;

      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child);
          if (found) return found;
        }
      }

      return null;
    };

    return findNode(this.treeData);
  }

  /**
   * Helper method to find the parent of a specific node
   */
  private findParentNode(nodeId: string): TreeNode | null {
    if (!this.treeData || this.treeData.id === nodeId) return null;

    const findParent = (node: TreeNode): TreeNode | null => {
      if (node.children) {
        for (const child of node.children) {
          if (child.id === nodeId) {
            return node;
          }
          const found = findParent(child);
          if (found) return found;
        }
      }
      return null;
    };

    return findParent(this.treeData);
  }

  /**
   * Helper method to insert a node between a child and its parent
   */
  private insertNodeBetween(nodeId: string): boolean {
    if (!this.treeData) return false;

    // Find the node and its parent
    const parentNode = this.findParentNode(nodeId);
    const nodeToInsert = this.findNodeById(nodeId);

    if (!parentNode || !nodeToInsert) {
      console.error(
        'Cannot find node or its parent for insert between operation',
      );
      return false;
    }

    // Create a new intermediate node
    const newNodeId = `${nodeId}_parent_${Date.now()}`;
    const newNodeName = `Parent of ${nodeToInsert.name || nodeId}`;

    // Find the index of the node in its parent's children
    const nodeIndex = parentNode.children!.findIndex(
      (child) => child.id === nodeId,
    );
    if (nodeIndex === -1) {
      console.error("Node not found in parent's children");
      return false;
    }

    // Create the new intermediate node
    const intermediateNode: TreeNode = {
      id: newNodeId,
      name: newNodeName,
      children: [nodeToInsert], // The original node becomes a child of the new node
    };

    // Replace the original node with the intermediate node in the parent's children
    parentNode.children![nodeIndex] = intermediateNode;

    return true;
  }

  /**
   * Helper method to insert a node between a child and its parent with custom name and description
   */
  private insertNodeBetweenWithData(
    nodeId: string,
    name: string,
    description: string,
  ): boolean {
    if (!this.treeData) return false;

    // Find the node and its parent
    const parentNode = this.findParentNode(nodeId);
    const nodeToInsert = this.findNodeById(nodeId);

    if (!parentNode || !nodeToInsert) {
      console.error(
        'Cannot find node or its parent for insert between operation',
      );
      return false;
    }

    // Create a new intermediate node with provided data
    const newNodeId = `${nodeId}_parent_${Date.now()}`;

    // Find the index of the node in its parent's children
    const nodeIndex = parentNode.children!.findIndex(
      (child) => child.id === nodeId,
    );
    if (nodeIndex === -1) {
      console.error("Node not found in parent's children");
      return false;
    }

    // Create the new intermediate node with custom data
    const intermediateNode: TreeNode = {
      id: newNodeId,
      name: name,
      children: [nodeToInsert], // The original node becomes a child of the new node
    };

    // Store description in a custom property (extending the interface temporarily)
    (intermediateNode as any).description = description;

    // Replace the original node with the intermediate node in the parent's children
    parentNode.children![nodeIndex] = intermediateNode;

    return true;
  }

  /**
   * Helper method to edit node name and description
   */
  private editNodeData(
    nodeId: string,
    name: string,
    description: string,
  ): boolean {
    if (!this.treeData) return false;

    // Find the node to edit
    const nodeToEdit = this.findNodeById(nodeId);

    if (!nodeToEdit) {
      console.error('Cannot find node to edit');
      return false;
    }

    // Update the node's data
    nodeToEdit.name = name;
    (nodeToEdit as any).description = description;

    console.log(
      `Updated node ${nodeId} with name: "${name}" and description: "${description}"`,
    );
    return true;
  }

  /**
   * Helper method to promote a node to be a sibling of its parent
   */
  private promoteNodeToSibling(nodeId: string): boolean {
    if (!this.treeData) return false;

    // Find the node, its parent, and grandparent
    const parentNode = this.findParentNode(nodeId);
    const nodeToPromote = this.findNodeById(nodeId);
    const grandparentNode = parentNode
      ? this.findParentNode(parentNode.id)
      : null;

    if (!parentNode || !nodeToPromote || !grandparentNode) {
      console.error('Cannot find required nodes for promotion operation');
      return false;
    }

    // Remove the node from its current parent
    const nodeIndex = parentNode.children!.findIndex(
      (child) => child.id === nodeId,
    );
    if (nodeIndex === -1) {
      console.error("Node not found in parent's children");
      return false;
    }

    parentNode.children!.splice(nodeIndex, 1);

    // Add the node as a sibling to its former parent (child of grandparent)
    if (!grandparentNode.children) {
      grandparentNode.children = [];
    }
    grandparentNode.children.push(nodeToPromote);

    return true;
  }

  /**
   * Helper method to delete a node and all its children from the tree
   */
  private deleteNodeFromTree(nodeId: string): boolean {
    if (!this.treeData) return false;

    // Cannot delete the root node
    if (this.treeData.id === nodeId) {
      console.error('Cannot delete the root node');
      return false;
    }

    // Find the parent and remove the node
    const parentNode = this.findParentNode(nodeId);
    if (!parentNode || !parentNode.children) {
      console.error('Cannot find parent node for deletion');
      return false;
    }

    // Find and remove the node from its parent's children
    const nodeIndex = parentNode.children.findIndex(
      (child) => child.id === nodeId,
    );
    if (nodeIndex === -1) {
      console.error("Node not found in parent's children");
      return false;
    }

    parentNode.children.splice(nodeIndex, 1);
    return true;
  }

  /**
   * Helper method to empty all children from a node recursively but keep the node itself
   */
  private emptyNodeChildren(nodeId: string): boolean {
    if (!this.treeData) return false;

    // Find the node to empty
    const nodeToEmpty = this.findNodeById(nodeId);
    if (!nodeToEmpty) {
      console.error('Cannot find node to empty');
      return false;
    }

    // Simply clear all children - this removes them recursively
    if (nodeToEmpty.children) {
      const childrenCount = nodeToEmpty.children.length;
      nodeToEmpty.children = [];
      console.log(`Removed ${childrenCount} children from node ${nodeId}`);
    }

    return true;
  }

  /**
   * Helper method to promote all children of a node to become siblings of that node
   */
  private promoteNodeChildren(nodeId: string): boolean {
    if (!this.treeData) return false;

    // Find the node whose children we want to promote
    const sourceNode = this.findNodeById(nodeId);
    if (!sourceNode) {
      console.error('Cannot find source node for promotion');
      return false;
    }

    // Check if the node has children to promote
    if (!sourceNode.children || sourceNode.children.length === 0) {
      console.log('No children to promote');
      return true; // Not an error, just nothing to do
    }

    // Find the parent of the source node (where children will be promoted to)
    const parentNode = this.findParentNode(nodeId);
    if (!parentNode) {
      console.error('Cannot promote children of root node - no parent exists');
      return false;
    }

    // Store children to promote
    const childrenToPromote = [...sourceNode.children];
    console.log(
      `Promoting ${childrenToPromote.length} children from node ${nodeId}`,
    );

    // Clear children from source node
    sourceNode.children = [];

    // Add promoted children to the parent's children array
    if (!parentNode.children) {
      parentNode.children = [];
    }

    // Add all promoted children to the parent
    parentNode.children.push(...childrenToPromote);

    console.log(
      `Successfully promoted ${childrenToPromote.length} children to siblings`,
    );
    return true;
  }

  // ==================== HEX GRID VISUALIZATION ====================

  private renderHexGridVisualization(): void {
    if (!this.g || !this.treeData) return;

    // Clear all existing elements
    this.g.selectAll('*').remove();

    // Build hex color map from tree
    this.buildHexColorMap(this.treeData);

    // Generate hex grid
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const hexes = this.generateHexGrid(centerX, centerY);

    // Assign nodes to radial positions
    const hexNodes = this.assignNodesToRadialHexPositions(hexes);

    // Draw hex background
    this.drawHexBackground(hexes, hexNodes);

    // Draw hex nodes
    this.drawHexNodes(hexNodes);

    // Center view
    this.visualizationInteractionService.centerView();
    this.panX = 0;
    this.panY = 0;
    this.applyTransform();

    this.cdr.detectChanges();
  }

  private buildHexColorMap(treeData: TreeNode): void {
    this.hexGridNodeToColorMap.clear();
    let firstLevelIndex = 0;

    const traverse = (node: TreeNode, depth: number, branchIdx: number) => {
      let nodeId = node.name || node.id;
      let assignedBranchIndex: number;

      if (depth === 0) {
        // Root node
        assignedBranchIndex = 0;
      } else if (depth === 1) {
        // First-level children get unique colors
        assignedBranchIndex = firstLevelIndex % this.HEX_PALETTE.length;
        firstLevelIndex++;
      } else {
        // Other descendants inherit parent color
        assignedBranchIndex = branchIdx;
      }

      const color =
        this.HEX_PALETTE[assignedBranchIndex % this.HEX_PALETTE.length];
      this.hexGridNodeToColorMap.set(nodeId, color);

      if (node.children) {
        node.children.forEach((child: TreeNode) => {
          traverse(child, depth + 1, assignedBranchIndex);
        });
      }
    };

    traverse(treeData, 0, 0);
  }

  private generateHexGrid(
    centerX: number,
    centerY: number,
  ): Array<{
    x: number;
    y: number;
    q: number;
    r: number;
  }> {
    const hexes: Array<{ x: number; y: number; q: number; r: number }> = [];

    // Calculate grid radius based on canvas dimensions and zoom
    const effectiveWidth = this.width / this.zoomLevel;
    const effectiveHeight = this.height / this.zoomLevel;

    const maxDistance = Math.sqrt(
      Math.pow(Math.max(centerX, effectiveWidth - centerX), 2) +
        Math.pow(Math.max(centerY, effectiveHeight - centerY), 2),
    );

    const hexSpacing = this.HEX_RADIUS * Math.sqrt(3);
    const gridRadius = Math.ceil(maxDistance / hexSpacing) + 3;

    // Generate axial hex coordinates
    for (let q = -gridRadius; q <= gridRadius; q++) {
      for (let r = -gridRadius; r <= gridRadius; r++) {
        if (Math.abs(q + r) <= gridRadius) {
          const x = centerX + (3 / 2) * this.HEX_RADIUS * q;
          const y =
            centerY +
            (Math.sqrt(3) / 2) * this.HEX_RADIUS * q +
            Math.sqrt(3) * this.HEX_RADIUS * r;

          hexes.push({ x, y, q, r });
        }
      }
    }

    return hexes;
  }

  private assignNodesToRadialHexPositions(
    hexes: Array<{ x: number; y: number; q: number; r: number }>,
  ): Array<{
    id: string;
    x: number;
    y: number;
    color: string;
    depth: number;
    name: string;
  }> {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const nodes: Array<{
      id: string;
      x: number;
      y: number;
      color: string;
      depth: number;
      name: string;
    }> = [];

    // Flatten tree with depth info
    const nodeList: Array<{ node: TreeNode; depth: number }> = [];
    const traverse = (node: TreeNode, depth: number) => {
      nodeList.push({ node, depth });
      if (node.children) {
        node.children.forEach((child: TreeNode) => {
          traverse(child, depth + 1);
        });
      }
    };

    traverse(this.treeData, 0);

    // Sort by depth then by data order
    nodeList.sort((a, b) => a.depth - b.depth);

    // Sort hexes by distance from center for radial positioning
    const hexesWithDistance = hexes.map((hex) => ({
      ...hex,
      distanceFromCenter: Math.sqrt(
        Math.pow(hex.x - centerX, 2) + Math.pow(hex.y - centerY, 2),
      ),
    }));

    hexesWithDistance.sort(
      (a, b) => a.distanceFromCenter - b.distanceFromCenter,
    );

    // Limit nodes to nodeCount
    const nodesToPlace = nodeList.slice(0, this.nodeCount);

    // Assign nodes to hexes in radial order
    for (
      let i = 0;
      i < nodesToPlace.length && i < hexesWithDistance.length;
      i++
    ) {
      const { node, depth } = nodesToPlace[i];
      const hex = hexesWithDistance[i];
      const nodeName = node.name || node.id;
      const color = this.hexGridNodeToColorMap.get(nodeName) || '#95a5a6';

      nodes.push({
        id: nodeName,
        x: hex.x,
        y: hex.y,
        color,
        depth,
        name: nodeName,
      });
    }

    return nodes;
  }

  private drawHexBackground(
    hexes: Array<{ x: number; y: number; q: number; r: number }>,
    nodes: Array<{
      id: string;
      x: number;
      y: number;
      color: string;
      depth: number;
      name: string;
    }>,
  ): void {
    if (!this.g) return;

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Create hex position to color map
    const hexToColorMap = new Map<string, string>();
    for (const node of nodes) {
      const key = `${node.x},${node.y}`;
      hexToColorMap.set(key, node.color);
    }

    // Draw hex cells
    this.g
      .selectAll('.hex-cell')
      .data(hexes, (d: any, i: number) => i)
      .enter()
      .append('polygon')
      .attr('class', 'hex-cell')
      .attr('points', (d: any) =>
        this.getHexagonPoints(d.x, d.y, this.HEX_RADIUS),
      )
      .attr('fill', (d: any) => {
        const hexKey = `${d.x},${d.y}`;
        const nodeColor = hexToColorMap.get(hexKey);
        if (nodeColor) {
          return nodeColor;
        }

        // Check if this is the center hex
        const dist = Math.sqrt(
          Math.pow(d.x - centerX, 2) + Math.pow(d.y - centerY, 2),
        );
        if (dist < 15) {
          return '#000';
        }
        return '#f5f5f5';
      })
      .attr('stroke', this.isDarkMode ? '#444' : '#bbb')
      .attr('stroke-width', 0.5)
      .attr('opacity', 1);

    // Add center hex outline
    const centerHex = hexes.find((h) => {
      const dist = Math.sqrt(
        Math.pow(h.x - centerX, 2) + Math.pow(h.y - centerY, 2),
      );
      return dist < 15;
    });

    if (centerHex) {
      this.g
        .append('polygon')
        .attr('class', 'center-hex')
        .attr(
          'points',
          this.getHexagonPoints(centerHex.x, centerHex.y, this.HEX_RADIUS),
        )
        .attr('fill', 'none')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('opacity', 1);
    }
  }

  private drawHexNodes(
    nodes: Array<{
      id: string;
      x: number;
      y: number;
      color: string;
      depth: number;
      name: string;
    }>,
  ): void {
    if (!this.g) return;

    const nodeSelection = this.g
      .selectAll('.hex-node')
      .data(nodes, (d: any) => d.id)
      .enter()
      .append('g')
      .attr('class', 'hex-node')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

    nodeSelection
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('font-size', '12px')
      .attr('fill', '#000')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text((d: any) => d.id);

    nodeSelection.on('click', (event: any, d: any) => {
      this.selectedNode = d.id || null;
      this.cdr.detectChanges();
      event.stopPropagation();
    });
  }

  private getHexagonPoints(
    centerX: number,
    centerY: number,
    radius: number,
  ): string {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  }

  // Apply link thickness to tree links
  private applyLinkThickness(): void {
    if (!this.svg) return;

    const t = d3.transition().duration(300).ease(d3.easeCubicInOut);
    this.svg
      .selectAll('.tree-link')
      .transition(t)
      .style('stroke-width', this.linkThickness + 'px');
  }

  // Apply link color override to tree links
  private applyLinkColorOverride(): void {
    if (!this.svg || !this.linkColorOverride) return;

    this.svg.selectAll('.tree-link').style('stroke', this.linkColorOverride);
  }
}
