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
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { SketchState } from '../../../state/sketch.state';
import {
  GlobalContextState,
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
import { MiniMatchFormationsService } from '../../../services/mini-match-formations.service';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { DialogLessonSurveyComponent } from '../../dialogs/dialog-lesson-survey/dialog-lesson-survey.component';
import { MiniMatchViewerComponent } from '../../child-components/mini-match-viewer/mini-match-viewer.component';
import {
  LessonSurveyResponse,
  NodeSurveyResponse,
} from '../../../interfaces/lesson-survey.interfaces';

@Component({
  selector: 'app-toolbar-lesson-builder-v2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmationDialogComponent,
    DialogLessonSurveyComponent,
    MiniMatchViewerComponent,
  ],
  templateUrl: './toolbar-lesson-builder-v2.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-lesson-builder-v2.component.scss',
  ],
})
export class ToolbarLessonBuilderV2Component
  extends BaseToolbarComponent
  implements OnInit, OnDestroy, OnChanges
{
  readonly toolbarId = 'lesson-builder-v2';
  readonly toolbarTitle = 'Lesson Builder V2';
  readonly toolbarIcon = '🎛️';

  // Inputs from parent (main UI)
  @Input() position: ToolbarPosition = { x: 100, y: 100 }; // Initialize with default position
  @Input() favoriteNodes: string[] = [];
  @ViewChildren('favoriteItems') favoriteItems!: QueryList<ElementRef>;
  @ViewChild('nodeContent') nodeContent!: ElementRef;
  @ViewChild('lessonVideo') lessonVideo!: ElementRef<HTMLVideoElement>;

  @Input() nodeData: TreeNode | null = null;
  @Input() selectedNodes: string[] = [];
  @Input() selectedNode: string | null = null;
  @Input() selectedLesson: any = null;
  @Input() treeData: TreeNode | null = null;

  // Selections pane inputs
  @Input() hasUnsavedChanges = false;
  @Input() canApplyChanges = false;

  // Outputs - combined actions
  @Output() applySelectionToLesson = new EventEmitter<void>();
  @Output() clearNodeSelection = new EventEmitter<void>();
  @Output() removeNodeFromSelection = new EventEmitter<string>();
  @Output() nodeSelect = new EventEmitter<string>();
  @Output() reorderNodes = new EventEmitter<{
    fromIndex: number;
    toIndex: number;
  }>();
  @Output() nodeSelected = new EventEmitter<string>(); // lesson runner node select
  @Output() surveyResponse = new EventEmitter<any>();

  // Component state
  public headerText = 'Lesson Builder V2';
  public selectedLessonNode: string | null = null;
  public selectedContextLessonBuilderLesson: any = null;
  public isFavorite = false;
  public isBookmarked = false;
  public shareUrlCopied = false;

  // Dialog states
  public showQuitDialog = false;
  public showFinishDialog = false;
  public showSurveyDialog = false;
  public currentLessonId: string | null = null;
  public currentLessonTitle = '';

  // Autopilot state
  public isAutopilotRunning = false;
  private autopilotTimer: any = null;
  private autopilotDelay = 2000; // 2 seconds between nodes
  public completedNodes: Set<string> = new Set();

  // Three-state panel mode: 'minimized' | 'normal' | 'maximized'
  // minimized: list hidden, content normal width, toolbar narrower
  // normal: list shown, content normal width, toolbar normal width
  // maximized: list hidden, content expanded, toolbar wider
  public panelMode: 'minimized' | 'normal' | 'maximized' = 'normal';

  // Legacy left pane collapse state (for header button)
  public leftCollapsed = false;

  // Right panel state
  public rightPanelOpen = false;
  public selectedFieldBackground = 'Guardiola'; // Default field background
  public selectedBaseFormation = 'Final Third - W'; // Default formation

  // Field background options - now loaded from service
  public fieldBackgroundOptions: any[] = [];

  // Base formation options - now loaded from service
  public baseFormationOptions: string[] = [];

  // Make Math available to template
  Math = Math;

  // Drag state for selections list
  private draggedIndex = -1;
  private draggedOverIndex = -1;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    private mockDataService: MockDataService,
    private miniMatchFormationsService: MiniMatchFormationsService
  ) {
    super();
    this.panelHeight = 400;
    this.resizable = true;
    this.maxHeight = 1200; // Expanded max height to accommodate mini-match-viewer controls
  }

  ngOnInit(): void {
    console.log(
      '[BUILDER-V2] 🚀 ngOnInit called, visible property:',
      this.visible
    );
    try {
      super.ngOnInit();
    } catch (error) {
      console.error('[BUILDER-V2] ❌ Error in super.ngOnInit():', error);
    }

    // Load field backgrounds and formations from service
    this.fieldBackgroundOptions =
      this.miniMatchFormationsService.getFieldBackgroundOptions();
    this.baseFormationOptions =
      this.miniMatchFormationsService.getFormationNames();

    this.setupSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
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

  private setupSubscriptions(): void {
    // Load expand state from store
    this.store
      .select(SketchState.getToolbarExpandStates)
      .pipe(takeUntil(this.destroy$))
      .subscribe((expandStates) => {
        // leftCollapsed is inverted from expanded state
        this.leftCollapsed = !expandStates.lessonBuilderV2;
      });

    this.store
      .select(SketchState.getFavoriteNodes)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateFavoriteStatus());
    this.store
      .select(SketchState.getBookmarkedNodes)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateBookmarkStatus());

    this.store
      .select(GlobalContextState.selectedContextLessonBuilderNode)
      .pipe(takeUntil(this.destroy$))
      .subscribe((nodeId) => {
        this.selectedLessonNode = nodeId;
        this.updateFavoriteStatus();
        this.updateBookmarkStatus();

        // Mark node as completed when it's selected/visited
        if (nodeId && this.currentLessonId) {
          this.store.dispatch(
            new MarkNodeCompleted(this.currentLessonId, nodeId)
          );
          this.completedNodes.add(nodeId);
          console.log('✅ Node marked as completed:', nodeId);
        }
      });

    // Subscribe to selected lesson builder lesson from global context
    console.log(
      '[BUILDER-V2] 🔧 Setting up selectedContextLessonBuilderLesson subscription'
    );
    const currentBuilderLesson = this.store.selectSnapshot(
      GlobalContextState.selectedContextLessonBuilderLesson
    );
    console.log('[BUILDER-V2] 📌 Current state snapshot:', {
      hasLesson: !!currentBuilderLesson,
      lessonName: currentBuilderLesson?.LessonName,
    });
    this.store
      .select(GlobalContextState.selectedContextLessonBuilderLesson)
      .pipe(takeUntil(this.destroy$))
      .subscribe((lesson) => {
        console.log('[BUILDER-V2] 📚 Lesson subscription fired:', {
          hasLesson: !!lesson,
          lessonName: lesson?.LessonName,
          lessonId: lesson?.LessonID,
          currentValue: this.selectedContextLessonBuilderLesson?.LessonName,
        });
        this.selectedContextLessonBuilderLesson = lesson;

        // Clear selected node when lesson is deactivated/cleared
        if (!lesson) {
          console.log(
            '[BUILDER-V2] 🧹 Clearing selected lesson node (lesson deactivated)'
          );
          this.selectedLessonNode = null;
          this.store.dispatch(new SetSelectedContextLessonNode(null));
        }

        this.cdr.markForCheck();
      });

    // Subscribe to Builder's tour state to track currently running lesson
    this.store
      .select(TourState.getCurrentBuilderLessonId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((lessonId) => {
        this.currentLessonId = lessonId;
        console.log('🎯 Builder V2 - Tour lesson ID updated:', lessonId);

        // Load completed nodes for this lesson
        if (lessonId) {
          const completedNodeIds = this.store.selectSnapshot(
            TourState.getCompletedNodes
          )(lessonId);
          this.completedNodes = new Set(completedNodeIds);
        } else {
          this.completedNodes.clear();
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
          '🎥 Lesson Builder V2 - Refreshing video:',
          this.selectedLessonNode,
          this.nodeData.videoUrl
        );

        // Force video reload by setting src again
        video.muted = true; // Ensure video stays muted
        video.load();
        video.play().catch((err) => {
          console.warn('🎥 Lesson Builder V2 - Auto-play failed:', err);
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
    console.log(
      '🎥 Lesson Builder V2 - Video load started for lesson node:',
      this.selectedLessonNode
    );
  }

  onVideoCanPlay(video: HTMLVideoElement): void {
    // Show video once it's ready
    video.setAttribute('data-loaded', 'true');
    // console.log(
    //   '🎥 Lesson Builder V2 - Video can play for lesson node:',
    //   this.selectedLessonNode
    // );
  }

  // Check if a node has been completed
  isNodeCompleted(nodeId: string): boolean {
    return this.completedNodes.has(nodeId);
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

  // Selection list helpers (copied from selected-nodes)
  onApplySelectionToLesson(): void {
    this.applySelectionToLesson.emit();
  }

  onClearNodeSelection(): void {
    this.clearNodeSelection.emit();
  }

  // Play button - start lesson tour in manual mode for BUILDER
  onPlayLesson(): void {
    if (
      !this.selectedContextLessonBuilderLesson ||
      !this.selectedContextLessonBuilderLesson.LessonID
    ) {
      console.warn('⚠️ Lesson Builder V2 - No lesson selected for Play');
      return;
    }

    console.log(
      '▶️ Lesson Builder V2 - Starting lesson tour (BUILDER context):',
      this.selectedContextLessonBuilderLesson.LessonID
    );
    this.store.dispatch(
      new StartLesson(
        this.selectedContextLessonBuilderLesson.LessonID,
        'builder'
      )
    );
    // TODO: Additional tour UI activation logic here
  }

  // Autopilot button - start lesson tour in auto mode for BUILDER
  onAutopilotLesson(): void {
    if (
      !this.selectedContextLessonBuilderLesson ||
      !this.selectedContextLessonBuilderLesson.LessonID
    ) {
      console.warn('⚠️ Lesson Builder V2 - No lesson selected for Autopilot');
      return;
    }

    if (!this.selectedNodes || this.selectedNodes.length === 0) {
      console.warn('⚠️ Lesson Builder V2 - No nodes in lesson for Autopilot');
      return;
    }

    console.log(
      '🚗 Lesson Builder V2 - Starting lesson autopilot (BUILDER context):',
      this.selectedContextLessonBuilderLesson.LessonID
    );

    // Start the tour and set to first node (index 0)
    this.store.dispatch(
      new StartLesson(
        this.selectedContextLessonBuilderLesson.LessonID,
        'builder'
      )
    );

    // Set to first node
    this.store.dispatch(
      new UpdateLessonNodeIndex(
        this.selectedContextLessonBuilderLesson.LessonID,
        0
      )
    );

    // Navigate to first node
    this.goToFirst();

    // Start autopilot
    this.isAutopilotRunning = true;
    this.startAutopilotSequence();
  }

  private startAutopilotSequence(): void {
    if (!this.isAutopilotRunning || !this.currentLessonId) return;

    const currentIndex = this.selectedNodes.indexOf(
      this.selectedLessonNode || ''
    );

    // Check if we're at the last node
    if (currentIndex >= this.selectedNodes.length - 1) {
      // At last node - finish the lesson
      console.log('🏁 Autopilot - Reached last node, finishing...');
      this.isAutopilotRunning = false;
      this.finish();
      return;
    }

    // Schedule next node
    this.autopilotTimer = setTimeout(() => {
      if (this.isAutopilotRunning && this.currentLessonId) {
        // Move to next node (completion will be marked by the subscription)
        this.goToNext();

        // Update node index in state
        const newIndex = this.selectedNodes.indexOf(
          this.selectedLessonNode || ''
        );
        this.store.dispatch(
          new UpdateLessonNodeIndex(this.currentLessonId, newIndex)
        );

        // Continue sequence
        this.startAutopilotSequence();
      }
    }, this.autopilotDelay);
  }

  public stopAutopilot(): void {
    this.isAutopilotRunning = false;
    if (this.autopilotTimer) {
      clearTimeout(this.autopilotTimer);
      this.autopilotTimer = null;
    }
    console.log('⏸️ Autopilot stopped');
  }

  // Toggle autopilot on/off
  public toggleAutopilot(): void {
    if (this.isAutopilotRunning) {
      this.stopAutopilot();
    } else {
      this.onAutopilotLesson();
    }
  }

  onRemoveNodeFromSelection(nodeId: string): void {
    this.removeNodeFromSelection.emit(nodeId);
  }

  onNodeSelect(nodeId: string): void {
    this.nodeSelect.emit(nodeId);
  }

  onNodeDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', this.selectedNodes[index]);
    }
    event.stopPropagation();
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    this.draggedOverIndex = index;
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  onDragLeave(event: DragEvent): void {
    this.draggedOverIndex = -1;
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    if (this.draggedIndex !== -1 && this.draggedIndex !== dropIndex) {
      this.reorderNodes.emit({
        fromIndex: this.draggedIndex,
        toIndex: dropIndex,
      });
    }
    this.draggedIndex = -1;
    this.draggedOverIndex = -1;
  }

  onNodeDragEnd(): void {
    this.draggedIndex = -1;
    this.draggedOverIndex = -1;
  }

  isDraggedItem(index: number): boolean {
    return this.draggedIndex === index;
  }

  isDropTarget(index: number): boolean {
    return this.draggedOverIndex === index && this.draggedIndex !== index;
  }

  // Small helpers copied from lesson-runner
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
    this.store.dispatch(new ToggleToolbarExpandState('lessonBuilderV2'));
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

  // Computed property for showing list panel
  get showListPanel(): boolean {
    return this.panelMode === 'normal';
  }

  // Lesson runner navigation stubs (wire these to existing lesson runner behavior as needed)
  get totalNodes(): number {
    return this.selectedNodes.length || 0;
  }

  get remainingNodes(): number {
    if (!this.selectedLessonNode) return this.totalNodes;
    return Math.max(0, this.totalNodes - (this.currentNodeNumber || 0));
  }

  get isFirstNode(): boolean {
    return this.currentNodeNumber <= 1;
  }

  get isLastNode(): boolean {
    return this.currentNodeNumber >= this.totalNodes;
  }

  get shouldDisableNext(): boolean {
    return this.isLastNode || this.isWaitingMode;
  }

  get shouldEnableFinish(): boolean {
    return !this.isWaitingMode && !this.isLastNode;
  }

  goToFirst(): void {
    if (!this.hasLessonNodes) return;
    this.selectedLessonNode = this.selectedNodes[0] || null;
    this.nodeSelected.emit(this.selectedLessonNode || '');

    // Update node index to 0
    if (this.currentLessonId && this.selectedLessonNode) {
      this.store.dispatch(new UpdateLessonNodeIndex(this.currentLessonId, 0));
    }
  }

  goToPrevious(): void {
    if (!this.selectedLessonNode) return;
    const idx = this.selectedNodes.indexOf(this.selectedLessonNode);
    if (idx > 0) {
      this.selectedLessonNode = this.selectedNodes[idx - 1];
      this.nodeSelected.emit(this.selectedLessonNode);

      // Update node index
      if (this.currentLessonId) {
        this.store.dispatch(
          new UpdateLessonNodeIndex(this.currentLessonId, idx - 1)
        );
      }
    }
  }

  goToNext(): void {
    if (!this.selectedLessonNode) return;
    const idx = this.selectedNodes.indexOf(this.selectedLessonNode);
    if (idx >= 0 && idx < this.selectedNodes.length - 1) {
      // Update node index
      if (this.currentLessonId) {
        this.store.dispatch(
          new UpdateLessonNodeIndex(this.currentLessonId, idx + 1)
        );
      }

      // Move to next node (completion will be marked by the subscription)
      this.selectedLessonNode = this.selectedNodes[idx + 1];
      this.nodeSelected.emit(this.selectedLessonNode);
    }
  }

  goToLast(): void {
    if (!this.hasLessonNodes) return;
    this.selectedLessonNode = this.selectedNodes[this.selectedNodes.length - 1];
    this.nodeSelected.emit(this.selectedLessonNode);

    // Update node index to last
    if (this.currentLessonId && this.selectedLessonNode) {
      this.store.dispatch(
        new UpdateLessonNodeIndex(
          this.currentLessonId,
          this.selectedNodes.length - 1
        )
      );
    }
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
    this.showFinishDialog = false;
    if (shouldSave) {
      this.showSurveyDialog = true;
    } else {
      this.surveyResponse.emit({ action: 'finish', save: false });
    }
  }

  onSurveySubmitted(response: LessonSurveyResponse): void {
    console.log('📝 Lesson Builder V2 - Survey submitted:', response);
    this.surveyResponse.emit(response);
    this.showSurveyDialog = false;
  }

  onSurveySkipped(): void {
    console.log('📝 Lesson Builder V2 - Survey skipped');
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
