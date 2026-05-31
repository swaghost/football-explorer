import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeNode } from '../../../interfaces/tree.interfaces';
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';

interface ReparentData {
  newParentId: string;
}

@Component({
  selector: 'app-dialog-reparent-node',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDialogComponent],
  templateUrl: './dialog-reparent-node.component.html',

})
export class DialogReparentNodeComponent implements OnChanges {
  @Input() visible = false;
  @Input() isDarkMode = false;
  @Input() selectedNodeId: string | null = null;
  @Input() treeData: TreeNode | null = null;

  @Output() confirm = new EventEmitter<ReparentData>();
  @Output() cancel = new EventEmitter<void>();

  public newParentId = '';
  public availableNodes: { id: string; name: string; depth: number }[] = [];

  ngOnChanges(): void {
    if (this.visible && this.treeData && this.selectedNodeId) {
      this.buildAvailableNodesList();
    }
  }

  get isFormValid(): boolean {
    return (
      this.newParentId.trim().length > 0 &&
      this.newParentId !== this.selectedNodeId
    );
  }

  onConfirm(): void {
    if (this.isFormValid) {
      this.confirm.emit({
        newParentId: this.newParentId,
      });
      this.resetForm();
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.newParentId = '';
    this.availableNodes = [];
  }

  private buildAvailableNodesList(): void {
    this.availableNodes = [];

    if (!this.treeData || !this.selectedNodeId) return;

    const collectNodes = (node: TreeNode, depth = 0): void => {
      // Don't include the selected node itself or its descendants
      if (
        node.id !== this.selectedNodeId &&
        !this.isDescendantOf(node.id, this.selectedNodeId)
      ) {
        this.availableNodes.push({
          id: node.id,
          name: node.name || node.id,
          depth: depth,
        });
      }

      if (node.children) {
        for (const child of node.children) {
          collectNodes(child, depth + 1);
        }
      }
    };

    collectNodes(this.treeData);
  }

  private isDescendantOf(nodeId: string, ancestorId: string): boolean {
    if (!this.treeData) return false;

    const findNode = (node: TreeNode, targetId: string): TreeNode | null => {
      if (node.id === targetId) return node;

      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, targetId);
          if (found) return found;
        }
      }

      return null;
    };

    const selectedNode = findNode(this.treeData, ancestorId);
    if (!selectedNode) return false;

    const isInSubtree = (node: TreeNode, targetId: string): boolean => {
      if (node.id === targetId) return true;

      if (node.children) {
        for (const child of node.children) {
          if (isInSubtree(child, targetId)) return true;
        }
      }

      return false;
    };

    return isInSubtree(selectedNode, nodeId);
  }

  getNodeDisplayText(node: {
    id: string;
    name: string;
    depth: number;
  }): string {
    const indent = '  '.repeat(node.depth);
    return `${indent}${node.name} (${node.id})`;
  }
}

