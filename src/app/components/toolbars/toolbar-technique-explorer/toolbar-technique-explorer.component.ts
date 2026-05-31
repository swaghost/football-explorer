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
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Subscription,
  Observable,
  of,
  combineLatest,
  BehaviorSubject,
} from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { SketchState } from '../../../state/sketch.state';
import * as SketchActions from '../../../state/sketch.actions';
import { TreeNode } from '../../../interfaces';
import { DialogLessonSurveyComponent } from '../../dialogs/dialog-lesson-survey/dialog-lesson-survey.component';
import {
  LessonSurveyResponse,
  NodeSurveyResponse,
} from '../../../interfaces/lesson-survey.interfaces';
import { MockDataService } from '../../../services/mock-data.service';
import { FormattingService } from '../../../services/formatting.service';
import {
  BaseToolbarComponent,
  ToolbarPosition,
} from '../../shared/base-toolbar/base-toolbar.component';

@Component({
  selector: 'app-toolbar-technique-explorer',
  standalone: true,
  imports: [CommonModule, DialogLessonSurveyComponent],
  templateUrl: './toolbar-technique-explorer.component.html',
  styleUrls: ['./toolbar-technique-explorer.component.scss'],
})
export class ToolbarTechniqueExplorerComponent
  extends BaseToolbarComponent
  implements OnInit, OnDestroy, OnChanges, AfterViewInit
{
  // Toolbar identification (required by BaseToolbarComponent)
  readonly toolbarId = 'technique-explorer-toolbar';
  readonly toolbarIcon = '🏆';

  // Dynamic toolbar title based on selected node
  get toolbarTitle(): string {
    if (this.nodeData?.name) {
      return `Technique Explorer: ${this.nodeData.name}`;
    }
    return 'Technique Explorer';
  } // ViewChild references
  @ViewChild('nodeContent') nodeContent!: ElementRef;
  @ViewChild('techniqueVideo') techniqueVideo!: ElementRef<HTMLVideoElement>;

  // Component-specific inputs (removed duplicate base inputs: visible, isDarkMode, position, locked, expanded)
  @Input() selectedNode: string | null = null;
  @Input() nodeData: TreeNode | null = null;
  @Input() selectedNodes: string[] = [];
  @Input() exploratoryContentQualitySurveyEnabled = true;
  @Input() currentDatasetOwnership: string | null = null; // 'SYS', 'PERSONAL', 'TENANT', 'TEAM', 'TEAMGROUP'

  // Component-specific outputs (removed duplicate base outputs: close, toggleLock, dragStart, toggleExpanded)
  @Output() nodeSelected = new EventEmitter<string>();
  @Output() surveyResponse = new EventEmitter<any>();

  // Component state
  public headerText = 'Explore Node Content';
  public showSurveyDialog = false;
  public currentNodeExplorationId: string | null = null;
  public isFavorite = false;
  public isBookmarked = false;
  public shareUrlCopied = false;
  public lastVisitedText = ''; // Cached time string to avoid change detection errors

  // Reactive state
  private destroy$ = new BehaviorSubject<boolean>(false);

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    private mockDataService: MockDataService,
    private formattingService: FormattingService
  ) {
    super(); // Call base constructor
    // Set default position for this toolbar
    this.position = { x: 100, y: 200 };
    this.resizable = true; // Enable vertical resizing
    this.minHeight = 200;
    this.maxHeight = 800;
    this.defaultHeight = 400;
  }

  override ngOnInit(): void {
    super.ngOnInit(); // Call base initialization
    this.setupSubscriptions();
  }

  ngAfterViewInit(): void {
    // ViewChild is now available
    // Ensure video always starts muted when component initializes
    setTimeout(() => {
      if (this.techniqueVideo?.nativeElement) {
        this.techniqueVideo.nativeElement.muted = true;
      }
    }, 100);
  }

  override ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    super.ngOnDestroy(); // Call base cleanup
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedNode'] || changes['nodeData']) {
      this.updateFavoriteStatus();
      this.updateBookmarkStatus();
      this.updateLastVisitedText(); // Update cached time string
      // Refresh video when node data changes
      this.refreshVideo();
      // Scroll to top when content changes
      this.scrollToTop();
    }
  }

  private setupSubscriptions(): void {
    // Subscribe to panel height changes from store
    this.store
      .select(SketchState.getTechniqueExplorerHeight)
      .pipe(takeUntil(this.destroy$))
      .subscribe((height) => {
        this.panelHeight = height;
        this.cdr.detectChanges();
      });

    // Subscribe to heightChange events from base component and dispatch to store
    this.heightChange.pipe(takeUntil(this.destroy$)).subscribe((newHeight) => {
      this.store.dispatch(
        new SketchActions.SetTechniqueExplorerHeight(newHeight)
      );
    });

    // Subscribe to favorites changes
    this.store
      .select(SketchState.getFavoriteNodes)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateFavoriteStatus();
      });

    // Subscribe to bookmarks changes
    this.store
      .select(SketchState.getBookmarkedNodes)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateBookmarkStatus();
      });
  }

  // UI State Getters
  get isWaitingMode(): boolean {
    return !this.selectedNode || !this.nodeData;
  }

  get isExploratoryMode(): boolean {
    return !!this.selectedNode && !!this.nodeData;
  }

  get isCurrentNodeCompleted(): boolean {
    if (!this.selectedNode) return false;
    // Use NGXS state for exploration completion
    const completed = this.store.selectSnapshot(
      SketchState.isNodeCompletedInExploration
    )(this.selectedNode);
    // console.log(
    //   `🔭 isCurrentNodeCompleted for ${this.selectedNode}: ${completed}`
    // );
    return completed;
  }

  get currentNodeCompletionDate(): Date | null {
    if (!this.selectedNode) return null;
    // Get completion date from NGXS state
    const date = this.store.selectSnapshot(SketchState.getNodeCompletionDate)(
      this.selectedNode
    );
    return date;
  }

  get isShareEnabled(): boolean {
    // Only enable share for system datasets
    return this.currentDatasetOwnership === 'SYS' && !!this.selectedNode;
  }

  get lastVisitedDate(): Date | null {
    if (!this.selectedNode) return null;
    // Get the previous visit date (before the current selection)
    const previousVisit = this.store.selectSnapshot(
      SketchState.getNodePreviousVisited
    )(this.selectedNode);
    const visitCount = this.store.selectSnapshot(SketchState.getNodeVisitCount)(
      this.selectedNode
    );
    // console.log(
    //   `🔭 Node ${this.selectedNode}: visitCount=${visitCount}, previousVisit=${previousVisit}`
    // );
    return previousVisit;
  }

  get hasBeenVisitedBefore(): boolean {
    // Show message if there was a previous visit (not the current one)
    const result = this.lastVisitedDate !== null;
    return result;
  }

  private updateLastVisitedText(): void {
    // Update the cached time string - called in ngOnChanges, not during change detection
    const date = this.lastVisitedDate;
    this.lastVisitedText = this.formattingService.formatRelativeTime(date);
  }

  // Header Actions
  onToggleFavorite(event: Event): void {
    event.stopPropagation();
    if (!this.selectedNode) return;

    if (this.isFavorite) {
      this.store.dispatch(
        new SketchActions.RemoveFromFavorites(this.selectedNode)
      );
    } else {
      this.store.dispatch(
        new SketchActions.AddToFavorites(
          this.selectedNode,
          'Technique',
          this.nodeData?.name,
          ''
        )
      );
    }
    this.updateFavoriteStatus();
  }

  onToggleBookmark(event: Event): void {
    event.stopPropagation();
    if (!this.selectedNode) return;

    if (this.isBookmarked) {
      this.store.dispatch(
        new SketchActions.RemoveFromBookmarks(this.selectedNode)
      );
    } else {
      this.store.dispatch(
        new SketchActions.AddToBookmarks(
          this.selectedNode,
          this.nodeData?.name,
          ''
        )
      );
    }
    this.updateBookmarkStatus();
  }

  onShare(event: Event): void {
    event.stopPropagation();
    console.log('[TECHNIQUE-EXPLORER] 🔗 Share button clicked', {
      selectedNode: this.selectedNode,
      isShareEnabled: this.isShareEnabled,
      currentDatasetOwnership: this.currentDatasetOwnership,
      nodeData: this.nodeData,
    });
    if (!this.selectedNode || !this.isShareEnabled) return;

    // Get node name and escape it for URL
    const nodeName = this.nodeData?.name || 'node';
    const escapedNodeName = encodeURIComponent(nodeName);

    // Create share URL with new format: http://demosite.soccr.org/node/[id]/[escaped-node-name]
    const shareUrl = `http://demosite.soccr.org/node/${this.selectedNode}/${escapedNodeName}`;

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(
        () => {
          console.log('� Share URL copied to clipboard:', shareUrl);
          this.shareUrlCopied = true;
          // Reset the copied state after 2 seconds
          setTimeout(() => {
            this.shareUrlCopied = false;
            this.cdr.detectChanges();
          }, 2000);
        },
        (err) => {
          console.error('❌ Failed to copy share URL:', err);
        }
      );
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        console.log('� Share URL copied to clipboard (fallback):', shareUrl);
        this.shareUrlCopied = true;
        setTimeout(() => {
          this.shareUrlCopied = false;
          this.cdr.detectChanges();
        }, 2000);
      } catch (err) {
        console.error('❌ Failed to copy share URL (fallback):', err);
      }
      document.body.removeChild(textArea);
    }
  }

  // Note: onToggleExpanded, onClose, onToggleLock, and onDragStart are handled by BaseToolbarComponent
  // Note: Resize functionality is handled by BaseToolbarComponent

  // Explorer Mode Actions
  markAsCompleted(): void {
    if (!this.selectedNode) return;

    console.log(
      `🔭 BEFORE dispatch - Marking node ${this.selectedNode} as completed`
    );

    // Dispatch NGXS action to mark as completed in exploration history
    this.store
      .dispatch(
        new SketchActions.MarkNodeCompletedInExploration(this.selectedNode)
      )
      .subscribe(() => {
        // Trigger change detection
        this.cdr.detectChanges();

        // Show survey if enabled
        if (this.exploratoryContentQualitySurveyEnabled) {
          this.currentNodeExplorationId = this.selectedNode;
          this.showSurveyDialog = true;
        }
      });
  }

  markAsNeedsReview(): void {
    if (!this.selectedNode) return;

    console.log(
      `🔭 BEFORE dispatch - Marking node ${this.selectedNode} as needs review`
    );

    // Dispatch NGXS action to mark as needs review
    this.store
      .dispatch(new SketchActions.MarkNodeNeedsReview(this.selectedNode))
      .subscribe(() => {
        // Trigger change detection
        this.cdr.detectChanges();
      });
  }

  // Content Methods
  getNodeDescription(): string {
    if (!this.nodeData?.description) {
      return this.mockDataService.generateNodeDescription(
        this.selectedNode || '',
        true
      );
    }
    return this.nodeData.description;
  }

  // Survey Methods
  onSurveySubmitted(response: NodeSurveyResponse): void {
    console.log('📝 Technique Explorer Survey submitted:', response);
    this.surveyResponse.emit(response);
    this.showSurveyDialog = false;
    this.currentNodeExplorationId = null;
  }

  onSurveySkipped(): void {
    console.log('📝 Technique Explorer Survey skipped');
    this.showSurveyDialog = false;
    this.currentNodeExplorationId = null;
  }

  onSurveyDialogClosed(): void {
    this.showSurveyDialog = false;
    this.currentNodeExplorationId = null;
  }

  // Private Helper Methods
  private scrollToTop(): void {
    if (this.nodeContent && this.nodeContent.nativeElement) {
      this.nodeContent.nativeElement.scrollTop = 0;
    }
  }

  private updateFavoriteStatus(): void {
    if (!this.selectedNode) {
      this.isFavorite = false;
      return;
    }

    // Get favorite status from state
    this.store
      .select(SketchState.isFavorite)
      .subscribe((isFavoriteFn) => {
        this.isFavorite = isFavoriteFn(this.selectedNode!);
      })
      .unsubscribe();
  }

  private updateBookmarkStatus(): void {
    if (!this.selectedNode) {
      this.isBookmarked = false;
      return;
    }

    // Get bookmark status from state
    this.store
      .select(SketchState.isBookmarked)
      .subscribe((isBookmarkedFn) => {
        this.isBookmarked = isBookmarkedFn(this.selectedNode!);
      })
      .unsubscribe();
  }

  /**
   * Toggle video mute state when clicked
   */
  toggleVideoMute(video: HTMLVideoElement): void {
    video.muted = !video.muted;
  }

  /**
   * Debug: Video load start event
   */
  onVideoLoadStart(video: HTMLVideoElement): void {
    // Hide video while loading to prevent white flash
    video.removeAttribute('data-loaded');
    // console.log(
    //   '🎥 Technique Explorer - Video load started for node:',
    //   this.selectedNode
    // );
  }

  /**
   * Debug: Video can play event
   */
  onVideoCanPlay(video: HTMLVideoElement): void {
    // Show video once it's ready
    video.setAttribute('data-loaded', 'true');
    // console.log(
    //   '🎥 Technique Explorer - Video can play for node:',
    //   this.selectedNode
    // );
  }

  /**
   * Force refresh video element when node changes
   */
  refreshVideo(): void {
    setTimeout(() => {
      if (this.techniqueVideo?.nativeElement && this.nodeData?.videoUrl) {
        const video = this.techniqueVideo.nativeElement;
        // console.log(
        //   '🎥 Technique Explorer - Refreshing video:',
        //   this.selectedNode,
        //   this.nodeData.videoUrl
        // );

        // Force video reload by setting src again
        video.muted = true; // Ensure video stays muted
        video.load();
        video.play().catch((e) => {
          console.log('🎥 Technique Explorer - Video autoplay prevented:', e);
        });
      }
    }, 100); // Small delay to ensure DOM is updated
  }
}
