import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';
import { ColorsService } from '../../../services/colors.service';
import { INodeStyle } from '../../../interfaces';
import { ILesson } from '../../../interfaces/lesson-builder.interfaces';

@Component({
  selector: 'app-toolbar-selected-nodes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toolbar-selected-nodes.component.html',
  styleUrls: ['./toolbar-selected-nodes.component.scss'],
})
export class ToolbarSelectedNodesComponent extends BaseToolbarComponent {
  // Required BaseToolbarComponent properties
  readonly toolbarId = 'selected-nodes-toolbar';
  readonly toolbarTitle = 'Selections';
  readonly toolbarIcon = '🎯';
  // Component-specific inputs
  @Input() selectedNodes: string[] = [];
  @Input() selectedLesson: ILesson | null = null;
  @Input() selectionMatchesLesson = false;
  @Input() currentSelectedNode: string | null = null;
  @Input() hasUnsavedChanges = false;
  @Input() canApplyChanges = false;

  // Component-specific outputs
  @Output() applySelectionToLesson = new EventEmitter<void>();
  @Output() clearNodeSelection = new EventEmitter<void>();
  @Output() removeNodeFromSelection = new EventEmitter<string>();
  @Output() nodeSelect = new EventEmitter<string>();
  @Output() reorderNodes = new EventEmitter<{
    fromIndex: number;
    toIndex: number;
  }>();

  // Drag and drop state
  private draggedIndex = -1;
  private draggedOverIndex = -1;

  constructor(private colorsService: ColorsService) {
    super();
  }

  // Get styling for selected nodes list items
  get selectedNodesStyle(): INodeStyle {
    return this.colorsService.getSelectedNodesStyle();
  }

  // Get text color specifically for selected nodes
  get selectedNodesTextColor(): string {
    return this.selectedNodesStyle.textColor;
  }

  // Get background color specifically for selected nodes
  get selectedNodesBackgroundColor(): string {
    return this.selectedNodesStyle.nodeColor;
  }

  // Get a darker version of the selected nodes color for hover state
  get selectedNodesHoverColor(): string {
    const baseColor = this.selectedNodesStyle.nodeColor;
    // Create a darker version by reducing the lightness
    return this.darkenColor(baseColor, 0.1);
  }

  // Helper method to darken a hex color
  private darkenColor(color: string, factor: number): string {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Darken by reducing each component
    const newR = Math.round(r * (1 - factor));
    const newG = Math.round(g * (1 - factor));
    const newB = Math.round(b * (1 - factor));

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG
      .toString(16)
      .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  onApplySelectionToLesson(): void {
    this.applySelectionToLesson.emit();
  }

  onClearNodeSelection(): void {
    this.clearNodeSelection.emit();
  }

  onRemoveNodeFromSelection(nodeId: string): void {
    this.removeNodeFromSelection.emit(nodeId);
  }

  onNodeSelect(nodeId: string): void {
    this.nodeSelect.emit(nodeId);
  }

  // Drag and drop methods for reordering nodes
  onNodeDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', this.selectedNodes[index]);
    }
    // Add a slight delay to prevent text selection conflicts
    event.stopPropagation();
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    this.draggedOverIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragLeave(event: DragEvent): void {
    this.draggedOverIndex = -1;
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();

    if (this.draggedIndex !== -1 && this.draggedIndex !== dropIndex) {
      this.reorderNodes.emit({
        fromIndex: this.draggedIndex,
        toIndex: dropIndex,
      });
    }

    this.draggedIndex = -1;
    this.draggedOverIndex = -1;
  }

  onNodeDragEnd(event: DragEvent): void {
    this.draggedIndex = -1;
    this.draggedOverIndex = -1;
  }

  // Helper methods for drag styling
  isDraggedItem(index: number): boolean {
    return this.draggedIndex === index;
  }

  isDropTarget(index: number): boolean {
    return this.draggedOverIndex === index && this.draggedIndex !== index;
  }

  // Smart apply button methods
  get applyButtonText(): string {
    if (!this.selectedLesson && this.hasUnsavedChanges) {
      return '✨ Create Lesson';
    }
    return '📌 Apply';
  }

  get applyButtonTitle(): string {
    if (!this.selectedLesson && this.hasUnsavedChanges) {
      return 'Create a new lesson with current selection';
    }
    if (this.selectionMatchesLesson) {
      return 'Selection matches lesson - no changes to apply';
    }
    return 'Apply current selection to selected lesson';
  }

  get shouldShowApplyButton(): boolean {
    return this.canApplyChanges;
  }

  get applyButtonDisabled(): boolean {
    return !this.canApplyChanges;
  }
}
