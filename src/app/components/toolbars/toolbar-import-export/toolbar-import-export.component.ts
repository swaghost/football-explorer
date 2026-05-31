import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';
import { GlobalContextState } from '../../../state/user-context.state';

@Component({
  selector: 'app-toolbar-import-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-import-export.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-import-export.component.scss',
  ],
})
export class ToolbarImportExportComponent extends BaseToolbarComponent {
  // Required base component properties
  readonly toolbarId = 'import-export-toolbar';
  readonly toolbarTitle = 'Import/Export';
  readonly toolbarIcon = '📤📥';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Team selection state
  isTeamSelected = false;

  constructor(private store: Store, private cdr: ChangeDetectorRef) {
    super();

    // Subscribe to team selection changes
    this.store.select(GlobalContextState.contextTeamId).subscribe((teamId) => {
      this.isTeamSelected = teamId !== null;
      // Use setTimeout to defer change detection to avoid assertion error
      setTimeout(() => this.cdr.detectChanges(), 0);
    });
  }

  /**
   * Download a CSV template for roster import
   */
  onDownloadTemplate(): void {
    console.log('📥 Downloading roster template...');

    // Define CSV header
    const headers = [
      'Last Name',
      'First Name',
      'Email address',
      'Contact Phone',
      'Positions',
      'Jersey Number',
      'Gender',
      'Age Group',
    ];

    // Create CSV content
    const csvContent = headers.join(',') + '\n';

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    // Create download URL
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'ROSTER-TEMPLATE.csv');
    link.style.visibility = 'hidden';

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up URL
    URL.revokeObjectURL(url);

