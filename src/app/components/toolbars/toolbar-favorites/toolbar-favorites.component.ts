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
import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { SketchState } from '../../../state/sketch.state';
import * as SketchActions from '../../../state/sketch.actions';
import { FavoriteNode } from '../../../state/sketch.model';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';

@Component({
  selector: 'app-toolbar-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toolbar-favorites.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-favorites.component.scss',
  ],
})
export class ToolbarFavoritesComponent
  extends BaseToolbarComponent
  implements OnInit, OnDestroy
{
  // Required base component properties
  readonly toolbarId = 'favorites-toolbar';
  readonly toolbarTitle = 'Technique Toolbox';
  readonly toolbarIcon = '⭐';
  // Component-specific inputs (base inputs inherited)
  @Input() selectedNode: string | null = null;

  // Component-specific outputs
  @Output() nodeSelected = new EventEmitter<string>();
  @Output() panToNode = new EventEmitter<string>();

  favoriteNodes: FavoriteNode[] = [];
  private subscriptions = new Subscription();

  constructor(private store: Store, private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit(); // Call parent ngOnInit to load help text and toolbar state

    // Subscribe to favorite nodes from NGXS state
    this.subscriptions.add(
      this.store.select(SketchState.getFavoriteNodes).subscribe((favorites) => {
        this.favoriteNodes = favorites || [];
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy(); // Call parent ngOnDestroy to save toolbar state
    this.subscriptions.unsubscribe();
  }

  onNavigateToNode(nodeId: string): void {
    this.nodeSelected.emit(nodeId);
    this.panToNode.emit(nodeId);
  }

  onRemoveFavorite(event: Event, nodeId: string): void {
    event.stopPropagation(); // Prevent navigation when removing
    this.store.dispatch(new SketchActions.RemoveFromFavorites(nodeId));
  }

  trackByNodeId(index: number, favorite: FavoriteNode): string {
    return favorite.nodeId;
  }

  getSelectedFavoriteTitle(): string {
    if (!this.selectedNode) return '';
    const favorite = this.favoriteNodes.find(
      (f) => f.nodeId === this.selectedNode
    );
    return favorite?.nodeTitle || this.selectedNode;
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
}
