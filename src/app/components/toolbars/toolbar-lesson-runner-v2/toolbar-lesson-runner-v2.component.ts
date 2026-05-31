import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { SketchState } from '../../../state/sketch.state';
import {
  GlobalContextState,
  SetSelectedContextLessonRunnerNode,
  SetSelectedContextLessonNode,
} from '../../../state';
import { ToggleToolbarExpandState } from '../../../state/sketch.actions';
import {
  StartLesson,
  TourState,
  UpdateLessonNodeIndex,
  MarkNodeCompleted,
} from '../../../state/tour.state';
import { TreeNode, ToolbarPosition } from '../../../interfaces';
import { MockDataService } from '../../../services/mock-data.service';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { DialogLessonSurveyComponent } from '../../dialogs/dialog-lesson-survey/dialog-lesson-survey.component';
import {
  LessonSurveyResponse,
  NodeSurveyResponse,
} from '../../../interfaces/lesson-survey.interfaces';

@Component({
  selector: 'app-toolbar-lesson-runner-v2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmationDialogComponent,
    DialogLessonSurveyComponent,
  ],
  templateUrl: './toolbar-lesson-runner-v2.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-lesson-runner-v2.component.scss',
  ],
})
export class ToolbarLessonRunnerV2Component
  extends BaseToolbarComponent
  implements OnInit, OnDestroy, OnChanges
{
  readonly toolbarId = 'lesson-runner-v2';
  readonly toolbarTitle = 'Lesson Runner V2';
  readonly toolbarIcon = '▶️';

  // Inputs from parent (main UI)
  @Input() position: ToolbarPosition = { x: 100, y: 100 }; // Initialize with default position
  @Input() favoriteNodes: string[] = [];
  @ViewChildren('favoriteItems') favoriteItems!: QueryList<ElementRef>;
  @ViewChildren('nodeListItem') nodeListItems!: QueryList<ElementRef>;
  @ViewChild('nodeContent') nodeContent!: ElementRef;
  @ViewChild('lessonVideo') lessonVideo!: ElementRef<HTMLVideoElement>;

  @Input() nodeData: TreeNode | null = null;
  @Input() selectedNode: string | null = null;
  @Input() selectedLesson: any = null;
  @Input() treeData: TreeNode | null = null;

  // Outputs - combined actions
  @Output() nodeSelected = new EventEmitter<string>(); // lesson runner node select
  @Output() surveyResponse = new EventEmitter<any>();

  // Component state
  public headerText = 'Lesson Runner V2';
  public selectedLessonNode: string | null = null;
  public selectedContextLessonRunnerLesson: any = null;
  public isFavorite = false;
  public isBookmarked = false;
  public shareUrlCopied = false;
  public visitedNodes: Set<string> = new Set(); // Track visited nodes
  public rightPanelOpen = false;

  // Autopilot state
  public isAutopilotRunning = false;
  private autopilotTimer: any = null;
  private autopilotDelay = 2000; // 2 seconds between nodes
  public completedNodes: Set<string> = new Set();

  // Dialog states
  public showQuitDialog = false;
  public showFinishDialog = false;
  public showSurveyDialog = false;
  public currentLessonId: string | null = null;
  public currentLessonTitle = '';

  // Three-state panel mode: 'minimized' | 'normal' | 'maximized'
  // minimized: list hidden, content normal width, toolbar narrower
  // normal: list shown, content normal width, toolbar normal width
  // maximized: list hidden, content expanded, toolbar wider
  public panelMode: 'minimized' | 'normal' | 'maximized' = 'normal';

  // Legacy left pane collapse state (for header button)
  public leftCollapsed = false;

  // Right panel state
  public selectedFieldBackground = 'Guardiola'; // Default field background
  public selectedBaseFormation = 'Final Third - W'; // Default formation

  // Field background options
  public fieldBackgroundOptions = [
    { label: 'Guardiola', value: 'Guardiola', file: 'field.guardiola.svg' },
    { label: 'Nagalsmann', value: 'Nagalsmann', file: 'field.nagalsmann.svg' },
    { label: 'Standard', value: 'Standard', file: 'field.standard.svg' },
    { label: 'Futsal', value: 'Futsal', file: 'field.futsal.svg' },
  ];

  // Base formation options
  public baseFormationOptions = [
    'Final Third - W',
    'Middle Third - Progression',
    'Buildout - La Salidia Lavolpiana (vs Single Striker)',
    'Buildout - La Salidia Lavolpiana (vs Double Striker)',
    'Buildout - Di Zerbi - Box',
    'Buildout - Di Zerbi - Attacking Covershadows',
    'Buildout - Di Zerbi - Hourglass',
    'Kickoff - 3-5-2',
    'Kickoff - 4-4-2',
    'Kickoff - 4-5-1',
    'CK - Stack',
    'CK - Pack',
    'CK - Even Distribution',
    'CK - Short #1',
    'FK - Deep',
    'FK - Short - Centrally',
    'FK - Short - From Wings',
    'Throw-In - Attacking Third',
    'Throw-In - Middle Third',
    'Throw-In - Defending Third',
    'Defending - High Block',
    'Defending - Middle Block',
    'Defending - Low Block',
  ];

  private destroy$ = new Subject<void>();

  /**
   * Get the lesson nodes from the assigned lesson (Runner lesson)
   * This ensures Runner V2 uses nodes from the assigned lesson, not the main selectedNodes array
   */
  get selectedNodes(): string[] {
    if (!this.selectedContextLessonRunnerLesson?.LessonNodes) {
      return [];
    }
    return this.selectedContextLessonRunnerLesson.LessonNodes.map(
      (node: any) => node.NodeID
    );
  }

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    private mockDataService: MockDataService
  ) {
    super();
    this.panelHeight = 400;
    this.resizable = true;
  }

  ngOnInit(): void {
    try {
      super.ngOnInit();
    } catch (error) {
      console.error('[RUNNER-V2] ❌ Error in super.ngOnInit():', error);
    }
    this.setupSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Guard against infinite loops - only process if actual changes occurred
    if (
      !changes['nodeData']?.currentValue &&
      !changes['selectedLessonNode']?.currentValue
    ) {
      return;
    }

    if (changes['nodeData'] || changes['selectedLessonNode']) {
      this.updateFavoriteStatus();
      this.updateBookmarkStatus();
      this.refreshVideo();
      this.scrollToTop();
    }
  }

  ngOnDestroy(): void {
    this.stopAutopilot();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    console.log('[RUNNER-V2] 🔧 Setting up subscriptions');

    // Load expand state from store
    this.store
      .select(SketchState.getToolbarExpandStates)
      .pipe(takeUntil(this.destroy$))
      .subscribe((expandStates) => {
        // leftCollapsed is inverted from expanded state
        this.leftCollapsed = !expandStates.lessonRunnerV2;
      });

    this.store
      .select(SketchState.getFavoriteNodes)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateFavoriteStatus());
    this.store
      .select(SketchState.getBookmarkedNodes)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateBookmarkStatus());

    console.log(
      '[RUNNER-V2] 🔧 Subscribing to selectedContextLessonRunnerNode'
    );
    this.store
      .select(GlobalContextState.selectedContextLessonRunnerNode)
      .pipe(takeUntil(this.destroy$))
      .subscribe((nodeId) => {
        console.log('[RUNNER-V2] 📍 Node subscription fired:', nodeId);
        this.selectedLessonNode = nodeId;
        this.updateFavoriteStatus();
        this.updateBookmarkStatus();

        // Mark node as visited when it's selected
        if (nodeId) {
          this.visitedNodes.add(nodeId);
          console.log('👁️ Runner - Node marked as visited:', nodeId);
        }

        // Mark node as completed when it's selected/visited
        if (nodeId && this.currentLessonId) {
          this.store.dispatch(
            new MarkNodeCompleted(this.currentLessonId, nodeId)
          );
          this.completedNodes.add(nodeId);
          console.log('✅ Runner - Node marked as completed:', nodeId);
        }

        // Trigger change detection to update button states
        this.cdr.markForCheck();
      });

    // Subscribe to selected lesson RUNNER lesson from global context
    console.log(
      '[RUNNER-V2] 🔧 Subscribing to selectedContextLessonRunnerLesson'
    );
    const currentRunnerLesson = this.store.selectSnapshot(
      GlobalContextState.selectedContextLessonRunnerLesson
    );
    console.log('[RUNNER-V2] 📌 Current state snapshot:', {
      hasLesson: !!currentRunnerLesson,
      lessonName: currentRunnerLesson?.LessonName,
    });

    const observable$ = this.store.select(
      GlobalContextState.selectedContextLessonRunnerLesson
    );
    console.log('[RUNNER-V2] 🔍 Observable created:', observable$);

    observable$
      .pipe(
        takeUntil(this.destroy$),
        tap((lesson) => {
          console.log(
            '[RUNNER-V2] 🎯 TAP - Value emitted before subscription:',
            {
              hasLesson: !!lesson,
              lessonName: lesson?.LessonName,
            }
          );
        })
      )
      .subscribe({
        next: (lesson) => {
          console.log('[RUNNER-V2] 📚 Lesson subscription fired:', {
            hasLesson: !!lesson,
            lessonName: lesson?.LessonName,
            lessonId: lesson?.LessonID,
            nodeCount: lesson?.LessonNodes?.length,
            currentValue: this.selectedContextLessonRunnerLesson?.LessonName,
          });
          this.selectedContextLessonRunnerLesson = lesson;

          // Clear selected node when lesson is deactivated/cleared
          if (!lesson) {
            console.log(
              '[RUNNER-V2] 🧹 Clearing selected lesson node (lesson deactivated)'
            );
            this.selectedLessonNode = null;
            this.store.dispatch(new SetSelectedContextLessonNode(null));
          }

          this.cdr.markForCheck();
        },
        error: (err) =>
          console.error('[RUNNER-V2] ❌ Subscription error:', err),
        complete: () =>
          console.log('[RUNNER-V2] ⚠️ Subscription completed (destroyed)'),
      });

    // Subscribe to Runner's tour state to track currently running lesson
    this.store
      .select(TourState.getCurrentRunnerLessonId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((lessonId) => {
        this.currentLessonId = lessonId;
        console.log('🎯 Runner V2 - Tour lesson ID updated:', lessonId);

        // Load completed nodes for this lesson
        if (lessonId) {
          const completedNodeIds = this.store.selectSnapshot(
            TourState.getCompletedNodes
          )(lessonId);
          this.completedNodes = new Set(completedNodeIds);

          // DO NOT clear visited nodes when lesson changes - they persist across contexts
          console.log(
            '🔄 Runner V2 - Completed nodes loaded for lesson:',
            lessonId
          );
        } else {
          this.completedNodes.clear();
          // DO NOT clear visited nodes - they are global
        }

        this.cdr.markForCheck();
      });

    // Subscribe to height changes from resize handle to trigger change detection
    // This ensures the flexbox layout updates when user drags the vertical resize handle
    this.heightChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.detectChanges(); // Force change detection to update ngStyle binding
    });
  }

  // Stubs for inherited methods not implemented yet
  private updateFavoriteStatus(): void {
    if (!this.selectedLessonNode) {
      this.isFavorite = false;
      return;
    }

    // Get favorite status from state
    this.store
      .select(SketchState.isFavorite)
      .subscribe((isFavoriteFn) => {
        this.isFavorite = isFavoriteFn(this.selectedLessonNode!);
      })
      .unsubscribe();
  }

  private updateBookmarkStatus(): void {
    if (!this.selectedLessonNode) {
      this.isBookmarked = false;
      return;
    }

    // Get bookmark status from state
    this.store
      .select(SketchState.isBookmarked)
      .subscribe((isBookmarkedFn) => {
        this.isBookmarked = isBookmarkedFn(this.selectedLessonNode!);
      })
      .unsubscribe();
  }

  refreshVideo(): void {
    setTimeout(() => {
      if (this.lessonVideo?.nativeElement && this.nodeData?.videoUrl) {
        const video = this.lessonVideo.nativeElement;
        console.log(
          '🎥 Lesson Runner V2 - Refreshing video:',
          this.selectedLessonNode,
          this.nodeData.videoUrl
        );

        // Force video reload by setting src again
        video.muted = true; // Ensure video stays muted
        video.load();
        video.play().catch((err) => {
          console.warn('🎥 Lesson Runner V2 - Auto-play failed:', err);
        });
      }
    }, 100);
  }

  private scrollToTop(): void {
    if (this.nodeContent?.nativeElement) {
      this.nodeContent.nativeElement.scrollTop = 0;
    }
  }

  toggleVideoMute(videoElement: HTMLVideoElement): void {
    if (videoElement) {
      videoElement.muted = !videoElement.muted;
    }
  }

  onVideoLoadStart(video: HTMLVideoElement): void {
    // Hide video while loading to prevent white flash
    video.removeAttribute('data-loaded');
  }

  onVideoCanPlay(video: HTMLVideoElement): void {
    // Show video once it's ready
    video.setAttribute('data-loaded', 'true');
  }

  getNodeDescription(): string {
    if (!this.nodeData?.description) {
      return this.mockDataService.generateNodeDescription(
        this.selectedLessonNode || '',
        true
      );
    }
    return this.nodeData.description;
  }

  getNodeName(nodeId: string): string {
    if (!this.treeData || !nodeId) return nodeId;

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

    const node = findNode(this.treeData);
    return node?.name || nodeId;
  }

  // Check if a node has been visited
  isNodeVisited(nodeId: string): boolean {
    return this.visitedNodes.has(nodeId);
  }

  // Get the appropriate checkmark for a node based on its state
  getNodeCheckmark(nodeId: string): string {
    const isCompleted = this.isNodeCompleted(nodeId);
    const isVisited = this.isNodeVisited(nodeId);

    if (isCompleted) {
      return '✓'; // Green checkmark (completed)
    } else if (isVisited) {
      return '✓'; // Blue checkmark (visited only)
    } else {
      return '☐'; // Empty checkbox (not visited)
    }
  }

  // Handle clicking a node in the list to navigate to it
  onNodeClick(nodeId: string, index: number): void {
    console.log('🖱️ Runner V2 - Node clicked:', nodeId, 'at index:', index);

    // Update selected lesson node
    this.selectedLessonNode = nodeId;

    // Emit node selection event
    this.nodeSelected.emit(nodeId);

    // Update lesson node index in tour state if we're in a tour
    if (this.currentLessonId) {
      this.store.dispatch(
        new UpdateLessonNodeIndex(this.currentLessonId, index)
      );
    }

    // Mark node as visited
    this.visitedNodes.add(nodeId);

    // Mark node as completed when clicked in Lesson Runner context
    if (this.currentLessonId) {
      this.store.dispatch(new MarkNodeCompleted(this.currentLessonId, nodeId));
      this.completedNodes.add(nodeId);
      console.log('✅ Runner - Node marked as completed on click:', nodeId);
    }

    // Scroll the selected node into view
    this.scrollToActiveNode(index);
  }

  // Scroll the active node into view
  private scrollToActiveNode(index: number): void {
    // Use setTimeout to ensure the DOM has updated
    setTimeout(() => {
      if (this.nodeListItems && this.nodeListItems.length > index) {
        const element = this.nodeListItems.toArray()[index];
        if (element && element.nativeElement) {
          element.nativeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
          });
        }
      }
    }, 0);
  }

  // Play button - start lesson tour in manual mode for RUNNER
  onPlayLesson(): void {
    if (
      !this.selectedContextLessonRunnerLesson ||
      !this.selectedContextLessonRunnerLesson.LessonID
    ) {
      console.warn('⚠️ Lesson Runner V2 - No lesson selected for Play');
      return;
    }

    console.log(
      '▶️ Lesson Runner V2 - Starting lesson tour (RUNNER context):',
      this.selectedContextLessonRunnerLesson.LessonID
    );
    this.store.dispatch(
      new StartLesson(this.selectedContextLessonRunnerLesson.LessonID, 'runner')
    );
    // TODO: Additional tour UI activation logic here
  }

  // Autopilot button - start lesson tour in auto mode for RUNNER
  onAutopilotLesson(): void {
    if (
      !this.selectedContextLessonRunnerLesson ||
      !this.selectedContextLessonRunnerLesson.LessonID
    ) {
      console.warn('⚠️ Lesson Runner V2 - No lesson selected for Autopilot');
      return;
    }

    const lessonId = this.selectedContextLessonRunnerLesson.LessonID;

    if (!this.selectedNodes || this.selectedNodes.length === 0) {
      console.warn('⚠️ Lesson Runner V2 - No nodes available for autopilot');
      return;
    }

    console.log(
      '🚗 Lesson Runner V2 - Starting lesson autopilot (RUNNER context):',
      lessonId
    );

    // Start lesson in RUNNER context
    this.store.dispatch(new StartLesson(lessonId, 'runner'));

    // Start at the first node
    this.store.dispatch(new UpdateLessonNodeIndex(lessonId, 0));
    this.goToFirst();

    // Begin autopilot sequence
    this.isAutopilotRunning = true;
    this.startAutopilotSequence();
  }

  // Stop autopilot and cleanup timer
  public stopAutopilot(): void {
    this.isAutopilotRunning = false;
    if (this.autopilotTimer) {
      clearTimeout(this.autopilotTimer);
      this.autopilotTimer = null;
    }
    console.log('⏸️ Runner V2 - Autopilot stopped');
  }

  // Toggle autopilot on/off
  public toggleAutopilot(): void {
    if (this.isAutopilotRunning) {
      this.stopAutopilot();
    } else {
      this.onAutopilotLesson();
    }
  }

  // Autopilot sequence - auto-advance through nodes
  private startAutopilotSequence(): void {
    if (!this.isAutopilotRunning || !this.currentLessonId) {
      return;
    }

    const currentIndex = this.selectedNodes.indexOf(
      this.selectedLessonNode || ''
    );

    // If we're at the last node, finish
    if (currentIndex >= this.selectedNodes.length - 1) {
      console.log('✅ Runner V2 - Autopilot reached last node');
      this.isAutopilotRunning = false;
      this.finish();
      return;
    }

    // Wait for autopilotDelay, then move to next (completion will be marked by subscription)
    this.autopilotTimer = setTimeout(() => {
      if (!this.currentLessonId || !this.selectedLessonNode) {
        return;
      }

      console.log('✓ Runner V2 - Moving to next node');

      // Move to next node
      this.goToNext();

      // Force change detection to update the UI
      this.cdr.detectChanges();

      // Update the lesson node index in state
      const newIndex = this.selectedNodes.indexOf(
        this.selectedLessonNode || ''
      );
      this.store.dispatch(
        new UpdateLessonNodeIndex(this.currentLessonId, newIndex)
      );

      // Continue the sequence
      this.startAutopilotSequence();
    }, this.autopilotDelay);
  }

  // Helper to check if a node is completed
  isNodeCompleted(nodeId: string): boolean {
    return this.completedNodes.has(nodeId);
  }

  // Small helpers
  get isWaitingMode(): boolean {
    return !this.selectedLessonNode || !this.nodeData || !this.selectedLesson;
  }

  get hasLessonNodes(): boolean {
    return this.selectedNodes.length > 0;
  }

  get currentNodeNumber(): number {
    if (!this.selectedLessonNode || !this.hasLessonNodes) return 0;
    return this.selectedNodes.indexOf(this.selectedLessonNode) + 1;
  }

  // Header button helpers
  onToggleFavorite(event: Event): void {
    event.stopPropagation();
    if (!this.selectedLessonNode) return;
    this.isFavorite = !this.isFavorite;
  }

  onToggleBookmark(event: Event): void {
    event.stopPropagation();
    this.isBookmarked = !this.isBookmarked;
  }

  onShare(event: Event): void {
    event.stopPropagation();
    this.shareUrlCopied = true;
    setTimeout(() => (this.shareUrlCopied = false), 2000);
  }

  // Expand/collapse left pane (legacy header button)
  toggleLeftPane(): void {
    this.leftCollapsed = !this.leftCollapsed;
    // Dispatch action to store (leftCollapsed is inverted from expanded state)
    this.store.dispatch(new ToggleToolbarExpandState('lessonRunnerV2'));
  }

  // Toggle through three panel modes (new side button)
  toggleLeftPanel(): void {
    // Cycle: normal -> minimized -> maximized -> normal
    if (this.panelMode === 'normal') {
      this.panelMode = 'minimized';
    } else if (this.panelMode === 'minimized') {
      this.panelMode = 'maximized';
    } else {
      this.panelMode = 'normal';
    }
  }

  public toggleRightPanel(): void {
    this.rightPanelOpen = !this.rightPanelOpen;
    this.cdr.markForCheck();
  }

  public getSelectedFieldBackgroundPath(): string {
    const selected = this.fieldBackgroundOptions.find(
      (opt) => opt.value === this.selectedFieldBackground
    );
    return selected
      ? `assets/field-grids/${selected.file}`
      : 'assets/field-grids/field.guardiola.svg';
  }

  // Computed property for showing list panel
  get showListPanel(): boolean {
    return this.panelMode === 'normal';
  }

  // Lesson runner navigation
  get totalNodes(): number {
    return this.selectedNodes.length || 0;
  }

  get remainingNodes(): number {
    if (!this.selectedLessonNode) return this.totalNodes;
    return Math.max(0, this.totalNodes - (this.currentNodeNumber || 0));
  }

  get isFirstNode(): boolean {
    // Disabled if no lesson, no nodes, or at first position
    if (!this.selectedContextLessonRunnerLesson || !this.hasLessonNodes) {
      return true;
    }
    return this.currentNodeNumber <= 1;
  }

  get isLastNode(): boolean {
    // Disabled if no lesson, no nodes, or at last position
    if (!this.selectedContextLessonRunnerLesson || !this.hasLessonNodes) {
      return true;
    }
    return this.currentNodeNumber >= this.totalNodes;
  }

  get shouldDisableNext(): boolean {
    // Disabled if no lesson, no nodes, or at last node
    if (!this.selectedContextLessonRunnerLesson || !this.hasLessonNodes) {
      return true;
    }
    return this.isLastNode;
  }

  get shouldEnableFinish(): boolean {
    // Finish should be enabled when we have a lesson and ALL nodes are visited
    if (!this.selectedContextLessonRunnerLesson || !this.hasLessonNodes) {
      return false;
    }

    // Check if all nodes in the lesson are visited
    const allNodesVisited = this.selectedNodes.every((nodeId) =>
      this.visitedNodes.has(nodeId)
    );

    return allNodesVisited;
  }

  goToFirst(): void {
    if (!this.hasLessonNodes) return;
    const firstNode = this.selectedNodes[0] || null;
    if (!firstNode) return;

    // Update local state
    this.selectedLessonNode = firstNode;

    // Dispatch state updates
    this.store.dispatch(new SetSelectedContextLessonRunnerNode(firstNode));

    // Update tour index if we're in a tour
    if (this.currentLessonId) {
      this.store.dispatch(new UpdateLessonNodeIndex(this.currentLessonId, 0));
    }

    // Emit event
    this.nodeSelected.emit(firstNode);

    // Scroll to active node
    this.scrollToActiveNode(0);
  }

  goToPrevious(): void {
    if (!this.selectedLessonNode) return;
    const idx = this.selectedNodes.indexOf(this.selectedLessonNode);
    if (idx > 0) {
      const prevNode = this.selectedNodes[idx - 1];

      // Update local state
      this.selectedLessonNode = prevNode;

      // Dispatch state updates
      this.store.dispatch(new SetSelectedContextLessonRunnerNode(prevNode));

      // Update tour index if we're in a tour
      if (this.currentLessonId) {
        this.store.dispatch(
          new UpdateLessonNodeIndex(this.currentLessonId, idx - 1)
        );
      }

      // Emit event
      this.nodeSelected.emit(prevNode);

      // Scroll to active node
      this.scrollToActiveNode(idx - 1);
    }
  }

  goToNext(): void {
    if (!this.selectedLessonNode) return;
    const idx = this.selectedNodes.indexOf(this.selectedLessonNode);
    if (idx >= 0 && idx < this.selectedNodes.length - 1) {
      const nextNode = this.selectedNodes[idx + 1];

      // Update local state
      this.selectedLessonNode = nextNode;

      // Dispatch state updates
      this.store.dispatch(new SetSelectedContextLessonRunnerNode(nextNode));

      // Update tour index if we're in a tour
      if (this.currentLessonId) {
        this.store.dispatch(
          new UpdateLessonNodeIndex(this.currentLessonId, idx + 1)
        );
      }

      // Emit event
      this.nodeSelected.emit(nextNode);

      // Scroll to active node
      this.scrollToActiveNode(idx + 1);
    }
  }

  goToLast(): void {
    if (!this.hasLessonNodes) return;
    const lastIndex = this.selectedNodes.length - 1;
    const lastNode = this.selectedNodes[lastIndex];
    if (!lastNode) return;

    // Update local state
    this.selectedLessonNode = lastNode;

    // Dispatch state updates
    this.store.dispatch(new SetSelectedContextLessonRunnerNode(lastNode));

    // Update tour index if we're in a tour
    if (this.currentLessonId) {
      this.store.dispatch(
        new UpdateLessonNodeIndex(this.currentLessonId, lastIndex)
      );
    }

    // Emit event
    this.nodeSelected.emit(lastNode);

    // Scroll to active node
    this.scrollToActiveNode(lastIndex);
  }

  finish(): void {
    this.showFinishDialog = true;
  }

  quit(): void {
    this.showQuitDialog = true;
  }

  onQuitConfirmed(shouldSave: boolean): void {
    this.showQuitDialog = false;
    if (shouldSave) {
      this.surveyResponse.emit({ action: 'quit', save: true });
    } else {
      this.surveyResponse.emit({ action: 'quit', save: false });
    }
  }

  onQuitDialogClosed(): void {
    this.showQuitDialog = false;
  }

  onFinishConfirmed(shouldSave: boolean): void {
    console.log('[RUNNER-V2] 🏁 Finish confirmed:', { shouldSave });
    this.showFinishDialog = false;
    if (shouldSave) {
      // Get lesson ID from current lesson or tour state
      const lessonIdNum = this.currentLessonId
        ? parseInt(this.currentLessonId, 10)
        : this.selectedContextLessonRunnerLesson?.LessonID;

      console.log('[RUNNER-V2] 💾 Emitting save event:', {
        action: 'finish',
        save: true,
        lessonId: lessonIdNum,
        fromCurrentLessonId: this.currentLessonId,
        fromSelectedLesson: this.selectedContextLessonRunnerLesson?.LessonID,
      });

      this.surveyResponse.emit({
        action: 'finish',
        save: true,
        lessonId: lessonIdNum,
      });
      // Then show survey dialog for optional feedback
      this.showSurveyDialog = true;
    } else {
      console.log('[RUNNER-V2] ❌ Not saving - user declined');
      this.surveyResponse.emit({ action: 'finish', save: false });
    }
  }

  onSurveySubmitted(response: LessonSurveyResponse): void {
    console.log('📝 Lesson Runner V2 - Survey submitted:', response);
    this.surveyResponse.emit(response);
    this.showSurveyDialog = false;
  }

  onSurveySkipped(): void {
    console.log('📝 Lesson Runner V2 - Survey skipped');
    this.showSurveyDialog = false;
  }

  onSurveyDialogClosed(): void {
    this.showSurveyDialog = false;
  }

  /**
   * Override base toolbar styles to work with flexbox layout
   * We need the height for resize handle to work, but structure flex properly
   */
  override getToolbarStyles(): Record<string, string> {
    const styles: Record<string, string> = {
      'left.px': this.position.x.toString(),
      'top.px': this.position.y.toString(),
      'z-index': this.isDragging ? '9999' : '1000',
    };

    // Apply height when resizable (needed for resize handle to work)
    // The flex: 1 1 0 on panel-content will fill this height
    if (this.resizable) {
      styles['height.px'] = this.panelHeight.toString();
    }

    return styles;
  }
}
