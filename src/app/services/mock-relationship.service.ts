import { Injectable } from '@angular/core';
import { Relationship } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class MockRelationshipService {
  // Relationship definitions for user relationships
  private relationships: Relationship[] = [
    { RelationshipID: 0, RelationshipName: 'Player' },
    { RelationshipID: 1, RelationshipName: 'Parent/Mother' },
    { RelationshipID: 2, RelationshipName: 'Parent/Father' },
    { RelationshipID: 3, RelationshipName: 'Sibling' },
    { RelationshipID: 4, RelationshipName: 'Grandparent' },
    { RelationshipID: 5, RelationshipName: 'Other Supporting Relative' },
    { RelationshipID: 6, RelationshipName: 'Other Supporting Non-Relative' },
    { RelationshipID: 99, RelationshipName: 'N/A' },
  ];

  /**
   * Get all available relationship types
   */
  getRelationships(): Relationship[] {
    return [...this.relationships];
  }
}
