import { Injectable } from '@angular/core';
import { AgeGroup } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class MockAgeGroupService {
  // Age group definitions
  private ageGroups: AgeGroup[] = [
    { AgeGroupID: 0, AgeGroupName: 'U7' },
    { AgeGroupID: 1, AgeGroupName: 'U8' },
    { AgeGroupID: 2, AgeGroupName: 'U9' },
    { AgeGroupID: 3, AgeGroupName: 'U10' },
    { AgeGroupID: 4, AgeGroupName: 'U11' },
    { AgeGroupID: 5, AgeGroupName: 'U12' },
    { AgeGroupID: 6, AgeGroupName: 'U13' },
    { AgeGroupID: 7, AgeGroupName: 'U14' },
    { AgeGroupID: 8, AgeGroupName: 'U15' },
    { AgeGroupID: 9, AgeGroupName: 'U16' },
    { AgeGroupID: 10, AgeGroupName: 'U17' },
    { AgeGroupID: 11, AgeGroupName: 'U18' },
    { AgeGroupID: 12, AgeGroupName: 'Highschool' },
    { AgeGroupID: 13, AgeGroupName: 'Adult/College' },
    { AgeGroupID: 14, AgeGroupName: 'Adult' },
    { AgeGroupID: 15, AgeGroupName: 'Adult/Majors' },
    { AgeGroupID: 16, AgeGroupName: 'Adult/Professional' },
    { AgeGroupID: 17, AgeGroupName: 'Over-30' },
    { AgeGroupID: 18, AgeGroupName: 'Over-40' },
  ];

  /**
   * Get all available age groups
   */
  getAgeGroups(): AgeGroup[] {
    return [...this.ageGroups];
  }

  /**
   * Get an age group by ID
   */
  getAgeGroupById(ageGroupID: number): AgeGroup | undefined {
    return this.ageGroups.find((ag) => ag.AgeGroupID === ageGroupID);
  }
}
