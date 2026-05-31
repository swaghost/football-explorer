import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSlidingDrawer } from '../../shared/base-sliding-drawer/base-sliding-drawer';
import { DrawerToDoListComponent } from '../drawer-to-do-list/drawer-to-do-list.component';
import { ToDoEditDialogComponent } from '../../dialogs/dialog-to-do-edit/dialog-to-do-edit.component';
import { IToDoEntry } from '../../../interfaces/to-do/to-do.interface';

@Component({
  selector: 'app-drawer-to-do',
  standalone: true,
  imports: [
    CommonModule,
    BaseSlidingDrawer,
    DrawerToDoListComponent,
    ToDoEditDialogComponent,
  ],
  templateUrl: './drawer-to-do.html',
  styleUrl: './drawer-to-do.scss',
})
export class DrawerToDo {
  @Input() isOpen = false;
  @Input() teams: any[] = []; // Available teams from context
  @Input() selectedTeam: any = null; // Currently selected team
  @Input() teamGroups: any[] = []; // Team groups (Starters, Substitutes, etc)
  @Output() close = new EventEmitter<void>();

  @ViewChild(DrawerToDoListComponent) toDoListDrawer?: DrawerToDoListComponent;

  showEditDialog = false;
  editingEntry: IToDoEntry | null = null;
  editDialogData: any = null;

  onClose(): void {
    this.close.emit();
  }

  onEditDialog(data: any): void {
    console.log('📝 onEditDialog called with data:', data);
    console.log('📝 Entry data:', data.entry);
    this.editingEntry = data.entry;
    // Merge the incoming data with teams/groups from context
    this.editDialogData = {
      ...data,
      teams: this.teams || [],
      selectedTeam: this.selectedTeam,
      teamGroups: this.teamGroups || [],
    };
    console.log(
      '🎯 Opening edit dialog for entry:',
      this.editingEntry?.toDoID,
      this.editingEntry?.title
    );
    this.showEditDialog = true;
  }

  closeEditDialog(): void {
    this.showEditDialog = false;
    this.editingEntry = null;
  }

  saveEntry(entry: IToDoEntry): void {
    // Call the child component's saveEntry method to persist the data
    if (this.toDoListDrawer) {
      this.toDoListDrawer.saveEntry(entry);
    }
    this.closeEditDialog();
  }

  exportToJSON(): void {
    if (this.toDoListDrawer) {
      this.toDoListDrawer.exportToJSON();
    }
  }

  onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const content = e.target?.result as string;
          const importedEntries = JSON.parse(content);
          if (this.toDoListDrawer && Array.isArray(importedEntries)) {
            this.toDoListDrawer.importJSON(importedEntries);
          }
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          alert('Error importing file. Please ensure it is a valid JSON file.');
        }
      };
      reader.readAsText(file);
      // Reset file input
      input.value = '';
    }
  }

  addNewEntry(): void {
    if (this.toDoListDrawer) {
      this.toDoListDrawer.addNewEntry();
    }
  }
}
