import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ElementRef,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { SketchState } from '../../../state/sketch.state';
import * as SketchActions from '../../../state/sketch.actions';
import { BookmarkedNode } from '../../../state/sketch.model';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';

@Component({
  selector: 'app-toolbar-bookmarks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toolbar-bookmarks.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-bookmarks.component.scss',
  ],
})
export class ToolbarBookmarksComponent
  extends BaseToolbarComponent
  implements OnInit, OnDestroy, AfterViewInit, OnChanges
{
  // Required base component properties
  readonly toolbarId = 'bookmarks-toolbar';
  readonly toolbarTitle = 'Bookmarks';
  readonly toolbarIcon = '🔖';
  // Component-specific inputs (base inputs inherited)
  @Input() selectedNode: string | null = null;
  @ViewChildren('bookmarkItems') bookmarkItems!: QueryList<ElementRef>;

  // Component-specific outputs
  @Output() nodeSelected = new EventEmitter<string>();
  @Output() panToNode = new EventEmitter<string>();

  bookmarkedNodes: BookmarkedNode[] = [];
  private subscriptions = new Subscription();

  constructor(private store: Store, private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit(); // Call parent ngOnInit to load help text and toolbar state

    // Subscribe to bookmarked nodes from NGXS state
    this.subscriptions.add(
      this.store
        .select(SketchState.getBookmarkedNodes)
        .subscribe((bookmarks) => {
          this.bookmarkedNodes = bookmarks || [];
          this.cdr.detectChanges();
        })
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy(); // Call parent ngOnDestroy to save toolbar state
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.scrollToSelectedNode();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedNode'] && !changes['selectedNode'].firstChange) {
      this.scrollToSelectedNode();
    }
  }

  private scrollToSelectedNode(): void {
    if (!this.selectedNode || !this.bookmarkItems) return;
    const items = this.bookmarkItems.toArray();
    const index = this.bookmarkedNodes.findIndex(
      (b) => b.nodeId === this.selectedNode
    );
    if (index >= 0 && items[index]) {
      const el = items[index].nativeElement as HTMLElement;
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  onNavigateToNode(nodeId: string): void {
    this.nodeSelected.emit(nodeId);
    this.panToNode.emit(nodeId);
  }

  onRemoveBookmark(event: Event, nodeId: string): void {
    event.stopPropagation(); // Prevent navigation when removing
    this.store.dispatch(new SketchActions.RemoveFromBookmarks(nodeId));
  }

  trackByNodeId(index: number, bookmark: BookmarkedNode): string {
    return bookmark.nodeId;
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return new Date(date).toLocaleDateString();
  }

  getSelectedBookmarkTitle(): string {
    if (!this.selectedNode) return '';
    const bookmark = this.bookmarkedNodes.find(
      (b) => b.nodeId === this.selectedNode
    );
    return bookmark
      ? bookmark.nodeTitle || this.selectedNode
      : this.selectedNode;
  }
}
