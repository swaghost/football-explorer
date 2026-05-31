import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';

export interface SearchResult {
  id: string;
  name: string;
  matchType: 'id' | 'name';
}

@Component({
  selector: 'app-toolbar-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-search-new.component.html',
  styleUrls: ['./toolbar-search-new.component.scss'],
})
export class ToolbarSearchComponent
  extends BaseToolbarComponent
  implements OnInit, OnChanges
{
  // BaseToolbarComponent properties
  readonly toolbarId = 'search-toolbar';
  readonly toolbarTitle = 'Search';
  readonly toolbarIcon = '🔍';
  // Component-specific properties
  @Input() treeData: any = null;
  @Output() nodeSelected = new EventEmitter<any>();

  // Search properties
  public idSearchTerm = '';
  public termsSearchTerm = '';
  public searchResults: SearchResult[] = [];
  public searchPerformed = false;

  constructor() {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit(); // Call parent ngOnInit to load help text and toolbar state
    // Component initialization
  }

  ngOnChanges(changes: any): void {
    // Handle property changes
  }

  clearIdSearch(): void {
    this.idSearchTerm = '';
    this.searchResults = [];
    this.searchPerformed = false;
  }

  clearTermsSearch(): void {
    this.termsSearchTerm = '';
    this.searchResults = [];
    this.searchPerformed = false;
  }

  performSearch(): void {
    this.searchPerformed = true;
    this.searchResults = [];

    if (!this.treeData) {
      return;
    }

    // Search in tree data
    this.searchInNodes(this.treeData, this.searchResults);
  }

  private searchInNodes(node: any, results: SearchResult[]): void {
    if (!node) return;

    // Check if current node matches search criteria
    let matches = false;
    let matchType: 'id' | 'name' = 'id';

    // Search by ID
    if (
      this.idSearchTerm &&
      node.id &&
      node.id.toString().toLowerCase().includes(this.idSearchTerm.toLowerCase())
    ) {
      matches = true;
      matchType = 'id';
    }

    // Search by terms (name or other properties)
    if (
      this.termsSearchTerm &&
      node.name &&
      node.name.toLowerCase().includes(this.termsSearchTerm.toLowerCase())
    ) {
      matches = true;
      matchType = 'name';
    }

    if (matches) {
      results.push({
        id: node.id || 'N/A',
        name: node.name || 'Unnamed',
        matchType: matchType,
      });
    }

    // Recursively search children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any) => {
        this.searchInNodes(child, results);
      });
    }
  }

  selectSearchResult(result: SearchResult): void {
    this.nodeSelected.emit({
      id: result.id,
      name: result.name,
    });
  }
}
