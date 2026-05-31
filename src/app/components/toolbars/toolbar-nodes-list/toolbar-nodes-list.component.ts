import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';
import {
  NodeListItemComponent,
  NodeListItemData,
} from '../../shared/node-list-item/node-list-item.component';

interface D3TreeNode {
  id: string;
  name?: string;
  data?: {
    name?: string;
  };
  [key: string]: any;
}

@Component({
  selector: 'app-toolbar-nodes-list',
  standalone: true,
  imports: [CommonModule, NodeListItemComponent],
  templateUrl: './toolbar-nodes-list.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-nodes-list.component.scss',
  ],
})
export class ToolbarNodesListComponent
  extends BaseToolbarComponent
  implements OnChanges
{
  // Required base component properties
  readonly toolbarId = 'nodes-list-toolbar';
  readonly toolbarTitle = 'Nodes List';
  readonly toolbarIcon = '📋';
  @ViewChild('nodesScrollContainer', { static: false })
  nodesScrollContainer!: ElementRef<HTMLDivElement>;

  // Component-specific inputs (base inputs inherited)
  @Input() currentNodesList: D3TreeNode[] = [];
  @Input() selectedNodes: string[] = [];
  @Input() selectedNode: string | null = null; // Single selected node for following
  @Input() followSelectedNode = true; // Enable/disable follow functionality

  @Output() nodeClick = new EventEmitter<{
    node: D3TreeNode;
    event: MouseEvent;
  }>();

  constructor() {
    super();
    // Set default height for this toolbar
    this.panelHeight = 400;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle selectedNode changes for follow functionality
    if (
      changes['selectedNode'] &&
      this.selectedNode &&
      this.followSelectedNode &&
      this.visible
    ) {
      setTimeout(() => {
        this.scrollToSelectedNode();
      }, 100); // Small delay to ensure DOM is updated
    }

    // Handle newly opened toolbar - scroll to selected node if one exists
    if (
      changes['visible'] &&
      this.visible &&
      this.selectedNode &&
      this.followSelectedNode
    ) {
      setTimeout(() => {
        this.scrollToSelectedNode();
      }, 200); // Slightly longer delay for opening animation
    }
  }

  // Base component methods are inherited - no need to override

  onNodeClickFromList(node: D3TreeNode, event: MouseEvent): void {
    this.nodeClick.emit({ node, event });
  }

  isNodeSelected(nodeId: string): boolean {
    return this.selectedNodes.includes(nodeId);
  }

  trackByNodeId(index: number, node: D3TreeNode): string {
    return node.id;
  }

  /**
   * Convert D3TreeNode to NodeListItemData format
   */
  toNodeListItem(node: D3TreeNode): NodeListItemData {
    return {
      id: node.id,
      name: node.data?.name || node.name || 'Unnamed',
    };
  }

  /**
   * Handle node click from shared component
   */
  onNodeItemClick(data: { node: NodeListItemData; event: MouseEvent }): void {
    // Find the original D3TreeNode
    const originalNode = this.currentNodesList.find(
      (n) => n.id === data.node.id
    );
    if (originalNode) {
      this.nodeClick.emit({ node: originalNode, event: data.event });
    }
  }

  /**
   * Scroll to the currently selected node in the list
   */
  private scrollToSelectedNode(): void {
    if (!this.selectedNode || !this.nodesScrollContainer?.nativeElement) {
      return;
    }

    // Find the index of the selected node in the list
    const nodeIndex = this.currentNodesList.findIndex(
      (node) => node.id === this.selectedNode
    );
    if (nodeIndex === -1) {
      console.log(
        `Node-List: Selected node ${this.selectedNode} not found in list`
      );
      return;
    }

    // Find the corresponding DOM element
    const nodeElements =
      this.nodesScrollContainer.nativeElement.querySelectorAll('.node-item');
    const targetElement = nodeElements[nodeIndex] as HTMLElement;

    if (!targetElement) {
      console.log(
        `Node-List: Could not find DOM element for node ${this.selectedNode}`
      );
      return;
    }

    // Calculate scroll position to center the element in the view
    const containerElement = this.nodesScrollContainer.nativeElement;
    const containerHeight = containerElement.clientHeight;
    const elementTop = targetElement.offsetTop;
    const elementHeight = targetElement.offsetHeight;

    const targetScrollTop =
      elementTop - containerHeight / 2 + elementHeight / 2;

    // Smooth scroll to the node
    containerElement.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth',
    });

    console.log(
      `Node-List: Scrolled to node ${this.selectedNode} at index ${nodeIndex}`
    );
  }
}
