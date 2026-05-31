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
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { BaseSlidingDrawer } from '../../shared/base-sliding-drawer/base-sliding-drawer';
import {
  GlobalContextState,
  SetSelectedContextLessonRunnerLesson,
  SetSelectedContextTenant,
  UpdateAssignedLessonStatus,
} from '../../../state';
import { LessonsState } from '../../../state/lessons.state';
import { AssignedLesson } from '../../../services/mock-assigned-lesson.service';
import { ILesson } from '../../../interfaces/lesson-builder.interfaces';

@Component({
  selector: 'app-drawer-assigned-lessons',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseSlidingDrawer],
  templateUrl: './drawer-assigned-lessons.html',
  styleUrl: './drawer-assigned-lessons.scss',
})
export class DrawerAssignedLessons implements OnInit, OnDestroy {
  @Input() isOpen = false;

  @Output() close = new EventEmitter<void>();

  assignedLessons: AssignedLesson[] = [];
  selectedLessonId: number | null = null;
  includeCompletedLessons = false; // Toggle for showing completed lessons
  expandedLessons = new Set<number>(); // Track which lessons have expanded details
  private subscription = new Subscription();

  // Help text for the drawer
  public readonly drawerHelp = `
    <strong>Assigned Lessons Drawer</strong><br><br>
    View lessons that have been assigned to teams and team groups within your tenant.<br><br>
    <strong>Features:</strong><br>
    • See all lesson assignments<br>
    • Track assigned nodes<br>
    • View assignment targets (teams/team groups)<br>
    • Click a lesson to select it for the Lesson Runner<br>
    • Toggle to include completed lessons<br>
  `;