    console.log('✅ Template download initiated');
  }

  /**
   * Download a test CSV file with mock roster data
   */
  onDownloadTestFile(): void {
    console.log('📄 Downloading test roster file...');

    // Define CSV header
    const headers = [
      'Last Name',
      'First Name',
      'Email address',
      'Contact Phone',
      'Positions',
      'Jersey Number',
      'Gender',
      'Age Group',
    ];

    // Create mock data
    const mockData = [
      [
        'Smith',
        'John',
        'john.smith@email.com',
        '555-0101',
        'FW|MF',
        '10',
        'Male',
        'U16',
      ],
      [
        'Johnson',
        'Emily',
        'emily.j@email.com',
        '555-0102',
        'DF',
        '5',
        'Female',
        'U16',
      ],
      [
        'Brown',
        'Michael',
        'mike.brown@email.com',
        '',
        'GK',
        '1',
        'Male',
        'U16',
      ],
      [
        'Davis',
        'Sarah',
        'sarah.davis@email.com',
        '555-0104',
        'MF|FW',
        '8',
        'Female',
        'U16',
      ],
      [
        'Wilson',
        'David',
        'david.w@email.com',
        '555-0105',
        'DF|MF',
        '4',
        'Male',
        'U16',
      ],
    ];

    // Create CSV content
    const csvRows = [headers.join(',')];
    mockData.forEach((row) => {
      csvRows.push(row.join(','));
    });
    const csvContent = csvRows.join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    // Create download URL
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'ROSTER-TEST-DATA.csv');
    link.style.visibility = 'hidden';

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up URL
    URL.revokeObjectURL(url);

    console.log('✅ Test file download initiated');
  }

  /**
   * Trigger file input for roster import
   */
  onImportRoster(): void {
    if (!this.isTeamSelected) {
      console.warn('⚠️ No team selected for roster import');
      return;
    }

    console.log('📤 Opening file selection for roster import...');
    this.fileInput.nativeElement.click();
  }

  /**
   * Handle file selection for roster import
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    console.log('📄 Processing file:', file.name);

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file.');
      return;
    }

    // Read and validate file
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target?.result as string;
      this.validateAndProcessRoster(csvContent);
    };

    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };

    reader.readAsText(file);

    // Clear the input for future selections
    input.value = '';
  }

  /**
   * Validate and process roster CSV content
   */
  private validateAndProcessRoster(csvContent: string): void {
    console.log('🔍 Validating roster data...');

    try {
      // Parse CSV content
      const lines = csvContent.trim().split('\n');

      if (lines.length < 2) {
        alert('CSV file must contain a header row and at least one data row.');
        return;
      }

      // Validate headers
      const headers = lines[0].split(',').map((h) => h.trim());
      const requiredHeaders = ['Last Name', 'First Name', 'Email address'];
      const expectedHeaders = [
        'Last Name',
        'First Name',
        'Email address',
        'Contact Phone',
        'Positions',
        'Jersey Number',
        'Gender',
        'Age Group',
      ];

      // Check for required headers
      const missingRequired = requiredHeaders.filter(
        (req) => !headers.some((h) => h.toLowerCase() === req.toLowerCase())
      );

      if (missingRequired.length > 0) {
        alert(`Missing required headers: ${missingRequired.join(', ')}`);
        return;
      }

      // Validate data rows
      const validationErrors: string[] = [];
      const validatedPlayers: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());

        if (values.length !== headers.length) {
          validationErrors.push(`Row ${i + 1}: Column count mismatch`);
          continue;
        }

        const player: any = {};
        headers.forEach((header, index) => {
          player[header] = values[index];
        });

        // Validate required fields
        if (!player['Last Name']) {
          validationErrors.push(`Row ${i + 1}: Last Name is required`);
        }
        if (!player['First Name']) {
          validationErrors.push(`Row ${i + 1}: First Name is required`);
        }
        if (!player['Email address']) {
          validationErrors.push(`Row ${i + 1}: Email address is required`);
        } else if (!this.isValidEmail(player['Email address'])) {
          validationErrors.push(`Row ${i + 1}: Invalid email format`);
        }

        // Validate optional fields
        if (
          player['Jersey Number'] &&
          !this.isValidJerseyNumber(player['Jersey Number'])
        ) {
          validationErrors.push(`Row ${i + 1}: Invalid jersey number`);
        }

        if (validationErrors.length === 0) {
          validatedPlayers.push(player);
        }
      }

      // If any validation errors, don't process anything
      if (validationErrors.length > 0) {
        const errorMessage = `Validation failed. No data was imported.\n\nErrors:\n${validationErrors
          .slice(0, 10)
          .join('\n')}`;
        if (validationErrors.length > 10) {
          alert(
            errorMessage +
              `\n... and ${validationErrors.length - 10} more errors.`
          );
        } else {
          alert(errorMessage);
        }
        return;
      }

      // All validation passed - show success message
      console.log('✅ Validation successful. Players:', validatedPlayers);
      alert(
        `✅ Roster validation successful!\n\n${validatedPlayers.length} players ready for import.\n\n(Note: Actual import functionality will be implemented in future update.)`
      );
    } catch (error) {
      console.error('Error processing CSV:', error);
      alert(
        'Error processing CSV file. Please check the file format and try again.'
      );
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate jersey number (should be a positive integer)
   */
  private isValidJerseyNumber(jerseyNumber: string): boolean {
    if (!jerseyNumber) return true; // Optional field
    const num = parseInt(jerseyNumber);
    return !isNaN(num) && num > 0 && num.toString() === jerseyNumber.trim();
  }

  // Base component method implementations
  public override getToolbarClasses(): Record<string, boolean> {
    return {
      'draggable-toolbar': true,
      'import-export-panel': true,
      'dark-mode': this.isDarkMode,
      collapsed: !this.expanded,
    };
  }

  public override getHeaderClasses(): Record<string, boolean> {
    return {
      'panel-header': true,
      'drag-handle': true,
      locked: this.locked,
    };
  }

  public override getExpandButtonTitle(): string {
    return this.expanded ? 'Collapse panel' : 'Expand panel';
  }

  public override getLockButtonTitle(): string {
    return this.locked ? 'Unlock toolbar' : 'Lock toolbar';
  }
}
