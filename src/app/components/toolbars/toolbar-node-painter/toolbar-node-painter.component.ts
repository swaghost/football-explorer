import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';

@Component({
  selector: 'app-toolbar-node-painter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-node-painter.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-node-painter.component.scss',
  ],
})
export class ToolbarNodePainterComponent extends BaseToolbarComponent {
  // Required BaseToolbarComponent properties
  readonly toolbarId = 'node-painter-toolbar';
  readonly toolbarTitle = 'BUILDER';
  readonly toolbarIcon = '🎨';
  // Component-specific inputs
  @Input() selectedNode: string | null = null;
  @Input() selectedNodeHasChildren = false;

  // Component-specific outputs
  @Output() addChild = new EventEmitter<void>();
  @Output() reparentNode = new EventEmitter<void>();
  @Output() insertBetween = new EventEmitter<void>();
  @Output() promoteNode = new EventEmitter<void>();
  @Output() deleteNode = new EventEmitter<void>();
  @Output() editNode = new EventEmitter<void>();
  @Output() clearChildren = new EventEmitter<void>();
  @Output() promoteChildren = new EventEmitter<void>();

  constructor() {
    super();
  }

  get isNodeSelected(): boolean {
    return this.selectedNode !== null && this.selectedNode !== undefined;
  }

  onAddChild(event: Event): void {
    event.stopPropagation();
    if (this.isNodeSelected) {
      this.addChild.emit();
    }
  }

  onReparentNode(event: Event): void {
    event.stopPropagation();
    if (this.isNodeSelected) {
      this.reparentNode.emit();
    }
  }

  onInsertBetween(event: Event): void {
    event.stopPropagation();
    if (this.isNodeSelected) {
      this.insertBetween.emit();
    }
  }

  onPromoteNode(event: Event): void {
    event.stopPropagation();
    if (this.isNodeSelected) {
      this.promoteNode.emit();
    }
  }

  onDeleteNode(event: Event): void {
    event.stopPropagation();
    if (this.isNodeSelected) {
      this.deleteNode.emit();
    }
  }

  onEditNode(event: Event): void {
    console.log('Edit Node button clicked', {
      isNodeSelected: this.isNodeSelected,
      selectedNode: this.selectedNode,
    });
    event.stopPropagation();
    if (this.isNodeSelected) {
      this.editNode.emit();
    }
  }

  onClearChildren(event: Event): void {
    console.log('Clear Children button clicked', {
      isNodeSelected: this.isNodeSelected,
      selectedNodeHasChildren: this.selectedNodeHasChildren,
      selectedNode: this.selectedNode,
    });
    event.stopPropagation();
    if (this.isNodeSelected) {
      this.clearChildren.emit();
    }
  }

  onPromoteChildren(event: Event): void {
    console.log('Promote Children button clicked', {
      isNodeSelected: this.isNodeSelected,
      selectedNodeHasChildren: this.selectedNodeHasChildren,
      selectedNode: this.selectedNode,
    });
    event.stopPropagation();
    if (this.isNodeSelected) {
      this.promoteChildren.emit();
    }
  }
}
