import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  IOverlaySet,
  IOverlayItem,
  OVERLAY_ELEMENTS,
  OVERLAY_LOCATIONS,
} from '../../../interfaces/overlay/overlay.interface';
import { OverlayState } from '../../../state/overlay/overlay.state';
import { OverlayActions } from '../../../state/overlay/overlay.actions';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';

@Component({
  selector: 'app-toolbar-overlays',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-overlays.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-overlays.component.scss',
  ],
})
export class ToolbarOverlaysComponent
  extends BaseToolbarComponent
  implements OnInit, OnDestroy
{
  // Required base component properties
  readonly toolbarId = 'overlays-toolbar';
  readonly toolbarTitle = 'Overlays';
  readonly toolbarIcon = '🎭';

  overlaySets$!: Observable<IOverlaySet[]>;
  selectedSet$!: Observable<IOverlaySet | null>;
  selectedSetItems$!: Observable<IOverlayItem[]>;

  currentOverlaySets: IOverlaySet[] = [];
  selectedSet: IOverlaySet | null = null;
  selectedSetItems: IOverlayItem[] = [];

  overlayElements = OVERLAY_ELEMENTS;
  overlayLocations = OVERLAY_LOCATIONS;

  selectedElement: string = this.overlayElements[0];
  selectedLocation: string = this.overlayLocations[0];

  showCreateSetDialog = false;
  newSetName = '';

  isDarkMode = false;

  private destroy$ = new Subject<void>();

  toolbarHelp = `<strong>Overlays Help</strong><ul style="margin-top: 8px;"><li style="margin: 6px 0;"><strong>Create Set:</strong> Click <strong>+ New Set</strong> to create a new overlay set</li><li style="margin: 6px 0;"><strong>Select Set:</strong> Choose an overlay set from the dropdown to edit it</li><li style="margin: 6px 0;"><strong>Add Element:</strong> Select an element type and location, then click <strong>Add</strong></li><li style="margin: 6px 0;"><strong>Remove Element:</strong> Click the trash icon next to any element to remove it</li><li style="margin: 6px 0;"><strong>Clear Set:</strong> Remove all elements from the current set</li><li style="margin: 6px 0;"><strong>Apply Overlay:</strong> Apply the overlay set to the visualization (for printing/screenshots)</li></ul>`;

  constructor(private store: Store) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();

    // Setup observables
    this.overlaySets$ = this.store.select(OverlayState.getOverlaySets);
    this.selectedSet$ = this.store.select(OverlayState.getSelectedSet);
    this.selectedSetItems$ = this.store.select(
      OverlayState.getSelectedSetItems
    );

    // Subscribe to current values
    this.overlaySets$.pipe(takeUntil(this.destroy$)).subscribe((sets) => {
      this.currentOverlaySets = sets;
    });

    this.selectedSet$.pipe(takeUntil(this.destroy$)).subscribe((set) => {
      this.selectedSet = set;
    });

    this.selectedSetItems$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
      this.selectedSetItems = items;
    });

    // Subscribe to dark mode
    this.store
      .select((state: any) => state.sketch?.isDarkMode)
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDarkMode) => {
        this.isDarkMode = isDarkMode || false;
      });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCreateSet(): void {
    this.showCreateSetDialog = true;
    this.newSetName = '';
  }

  onCreateSetConfirm(): void {
    if (this.newSetName.trim()) {
      this.store.dispatch(
        new OverlayActions.CreateOverlaySet({ name: this.newSetName })
      );
      this.showCreateSetDialog = false;
      this.newSetName = '';
    }
  }

  onCreateSetCancel(): void {
    this.showCreateSetDialog = false;
    this.newSetName = '';
  }

  onSelectSet(setId: string): void {
    this.store.dispatch(new OverlayActions.SelectOverlaySet({ setId }));
  }

  onAddElement(): void {
    if (this.selectedSet) {
      this.store.dispatch(
        new OverlayActions.AddOverlayItem({
          setId: this.selectedSet.id,
          element: this.selectedElement,
          location: this.selectedLocation,
        })
      );
    }
  }

  onRemoveElement(itemId: string): void {
    if (this.selectedSet) {
      this.store.dispatch(
        new OverlayActions.RemoveOverlayItem({
          setId: this.selectedSet.id,
          itemId,
        })
      );
    }
  }

  onClearOverlay(): void {
    if (this.selectedSet) {
      this.store.dispatch(
        new OverlayActions.ClearOverlaySet({ setId: this.selectedSet.id })
      );
    }
  }

  onApplyOverlay(): void {
    // Placeholder for applying overlay to visualization
    console.log('Applying overlay:', this.selectedSet);
  }

  onDeleteSet(setId: string): void {
    if (
      confirm(
        'Are you sure you want to delete this overlay set? This action cannot be undone.'
      )
    ) {
      this.store.dispatch(new OverlayActions.DeleteOverlaySet({ setId }));
    }
  }

  isElementDisabled(element: string): boolean {
    const disabledElements = [
      'Title (dataset default)',
      'Title (entered)',
      'Keys',
    ];
    return disabledElements.includes(element);
  }
}
