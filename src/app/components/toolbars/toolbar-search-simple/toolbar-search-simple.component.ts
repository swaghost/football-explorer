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
import { ToolbarPosition } from '../../../interfaces';

@Component({
  selector: 'app-toolbar-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-search-simple.component.html',
  styleUrls: ['./toolbar-search-simple.component.scss'],
})
export class ToolbarSearchComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() isDarkMode = false;
  @Input() position: ToolbarPosition | null = null;
  @Input() locked = false;
  @Input() expanded = true;
  @Input() treeData: any[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() toggleLock = new EventEmitter<void>();
  @Output() dragStart = new EventEmitter<MouseEvent>();
  @Output() toggleExpanded = new EventEmitter<void>();
  @Output() nodeSelected = new EventEmitter<any>();

  ngOnInit(): void {
    console.log('SEARCH COMPONENT INIT - visible:', this.visible);
  }

  ngOnChanges(changes: any): void {
    console.log('SEARCH COMPONENT CHANGES:', changes);
    if (changes.visible) {
      console.log('VISIBILITY CHANGED TO:', changes.visible.currentValue);
    }
  }

  get safePosition(): ToolbarPosition {
    return this.position || { x: 500, y: 300 };
  }

  onClose(): void {
    console.log('SEARCH CLOSE CLICKED');
    this.close.emit();
  }

  onToggleLock(): void {
    this.toggleLock.emit();
  }

  onDragStart(event: MouseEvent): void {
    this.dragStart.emit(event);
  }

  onToggleExpanded(): void {
    this.toggleExpanded.emit();
  }
}
