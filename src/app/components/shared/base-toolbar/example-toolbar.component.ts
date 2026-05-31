import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseToolbarComponent } from './base-toolbar.component';

/**
 * Example Toolbar Component
 * Demonstrates how to use the BaseToolbarComponent
 */
@Component({
  selector: 'app-example-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './example-toolbar.component.html',
  styleUrls: ['./example-toolbar.component.scss'],
})
export class ExampleToolbarComponent extends BaseToolbarComponent {
  // Required base properties
  readonly toolbarId = 'example-toolbar';
  readonly toolbarTitle = 'Example Toolbar';
  readonly toolbarIcon = '🔧';

  // Example component-specific properties
  searchText = '';
  selectedOption = 'option1';
  isProcessing = false;

  // Example computed properties
  filteredItems = computed(() => {
    // Example filtering logic
    const items = ['Item 1', 'Item 2', 'Item 3'];
    return items.filter((item) =>
      item.toLowerCase().includes(this.searchText.toLowerCase())
    );
  });

  // Example methods
  onSearch() {
    console.log('Searching for:', this.searchText);
    // Add your search logic here
  }

  onOptionChange() {
    console.log('Selected option:', this.selectedOption);
    // Add your option change logic here
  }

  async onProcess() {
    this.isProcessing = true;
    try {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Processing completed');
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  onReset() {
    this.searchText = '';
    this.selectedOption = 'option1';
    console.log('Form reset');
  }

  // Override if you need custom initialization
  override ngOnInit() {
    super.ngOnInit();

    // Add component-specific initialization
    console.log(`${this.toolbarTitle} initialized`);

    // Example: Set initial state based on some condition
    if (localStorage.getItem('preferDarkMode') === 'true') {
      // Use the property from base class
      this.isDarkMode = true;
    }
  }

  // Override if you need cleanup
  override ngOnDestroy() {
    super.ngOnDestroy();
    console.log(`${this.toolbarTitle} destroyed`);
  }
}
