import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NodeListItemData {
  id: string;
  name: string;
  matchType?: string; // Optional for search results
}

@Component({
  selector: 'app-node-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './node-list-item.component.html',
  styleUrls: ['./node-list-item.component.scss'],
})
export class NodeListItemComponent {
  @Input() node!: NodeListItemData;
  @Input() selectedNode: string | null = null;
  @Input() isSelected: boolean = false;
  @Input() showMatchType: boolean = false; // For search results

  @Output() nodeClick = new EventEmitter<{
    node: NodeListItemData;
    event: MouseEvent;
  }>();

  get isCurrentSelected(): boolean {
    return this.selectedNode === this.node.id;
  }

  onClick(event: MouseEvent): void {
    this.nodeClick.emit({ node: this.node, event });
  }
}
