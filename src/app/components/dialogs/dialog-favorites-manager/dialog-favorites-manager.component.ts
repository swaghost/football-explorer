import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { SketchState } from '../../../state/sketch.state';
import * as SketchActions from '../../../state/sketch.actions';
import { FavoriteNode, BookmarkedNode } from '../../../state/sketch.model';

@Component({
  selector: 'app-dialog-favorites-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" *ngIf="visible" (click)="onOverlayClick()">
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" (click)="onClose()" title="Close">×</button>
        </div>

        <div class="dialog-content">
          <div class="tabs">
            <button
              class="tab-btn"
              [class.active]="activeTab === 'favorites'"
              (click)="activeTab = 'favorites'"
            >
              ⭐ Favorites ({{ (favoriteNodes$ | async)?.length || 0 }})
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab === 'bookmarks'"
              (click)="activeTab = 'bookmarks'"
            >
              🔖 Bookmarks ({{ (bookmarkedNodes$ | async)?.length || 0 }})
            </button>
          </div>

          <!-- Favorites Tab -->
          <div class="tab-content" *ngIf="activeTab === 'favorites'">
            <div
              class="category-filters"
              *ngIf="(favoriteNodes$ | async)?.length"
            >
              <button
                class="filter-btn"
                [class.active]="selectedCategory === 'all'"
                (click)="selectedCategory = 'all'"
              >
                All ({{ (favoriteNodes$ | async)?.length || 0 }})
              </button>
              <button
                class="filter-btn"
                [class.active]="selectedCategory === 'Movements'"
                (click)="selectedCategory = 'Movements'"
              >
                Movements ({{ getFilteredFavorites('Movements').length }})
              </button>
              <button
                class="filter-btn"
                [class.active]="selectedCategory === 'Match Skills'"
                (click)="selectedCategory = 'Match Skills'"
              >
                Match Skills ({{ getFilteredFavorites('Match Skills').length }})
              </button>
              <button
                class="filter-btn"
                [class.active]="selectedCategory === 'Technique'"
                (click)="selectedCategory = 'Technique'"
              >
                Technique ({{ getFilteredFavorites('Technique').length }})
              </button>
            </div>

            <div class="items-list">
              <div
                class="item"
                *ngFor="
                  let favorite of getDisplayedFavorites();
                  trackBy: trackByNodeId
                "
              >
                <div class="item-info">
                  <div class="item-title">
                    {{ favorite.nodeTitle || 'Node ' + favorite.nodeId }}
                  </div>
                  <div class="item-meta">
                    <span class="category">{{ favorite.category }}</span>
                    <span class="date">{{ formatDate(favorite.addedAt) }}</span>
                    <span class="node-id">ID: {{ favorite.nodeId }}</span>
                  </div>
                </div>
                <div class="item-actions">
                  <button
                    class="action-btn navigate-btn"
                    (click)="navigateToNode(favorite.nodeId)"
                    title="Navigate to this node"
                  >
                    📍 Go
                  </button>
                  <button
                    class="action-btn remove-btn"
                    (click)="removeFavorite(favorite.nodeId)"
                    title="Remove from favorites"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div class="empty-state" *ngIf="!getDisplayedFavorites().length">
                <div class="empty-icon">⭐</div>
                <div class="empty-text">
                  <p>
                    No favorites
                    {{
                      selectedCategory !== 'all' ? 'in ' + selectedCategory : ''
                    }}
                    yet
                  </p>
                  <p class="empty-hint">
                    Star nodes from system datasets to add them here!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Bookmarks Tab -->
          <div class="tab-content" *ngIf="activeTab === 'bookmarks'">
            <div class="items-list">
              <div
                class="item"
                *ngFor="
                  let bookmark of bookmarkedNodes$ | async;
                  trackBy: trackByNodeId
                "
              >
                <div class="item-info">
                  <div class="item-title">
                    {{ bookmark.nodeTitle || 'Node ' + bookmark.nodeId }}
                  </div>
                  <div class="item-meta">
                    <span class="date">{{ formatDate(bookmark.addedAt) }}</span>
                    <span class="node-id">ID: {{ bookmark.nodeId }}</span>
                  </div>
                </div>
                <div class="item-actions">
                  <button
                    class="action-btn navigate-btn"
                    (click)="navigateToNode(bookmark.nodeId)"
                    title="Navigate to this node"
                  >
                    📍 Go
                  </button>
                  <button
                    class="action-btn remove-btn"
                    (click)="removeBookmark(bookmark.nodeId)"
                    title="Remove bookmark"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div
                class="empty-state"
                *ngIf="!(bookmarkedNodes$ | async)?.length"
              >
                <div class="empty-icon">🔖</div>
                <div class="empty-text">
                  <p>No bookmarks yet</p>
                  <p class="empty-hint">
                    Bookmark nodes from system datasets to save your progress!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button
            class="footer-btn clear-btn"
            (click)="clearCurrentTab()"
            [disabled]="!hasItemsInCurrentTab()"
          >
            Clear {{ activeTab === 'favorites' ? 'Favorites' : 'Bookmarks' }}
          </button>
          <button class="footer-btn close-btn" (click)="onClose()">
            Close
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dialog-favorites-manager.component.scss'],
})
export class DialogFavoritesManagerComponent {
  @Input() visible = false;
  @Input() title = 'Favorites & Bookmarks Manager';

  @Output() close = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<string>();

  activeTab: 'favorites' | 'bookmarks' = 'favorites';
  selectedCategory: 'all' | 'Movements' | 'Match Skills' | 'Technique' = 'all';

  favoriteNodes$: Observable<FavoriteNode[]>;
  bookmarkedNodes$: Observable<BookmarkedNode[]>;

  constructor(private store: Store) {
    this.favoriteNodes$ = this.store.select(SketchState.getFavoriteNodes);
    this.bookmarkedNodes$ = this.store.select(SketchState.getBookmarkedNodes);
  }

  onClose() {
    this.close.emit();
  }

  onOverlayClick() {
    this.onClose();
  }

  getFilteredFavorites(
    category: 'Movements' | 'Match Skills' | 'Technique'
  ): FavoriteNode[] {
    const favoritesByCategory = this.store.selectSnapshot(
      SketchState.getFavoritesByCategory
    );
    return favoritesByCategory(category);
  }

  getDisplayedFavorites(): FavoriteNode[] {
    const allFavorites = this.store.selectSnapshot(
      SketchState.getFavoriteNodes
    );
    if (this.selectedCategory === 'all') {
      return allFavorites;
    }
    return this.getFilteredFavorites(this.selectedCategory);
  }

  trackByNodeId(index: number, item: FavoriteNode | BookmarkedNode): string {
    return item.nodeId;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  navigateToNode(nodeId: string) {
    this.navigate.emit(nodeId);
    this.onClose();
  }

  removeFavorite(nodeId: string) {
    this.store.dispatch(new SketchActions.RemoveFromFavorites(nodeId));
  }

  removeBookmark(nodeId: string) {
    this.store.dispatch(new SketchActions.RemoveFromBookmarks(nodeId));
  }

  clearCurrentTab() {
    if (this.activeTab === 'favorites') {
      this.store.dispatch(new SketchActions.ClearFavorites());
    } else {
      this.store.dispatch(new SketchActions.ClearBookmarks());
    }
  }

  hasItemsInCurrentTab(): boolean {
    if (this.activeTab === 'favorites') {
      return this.getDisplayedFavorites().length > 0;
    } else {
      const bookmarks = this.store.selectSnapshot(
        SketchState.getBookmarkedNodes
      );
      return bookmarks.length > 0;
    }
  }
}
