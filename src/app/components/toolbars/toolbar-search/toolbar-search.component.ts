import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';
import {
  NodeListItemComponent,
  NodeListItemData,
} from '../../shared/node-list-item/node-list-item.component';

export interface SearchResult {
  id: string;
  name: string;
  matchType: 'id' | 'name';
}

@Component({
  selector: 'app-toolbar-search',
  standalone: true,
  imports: [CommonModule, FormsModule, NodeListItemComponent],
  templateUrl: './toolbar-search.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-search.component.scss',
  ],
})
export class ToolbarSearchComponent
  extends BaseToolbarComponent
  implements OnInit, OnChanges
{
  // Required base component properties
  readonly toolbarId = 'search-toolbar';
  readonly toolbarTitle = 'Search';
  readonly toolbarIcon = '🔍';
  readonly toolbarHelp =
    'Search for nodes by ID or name. Enter any text to search - if you enter numbers, ID matches will appear first, followed by name matches. Text searches will only show name matches. Click a result to select and pan to the node, or Shift+Click to add to selection. Results show match type (ID or Name) for clarity.';

  // Search-specific inputs
  @Input() treeData: any = null;
  @Input() selectedNode: string | null = null;

  // Search-specific outputs
  @Output() nodeSelected = new EventEmitter<string>(); // Emit just the node ID
  @Output() nodeToggleSelection = new EventEmitter<string>();

  // Search properties
  public searchTerm = '';
  public searchResults: SearchResult[] = [];
  public searchPerformed = false;

  override ngOnInit(): void {
    super.ngOnInit();
    // Search-specific initialization
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle property changes
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchResults = [];
    this.searchPerformed = false;
  }

  performSearch(): void {
    this.searchPerformed = true;
    this.searchResults = [];

    if (!this.treeData || !this.searchTerm) {
      return;
    }

    const isNumeric = /^\d+$/.test(this.searchTerm.trim());
    const resultsMap = new Map<string, SearchResult>();

    // Search in tree data
    this.searchInNodes(this.treeData, resultsMap, isNumeric);

    // Convert map to array, sorted by ID matches first (if numeric), then name matches
    const allResults = Array.from(resultsMap.values());

    if (isNumeric) {
      // Sort: ID matches first, then name-only matches
      this.searchResults = allResults.sort((a, b) => {
        if (a.matchType === 'id' && b.matchType !== 'id') return -1;
        if (a.matchType !== 'id' && b.matchType === 'id') return 1;
        return 0;
      });
    } else {
      this.searchResults = allResults;
    }
  }

  private searchInNodes(
    node: any,
    resultsMap: Map<string, SearchResult>,
    isNumeric: boolean
  ): void {
    if (!node) return;

    const searchLower = this.searchTerm.toLowerCase().trim();
    const nodeId = node.id || 'N/A';
    let matchesId = false;
    let matchesName = false;

    // If numeric, check ID match
    if (
      isNumeric &&
      node.id &&
      node.id.toString().toLowerCase().includes(searchLower)
    ) {
      matchesId = true;
    }

    // Always check name match
    if (node.name && node.name.toLowerCase().includes(searchLower)) {
      matchesName = true;
    }

    // Add to results map if matches either criteria
    if (matchesId || matchesName) {
      // Determine match type - prioritize 'id' if both match
      let matchType: 'id' | 'name' = 'name';
      if (matchesId && matchesName) {
        matchType = 'id'; // Show as ID match when both match
      } else if (matchesId) {
        matchType = 'id';
      }

      resultsMap.set(nodeId, {
        id: nodeId,
        name: node.name || 'Unnamed',
        matchType: matchType,
      });
    }

    // Recursively search children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any) => {
        this.searchInNodes(child, resultsMap, isNumeric);
      });
    }
  }

  selectSearchResult(result: SearchResult, event?: MouseEvent): void {
    if (event?.shiftKey) {
      // Shift-click: add to selection
      this.nodeToggleSelection.emit(result.id);
    } else {
      // Normal click: select node and pan to it - emit just the ID
      this.nodeSelected.emit(result.id);
    }
  }

  /**
   * Convert SearchResult to NodeListItemData format
   */
  toNodeListItem(result: SearchResult): NodeListItemData {
    return {
      id: result.id,
      name: result.name,
      matchType: result.matchType,
    };
  }

  /**
   * Handle node click from shared component
   */
  onNodeItemClick(data: { node: NodeListItemData; event: MouseEvent }): void {
    const result: SearchResult = {
      id: data.node.id,
      name: data.node.name,
      matchType: (data.node.matchType as 'id' | 'name') || 'id',
    };
    this.selectSearchResult(result, data.event);
  }
}