  constructor(private store: Store, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Subscribe to tenant changes to update assigned lessons
    this.subscription.add(
      this.store
        .select(GlobalContextState.selectedContextTenant)
        .subscribe((tenant) => {
          console.log('[DRAWER] 🔄 Tenant state updated:', {
            hasTenant: !!tenant,
            assignedLessonsCount: tenant?.assignedLessons?.length,
            lessons: tenant?.assignedLessons?.map((l) => ({
              id: l.lessonId,
              name: l.lessonName,
              status: l.status,
            })),
          });
          this.assignedLessons = tenant?.assignedLessons || [];
          this.cdr.markForCheck(); // Trigger change detection when lessons update
        })
    );

    // Subscribe to selected lesson runner lesson to highlight selection
    this.subscription.add(
      this.store
        .select(GlobalContextState.selectedContextLessonRunnerLesson)
        .subscribe((lesson) => {
          this.selectedLessonId = lesson?.LessonID ?? null;
          this.cdr.markForCheck(); // Trigger change detection when selection changes
        })
    );

    // Set up periodic change detection to catch status updates
    // Since we're mutating assignedLessons objects directly in d3-ui-vers6,
    // we need to periodically check for changes
    const intervalId = setInterval(() => {
      if (this.isOpen) {
        this.cdr.markForCheck();
      }
    }, 1000); // Check every second when drawer is open

    this.subscription.add({
      unsubscribe: () => clearInterval(intervalId),
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onClose(): void {
    this.close.emit();
  }

  /**
   * Get the currently selected lesson
   */
  get selectedLesson(): AssignedLesson | null {
    if (!this.selectedLessonId) {
      return null;
    }
    return (
      this.assignedLessons.find((l) => l.lessonId === this.selectedLessonId) ||
      null
    );
  }

  /**
   * Get filtered assigned lessons based on status and toggle
   */
  get filteredAssignedLessons(): AssignedLesson[] {
    // Ensure all lessons have a status field (backward compatibility)
    const lessonsWithStatus = this.assignedLessons.map((lesson) => {
      if (!lesson.status) {
        // Create new object with status field for lessons that don't have it
        return { ...lesson, status: 'NOT_STARTED' as const };
      }
      return lesson;
    });

    if (this.includeCompletedLessons) {
      return lessonsWithStatus;
    }
    // Filter out COMPLETED lessons unless toggle is on
    return lessonsWithStatus.filter((lesson) => lesson.status !== 'COMPLETED');
  }

  /**
   * Toggle the include completed lessons flag
   */
  toggleIncludeCompleted(): void {
    this.includeCompletedLessons = !this.includeCompletedLessons;
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: string): string {
    // Handle undefined or null status
    if (!status) {
      return 'status-not-started';
    }
    switch (status) {
      case 'NOT_STARTED':
        return 'status-not-started';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'COMPLETED':
        return 'status-completed';
      case 'REVIEW_NEEDED':
        return 'status-review-needed';
      default:
        return 'status-not-started';
    }
  }

  /**
   * Get status display text
   */
  getStatusText(status: string): string {
    // Handle undefined or null status
    if (!status) {
      return 'Not Started';
    }
    switch (status) {
      case 'NOT_STARTED':
        return 'Not Started';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'REVIEW_NEEDED':
        return 'Review Needed';
      default:
        return 'Not Started';
    }
  }

  /**
   * Check if lesson is due today or overdue (and not completed)
   */
  isDueOrOverdue(assignment: AssignedLesson): boolean {
    if (assignment.status === 'COMPLETED' || !assignment.dueDate) {
      return false;
    }

    const dueDate = new Date(assignment.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate <= today;
  }

  /**
   * Toggle expanded state for a lesson
   */
  toggleExpanded(lessonId: number, event: Event): void {
    event.stopPropagation(); // Prevent lesson selection
    if (this.expandedLessons.has(lessonId)) {
      this.expandedLessons.delete(lessonId);
    } else {
      this.expandedLessons.add(lessonId);
    }
  }

  /**
   * Check if a lesson is expanded
   */
  isExpanded(lessonId: number): boolean {
    return this.expandedLessons.has(lessonId);
  }

  /**
   * Get lesson description from the lessons state
   */
  getLessonDescription(lessonId: number): string {
    const allLessons = this.store.selectSnapshot(LessonsState.getLessons);
    const lesson = allLessons.find((l) => l.LessonID === lessonId);
    return lesson?.LessonDesc || 'No description available';
  }

  /**
   * Get node name from node ID
   */
  getNodeName(nodeId: string): string {
    const dataset = this.store.selectSnapshot(
      GlobalContextState.selectedContextDataset
    );

    if (!dataset?.treeData) {
      return nodeId; // Fallback to ID if no tree data
    }

    // Recursively search for the node in the tree
    const findNode = (node: any): string | null => {
      if (node.id === nodeId) {
        return node.name;
      }
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          const found = findNode(child);
          if (found) return found;
        }
      }
      return null;
    };

    const nodeName = findNode(dataset.treeData);
    return nodeName || nodeId; // Fallback to ID if not found
  }

  /**
   * Mark a completed lesson as needing review
   */
  markForReview(assignment: AssignedLesson, event: Event): void {
    event.stopPropagation(); // Prevent lesson selection

    // Update the lesson in the tenant state
    this.store.dispatch(
      new UpdateAssignedLessonStatus(assignment.lessonId, 'REVIEW_NEEDED')
    );
    this.cdr.markForCheck(); // Trigger change detection
  }

  /**
   * Select a lesson for the Lesson Runner and mark as IN_PROGRESS
   */
  onSelectLesson(assignment: AssignedLesson): void {
    console.log('🎯 Assigned lesson selected:', assignment.lessonName);

    // Toggle selection: if already selected, deselect it
    if (this.selectedLessonId === assignment.lessonId) {
      console.log('🔄 Deselecting lesson:', assignment.lessonName);
      this.store.dispatch(new SetSelectedContextLessonRunnerLesson(null));
      return;
    }

    // Update status to IN_PROGRESS if not already completed or in progress
    if (
      assignment.status === 'NOT_STARTED' ||
      assignment.status === 'REVIEW_NEEDED' ||
      !assignment.status
    ) {
      // Update the lesson status to IN_PROGRESS
      this.store.dispatch(
        new UpdateAssignedLessonStatus(assignment.lessonId, 'IN_PROGRESS')
      );
      this.cdr.markForCheck(); // Trigger change detection
    }

    // Get all lessons from state
    const allLessons = this.store.selectSnapshot(LessonsState.getLessons);

    // Find the full lesson object by ID
    const lesson = allLessons.find((l) => l.LessonID === assignment.lessonId);

    if (lesson) {
      // Dispatch action to update selected lesson runner lesson
      this.store.dispatch(new SetSelectedContextLessonRunnerLesson(lesson));
    } else {
      console.error('❌ Assigned lesson not found in state:', {
        searchingForId: assignment.lessonId,
        lessonName: assignment.lessonName,
      });
    }
  }

  /**
   * Update a lesson's status in the tenant state
   */
  /**
   * Debug hover event - shows lesson ID and whether it exists in tenant's lesson list
   */
  onHoverLesson(assignment: AssignedLesson): void {
    // Get tenant from state
    const tenant = this.store.selectSnapshot(
      GlobalContextState.selectedContextTenant
    );

    // Get all lessons from state
    const allLessons = this.store.selectSnapshot(LessonsState.getLessons);

    // Check if lesson exists in state
    const existsInState = allLessons.some(
      (l) => l.LessonID === assignment.lessonId
    );

    // Check if lesson exists in tenant's lesson list
    const existsInTenant = tenant?.lessons?.some(
      (l) => l.LessonID === assignment.lessonId
    );

    console.log('👁️ Hovering over assigned lesson:', {
      lessonId: assignment.lessonId,
      lessonName: assignment.lessonName,
      existsInState: existsInState ? '✅ YES' : '❌ NO',
      existsInTenant: existsInTenant ? '✅ YES' : '❌ NO',
      tenantName: tenant?.TenantName,
      totalTenantLessons: tenant?.lessons?.length || 0,
      totalStateLessons: allLessons.length,
    });
  }
}
