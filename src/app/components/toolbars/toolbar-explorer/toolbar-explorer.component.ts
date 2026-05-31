import {
  Component,
  ViewEncapsulation,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, combineLatest } from 'rxjs';
import { SketchState } from '../../../state/sketch.state';
import * as SketchActions from '../../../state/sketch.actions';
import { SetSelectedContextNode, GlobalContextState } from '../../../state';
import { SharedNodeDisplayComponent } from '../../shared/node-display/shared-node-display.component';
import { DialogFavoritesManagerComponent } from '../../dialogs/dialog-favorites-manager/dialog-favorites-manager.component';
import { isSystemLevelResource } from '../../../utils/ownership-context.utils';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';

@Component({
  selector: 'app-toolbar-explorer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedNodeDisplayComponent,
    DialogFavoritesManagerComponent,
  ],
  templateUrl: './toolbar-explorer.component.html',
  styleUrls: ['./toolbar-explorer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ToolbarExplorerComponent extends BaseToolbarComponent {
  // BaseToolbarComponent properties
  readonly toolbarId = 'explorer-toolbar';
  readonly toolbarTitle = 'Explorer';
  readonly toolbarIcon = '�';
  selectedNodeId$: Observable<string | null>;
  isFavorite$: Observable<boolean>;
  isBookmarked$: Observable<boolean>;
  isSystemDataset$: Observable<boolean>;
  showFavoritesManager = false;

  constructor(private store: Store) {
    super();

    this.selectedNodeId$ = this.store.select(
      GlobalContextState.selectedContextNode
    );

    // Create observables for favorite and bookmark status
    this.isFavorite$ = this.selectedNodeId$.pipe(
      map((nodeId) => {
        if (!nodeId) return false;
        const isFavoriteSelector = this.store.selectSnapshot(
          SketchState.isFavorite
        );
        return isFavoriteSelector(nodeId);
      })
    );

    this.isBookmarked$ = this.selectedNodeId$.pipe(
      map((nodeId) => {
        if (!nodeId) return false;
        const isBookmarkedSelector = this.store.selectSnapshot(
          SketchState.isBookmarked
        );
        return isBookmarkedSelector(nodeId);
      })
    );

    // For now, we'll determine if it's a system dataset by checking the current dataset
    // In a full implementation, this would check the actual dataset of the current node
    this.isSystemDataset$ = this.store
      .select(SketchState.getDecisionFlows)
      .pipe(
        map((flows) => {
          // Check if any system datasets are available and currently selected
          return flows.some((flow) =>
            isSystemLevelResource(flow.OwnershipContext)
          );
        })
      );
  }

  toggleFavorite(
    nodeId: string,
    category: 'Movements' | 'Match Skills' | 'Technique'
  ) {
    if (!nodeId) return;

    const isFavoriteSelector = this.store.selectSnapshot(
      SketchState.isFavorite
    );
    const isFavorited = isFavoriteSelector(nodeId);

    if (isFavorited) {
      this.store.dispatch(new SketchActions.RemoveFromFavorites(nodeId));
    } else {
      // Get current node title if available (this would typically come from the node data)
      const nodeTitle = `Node ${nodeId}`; // Placeholder
      this.store.dispatch(
        new SketchActions.AddToFavorites(nodeId, category, nodeTitle)
      );
    }
  }

  toggleBookmark(nodeId: string) {
    if (!nodeId) return;

    const isBookmarkedSelector = this.store.selectSnapshot(
      SketchState.isBookmarked
    );
    const isBookmarked = isBookmarkedSelector(nodeId);

    if (isBookmarked) {
      this.store.dispatch(new SketchActions.RemoveFromBookmarks(nodeId));
    } else {
      // Get current node title if available (this would typically come from the node data)
      const nodeTitle = `Node ${nodeId}`; // Placeholder
      this.store.dispatch(new SketchActions.AddToBookmarks(nodeId, nodeTitle));
    }
  }

  markAsCompleted(nodeId: string) {
    if (nodeId) {
      // Update node status - this would typically dispatch an NGXS action
      console.log('Marking node as completed:', nodeId);
      // TODO: Dispatch action to update node completion status
      // this.store.dispatch(new UpdateNodeStatus(nodeId, { isCompleted: true }));
    }
  }

  markAsNeedsReview(nodeId: string) {
    if (nodeId) {
      // Update node review status - this would typically dispatch an NGXS action
      console.log('Marking node as needs review:', nodeId);
      // TODO: Dispatch action to update node review status
      // this.store.dispatch(new UpdateNodeStatus(nodeId, { needsReview: true }));
    }
  }

  onNavigateToNode(nodeId: string) {
    // Dispatch action to navigate to the specified node
    this.store.dispatch(new SetSelectedContextNode(nodeId));
  }
}
