import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MockRosterService {
  // Gender-neutral first names
  private maleFirstNames = [
    'Alex',
    'Blake',
    'Connor',
    'Drew',
    'Ethan',
    'Felix',
    'Gabriel',
    'Hunter',
    'Ian',
    'Jack',
    'Kyle',
    'Liam',
    'Mason',
    'Noah',
    'Oliver',
    'Parker',
    'Quinn',
    'Ryan',
    'Samuel',
    'Tyler',
  ];

  private femaleFirstNames = [
    'Ashley',
    'Bailey',
    'Casey',
    'Dana',
    'Emma',
    'Finley',
    'Grace',
    'Harper',
    'Isabella',
    'Jordan',
    'Kai',
    'Luna',
    'Morgan',
    'Nova',
    'Ocean',
    'Phoenix',
    'Quinn',
    'River',
    'Sage',
    'Taylor',
  ];

  private lastNames = [
    'Johnson',
    'Williams',
    'Brown',
    'Davis',
    'Miller',
    'Wilson',
    'Moore',
    'Taylor',
    'Anderson',
    'Thomas',
    'Jackson',
    'White',
    'Harris',
    'Martin',
    'Garcia',
    'Rodriguez',
    'Lewis',
    'Lee',
    'Walker',
    'Hall',
    'Allen',
    'Young',
    'King',
    'Wright',
    'Lopez',
    'Hill',
    'Scott',
    'Green',
  ];

  /**
   * Get a random male first name
   */
  getRandomMaleFirstName(): string {
    return this.maleFirstNames[
      Math.floor(Math.random() * this.maleFirstNames.length)
    ];
  }

  /**
   * Get a random female first name
   */
  getRandomFemaleFirstName(): string {
    return this.femaleFirstNames[
      Math.floor(Math.random() * this.femaleFirstNames.length)
    ];
  }

  /**
   * Get a random first name based on gender
   */
  getRandomFirstName(genderID: number): string {
    return genderID === 1
      ? this.getRandomMaleFirstName()
      : this.getRandomFemaleFirstName();
  }

  /**
   * Get a random last name
   */
  getRandomLastName(): string {
    return this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
  }
}
