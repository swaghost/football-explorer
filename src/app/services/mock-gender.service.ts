import { Injectable } from '@angular/core';
import { Gender } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class MockGenderService {
  // Gender definitions
  private genders: Gender[] = [
    { GenderID: 1, GenderName: 'Male', GenderAbbrev: 'M' },
    { GenderID: 2, GenderName: 'Female', GenderAbbrev: 'F' },
    { GenderID: 0, GenderName: 'Unspecified', GenderAbbrev: 'N' },
    { GenderID: 3, GenderName: 'Other', GenderAbbrev: 'O' },
  ];

  /**
   * Get all available genders
   */
  getGenders(): Gender[] {
    return [...this.genders];
  }

  /**
   * Get a gender by ID
   */
  getGenderById(genderID: number): Gender | undefined {
    return this.genders.find((g) => g.GenderID === genderID);
  }
}
